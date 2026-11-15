# References

## Instruction

La liste doit permettre à un juge de retrouver chaque source. Copiez la liste sous **Texte à coller**, liens compris.

1. Ne copiez pas l'instruction.
2. Gardez la phrase « not the source of the figures » sur DAS, le Trajectory Browser, PyCubed et SPENVIS. Elle évite une lecture fausse.
3. Si le champ n'accepte pas les adresses longues, gardez au minimum GMAT, la page JPL, Espenak, et le dépôt du projet.
4. N'ajoutez pas un outil qui n'est pas dans le jeu. OpenFrames, X3DOM et le tutoriel R du planétaire ne sont pas des sources : le jeu ne s'en sert pas.
5. Le catalogue NASA GSC-17177-1 décrit une version plus ancienne que R2026a. La phrase du premier item le dit déjà. Ne la simplifiez pas en « we used the catalog version ».

## Texte à coller

NASA and partner data

- NASA General Mission Analysis Tool (GMAT). Catalog entry GSC-17177-1: https://software.nasa.gov/software/GSC-17177-1 . That page describes an earlier release. This project propagated the trajectories with release R2026a on 15 November 2026 and stored the reports as JSON. The browser displays those reports and does not call GMAT.
- E. M. Standish and J. G. Williams, approximate positions of the planets, JPL Solar System Dynamics. Keplerian elements and rates for 1800–2050, mean ecliptic and equinox of J2000. https://ssd.jpl.nasa.gov/planets/approx_pos.html . Used for the Earth-Moon barycenter and Mars in the optional orrery, with the rotation given on that page.
- Fred Espenak, NASA Goddard Space Flight Center, "Eclipses and the Moon's Orbit." Sidereal month 27.32166 days, mean eccentricity 0.0549, and the new moon of 8 January 2008.4849 Dynamical Time. https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html . Used as the lunar clock of the orrery.
- NASA Orbital Debris Program Office, Debris Assessment Software. https://orbitaldebris.jsc.nasa.gov/mitigation/das.html . Named in the low-Earth debrief and workshop. Not the source of the 200 kilometer figure.
- NASA Ames Research Center, Trajectory Browser. https://trajbrowser.arc.nasa.gov/ . Named as the public catalogue of trajectories to planets and small bodies. The lunar capture figures remain the GMAT results.
- NASA Small Satellite Institute, Space Mission Design Tools. https://www.nasa.gov/smallsat-institute/space-mission-design-tools/ . The page on which PyCubed and SPENVIS are listed among public tools. Named in the workshop and on the radiation shield. Not used to generate mission numbers.
- SPENVIS, European Space Agency and BIRA-IASB. https://www.spenvis.oma.be/ . Named on the radiation shield. Not the source of a figure in the game.
- PyCubed, public CubeSat avionics board. https://pycubed.org/ . Named in the workshop as one board that combines power, computing, communication, and attitude control. The player's chassis is not a PyCubed board.
- R. R. Wessen, C. Borden, J. Ziemer, and J. Kwok, "Space Mission Concept Development Using Concept Maturity Levels," Jet Propulsion Laboratory, California Institute of Technology, 2013, paper 13-3547. Basis of the in-game checklist and of the 80 percent green gate. The game uses a 20-line teaching cut, not the full matrix.
- California Polytechnic State University, CubeSat Design Specification. Face sizes used for the drag areas: 100 by 100 millimeters, 100 by 170.2 millimeters, 100 by 227.0 millimeters, and 100 by 340.5 millimeters.
- Public mission facts on the debrief cards, names and agencies only: GeneSat-1, PhoneSat, Nodes, Dellingr, Terra, Aqua, Suomi NPP, Landsat 9, Lunar Reconnaissance Orbiter, GRAIL, LADEE, Lunar Flashlight, Mars Reconnaissance Orbiter, Mars Odyssey, MAVEN, MarCO, SOHO, ACE, DSCOVR, Wind, ICESat-2, QZSS, and GOES-16. The in-game list is `src/data/missions_reelles.json`.

Open-source software

- Three.js 0.160, MIT License. https://threejs.org/ . Earth, spacecraft, launch, and trajectory view.
- Vite 5, MIT License. https://vitejs.dev/ . Development server and build.
- Vitest 2, MIT License. https://vitest.dev/ . Automated tests for the gates, the drag table, the orrery, and the tool sentences.
- jsPDF 4, MIT License. https://github.com/parallax/jsPDF . Debrief export.
- ws 8, MIT License. https://github.com/websockets/ws . Party-of-four server. Not imported by the game page.
- Node.js. https://nodejs.org/ . Runs the page toolchain and, separately, the party server.

Project

- Space Heroes, branch dev4. https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4
- Player guide: `docs/guide_user.md`. Build notes: `docs/Planning/Plan4.md`.
