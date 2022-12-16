import React, { useLayoutEffect } from "react";
import "hammerjs";
import { Axis } from "./axis";

declare var Hammer: any;

export function useLockPanning(
  divRef: React.RefObject<HTMLDivElement | null>,
  xAxis: Axis,
  yAxis: Axis,
  onTap?: (event: PointerEvent) => void,
  onStart?: (event: PointerEvent) => void,
  onEnd?: (event: PointerEvent) => void
) {
  useLayoutEffect(() => {
    const stage = divRef.current;

    if (stage != null) {
      let startX = 0;
      let startY = 0;
      let activeAxis = xAxis;
      let axisName = "x";
      let hasStarted = false;

      const manager = new Hammer.Manager(stage);
      manager.domEvents = true;

      manager.add(
        new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 })
      );

      if (onTap) {
        manager.add(new Hammer.Tap());
      }

      manager.on("tap", (e) => {
        onTap && onTap(e.srcEvent);
      });

      manager.on("panstart", (e) => {
        startX = e.center.x;
        startY = e.center.y;
        onStart && onStart(e.srcEvent);
      });

      manager.on("panmove", (e) => {
        const horizontalMovement = Math.abs(e.center.x - startX);
        const verticalMovement = Math.abs(e.center.y - startY);

        if (hasStarted) {
          activeAxis.pointerMove(e.center[axisName]);
        } else {
          const isMoreHorizontal = horizontalMovement > verticalMovement;
          const isMoreVertical = verticalMovement > horizontalMovement;
          const isFarEnough = horizontalMovement > 5 || verticalMovement > 5;

          if (isFarEnough && isMoreHorizontal) {
            hasStarted = true;
            axisName = "x";
            activeAxis = xAxis;
            xAxis.pointerStart(e.center.x);
          } else if (isFarEnough && isMoreVertical) {
            hasStarted = true;
            axisName = "y";
            activeAxis = yAxis;
            yAxis.pointerStart(e.center.y);
          }
        }
      });

      manager.on("panend", (e) => {
        hasStarted = false;
        activeAxis.pointerEnd();
        onEnd && onEnd(e.srcEvent);
      });

      manager.on("pancancel", (e) => {
        hasStarted = false;
        activeAxis.pointerEnd();
        onEnd && onEnd(e.srcEvent);
      });

      return () => {
        manager.stop();
        manager.destroy();
      };
    }
  }, [xAxis, yAxis, onTap, onStart, onEnd]);
}
