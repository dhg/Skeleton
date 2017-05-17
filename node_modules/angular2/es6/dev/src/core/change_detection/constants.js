import { isBlank } from 'angular2/src/facade/lang';
/**
 * Describes the current state of the change detector.
 */
export var ChangeDetectorState;
(function (ChangeDetectorState) {
    /**
     * `NeverChecked` means that the change detector has not been checked yet, and
     * initialization methods should be called during detection.
     */
    ChangeDetectorState[ChangeDetectorState["NeverChecked"] = 0] = "NeverChecked";
    /**
     * `CheckedBefore` means that the change detector has successfully completed at least
     * one detection previously.
     */
    ChangeDetectorState[ChangeDetectorState["CheckedBefore"] = 1] = "CheckedBefore";
    /**
     * `Errored` means that the change detector encountered an error checking a binding
     * or calling a directive lifecycle method and is now in an inconsistent state. Change
     * detectors in this state will no longer detect changes.
     */
    ChangeDetectorState[ChangeDetectorState["Errored"] = 2] = "Errored";
})(ChangeDetectorState || (ChangeDetectorState = {}));
/**
 * Describes within the change detector which strategy will be used the next time change
 * detection is triggered.
 */
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
    /**
     * `CheckedOnce` means that after calling detectChanges the mode of the change detector
     * will become `Checked`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["CheckOnce"] = 0] = "CheckOnce";
    /**
     * `Checked` means that the change detector should be skipped until its mode changes to
     * `CheckOnce`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Checked"] = 1] = "Checked";
    /**
     * `CheckAlways` means that after calling detectChanges the mode of the change detector
     * will remain `CheckAlways`.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["CheckAlways"] = 2] = "CheckAlways";
    /**
     * `Detached` means that the change detector sub tree is not a part of the main tree and
     * should be skipped.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Detached"] = 3] = "Detached";
    /**
     * `OnPush` means that the change detector's mode will be set to `CheckOnce` during hydration.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["OnPush"] = 4] = "OnPush";
    /**
     * `Default` means that the change detector's mode will be set to `CheckAlways` during hydration.
     */
    ChangeDetectionStrategy[ChangeDetectionStrategy["Default"] = 5] = "Default";
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
/**
 * List of possible {@link ChangeDetectionStrategy} values.
 */
export var CHANGE_DETECTION_STRATEGY_VALUES = [
    ChangeDetectionStrategy.CheckOnce,
    ChangeDetectionStrategy.Checked,
    ChangeDetectionStrategy.CheckAlways,
    ChangeDetectionStrategy.Detached,
    ChangeDetectionStrategy.OnPush,
    ChangeDetectionStrategy.Default
];
/**
 * List of possible {@link ChangeDetectorState} values.
 */
