"use client";

import { useState } from "react";

// Navegación de semana acotada a 8 semanas atrás/adelante — RF-1, RNF-1.
const MIN_OFFSET = -8;
const MAX_OFFSET = 8;

export function useScheduleWeekNavigation() {
  const [offset, setOffset] = useState(0);

  function goPrev() {
    setOffset((value) => (value > MIN_OFFSET ? value - 1 : value));
  }

  function goNext() {
    setOffset((value) => (value < MAX_OFFSET ? value + 1 : value));
  }

  return { offset, goPrev, goNext, canGoPrev: offset > MIN_OFFSET, canGoNext: offset < MAX_OFFSET };
}
