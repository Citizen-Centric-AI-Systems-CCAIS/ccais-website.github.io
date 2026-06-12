// Single source of truth for the CCAIS team. The team page and the
// /author/<slug>/ person pages are generated from this list.
// Biographies/emails/websites scraped from the old site live in
// team-bios.json (run: node scripts/fetch-team-bios.mjs).

export interface Member {
  slug: string;
  name: string;
  role: string;
  group: string;
  photo: string;
  website?: string;
}

const img = (f: string) => `/images/team/${f}`;

export const groups = [
  { heading: 'Researchers', variant: 'primary' },
  { heading: 'PhD Students', variant: 'secondary' },
  { heading: 'Research Engineers / Assistants', variant: 'tertiary' },
  { heading: 'Alumni', variant: 'black' }
] as const;

export const team: Member[] = [
  // Researchers
  { slug: 'sebastian-stein', name: 'Professor Sebastian Stein', role: 'Principal Investigator - Citizen-Centric AI Systems', group: 'Researchers', photo: img('ag-seb-stein-01-med.jpg'), website: 'http://southampton.ac.uk/people/5x5r59/professor-sebastian-stein' },
  { slug: 'enrico-gerding', name: 'Professor Enrico Gerding', role: 'Academic Collaborator - Mechanism Design, Privacy', group: 'Researchers', photo: img('enrico-gerding-sq.jpg'), website: 'https://www.southampton.ac.uk/people/5x2dnl/professor-enrico-gerding' },
  { slug: 'jennifer-williams', name: 'Dr Jennifer Williams', role: 'Academic Collaborator – Audio AI and Applications', group: 'Researchers', photo: img('jennifer_new.jpg') },
  { slug: 'vahid-yazdanpanah', name: 'Dr Vahid Yazdanpanah', role: 'Academic Collaborator - Responsibility, Ridesharing', group: 'Researchers', photo: img('vahid-yazdanpanah-sq.jpg') },
  { slug: 'jan-buermann', name: 'Dr Jan Buermann', role: 'Postdoctoral Researcher – Incentives, Fair Allocation', group: 'Researchers', photo: img('jan-buermann-sq.jpg') },
  { slug: 'sarah-kiden', name: 'Dr Sarah Kiden', role: 'Postdoctoral Researcher – Trustworthy AI Systems', group: 'Researchers', photo: img('sarah.jpg') },
  { slug: 'zhaoxing-li', name: 'Dr Zhaoxing Li', role: 'Postdoctoral Researcher – Explainability, Human-AI Interaction', group: 'Researchers', photo: img('zhaoxing.jpg') },
  { slug: 'jayati-deshmukh', name: 'Dr Jayati Deshmukh', role: 'Postdoctoral Researcher - Responsible AI', group: 'Researchers', photo: img('jayati.jpg') },
  { slug: 'wen-gu', name: 'Dr Wen Gu', role: 'Visiting Researcher - Agent-based systems', group: 'Researchers', photo: img('wengu-e1724773300673.png') },
  { slug: 'bruno-arcanjo', name: 'Dr Bruno Arcanjo', role: 'Postdoctoral Researcher', group: 'Researchers', photo: img('bruno.jpg') },
  { slug: 'ezhilarasi-periyathambi', name: 'Dr Ezhilarasi Periyathambi', role: 'Postdoctoral Researcher', group: 'Researchers', photo: img('ezhilarasi.jpeg') },
  // PhD Students
  { slug: 'behrad-koohy', name: 'Behrad Koohy', role: 'Smart Routing for Connected / Autonomous Vehicles', group: 'PhD Students', photo: img('behrad-koohy.jpg') },
  { slug: 'connor-watson', name: 'Connor Watson', role: 'Building Air Quality and Comfort Modelling', group: 'PhD Students', photo: img('connor-watson.jpg') },
  { slug: 'fariba-dehghan', name: 'Fariba Dehghan', role: 'EV Charging Optimization', group: 'PhD Students', photo: img('fariba.jpg') },
  { slug: 'yixuan-li', name: 'Yixuan Li', role: 'Algorithmic Game Theory for Electric Vehicle Charging', group: 'PhD Students', photo: img('yixuan-sq.jpg') },
  { slug: 'jim-dilkes', name: 'Jim Dilkes', role: 'Trustworthy Human-AI Collaboration', group: 'PhD Students', photo: img('jim.png') },
  { slug: 'luke-nicholas', name: 'Luke Nicholas', role: 'AI for Sustainable Energy and Buildings', group: 'PhD Students', photo: img('luke.jpg') },
  { slug: 'beining-zhang', name: 'Beining Zhang', role: 'AI for Facilitating Human Cooperation', group: 'PhD Students', photo: img('beining-zhang-scaled.jpg') },
  { slug: 'andrew-poile', name: 'Andrew Poile', role: 'School Matching Mechanisms', group: 'PhD Students', photo: img('andrew.png') },
  // Research Engineers / Assistants
  { slug: 'alexandry-augustin', name: 'Alexandry Augustin', role: 'Smart Routing for Electric Vehicles', group: 'Research Engineers / Assistants', photo: img('alexandry-augustin-sq.jpg') },
  { slug: 'zijie-liang', name: 'Zijie Liang', role: 'Game Designer for Serious Games', group: 'Research Engineers / Assistants', photo: img('zijie.jpg') },
  { slug: 'ariq-adi-azuan', name: 'Ariq Adi Azuan', role: 'Research Assistant', group: 'Research Engineers / Assistants', photo: img('ariq.jpg') },
  { slug: 'lim-eu-jin', name: 'Lim Eu Jin', role: 'Large Language Models for Smart Home', group: 'Research Engineers / Assistants', photo: img('eu-jin.jpg') },
  { slug: 'prokopis-georgiou', name: 'Prokopis Georgiou', role: 'EV ecosystem', group: 'Research Engineers / Assistants', photo: img('prokopis.jpg') },
  { slug: 'adrian-low', name: 'Adrian Low', role: 'Trustworthy AI agents', group: 'Research Engineers / Assistants', photo: img('adrian.jpg') },
  // Alumni
  { slug: 'alexander-masterman', name: 'Alexander Masterman', role: 'Accessibility in Smart Transportation', group: 'Alumni', photo: img('ag-alex-masterman-02_jpg.jpg') },
  { slug: 'benjamin-lellouch', name: 'Benjamin Lellouch', role: 'Reinforcement Learning for Smart Energy Management. JPMorgan Chase & Co', group: 'Alumni', photo: img('benjamin-lellouch.jpg'), website: 'https://www.linkedin.com/in/benjamin-lellouch/' },
  { slug: 'elnaz-shafipour', name: 'Dr Elnaz Shafipour', role: 'EV Routing. CEO, EVtonomy', group: 'Alumni', photo: img('ag-elnaz-shafipour-02-squ.jpg') },
  { slug: 'farida-yusuf', name: 'Farida Yusuf', role: 'Equitable Ridesharing Simulator. PhD Student, Queen Mary University of London', group: 'Alumni', photo: img('farida-yusuf.jpg'), website: 'https://www.linkedin.com/in/frdysf/' },
  { slug: 'gongwei-shi', name: 'Gongwei (Alvin) Shi', role: 'Human-Agent Interaction for Smart Energy Management', group: 'Alumni', photo: img('gongwei-alvin-shi-sq.jpg') },
  { slug: 'greg-sewell', name: 'Greg Sewell', role: "Inter-generational Influences on Households' Heating Control", group: 'Alumni', photo: img('greg-sewell-sq.jpg') },
  { slug: 'hannah-phillips', name: 'Hannah Phillips', role: 'ENGAGE Intern Voice Modification', group: 'Alumni', photo: img('hannah-phillips-sq.jpg') },
  { slug: 'harris-hadjiantonis', name: 'Harris Hadjiantonis', role: 'Trustworthy Recommender Systems. MSc Student, University of Edinburgh', group: 'Alumni', photo: img('harris-hadjiantonis.jpg'), website: 'https://www.linkedin.com/in/harris-hadjiantonis/' },
  { slug: 'jack-dymond', name: 'Jack Dymond', role: 'Progressive Intelligence', group: 'Alumni', photo: img('jack-dymond-sq.jpg') },
  { slug: 'james-king', name: 'James King', role: 'Human-Agent Interaction. JPMorgan Chase & Co', group: 'Alumni', photo: img('james-king.jpg'), website: 'https://www.linkedin.com/in/james-phillips-king/' },
  { slug: 'jovan-karlius', name: 'Jovan Karlius', role: 'Smart Routing for Electric Vehicles. Former Research Engineer / Assistant', group: 'Alumni', photo: img('jovan-karlius-sq.jpg') },
  { slug: 'lewis-hill', name: 'Lewis Hill', role: 'Smart Routing for Electric Vehicles. Freelance Software Engineer', group: 'Alumni', photo: img('lewis-hill-sq.jpg'), website: 'https://www.linkedin.com/in/lewis-hill-5b8163b3/' },
  { slug: 'lila-marshman', name: 'Lila Marshman', role: 'Smart Building Energy (EPSRC Vacation Intern). Undergraduate Student, University of Edinburgh', group: 'Alumni', photo: img('lila-marshman.jpg'), website: 'https://www.linkedin.com/in/lila-m-644145268/' },
  { slug: 'lucia-cipolina-kun', name: 'Lucia Cipolina Kun', role: 'Coalition Formation for Equitable Ridesharing. PhD Student, University of Bristol', group: 'Alumni', photo: img('lucia-cipolina-kun-sq.jpg'), website: 'https://www.linkedin.com/in/luciacipolina/' },
  { slug: 'mark-saunders', name: 'Mark Saunders', role: 'Augmented Reality Soundscapes', group: 'Alumni', photo: img('mark-saunders-sq.jpg') },
  { slug: 'matt-ivey', name: 'Matt Ivey', role: 'Incentive Compatible Ridesharing. Former Research Engineer / Assistant', group: 'Alumni', photo: img('matt-ivery.png'), website: 'https://www.linkedin.com/in/matt-ivey-19b3ab219/' },
  { slug: 'mengya-liu', name: 'Dr Mengya Liu', role: 'Multi-objective Optimisation for Equitable Ridesharing. Lenovo Research', group: 'Alumni', photo: img('mengya-liu.jpg'), website: 'https://www.linkedin.com/in/mengya-liu-a68627139/' },
  { slug: 'nicos-protopapas', name: 'Nicos Protopapas', role: 'Social Choice for Equitable Ridesharing', group: 'Alumni', photo: img('nicos-protopapas.jpg') },
  { slug: 'sukankana-chakraborty', name: 'Dr Sukankana Chakraborty', role: 'Influence Maximisation. The Alan Turing Institute', group: 'Alumni', photo: img('sukankana-chakraborty-sq.jpg'), website: 'https://www.turing.ac.uk/people/researchers/sukankana-chakraborty' }
];
