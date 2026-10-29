import { profile, recentActivity } from "../content";

export default function About() {
  return (
    <section className="about-section" id="sobre" aria-labelledby="about-title">
      <div className="section-heading">
        <div>
          <span className="mono-label">Informações</span>
          <h2 id="about-title">Sobre</h2>
        </div>
      </div>

      <div className="about-content">
        <p className="about-lead">{profile.aboutLead}</p>

        <dl className="about-facts">
          <div>
            <dt>Formação</dt>
            <dd>
              {profile.education}
              {profile.educationInstitution
                ? ` · ${profile.educationInstitution}`
                : ""}{" "}
              <span>({profile.educationStatus})</span>
            </dd>
          </div>
          <div>
            <dt>Interesse profissional</dt>
            <dd>{profile.interests}</dd>
          </div>
          <div>
            <dt>Onde estou</dt>
            <dd>{profile.locationNote}</dd>
          </div>
        </dl>

        {profile.workingStyle ? (
          <div className="about-note">
            <span className="mono-label">Como eu trabalho</span>
            <p>{profile.workingStyle}</p>
          </div>
        ) : null}

        {recentActivity.length > 0 ? (
          <div className="recent-activity">
            <h3>Atividade recente</h3>
            <ul>
              {recentActivity.map((activity, index) => (
                <li key={`${activity.date}-${index}`}>
                  <time dateTime={activity.date}>{activity.date}</time>
                  <span>
                    <strong>{activity.title}</strong>
                    {activity.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
