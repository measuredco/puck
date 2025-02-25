export interface BubbledPointerEventType extends PointerEvent {
  originalTarget: EventTarget | null;
}

// Necessary to enable server build
const BaseEvent = typeof PointerEvent !== "undefined" ? PointerEvent : Event;

export class BubbledPointerEvent extends BaseEvent {
  _originalTarget: EventTarget | null = null;

  constructor(
    type: string,
    data: PointerEvent & { originalTarget: EventTarget | null }
  ) {
    super(type, data);
    this.originalTarget = data.originalTarget;
  }

  // Necessary for Firefox
  set originalTarget(target: EventTarget | null) {
    this._originalTarget = target;
  }

  // Necessary for Firefox
  get originalTarget() {
    return this._originalTarget;
  }
}
