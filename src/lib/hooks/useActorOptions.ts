"use client";

import { useEffect, useState } from "react";
import { listHistory } from "@/lib/api/history";

export interface ActorOption {
  id: string;
  label: string;
}

export function useActorOptions(): ActorOption[] {
  const [options, setOptions] = useState<ActorOption[]>([]);

  useEffect(() => {
    let cancelled = false;

    listHistory({}).then((entries) => {
      if (cancelled) return;
      const seen = new Set<string>();
      const actors: ActorOption[] = [];
      for (const entry of entries) {
        if (entry.actor_id === null || seen.has(entry.actor_id)) continue;
        seen.add(entry.actor_id);
        actors.push({ id: entry.actor_id, label: entry.actor_name });
      }
      setOptions(actors);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
