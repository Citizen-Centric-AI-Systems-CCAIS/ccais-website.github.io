#!/usr/bin/env python3
"""Regenerate src/data/pubs.json from the University of Southampton Pure API.

The website renders the publications list from src/data/pubs.json at build
time, so this script is the only step that needs access to the Pure API
(api-pure.soton.ac.uk — university network / VPN required). Run it whenever
the publication list should be refreshed, commit the updated pubs.json, and
rebuild the site (CI can build without any VPN access):

    python3 scripts/update-publications.py            # writes src/data/pubs.json
    python3 scripts/update-publications.py -o out.json --verbose

Requires: pip install requests
"""
from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any, Optional

import requests

PROJECT_ID = "520617"
BASE_URL = "https://api-pure.soton.ac.uk"
EPRINTS_BY_UUID = "https://eprints.soton.ac.uk/cgi/eprintbypureuuid?uuid="
DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "src" / "data" / "pubs.json"
TIMEOUT = 30
WORKERS = 8

# RIS fields that may hold the venue, in order of preference:
# T2 = secondary title (journal/proceedings), JO = journal name, BT = book
# title, JF = journal full name, T3 = series title, PB = publisher
VENUE_PATTERNS = [rf"{tag}\s\s-\s(.*?)\r?\n" for tag in ("T2", "JO", "BT", "JF", "T3", "PB")]
DOI_RE = re.compile(r"https?://doi\.org/(.+)")

log = logging.getLogger("update-publications")


def rest_get(session: requests.Session, path: str) -> Optional[dict[str, Any]]:
    url = f"{BASE_URL}/{path}"
    try:
        response = session.get(url, headers={"accept": "application/json"}, timeout=TIMEOUT)
    except requests.exceptions.RequestException as exc:
        log.error("Request failed: %s (%s) — is the Pure API reachable? VPN connected?", url, exc)
        return None
    if response.status_code != 200:
        log.error("GET %s returned HTTP %s", url, response.status_code)
        return None
    return response.json()


def get_publication_ids(session: requests.Session) -> Optional[list[str]]:
    project = rest_get(session, f"project/{PROJECT_ID}")
    if project is None:
        return None
    return [output["pureId"] for output in project.get("outputs", [])]


def extract_venue(ris: str, pure_id: str) -> str:
    for pattern in VENUE_PATTERNS:
        match = re.search(pattern, ris or "")
        if match:
            return match.group(1).strip()
    log.warning("Unknown venue for Pure ID %s", pure_id)
    return "Unknown"


def format_person(p: dict[str, str]) -> Optional[str]:
    """Format one contributor. Individuals have firstname/lastname; corporate or
    group authors may only have a single name field."""
    last, first = p.get("lastname"), p.get("firstname")
    if last and first:
        return f"{last}, {first}"
    name = last or first or p.get("name") or p.get("fullname")
    if name:
        return name
    log.warning("Skipping contributor with no usable name: %r", p)
    return None


def format_authors(persons: list[dict[str, str]]) -> list[str]:
    names = (format_person(p) for p in persons if p.get("role") in ("Author", "Editor"))
    return [n for n in names if n]


def build_record(session: requests.Session, pure_id: str) -> Optional[dict[str, Any]]:
    """Fetch one publication's details and shape them for pubs.json."""
    result = rest_get(session, f"./outputs?limit=1&offset=0&guids={pure_id}")
    if result is None or result.get("count") != 1:
        log.error("Could not retrieve details for Pure ID %s", pure_id)
        return None
    details = result["publications"][0]

    authors = format_authors(details.get("persons", []))
    record: dict[str, Any] = {
        "Authors": authors,
        "Title": details.get("title", ""),
        "Year": details.get("year"),
        "Venue": extract_venue(details.get("ris", ""), pure_id),
        "URL": EPRINTS_BY_UUID + pure_id,
    }

    doi = details.get("doi")
    if doi:
        match = DOI_RE.search(doi)
        if match:
            record["DOI"] = match.group(1)
            record["DOI_URL"] = doi
        else:
            log.warning("Unparseable DOI %r for Pure ID %s", doi, pure_id)

    if details.get("abstract"):
        record["Abstract"] = details["abstract"]

    if not record["Title"] or not authors:
        log.warning("Missing title/authors for Pure ID %s", pure_id)
    return record


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("-o", "--output", type=Path, default=DEFAULT_OUTPUT,
                        help=f"output file (default: {DEFAULT_OUTPUT})")
    parser.add_argument("--verbose", action="store_true", help="debug logging")
    args = parser.parse_args()
    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                        format="%(levelname)s %(message)s")

    session = requests.Session()
    log.info("Fetching publication list for project %s ...", PROJECT_ID)
    pure_ids = get_publication_ids(session)
    if pure_ids is None:
        log.error("No publication list retrieved. Update aborted.")
        return 1
    log.info("Found %d publications; fetching details ...", len(pure_ids))

    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        records = list(pool.map(lambda pid: build_record(session, pid), pure_ids))

    if None in records:
        log.error("Failed to retrieve details for %d publication(s). Update aborted; %s not modified.",
                  records.count(None), args.output)
        return 1

    # Newest year first, then alphabetical by first author
    records.sort(key=lambda r: (-int(r["Year"] or 0), (r["Authors"][0] if r["Authors"] else "").lower()))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=1, ensure_ascii=False)
        f.write("\n")
    log.info("Wrote %d publications to %s", len(records), args.output)
    log.info("Commit the file and rebuild the site to publish the update.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
