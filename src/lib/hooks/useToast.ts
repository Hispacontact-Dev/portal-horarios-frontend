"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VISIBLE_MS = 2400;

/**
 * Mensaje efímero de confirmación. El proyecto no tenía sistema de toasts: cada
 * pantalla resolvía el feedback con un `SuccessState` persistente o nada.
 *
 * Devuelve el mensaje visible, no el nodo, para que el componente decida dónde
 * renderizar `<Toast />` y los archivos de UI no dependan de este hook.
 */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const show = useCallback((next: string) => {
    setMessage(next);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(null), VISIBLE_MS);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setMessage(null);
  }, []);

  return { message, show, hide };
}
