import { useState, useRef, useEffect, useCallback } from "react";
import NeuralNetwork from "../WendyHologram";
import { speak, stopVoiceRecognition } from "../../services/speechService";
import { sendMessage } from "../../services/chatService";
import { getSocket } from "../../services/socketService";

export default function WendyWidget({ onProductsUpdate, onShowRegister, onGuidanceUpdate, hasStarted }) {
  // "welcome" = centro de pantalla, "floating" = burbuja abajo derecha
  const [mode, setMode] = useState("welcome");
  const [minimized, setMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);
  const [bubblePop, setBubblePop] = useState(false);
  const greetedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setHasVoiceSupport(false);
  }, []);

  // Auto-saludo al cargar Wendy
  useEffect(() => {
    if (greetedRef.current) return;
    greetedRef.current = true;
    const t = setTimeout(async () => {
      setIsSpeaking(true);
      const saludo = "¡Hola! Soy Wendy, tu asistente personal. Cuéntame, ¿para qué necesitas la laptop? Puedo ayudarte con oficina, programación, gaming, diseño o inteligencia artificial.";
      await speak(saludo);
      setIsSpeaking(false);
      setBubblePop(true);
      setTimeout(() => setBubblePop(false), 2500);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Si el padre ya tenía productos antes de cargar Wendy, salta a floating
  useEffect(() => {
    if (hasStarted && mode === "welcome") {
      setMode("floating");
    }
  }, [hasStarted, mode]);

  const handleProductsFromReply = useCallback((productos, reply, estado) => {
    if (productos && productos.length > 0) {
      onProductsUpdate?.(productos);
      const socket = getSocket();
      socket?.emit("products:update", productos);
      // Salir del modo welcome automáticamente para que se vean los productos
      setMode(prev => prev === "welcome" ? "floating" : prev);
    }
    // Si Wendy dice que se debe abrir el registro, abrir inmediatamente
    if (estado?.requiere_registro === true || estado?.paso === "abrir_registro" ||
        estado?.paso === "registro_completado") {
      setTimeout(() => onShowRegister?.(), 600);
    }
    setBubblePop(true);
    setTimeout(() => setBubblePop(false), 2000);
  }, [onProductsUpdate, onShowRegister]);

  const processVoice = useCallback(async (text) => {
    setIsThinking(true);
    setIsListening(false);
    try {
      const { reply, intent, estado, productos, pregunta_guia, recomendado_id } = await sendMessage(text);
      setIsThinking(false);

      // Si hay productos: PRIMERO mostrarlos, DESPUÉS hablar
      if (productos && productos.length > 0) {
        onProductsUpdate?.(productos, recomendado_id);
        if (pregunta_guia) onGuidanceUpdate?.(pregunta_guia);
        setMode(prev => prev === "welcome" ? "floating" : prev);
        await new Promise(r => setTimeout(r, 900));
        setIsSpeaking(true);
        setBubblePop(true);
        await speak(reply);
        setIsSpeaking(false);
        setBubblePop(false);
      } else {
        setIsSpeaking(true);
        setBubblePop(true);
        await speak(reply);
        setIsSpeaking(false);
        setBubblePop(false);
        handleProductsFromReply(productos, reply, estado);
      }
    } catch {
      setIsSpeaking(false);
    }
  }, [handleProductsFromReply, onGuidanceUpdate]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    stopVoiceRecognition();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    setVoiceError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setHasVoiceSupport(false); setVoiceError("Usa Chrome o Edge"); return; }
    stopListening();
    isListeningRef.current = true;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-PE";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    let finalTranscript = "";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
      }
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed") setVoiceError("Permiso denegado");
      isListeningRef.current = false;
      setIsListening(false);
    };
    recognition.onend = () => {
      if (isListeningRef.current && finalTranscript.trim()) {
        isListeningRef.current = false;
        setIsListening(false);
        processVoice(finalTranscript.trim());
      } else {
        isListeningRef.current = false;
        setIsListening(false);
      }
    };
    try { recognition.start(); } catch (e) { setVoiceError("Error al iniciar"); }
  }, [processVoice, stopListening]);

  const handleMicClick = () => {
    if (isListeningRef.current) stopListening();
    else startListening();
  };

  const handleSendText = async (e) => {
    e?.preventDefault?.();
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    setIsThinking(true);
    setIsListening(false);
    try {
      const { reply, intent, estado, productos, pregunta_guia, recomendado_id } = await sendMessage(text);
      setIsThinking(false);

      // Si hay productos: PRIMERO mostrarlos, DESPUÉS hablar
      if (productos && productos.length > 0) {
        onProductsUpdate?.(productos, recomendado_id);
        if (pregunta_guia) onGuidanceUpdate?.(pregunta_guia);
        setMode(prev => prev === "welcome" ? "floating" : prev);
        await new Promise(r => setTimeout(r, 900));
        setIsSpeaking(true);
        setBubblePop(true);
        await speak(reply);
        setIsSpeaking(false);
        setBubblePop(false);
      } else {
        setIsSpeaking(true);
        setBubblePop(true);
        await speak(reply);
        setIsSpeaking(false);
        setBubblePop(false);
        handleProductsFromReply(productos, reply, estado);
      }
    } catch {
      setIsSpeaking(false);
    }
  };

  const handleDismissWelcome = () => {
    setMode("floating");
  };

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      stopVoiceRecognition();
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} }
    };
  }, []);

  const statusText = isListening ? "Escuchando..." : isSpeaking ? "Hablando..." : isThinking ? "Pensando..." : "En línea";

  // ─── MODO WELCOME (CENTRADO, PRIMER PLANO) ──────────────────────────────
  if (mode === "welcome") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 150,
        background: "linear-gradient(135deg, rgba(240,248,255,0.4) 0%, rgba(214,236,248,0.5) 100%)",
        backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.6s ease",
      }}>
        <div style={{
          width: 420, maxWidth: "calc(100vw - 32px)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderRadius: 24,
          border: "1px solid rgba(135,206,235,0.3)",
          boxShadow: "0 20px 60px rgba(70,130,180,0.2)",
          overflow: "hidden",
          animation: "slideUp 0.6s ease",
        }}>
          {/* Header con gradiente */}
          <div style={{
            background: "linear-gradient(135deg, rgba(135,206,235,0.25), rgba(176,224,255,0.4))",
            padding: "20px 24px 12px",
            borderBottom: "1px solid rgba(135,206,235,0.2)",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "linear-gradient(135deg, #87CEEB, #4682B4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 700, color: "#FFF",
                boxShadow: "0 4px 12px rgba(135,206,235,0.4)",
              }}>W</div>
              <div>
                <div style={{ color: "#446688", fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>Wendy</div>
                <div style={{
                  color: isSpeaking ? "#4682B4" : "#88AACC",
                  fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                  fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {isSpeaking && <span style={{
                    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                    background: "#4682B4",
                    animation: "pulse 1.2s ease-in-out infinite",
                  }} />}
                  {statusText}
                </div>
              </div>
            </div>
            <button onClick={handleDismissWelcome}
              title="Minimizar"
              style={{
                background: "rgba(255,255,255,0.6)", border: "1px solid rgba(135,206,235,0.3)",
                borderRadius: 8, cursor: "pointer",
                color: "#88AACC", fontSize: 16, padding: "4px 10px",
                lineHeight: 1,
              }}>×</button>
          </div>

          {/* Red Neuronal */}
          <div style={{ width: "100%", height: 220, position: "relative" }}>
            <NeuralNetwork isListening={isListening} isSpeaking={isSpeaking} isThinking={isThinking} />
          </div>

          {/* Subtítulo */}
          <div style={{
            padding: "0 24px 4px",
            textAlign: "center",
            color: "#88AACC",
            fontSize: 12, letterSpacing: 0.5,
          }}>
            {isSpeaking
              ? "Wendy te está hablando..."
              : isListening
                ? "Te estoy escuchando..."
                : isThinking
                  ? "Buscando las mejores opciones..."
                  : "Dime, ¿en qué te puedo ayudar?"}
          </div>

          {/* Input */}
          <form onSubmit={handleSendText}
            style={{
              display: "flex", gap: 8, padding: "16px 20px 20px",
              alignItems: "center",
            }}
          >
            <button type="button" onClick={handleMicClick}
              disabled={isSpeaking || isThinking || !hasVoiceSupport}
              style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: isListening
                  ? "linear-gradient(135deg, #4682B4, #5F9EA0)"
                  : "linear-gradient(135deg, #87CEEB, #B0E0FF)",
                border: "none",
                cursor: isSpeaking || isThinking || !hasVoiceSupport ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isListening ? "0 0 0 6px rgba(70,130,180,0.2)" : "0 2px 8px rgba(135,206,235,0.2)",
                transition: "all 0.2s",
                animation: isListening ? "pulse 1.2s ease-in-out infinite" : "none",
              }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
            <input
              type="text" value={inputText} onChange={e => setInputText(e.target.value)}
              placeholder={isSpeaking ? "Wendy está hablando..." : "Cuéntame qué necesitas..."}
              disabled={isSpeaking || isThinking}
              style={{
                flex: 1, padding: "12px 16px", fontSize: 14,
                border: "1px solid rgba(135,206,235,0.25)",
                borderRadius: 24, outline: "none",
                background: "rgba(255,255,255,0.9)", color: "#446688",
              }}
              onFocus={e => e.target.style.borderColor = "#4682B4"}
              onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.25)"}
            />
            <button type="submit" disabled={!inputText.trim() || isSpeaking || isThinking}
              style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: !inputText.trim() || isSpeaking || isThinking
                  ? "rgba(135,206,235,0.3)"
                  : "linear-gradient(135deg, #87CEEB, #4682B4)",
                border: "none",
                cursor: !inputText.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: !inputText.trim() ? "none" : "0 2px 8px rgba(135,206,235,0.3)",
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>

          {voiceError && (
            <div style={{ padding: "0 24px 16px", fontSize: 11, color: "#E07070", textAlign: "center" }}>
              {voiceError}
            </div>
          )}

          {/* Hint de registro */}
          <div style={{
            padding: "10px 20px 16px",
            borderTop: "1px solid rgba(135,206,235,0.1)",
            textAlign: "center",
            fontSize: 11, color: "#88AACC",
          }}>
            💡 Para acceder a <strong style={{ color: "#4682B4" }}>promociones exclusivas</strong>, regístrate al final de la conversación.
          </div>
        </div>
      </div>
    );
  }

  // ─── MODO FLOATING (BURBUJA) ────────────────────────────────────────────
  if (minimized) {
    return (
      <div onClick={() => setMinimized(false)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 200,
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg, #87CEEB, #4682B4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", userSelect: "none",
          boxShadow: bubblePop
            ? "0 8px 30px rgba(135,206,235,0.6)"
            : "0 6px 20px rgba(135,206,235,0.4)",
          transition: "all 0.3s",
          animation: bubblePop ? "pulseGlow 1.2s ease-in-out infinite" : "none",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 10v6m11-11h-6m-10 0H1m17.07-7.07l-4.24 4.24m-7.07 7.07l-4.24 4.24m0-15.55l4.24 4.24m7.07 7.07l4.24 4.24" />
        </svg>
        <div style={{
          position: "absolute", right: 74, top: "50%", transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.95)", color: "#446688",
          padding: "6px 12px", borderRadius: 20, whiteSpace: "nowrap",
          fontSize: 12, fontWeight: 600,
          boxShadow: "0 2px 12px rgba(135,206,235,0.2)",
          border: "1px solid rgba(135,206,235,0.3)",
        }}>Hablar con Wendy</div>
      </div>
    );
  }

  // ─── MODO FLOATING EXPANDIDO ────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      width: 340, maxWidth: "calc(100vw - 32px)",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderRadius: 20,
      border: "1px solid rgba(135,206,235,0.3)",
      boxShadow: "0 12px 40px rgba(70,130,180,0.2)",
      overflow: "hidden",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px",
        background: "linear-gradient(135deg, rgba(135,206,235,0.2), rgba(176,224,255,0.3))",
        borderBottom: "1px solid rgba(135,206,235,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #87CEEB, #4682B4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#FFF",
          }}>W</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#446688" }}>Wendy</div>
            <div style={{ fontSize: 9, color: "#88AACC", letterSpacing: 1, textTransform: "uppercase" }}>{statusText}</div>
          </div>
        </div>
        <button onClick={() => setMinimized(true)} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#88AACC", fontSize: 18, padding: 4, lineHeight: 1,
        }}>−</button>
      </div>

      <div style={{ width: "100%", height: 140, position: "relative" }}>
        <NeuralNetwork isListening={isListening} isSpeaking={isSpeaking} isThinking={isThinking} />
      </div>

      <form onSubmit={handleSendText}
        style={{ display: "flex", gap: 6, padding: 10, borderTop: "1px solid rgba(135,206,235,0.15)" }}
      >
        <button type="button" onClick={handleMicClick}
          disabled={isSpeaking || isThinking || !hasVoiceSupport}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: isListening
              ? "linear-gradient(135deg, #4682B4, #5F9EA0)"
              : "linear-gradient(135deg, #87CEEB, #B0E0FF)",
            border: "none", cursor: "pointer", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: isListening ? "pulse 1.2s ease-in-out infinite" : "none",
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>
        <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
          placeholder={isSpeaking ? "Wendy está hablando..." : "Escribe o usa el micrófono..."}
          disabled={isSpeaking || isThinking}
          style={{
            flex: 1, padding: "0 12px", fontSize: 13,
            border: "1px solid rgba(135,206,235,0.25)",
            borderRadius: 18, outline: "none",
            background: "rgba(255,255,255,0.8)", color: "#446688",
          }}
          onFocus={e => e.target.style.borderColor = "#4682B4"}
          onBlur={e => e.target.style.borderColor = "rgba(135,206,235,0.25)"}
        />
        <button type="submit" disabled={!inputText.trim() || isSpeaking || isThinking}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: !inputText.trim() || isSpeaking || isThinking
              ? "rgba(135,206,235,0.3)"
              : "linear-gradient(135deg, #87CEEB, #4682B4)",
            border: "none", cursor: !inputText.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {voiceError && (
        <div style={{ padding: "0 12px 8px", fontSize: 11, color: "#E07070", textAlign: "center" }}>{voiceError}</div>
      )}

      <div style={{ padding: "0 10px 10px", borderTop: "1px solid rgba(135,206,235,0.1)", paddingTop: 8 }}>
        <button onClick={() => onShowRegister?.()}
          style={{
            width: "100%", padding: "8px", fontSize: 11, fontWeight: 600,
            background: "transparent", color: "#4682B4",
            border: "1px solid rgba(70,130,180,0.3)",
            borderRadius: 8, cursor: "pointer", letterSpacing: 0.5,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(135,206,235,0.1)"; }}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >Registrarme para promociones</button>
      </div>
    </div>
  );
}
