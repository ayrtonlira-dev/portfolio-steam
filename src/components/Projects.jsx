import { projects } from "../content";
import { ExternalArrowIcon } from "./Icons";

function ProjectStatus({ status, className = "" }) {
  return (
    <span className={`status status--${status.tone} ${className}`.trim()}>
      <span className="status-dot" aria-hidden="true" />
      {status.label}
    </span>
  );
}

export default function Projects({ onOpenProject }) {
  return (
    <section
      className="projects"
      id="projetos"
      aria-labelledby="projects-title"
      tabIndex="-1"
    >
      <div className="section-heading">
        <div>
          <span className="mono-label">Biblioteca</span>
          <h2 id="projects-title">Projetos</h2>
        </div>
      </div>

      <ol className="project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              className="project-row"
              type="button"
              aria-haspopup="dialog"
              aria-label={`${project.title}, ${project.status.label}. ${project.cardDescription} Abrir detalhes do projeto.`}
              onClick={() => onOpenProject(project.id)}
            >
              <span className="project-thumb">
                <img
                  src={project.thumbnail}
                  alt=""
                  width="360"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
              </span>

              <span className="project-copy">
                <span className="project-heading">
                  <strong>{project.title}</strong>
                  <ProjectStatus status={project.status} />
                </span>
                <span className="project-mobile-meta">
                  <span className="project-mobile-status">
                    <span
                      className={`mobile-status-dot mobile-status-dot--${project.status.tone}`}
                      aria-hidden="true"
                    />
                    {project.status.label}
                  </span>
                  <span className="project-mobile-tech">
                    {project.cardTech}
                  </span>
                </span>
                <span className="project-description">
                  {project.cardDescription}
                </span>
                <span className="project-tags">
                  {project.technologies.join(" · ")}
                </span>
              </span>

              <span className="row-arrow" aria-hidden="true">
                <ExternalArrowIcon />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
