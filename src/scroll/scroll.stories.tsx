import React, { useState } from "react";
import { Rolodex } from "./rolodex";
import { RolodexDomain } from "./rolodex_domain";
import { SnapAxisDomain } from "./snap_axis_domain";
import { StackList } from "./stack_list";

export default {
  title: "Example/VirtualizedScroller",
  component: StackList,
};

const HEIGHT = 100;

export function StackListBaseline() {
  const [domain] = useState(() => {
    const domain = new SnapAxisDomain(
      requestAnimationFrame,
      cancelAnimationFrame,
      300
    );

    return domain;
  });

  return (
    <StackList
      domain={domain}
      style={{
        width: "100%",
        height: `100%`,
        border: "3px solid black",
        boxSizing: "border-box",
      }}
      renderItem={(index) => {
        return <div>{index} - Test</div>;
      }}
    />
  );
}

export function RolodexBaseline() {
  const [domain] = useState(() => {
    const axis = new SnapAxisDomain(
      requestAnimationFrame,
      cancelAnimationFrame
    );
    axis.min = 0;
    const domain = new RolodexDomain(axis);

    return domain;
  });

  return (
    <Rolodex
      domain={domain}
      style={{
        width: "100%",
        height: `100%`,
        border: "3px solid black",
        boxSizing: "border-box",
      }}
    />
  );
}
