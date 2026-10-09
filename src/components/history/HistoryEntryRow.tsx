"use client";

import { useState } from "react";
import { summarize, summarizeChange } from "@/lib/utils/history-labels";
import { formatDateTime } from "@/lib/utils/date";
import type { HistoryEntry } from "@/types/history";

interface HistoryEntryRowProps {
  entry: HistoryEntry;
}

export function HistoryEntryRow({ entry }: HistoryEntryRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChanges = entry.changes.length > 0;

  return (
    <>
      <tr className="border-t border-gray-200">
        <td className="py-2">
          {hasChanges ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="text-left font-medium hover:underline"
            >
              {expanded ? "▾" : "▸"} {summarize(entry)}
            </button>
          ) : (
            <span>{summarize(entry)}</span>
          )}
        </td>
        <td className="py-2 text-right text-xs text-gray-500">{formatDateTime(entry.occurred_at)}</td>
      </tr>
      {expanded && hasChanges && (
        <tr>
          <td colSpan={2} className="bg-gray-50 px-4 py-2">
            <ul className="flex flex-col gap-1 text-xs text-gray-700">
              {entry.changes.map((change, i) => (
                <li key={`${change.field}-${i}`}>{summarizeChange(change)}</li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}
