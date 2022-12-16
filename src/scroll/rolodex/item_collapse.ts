import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { createAnimation, easings, Motion } from "motion-ux";

export class ItemCollapse {
  private _index: number;
  private _motion: Motion<{ offset: number }>;
  private _threshold: number;
  private _pointerStartValue: number;
  private _collapseSize: number;
  private _lastPointerEventTime: number;
  private _deltas: number[];
  private _averageDelta: number;
  private _isResolved: boolean;
  private _hasCollapsed: boolean;
  private _offset: ObservableValue<number>;
  private _collapse: ObservableValue<number>;

  get index() {
    return this._index;
  }

  get offset() {
    return this._offset.getValue();
  }

  get offsetBroadcast(): ReadonlyObservableValue<number> {
    return this._offset;
  }

  get collapse() {
    return this._collapse.getValue();
  }

  get isResolved() {
    return this._isResolved;
  }

  get hasCollapsed() {
    return this._hasCollapsed;
  }

  constructor(index: number, threshold: number, collapseSize: number) {
    this._index = index;
    this._threshold = threshold;
    this._collapseSize = collapseSize;
    this._collapse = new ObservableValue(0);
    this._offset = new ObservableValue(0);
    this._isResolved = false;
    this._hasCollapsed = false;

    this._motion = new Motion(({ currentValues }) => {
      this._offset.setValue(currentValues.offset);
    }, true);
  }

  initialize() {
    this._motion.segueTo(createAnimation({ offset: 0 }), 32);
  }

  pointerStart(value: number) {
    this._pointerStartValue = value;
    this.stopAnimation();
    this.cacheTime();
    this.fillDeltaHistory(0);
  }

  pointerMove(value: number) {
    const now = Date.now();
    const deltaTime = now - this._lastPointerEventTime;
    const delta = value - this._pointerStartValue;

    if (deltaTime < 16) {
      return false;
    }

    this.cacheAverageDelta(delta);
    this.moveByDelta();
    this.cacheTime();
  }

  pointerEnd() {
    const momentumDistance = this.deriveDistance(this._averageDelta);
    const finalOffset = this.offset + momentumDistance;
    const movedBeyondThreshold = finalOffset <= this._threshold;

    if (movedBeyondThreshold) {
      this.animateOut();
    } else {
      this.animateIn();
    }
  }

  private stopAnimation() {
    this._motion.stop();
  }

  private moveByDelta() {
    this._offset.transformValue((o) => o + this._averageDelta);
  }

  private cacheTime() {
    this._lastPointerEventTime = Date.now();
  }

  private fillDeltaHistory(value) {
    this._deltas.fill(value);
  }

  private cacheAverageDelta(delta: number) {
    let total = 0;

    for (let i = 0; i < 3; i++) {
      if (i < 2) {
        this._deltas[i] = this._deltas[i + 1];
      } else {
        this._deltas[i] = delta;
      }

      total += this._deltas[i];
    }

    const averageX = total / 3;
    this._averageDelta = averageX;
  }

  private deriveDistance(delta: number) {
    return delta / (1 - 0.97);
  }

  private animateOut() {
    this.animateTo(this._threshold, () => {
      this._isResolved = true;
      this._hasCollapsed = true;
    });
  }

  private animateIn() {
    this.animateTo(0, () => {
      this._isResolved = true;
      this._hasCollapsed = false;
    });
  }

  animateTo(value: number, onComplete: () => void) {
    const offset = this._offset.getValue();
    const delta = this._deltas[this._deltas.length - 1];

    const animation = createAnimation({
      offset: {
        from: offset - delta,
        to: offset,
      },
    });

    this._motion.inject(animation);
    this._motion.segueTo(
      createAnimation({ offset: value }),
      500,
      easings.easeOutExpo,
      onComplete
    );
  }

  dispose() {
    this._offset.dispose();
    this._collapse.dispose();
  }
}
