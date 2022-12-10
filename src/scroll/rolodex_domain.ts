import {
  ObservableValue,
  ReadonlyObservableValue,
  Unsubscribe,
} from "ergo-hex";
import { createAnimation, easings } from "motion-ux";
import { BlendMotion } from "./blend_motion";
import { SnapAxisDomain } from "./snap_axis_domain";

export interface RolodexItem {
  index: string;
  transform: {
    x: number;
    y: number;
  };
  scale: number;
  veilOpacity: number;
  opacity: number;
  borderRadius: number;
}

const opacityAnimation = createAnimation({
  opacity: {
    from: 0,
    "25%": 0,
    "50%": 1,
    to: 1,
  },
});
const MULTIPLIER = 2.25;

export class RolodexDomain {
  private _amount: number;
  private _width: number;
  private _offset: number;
  private _startIndex: number;
  private _index: number;
  private _axisDomain: SnapAxisDomain;
  private _minIndex: number;
  private _maxIndex: number;
  private _horizontalItems: RolodexItem[];
  private _rolodexItems: RolodexItem[];
  private _unsubscribeOffset: Unsubscribe;
  private _blendMotion: BlendMotion<RolodexItem[]>;
  private _unsubscribeSize: Unsubscribe;
  private _inOverviewMode: ObservableValue<boolean>;

  get inOverviewModeBroadcast(): ReadonlyObservableValue<boolean> {
    return this._inOverviewMode;
  }

  get itemsBroadcast() {
    return this._blendMotion.valueBroadcast;
  }

  get axis() {
    return this._axisDomain;
  }

  get minIndex() {
    return this._minIndex;
  }

  set minIndex(value: number) {
    const size = this.axis.size;
    if (this._minIndex != -Infinity) {
      this._minIndex = value;
      this._axisDomain.min = this._minIndex * size;
    }
  }

  get maxIndex() {
    return this._maxIndex;
  }

  set maxIndex(value: number) {
    const size = this.axis.size;
    if (this._maxIndex != -Infinity) {
      this._maxIndex = value;
      this._axisDomain.max = this._maxIndex * size;
    }
  }

  constructor(
    axisDomain: SnapAxisDomain,
    minIndex = -Infinity,
    maxIndex = Infinity
  ) {
    this._amount = 5;
    this._axisDomain = axisDomain;
    this.minIndex = minIndex;
    this.maxIndex = maxIndex;
    this._horizontalItems = this.createItems();
    this._rolodexItems = this.createItems();
    this._inOverviewMode = new ObservableValue(false);
    this._blendMotion = new BlendMotion(
      this._horizontalItems,
      this._rolodexItems
    );

    this._unsubscribeOffset = this._axisDomain.offsetBroadcast.onChange(() =>
      this.updateItems()
    );

    this._unsubscribeSize = this._axisDomain.sizeBroadcast.onChange((size) => {
      this.updateScrollConstraints(size);
      this._axisDomain.setSnapInterval(size / MULTIPLIER);
      this.updateItems();
    });

    this.updateItems();
  }

  initialize() {
    this.axis.disable();
    this.axis.initialize(0);
    this._blendMotion.initialize();
  }

  private updateScrollConstraints(size) {
    if (this._minIndex != -Infinity) {
      this._axisDomain.min = (this._minIndex * size) / MULTIPLIER;
    }

    if (this._maxIndex != Infinity) {
      this._axisDomain.max = (this._maxIndex * size) / MULTIPLIER;
    }
  }

  private createItems() {
    const items: RolodexItem[] = [];

    for (let x = 0; x <= this._amount; x++) {
      items.push({
        index: String(x),
        transform: {
          x: 0,
          y: 0,
        },
        scale: 1,
        veilOpacity: 1,
        opacity: 1,
        borderRadius: 0,
      });
    }

    return items;
  }

  private setToSelectedMode() {
    this._inOverviewMode.setValue(false);
    this.axis.disable();
    this._blendMotion.transitionToA();
  }

  setToOverviewMode() {
    this._inOverviewMode.setValue(true);
    this.axis.enable();
    this._blendMotion.transitionToB();
  }

  selectItem(index: number) {
    const position = (index * this._width) / MULTIPLIER;
    this._axisDomain.stop();
    this._axisDomain.animateTo(-position, 500);
    this.setToSelectedMode();
  }

  private updateHorizontalItems() {
    const horizontalItems = this._horizontalItems;
    const width = this._width;
    const startIndex = this._startIndex;
    const offset = this._offset;

    for (let i = 0; i <= this._amount; i++) {
      const itemIndex = startIndex + i;
      const startOffset = (i - 3) * width;
      const percentage = (offset % width) / width;
      const finalOffset = startOffset - percentage * width;

      horizontalItems[i].index = String(itemIndex);
      horizontalItems[i].scale = 1;
      horizontalItems[i].transform.y = 0;
      horizontalItems[i].transform.x = finalOffset;
      horizontalItems[i].veilOpacity = 0;
      horizontalItems[i].opacity = 1;
      horizontalItems[i].borderRadius = 0;
    }
  }

  private updateRolodexItems() {
    const width = this._width;
    const amount = this._amount;
    const startIndex = this._startIndex;
    const start = this._offset + this._width;
    const adjustedWidth = width - width * 0.15;
    const rolodexItems = this._rolodexItems;
    const transformWidth = amount * width;

    for (let i = 0; i <= amount; i++) {
      const itemIndex = startIndex + i;
      const itemPosition = itemIndex * width;
      const percentage =
        (transformWidth - (start - itemPosition)) / transformWidth;
      const transformedPercentage = easings.easeInQuint(percentage);
      const scale = 0.95 + transformedPercentage * 0.05;
      const position = transformedPercentage * adjustedWidth;
      const veilOpacity = 1 - (0.5 + percentage * 0.5);

      opacityAnimation.update(percentage);
      const opacity = opacityAnimation.currentValues.opacity;

      rolodexItems[i].index = String(itemIndex);
      rolodexItems[i].scale = scale;
      rolodexItems[i].transform.y = 0;
      rolodexItems[i].transform.x = position;
      rolodexItems[i].veilOpacity = veilOpacity;
      rolodexItems[i].opacity = opacity;
      rolodexItems[i].borderRadius = 25;
    }
  }

  private updateItems() {
    this.updateScrollState();
    this.updateHorizontalItems();
    this.updateRolodexItems();
    this._blendMotion.update();
  }

  private updateScrollState() {
    this._width = this.axis.size === 0 ? 0.00000001 : this.axis.size;
    this._offset = this.axis.start * MULTIPLIER;
    this._index =
      this._offset < 0
        ? Math.ceil(this._offset / this._width)
        : Math.floor(this._offset / this._width);
    this._startIndex = this._index - this._amount + 2;
  }

  dispose() {
    this._unsubscribeOffset();
    this._unsubscribeSize();
  }
}
