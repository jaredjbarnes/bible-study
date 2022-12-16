import React, { useLayoutEffect } from "react";
import "hammerjs";
import { Axis } from "./axis";

declare var Hammer: any;

export function useVerticalPanning(
  divRef: React.RefObject<HTMLDivElement | null>,
  domain: Axis,
  onTap?: (event: PointerEvent) => void
) {
  useLayoutEffect(() => {
    const stage = divRef.current;
    if (stage != null) {
      const manager = new Hammer.Manager(stage);
      manager.domEvents = true;

      manager.add(
        new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL, threshold: 0 })
      );

      if (onTap) {
        manager.add(new Hammer.Tap());
      }

      manager.on("tap", (e) => {
        onTap && onTap(e.srcEvent);
      });

      manager.on("panstart", (e) => {
        domain.pointerStart(e.center.y);
      });

      manager.on("panmove", (e) => {
        domain.pointerMove(e.center.y);
      });

      manager.on("panend", (e) => {
        domain.pointerEnd();
      });

      manager.on("pancancel", (e) => {
        domain.pointerEnd();
      });

      return () => {
        manager.stop();
        manager.destroy();
      };
    }
  }, [domain, onTap]);
}
