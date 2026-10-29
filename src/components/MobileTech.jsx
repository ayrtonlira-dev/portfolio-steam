import { MobileTechList } from "./TechLists";

export default function MobileTech() {
  return (
    <section
      className="mobile-tech mobile-only"
      aria-labelledby="mobile-tech-title"
    >
      <div className="section-heading">
        <div>
          <span className="mono-label">Ferramentas</span>
          <h2 id="mobile-tech-title">Tecnologias</h2>
        </div>
      </div>
      <MobileTechList />
    </section>
  );
}
