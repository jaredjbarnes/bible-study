import { ReadonlyObservableValue } from "ergo-hex";

export type ScrollHandler = ((domain: Axis) => void) | null | undefined;

export interface Axis {
  offsetBroadcast: ReadonlyObservableValue<number>;
  sizeBroadcast: ReadonlyObservableValue<number>;
  size: number;
  velocity: number;
  offset: number;
  start: number;
  end: number;
  isScrolling: boolean;
  onScrollStart: ScrollHandler;
  onScroll: ScrollHandler;
  onScrollEnd: ScrollHandler;
  initialize(value: number): void;
  pointerStart(value: number): void;
  pointerMove(value: number): void;
  pointerEnd(): void;
  reset(): void;
  stop(): void;
  setSize(value: number): void;
  disable(): void;
  enable(): void;
  scrollTo(value: number): void;
  animateTo(value: number, duration: number): void;
}
