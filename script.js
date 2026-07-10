const scenes = [
  {
    id: "dawn",
    label: "Dawn",
    start: 5 * 60,
    src: "assets/01-dawn.png",
    sun: { x: "18%", y: "14%", rgb: "214, 201, 255", alpha: 0.12 },
    mood: { water: 0.34, glint: 0.14, tide: 0.18, cloud: 0.18, cloudNear: 0.08, mist: 0.23, stars: 0.04, vignette: 0.12, wind: 15, tideSeconds: 22 },
  },
  {
    id: "earlyMorning",
    label: "Early morning",
    start: 6 * 60 + 30,
    src: "assets/02-early-morning.png",
    sun: { x: "16%", y: "8%", rgb: "255, 239, 209", alpha: 0.16 },
    mood: { water: 0.4, glint: 0.18, tide: 0.22, cloud: 0.16, cloudNear: 0.07, mist: 0.15, stars: 0, vignette: 0.08, wind: 13, tideSeconds: 20 },
  },
  {
    id: "morning",
    label: "Morning",
    start: 8 * 60,
    src: "assets/03-morning.png",
    sun: { x: "22%", y: "5%", rgb: "255, 249, 221", alpha: 0.2 },
    mood: { water: 0.48, glint: 0.23, tide: 0.28, cloud: 0.12, cloudNear: 0.05, mist: 0.04, stars: 0, vignette: 0.07, wind: 11, tideSeconds: 18 },
  },
  {
    id: "noon",
    label: "Noon",
    start: 11 * 60 + 30,
    src: "assets/04-noon.png",
    sun: { x: "50%", y: "-9%", rgb: "255, 255, 246", alpha: 0.27 },
    mood: { water: 0.58, glint: 0.31, tide: 0.34, cloud: 0.06, cloudNear: 0.025, mist: 0, stars: 0, vignette: 0.055, wind: 9, tideSeconds: 16 },
  },
  {
    id: "afternoon",
    label: "Afternoon",
    start: 14 * 60,
    src: "assets/05-afternoon.png",
    sun: { x: "73%", y: "5%", rgb: "255, 230, 187", alpha: 0.2 },
    mood: { water: 0.5, glint: 0.25, tide: 0.31, cloud: 0.12, cloudNear: 0.06, mist: 0, stars: 0, vignette: 0.1, wind: 11, tideSeconds: 17 },
  },
  {
    id: "blueHour",
    label: "Blue hour",
    start: 17 * 60,
    src: "assets/06-blue-hour.png",
    sun: { x: "85%", y: "25%", rgb: "255, 183, 207", alpha: 0.13 },
    mood: { water: 0.38, glint: 0.16, tide: 0.24, cloud: 0.17, cloudNear: 0.09, mist: 0.035, stars: 0.13, vignette: 0.19, wind: 14, tideSeconds: 20 },
  },
  {
    id: "night",
    label: "Night",
    start: 19 * 60 + 30,
    src: "assets/07-night.png",
    sun: { x: "55%", y: "9%", rgb: "117, 192, 255", alpha: 0.1 },
    mood: { water: 0.31, glint: 0.13, tide: 0.21, cloud: 0.08, cloudNear: 0.04, mist: 0.025, stars: 0.5, vignette: 0.36, wind: 17, tideSeconds: 24 },
  },
];

const params = new URLSearchParams(window.location.search);
let demoMode = params.get("demo") === "1";
const debugMode = params.get("debug") === "1";
const showcaseMode = params.get("showcase") === "1";
const previewTime = parsePreviewTime(params.get("time"));
const wallpaper = document.getElementById("wallpaper");
const sceneA = document.getElementById("sceneA");
const sceneB = document.getElementById("sceneB");
const debug = document.getElementById("debug");

let blendAmount = 1;
let effectsEnabled = true;
let characterEnabled = true;
let motionStrength = 0.75;
let demoStart = performance.now();
let lastDetailScene = "";
let loadedSources = new Set();

if (debugMode) {
  document.body.classList.add("debug");
}
if (showcaseMode) {
  demoMode = true;
  wallpaper.classList.add("showcase");
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function parsePreviewTime(value) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) {
    return null;
  }
  const [hour, minute] = value.split(":").map(Number);
  if (hour > 23 || minute > 59) {
    return null;
  }
  return hour * 60 + minute;
}

