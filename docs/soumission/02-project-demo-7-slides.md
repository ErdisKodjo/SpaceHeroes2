# Project Demo — 7 slides

Paste these as the slide deck. One idea per slide. Speak in English. Suggested timing: about 45 seconds each, under 6 minutes.

## 1. The trade nobody sees

**On screen:** the title Space Heroes, NASA Space Apps Challenge 2026, and one sentence: "Design the mission before you fly it."

A science mission fails in the spreadsheet long before it fails on the pad. Budget, mass, power, data, the link, and the calendar all move together. We built a game that makes that trade the gameplay.

## 2. One seat, one mission

**On screen:** the four seats — Mission Director, Vehicle Engineer, Systems Engineer, Science Lead.

You pick a seat. Alone, ASTRA covers the other three. At a table of four, each person holds one seat and the server holds the gauges. The mission still has to pass the same gate: 80 percent of the Concept Maturity Level checks in the green.

## 3. Build it, then prove it

**On screen:** the workshop with the six gauges, then the three tests.

Five families: propulsion, structure, power, communications, instrument. Twelve points shape the part you picked. Then three tests: vibration, thermal isolation, electrical compatibility. If the gate is red, ASTRA says so and you can return to the workshop. The cost is replaced, not charged twice.

## 4. The orbit is a GMAT run

**On screen:** the Moon chapter legend — injection 3.12 km/s, perilune 50 km, capture 0.87 km/s — and the Earth with the transfer ellipse.

We did not invent the trajectories. GMAT R2026a propagated them. The Moon leaves on 1 January 2026 and is captured. Mars leaves in early December 2026 and orbits in 113.3 minutes. The polar orbit lasts 94.5 minutes. High orbit and geostationary orbit both last 1,436 minutes. L1 is 1.5 million km away, with a 173-day halo. The four corrections a year at L1 are labeled as an operational hypothesis, not a GMAT measurement.

## 5. After the pass

**On screen:** the debrief, a real-mission card (GeneSat-1 or LRO), and the optional orrery.

The score is out of 100. The debrief names a real NASA mission and, where it belongs, a public tool: the Debris Assessment Software beside the 200 km end-of-life stop, the Trajectory Browser beside Mars and beside the GMAT lunar figures. The hub still opens on the simple solar-system line. A button reveals an orrery driven by the published JPL Keplerian elements for 1800–2050.

## 6. What we are not claiming

**On screen:** three short lines.

The game stores GMAT results. The browser never calls GMAT. Naming a tool does not mean a real mission was designed with it. The orrery uses the JPL rotation, not a tutorial that treats inclination as pitch. Distances on the drawing are compressed so the Moon and L1 stay visible.

## 7. Play it

**On screen:** `https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4` and the three commands `npm install`, `npm run dev`, `npm test`.

Open the repository, branch `dev4`. The game runs in the browser in French or English. Forty-five automated tests cover the gates, the drag table, the orrery, and the named tools. The same link is the public project link.
