const PptxGenJS = require("pptxgenjs");
const path = require("path");

const logo = path.join(__dirname, "../../src/logo.png");
const pres = new PptxGenJS();
pres.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pres.layout = "WIDE";
pres.title = "Space Heroes — Project Demo";
pres.author = "Space Heroes";
pres.subject = "NASA Space Apps Challenge 2026";
pres.company = "Space Heroes";

const THEME = {
  name: "Space Heroes",
  headFontFace: "Calibri",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "07111F", lt1: "F7F9FC", dk2: "0E2A5A", lt2: "D6E4F5",
    accent1: "0C4DA2", accent2: "3D8FD4", accent3: "C4922A",
    accent4: "8E3B2F", accent5: "1A6B8A", accent6: "E8EEF6",
    hlink: "0C4DA2", folHlink: "0E2A5A"
  }
};
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

function shadow() {
  return { type: "outer", color: "07111F", blur: 10, opacity: 0.12, offset: 3, angle: 90 };
}

pres.defineSlideMaster({
  title: "DARK",
  background: { color: "07111F" },
  objects: [
    { image: { x: 12.15, y: 0.32, w: 0.62, h: 0.62, path: logo } },
    { text: { text: "NASA SPACE APPS  2026", options: { x: 0.55, y: 7.05, w: 5.5, h: 0.28, fontFace: "Calibri", fontSize: 11, color: "8AA0B8", margin: 0 } } }
  ],
  slideNumber: { x: 12.15, y: 7.05, w: 0.62, h: 0.28, fontFace: "Calibri", fontSize: 11, color: "8AA0B8", align: "right" }
});

pres.defineSlideMaster({
  title: "LIGHT",
  background: { color: "F7F9FC" },
  objects: [
    { image: { x: 12.15, y: 0.28, w: 0.55, h: 0.55, path: logo } },
    { text: { text: "SPACE HEROES", options: { x: 0.55, y: 7.05, w: 4, h: 0.28, fontFace: "Calibri", fontSize: 11, color: "4A5A70", margin: 0 } } }
  ],
  slideNumber: { x: 12.15, y: 7.05, w: 0.62, h: 0.28, fontFace: "Calibri", fontSize: 11, color: "4A5A70", align: "right" }
});

function darkSlide() {
  const s = pres.addSlide({ masterName: "DARK" });
  return s;
}
function lightSlide() {
  return pres.addSlide({ masterName: "LIGHT" });
}

// 1
{
  const s = darkSlide();
  s.addImage({ path: logo, x: 0.7, y: 1.35, w: 2.15, h: 2.15 });
  s.addText("SPACE HEROES", { x: 3.2, y: 1.55, w: 8.5, h: 0.85, fontFace: "Calibri", fontSize: 44, bold: true, color: "F7F9FC", margin: 0, isTextBox: true });
  s.addText("Design the mission before you fly it.", { x: 3.2, y: 2.5, w: 8.5, h: 0.5, fontFace: "Calibri", fontSize: 22, italic: true, color: "7EB6FF", margin: 0, isTextBox: true });
  s.addText("NASA Space Apps Challenge 2026\nDesign and Develop Science Missions", { x: 3.2, y: 3.35, w: 8.2, h: 0.9, fontFace: "Calibri", fontSize: 16, color: "D6E4F5", margin: 0, isTextBox: true });
  s.addNotes("A science mission is decided long before liftoff. Budget, mass, power, data, the link, and the calendar all spend the same design. Space Heroes turns that trade into a game. This is our answer to Design and Develop Science Missions. Do not say the game replaces GMAT or an agency training course.");
}

