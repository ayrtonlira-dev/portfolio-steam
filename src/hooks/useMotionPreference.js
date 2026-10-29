import { useCallback, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const STORAGE_KEY = "ayrton-portfolio:motion";

function readStoredPreference() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "on") return true;
    if (stored === "off") return false;
  } catch {
    // O site continua funcionando quando o armazenamento está indisponível.
  }
  return null;
}

/**
 * A preferência do sistema é o padrão. Se a pessoa escolher explicitamente
 * ligar ou desligar os efeitos, essa escolha é lembrada no navegador.
 */
export function useMotionPreference() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [storedPreference, setStoredPreference] = useState(readStoredPreference);

  const motionsEnabled =
    storedPreference === null ? !prefersReducedMotion : storedPreference;

  const toggleMotion = useCallback(() => {
    setStoredPreference((current) => {
      const currentlyEnabled = current === null ? !prefersReducedMotion : current;
      const nextEnabled = !currentlyEnabled;

      try {
        window.localStorage.setItem(STORAGE_KEY, nextEnabled ? "on" : "off");
      } catch {
        // A preferência vale para esta aba mesmo sem persistência.
      }

      return nextEnabled;
    });
  }, [prefersReducedMotion]);

  return {
    motionsEnabled,
    toggleMotion,
    prefersReducedMotion,
    usingSystemPreference: storedPreference === null,
  };
}
