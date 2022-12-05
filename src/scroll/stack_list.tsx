import { useAsyncValue } from "ergo-hex";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import "hammerjs";
import { createAnimation } from "motion-ux";
import { SnapAxisDomain } from "./snap_axis_domain";
import { useHorizontalPanning } from "./use_horizontal_panning";
import { useHorizontalResizing } from "./use_horizontal_resizing";

declare var Hammer: any;

const animation = createAnimation({
  position: {
    from: -25,
    "50%": 0,
    to: 100,
  },
  veilOpacity: {
    from: 0.5,
    "50%": 0,
    to: 0,
  },
});

export interface StackListProps {
  domain: SnapAxisDomain;
  renderItem: (index: number) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onTap?: (event: PointerEvent) => void;
}

export function StackList({ domain, renderItem, style, className, onTap }: StackListProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const width = domain.end - domain.start;
  const left = domain.start;
  const distance = width * 2;
  const startIndex = Math.floor(left / width);
  const children: React.ReactNode[] = [];

  useAsyncValue(domain.offsetBroadcast);
  useAsyncValue(domain.sizeBroadcast);

  useEffect(() => {
    domain.initialize(0);
  }, [domain]);

  useLayoutEffect(() => {
    domain.setSnapInterval(width);
  }, [domain, width]);

  if (!isNaN(startIndex)) {
    for (let i = 0; i < 2; i++) {
      const index = startIndex + i;
      const start = index * width - width;
      const offset = left - start;
      const percentage = 1 - offset / distance;

      const { position, veilOpacity } =
        animation.update(percentage).currentValues;

      const style: React.CSSProperties = {
        position: "absolute",
        transform: `translate(${position}%, 0)`,
        transformOrigin: "left center",
        height: `100%`,
        width: `100%`,
        backgroundColor: "red",
        boxSizing: "border-box",
        border: "3px solid black",
        top: "0",
        left: "0",
        padding: "30px",
        overflow: "hidden",
      };

      const veilStyle: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        opacity: veilOpacity,
        width: "100%",
        height: "100%",
        backgroundColor: "black",
      };

      children.push(
        <div key={index} style={style} data-id={index}>
          <div style={veilStyle}></div>
          {renderItem(index)}
        </div>
      );
    }
  }

  return (
    <div
      ref={divRef}
      onPointerDown={() => {
        domain.stop();
      }}
      style={{
        ...style,
        position: "relative",
        userSelect: "none",
        touchAction: "none",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
      className={className}
    >
      {children}
    </div>
  );
}
