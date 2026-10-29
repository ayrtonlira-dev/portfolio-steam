import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDialog } from "../hooks/useDialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
} from "./Icons";

export default function ImageLightbox({
  items,
  initialIndex = 0,
  title,
  onClose,
}) {
  const [index, setIndex] = useState(initialIndex);
  const closeButtonRef = useRef(null);
  const currentItem = items[index];
  const hasNavigation = items.length > 1;

  const { dialogRef, closeDialog, handleBackdropClick } = useDialog({
    onRequestClose: onClose,
    initialFocusRef: closeButtonRef,
  });

  const goToPrevious = () => {
    setIndex((current) => (current - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setIndex((current) => (current + 1) % items.length);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" && hasNavigation) {
        event.preventDefault();
        setIndex((current) => (current - 1 + items.length) % items.length);
      }
      if (event.key === "ArrowRight" && hasNavigation) {
        event.preventDefault();
        setIndex((current) => (current + 1) % items.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasNavigation, items.length]);

  if (!currentItem) return null;

  return createPortal(
    <dialog
      className="image-dialog"
      aria-labelledby="lightbox-caption"
      aria-modal="true"
      ref={dialogRef}
      onClick={handleBackdropClick}
    >
      <div
        className="lightbox-shell"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        <header className="lightbox-bar">
          <div className="lightbox-heading">
            <span className="mono-label">{title}</span>
            <span className="lightbox-count" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
          </div>
          <button
            className="lightbox-close"
            type="button"
            ref={closeButtonRef}
            onClick={closeDialog}
          >
            Fechar
            <CloseIcon />
          </button>
        </header>

        <div className="lightbox-body">
          {hasNavigation ? (
            <button
              className="lightbox-arrow lightbox-arrow--prev"
              type="button"
              onClick={goToPrevious}
              aria-label="Imagem anterior"
            >
              <ChevronLeftIcon />
            </button>
          ) : null}

          <figure className="lightbox-figure">
            <img
              key={currentItem.src}
              src={currentItem.src}
              alt={currentItem.alt}
              decoding="async"
            />
            <figcaption id="lightbox-caption" aria-live="polite">
              <strong>{currentItem.caption ?? title}</strong>
              {currentItem.description ? (
                <span>{currentItem.description}</span>
              ) : null}
            </figcaption>
          </figure>

          {hasNavigation ? (
            <button
              className="lightbox-arrow lightbox-arrow--next"
              type="button"
              onClick={goToNext}
              aria-label="Próxima imagem"
            >
              <ChevronRightIcon />
            </button>
          ) : null}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
