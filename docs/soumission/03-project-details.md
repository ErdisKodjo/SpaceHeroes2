# Project Details

## What the player does

Space Heroes is a progressive web app. A mission always follows the same path, read from a chapter file: headquarters, role, briefing, workshop, three tests, launch, operations, debrief.

At headquarters the player sees eight missions. In Campaign, chapter 1 is open and each next chapter opens when the previous one has a score. Discovery mode opens all eight. The solar-system map uses the same lock. It opens as a schematic. A Planétaire button switches to the orbit view, and Schéma switches back.

The workshop picks one part in each family and spends six resources: budget, mass, power, data, communications, and duration. On the low-Earth chapter, drag over the 12-week mission comes from an 84-day GMAT grid on four CubeSat faces. Outside the measured mass range the loss is extended as one over mass, and the screen says so.

Launch plays the stored trajectory in Three.js. Three view buttons frame it: Overview, Satellite, and Moon. The Moon button exists only on the lunar transfer. Operations run a ground contact, then deploy communications, power, and the instrument, in that order. The debrief scores the mission out of 100, exports a PDF, and lists real NASA missions as cards.

A party of four uses a separate Node WebSocket server. The server owns the gauges and the veto reserve. Voice, if the players allow the microphone, goes browser to browser. The solo game stays on the device.

## Tools

The game is Vite 5, JavaScript modules, Three.js 0.160, jsPDF, and Vitest. Trajectories were propagated with GMAT R2026a and copied into JSON. The page does not call GMAT. The optional orrery evaluates the JPL Keplerian elements for Earth and Mars in the browser, with the rotation Rz(−Ω) Rx(−I) Rz(−ω). The Moon starts at the published new moon of 8 January 2008 and advances by the published sidereal month, 27.32166 days.

## Goals

Teach the trades of a science mission with numbers that survive a check. Keep a hypothesis labeled as a hypothesis. Let a player finish a mission on a laptop without installing a flight-dynamics tool, and still see where each figure came from.
