const audio = document.querySelector('#audio');
const fileInput = document.querySelector('#audioFile');
const playButton = document.querySelector('#playButton');
const addTrackButton = document.querySelector('#addTrackButton');
const muteButton = document.querySelector('#muteButton');
const trackHint = document.querySelector('#trackHint');
const trackTitle = document.querySelector('#trackTitle');
const trackState = document.querySelector('#trackState');
const musicDock = document.querySelector('.music-dock');
const entryGate = document.querySelector('#entryGate');
const entryAgree = document.querySelector('#entryAgree');
const entryDisagree = document.querySelector('#entryDisagree');
let currentObjectUrl = '';

entryAgree?.addEventListener('click', () => {
  const universe = document.querySelector('#universe');
  universe?.removeAttribute('inert');
  universe?.removeAttribute('aria-hidden');
  document.body.classList.remove('entry-locked');
  entryGate?.classList.add('is-leaving');
  entryGate?.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    if (entryGate) entryGate.hidden = true;
  }, 320);
});

function hideDisagree() {
  if (!entryDisagree || entryDisagree.hidden || entryDisagree.disabled) return;
  entryDisagree.disabled = true;
  entryDisagree.setAttribute('aria-hidden', 'true');
  entryDisagree.classList.add('is-vanishing');
  entryAgree?.focus({ preventScroll: true });
  window.setTimeout(() => {
    if (entryDisagree) entryDisagree.hidden = true;
  }, 180);
}

entryDisagree?.addEventListener('pointerenter', hideDisagree, { once: true });
entryDisagree?.addEventListener('focus', hideDisagree, { once: true });
entryDisagree?.addEventListener('click', (event) => {
  event.preventDefault();
  hideDisagree();
});

entryAgree?.focus({ preventScroll: true });

function startSunlightPulseWhenMeadowReady() {
  const meadow = new Image();
  let started = false;
  const markReady = () => {
    if (started) return;
    started = true;
    document.documentElement.classList.add('scene-ready');
  };

  meadow.decoding = 'async';
  meadow.addEventListener('load', async () => {
    try {
      if (typeof meadow.decode === 'function') await meadow.decode();
    } catch {
      // Keep the sunlight effect from being stuck if a browser rejects decode().
    }
    markReady();
  }, { once: true });
  meadow.addEventListener('error', markReady, { once: true });
  meadow.src = './assets/meadow-bg.webp';
  if (meadow.complete && meadow.naturalWidth > 0) markReady();
}

startSunlightPulseWhenMeadowReady();

const FLOWER_ROWS = 20;
const flowerCanvas = document.querySelector('#flowerField');
const flowerContext = flowerCanvas?.getContext('2d', { alpha: true, desynchronized: true });
const reducedFlowerMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const flowerSpritePaths = [
  './assets/sunflower-1.webp',
  './assets/sunflower-2.webp',
  './assets/sunflower-3.webp',
];

let fieldWidth = 0;
let fieldHeight = 0;
let fieldPixelRatio = 1;
let flowerPlants = [];
let flowerFrame = 0;
let lastFlowerFrame = 0;
const randomBetween = (min, max) => min + Math.random() * (max - min);

function drawFlowerField(time = 0) {
  if (!flowerContext || !flowerCanvas) return;
  flowerContext.clearRect(0, 0, fieldWidth, fieldHeight);

  for (const plant of flowerPlants) {
    const sprite = flowerSprites[plant.spriteIndex];
    if (!sprite.complete || !sprite.naturalWidth) continue;

    const sway = reducedFlowerMotion
      ? plant.restAngle
      : plant.restAngle + Math.sin(time * plant.speed + plant.phase) * plant.amplitude;

    flowerContext.save();
    flowerContext.globalAlpha = plant.opacity;
    flowerContext.translate(plant.x, plant.y);
    flowerContext.rotate(sway * Math.PI / 180);
    flowerContext.drawImage(sprite, -plant.width / 2, -plant.height, plant.width, plant.height);
    flowerContext.restore();
  }
}

const flowerSprites = flowerSpritePaths.map((path) => {
  const sprite = new Image();
  sprite.decoding = 'async';
  sprite.addEventListener('load', () => drawFlowerField(lastFlowerFrame), { once: true });
  sprite.src = path;
  return sprite;
});

function createFlowerPlants(width, height) {
  const plants = [];
  const flowersPerRow = width < 480 ? 9 : width < 760 ? 12 : 22;
  const columnSpacing = width / flowersPerRow;

  for (let row = 0; row < FLOWER_ROWS; row += 1) {
    const depth = row / (FLOWER_ROWS - 1);
    const rowY = height * (0.78 + 0.27 * Math.pow(depth, 1.4))
      + randomBetween(-height * 0.006, height * 0.006);
    const rowOffset = randomBetween(0, columnSpacing);

    for (let column = 0; column < flowersPerRow; column += 1) {
      let x = column * columnSpacing + rowOffset;
      x += randomBetween(-columnSpacing * 0.58, columnSpacing * 0.58);
      x = ((x % width) + width) % width;

      const scale = 0.03 + 0.14 * Math.pow(depth, 1.55);
      const plantHeight = height * scale * randomBetween(0.84, 1.16);
      plants.push({
        x,
        y: rowY + randomBetween(-height * 0.004, height * 0.004),
        width: plantHeight * randomBetween(0.7, 0.86),
        height: plantHeight,
        opacity: 0.58 + depth * 0.4,
        restAngle: randomBetween(-0.7, 0.7),
        amplitude: (0.7 + 5.1 * Math.pow(depth, 1.2)) * randomBetween(0.8, 1.16),
        speed: randomBetween(0.00055, 0.00115),
        phase: randomBetween(0, Math.PI * 2),
        spriteIndex: Math.floor(Math.random() * flowerSpritePaths.length),
      });
    }
  }

  return plants;
}

