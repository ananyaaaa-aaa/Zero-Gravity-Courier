const WORLD = { w: 1400, h: 820 };
const screens = {};
["loadingScreen","mainMenu","storyScreen","levelSelectScreen","settingsScreen","achievementsScreen","creditsScreen","gameScreen","pauseScreen","victoryScreen","gameOverScreen"].forEach(id => screens[id] = document.getElementById(id));

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const toast = document.getElementById("toast");
const hud = {
  level: document.getElementById("hudLevel"),
  oxygen: document.getElementById("hudOxygen"),
  time: document.getElementById("hudTime"),
  deaths: document.getElementById("hudDeaths")
};

const storeKey = "zeroGravityCourierSaveV2";
const defaultSave = { unlocked: 1, best: {}, achievements: {}, settings: { music: true, sfx: true, shake: true, blur: true, zoom: true } };
let save = loadSave();

const LEVELS = [
  level("Cargo Bay", "Learn the wall push rhythm.", {x:90,y:410}, {x:1310,y:410}, [
    wall(290,0,34,290), wall(290,530,34,290), wall(580,230,34,360), wall(880,0,34,300), wall(880,540,34,280)
  ], [{x:420,y:410},{x:720,y:180},{x:1040,y:410}], [
    laser("sweep", 470,410,185,1.05), laser("line", 1060,110,1060,710)
  ]),
  level("Reactor Corridor", "The station starts moving around you.", {x:90,y:730}, {x:1310,y:100}, [
    wall(280,260,34,560), wall(520,0,34,470), wall(760,350,34,470), wall(1010,0,34,410)
  ], [{x:380,y:650},{x:660,y:190},{x:930,y:610}], [
    laser("moveV", 430,120,430,680,150), laser("sweep", 665,420,210,-1.25), laser("moveH", 1070,250,1300,250,160)
  ], [{x:700,y:760,w:180,h:24,type:"recharge"}]),
  level("Airlock Gauntlet", "Crushing doors and laser timing.", {x:70,y:410}, {x:1330,y:410}, [
    wall(245,0,34,340), wall(245,520,34,300), wall(505,220,34,600), wall(755,0,34,340), wall(1005,220,34,600)
  ], [{x:380,y:160},{x:650,y:650},{x:910,y:160},{x:1160,y:650}], [
    laser("sweep", 390,410,220,1.8), laser("door", 620,0,620,820,1.7), laser("sweep", 895,410,220,-1.8), laser("door", 1160,0,1160,820,1.25)
  ]),
  level("Magnet Spine", "Magnetic walls grip and redirect the courier.", {x:100,y:120}, {x:1300,y:700}, [
    wall(250,190,40,630,"magnet"), wall(500,0,34,510), wall(750,310,40,510,"magnet"), wall(1000,0,34,510)
  ], [{x:340,y:650},{x:620,y:150},{x:860,y:650}], [
    laser("moveV", 620,80,620,740,190), laser("sweep", 1110,420,260,1.35)
  ], [{x:210,y:650,w:120,h:26,type:"recharge"}]),
  level("Debris Field", "Spinning debris crosses the safest lines.", {x:90,y:410}, {x:1310,y:410}, [
    wall(340,120,34,580), wall(690,0,34,290), wall(690,530,34,290), wall(1040,120,34,580)
  ], [{x:500,y:410},{x:840,y:410}], [
    laser("sweep", 520,210,190,1.4), laser("sweep", 860,610,190,-1.4)
  ], [], [
    debris(455,605,54,80), debris(720,390,64,95), debris(990,210,54,75)
  ]),
  level("Glass Atrium", "Windows reveal the planet below. Oxygen is tight.", {x:100,y:710}, {x:1300,y:110}, [
    wall(300,0,34,620), wall(600,200,34,620), wall(900,0,34,620), wall(1120,270,34,300)
  ], [{x:420,y:150},{x:730,y:710},{x:1030,y:150}], [
    laser("moveH", 380,390,1240,390,210), laser("sweep", 1040,620,220,-1.7)
  ], [{x:120,y:120,w:150,h:28,type:"recharge"},{x:1230,y:650,w:120,h:28,type:"recharge"}], [], 72),
  level("Hologram Maze", "Holographic screens hide hard metal edges.", {x:90,y:410}, {x:1310,y:410}, [
    wall(240,120,34,520), wall(445,0,34,270), wall(445,550,34,270), wall(680,150,34,520), wall(930,0,34,270), wall(930,550,34,270), wall(1160,150,34,520)
  ], [{x:350,y:700},{x:565,y:120},{x:805,y:700},{x:1045,y:120}], [
    laser("moveH", 335,365,1040,365,135), laser("moveV", 1245,130,1245,690,150)
  ], [{x:548,y:392,w:150,h:24,type:"recharge"},{x:1035,y:392,w:130,h:24,type:"recharge"}]),
  level("Service Turbines", "Moving modules force angled launches.", {x:85,y:90}, {x:1315,y:730}, [
    wall(260,0,34,500), wall(520,320,34,500), wall(780,0,34,500), wall(1040,320,34,500)
  ], [{x:385,y:650},{x:650,y:120},{x:910,y:650}], [
    laser("moveH", 310,200,1180,200,170), laser("moveH", 310,610,1180,610,190), laser("sweep", 1180,410,210,1.55)
  ], [], [
    debris(665,410,70,110), debris(970,160,48,90)
  ]),
  level("Core Chamber", "Electrical arcs pulse across the reactor shell.", {x:90,y:730}, {x:1310,y:90}, [
    wall(260,250,34,570), wall(470,0,34,470), wall(680,250,34,570), wall(890,0,34,470), wall(1100,250,34,570)
  ], [{x:360,y:650},{x:580,y:120},{x:790,y:650},{x:1010,y:120}], [
    laser("door", 365,0,365,820,1.05), laser("door", 785,0,785,820,1.35), laser("sweep", 1180,520,260,-1.8)
  ], [{x:1220,y:700,w:120,h:28,type:"recharge"}]),
  level("Command Collapse", "Final delivery route: everything is failing.", {x:70,y:410}, {x:1330,y:410}, [
    wall(220,0,34,320), wall(220,500,34,320), wall(420,210,34,610), wall(620,0,34,320), wall(820,500,34,320), wall(1020,210,34,610), wall(1210,0,34,320)
  ], [{x:320,y:140},{x:520,y:690},{x:720,y:140},{x:920,y:690},{x:1130,y:140}], [
    laser("sweep", 350,410,240,2.1), laser("moveV", 560,80,560,740,220), laser("sweep", 790,410,240,-2.0), laser("moveH", 910,300,1300,300,240), laser("door", 1160,0,1160,820,1.55)
  ], [{x:680,y:760,w:140,h:28,type:"recharge"}], [
    debris(1070,600,58,105), debris(250,410,50,95)
  ], 68),
  level("Security Checkpoint", "Drones patrol predictable lanes.", {x:90,y:410}, {x:1310,y:410}, [
    wall(310,0,34,300), wall(310,520,34,300), wall(620,230,34,360), wall(930,0,34,300), wall(930,520,34,300)
  ], [{x:455,y:410},{x:780,y:170},{x:1085,y:410}], [
    laser("moveV", 520,120,520,700,130), laser("door", 1110,0,1110,820,1.1)
  ], [{x:700,y:760,w:140,h:24,type:"recharge"}], [], 86, {
    drones: [drone(430,140,430,680,95), drone(785,680,785,140,115), drone(1080,160,1080,660,105)]
  }),
  level("Shield Relay", "Energy shields cycle on a readable rhythm.", {x:90,y:730}, {x:1310,y:95}, [
    wall(270,250,34,570,"magnet"), wall(520,0,34,470), wall(770,250,34,570,"magnet"), wall(1020,0,34,470)
  ], [{x:390,y:650},{x:650,y:145},{x:900,y:650}], [
    laser("sweep", 435,420,190,1.2), laser("moveH", 575,390,1160,390,155)
  ], [{x:120,y:110,w:150,h:24,type:"recharge"},{x:1190,y:690,w:140,h:24,type:"recharge"}], [], 82, {
    shields: [shield(310,365,200,30,2.6,0), shield(810,365,200,30,2.6,1.3)]
  }),
  level("Barrel Storage", "Explosive barrels punish reckless boosts.", {x:90,y:410}, {x:1310,y:410}, [
    wall(300,0,34,300), wall(300,520,34,300), wall(570,190,34,440), wall(840,0,34,300), wall(840,520,34,300), wall(1110,190,34,440)
  ], [{x:440,y:410},{x:705,y:700},{x:975,y:410}], [
    laser("sweep", 705,410,220,1.35)
  ], [{x:1180,y:700,w:130,h:24,type:"recharge"}], [], 86, {
    barrels: [barrel(470,160), barrel(705,410), barrel(975,660)]
  }),
  level("Machine Crawl", "Moving machinery opens a fair window.", {x:80,y:100}, {x:1320,y:720}, [
    wall(260,0,34,500), wall(500,320,34,500), wall(740,0,34,500), wall(980,320,34,500)
  ], [{x:380,y:660},{x:620,y:135},{x:860,y:660},{x:1110,y:135}], [
    laser("moveH", 330,210,1210,210,155), laser("moveH", 330,610,1210,610,175)
  ], [], [], 84, {
    machinery: [machine(350,360,160,34,350,620,1.7), machine(790,425,160,34,760,1040,1.45)]
  }),
  level("Open Chamber", "A large zero-gravity room with portal routing.", {x:90,y:730}, {x:1310,y:90}, [
    wall(360,180,34,460), wall(710,0,34,300), wall(710,520,34,300), wall(1040,180,34,460)
  ], [{x:260,y:150},{x:705,y:410},{x:1140,y:675}], [
    laser("sweep", 705,410,275,1.15), laser("moveV", 1180,120,1180,700,150)
  ], [{x:610,y:760,w:190,h:24,type:"recharge"}], [], 90, {
    portals: [portal(230,650,1090,155), portal(1090,665,230,165)]
  }),
  level("Gravity Flicker", "Generators pull only during their visible pulse.", {x:90,y:410}, {x:1310,y:410}, [
    wall(290,0,34,310), wall(290,510,34,310), wall(590,230,34,360), wall(890,0,34,310), wall(890,510,34,310)
  ], [{x:430,y:410},{x:740,y:160},{x:1060,y:410}], [
    laser("moveV", 500,110,500,710,150), laser("sweep", 1020,410,210,-1.3)
  ], [{x:700,y:760,w:150,h:24,type:"recharge"}], [], 84, {
    gravity: [gravityGen(685,410,210,150,3.2,0), gravityGen(1110,210,180,120,3.2,1.6)]
  }),
  level("Collapse Run", "All mechanics begin layering together.", {x:80,y:410}, {x:1320,y:410}, [
    wall(230,0,34,300), wall(230,520,34,300), wall(450,210,34,610), wall(670,0,34,300), wall(890,520,34,300), wall(1110,210,34,610)
  ], [{x:340,y:150},{x:560,y:690},{x:780,y:150},{x:1000,y:690}], [
    laser("sweep", 340,410,210,1.75), laser("moveV", 625,100,625,720,190), laser("door", 1035,0,1035,820,1.45)
  ], [{x:690,y:760,w:130,h:24,type:"recharge"}], [debris(1190,560,52,90)], 74, {
    drones: [drone(510,120,510,690,125)],
    shields: [shield(785,392,180,28,2.4,.7)],
    conveyors: [conveyor(1115,680,160,32,-240,0)]
  }),
  level("Explosion Deck", "Fast sequences with visible blast zones.", {x:90,y:730}, {x:1310,y:90}, [
    wall(270,250,34,570), wall(480,0,34,470), wall(690,250,34,570), wall(900,0,34,470), wall(1110,250,34,570)
  ], [{x:370,y:650},{x:585,y:130},{x:795,y:650},{x:1015,y:130}], [
    laser("moveV", 575,90,575,730,205), laser("sweep", 1200,520,230,-1.8)
  ], [{x:1200,y:700,w:130,h:24,type:"recharge"}], [], 72, {
    barrels: [barrel(365,175), barrel(795,410), barrel(1015,650)],
    gravity: [gravityGen(1240,300,160,125,2.8,.4)]
  }),
  level("Reactor Freefall", "The station briefly regains gravity.", {x:90,y:110}, {x:1310,y:720}, [
    wall(270,0,34,500,"magnet"), wall(530,320,34,500), wall(790,0,34,500,"magnet"), wall(1050,320,34,500)
  ], [{x:400,y:660},{x:665,y:130},{x:930,y:660}], [
    laser("moveH", 340,230,1230,230,190), laser("moveH", 340,610,1230,610,210), laser("door", 1180,0,1180,820,1.25)
  ], [{x:115,y:690,w:130,h:24,type:"recharge"},{x:1220,y:110,w:120,h:24,type:"recharge"}], [], 70, {
    gravity: [gravityGen(700,735,260,180,2.6,0)],
    portals: [portal(400,150,1030,660)]
  }),
  level("Final Core Delivery", "Cinematic final run through the exploding command spine.", {x:70,y:410}, {x:1330,y:410}, [
    wall(190,0,34,270), wall(190,550,34,270), wall(370,170,34,480), wall(550,0,34,270), wall(730,550,34,270), wall(910,170,34,480), wall(1090,0,34,270), wall(1245,550,34,270)
  ], [{x:285,y:120},{x:465,y:700},{x:645,y:120},{x:825,y:700},{x:1010,y:120},{x:1190,y:700}], [
    laser("sweep", 280,410,230,2.25), laser("moveV", 500,80,500,740,235), laser("sweep", 735,410,230,-2.2), laser("moveH", 890,300,1280,300,245), laser("door", 1170,0,1170,820,1.75)
  ], [{x:620,y:760,w:150,h:24,type:"recharge"},{x:1230,y:110,w:110,h:24,type:"recharge"}], [debris(1130,560,55,120)], 72, {
    drones: [drone(420,120,420,690,145), drone(1010,690,1010,120,150)],
    shields: [shield(650,392,170,28,2.05,.5)],
    barrels: [barrel(300,410), barrel(850,155), barrel(1235,410)],
    portals: [portal(465,650,990,155)],
    gravity: [gravityGen(705,410,220,155,2.4,1.1)],
    conveyors: [conveyor(1100,680,150,32,-270,0)]
  })
];

