"use client";

import { useState } from "react";

// TODO: el backend no expone GET /users; este hook solo cubrirá creación por ahora.
export function useUsers() {
  const [isSubmitting] = useState(false);

  return { isSubmitting };
}
