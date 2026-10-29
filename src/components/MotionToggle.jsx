import { useId } from "react";
import { MotionWavesIcon } from "./Icons";

export default function MotionToggle({ enabled, onToggle, className = "" }) {
  const descriptionId = useId();

  return (
    <div className={`motion-toggle-wrap ${className}`.trim()}>
      <button
        className="motion-toggle"
        type="button"
        aria-pressed={enabled}
        aria-describedby={descriptionId}
        onClick={onToggle}
      >
        <span className="motion-toggle-label">
          <MotionWavesIcon />
          Animações: {enabled ? "ligadas" : "desligadas"}
        </span>
        <span className="motion-switch" aria-hidden="true">
          <span />
        </span>
      </button>
      <p className="sr-only" id={descriptionId}>
        Controla a chuva pixelada no fundo, além dos efeitos animados na
        estação de trabalho. A preferência fica salva neste navegador.
      </p>
    </div>
  );
}
