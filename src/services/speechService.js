// =============================================================================
//  Wendy AI — Speech Service
//  1) Intenta Azure Neural TTS (voz peruana natural) via /api/tts
//  2) Si no está disponible, fallback a Web Speech API del navegador
// =============================================================================

const API_URL = import.meta.env.VITE_API_URL || "";
const audioCache = new Map();
let currentAudio = null;
let currentUtterance = null;

function limpiarTexto(texto) {
  return texto
    .replace(/[*#🎉💻😊🤔👋✅]/g, "")
    .replace(/\{PRODUCTOS:[^}]+\}/g, "")
    .replace(/\{CATEGORIA:\w+\}/g, "")
    .trim();
}

function stopAzure() {
  if (currentAudio) {
    try { currentAudio.pause(); } catch {}
    if (currentAudio.src && currentAudio.src.startsWith("blob:")) {
      try { URL.revokeObjectURL(currentAudio.src); } catch {}
    }
    currentAudio = null;
  }
}

function stopBrowser() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function stopSpeaking() {
  stopAzure();
  stopBrowser();
}

// ── Azure TTS (voz neural) ──────────────────────────────────────────────────
async function speakAzure(text) {
  if (audioCache.has(text)) {
    return new Promise((resolve) => {
      const url = audioCache.get(text);
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => { if (currentAudio === audio) currentAudio = null; resolve(); };
      audio.onerror = () => { if (currentAudio === audio) currentAudio = null; resolve(); };
      audio.play().catch(() => resolve());
    });
  }
  try {
    const response = await fetch(`${API_URL}/api/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("TTS " + response.status);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    audioCache.set(text, url);
    return new Promise((resolve) => {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => { if (currentAudio === audio) currentAudio = null; resolve(); };
      audio.onerror = () => { if (currentAudio === audio) currentAudio = null; resolve(); };
      audio.play().catch(() => resolve());
    });
  } catch {
    return null;
  }
}

// ── Web Speech API (fallback) ───────────────────────────────────────────────
function speakBrowser(text) {
  if (!window.speechSynthesis) return Promise.resolve();
  window.speechSynthesis.cancel();
  const cleaned = limpiarTexto(text);
  if (!cleaned) return Promise.resolve();
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = "es-PE";
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  utterance.volume = 1;
  // Preferir voces de mejor calidad
  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(v =>
    v.lang.startsWith("es") &&
    (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Natural"))
  ) || voices.find(v => v.lang.startsWith("es"));
  if (esVoice) utterance.voice = esVoice;
  currentUtterance = utterance;
  return new Promise((resolve) => {
    utterance.onend = () => { currentUtterance = null; resolve(); };
    utterance.onerror = () => { currentUtterance = null; resolve(); };
    window.speechSynthesis.speak(utterance);
  });
}

// ── Función principal ──────────────────────────────────────────────────────
let azureAvailable = null;

async function checkAzureAvailable() {
  if (azureAvailable !== null) return azureAvailable;
  try {
    const r = await fetch(`${API_URL}/api/wendy-config`);
    if (r.ok) {
      const cfg = await r.json();
      azureAvailable = !!(cfg?.tts?.available);
      return azureAvailable;
    }
  } catch {}
  azureAvailable = false;
  return false;
}

export async function speak(text) {
  stopSpeaking();
  const cleaned = limpiarTexto(text);
  if (!cleaned) return;

  // Intentar Azure primero
  const useAzure = await checkAzureAvailable();
  if (useAzure) {
    const result = await speakAzure(cleaned);
    if (result !== null) return; // éxito
  }
  // Fallback a Web Speech
  return speakBrowser(cleaned);
}

// ── Reconocimiento de voz (solo Web Speech) ──────────────────────────────────
let recognitionInstance = null;

export function startVoiceRecognition(onResult, onEnd, continuous = false) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  stopVoiceRecognition();
  const recognition = new SpeechRecognition();
  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.lang = "es-PE";

  let finalTranscript = "";
  let silenceTimer = null;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += t + " ";
      else interim += t;
    }
    if (finalTranscript.trim()) {
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        const text = finalTranscript.trim().toLowerCase();
        if (text) {
          finalTranscript = "";
          onResult(text);
        }
      }, 1200);
    }
    if (onEnd) onEnd(interim || finalTranscript);
  };

  recognition.onerror = () => { try { recognition.start(); } catch {} };
  recognition.onend = () => { if (continuous) try { recognition.start(); } catch {} };

  try { recognition.start(); } catch {}
  recognitionInstance = recognition;
  return recognition;
}

export function stopVoiceRecognition() {
  if (recognitionInstance) {
    try { recognitionInstance.stop(); } catch {}
    recognitionInstance = null;
  }
}

export function isVoiceSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
