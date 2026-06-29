---
title: "Building Physics for Low-Carbon Comfort using Artificial Intelligence"
date: 2026-06-25
image: "/images/projects/building-physics-for-low-carbon-comfort.jpg"
imageCredit: "Photo by Nha Chill on Unsplash"
imageCreditUrl: "https://unsplash.com/@nhachill"
author: connor-watson
members:
  - connor-watson
  - sebastian-stein
  - stephanie-gauthier
  - { name: "Professor Christina Vanderwel", url: "https://www.southampton.ac.uk/people/5xcpfb/professor-christina-vanderwel" }
---
<!-- Header image source: https://unsplash.com/photos/a-bright-and-airy-living-room-with-modern-decor-ZuHIek5xn_I (Unsplash License) -->

For roughly a third of the workday, a portion of the professional UK workforce spends their time in an office space. In a changing climate we must prioritise comfort, health, and energy usage in these spaces. To model how the building will function, the industry standard is traditional whole-building energy simulation programs, such as EnergyPlus. However, in high-precision applications such as sensor-based climate control systems, academic literature is exploring the applications of artificial intelligence (AI) in indoor air quality and occupant comfort modelling. But against real data, how well do typically used AI simulations perform against more established building analysis tools? Could AI add value to these traditionally used tools, or could AI even replace them for select tasks? This work aims to answer just that, taking thermal comfort and air quality measurements of three typical cases, and creating an industry standard whole building analysis model and an AI model to compare against each-other using real measured data.

The cases used were one of a 1960s fully naturally ventilated building, one of a 2000s mechanical ventilation only building, and another of a 2010s both natural and mechanical ventilation building. Using data from all three cases, a physics-informed machine learning (PIML) model was trained to model indoor carbon dioxide, fine particulate matter, and temperature in each case. For temperature these results were compared to an EnergyPlus model, and for indoor air quality the PIML was compared to a CONTAM model.

Preliminary results of this study have been released in a short paper for OccuSys, a workshop of ACM Sustainability Week 2026 (https://doi.org/10.1145/3765611.3813755). This paper describes results for temperature in the naturally ventilated case. Comparatively to traditional methods, the PIML model performed better. Over the four days, the PIML model had a mean absolute error of 0.6° C versus the real data, whereas EnergyPlus was 1.4° C. This result may support the shift in modelling tools, as physics-informed machine learning may support more efficient, scalable, and responsive approaches to indoor environmental control and building performance assessment.