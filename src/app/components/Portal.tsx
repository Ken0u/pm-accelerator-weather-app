"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
