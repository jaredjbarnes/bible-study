import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import {
  Motion,
  Animation,
  createAnimation,
  Keyframe,
  easings,
} from "motion-ux";

export class BlendMotion<T> {
  private _motion: Motion<{ value: number }>;
  private _animation: Animation<{ value: T }>;
  private _transitionValue: number;
  private _value: ObservableValue<T>;

  get valueBroadcast(): ReadonlyObservableValue<T> {
    return this._value;
  }

  get value() {
    return this._value.getValue();
  }

  constructor(from: T, to: T) {
    this._motion = new Motion(({ currentValues }) => {
      this._transitionValue = currentValues.value;
      this.render();
    }, true);

    this._animation = new Animation("blended-motion", [
      new Keyframe({
        property: "value",
        from: from,
        to: to,
      }),
    ]);

    this._transitionValue = 0;
    this._value = new ObservableValue(this._animation.currentValues.value);
  }

  updateKeyframe(from: T, to: T) {
    this._animation.keyframes = [
      new Keyframe({
        property: "value",
        from: from,
        to: to,
      }),
    ];
    this.render();
  }

  private render() {
    this._animation.update(this._transitionValue);
    this._value.setValue(this._animation.currentValues.value);
  }

  initialize() {
    this._motion.segueTo(createAnimation({ value: 0 }), 0);
  }

  transitionToA(onComplete?: () => void) {
    this._motion.segueTo(
      createAnimation({ value: 0 }),
      500,
      easings.easeOutExpo,
      onComplete
    );
  }

  transitionToB(onComplete?: () => void) {
    this._motion.segueTo(
      createAnimation({ value: 1 }),
      500,
      easings.easeOutExpo,
      onComplete
    );
  }

  update() {
    this.render();
  }
}
