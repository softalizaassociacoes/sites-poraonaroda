"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Registra uma visualização de página a cada navegação (métricas do admin). */
export function Track() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;
    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    });
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => {});
    } catch {
      // nunca interfere na navegação
    }
  }, [pathname]);

  return null;
}
