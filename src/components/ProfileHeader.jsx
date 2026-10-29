import { profile } from "../content";
import {
  CodeGlyphIcon,
  DownloadIcon,
  ExternalArrowIcon,
  PinIcon,
} from "./Icons";

function HeaderActions() {
  return (
    <div className="header-actions">
      <a
        className="button button--quiet"
        href={profile.resume}
        download={profile.resumeFileName}
      >
        <DownloadIcon />
        Baixar currículo
      </a>
      <a
        className="contact-link"
        href={`mailto:${profile.email}?subject=Contato%20pelo%20portf%C3%B3lio`}
      >
        Contato
        <ExternalArrowIcon />
      </a>
    </div>
  );
}

export default function ProfileHeader() {
  return (
    <header className="identity-bar" id="perfil">
      <div className="avatar-wrap">
        <span className="avatar-corner avatar-corner--tl" aria-hidden="true" />
        <span className="avatar-corner avatar-corner--br" aria-hidden="true" />
        <div className="avatar">
          <img
            src={profile.photo}
            alt={`Foto de ${profile.name}`}
            width="612"
            height="622"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>

      <div className="identity">
        <div className="name-row">
          <h1>{profile.name}</h1>
          <span className="handle">{profile.handle}</span>
        </div>
        <p className="identity-meta">
          <span className="icon-label">
            <PinIcon />
            {profile.location}
          </span>
          <span className="dot-separator" aria-hidden="true">
            ·
          </span>
          <span>Estudante de ADS</span>
        </p>
        <p className="availability-inline">
          <span className="live-dot" aria-hidden="true" />
          {profile.availability}
        </p>
      </div>

      <div className="summary">
        <div className="summary-intro">
          <div className="summary-kicker">
            <span className="dev-glyph" aria-hidden="true">
              <CodeGlyphIcon />
            </span>
            <span>Perfil profissional</span>
          </div>
          <h2 className="role">{profile.role}</h2>
          <p className="focus">{profile.focus}</p>
        </div>
        <HeaderActions />
      </div>

      <p className="bio">{profile.bio}</p>
    </header>
  );
}