// 2
{
  const s = lightSlide();
  s.addText("One seat, one gate", { x: 0.55, y: 0.38, w: 10.5, h: 0.6, fontFace: "Calibri", fontSize: 32, bold: true, color: "07111F", margin: 0, isTextBox: true });
  const seats = [
    ["DM", "Mission Director"],
    ["VE", "Vehicle Engineer"],
    ["SE", "Systems Engineer"],
    ["SL", "Science Lead"]
  ];
  seats.forEach((seat, i) => {
    const y = 1.3 + i * 1.25;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y, w: 6.3, h: 1.08, fill: { color: "FFFFFF" }, shadow: shadow(), rectRadius: 0.08 });
    s.addText(seat[0], { x: 0.75, y: y + 0.22, w: 1.15, h: 0.62, fontFace: "Calibri", fontSize: 22, bold: true, color: "0C4DA2", align: "center", margin: 0, isTextBox: true });
    s.addText(seat[1], { x: 2.05, y: y + 0.28, w: 4.4, h: 0.5, fontFace: "Calibri", fontSize: 20, color: "1A2332", margin: 0, isTextBox: true });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.15, y: 1.3, w: 5.5, h: 5.05, fill: { color: "0C4DA2" }, rectRadius: 0.1 });
  s.addText("80%", { x: 7.4, y: 1.7, w: 5.0, h: 1.15, fontFace: "Calibri", fontSize: 60, bold: true, color: "F7F9FC", margin: 0, isTextBox: true });
  s.addText("of the Concept Maturity Level checks must be green before the team leaves a phase.", { x: 7.45, y: 3.05, w: 4.9, h: 1.5, fontFace: "Calibri", fontSize: 16, color: "F7F9FC", margin: 0, isTextBox: true });
  s.addText("Alone, ASTRA covers the other three seats. She speaks written lines, in French or in English. At a table of four, the server holds the gauges.", { x: 7.45, y: 4.7, w: 4.9, h: 1.3, fontFace: "Calibri", fontSize: 15, color: "D6E4F5", margin: 0, isTextBox: true });
  s.addNotes("You choose a seat. Alone, ASTRA covers the other three. She does not improvise. At a table of four, each person holds one seat and the server holds the six gauges. The team may not leave a phase until 80 percent of the checks are green. Do not say ASTRA is a generative model.");
}

// 3
{
  const s = lightSlide();
  s.addText("Build it, then prove it", { x: 0.55, y: 0.38, w: 11, h: 0.55, fontFace: "Calibri", fontSize: 32, bold: true, color: "07111F", margin: 0, isTextBox: true });
  const resources = ["Budget", "Mass", "Power", "Data", "Link", "Time"];
  resources.forEach((name, i) => {
    const x = 0.55 + i * 2.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.25, w: 1.95, h: 1.15, fill: { color: i % 2 ? "0C4DA2" : "0E2A5A" }, rectRadius: 0.08 });
    s.addText(name, { x, y: 1.55, w: 1.95, h: 0.55, fontFace: "Calibri", fontSize: 16, bold: true, color: "F7F9FC", align: "center", margin: 0, isTextBox: true });
  });
  const tests = [
    ["01", "Vibration", "The structure has to survive the ride."],
    ["02", "Thermal isolation", "The blanket has to hold the temperature."],
    ["03", "Electrical fit", "Power and signals have to agree."]
  ];
  tests.forEach((t, i) => {
    const x = 0.55 + i * 4.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.75, w: 3.95, h: 2.55, fill: { color: "FFFFFF" }, shadow: shadow(), rectRadius: 0.08 });
    s.addText(t[0], { x: x + 0.25, y: 2.95, w: 3.4, h: 0.45, fontFace: "Calibri", fontSize: 14, bold: true, color: "0C4DA2", margin: 0, isTextBox: true });
    s.addText(t[1], { x: x + 0.25, y: 3.4, w: 3.45, h: 0.7, fontFace: "Calibri", fontSize: 22, bold: true, color: "07111F", margin: 0, isTextBox: true });
    s.addText(t[2], { x: x + 0.25, y: 4.2, w: 3.45, h: 0.75, fontFace: "Calibri", fontSize: 15, color: "1A2332", margin: 0, isTextBox: true });
  });
  s.addText("If the gate is red, the team returns to the workshop. The cost already charged is replaced, not added again.", { x: 0.55, y: 5.55, w: 12.1, h: 0.7, fontFace: "Calibri", fontSize: 16, color: "1A2332", margin: 0, isTextBox: true });
  s.addNotes("Five families, twelve points, six resources. On the low-Earth mission, drag comes from an 84-day GMAT grid on four CubeSat faces. Then three tests. A failed gate sends the team back, and the workshop cost is replaced. Do not say a game test is a flight qualification.");
}

