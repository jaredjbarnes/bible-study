import React, { useEffect } from "react";
import { Scrollable } from "./scrollable";

export function useResizing(
  divRef: React.RefObject<HTMLDivElement | null>,
  domain: Scrollable
) {
  useEffect(() => {
    const div = divRef.current;

    if (div == null) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) {
        domain.setSize(entry.contentRect.width, entry.contentRect.height);
      }
    });

    observer.observe(div);

    const rect = div.getBoundingClientRect();
    domain.setSize(rect.width, rect.height);

    return () => {
      observer.disconnect();
    };
  }, []);
}
