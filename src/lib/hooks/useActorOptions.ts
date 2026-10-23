"use client";

import { useEffect, useState } from "react";
import { listHistory } from "@/lib/api/history";
import { classifyError } from "@/lib/api/errors";

export interface ActorOption {
  id: string;
  label: string;
}

export function useActorOptions(): ActorOption[] {
  const [options, setOptions] = useState<ActorOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    listHistory({})
      .then((entries) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const actors: ActorOption[] = [];
        for (const entry of entries) {
          if (entry.actor_id === null || seen.has(entry.actor_id)) continue;
          seen.add(entry.actor_id);
          actors.push({ id: entry.actor_id, label: entry.actor_name });
        }
        setOptions(actors);
      })
      .catch((err) => {
        if (cancelled) return;
        // RF-3: un fallo al cargar actores (incluyendo 403) deja la lista vacía sin romper
        // la consola ni el resto de la pantalla de Auditoría — no se expone estado de error.
        classifyError(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
