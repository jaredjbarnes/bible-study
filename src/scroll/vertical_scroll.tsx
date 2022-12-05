import { useAsyncValue } from "ergo-hex";
import React, { useEffect, useRef } from "react";
import "hammerjs";
import { useVerticalPanning } from "./use_vertical_panning";
import { useVerticalResizing } from "./use_vertical_resizing";
import { AxisDomain } from "./axis_domain";

declare var Hammer: any;

export interface VerticalScrollProps {
  children: (domain: AxisDomain) => React.ReactNode;
  domain: AxisDomain;
  style?: React.CSSProperties;
  className?: string;
  onTap?: (event: PointerEvent) => void;
  overflow?: "hidden" | "visible";
}

export function VerticalScroll({
  domain,
  children,
  style,
  className,
  overflow = "hidden",
  onTap,
}: VerticalScrollProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  useAsyncValue(domain.offsetBroadcast);
  useAsyncValue(domain.sizeBroadcast);

  useEffect(() => {
    domain.initialize(0);
  }, [domain]);
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
        overflow,
      }}
      className={className}
    >
      {children(domain)}
    </div>
  );
}
