import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { profile } from "../content";
import { useDialog } from "../hooks/useDialog";
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  ExpandIcon,
  ExternalArrowIcon,
  GalleryIcon,
  LockIcon,
} from "./Icons";
import ImageLightbox from "./ImageLightbox";

function ProjectStatus({ status, className = "" }) {
  return (
    <span className={`status status--${status.tone} ${className}`.trim()}>
      <span className="status-dot" aria-hidden="true" />
      {status.label}
    </span>
  );
}

export default function ProjectModal({
  project,
  nextProject,
  onClose,
  onNextProject,
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const closeButtonRef = useRef(null);
  const titleRef = useRef(null);
  const infoScrollRef = useRef(null);
  const dialogGridRef = useRef(null);
  const previousProjectId = useRef(project.id);

  const { dialogRef, closeDialog, handleBackdropClick } = useDialog({
    onRequestClose: onClose,
    initialFocusRef: closeButtonRef,
  });

  const imageCount = project.images.length;
  // A troca de projeto pode ter menos capturas que o projeto anterior. O
  // fallback evita acessar uma imagem inexistente antes do reset do índice.
  const safeImageIndex = Math.min(imageIndex, Math.max(0, imageCount - 1));
  const selectedImage = project.images[safeImageIndex];
  const hasGalleryNavigation = imageCount > 1;

  const goToImage = (index) => {
    if (!imageCount) return;
    setImageIndex((index + imageCount) % imageCount);
  };

  const goToPreviousImage = () => goToImage(imageIndex - 1);
  const goToNextImage = () => goToImage(imageIndex + 1);

  useLayoutEffect(() => {
    setImageIndex(0);
    setLightboxIndex(null);
    infoScrollRef.current?.scrollTo({ top: 0 });
    dialogGridRef.current?.scrollTo({ top: 0 });

    if (previousProjectId.current !== project.id) {
      previousProjectId.current = project.id;
      requestAnimationFrame(() => {
        titleRef.current?.focus({ preventScroll: true });
      });
    }
  }, [project.id]);

  useEffect(() => {
    // As capturas mudam juntas quando a pessoa troca de projeto. O pré-carregamento
    // evita um clarão vazio na galeria em conexões mais lentas.
    for (const image of project.images) {
      const preload = new Image();
      preload.src = image.src;
    }
  }, [project.images]);

  const handleGalleryKeyDown = (event) => {
    if (!hasGalleryNavigation) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousImage();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextImage();
    }
    if (event.key === "Home") {
      event.preventDefault();
      goToImage(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goToImage(imageCount - 1);
    }
  };

  const hasLinks = project.links.length > 0;

  return createPortal(
    <>
      <dialog
        className="project-dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        ref={dialogRef}
        onClick={handleBackdropClick}
      >
        <header className="dialog-bar">
          <div className="dialog-id">
            <span className="mini-mark" aria-hidden="true" />
            <span className="dialog-brand">Ayrton Lira</span>
            <span className="slash" aria-hidden="true">
              /
            </span>
            <span className="dialog-context">Projetos</span>
            <span className="slash" aria-hidden="true">
              /
            </span>
            <strong>{project.title}</strong>
          </div>

          <div className="dialog-actions">
            <ProjectStatus status={project.status} />
            <button
              className="dialog-close"
              type="button"
              ref={closeButtonRef}
              onClick={closeDialog}
              aria-label="Fechar detalhes do projeto"
            >
              <span>Fechar</span>
              <kbd>Esc</kbd>
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="dialog-grid" ref={dialogGridRef}>
          <section
            className="gallery"
            aria-label={`Galeria de capturas de ${project.title}`}
            onKeyDown={handleGalleryKeyDown}
          >
            <div className="gallery-head">
              <div className="gallery-label">
                <GalleryIcon />
                <span>Galeria</span>
              </div>
              <div className="gallery-position" aria-hidden="true">
                <span>{String(safeImageIndex + 1).padStart(2, "0")}</span> /{" "}
                {String(imageCount).padStart(2, "0")}
              </div>
            </div>

            <figure className="gallery-stage">
              <img
                key={selectedImage.src}
                className="gallery-image"
                src={selectedImage.src}
                alt={selectedImage.alt}
                loading="eager"
                decoding="sync"
              />

              {hasGalleryNavigation ? (
                <>
                  <button
                    className="gallery-arrow gallery-arrow--prev"
                    type="button"
                    aria-label="Captura anterior"
                    onClick={goToPreviousImage}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    className="gallery-arrow gallery-arrow--next"
                    type="button"
                    aria-label="Próxima captura"
                    onClick={goToNextImage}
                  >
                    <ChevronRightIcon />
                  </button>
                </>
              ) : null}

              <button
                className="gallery-zoom"
                type="button"
                aria-label="Ampliar captura atual"
                onClick={() => setLightboxIndex(safeImageIndex)}
              >
                <ExpandIcon />
              </button>
            </figure>

            <div className="gallery-caption">
              <div>
                <strong>{selectedImage.caption}</strong>
                <span>{selectedImage.description}</span>
              </div>
              {hasGalleryNavigation ? (
                <span className="keyboard-hint">
                  Use ← → para navegar
                </span>
              ) : null}
            </div>
            <p className="sr-only" aria-live="polite">
              Captura {safeImageIndex + 1} de {imageCount}:{" "}
              {selectedImage.caption}
            </p>

            <div
              className="gallery-thumbs"
              role="group"
              aria-label="Escolher captura"
            >
              {project.images.map((image, index) => (
                <button
                  className={`gallery-thumb${index === safeImageIndex ? " is-active" : ""}`}
                  type="button"
                  key={image.src}
                  aria-label={`Ver ${image.caption}`}
                  aria-pressed={index === safeImageIndex}
                  onClick={() => setImageIndex(index)}
                >
                  <img src={image.thumb ?? image.src} alt="" loading="eager" />
                  <span>{image.caption}</span>
                </button>
              ))}
            </div>
          </section>

          <article className="project-info">
            <div className="info-scroll" ref={infoScrollRef}>
              <div className="info-kicker">
                <span>Projeto {project.number}</span>
                <span className="kicker-line" aria-hidden="true" />
                <span>{project.category}</span>
                <ProjectStatus
                  status={project.status}
                  className="info-status"
                />
              </div>

              <h2
                className="project-title"
                id="project-dialog-title"
                ref={titleRef}
                tabIndex="-1"
              >
                {project.title}
              </h2>
              <p className="project-tagline">{project.tagline}</p>
              <p className="project-summary">{project.summary}</p>

              <ul className="project-tech" aria-label="Tecnologias">
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>

              <section
                className="contribution-block"
                aria-labelledby="my-role-title"
              >
                <h3 id="my-role-title">
                  <span
                    className="block-marker block-marker--cyan"
                    aria-hidden="true"
                  />
                  {project.contribution.title}
                </h3>
                <ul className="role-list">
                  {project.contribution.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section
                className="other-contribution"
                aria-labelledby="other-contribution-title"
              >
                <h3 id="other-contribution-title">
                  <span
                    className="block-marker block-marker--violet"
                    aria-hidden="true"
                  />
                  {project.otherContribution.title}
                </h3>
                <p>{project.otherContribution.text}</p>
              </section>

              {project.implemented.length > 0 ? (
                <section
                  className="implemented-block"
                  aria-labelledby="implemented-title"
                >
                  <h3 id="implemented-title">Interações implementadas</h3>
                  <ul>
                    {project.implemented.map((item) => (
                      <li key={item}>
                        <CheckIcon />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div className="info-divider" aria-hidden="true" />

              <div className="project-links">
                {hasLinks
                  ? project.links.map((link) => (
                      <a
                        key={link.href}
                        className="project-site-link"
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer" : undefined}
                      >
                        {link.label}
                        <ExternalArrowIcon />
                      </a>
                    ))
                  : project.unavailableLink ? (
                      <span className="unavailable-link">
                        <LockIcon />
                        {project.unavailableLink}
                      </span>
                    ) : null}

                <a
                  className="project-contact-link"
                  href={`mailto:${profile.email}?subject=${encodeURIComponent(project.contactSubject)}`}
                >
                  Conversar sobre o projeto
                  <ExternalArrowIcon />
                </a>
              </div>
            </div>

            <footer className="project-footer">
              <span className="footer-note">
                A próxima entrada abre {nextProject.title}.
              </span>
              <button
                className="next-project"
                type="button"
                onClick={onNextProject}
              >
                <span>
                  <small>Próximo projeto</small>
                  {nextProject.title}
                </span>
                <ArrowRightIcon />
              </button>
            </footer>
          </article>
        </div>
      </dialog>

      {lightboxIndex !== null ? (
        <ImageLightbox
          items={project.images}
          initialIndex={lightboxIndex}
          title={project.title}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>,
    document.body,
  );
}