const achievements = [
  ["firstDelivery", "First Delivery", "Complete level 1."],
  ["halfway", "Halfway Across", "Unlock level 6."],
  ["survivor", "Station Survivor", "Finish all 20 levels."],
  ["careful", "Careful Courier", "Complete any level without a death."],
  ["fast", "Boost Discipline", "Complete any level in under 35 seconds."]
];

let game = {
  active: false, paused: false, levelIndex: 0, player: null, camera: {x:0,y:0,z:1}, keys: {}, joy: {x:0,y:0}, deaths: 0,
  oxygen: 100, elapsed: 0, last: 0, shake: 0, boost: false, brake: false, checkpoint: null, particles: [], complete: false
};

function level(name, brief, start, goal, walls, checkpoints, hazards, pads = [], debrisList = [], oxygen = 88, extras = {}) {
  return {
    name, brief, start, goal: {...goal, r:34},
    walls: border().concat(walls), checkpoints, hazards, pads, debrisList, oxygen,
    drones: extras.drones || [],
    shields: extras.shields || [],
    barrels: extras.barrels || [],
    machinery: extras.machinery || [],
    portals: extras.portals || [],
    gravity: extras.gravity || [],
    conveyors: extras.conveyors || []
  };
}
function wall(x,y,w,h,type="solid") { return {x,y,w,h,type}; }
function debris(x,y,r,speed,phase=0) { return {x,y,r,speed,a:phase}; }
function laser(type, x1,y1,x2,y2,speed=1,phase=0) { return {type,x1,y1,x2,y2,speed,t:phase}; }
function drone(x1,y1,x2,y2,speed=100,phase=0) { return {x1,y1,x2,y2,speed,t:phase,r:21}; }
function shield(x,y,w,h,cycle=2.4,phase=0) { return {x,y,w,h,cycle,phase}; }
function barrel(x,y) { return {x,y,r:24,boom:72}; }
function machine(x,y,w,h,from,to,speed=1.2,axis="x") { return {x,y,w,h,from,to,speed,axis,t:0}; }
function portal(x,y,tx,ty) { return {x,y,tx,ty,r:30,cool:0}; }
function gravityGen(x,y,r,power=120,cycle=3,phase=0) { return {x,y,r,power,cycle,phase}; }
function conveyor(x,y,w,h,vx,vy) { return {x,y,w,h,vx,vy}; }
function border() { return [wall(0,0,WORLD.w,34), wall(0,WORLD.h-34,WORLD.w,34), wall(0,0,34,WORLD.h), wall(WORLD.w-34,0,34,WORLD.h)]; }