function renderFlowerFrame(time) {
  flowerFrame = 0;
  if (!reducedFlowerMotion && time - lastFlowerFrame < 1000 / 30) {
    flowerFrame = requestAnimationFrame(renderFlowerFrame);
    return;
  }

  lastFlowerFrame = time;
  drawFlowerField(time);
  if (!reducedFlowerMotion) flowerFrame = requestAnimationFrame(renderFlowerFrame);
}

function resizeFlowerField() {
  if (!flowerCanvas || !flowerContext) return;
  const bounds = flowerCanvas.getBoundingClientRect();
  fieldWidth = bounds.width || window.innerWidth;
  fieldHeight = bounds.height || window.innerHeight;
  fieldPixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.15 : 1.35);
  flowerCanvas.width = Math.round(fieldWidth * fieldPixelRatio);
  flowerCanvas.height = Math.round(fieldHeight * fieldPixelRatio);
  flowerContext.setTransform(fieldPixelRatio, 0, 0, fieldPixelRatio, 0, 0);
  flowerContext.imageSmoothingEnabled = true;
  flowerContext.imageSmoothingQuality = 'high';
  flowerPlants = createFlowerPlants(fieldWidth, fieldHeight);
  flowerCanvas.dataset.flowerCount = String(flowerPlants.length);
  drawFlowerField(performance.now());

  if (!reducedFlowerMotion && !flowerFrame) {
    flowerFrame = requestAnimationFrame(renderFlowerFrame);
  }
}

if (flowerCanvas && flowerContext) {
  resizeFlowerField();
  window.addEventListener('resize', resizeFlowerField, { passive: true });
}

function setPlaying(isPlaying) {
  musicDock.classList.toggle('is-playing', isPlaying);
  playButton.setAttribute('aria-label', isPlaying ? 'গান থামান' : 'Sunflower গান চালান');
  trackState.textContent = isPlaying ? 'NOW PLAYING' : 'YOUR SUNFLOWER MOMENT';
}

playButton.addEventListener('click', async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      trackHint.textContent = 'MP3 লোড হচ্ছে না—অন্য অডিও বেছে নিন';
    }
  } else {
    audio.pause();
  }
});

addTrackButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('audio/') && !/\.(mp3|m4a|wav|ogg|aac|flac)$/i.test(file.name)) {
    trackHint.textContent = 'একটি অডিও ফাইল বেছে নিন (MP3, M4A, WAV, OGG)';
    fileInput.value = '';
    return;
  }
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(file);
  audio.src = currentObjectUrl;
  audio.load();
  trackTitle.textContent = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Sunflower';
  trackHint.textContent = 'আপনার ডিভাইসের অডিও · শুধু এই ব্রাউজারেই';
  try {
    await audio.play();
  } catch {
    trackHint.textContent = 'ফাইল যোগ হয়েছে—Play বোতামে চাপ দিন';
  }
});

audio.addEventListener('play', () => {
  setPlaying(true);
  trackHint.textContent = 'Post Malone · Swae Lee — Sunflower চলছে';
});
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('ended', () => setPlaying(false));
audio.addEventListener('error', () => {
  setPlaying(false);
  trackHint.textContent = 'MP3 লোড হয়নি—আবার Play চাপুন বা অন্য অডিও বেছে নিন';
});

muteButton.addEventListener('click', () => {
  audio.muted = !audio.muted;
  muteButton.classList.toggle('is-muted', audio.muted);
  muteButton.setAttribute('aria-label', audio.muted ? 'অডিও আনমিউট করুন' : 'অডিও মিউট করুন');
  muteButton.title = audio.muted ? 'Unmute' : 'Mute';
});

window.addEventListener('pagehide', () => {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
});

// A restrained layer of warm drifting lights, kept lightweight on mobile.
const canvas = document.querySelector('#fireflies');
const context = canvas.getContext('2d', { alpha: true });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let width = 0;
let height = 0;
let pixelRatio = 1;
let lights = [];

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const count = Math.min(72, Math.max(28, Math.round(width / 18)));
  lights = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: .35 + Math.random() * 1.2,
    alpha: .15 + Math.random() * .55,
    phase: Math.random() * Math.PI * 2,
    drift: .05 + Math.random() * .22,
  }));
  drawLights(0);
}

function drawLights(time) {
  context.clearRect(0, 0, width, height);
  for (const light of lights) {
    const pulse = reducedMotion ? 0 : Math.sin(time * .00065 + light.phase) * .22;
    const opacity = Math.max(.04, light.alpha + pulse);
    context.beginPath();
    context.fillStyle = `rgba(255, 222, 156, ${opacity})`;
    context.shadowColor = 'rgba(255, 209, 122, .65)';
    context.shadowBlur = light.radius > 1 ? 10 : 4;
    context.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
    context.fill();
    if (!reducedMotion) {
      light.y -= light.drift;
      light.x += Math.sin(time * .00022 + light.phase) * .1;
      if (light.y < -4) {
        light.y = height + 4;
        light.x = Math.random() * width;
      }
    }
  }
  context.shadowBlur = 0;
  if (!reducedMotion) requestAnimationFrame(drawLights);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });
