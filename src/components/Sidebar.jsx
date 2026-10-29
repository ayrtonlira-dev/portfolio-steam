import { profile } from "../content";
import { navigationItems } from "../navigation";
import {
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
} from "./Icons";
import MotionToggle from "./MotionToggle";
import { DesktopTechList } from "./TechLists";

export default function Sidebar({
  activeSection,
  motionsEnabled,
  onToggleMotion,
}) {
  return (
    <aside className="sidebar desktop-only" aria-label="Informações e atalhos">
      <section className="availability">
        <span className="mono-label">Disponibilidade</span>
        <p className="availability-title">
          <span className="live-dot" aria-hidden="true" />
          {profile.availability}
        </p>
        <p className="availability-text">{profile.availabilityText}</p>
      </section>

      <div className="sidebar-motion">
        <MotionToggle enabled={motionsEnabled} onToggle={onToggleMotion} />
      </div>

      <nav className="local-nav" aria-label="Navegação do perfil">
        <span className="mono-label">Neste perfil</span>
        <ul>
          {navigationItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={
                  activeSection === item.id ? "location" : undefined
                }
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section className="sidebar-tech" aria-labelledby="sidebar-tech-title">
        <span className="mono-label" id="sidebar-tech-title">
          Tecnologias
        </span>
        <DesktopTechList />
      </section>

      <section className="connections" aria-labelledby="connections-title">
        <span className="mono-label" id="connections-title">
          Conectar
        </span>
        <div className="connection-grid">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub de Ayrton Lira"
          >
            <GitHubIcon />
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn de Ayrton Lira"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Enviar e-mail">
            <MailIcon />
            E-mail
          </a>
          <a
            href={profile.resume}
            download={profile.resumeFileName}
            aria-label="Baixar currículo em PDF"
          >
            <DownloadIcon />
            Currículo
          </a>
        </div>
      </section>

    </aside>
  );
}
