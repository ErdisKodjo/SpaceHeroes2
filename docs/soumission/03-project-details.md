# Project Details

## Instruction

Ce champ explique comment le projet fonctionne, avec quels outils, et dans quel but. Un juge technique s'arrête ici.

1. Copiez le texte sous **Texte à coller**, titres de section compris s'ils passent en texte simple.
2. Ne copiez pas l'instruction.
3. Si le champ n'accepte pas les titres, gardez les paragraphes dans le même ordre : parcours, atelier, trajectoire, plusieurs joueurs, outils, but.
4. N'ajoutez pas le centre de lancement détaillé ni les couches atmosphériques : ils ne sont pas sur la branche publique citée par le lien.
5. Les commandes de lancement sont dans le mode d'emploi. Inutile de les répéter ici si la place manque. La phrase sur `npm run dev` peut rester.

## Texte à coller

Space Heroes is a progressive web app. One generic engine reads each mission from data. Adding a chapter means adding a file, not rewriting the rules. A mission always follows the same path: headquarters, role, briefing, workshop, three tests, launch, operations, and debrief.

At headquarters the player sees eight missions. In Campaign, chapter 1 is open and each following chapter opens when the previous one has a debrief score. Discovery mode opens all eight. The solar-system map uses the same lock. It opens as a schematic that is not to scale. One button, Orrery, replaces that line with moving orbits. Schematic brings the line back. An open place starts the same chapter as the mission card. A locked place does nothing.

The player picks one of four seats: Mission Director, Vehicle Engineer, Systems Engineer, or Science Lead. In a solo game, ASTRA covers the other three seats. The briefing asks for the science goal, what makes the mission specific, the window, the budget class, and a first sketch. ASTRA scores the first Concept Maturity Level. Later gates use a 20-line checklist. A phase opens when 80 percent of the required checks are green.

The workshop selects one component in each of five families: propulsion, structure, power, communications, and instrument. Twelve points set the balance of the chosen part. Six resources move together: budget, mass, power, data, communications, and duration. A locked part can be bought with workshop tokens. On the low-Earth chapter only, the twelve mission weeks lose part of the 350 kilometers between the starting altitude margin and a 200 kilometer circular orbit. That loss is the semi-major-axis drop propagated for 84 days, on four CubeSat faces: 0.0100, 0.01702, 0.0227, and 0.03405 square meters. At 1.33 kilograms those faces lose 43.1, 65.5, 85.5, and 137.6 kilometers. The 3U face at 1.33 kilograms reaches 200 kilometers on day 114.8. Outside 1.33 to 4 kilograms the loss is extended as one over mass, and the workshop says so. Between 2.22 and 4 kilograms the 84-day loss is not monotonic, because the eccentricity is sampled on a fixed day.

Three tests follow: vibration, thermal isolation, and electrical compatibility. If the gate blocks the exit, the team can return to the workshop. The workshop cost already charged is replaced, not added again.

Launch plays the stored trajectory in Three.js. The rocket on screen is deliberately larger than scale, or it would be invisible. The altitude in the legend is the real one from the chapter table. After insertion, three buttons frame the orbit already computed: Overview, Satellite, and Moon. Moon appears only on the lunar transfer. The lunar sphere sits at the far end of the ellipse. Its radius is 1,788 kilometers minus the 50 kilometer perilune.

Operations run a ground contact, then deploy communications, power, and the instrument, in that order. The debrief scores the mission out of 100, shows the resources and three design decisions, compares the score with a real NASA mission, and exports a PDF. Mission cards open a short summary on click and close on a second click.

A party of four uses a separate Node server and a WebSocket. The server owns the six gauges and the veto reserve. The director spends that reserve. The veto does not remove time. The party game is not written to the browser save. Voice, if every player allows the microphone, travels from browser to browser. There is no TURN server, so two players behind closed networks may not hear each other. The solo game never needs the server. There is no public host: if the machine has no address another network can open, the lobby says so.

The page is built with Vite 5, JavaScript modules, and Three.js 0.160. The debrief PDF uses jsPDF. Tests use Vitest. Trajectories were propagated with GMAT R2026a and copied into JSON. The page does not call GMAT. The optional orrery evaluates, in the browser, the JPL Keplerian elements for the Earth-Moon barycenter and for Mars, valid for 1800–2050, in the mean ecliptic and equinox of J2000. The rotation is Rz of minus node, Rx of minus inclination, Rz of minus argument of perihelion. The Moon starts at the published new moon of 8 January 2008.4849 and advances by the sidereal month of 27.32166 days. The date on the orrery advances one day every 0.8 seconds, and stays on today if reduced motion is on.

The goal is to teach the trades of a science mission with figures that can be checked, to label a hypothesis as a hypothesis, and to let a player finish a mission without installing a flight-dynamics tool while still seeing where each number came from.
