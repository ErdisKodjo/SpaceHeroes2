# Use of AI and NASA data

## NASA data, used for the numbers

The trajectories are outputs of NASA's General Mission Analysis Tool, release R2026a, run for this project on 15 November 2026. The browser displays those results. It does not launch GMAT.

- Low Earth orbit: an 84-day drag grid on four CubeSat faces. At 1.33 kg the 3U face reaches 200 km altitude on day 114.8.
- Moon: departure 1 January 2026 00:00, injection 3.12 km/s, perilune 50 km, capture burn 0.87 km/s. After 8.7 days the propagated altitude is 37 km.
- Mars: orbit period 113.3 minutes. The departure window falls in early December 2026. Opposition is 20 February 2027. At the far end of that cycle the radio round trip is 40 minutes.
- Polar orbit: 94.5 minutes. Svalbard sees about 15 passes a day.
- High orbit and geostationary orbit: both 1,436.0 minutes at 35,786 km. For the propagated departure, Canberra sees the geostationary satellite continuously and sees 790 minutes of the high orbit. The other stations in the game see none of that plan.
- Sun-Earth L1: distance 1.5 million km and a halo of 173 days come from the GMAT run. Four corrections a year are an operational hypothesis. They are not a result of the sample targeter.

The optional orrery uses the Keplerian elements published by JPL for 1800–2050 (Standish and Williams), referred to the mean ecliptic and equinox of J2000. The lunar clock uses Fred Espenak's published new moon of 8 January 2008.4849 and the sidereal month of 27.32166 days.

The debrief names public NASA tools without assigning a real mission to them. The Debris Assessment Software is named next to the 200 km end-of-life stop. The Trajectory Browser is named as the public catalogue of trajectories to planets and small bodies. PyCubed is named in the workshop as a public board that combines power, computing, communication, and attitude control. SPENVIS is named on the radiation shield as the model of that environment. None of those four tools produced the figures in the game.

Concept Maturity Levels follow the JPL practice described by Wessen, Borden, Ziemer, and Kwok (2013). The game uses a 20-line checklist and an 80 percent green gate.

## Artificial intelligence

The shipped game does not call a generative model. ASTRA, the guide, speaks lines written for each step, in French and in English, through the browser's speech synthesis.

An AI coding assistant in the editor was used to implement features, tests, and these submission texts. The orbital numbers were not asked of that assistant. They were copied from the GMAT reports and from the JPL and GSFC pages listed in the references.