// 4
{
  const s = lightSlide();
  s.addText("The orbit is a GMAT run", { x: 0.55, y: 0.35, w: 11, h: 0.55, fontFace: "Calibri", fontSize: 32, bold: true, color: "07111F", margin: 0, isTextBox: true });
  s.addText("Propagated in R2026a on 15 November 2026. The browser displays the reports. It does not call GMAT.", { x: 0.55, y: 0.98, w: 12, h: 0.4, fontFace: "Calibri", fontSize: 15, color: "4A5A70", margin: 0, isTextBox: true });
  const stats = [
    ["3.12 km/s", "Lunar injection", "1 January 2026"],
    ["50 km", "Perilune", "Capture 0.87 km/s"],
    ["113.3 min", "Mars orbit", "Departure early Dec 2026"],
    ["94.5 min", "Polar orbit", "About 15 Svalbard passes"],
    ["1,436 min", "High orbit and GEO", "35,786 km"],
    ["173 days", "L1 halo", "1.5 million km"]
  ];
  stats.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.55 + col * 4.2;
    const y = 1.6 + row * 2.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.95, h: 2.1, fill: { color: "FFFFFF" }, shadow: shadow(), rectRadius: 0.08 });
    s.addText(st[0], { x: x + 0.25, y: y + 0.22, w: 3.45, h: 0.7, fontFace: "Calibri", fontSize: 28, bold: true, color: "0C4DA2", margin: 0, isTextBox: true });
    s.addText(st[1], { x: x + 0.25, y: y + 0.98, w: 3.45, h: 0.4, fontFace: "Calibri", fontSize: 16, bold: true, color: "07111F", margin: 0, isTextBox: true });
    s.addText(st[2], { x: x + 0.25, y: y + 1.4, w: 3.45, h: 0.4, fontFace: "Calibri", fontSize: 14, color: "4A5A70", margin: 0, isTextBox: true });
  });
  s.addNotes("Read the Moon first: 3.12 kilometers per second, 50 kilometer perilune, 0.87 kilometer per second capture. Mars, the polar orbit, and the 1,436 minute orbits are also GMAT. Four corrections a year at L1 are an operational hypothesis, said on the next beat if asked. Do not claim a new propagation during the pitch. Keep this slide if time is cut.");
}

// 5
{
  const s = lightSlide();
  s.addText("Name the tool. Keep the number.", { x: 0.55, y: 0.38, w: 11.2, h: 0.6, fontFace: "Calibri", fontSize: 32, bold: true, color: "07111F", margin: 0, isTextBox: true });
  const tools = [
    ["Debris Assessment Software", "Named beside the 200 km end-of-life stop. It did not measure that stop."],
    ["Trajectory Browser", "The public catalogue for planets and small bodies. The lunar capture stays from GMAT."],
    ["PyCubed", "One public board for power, computing, communication, and attitude. Not the player's chassis."],
    ["SPENVIS", "Named on the radiation shield as the model of that environment. Not a figure in the tables."]
  ];
  tools.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.55 + col * 6.35;
    const y = 1.35 + row * 2.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 6.05, h: 2.3, fill: { color: "FFFFFF" }, shadow: shadow(), rectRadius: 0.08 });
    s.addText(t[0], { x: x + 0.3, y: y + 0.28, w: 5.45, h: 0.7, fontFace: "Calibri", fontSize: 20, bold: true, color: "0C4DA2", margin: 0, isTextBox: true });
    s.addText(t[1], { x: x + 0.3, y: y + 1.05, w: 5.45, h: 0.9, fontFace: "Calibri", fontSize: 15, color: "1A2332", margin: 0, isTextBox: true });
  });
  s.addNotes("The score is out of 100. The debrief names a real NASA mission. It names a public tool only where that tool belongs, and it does not pretend the real mission was designed with it. Do not say these four tools produced the figures.");
}

