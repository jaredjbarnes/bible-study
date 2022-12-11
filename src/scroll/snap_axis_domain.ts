import { AxisDomain } from "./axis_domain";

export class SnapAxisDomain extends AxisDomain {
  private _snapInterval: number | null;

  constructor(
    requestAnimationFrame: (callback: () => void) => number,
    cancelAnimationFrame: (id: number) => void,
    snapInterval?: number
  ) {
    super(requestAnimationFrame, cancelAnimationFrame);
    if (snapInterval != null) {
      this._snapInterval = Math.max(snapInterval, 0);
    }
  }

  setSnapInterval(interval?: number) {
    this._snapInterval = interval || null;
  }

  pointerEnd() {
    super.pointerEnd();
    this.settle();
  }

  reset(): void {
    super.reset();
  }

  stop() {
    super.stop();
    this.settle();
  }

  private settle() {
    const offset = this._offset.getValue();
    const delta = this._deltaOffset;
    const distance = this.deriveDistance(delta);
    const value = this.round(offset + distance);

    if (value <= this.maxOffset && value >= this.minOffset) {
      this.animateTo(value);
    }
  }

  private deriveDistance(delta: number) {
    const interval = this._snapInterval || this.size;
    const step = Math.round(delta / (1 - 0.97) / interval);
    return step * interval;
  }

  private round(value: number) {
    const interval = this._snapInterval || this.size;
    const halfStep = interval / 2;
    const remainder = Math.abs(value % interval);
    const direction = Math.sign(value);

    return remainder > halfStep
      ? value + direction * (interval - remainder)
      : value - direction * remainder;
  }
}
