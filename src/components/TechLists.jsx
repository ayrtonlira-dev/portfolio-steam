import { useEffect, useState } from "react";
import { technologies } from "../content";
import { TechGlyph } from "./Icons";

function techTypeIcon(icon) {
  return <TechGlyph icon={icon} />;
}

function TechIcon({ tech }) {
  return (
    <span
      className={`tech-icon tech-icon--${tech.icon}`}
      aria-hidden="true"
    >
      {techTypeIcon(tech.icon)}
    </span>
  );
}

export function DesktopTechList() {
  const [openTechId, setOpenTechId] = useState(null);

  useEffect(() => {
    if (!openTechId) return undefined;

    const handlePointerDown = (event) => {
      if (!event.target.closest(".tech-list")) setOpenTechId(null);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpenTechId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openTechId]);

  return (
    <ul className="tech-list">
      {technologies.map((tech) => {
        const isOpen = openTechId === tech.id;
        const descriptionId = `tech-desc-${tech.id}`;
        const popoverId = `tech-popover-${tech.id}`;

        return (
          <li
            className={`tech-item${isOpen ? " is-open" : ""}`}
            key={tech.id}
          >
            <button
              className="tech-chip"
              type="button"
              aria-describedby={descriptionId}
              aria-controls={popoverId}
              onClick={() =>
                setOpenTechId((current) =>
                  current === tech.id ? null : tech.id,
                )
              }
            >
              <TechIcon tech={tech} />
              {tech.name}
            </button>
            <span className="sr-only" id={descriptionId}>
              {tech.context}
            </span>
            <span
              className="tech-popover"
              id={popoverId}
              aria-hidden="true"
            >
              {tech.context}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function MobileTechList() {
  return (
    <ul className="mobile-tech-list">
      {technologies.map((tech) => (
        <li key={tech.id}>
          <div className="mobile-tech-card">
            <TechIcon tech={tech} />
            <span className="mobile-tech-copy">
              <strong>{tech.name}</strong>
              <small>{tech.shortContext ?? tech.context}</small>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