function loadSave() {
  try { return {...defaultSave, ...JSON.parse(localStorage.getItem(storeKey) || "{}")}; }
  catch { return structuredClone(defaultSave); }
}
function writeSave() { localStorage.setItem(storeKey, JSON.stringify(save)); }

function show(id) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[id].classList.add("active");
}

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function initStars() {
  const host = document.getElementById("particleLayer");
  for (let i = 0; i < 70; i++) {
    const dot = document.createElement("i");
    dot.style.left = Math.random() * 100 + "%";
    dot.style.top = Math.random() * 100 + "%";
    dot.style.animationDelay = Math.random() * 8 + "s";
    host.appendChild(dot);
  }
}

function bindUi() {
  document.getElementById("continueBtn").onclick = () => startLevel(Math.min(save.unlocked - 1, LEVELS.length - 1));
  document.getElementById("newGameBtn").onclick = () => show("storyScreen");
  document.getElementById("beginLevelOneBtn").onclick = () => { save.unlocked = Math.max(save.unlocked, 1); writeSave(); startLevel(0); };
  document.getElementById("levelSelectBtn").onclick = () => { renderLevels(); show("levelSelectScreen"); };
  document.getElementById("settingsBtn").onclick = () => show("settingsScreen");
  document.getElementById("achievementsBtn").onclick = () => { renderAchievements(); show("achievementsScreen"); };
  document.getElementById("creditsBtn").onclick = () => show("creditsScreen");
  document.querySelectorAll(".backBtn").forEach(b => b.onclick = () => show("mainMenu"));
  document.getElementById("pauseBtn").onclick = pause;
  document.getElementById("resumeBtn").onclick = resume;
  document.getElementById("restartBtn").onclick = () => respawn(true);
  document.getElementById("pauseRestartBtn").onclick = () => startLevel(game.levelIndex);
  document.getElementById("pauseMenuBtn").onclick = mainMenu;
  document.getElementById("retryBtn").onclick = () => startLevel(game.levelIndex);
  document.getElementById("gameOverMenuBtn").onclick = mainMenu;
  document.getElementById("victoryMenuBtn").onclick = mainMenu;
  document.getElementById("nextLevelBtn").onclick = () => game.levelIndex + 1 >= LEVELS.length ? mainMenu() : startLevel(game.levelIndex + 1);
  ["music","sfx","shake","blur","zoom"].forEach(k => {
    const el = document.getElementById(k + "Toggle");
    el.checked = save.settings[k];
    el.onchange = () => { save.settings[k] = el.checked; writeSave(); };
  });
}

