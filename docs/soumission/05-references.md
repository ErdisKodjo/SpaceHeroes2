# References

## NASA and partner data

- NASA General Mission Analysis Tool (GMAT). Public catalog entry GSC-17177-1: https://software.nasa.gov/software/GSC-17177-1 . This project propagated the trajectories with release R2026a on 15 November 2026 and stored the reports as JSON. The catalog page itself describes an earlier release.
- E. M. Standish and J. G. Williams, approximate planetary positions, JPL Solar System Dynamics. Keplerian elements for 1800–2050, mean ecliptic and equinox of J2000. https://ssd.jpl.nasa.gov/planets/approx_pos.html — Earth-Moon barycenter and Mars in the optional orrery.
- Fred Espenak, NASA GSFC, "Eclipses and the Moon's Orbit." Sidereal month 27.32166 days, mean eccentricity 0.0549, and the new moon of 8 January 2008.4849 Dynamical Time. https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html — lunar angle in the orrery.
- NASA Orbital Debris Program Office, Debris Assessment Software. https://orbitaldebris.jsc.nasa.gov/mitigation/das.html — named in the low-Earth debrief and workshop. Not the source of the 200 km figure.
- NASA Ames Trajectory Browser. https://trajbrowser.arc.nasa.gov/ — named as the public catalogue for planets and small bodies. The lunar capture figures stay from GMAT.
- NASA SmallSat Institute, Space Mission Design Tools, including PyCubed and SPENVIS. https://www.nasa.gov/smallsat-institute/space-mission-design-tools/ — named in the workshop and on the radiation shield. Not used to generate mission numbers.
- SPENVIS, ESA/BIRA-IASB, space environment information system. https://www.spenvis.oma.be/
- PyCubed, public CubeSat avionics board. https://pycubed.org/
- R. R. Wessen, C. Borden, J. Ziemer, and J. Kwok, "Space Mission Concept Development Using Concept Maturity Levels," Jet Propulsion Laboratory, 2013, paper 13-3547. Basis of the in-game CML gate.
- Cal Poly CubeSat Design Specification. Face sizes used for the drag areas: 100 × 100 mm, 100 × 170.2 mm, 100 × 227.0 mm, 100 × 340.5 mm.
- Real-mission cards in the debrief, public mission facts only: GeneSat-1, PhoneSat, Nodes, Terra, Lunar Reconnaissance Orbiter, GRAIL, LADEE, Mars Reconnaissance Orbiter, Mars Odyssey, MAVEN, and the missions listed for L1, polar, high, and geostationary profiles in `src/data/missions_reelles.json`.

## Open-source software

- Three.js 0.160, MIT. https://threejs.org/ — Earth, spacecraft, and trajectory view.
- Vite 5, MIT. https://vitejs.dev/
- Vitest 2, MIT. https://vitest.dev/ — 45 tests.
- jsPDF 4, MIT. https://github.com/parallax/jsPDF — debrief export.
- ws 8, MIT. https://github.com/websockets/ws — party-of-four server.
- Node.js. https://nodejs.org/

## Project

- Space Heroes, branch `dev4`. https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4
- Player guide: `docs/guide_user.md`. State of the build: `docs/Planning/Plan4.md`.