export var CHANGE_DETECTOR_STATE_VALUES = [
    ChangeDetectorState.NeverChecked,
    ChangeDetectorState.CheckedBefore,
    ChangeDetectorState.Errored
];
export function isDefaultChangeDetectionStrategy(changeDetectionStrategy) {
    return isBlank(changeDetectionStrategy) ||
        changeDetectionStrategy === ChangeDetectionStrategy.Default;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jb25zdGFudHMudHMiXSwibmFtZXMiOlsiQ2hhbmdlRGV0ZWN0b3JTdGF0ZSIsIkNoYW5nZURldGVjdGlvblN0cmF0ZWd5IiwiaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kiXSwibWFwcGluZ3MiOiJPQUFPLEVBQStCLE9BQU8sRUFBQyxNQUFNLDBCQUEwQjtBQUU5RTs7R0FFRztBQUNILFdBQVksbUJBbUJYO0FBbkJELFdBQVksbUJBQW1CO0lBQzdCQTs7O09BR0dBO0lBQ0hBLDZFQUFZQSxDQUFBQTtJQUVaQTs7O09BR0dBO0lBQ0hBLCtFQUFhQSxDQUFBQTtJQUViQTs7OztPQUlHQTtJQUNIQSxtRUFBT0EsQ0FBQUE7QUFDVEEsQ0FBQ0EsRUFuQlcsbUJBQW1CLEtBQW5CLG1CQUFtQixRQW1COUI7QUFFRDs7O0dBR0c7QUFDSCxXQUFZLHVCQWtDWDtBQWxDRCxXQUFZLHVCQUF1QjtJQUNqQ0M7OztPQUdHQTtJQUNIQSwrRUFBU0EsQ0FBQUE7SUFFVEE7OztPQUdHQTtJQUNIQSwyRUFBT0EsQ0FBQUE7SUFFUEE7OztPQUdHQTtJQUNIQSxtRkFBV0EsQ0FBQUE7SUFFWEE7OztPQUdHQTtJQUNIQSw2RUFBUUEsQ0FBQUE7SUFFUkE7O09BRUdBO0lBQ0hBLHlFQUFNQSxDQUFBQTtJQUVOQTs7T0FFR0E7SUFDSEEsMkVBQU9BLENBQUFBO0FBQ1RBLENBQUNBLEVBbENXLHVCQUF1QixLQUF2Qix1QkFBdUIsUUFrQ2xDO0FBRUQ7O0dBRUc7QUFDSCxXQUFXLGdDQUFnQyxHQUFHO0lBQzVDLHVCQUF1QixDQUFDLFNBQVM7SUFDakMsdUJBQXVCLENBQUMsT0FBTztJQUMvQix1QkFBdUIsQ0FBQyxXQUFXO0lBQ25DLHVCQUF1QixDQUFDLFFBQVE7SUFDaEMsdUJBQXVCLENBQUMsTUFBTTtJQUM5Qix1QkFBdUIsQ0FBQyxPQUFPO0NBQ2hDLENBQUM7QUFFRjs7R0FFRztBQUNILFdBQVcsNEJBQTRCLEdBQUc7SUFDeEMsbUJBQW1CLENBQUMsWUFBWTtJQUNoQyxtQkFBbUIsQ0FBQyxhQUFhO0lBQ2pDLG1CQUFtQixDQUFDLE9BQU87Q0FDNUIsQ0FBQztBQUVGLGlEQUNJLHVCQUFnRDtJQUNsREMsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsdUJBQXVCQSxDQUFDQTtRQUNoQ0EsdUJBQXVCQSxLQUFLQSx1QkFBdUJBLENBQUNBLE9BQU9BLENBQUNBO0FBQ3JFQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7U3RyaW5nV3JhcHBlciwgbm9ybWFsaXplQm9vbCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBEZXNjcmliZXMgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGNoYW5nZSBkZXRlY3Rvci5cbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0b3JTdGF0ZSB7XG4gIC8qKlxuICAgKiBgTmV2ZXJDaGVja2VkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgaGFzIG5vdCBiZWVuIGNoZWNrZWQgeWV0LCBhbmRcbiAgICogaW5pdGlhbGl6YXRpb24gbWV0aG9kcyBzaG91bGQgYmUgY2FsbGVkIGR1cmluZyBkZXRlY3Rpb24uXG4gICAqL1xuICBOZXZlckNoZWNrZWQsXG5cbiAgLyoqXG4gICAqIGBDaGVja2VkQmVmb3JlYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IgaGFzIHN1Y2Nlc3NmdWxseSBjb21wbGV0ZWQgYXQgbGVhc3RcbiAgICogb25lIGRldGVjdGlvbiBwcmV2aW91c2x5LlxuICAgKi9cbiAgQ2hlY2tlZEJlZm9yZSxcblxuICAvKipcbiAgICogYEVycm9yZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBlbmNvdW50ZXJlZCBhbiBlcnJvciBjaGVja2luZyBhIGJpbmRpbmdcbiAgICogb3IgY2FsbGluZyBhIGRpcmVjdGl2ZSBsaWZlY3ljbGUgbWV0aG9kIGFuZCBpcyBub3cgaW4gYW4gaW5jb25zaXN0ZW50IHN0YXRlLiBDaGFuZ2VcbiAgICogZGV0ZWN0b3JzIGluIHRoaXMgc3RhdGUgd2lsbCBubyBsb25nZXIgZGV0ZWN0IGNoYW5nZXMuXG4gICAqL1xuICBFcnJvcmVkXG59XG5cbi8qKlxuICogRGVzY3JpYmVzIHdpdGhpbiB0aGUgY2hhbmdlIGRldGVjdG9yIHdoaWNoIHN0cmF0ZWd5IHdpbGwgYmUgdXNlZCB0aGUgbmV4dCB0aW1lIGNoYW5nZVxuICogZGV0ZWN0aW9uIGlzIHRyaWdnZXJlZC5cbiAqL1xuZXhwb3J0IGVudW0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICAvKipcbiAgICogYENoZWNrZWRPbmNlYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgYmVjb21lIGBDaGVja2VkYC5cbiAgICovXG4gIENoZWNrT25jZSxcblxuICAvKipcbiAgICogYENoZWNrZWRgIG1lYW5zIHRoYXQgdGhlIGNoYW5nZSBkZXRlY3RvciBzaG91bGQgYmUgc2tpcHBlZCB1bnRpbCBpdHMgbW9kZSBjaGFuZ2VzIHRvXG4gICAqIGBDaGVja09uY2VgLlxuICAgKi9cbiAgQ2hlY2tlZCxcblxuICAvKipcbiAgICogYENoZWNrQWx3YXlzYCBtZWFucyB0aGF0IGFmdGVyIGNhbGxpbmcgZGV0ZWN0Q2hhbmdlcyB0aGUgbW9kZSBvZiB0aGUgY2hhbmdlIGRldGVjdG9yXG4gICAqIHdpbGwgcmVtYWluIGBDaGVja0Fsd2F5c2AuXG4gICAqL1xuICBDaGVja0Fsd2F5cyxcblxuICAvKipcbiAgICogYERldGFjaGVkYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3Igc3ViIHRyZWUgaXMgbm90IGEgcGFydCBvZiB0aGUgbWFpbiB0cmVlIGFuZFxuICAgKiBzaG91bGQgYmUgc2tpcHBlZC5cbiAgICovXG4gIERldGFjaGVkLFxuXG4gIC8qKlxuICAgKiBgT25QdXNoYCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja09uY2VgIGR1cmluZyBoeWRyYXRpb24uXG4gICAqL1xuICBPblB1c2gsXG5cbiAgLyoqXG4gICAqIGBEZWZhdWx0YCBtZWFucyB0aGF0IHRoZSBjaGFuZ2UgZGV0ZWN0b3IncyBtb2RlIHdpbGwgYmUgc2V0IHRvIGBDaGVja0Fsd2F5c2AgZHVyaW5nIGh5ZHJhdGlvbi5cbiAgICovXG4gIERlZmF1bHQsXG59XG5cbi8qKlxuICogTGlzdCBvZiBwb3NzaWJsZSB7QGxpbmsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IHZhbHVlcy5cbiAqL1xuZXhwb3J0IHZhciBDSEFOR0VfREVURUNUSU9OX1NUUkFURUdZX1ZBTFVFUyA9IFtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuQ2hlY2tPbmNlLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja2VkLFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja0Fsd2F5cyxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGV0YWNoZWQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdFxuXTtcblxuLyoqXG4gKiBMaXN0IG9mIHBvc3NpYmxlIHtAbGluayBDaGFuZ2VEZXRlY3RvclN0YXRlfSB2YWx1ZXMuXG4gKi9cbmV4cG9ydCB2YXIgQ0hBTkdFX0RFVEVDVE9SX1NUQVRFX1ZBTFVFUyA9IFtcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5OZXZlckNoZWNrZWQsXG4gIENoYW5nZURldGVjdG9yU3RhdGUuQ2hlY2tlZEJlZm9yZSxcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZS5FcnJvcmVkXG5dO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3koXG4gICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k6IENoYW5nZURldGVjdGlvblN0cmF0ZWd5KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0JsYW5rKGNoYW5nZURldGVjdGlvblN0cmF0ZWd5KSB8fFxuICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPT09IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQ7XG59XG4iXX0=