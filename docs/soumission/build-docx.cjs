const { Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, PageNumber, WidthType,
  Table, TableRow, TableCell, ShadingType, VerticalAlign } = require("docx");
const fs = require("fs");
const path = require("path");

const logo = fs.readFileSync(path.join(__dirname, "../../src/logo.png"));
const NAVY = "07111F";
const BLUE = "0C4DA2";
const INK = "1A2332";
const MUTED = "4A5A70";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const borders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before ?? 0, after: opts.after ?? 160, line: 276 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: opts.size ?? 22,
        bold: !!opts.bold,
        color: opts.color || INK,
        italics: !!opts.italics
      })
    ]
  });
}

function h(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "D6E4F5", space: 1 } },
    spacing: { before: 360, after: 160 },
    keepNext: true,
    children: [new TextRun({ text, font: "Calibri", size: 32, bold: true, color: NAVY })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    keepNext: true,
    children: [new TextRun({ text, font: "Calibri", size: 24, bold: true, color: BLUE })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 60 },
    children: [new TextRun({ text, font: "Calibri", size: 22, color: INK })]
  });
}

function cell(text, width, fill, color, bold) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: { type: ShadingType.CLEAR, fill },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Calibri", size: 20, bold: !!bold, color })]
    })]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } },
      heading1: { run: { font: "Calibri", size: 32, bold: true, color: NAVY }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true } },
      heading2: { run: { font: "Calibri", size: 24, bold: true, color: BLUE }, paragraph: { spacing: { before: 240, after: 80 }, keepNext: true } }
    }
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 420, hanging: 240 } } }
      }]
    }]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1000, bottom: 1000, left: 1080, right: 1080 } }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "SPACE HEROES", font: "Calibri", size: 18, bold: true, color: BLUE }),
            new TextRun({ text: "   ·   NASA Space Apps Challenge 2026", font: "Calibri", size: 18, color: MUTED })
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Project submission  ·  branch dev4  ·  ", font: "Calibri", size: 16, color: MUTED }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: MUTED })
          ]
        })]
      })
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [new ImageRun({ type: "png", data: logo, transformation: { width: 168, height: 168 }, altText: { title: "Space Heroes", description: "Space Heroes logo", name: "logo" } })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "SPACE HEROES", font: "Calibri", size: 56, bold: true, color: NAVY })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Design the mission before you fly it.", font: "Calibri", size: 28, italics: true, color: BLUE })]
      }),
      p("NASA Space Apps Challenge 2026  ·  Design and Develop Science Missions", { align: AlignmentType.CENTER, color: MUTED, size: 20, after: 80 }),
      p("Public project: https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4", { align: AlignmentType.CENTER, color: MUTED, size: 20, after: 280 }),

      h("How to use this document"),
      p("Paste each section below into the matching field on the official project page. The page, the demonstration, and the public link must be in English. Do not paste this instruction block."),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [cell("Field on the site", 3200, "0C4DA2", "FFFFFF", true), cell("Section in this document", 6160, "0C4DA2", "FFFFFF", true)] }),
          new TableRow({ children: [cell("High-Level Summary", 3200, "F4F7FB", INK), cell("Section 1", 6160, "F4F7FB", INK)] }),
          new TableRow({ children: [cell("Project Demo", 3200, "FFFFFF", INK), cell("The PowerPoint file, seven slides", 6160, "FFFFFF", INK)] }),
          new TableRow({ children: [cell("Final Project Link", 3200, "F4F7FB", INK), cell("https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4", 6160, "F4F7FB", INK)] }),
          new TableRow({ children: [cell("Project Details", 3200, "FFFFFF", INK), cell("Section 2", 6160, "FFFFFF", INK)] }),
          new TableRow({ children: [cell("Use of AI or NASA data", 3200, "F4F7FB", INK), cell("Section 3", 6160, "F4F7FB", INK)] }),
          new TableRow({ children: [cell("References", 3200, "FFFFFF", INK), cell("Section 4", 6160, "FFFFFF", INK)] })
        ]
      }),
      p("Open the game from branch dev4 with npm install, then npm run dev. Submit before 23:59 local time on 15 November 2026. Only the last submitted version is reviewed. Every team member must already be registered.", { before: 200 }),

      h("1. High-Level Summary"),
      p("Space Heroes is a browser game about the work that happens before a science mission ever flies. The player takes one seat on a small team, states the science question, and designs a spacecraft against six limits that move together: budget, mass, power, data, communications, and time. The launch that follows is not a painted sky. It plays a trajectory propagated in NASA's General Mission Analysis Tool. The debrief then places the result next to a real NASA mission."),
      p("The project answers the Design and Develop Science Missions challenge by making the design trade playable. A Concept Maturity Level gate has to be green before the team may leave a phase. Parts come from real classes: propulsion, structure, power, communications, and instrument. Three tests stand between the workshop and the pad. Eight missions are playable, from a 4 kg low-Earth CubeSat to the Moon, Mars, a Sun-Earth L1 halo, a polar orbit, a high orbit, and geostationary orbit. One player can fly alone. Four players on the same network can share the gauges."),
      p("What matters is that a student, or a judge, can finish a mission on a laptop without installing a flight-dynamics tool, and can still see where each figure came from. The orbits were computed in GMAT R2026a and stored for the game to display. The browser does not invent a new lunar capture, a new Mars window, or a new station contact. Where the project uses an assumption, as with the four station-keeping maneuvers a year at L1, the screen says so."),

      h("2. Project Details"),
      h2("The path of a mission"),
      p("Space Heroes is a progressive web app. One generic engine reads each mission from data. A mission always follows the same path: headquarters, role, briefing, workshop, three tests, launch, operations, and debrief."),
      p("At headquarters the player sees eight missions. In Campaign, chapter 1 is open and each following chapter opens when the previous one has a debrief score. Discovery mode opens all eight. The solar-system map uses the same lock. It opens as a schematic that is not to scale. One button, Orrery, replaces that line with moving orbits. Schematic brings the line back."),
      p("The player picks one of four seats: Mission Director, Vehicle Engineer, Systems Engineer, or Science Lead. Alone, ASTRA covers the other three. She speaks lines written for each step. The briefing asks for the science goal, what makes the mission specific, the window, the budget class, and a first sketch. Later gates use a 20-line checklist. A phase opens when 80 percent of the required checks are green."),
      h2("Workshop, tests, launch"),
      p("The workshop selects one component in each of five families. Twelve points set the balance of the chosen part. Six resources move together. On the low-Earth chapter, twelve mission weeks lose part of the 350 kilometers between the starting altitude margin and a 200 kilometer circular orbit. That loss is the semi-major-axis drop propagated for 84 days, on four CubeSat faces: 0.0100, 0.01702, 0.0227, and 0.03405 square meters. At 1.33 kilograms those faces lose 43.1, 65.5, 85.5, and 137.6 kilometers. The 3U face at 1.33 kilograms reaches 200 kilometers on day 114.8. Outside 1.33 to 4 kilograms the loss is extended as one over mass, and the workshop says so."),
      p("Three tests follow: vibration, thermal isolation, and electrical compatibility. If the gate blocks the exit, the team can return to the workshop. The cost already charged is replaced, not added again."),
      p("Launch plays the stored trajectory in Three.js. The rocket on screen is deliberately larger than scale. The altitude in the legend is the real one from the chapter table. After insertion, three buttons frame the orbit already computed: Overview, Satellite, and Moon. Moon appears only on the lunar transfer."),
      h2("Operations, debrief, and a table of four"),
      p("Operations run a ground contact, then deploy communications, power, and the instrument, in that order. The debrief scores the mission out of 100, compares it with a real NASA mission, and exports a PDF."),
      p("A party of four uses a separate Node server. The server owns the six gauges and the veto reserve. Voice, if allowed, travels from browser to browser. There is no TURN server and no public host. The solo game never needs the server."),
      h2("Tools and purpose"),
      p("The page is Vite 5, JavaScript modules, and Three.js 0.160. Trajectories were propagated with GMAT R2026a and copied into JSON. The page does not call GMAT. The optional orrery uses the JPL Keplerian elements for 1800–2050, with the published rotation. The Moon starts at the new moon of 8 January 2008.4849 and advances by the sidereal month of 27.32166 days."),
      p("The goal is to teach the trades of a science mission with figures that can be checked, to label a hypothesis as a hypothesis, and to let a player finish without installing a flight-dynamics tool."),

      h("3. Use of AI and NASA data"),
      p("This project uses NASA data for the numbers a player sees. The trajectories are outputs of the General Mission Analysis Tool, release R2026a, propagated for this project on 15 November 2026. The game stores those reports and displays them. The browser does not launch GMAT."),
      bullet("Low Earth orbit. An 84-day grid gives the drag loss on four CubeSat faces. At 1.33 kg the 3U face reaches 200 km on day 114.8. The Debris Assessment Software is named beside that stop. DAS did not produce the grid."),
      bullet("The Moon. Departure 1 January 2026 00:00, injection 3.12 km/s, perilune 50 km, capture burn 0.87 km/s. At 16.5 days the propagated altitude is 37 km and the spacecraft is still bound. These figures come from GMAT."),
      bullet("Mars. Orbit period 113.3 minutes. Departure in early December 2026. Opposition on 20 February 2027. At the far point of that cycle the radio round trip is 40 minutes."),
      bullet("Polar orbit. 94.5 minutes at 500 km and 90 degrees. Svalbard sees about 15 passes a day."),
      bullet("High orbit and geostationary orbit. Both last 1,436.0 minutes at 35,786 km. For this departure, Canberra sees the geostationary satellite continuously and sees 790 minutes of the high orbit."),
      bullet("Sun-Earth L1. Distance 1.5 million km and a halo of 173 days come from the GMAT run. Four corrections a year are an operational hypothesis, not a measurement."),
      p("The optional orrery uses the JPL elements published by Standish and Williams, and Fred Espenak's lunar clock. It is a drawing, not a flight ephemeris. The Trajectory Browser, PyCubed, and SPENVIS are named and did not produce a number in the tables."),
      p("Concept Maturity Levels follow Wessen, Borden, Ziemer, and Kwok (2013). The game uses a 20-line teaching checklist and an 80 percent green gate."),
      p("The shipped game does not call a generative model. ASTRA speaks written lines through the browser speech synthesis. An AI coding assistant in the editor was used to implement features, tests, and these submission texts. Orbital numbers were copied from the GMAT reports and from the JPL and GSFC pages, not asked of that assistant."),

      h("4. References"),
      bullet("NASA GMAT, catalog GSC-17177-1, https://software.nasa.gov/software/GSC-17177-1. That page describes an earlier release. This project used R2026a on 15 November 2026."),
      bullet("Standish and Williams, JPL approximate planetary positions, 1800–2050: https://ssd.jpl.nasa.gov/planets/approx_pos.html"),
      bullet("Fred Espenak, GSFC, Eclipses and the Moon's Orbit: https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html"),
      bullet("Debris Assessment Software: https://orbitaldebris.jsc.nasa.gov/mitigation/das.html — named, not the source of the 200 km figure."),
      bullet("NASA Ames Trajectory Browser: https://trajbrowser.arc.nasa.gov/ — named as a public catalogue. Lunar figures stay from GMAT."),
      bullet("NASA SmallSat Institute tool list: https://www.nasa.gov/smallsat-institute/space-mission-design-tools/"),
      bullet("SPENVIS: https://www.spenvis.oma.be/ — named on the shield, not the source of a figure."),
      bullet("PyCubed: https://pycubed.org/ — named as a public board. The player's chassis is not a PyCubed."),
      bullet("Wessen, Borden, Ziemer, and Kwok, JPL, 2013, paper 13-3547, Concept Maturity Levels."),
      bullet("Cal Poly CubeSat Design Specification. Faces 100×100 mm, 100×170.2 mm, 100×227.0 mm, 100×340.5 mm."),
      bullet("Debrief cards: GeneSat-1, PhoneSat, Nodes, Dellingr, Terra, Aqua, Suomi NPP, Landsat 9, LRO, GRAIL, LADEE, Lunar Flashlight, MRO, Mars Odyssey, MAVEN, MarCO, SOHO, ACE, DSCOVR, Wind, ICESat-2, QZSS, GOES-16."),
      bullet("Three.js 0.160, Vite 5, Vitest 2, jsPDF 4, ws 8, Node.js. All used as named in the repository."),
      bullet("Project: https://github.com/ErdisKodjo/SpaceHeroes2/tree/dev4")
    ]
  }]
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Space_Heroes_Project_Submission.docx");
  fs.writeFileSync(out, buf);
  console.log(out);
});