// 6
{
  const s = darkSlide();
  s.addText("What we left labeled", { x: 0.55, y: 0.4, w: 11, h: 0.6, fontFace: "Calibri", fontSize: 32, bold: true, color: "F7F9FC", margin: 0, isTextBox: true });
  const lines = [
    ["GMAT results, stored", "The page never launches GMAT. It plays the runs from 15 November 2026."],
    ["Hypothesis, labeled", "Four corrections a year at L1 are an operational assumption, not a sample-targeter result."],
    ["Drawing, compressed", "On the orrery, the Moon and L1 are pulled away from Earth so they stay visible. The angles follow the published elements."]
  ];
  lines.forEach((line, i) => {
    const y = 1.4 + i * 1.7;
    s.addText(line[0], { x: 0.7, y, w: 11.5, h: 0.48, fontFace: "Calibri", fontSize: 24, bold: true, color: "7EB6FF", margin: 0, isTextBox: true });
    s.addText(line[1], { x: 0.7, y: y + 0.52, w: 11.5, h: 0.7, fontFace: "Calibri", fontSize: 18, color: "F7F9FC", margin: 0, isTextBox: true });
  });
  s.addNotes("The hub opens on a simple line. A button opens the orrery. Earth and Mars follow the JPL elements for 1800 to 2050. The Moon starts at the new moon of 8 January 2008. We would rather show a compressed drawing than a false distance. Do not call the orrery a precision ephemeris.");
}

// 7
{
  const s = lightSlide();
  s.addText("Open the branch", { x: 0.55, y: 0.4, w: 8, h: 0.55, fontFace: "Calibri", fontSize: 32, bold: true, color: "07111F", margin: 0, isTextBox: true });
  s.addImage({ path: logo, x: 10.7, y: 1.5, w: 1.7, h: 1.7 });
  s.addText("github.com/ErdisKodjo/SpaceHeroes2/tree/dev4", { x: 0.55, y: 1.25, w: 9.6, h: 0.55, fontFace: "Calibri", fontSize: 18, bold: true, color: "0C4DA2", margin: 0, isTextBox: true });
  const cmds = ["git checkout dev4", "npm install", "npm run dev"];
  cmds.forEach((c, i) => {
    const y = 2.15 + i * 0.85;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.55, y, w: 8.6, h: 0.7, fill: { color: "07111F" }, rectRadius: 0.06 });
    s.addText(c, { x: 0.8, y: y + 0.14, w: 8.1, h: 0.42, fontFace: "Consolas", fontSize: 18, color: "F7F9FC", margin: 0, isTextBox: true });
  });
  s.addText("French or English. Chapter 1 is open. Discovery mode opens the Moon. The same address is the public project link. There is no separate hosted game.", { x: 0.55, y: 4.9, w: 9.5, h: 1.2, fontFace: "Calibri", fontSize: 16, color: "1A2332", margin: 0, isTextBox: true });
  s.addNotes("This is the public project, branch dev4. The game runs in the browser. If you only have a minute, start chapter 1, or open Discovery mode and fly the Moon. Do not say a public website already hosts a live match.");
}

pres.writeFile({ fileName: path.join(__dirname, "Space_Heroes_Project_Demo.pptx") })
  .then(async (file) => {
    const { applyTheme } = require("C:/Users/brice/.claude/skills/synced/86e36e3a-8d02-4a33-aef1-46f319f2b889_15f97d0f-f6a1-4ddf-bfad-d7a492231e5d/pptx/scripts/apply_theme.js");
    await applyTheme(file, THEME);
    console.log(file);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
