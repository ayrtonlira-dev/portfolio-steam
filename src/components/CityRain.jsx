import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export default function CityRain({ enabled }) {
  const canvasRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || reducedMotion || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let leftEdge = 0;
    let rightEdge = 0;
    let drops = [];
    let frame = 0;
    let previousTime = 0;
    const shell = document.querySelector(".profile-shell");

    const randomX = () => {
      const available = leftEdge + width - rightEdge;
      const position = Math.random() * available;
      return position < leftEdge ? position : rightEdge + position - leftEdge;
    };

    const resize = () => {
      // A low-resolution canvas keeps the rain on the same pixel grid as the art.
      width = Math.ceil(window.innerWidth / 2);
      height = Math.ceil(window.innerHeight / 2);
      canvas.width = width;
      canvas.height = height;
      const bounds = shell?.getBoundingClientRect();
      leftEdge = Math.max(0, (bounds?.left ?? 0) / 2 - 6);
      rightEdge = Math.min(width, (bounds?.right ?? window.innerWidth) / 2 + 6);
      const visibleWidth = leftEdge + width - rightEdge;
      const count = visibleWidth < 24 ? 0 : Math.min(100, Math.round(visibleWidth * height / 2300));
      drops = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: randomX(), y: Math.random() * height,
          speed: 70 + depth * 105, length: 2 + Math.floor(depth * 4),
          alpha: 0.12 + depth * 0.22, phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      if (time - previousTime < 1000 / 30) return;
      const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.08) : 0;
      previousTime = time;
      context.clearRect(0, 0, width, height);
      for (const drop of drops) {
        drop.y += drop.speed * dt;
        drop.x -= (8 + Math.sin(time / 6000 + drop.phase) * 4) * dt;
        if (drop.y > height + 10 || drop.x < -4 ||
            (drop.x >= leftEdge && drop.x <= rightEdge)) {
          drop.x = randomX();
          drop.y = -10 - Math.random() * 30;
        }
        const x = Math.round(drop.x);
        const y = Math.round(drop.y);
        const fade = Math.min(1, Math.max(0, drop.y / 32)) *
          Math.min(1, Math.max(0, (height - drop.y) / 45));
        context.fillStyle = `rgba(157, 186, 200, ${drop.alpha * fade})`;
        context.fillRect(x, y, 1, 2);
        context.fillStyle = `rgba(126, 160, 180, ${drop.alpha * fade * 0.45})`;
        context.fillRect(x + 1, y - drop.length, 1, drop.length);
      }
    };

    const updateVisibility = () => {
      cancelAnimationFrame(frame);
      previousTime = 0;
      if (!document.hidden && drops.length) frame = requestAnimationFrame(draw);
    };
    const handleResize = () => { resize(); updateVisibility(); };
    const observer = new ResizeObserver(handleResize);
    if (shell) observer.observe(shell);
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", updateVisibility);
    handleResize();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", updateVisibility);
      context.clearRect(0, 0, width, height);
    };
  }, [enabled, reducedMotion]);

  return <canvas ref={canvasRef} className="city-rain" aria-hidden="true" />;
}