function renderLevels() {
  const grid = document.getElementById("levelGrid");
  grid.innerHTML = "";
  LEVELS.forEach((l, i) => {
    const card = document.createElement("button");
    card.className = "level-card glass" + (i >= save.unlocked ? " locked" : "");
    card.innerHTML = `<strong>${i + 1}. ${l.name}</strong><span>${i >= save.unlocked ? "Locked" : l.brief}</span>`;
    card.onclick = () => i < save.unlocked && startLevel(i);
    grid.appendChild(card);
  });
}

function renderAchievements() {
  const list = document.getElementById("achievementList");
  list.innerHTML = "";
  achievements.forEach(([id, name, text]) => {
    const item = document.createElement("div");
    item.className = "achievement glass" + (save.achievements[id] ? "" : " locked");
    item.innerHTML = `<strong>${name}</strong><span>${text}</span>`;
    list.appendChild(item);
  });
}

function mainMenu() {
  game.active = false;
  audio.stopAlarm();
  show("mainMenu");
}

function startLevel(index) {
  const l = LEVELS[index];
  l.checkpoints.forEach(cp => cp.hit = false);
  [...l.hazards, ...l.drones, ...l.machinery].forEach(item => item.t = item.phase || 0);
  l.debrisList.forEach(item => item.a = item.phase || 0);
  l.portals.forEach(item => item.cool = 0);
  game = {...game, active: true, paused: false, complete: false, levelIndex: index, deaths: 0, oxygen: l.oxygen, elapsed: 0, checkpoint: {...l.start}, particles: [], player: {x:l.start.x,y:l.start.y,vx:0,vy:0,r:17}};
  hud.level.textContent = `${index + 1} / ${LEVELS.length}`;
  hud.deaths.textContent = "0";
  show("gameScreen");
  toastMsg(`${index + 1}. ${l.name}`);
  audio.start();
  audio.alarm(index > 7);
  game.last = performance.now();
  requestAnimationFrame(loop);
}

function pause() { if (game.active) { game.paused = true; show("pauseScreen"); } }
function resume() { show("gameScreen"); game.paused = false; game.last = performance.now(); requestAnimationFrame(loop); }

addEventListener("keydown", e => {
  game.keys[e.key.toLowerCase()] = true;
  if (e.key === " " && game.active) game.boost = true;
  if (e.key === "Shift" && game.active) game.brake = true;
  if (e.key === "Escape" && game.active) game.paused ? resume() : pause();
  if (e.key.toLowerCase() === "r" && game.active) respawn(true);
});
addEventListener("keyup", e => {
  game.keys[e.key.toLowerCase()] = false;
  if (e.key === " ") game.boost = false;
  if (e.key === "Shift") game.brake = false;
});

function setupTouch() {
  const base = document.getElementById("stickBase");
  const knob = document.getElementById("stickKnob");
  let id = null;
  base.addEventListener("pointerdown", e => { id = e.pointerId; base.setPointerCapture(id); move(e); });
  base.addEventListener("pointermove", e => { if (e.pointerId === id) move(e); });
  base.addEventListener("pointerup", resetStick);
  base.addEventListener("pointercancel", resetStick);
  function move(e) {
    const r = base.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    const m = Math.min(42, Math.hypot(x,y));
    const a = Math.atan2(y,x);
    game.joy.x = Math.cos(a) * (m / 42);
    game.joy.y = Math.sin(a) * (m / 42);
    knob.style.transform = `translate(${game.joy.x * 34}px, ${game.joy.y * 34}px)`;
  }
  function resetStick() { id = null; game.joy.x = 0; game.joy.y = 0; knob.style.transform = ""; }
  touchButton("boostTouch", "boost");
  touchButton("brakeTouch", "brake");
}
function touchButton(id, prop) {
  const el = document.getElementById(id);
  el.addEventListener("pointerdown", e => { e.preventDefault(); game[prop] = true; });
  el.addEventListener("pointerup", () => game[prop] = false);
  el.addEventListener("pointercancel", () => game[prop] = false);
}

