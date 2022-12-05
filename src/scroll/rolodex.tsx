import React, { useRef, useEffect, useLayoutEffect } from "react";
import { useAsyncValue } from "ergo-hex";
import { createUseStyles } from "react-jss";
import { RolodexDomain } from "./rolodex_domain";
import clsx from "clsx";
import { useHorizontalResizing } from "./use_horizontal_resizing";
import { useHorizontalPanning } from "./use_horizontal_panning";

const useStyles = createUseStyles(
  {
    root: { position: "relative" },
  },
  {
    name: "Rolodex",
  }
);

export interface RolodexProps {
  domain: RolodexDomain;
  style?: React.CSSProperties;
  className?: string;
}

export const Rolodex = React.forwardRef(function ({
  domain,
  style,
  className,
}: RolodexProps) {
  const classes = useStyles();
  const items = useAsyncValue(domain.itemsBroadcast);
  const rootRef = useRef<HTMLDivElement | null>(null);
  
  useAsyncValue(domain.axis.sizeBroadcast);
  useHorizontalResizing(rootRef, domain.axis);
  useHorizontalPanning(rootRef, domain.axis);

  useEffect(() => {
    domain.initialize();
  }, [domain]);

  return (
    <div ref={rootRef} style={style} className={clsx(className, classes.root)}>
      {items.map((item) => {
        const style: React.CSSProperties = {
          position: "absolute",
          transform: `translate(${item.transform.x}px, 0) scale(${item.scale})`,
          height: `80%`,
          transformOrigin: "left center",
          width: `${domain.axis.size}px`,
          backgroundColor: "red",
          boxSizing: "border-box",
          border: "3px solid black",
          borderRadius: "25px",
          left: "0px",
          top: "10%",
          padding: "30px",
          overflow: "hidden",
        };

        return <div key={item.index} style={style}>{item.index}</div>;
      })}
    </div>
  );
});
