"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Monte ses enfants directement sur document.body via un portail.
 * Utilisé pour les zones d'impression : elles se retrouvent enfants directs
 * du <body>, pas imbriquées dans le div#app — ce qui permet au CSS @media print
 * de les cibler indépendamment du reste de l'app.
 */
export function PrintPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    div.className = "print-only";
    document.body.appendChild(div);
    containerRef.current = div;
    setMounted(true);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  if (!mounted || !containerRef.current) return null;
  return createPortal(children, containerRef.current);
}
