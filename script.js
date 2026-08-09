/* ---------------------------------------------------------
   NEEDLE DROP — daily song-guessing game
   ---------------------------------------------------------
   To use your own songs: replace the entries below with
   your own audio file URLs and titles. Each entry needs a
   short royalty-free/your-own clip. The game will
   automatically rotate through them, one per day.
--------------------------------------------------------- */

const SONGS = [
  {
    title: "Believer",
    src: "songs/song1.mp3"
  },
  {
    title: "Shape of You",
    src: "songs/song2.mp3"
  },
  {
    title: "Perfect",
    src: "songs/song3.mp3"
  },
  {
    title: "Daylight",
    src: "songs/song4.mp3"
  },
  {
    title: "Baby",
    src: "songs/song5.mp3"
  },
  {
    title: "Heat Waves",
    src: "songs/song6.mp3"
  }
  
];

const CLIP_LENGTHS = [1, 2, 4, 8, 16, 30]; // seconds, one per attempt
const MAX_ATTEMPTS = CLIP_LENGTHS.length;

// ---- pick today's song --------------------------------------------------
const today = new Date();
const dayIndex = today.getDate() % SONGS.length;
const answer = SONGS[Math.floor(Math.random()*SONGS.length)];

// ---- state ---------------------------------------------------------------
let attempt = 0;      // number of guesses used so far
let gameOver = false;
let playTimeout = null;

// ---- DOM refs --------------------------------------------------------------
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const meter = document.getElementById("meter");
const clipLenLabel = document.getElementById("clipLen");
const digitsEl = document.getElementById("digits");
const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const feedback = document.getElementById("feedback");
const dayLabel = document.getElementById("dayLabel");

// ---- init ------------------------------------------------------------------
function init() {
  audio.src = answer.src;
  dayLabel.textContent = today.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  clipLenLabel.textContent = CLIP_LENGTHS[0];
  renderDigits();
}

function renderDigits() {
  digitsEl.innerHTML = "";
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const box = document.createElement("div");
    box.className = "digit";
    if (i === attempt && !gameOver) box.classList.add("active");
    box.textContent = i + 1;
    digitsEl.appendChild(box);
  }
}

// ---- audio playback (progressive reveal) ------------------------------------
playBtn.addEventListener("click", () => {
  if (gameOver) {
    toggleFullPlayback();
    return;
  }
  playClip(CLIP_LENGTHS[attempt]);
});

function playClip(seconds) {
  clearTimeout(playTimeout);
  audio.currentTime = 0;
  audio.play();
  setPlayingUI(true);

  playTimeout = setTimeout(() => {
    audio.pause();
    setPlayingUI(false);
  }, seconds * 1000);
}

function toggleFullPlayback() {
  if (audio.paused) {
    audio.play();
    setPlayingUI(true);
  } else {
    audio.pause();
    setPlayingUI(false);
  }
}

audio.addEventListener("pause", () => setPlayingUI(false));
audio.addEventListener("ended", () => setPlayingUI(false));

function setPlayingUI(isPlaying) {
  playIcon.style.display = isPlaying ? "none" : "block";
  pauseIcon.style.display = isPlaying ? "block" : "none";
  meter.classList.toggle("playing", isPlaying);
}

// ---- guessing --------------------------------------------------------------
guessForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (gameOver) return;

  const guess = guessInput.value.trim();
  if (!guess) return;

  handleGuess(guess);
  guessInput.value = "";
});

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function handleGuess(guess) {
  const boxes = digitsEl.children;
  const box = boxes[attempt];
  const isCorrect = normalize(guess) === normalize(answer.title);

  clearTimeout(playTimeout);
  audio.pause();
  setPlayingUI(false);

  box.classList.remove("active");
  box.classList.add(isCorrect ? "correct" : "wrong", "pop");
  box.textContent = isCorrect ? "✓" : "✕";
  setTimeout(() => box.classList.remove("pop"), 200);

  attempt++;

  if (isCorrect) {
    endGame(true);
  } else if (attempt >= MAX_ATTEMPTS) {
    endGame(false);
  } else {
    clipLenLabel.textContent = CLIP_LENGTHS[attempt];
    if (boxes[attempt]) boxes[attempt].classList.add("active");
    showFeedback(`Not quite. Attempt ${attempt} of ${MAX_ATTEMPTS} — clip is now ${CLIP_LENGTHS[attempt]}s.`, "hint");
  }
}

function endGame(won) {
  gameOver = true;
  guessInput.disabled = true;
  guessForm.querySelector(".submit-btn").disabled = true;
  clipLenLabel.textContent = "full track";

  if (won) {
    showFeedback(`You got it — "${answer.title}" in ${attempt} ${attempt === 1 ? "try" : "tries"}. Tap play to hear it in full.`, "win");
  } else {
    showFeedback(`Out of spins. Today's song was "${answer.title}". Tap play to hear it in full.`, "lose");
  }
}

function showFeedback(msg, type) {
  feedback.textContent = msg;
  feedback.className = "feedback " + (type || "");
}

init();