function loop(now) {
  if (!game.active || game.paused) return;
  const dt = Math.min((now - game.last) / 1000, .033);
  game.last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  const l = LEVELS[game.levelIndex];
  game.elapsed += dt;
  game.oxygen -= dt * (game.boost ? 1.7 : 1);
  hud.time.textContent = fmt(game.elapsed);
  hud.oxygen.textContent = Math.max(0, Math.ceil(game.oxygen)) + "%";
  if (game.oxygen <= 0) return gameOver();

  let ix = (game.keys.d || game.keys.arrowright ? 1 : 0) - (game.keys.a || game.keys.arrowleft ? 1 : 0) + game.joy.x;
  let iy = (game.keys.s || game.keys.arrowdown ? 1 : 0) - (game.keys.w || game.keys.arrowup ? 1 : 0) + game.joy.y;
  const mag = Math.hypot(ix, iy);
  const thrust = game.boost ? 1280 : 760;
  document.body.classList.toggle("boosting", game.boost && save.settings.blur);
  if (mag > .05) {
    game.player.vx += ix / mag * thrust * dt;
    game.player.vy += iy / mag * thrust * dt;
    audio.thrust();
    addParticle(game.player.x, game.player.y, game.boost ? varColor("--cyan") : "#9fd8ff", .45);
  }
  l.gravity.forEach(g => {
    if (!cycleActive(g.cycle, g.phase, .58)) return;
    const dx = g.x - game.player.x;
    const dy = g.y - game.player.y;
    const d = Math.hypot(dx, dy);
    if (d > 10 && d < g.r) {
      const force = (1 - d / g.r) * g.power;
      game.player.vx += dx / d * force * dt;
      game.player.vy += dy / d * force * dt;
    }
  });
  l.conveyors.forEach(c => {
    if (rectHitCircle(c, game.player)) {
      game.player.vx += c.vx * dt;
      game.player.vy += c.vy * dt;
    }
  });
  if (game.brake) { game.player.vx *= Math.pow(.08, dt); game.player.vy *= Math.pow(.08, dt); addParticle(game.player.x, game.player.y, varColor("--purple"), .35); }
  game.player.vx *= 1 - .045 * dt;
  game.player.vy *= 1 - .045 * dt;
  game.player.x += game.player.vx * dt;
  game.player.y += game.player.vy * dt;

  l.machinery.forEach(m => m.t += dt);
  l.walls.forEach(r => collideWall(r));
  l.machinery.forEach(m => collideWall(machineRect(m)));
  l.shields.forEach(s => { if (shieldActive(s)) collideWall({...s, type:"shield"}); });
  l.checkpoints.forEach(cp => {
    if (!cp.hit && dist(game.player, cp) < 42) {
      cp.hit = true;
      game.checkpoint = {x:cp.x,y:cp.y};
      unlock("firstDelivery", false);
      audio.checkpoint();
      toastMsg("Checkpoint glowing");
    }
  });
  l.pads.forEach(p => {
    if (rectHitCircle(p, game.player)) {
      game.oxygen = Math.min(l.oxygen, game.oxygen + 38 * dt);
      addParticle(game.player.x, game.player.y, varColor("--green"), .4);
    }
  });
  l.portals.forEach(p => {
    p.cool = Math.max(0, p.cool - dt);
    if (p.cool <= 0 && Math.hypot(game.player.x - p.x, game.player.y - p.y) < p.r + game.player.r) {
      game.player.x = p.tx;
      game.player.y = p.ty;
      game.player.vx *= .82;
      game.player.vy *= .82;
      p.cool = .8;
      l.portals.forEach(other => { if (other !== p && Math.hypot(other.x - p.tx, other.y - p.ty) < 8) other.cool = .8; });
      toastMsg("Portal jump");
    }
  });
  l.hazards.forEach(h => { h.t += dt; if (hazardHit(h)) respawn(false); });
  l.drones.forEach(d => { d.t += dt; if (droneHit(d)) respawn(false); });
  l.debrisList.forEach(d => {
    d.a += dt * d.speed / 25;
    const px = d.x + Math.cos(d.a) * d.r;
    const py = d.y + Math.sin(d.a) * d.r;
    if (Math.hypot(game.player.x - px, game.player.y - py) < game.player.r + 20) respawn(false);
  });
  l.barrels.forEach(b => {
    const near = Math.hypot(game.player.x - b.x, game.player.y - b.y);
    if (near < b.r + game.player.r || (game.boost && near < b.boom)) respawn(false);
  });
  if (dist(game.player, l.goal) < l.goal.r + game.player.r) completeLevel();
  game.particles.forEach(p => p.life -= dt);
  game.particles = game.particles.filter(p => p.life > 0);
  if (game.shake > 0) game.shake *= .86;
  updateCamera(dt);
}

function collideWall(r) {
  const p = game.player;
  const cx = Math.max(r.x, Math.min(p.x, r.x + r.w));
  const cy = Math.max(r.y, Math.min(p.y, r.y + r.h));
  const dx = p.x - cx, dy = p.y - cy;
  const d = Math.hypot(dx, dy) || .001;
  if (d < p.r) {
    const nx = dx / d, ny = dy / d;
    p.x += nx * (p.r - d);
    p.y += ny * (p.r - d);
    const dot = p.vx * nx + p.vy * ny;
    p.vx -= 1.62 * dot * nx;
    p.vy -= 1.62 * dot * ny;
    if (r.type === "magnet") { p.vx *= .58; p.vy *= .58; }
    if (Math.abs(dot) > 90) {
      audio.impact();
      game.shake = Math.min(16, game.shake + Math.abs(dot) / 70);
      for (let i = 0; i < 6; i++) addParticle(cx, cy, "#8eb8d8", .5);
    }
  }
}

function hazardSegment(h) {
  if (h.type === "sweep") {
    const a = h.t * h.speed + .6;
    return {x1:h.x1, y1:h.y1, x2:h.x1 + Math.cos(a) * h.x2, y2:h.y1 + Math.sin(a) * h.x2};
  }
  if (h.type === "moveV") {
    const f = ping(h.t * h.speed / 340);
    const y = lerp(h.y1, h.y2, f);
    return {x1:h.x1 - 70, y1:y, x2:h.x1 + 70, y2:y};
  }
  if (h.type === "moveH") {
    const f = ping(h.t * h.speed / 340);
    const x = lerp(h.x1, h.x2, f);
    return {x1:x, y1:h.y1 - 80, x2:x, y2:h.y1 + 80};
  }
  if (h.type === "door") {
    const open = Math.sin(h.t * h.speed) > -.2;
    if (open) return null;
    return {x1:h.x1, y1:h.y1, x2:h.x2, y2:h.y2};
  }
  return {x1:h.x1, y1:h.y1, x2:h.x2, y2:h.y2};
}
function hazardHit(h) {
  const s = hazardSegment(h);
  return s && pointLineDistance(game.player.x, game.player.y, s.x1, s.y1, s.x2, s.y2) < game.player.r + 7;
}
function dronePos(d) {
  const f = ping(d.t * d.speed / 360);
  return {x: lerp(d.x1, d.x2, f), y: lerp(d.y1, d.y2, f), r: d.r};
}
function droneHit(d) {
  const p = dronePos(d);
  return Math.hypot(game.player.x - p.x, game.player.y - p.y) < game.player.r + d.r;
}
function cycleActive(cycle, phase = 0, duty = .5) {
  return (((game.elapsed + phase) % cycle) / cycle) < duty;
}
function shieldActive(s) {
  return cycleActive(s.cycle, s.phase, .54);
}
function machineRect(m) {
  const f = ping(m.t * m.speed);
  const offset = lerp(m.from, m.to, f);
  return m.axis === "y" ? {...m, y: offset, type:"machine"} : {...m, x: offset, type:"machine"};
}

function completeLevel() {
  if (game.complete) return;
  game.complete = true;
  game.active = false;
  audio.win();
  const next = game.levelIndex + 2;
  save.unlocked = Math.max(save.unlocked, Math.min(next, LEVELS.length));
  save.best[game.levelIndex] = Math.min(save.best[game.levelIndex] || 9999, game.elapsed);
  if (game.levelIndex === 0) unlock("firstDelivery");
  if (save.unlocked >= 6) unlock("halfway");
  if (game.levelIndex === LEVELS.length - 1) unlock("survivor");
  if (game.deaths === 0) unlock("careful");
  if (game.elapsed < 35) unlock("fast");
  writeSave();
  document.getElementById("victoryTitle").textContent = game.levelIndex + 1 >= LEVELS.length ? "Station Stabilized" : "Level Complete";
  document.getElementById("victoryText").textContent = `${LEVELS[game.levelIndex].name} cleared in ${fmt(game.elapsed)} with ${game.deaths} deaths.`;
  document.getElementById("nextLevelBtn").textContent = game.levelIndex + 1 >= LEVELS.length ? "Return to Menu" : "Next Level";
  show("victoryScreen");
}

function respawn(manual) {
  const p = game.player;
  p.x = game.checkpoint.x; p.y = game.checkpoint.y; p.vx = 0; p.vy = 0;
  if (!manual) game.deaths++;
  hud.deaths.textContent = game.deaths;
  game.shake = 22;
  audio.death();
  for (let i = 0; i < 32; i++) addParticle(p.x, p.y, varColor("--red"), .8);
}
function gameOver() { game.active = false; audio.death(); show("gameOverScreen"); }

function updateCamera(dt) {
  const p = game.player;
  const speed = Math.hypot(p.vx, p.vy);
  const targetZoom = save.settings.zoom ? Math.max(.64, 1 - speed / 2400) : .82;
  game.camera.z += (targetZoom - game.camera.z) * Math.min(1, dt * 3);
  game.camera.x += (p.x - game.camera.x) * Math.min(1, dt * 4);
  game.camera.y += (p.y - game.camera.y) * Math.min(1, dt * 4);
}

function draw() {
  ctx.clearRect(0,0,innerWidth,innerHeight);
  drawSpace();
  const z = game.camera.z;
  const sx = innerWidth / 2 - game.camera.x * z + (save.settings.shake ? (Math.random()-.5)*game.shake : 0);
  const sy = innerHeight / 2 - game.camera.y * z + (save.settings.shake ? (Math.random()-.5)*game.shake : 0);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(z, z);
  drawStation(LEVELS[game.levelIndex]);
  drawPlayer();
  ctx.restore();
}

function drawSpace() {
  const g = ctx.createRadialGradient(innerWidth*.7, innerHeight*.25, 0, innerWidth*.7, innerHeight*.25, innerWidth*.8);
  g.addColorStop(0, "#102b58"); g.addColorStop(.38, "#061225"); g.addColorStop(1, "#020611");
  ctx.fillStyle = g; ctx.fillRect(0,0,innerWidth,innerHeight);
  ctx.fillStyle = "rgba(78,232,255,.55)";
  for (let i = 0; i < 90; i++) {
    const x = (i * 127.3 + performance.now() * .006) % innerWidth;
    const y = (i * 71.7) % innerHeight;
    ctx.fillRect(x,y,(i%3)+.7,(i%3)+.7);
  }
  ctx.beginPath();
  ctx.arc(innerWidth * .86, innerHeight * .72, Math.min(innerWidth,innerHeight) * .17, 0, Math.PI * 2);
  const pg = ctx.createRadialGradient(innerWidth*.82, innerHeight*.68, 10, innerWidth*.86, innerHeight*.72, 220);
  pg.addColorStop(0, "#7dfcff"); pg.addColorStop(.45, "#2375ff"); pg.addColorStop(1, "rgba(91,45,180,.25)");
  ctx.fillStyle = pg; ctx.fill();
}

function drawStation(l) {
  ctx.fillStyle = "rgba(7,13,25,.82)";
  ctx.fillRect(0,0,WORLD.w,WORLD.h);
  ctx.strokeStyle = "rgba(78,232,255,.1)";
  for (let x = 0; x < WORLD.w; x += 70) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,WORLD.h); ctx.stroke(); }
  for (let y = 0; y < WORLD.h; y += 70) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(WORLD.w,y); ctx.stroke(); }
  drawWindows();
  l.conveyors.forEach(drawConveyor);
  l.gravity.forEach(drawGravity);
  l.portals.forEach(drawPortal);
  l.walls.forEach(drawWall);
  l.machinery.forEach(m => drawWall(machineRect(m)));
  l.shields.forEach(drawShield);
  l.pads.forEach(drawPad);
  l.checkpoints.forEach(drawCheckpoint);
  l.hazards.forEach(drawHazard);
  l.drones.forEach(drawDrone);
  l.debrisList.forEach(drawDebris);
  l.barrels.forEach(drawBarrel);
  drawGoal(l.goal);
  game.particles.forEach(drawParticle);
}
function drawWindows() {
  ctx.save();
  ctx.globalAlpha = .32;
  ctx.fillStyle = "rgba(78,232,255,.08)";
  ctx.strokeStyle = "rgba(78,232,255,.25)";
  for (let i = 0; i < 5; i++) { ctx.fillRect(130 + i*240, 64, 130, 42); ctx.strokeRect(130 + i*240, 64, 130, 42); }
  ctx.restore();
}
function drawWall(r) {
  const grad = ctx.createLinearGradient(r.x,r.y,r.x+r.w,r.y+r.h);
  grad.addColorStop(0, r.type === "magnet" ? "#123a62" : "#1f2d3e");
  grad.addColorStop(.5, r.type === "magnet" ? "#235e91" : "#35475b");
  grad.addColorStop(1, "#101a28");
  ctx.fillStyle = grad; ctx.fillRect(r.x,r.y,r.w,r.h);
  ctx.strokeStyle = r.type === "magnet" ? "rgba(78,232,255,.85)" : "rgba(126,163,190,.22)";
  ctx.lineWidth = r.type === "magnet" ? 3 : 1.5;
  ctx.strokeRect(r.x,r.y,r.w,r.h);
}
function drawCheckpoint(cp) {
  ctx.save();
  ctx.translate(cp.x, cp.y);
  ctx.rotate(performance.now()/900);
  ctx.strokeStyle = cp.hit ? varColor("--green") : "rgba(78,232,255,.6)";
  ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 18; ctx.lineWidth = 4;
  ctx.strokeRect(-22,-22,44,44);
  ctx.restore();
}
function drawGoal(g) {
  ctx.save();
  ctx.beginPath(); ctx.arc(g.x,g.y,g.r,0,Math.PI*2);
  ctx.fillStyle = "rgba(255,211,106,.18)"; ctx.fill();
  ctx.strokeStyle = varColor("--amber"); ctx.shadowColor = varColor("--amber"); ctx.shadowBlur = 24; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
}
function drawPad(p) {
  ctx.save();
  ctx.fillStyle = "rgba(125,255,178,.15)"; ctx.fillRect(p.x,p.y,p.w,p.h);
  ctx.strokeStyle = varColor("--green"); ctx.shadowColor = varColor("--green"); ctx.shadowBlur = 18; ctx.strokeRect(p.x,p.y,p.w,p.h);
  ctx.restore();
}
function drawConveyor(c) {
  ctx.save();
  ctx.fillStyle = "rgba(78,232,255,.11)";
  ctx.strokeStyle = "rgba(78,232,255,.55)";
  ctx.shadowColor = varColor("--cyan");
  ctx.shadowBlur = 12;
  ctx.fillRect(c.x,c.y,c.w,c.h);
  ctx.strokeRect(c.x,c.y,c.w,c.h);
  ctx.fillStyle = "rgba(237,248,255,.75)";
  const dir = Math.atan2(c.vy, c.vx);
  for (let i = 18; i < c.w; i += 36) {
    ctx.save();
    ctx.translate(c.x + i, c.y + c.h / 2);
    ctx.rotate(dir);
    ctx.beginPath();
    ctx.moveTo(-7,-6); ctx.lineTo(7,0); ctx.lineTo(-7,6);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function drawPortal(p) {
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(performance.now()/700);
  ctx.strokeStyle = varColor("--purple");
  ctx.shadowColor = varColor("--purple");
  ctx.shadowBlur = 22;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0,0,p.r,p.r*.68,0,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();
}
function drawGravity(g) {
  const on = cycleActive(g.cycle, g.phase, .58);
  ctx.save();
  ctx.globalAlpha = on ? .75 : .22;
  ctx.strokeStyle = on ? varColor("--cyan") : "rgba(156,185,212,.45)";
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = on ? 18 : 0;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(g.x,g.y,g.r,0,Math.PI*2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(g.x,g.y,22,0,Math.PI*2);
  ctx.fillStyle = on ? "rgba(78,232,255,.34)" : "rgba(156,185,212,.16)";
  ctx.fill();
  ctx.restore();
}
function drawShield(s) {
  const on = shieldActive(s);
  ctx.save();
  ctx.globalAlpha = on ? .82 : .22;
  ctx.fillStyle = on ? "rgba(168,85,255,.22)" : "rgba(168,85,255,.06)";
  ctx.strokeStyle = on ? varColor("--purple") : "rgba(168,85,255,.35)";
  ctx.shadowColor = varColor("--purple");
  ctx.shadowBlur = on ? 20 : 4;
  ctx.fillRect(s.x,s.y,s.w,s.h);
  ctx.strokeRect(s.x,s.y,s.w,s.h);
  ctx.restore();
}
function drawHazard(h) {
  const s = hazardSegment(h);
  if (!s) return;
  ctx.save();
  ctx.beginPath(); ctx.moveTo(s.x1,s.y1); ctx.lineTo(s.x2,s.y2);
  ctx.strokeStyle = h.type === "door" ? varColor("--purple") : varColor("--red");
  ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 20; ctx.lineWidth = h.type === "door" ? 12 : 6; ctx.stroke();
  ctx.restore();
}
function drawDrone(d) {
  const p = dronePos(d);
  ctx.save();
  ctx.strokeStyle = "rgba(255,75,95,.3)";
  ctx.setLineDash([8,12]);
  ctx.beginPath();
  ctx.moveTo(d.x1,d.y1);
  ctx.lineTo(d.x2,d.y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.translate(p.x,p.y);
  ctx.fillStyle = "#142943";
  ctx.strokeStyle = varColor("--red");
  ctx.shadowColor = varColor("--red");
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0,0,d.r,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = varColor("--cyan");
  ctx.fillRect(-10,-4,20,8);
  ctx.restore();
}
function drawDebris(d) {
  const px = d.x + Math.cos(d.a) * d.r, py = d.y + Math.sin(d.a) * d.r;
  ctx.save(); ctx.translate(px,py); ctx.rotate(d.a*2);
  ctx.fillStyle = "#52606e"; ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.shadowColor = "rgba(255,79,216,.35)"; ctx.shadowBlur = 16;
  ctx.fillRect(-20,-12,40,24); ctx.strokeRect(-20,-12,40,24);
  ctx.restore();
}
function drawBarrel(b) {
  ctx.save();
  ctx.translate(b.x,b.y);
  ctx.fillStyle = "rgba(255,211,106,.92)";
  ctx.strokeStyle = varColor("--red");
  ctx.shadowColor = "rgba(255,75,95,.65)";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0,0,b.r,0,Math.PI*2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,75,95,.35)";
  ctx.beginPath();
  ctx.arc(0,0,b.boom,0,Math.PI*2);
  ctx.stroke();
  ctx.restore();
}
function drawParticle(p) {
  ctx.globalAlpha = Math.max(0, p.life / p.max);
  ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
}
function drawPlayer() {
  const p = game.player;
  ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.atan2(p.vy,p.vx));
  ctx.shadowColor = varColor("--cyan"); ctx.shadowBlur = 22;
  ctx.fillStyle = "#effbff"; ctx.beginPath(); ctx.arc(0,0,p.r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = varColor("--purple"); ctx.fillRect(-6,-4,18,8);
  ctx.restore();
}

function addParticle(x,y,color,life) { game.particles.push({x:x+(Math.random()-.5)*18,y:y+(Math.random()-.5)*18,vx:0,vy:0,r:2+Math.random()*4,life,max:life,color}); }
function toastMsg(text) { toast.textContent = text; toast.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("show"), 2200); }
function unlock(id, announce = true) { if (!save.achievements[id]) { save.achievements[id] = true; if (announce) toastMsg("Achievement unlocked"); } }
function dist(a,b) { return Math.hypot(a.x-b.x, a.y-b.y); }
function lerp(a,b,t) { return a + (b-a)*t; }
function ping(t) { t = t % 2; return t < 1 ? t : 2 - t; }
function fmt(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}`; }
function rectHitCircle(r,c) { return c.x > r.x-c.r && c.x < r.x+r.w+c.r && c.y > r.y-c.r && c.y < r.y+r.h+c.r; }
function pointLineDistance(px,py,x1,y1,x2,y2) {
  const dx=x2-x1, dy=y2-y1, len=dx*dx+dy*dy || 1;
  const t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/len));
  return Math.hypot(px-(x1+t*dx), py-(y1+t*dy));
}
function varColor(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

const audio = (() => {
  let ac, music, alarmNode, lastThrust = 0;
  const ok = () => save.settings.sfx;
  function ctxAudio() { ac ||= new (window.AudioContext || window.webkitAudioContext)(); return ac; }
  function tone(freq, dur, type="sine", gain=.08, end=freq) {
    if (!ok()) return;
    const c = ctxAudio(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq,c.currentTime); o.frequency.exponentialRampToValueAtTime(Math.max(20,end), c.currentTime+dur);
    g.gain.setValueAtTime(gain,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+dur);
  }
  return {
    start() {
      const c = ctxAudio();
      if (!save.settings.music || music) return;
      music = c.createOscillator(); const g = c.createGain();
      music.type = "sawtooth"; music.frequency.value = 55; g.gain.value = .018; music.connect(g); g.connect(c.destination); music.start();
    },
    stopAlarm() { if (alarmNode) { alarmNode.stop(); alarmNode = null; } },
    alarm(on) { this.stopAlarm(); if (!on || !save.settings.sfx) return; const c = ctxAudio(); alarmNode = c.createOscillator(); const g = c.createGain(); alarmNode.type = "square"; alarmNode.frequency.value = 2; g.gain.value = .012; alarmNode.connect(g); g.connect(c.destination); alarmNode.start(); },
    thrust() { if (performance.now() - lastThrust > 90) { lastThrust = performance.now(); tone(140,.05,"sine",.018,90); } },
    impact() { tone(120,.11,"triangle",.09,55); },
    death() { tone(280,.35,"sawtooth",.12,35); },
    checkpoint() { tone(560,.18,"sine",.11,900); },
    win() { tone(440,.5,"sine",.12,1200); }
  };
})();

addEventListener("resize", resize);
resize();
initStars();
bindUi();
setupTouch();
setTimeout(() => show("mainMenu"), 1400);
