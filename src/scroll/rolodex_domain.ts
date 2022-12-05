import { Unsubscribe } from "ergo-hex";
import { easings } from "motion-ux";
import { BlendMotion } from "./blend_motion";
import { SnapAxisDomain } from "./snap_axis_domain";

export interface RolodexItem {
  index: number;
  transform: {
    x: number;
    y: number;
  };
  scale: number;
  veilOpacity: number;
}

const MULTIPLIER = 2.25;

export class RolodexDomain {
  private _axisDomain: SnapAxisDomain;
  private _minIndex: number;
  private _maxIndex: number;
  private _horizontalItems: RolodexItem[];
  private _rolodexItems: RolodexItem[];
  private _unsubscribeOffset: Unsubscribe;
  private _blendMotion: BlendMotion<RolodexItem[]>;
  private _unsubscribeSize: Unsubscribe;

  get itemsBroadcast() {
    return this._blendMotion.valueBroadcast;
  }

  get axis() {
    return this._axisDomain;
  }

  constructor(
    axisDomain: SnapAxisDomain,
    minIndex = -Infinity,
    maxIndex = Infinity
  ) {
    this._axisDomain = axisDomain;
    this._minIndex = minIndex;
    this._maxIndex = maxIndex;
    this._horizontalItems = this.createItems();
    this._rolodexItems = this.createItems();
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
    });

    this.updateItems();
  }

  initialize() {
    this._axisDomain.initialize(0);
    this._blendMotion.initialize();
  }

  private updateScrollConstraints(size) {
    if (this._minIndex != -Infinity) {
      this._axisDomain.min = this._minIndex * size;
    }

    if (this._maxIndex != Infinity) {
      this._axisDomain.max = this._maxIndex * size;
    }
  }

  private createItems() {
    const items: RolodexItem[] = [];

    for (let x = 0; x <= 5; x++) {
      items.push({
        index: x,
        transform: {
          x: 0,
          y: 0,
        },
        scale: 1,
        veilOpacity: 1,
      });
    }

    return items;
  }

  setToSelectedMode() {
    this._blendMotion.transitionToA();
  }

  setToOverviewMode() {
    this._blendMotion.transitionToB();
  }

  private updateHorizontalItems() {
    const horizontalItems = this._horizontalItems;
    const width = this.axis.size === 0 ? 0.0000001 : this.axis.size;
    const offset = this.axis.start;
    const index = Math.floor(offset / width);
    const startIndex = index - 4;

    for (let i = 0; i <= 5; i++) {
      const itemIndex = startIndex + i;
      const xOffset = itemIndex * width;
      horizontalItems[i].index = itemIndex;
      horizontalItems[i].scale = 1;
      horizontalItems[i].transform.y = 0;
      horizontalItems[i].transform.x = offset + xOffset;
      horizontalItems[i].veilOpacity = 0;
    }
  }

  private updateRolodexItems() {
    const amount = 5;
    const width = this.axis.size === 0 ? 0.00000001 : this.axis.size;
    const adjustedWidth = width - width * 0.05;
    const start = this.axis.start * MULTIPLIER + width;
    const rolodexItems = this._rolodexItems;
    const index = Math.floor(start / width);
    const startIndex = index - amount + 1;
    const transformWidth = amount * width;

    for (let i = 0; i <= amount; i++) {
      const itemIndex = startIndex + i;
      const itemPosition = itemIndex * width;
      const percentage =
        (transformWidth - (start - itemPosition)) / transformWidth;
      const transformedPercentage = easings.easeInQuint(percentage);
      const scale = 0.95 + transformedPercentage * 0.05;
      const position = transformedPercentage * adjustedWidth;

      rolodexItems[i].index = startIndex + i;
      rolodexItems[i].scale = scale;
      rolodexItems[i].transform.y = 0;
      rolodexItems[i].transform.x = position;
      rolodexItems[i].veilOpacity = 1 - scale;
    }
  }

  private updateItems() {
    this.updateHorizontalItems();
    this.updateRolodexItems();
    this._blendMotion.update();
  }

  dispose() {
    this._unsubscribeOffset();
    this._unsubscribeSize();
  }
}
