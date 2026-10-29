import { art } from "../content";
import { ExpandIcon } from "./Icons";
import MotionToggle from "./MotionToggle";

export default function Showcase({ onExpandArt, motionsEnabled, onToggleMotion }) {
  return (
    <section className="showcase" aria-labelledby="showcase-title">
      <div className="panel-bar">
        <div className="panel-bar-title">
          <span className="pixel-mark" aria-hidden="true" />
          <span className="mono-label">Vitrine</span>
          <span className="bar-divider" aria-hidden="true" />
          <h2 id="showcase-title">Estação de trabalho</h2>
        </div>
        <span className="panel-meta"> Hesitation is defeat</span>
        <button
          className="expand-art-button mobile-only"
          type="button"
          aria-label="Ampliar a ilustração da estação de trabalho"
          onClick={onExpandArt}
        >
          <ExpandIcon />
        </button>
      </div>

      <MotionToggle
        className="showcase-motion mobile-only"
        enabled={motionsEnabled}
        onToggle={onToggleMotion}
      />

      <figure className="showcase-media">
        <div className="showcase-scene">
        <img
          src={art.room}
          alt="Quarto gamer em pixel art à noite: dois monitores, um com o símbolo do React e outro com uma interface de código, além de adesivo JS no computador e chuva na janela."
          width="760"
          height="300"
          decoding="async"
          fetchPriority="high"
        />
        <span className="rain-layer" aria-hidden="true" />
        <span className="screen-cursor" aria-hidden="true" />
        <span className="screen-glow" aria-hidden="true" />
        </div>
        <figcaption className="sr-only">
          Ilustração conceitual da estação de desenvolvimento do portfólio.
        </figcaption>
      </figure>
    </section>
  );
}
