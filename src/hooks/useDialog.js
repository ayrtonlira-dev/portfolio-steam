import { useCallback, useEffect, useRef } from "react";
import { lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

/**
 * Controla um <dialog> nativo: foco, Escape, restauração de foco e trava de
 * rolagem. O navegador cuida do trap de foco e da camada modal.
 */
export function useDialog({ onRequestClose, initialFocusRef }) {
  const dialogRef = useRef(null);
  const closeCallbackRef = useRef(onRequestClose);
  const restoreFocusRef = useRef(null);

  useEffect(() => {
    closeCallbackRef.current = onRequestClose;
  }, [onRequestClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    lockBodyScroll();

    const handleClose = () => {
      // Em desenvolvimento, o StrictMode executa os efeitos duas vezes. Um
      // evento de close antigo não pode fechar a nova instância já reaberta.
      if (dialog.open) return;
      closeCallbackRef.current?.();
    };

    dialog.addEventListener("close", handleClose);

    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        // Em um navegador sem suporte a showModal, o <dialog> aberto ainda
        // mantém o conteúdo acessível, mas sem o trap nativo.
        dialog.setAttribute("open", "");
      }
    }

    const focusFrame = requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? dialog;
      target?.focus?.();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      dialog.removeEventListener("close", handleClose);

      // Não fechamos nem removemos o elemento aqui: ao desmontar, o React já
      // retira o diálogo do DOM. Fechá-lo explicitamente poderia disparar um
      // evento atrasado em uma nova montagem do StrictMode.
      unlockBodyScroll();

      const previous = restoreFocusRef.current;
      if (previous && document.contains(previous)) {
        requestAnimationFrame(() => previous.focus());
      }
    };
  }, [initialFocusRef]);

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    } else {
      closeCallbackRef.current?.();
    }
  }, []);

  const handleBackdropClick = useCallback(
    (event) => {
      if (event.target === dialogRef.current) {
        closeDialog();
      }
    },
    [closeDialog],
  );

  return {
    dialogRef,
    closeDialog,
    handleBackdropClick,
  };
}
