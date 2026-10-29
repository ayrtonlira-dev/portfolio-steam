import { useEffect, useState } from "react";
import { art, projects } from "./content";
import { useActiveSection } from "./hooks/useActiveSection";
import { useMotionPreference } from "./hooks/useMotionPreference";
import About from "./components/About";
import Contact from "./components/Contact";
import ImageLightbox from "./components/ImageLightbox";
import MobileNav from "./components/MobileNav";
import MobileTech from "./components/MobileTech";
import PageFooter from "./components/PageFooter";
import ProfileHeader from "./components/ProfileHeader";
import ProjectModal from "./components/ProjectModal";
import Projects from "./components/Projects";
import Showcase from "./components/Showcase";
import Sidebar from "./components/Sidebar";
import CityRain from "./components/CityRain";

const showcaseLightbox = {
  title: "Estação de trabalho",
  items: [
    {
      src: art.room,
      alt: "Quarto gamer em pixel art à noite, com janela e chuva, dois monitores, teclado, cadeira e iluminação azul e violeta.",
      caption: "Estação de trabalho",
      description:
        "Ilustração em pixel art criada para a vitrine do portfólio.",
    },
  ],
};

export default function App() {
  const projectFromUrl = () => {
    const id = new URLSearchParams(window.location.search).get("projeto");
    return projects.some((project) => project.id === id) ? id : null;
  };
  const [activeProjectId, setActiveProjectId] = useState(projectFromUrl);
  const [artLightboxOpen, setArtLightboxOpen] = useState(false);
  const activeSection = useActiveSection();
  const { motionsEnabled, toggleMotion } = useMotionPreference();

  const activeProject = projects.find(
    (project) => project.id === activeProjectId,
  );
  const activeProjectIndex = activeProject
    ? projects.findIndex((project) => project.id === activeProject.id)
    : -1;
  const nextProject =
    activeProjectIndex >= 0
      ? projects[(activeProjectIndex + 1) % projects.length]
      : null;

  useEffect(() => {
    const syncProject = () => setActiveProjectId(projectFromUrl());
    window.addEventListener("popstate", syncProject);
    return () => window.removeEventListener("popstate", syncProject);
  }, []);

  const selectProject = (projectId) => {
    const url = new URL(window.location.href);
    if (projectId) url.searchParams.set("projeto", projectId);
    else url.searchParams.delete("projeto");
    window.history.pushState(null, "", url);
    setActiveProjectId(projectId);
  };

  const openProject = (projectId) => selectProject(projectId);
  const closeProject = () => selectProject(null);
  const openNextProject = () => {
    if (nextProject) selectProject(nextProject.id);
  };

  return (
    <div className="app" data-motion={motionsEnabled ? "on" : "off"}>
      <div className="backdrop" aria-hidden="true">
        <img src={art.city} alt="" width="1920" height="840" />
        <span className="backdrop-tint" />
        <CityRain enabled={motionsEnabled} />
        <span className="backdrop-grid" />
      </div>

      <a className="skip-link" href="#projetos">
        Pular para os projetos
      </a>

      <main className="profile-shell">
        <ProfileHeader />
        <MobileNav activeSection={activeSection} />

        <div className="profile-grid">
          <div className="primary">
            <Showcase
              onExpandArt={() => setArtLightboxOpen(true)}
              motionsEnabled={motionsEnabled}
              onToggleMotion={toggleMotion}
            />
            <Projects onOpenProject={openProject} />
            <About />
            <MobileTech />
            <Contact />
          </div>

          <Sidebar
            activeSection={activeSection}
            motionsEnabled={motionsEnabled}
            onToggleMotion={toggleMotion}
          />
        </div>

        <PageFooter />
      </main>

      {activeProject ? (
        <ProjectModal
          project={activeProject}
          nextProject={nextProject}
          onClose={closeProject}
          onNextProject={openNextProject}
        />
      ) : null}

      {artLightboxOpen ? (
        <ImageLightbox
          items={showcaseLightbox.items}
          title={showcaseLightbox.title}
          onClose={() => setArtLightboxOpen(false)}
        />
      ) : null}
    </div>
  );
}
