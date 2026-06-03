import { useRef, useEffect, useCallback } from "react";

const NODOS_POR_CAPA = [4, 6, 5, 3];
const RADIO_NODO = 8;

export default function NeuralNetwork({ isListening, isSpeaking, isThinking }) {
  const canvasRef = useRef();
  const animRef = useRef();
  const nodosRef = useRef([]);
  const conexionesRef = useRef([]);
  const speakingRef = useRef(false);
  const listeningRef = useRef(false);
  const thinkingRef = useRef(false);

  speakingRef.current = isSpeaking;
  listeningRef.current = isListening;
  thinkingRef.current = isThinking;

  const initRed = useCallback((width, height) => {
    const padX = width * 0.1;
    const padY = height * 0.12;
    const espX = (width - padX * 2) / (NODOS_POR_CAPA.length - 1);
    const nodos = [];
    const conexiones = [];

    NODOS_POR_CAPA.forEach((num, i) => {
      const x = padX + i * espX;
      const espY = (height - padY * 2) / (num + 1);
      for (let j = 0; j < num; j++) {
        nodos.push({
          x, y: padY + (j + 1) * espY,
          capa: i, indice: j,
          fase: Math.random() * Math.PI * 2,
          vel: 0.3 + Math.random() * 0.4,
        });
      }
    });

    nodos.forEach((na, a) => {
      nodos.forEach((nb, b) => {
        if (nb.capa === na.capa + 1) conexiones.push({ a, b });
      });
    });

    nodosRef.current = nodos;
    conexionesRef.current = conexiones;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let activo = true;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      canvas._w = w;
      canvas._h = h;
      initRed(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    const dibujar = (t) => {
      if (!activo) return;
      const w = canvas._w;
      const h = canvas._h;
      if (!w || !h) {
        animRef.current = requestAnimationFrame(dibujar);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const sp = speakingRef.current;
      const li = listeningRef.current;
      const th = thinkingRef.current;
      const act = sp ? 1 : li ? 0.6 : th ? 0.3 : 0;
      const pulso = Math.sin(t * 0.003) * 0.5 + 0.5;

      const nodos = nodosRef.current;
      const conexiones = conexionesRef.current;

      // Conexiones — colores más fuertes para verse en fondo claro
      for (const { a, b } of conexiones) {
        const na = nodos[a];
        const nb = nodos[b];
        if (!na || !nb) continue;
        const va = act > 0 ? Math.sin(t * 0.005 - a * 0.3) * 0.5 + 0.5 : 0.3 + pulso * 0.4;
        const alpha = act > 0 ? 0.3 + va * 0.5 : 0.15 + pulso * 0.15;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = `rgba(70,130,180,${alpha})`;
        ctx.lineWidth = act > 0 ? 1 + va * 0.5 : 0.8;
        ctx.stroke();

        if (act > 0.2) {
          const flujo = (t * 0.002 + a * 0.1) % 1;
          ctx.beginPath();
          ctx.arc(na.x + (nb.x - na.x) * flujo, na.y + (nb.y - na.y) * flujo, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(70,130,180,${0.5 + va * 0.4})`;
          ctx.fill();
        }
      }

      // Nodos — más grandes y oscuros
      for (const nodo of nodos) {
        const onda = act > 0
          ? Math.sin(t * 0.008 - nodo.fase) * act * 3
          : Math.sin(t * 0.001 + nodo.fase) * 0.4;
        const r = RADIO_NODO + onda * 0.6;

        // Glow exterior
        const grad = ctx.createRadialGradient(nodo.x, nodo.y, 0, nodo.x, nodo.y, r * 4);
        grad.addColorStop(0, act > 0
          ? `rgba(70,130,180,${0.2 + act * 0.3})`
          : "rgba(70,130,180,0.08)");
        grad.addColorStop(1, "rgba(70,130,180,0)");
        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Círculo exterior
        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = act > 0
          ? `rgba(70,130,180,${0.6 + act * 0.4})`
          : "rgba(70,130,180,0.35)";
        ctx.lineWidth = act > 0 ? 1.8 : 1.2;
        ctx.stroke();

        // Relleno
        ctx.beginPath();
        ctx.arc(nodo.x, nodo.y, r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = act > 0
          ? `rgba(135,206,235,${0.4 + act * 0.4})`
          : "rgba(135,206,235,0.3)";
        ctx.fill();

        // Centro blanco
        if (act > 0.3) {
          ctx.beginPath();
          ctx.arc(nodo.x, nodo.y, r * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
        }
      }

      // Ondas expansivas cuando habla
      if (sp) {
        for (let i = 0; i < 3; i++) {
          const fase = (t * 0.003 + i * 0.33) % 1;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, fase * Math.min(w, h) * 0.35, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(70,130,180,${(1 - fase) * 0.15})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(dibujar);
    };

    animRef.current = requestAnimationFrame(dibujar);

    return () => {
      activo = false;
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [initRed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
