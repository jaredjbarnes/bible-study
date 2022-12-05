import React, { useEffect } from "react";
import { Axis } from "./axis";

export function useHorizontalResizing(
  divRef: React.RefObject<HTMLDivElement | null>,
  domain: Axis
) {
  useEffect(() => {
    const div = divRef.current;

    if (div == null) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) {
        domain.setSize(entry.contentRect.width);
      }
    });

    observer.observe(div);

    const rect = div.getBoundingClientRect();
    domain.setSize(rect.width);

    return () => {
      observer.disconnect();
    };
  }, []);
}
