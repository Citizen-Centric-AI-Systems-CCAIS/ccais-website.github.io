---
title: "Citizen-Centric AI for Resilient IoT Systems (CAIR)"
date: 2025-08-28
image: "/wp-content/uploads/2025/08/Screenshot-2025-09-01-at-17.40.36.png"
author: zhaoxing-li
members:
  - zhaoxing-li
  - sebastian-stein
  - vahid-yazdanpanah
  - jan-buermann
  - sarah-kiden
  - bruno-arcanjo
  - ezhilarasi-periyathambi
---

\*\*CAIR\*\* is a local, preference-aware smart-home assistant that turns everyday, loosely structured requests—such as “make the room comfortable” or “I want to relax”—into reliable actions. It addresses three persistent gaps in current assistants: difficulty interpreting vague or missing context, weak long-term adaptation to user preferences, and reliance on cloud services that can compromise privacy and destabilise integrations (e.g., brittle JSON outputs that break device control).

Our approach combines a lightweight, fine-tuned LLM with a preference-aware learning loop, and it runs entirely on-device. The model is optimised to generate stable, structured JSON commands that map deterministically to home-automation actions, eliminating fragile parsing steps. A built-in preference mechanism continuously adapts to each user’s corrections, so the system becomes more accurate and personal over time while keeping data private and under the user’s control.

The interaction flow is simple and robust. Active listening begins with a wake word (e.g., “Blueberry”), which triggers command capture. The system first checks a local preference store for existing routines and known settings; when no direct match is found, the LLM infers the user’s intent and parameters and composes a structured action plan. An executor translates the JSON into device-level commands. If the user says, “No, warmer,” the system immediately reverts or adjusts the action and records the correction. In the background, a tiny model parses these corrections to extract new keywords and preferences, enriching the user profile without leaving the device.

By design, CAIR is private, trustworthy, and resilient. Running fully locally reduces latency and removes cloud dependencies, stable JSON outputs prevent integration breakage, and the preference-aware loop ensures the assistant continually learns “your way” of living—making smart-home control both more intuitive and more dependable.

![](/wp-content/uploads/2025/08/Architecture_Diagram-1024x674.png)
