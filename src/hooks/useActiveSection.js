import { useEffect, useState } from "react";

export const SECTION_IDS = ["perfil", "projetos", "sobre", "contato"];

/**
 * Mantém a navegação sincronizada com a seção visível. Usa a posição real dos
 * elementos (em vez de IntersectionObserver) para funcionar bem com o cabeçalho
 * fixo do mobile e com o rodapé da página.
 */
export function useActiveSection(ids = SECTION_IDS) {
  const [activeSection, setActiveSection] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const stickyOffset = window.innerWidth <= 1120 ? 102 : 160;
      const marker = window.scrollY + stickyOffset;
      let current = ids[0];

      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = id;
      }

      const isAtPageEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 3;
      if (isAtPageEnd) current = ids[ids.length - 1];

      setActiveSection((previous) => (previous === current ? previous : current));
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, [ids]);

  return activeSection;
}
