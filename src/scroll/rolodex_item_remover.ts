import { ObservableValue, ReadonlyObservableValue } from "ergo-hex";
import { createAnimation, Animation, Player } from "motion-ux";
import { Axis } from "./axis";

export class RolodexItemRemover {
  private _index: number;
  private _threshold: number;
  private _axis: Axis;
  private _removedPromise: Promise<void>;
  private _endOffset: number;
  private _animation: Animation<{ offset: number }>;
  private _offset: ObservableValue<number>;
  private _isRemoved: boolean;

  get index() {
    return this._index;
  }

  get offset() {
    return this._offset.getValue();
  }

  get offsetBroadcast(): ReadonlyObservableValue<number> {
    return this._offset;
  }

  get axis() {
    return this._axis;
  }

  get isRemoved() {
    return this._isRemoved;
  }

  constructor(index: number, threshold: number, endOffset: number, axis: Axis) {
    this._index = index;
    this._threshold = threshold;
    this._axis = axis;
    this._endOffset = endOffset;
    this._offset = new ObservableValue(0);
    this._isRemoved = false;

    this._removedPromise = new Promise((resolve, reject) => {
      this._axis.onScroll = () => {
        const hasGoneFarEnough = this._axis.start > this._threshold;

        if (hasGoneFarEnough) {
          this._isRemoved = true;
          this._axis.onScrollEnd = null;
          this.beginOffsetAnimation();
          resolve();
        }
      };

      this._axis.onScrollEnd = () => {
        const succeededToDelete = Math.abs(this._axis.start) > this._threshold;

        if (succeededToDelete) {
          this._isRemoved = true;
          this.beginOffsetAnimation();
          resolve();
        } else {
          reject(new Error("Failed To Delete."));
        }
      };
    });

    this._animation = createAnimation({
      offset: {
        from: {
          value: 0,
          easeOut: "quad",
        },
        to: {
          value: -this._endOffset,
          easeIn: "expo",
        },
      },
    });
  }

  private beginOffsetAnimation() {
    const player = new Player();
    player.render = (time) => {
      this._animation.update(time);
      this._offset.setValue(this._animation.currentValues.offset);
    };
  }

  process() {
    return this._removedPromise;
  }
}
