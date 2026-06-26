---
title: "Generative Occupants: LLM Agents for Building Energy Simulation"
date: 2026-06-22
image: "/images/projects/generative-occupants-llm-agents-for-building-simulation.jpg"
imageCredit: "Photo by Fabian Kleiser on Unsplash"
imageCreditUrl: "https://unsplash.com/@fabiankleiser"
author: luke-nicholas
members:
  - luke-nicholas
  - sebastian-stein
  - enrico-gerding
---
<!-- Header image source: https://unsplash.com/photos/glass-facade-of-a-modern-office-building-V5vF94h52r0 (Unsplash License) -->

How much energy a building uses depends enormously on the people inside it — when they arrive, whether they open a window, nudge the thermostat up, or switch on a heater at their desk. This human behaviour is one of the biggest reasons a building's real energy use can differ from what its designers predicted, yet most building simulations still represent occupants with fixed schedules or simple rules that miss how people actually behave.

This project explores a richer alternative we call *generative occupants*. It couples a physics-based building-energy simulation — built from scratch and checked against the ASHRAE 140-2023 thermal-performance standard — with occupant "agents" powered by large language models. Each agent is given a persona, memories and a daily plan; it perceives the simulated environment and decides how to act, from adjusting temperature set points and opening windows to negotiating with colleagues over shared spaces in plain language. In an exploratory study of a single-zone office, these LLM-driven occupants produced markedly different energy-use patterns from fixed-schedule and rule-based models, showing that language-driven agents can be coupled into the simulation loop and shape simulated energy demand. The longer-term aim is to turn this into a platform that can give better, simulation-backed advice on how to cut building energy use — and ultimately agents that learn an individual's preferences and represent them when building-wide decisions are made.

This work was presented as a short paper at ACM Sustainability Week 2026.
