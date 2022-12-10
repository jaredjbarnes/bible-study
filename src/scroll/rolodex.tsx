import React, { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useAsyncValue } from "ergo-hex";
import { createUseStyles } from "react-jss";
import { RolodexDomain } from "./rolodex_domain";
import clsx from "clsx";
import { useHorizontalResizing } from "./use_horizontal_resizing";
import { useHorizontalPanning } from "./use_horizontal_panning";

const useStyles = createUseStyles(
  {
    root: { position: "relative", overflow: "hidden" },
    overviewButton: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "blue",
      position: "absolute",
      bottom: "25px",
      left: "50%",
      transform: "translate(-50%, 0)",
    },
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
  const onTap = useCallback(
    (e) => {
      const element = e.target as HTMLElement | null;

      if (element != null) {
        const selectedItem = element.closest("[data-id]");

        if (selectedItem != null) {
          const index = Number(selectedItem.getAttribute("data-id"));

          domain.selectItem(index);
        }
      }
    },
    [domain]
  );

  useAsyncValue(domain.axis.sizeBroadcast);
  useHorizontalResizing(rootRef, domain.axis);
  useHorizontalPanning(rootRef, domain.axis, onTap);

  useEffect(() => {
    domain.initialize();
  }, [domain]);

  const setToOverviewMode = useCallback(() => {
    domain.setToOverviewMode();
  }, [domain]);

  return (
    <div ref={rootRef} style={style} className={clsx(className, classes.root)}>
      {items.map((item) => {
        const style: React.CSSProperties = {
          position: "absolute",
          transform: `translate(${item.transform.x}px, 0) scale(${item.scale})`,
          height: `100%`,
          transformOrigin: "left center",
          width: `${domain.axis.size}px`,
          backgroundColor: "red",
          boxSizing: "border-box",
          border: "3px solid black",
          borderRadius: `${item.borderRadius}px`,
          left: "0px",
          top: "0%",
          padding: "30px",
          overflow: "hidden",
          opacity: item.opacity,
        };

        const veilStyle: React.CSSProperties = {
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: "black",
          opacity: item.veilOpacity,
        };

        return (
          <div data-id={item.index} key={item.index} style={style}>
            {item.index}
            <div style={veilStyle}></div>
          </div>
        );
      })}
      <div onClick={setToOverviewMode} className={classes.overviewButton}></div>
    </div>
  );
});