function smoothstep(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixMood(current, next, t) {
  const result = {};
  for (const key of Object.keys(current.mood)) {
    result[key] = lerp(current.mood[key], next.mood[key], t);
  }
  return result;
}

function minutesForNow() {
  if (previewTime !== null) {
    return previewTime;
  }
  if (demoMode) {
    const cycleSeconds = showcaseMode ? 36 : 84;
    const elapsed = ((performance.now() - demoStart) / 1000) % cycleSeconds;
    return (elapsed / cycleSeconds) * 1440;
  }

  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

function timelineSegment(minutes) {
  const firstStart = scenes[0].start;
  const adjustedMinutes = minutes < firstStart ? minutes + 1440 : minutes;

  for (let index = 0; index < scenes.length; index += 1) {
    const current = scenes[index];
    const next = scenes[(index + 1) % scenes.length];
    const end = index === scenes.length - 1 ? firstStart + 1440 : next.start;

    if (adjustedMinutes >= current.start && adjustedMinutes < end) {
      return { current, next, progress: (adjustedMinutes - current.start) / (end - current.start) };
    }
  }

  return { current: scenes[0], next: scenes[1], progress: 0 };
}

function preload(source) {
  if (loadedSources.has(source)) {
    return;
  }
  const image = new Image();
  image.src = source;
  loadedSources.add(source);
}

function setLayerImage(layer, source) {
  const value = `url("${source}")`;
  if (layer.style.backgroundImage !== value) {
    layer.style.backgroundImage = value;
  }
  preload(source);
}

function setVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

function applyAtmosphere(current, next, blend) {
  const mood = mixMood(current, next, blend);
  const sourceScene = blend < 0.5 ? current : next;
  const sun = blend < 0.5 ? current.sun : next.sun;
  const effect = effectsEnabled ? motionStrength : 0;

  if (lastDetailScene !== sourceScene.id) {
    setVar("--detail-image", `url("${sourceScene.src}")`);
    lastDetailScene = sourceScene.id;
  }

  setVar("--sun-x", sun.x);
  setVar("--sun-y", sun.y);
  setVar("--sun-rgb", sun.rgb);
  setVar("--sun-alpha", (lerp(current.sun.alpha, next.sun.alpha, blend) * effect).toFixed(3));
  setVar("--sun-alpha-soft", (lerp(current.sun.alpha, next.sun.alpha, blend) * effect * 0.42).toFixed(3));
  setVar("--water-alpha", (mood.water * effect).toFixed(3));
  setVar("--glint-alpha", (mood.glint * effect).toFixed(3));
  setVar("--glint-low", (mood.glint * effect * 0.65).toFixed(3));
  setVar("--tide-alpha", (mood.tide * effect).toFixed(3));
  setVar("--cloud-alpha", (mood.cloud * effect).toFixed(3));
  setVar("--cloud-near-alpha", (mood.cloudNear * effect).toFixed(3));
  setVar("--mist-alpha", (mood.mist * effect).toFixed(3));
  setVar("--star-alpha", (mood.stars * effect).toFixed(3));
  setVar("--vignette", mood.vignette.toFixed(3));
  setVar("--subject-alpha", (characterEnabled ? 0.105 * effect : 0).toFixed(3));
  setVar("--hair-alpha", (characterEnabled ? 0.12 * effect : 0).toFixed(3));
  setVar("--skirt-alpha", (characterEnabled ? 0.085 * effect : 0).toFixed(3));
  setVar("--blink-alpha", (characterEnabled ? effect : 0).toFixed(3));
  setVar("--motion-strength", effect.toFixed(3));
  setVar("--wind-seconds", `${mood.wind.toFixed(1)}s`);
  setVar("--skirt-seconds", `${(mood.wind * 0.88).toFixed(1)}s`);
  setVar("--tide-seconds", `${mood.tideSeconds.toFixed(1)}s`);
}

function render() {
  const minutes = minutesForNow();
  const segment = timelineSegment(minutes);
  const blend = smoothstep(segment.progress) * blendAmount;

  setLayerImage(sceneA, segment.current.src);
  setLayerImage(sceneB, segment.next.src);
  sceneA.style.opacity = String(1 - blend);
  sceneB.style.opacity = String(blend);
  applyAtmosphere(segment.current, segment.next, blend);

  if (debugMode) {
    const hour = Math.floor(minutes / 60) % 24;
    const minute = Math.floor(minutes % 60);
    debug.textContent = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}  ${segment.current.label} -> ${segment.next.label}  ${(segment.progress * 100).toFixed(1)}%`;
  }
}

function startClock() {
  render();
  if (demoMode) {
    const tick = () => {
      render();
      if (demoMode) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  } else {
    window.setInterval(render, 1000);
  }
}

window.wallpaperPropertyListener = {
  applyUserProperties(properties) {
    if (properties.transitionblend) {
      blendAmount = clamp(Number(properties.transitionblend.value) / 100);
    }
    if (properties.enableeffects) {
      effectsEnabled = Boolean(properties.enableeffects.value);
      wallpaper.classList.toggle("motion-enabled", effectsEnabled);
    }
    if (properties.enablecharacter) {
      characterEnabled = Boolean(properties.enablecharacter.value);
    }
    if (properties.motionintensity) {
      motionStrength = clamp(Number(properties.motionintensity.value) / 100);
    }
    if (properties.demomode) {
      const nextDemoMode = Boolean(properties.demomode.value);
      if (nextDemoMode !== demoMode) {
        demoMode = nextDemoMode;
        demoStart = performance.now();
      }
    }
    render();
  },
};

document.addEventListener("visibilitychange", () => {
  wallpaper.classList.toggle("motion-paused", document.hidden);
});

startClock();
