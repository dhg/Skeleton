import { CONST_EXPR } from 'angular2/src/facade/lang';
import { NgClass } from './ng_class';
import { NgFor } from './ng_for';
import { NgIf } from './ng_if';
import { NgStyle } from './ng_style';
import { NgSwitch, NgSwitchWhen, NgSwitchDefault } from './ng_switch';
import { NgPlural, NgPluralCase } from './ng_plural';
/**
 * A collection of Angular core directives that are likely to be used in each and every Angular
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `directives`
 * property of the `@Component` annotation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yakGwpCdUkg0qfzX5m8g?p=preview))
 *
 * Instead of writing:
 *
 * ```typescript
 * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/common';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 * one could import all the core directives at once:
 *
 * ```typescript
 * import {CORE_DIRECTIVES} from 'angular2/common';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [CORE_DIRECTIVES, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 */
export const CORE_DIRECTIVES = CONST_EXPR([
    NgClass,
    NgFor,
    NgIf,
    NgStyle,
    NgSwitch,
    NgSwitchWhen,
    NgSwitchDefault,
    NgPlural,
    NgPluralCase
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZV9kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbW1vbi9kaXJlY3RpdmVzL2NvcmVfZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFVBQVUsRUFBTyxNQUFNLDBCQUEwQjtPQUNsRCxFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVk7T0FDM0IsRUFBQyxLQUFLLEVBQUMsTUFBTSxVQUFVO09BQ3ZCLEVBQUMsSUFBSSxFQUFDLE1BQU0sU0FBUztPQUNyQixFQUFDLE9BQU8sRUFBQyxNQUFNLFlBQVk7T0FDM0IsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBQyxNQUFNLGFBQWE7T0FDNUQsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFDLE1BQU0sYUFBYTtBQUVsRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUNHO0FBQ0gsYUFBYSxlQUFlLEdBQVcsVUFBVSxDQUFDO0lBQ2hELE9BQU87SUFDUCxLQUFLO0lBQ0wsSUFBSTtJQUNKLE9BQU87SUFDUCxRQUFRO0lBQ1IsWUFBWTtJQUNaLGVBQWU7SUFDZixRQUFRO0lBQ1IsWUFBWTtDQUNiLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q09OU1RfRVhQUiwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TmdDbGFzc30gZnJvbSAnLi9uZ19jbGFzcyc7XG5pbXBvcnQge05nRm9yfSBmcm9tICcuL25nX2Zvcic7XG5pbXBvcnQge05nSWZ9IGZyb20gJy4vbmdfaWYnO1xuaW1wb3J0IHtOZ1N0eWxlfSBmcm9tICcuL25nX3N0eWxlJztcbmltcG9ydCB7TmdTd2l0Y2gsIE5nU3dpdGNoV2hlbiwgTmdTd2l0Y2hEZWZhdWx0fSBmcm9tICcuL25nX3N3aXRjaCc7XG5pbXBvcnQge05nUGx1cmFsLCBOZ1BsdXJhbENhc2V9IGZyb20gJy4vbmdfcGx1cmFsJztcblxuLyoqXG4gKiBBIGNvbGxlY3Rpb24gb2YgQW5ndWxhciBjb3JlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgbGlrZWx5IHRvIGJlIHVzZWQgaW4gZWFjaCBhbmQgZXZlcnkgQW5ndWxhclxuICogYXBwbGljYXRpb24uXG4gKlxuICogVGhpcyBjb2xsZWN0aW9uIGNhbiBiZSB1c2VkIHRvIHF1aWNrbHkgZW51bWVyYXRlIGFsbCB0aGUgYnVpbHQtaW4gZGlyZWN0aXZlcyBpbiB0aGUgYGRpcmVjdGl2ZXNgXG4gKiBwcm9wZXJ0eSBvZiB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3lha0d3cENkVWtnMHFmelg1bThnP3A9cHJldmlldykpXG4gKlxuICogSW5zdGVhZCBvZiB3cml0aW5nOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7TmdDbGFzcywgTmdJZiwgTmdGb3IsIE5nU3dpdGNoLCBOZ1N3aXRjaFdoZW4sIE5nU3dpdGNoRGVmYXVsdH0gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqIGltcG9ydCB7T3RoZXJEaXJlY3RpdmV9IGZyb20gJy4vbXlEaXJlY3RpdmVzJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ215Q29tcG9uZW50Lmh0bWwnLFxuICogICBkaXJlY3RpdmVzOiBbTmdDbGFzcywgTmdJZiwgTmdGb3IsIE5nU3dpdGNoLCBOZ1N3aXRjaFdoZW4sIE5nU3dpdGNoRGVmYXVsdCwgT3RoZXJEaXJlY3RpdmVdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKiBgYGBcbiAqIG9uZSBjb3VsZCBpbXBvcnQgYWxsIHRoZSBjb3JlIGRpcmVjdGl2ZXMgYXQgb25jZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0NPUkVfRElSRUNUSVZFU30gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcbiAqIGltcG9ydCB7T3RoZXJEaXJlY3RpdmV9IGZyb20gJy4vbXlEaXJlY3RpdmVzJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ215Q29tcG9uZW50Lmh0bWwnLFxuICogICBkaXJlY3RpdmVzOiBbQ09SRV9ESVJFQ1RJVkVTLCBPdGhlckRpcmVjdGl2ZV1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQge1xuICogICAuLi5cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgQ09SRV9ESVJFQ1RJVkVTOiBUeXBlW10gPSBDT05TVF9FWFBSKFtcbiAgTmdDbGFzcyxcbiAgTmdGb3IsXG4gIE5nSWYsXG4gIE5nU3R5bGUsXG4gIE5nU3dpdGNoLFxuICBOZ1N3aXRjaFdoZW4sXG4gIE5nU3dpdGNoRGVmYXVsdCxcbiAgTmdQbHVyYWwsXG4gIE5nUGx1cmFsQ2FzZVxuXSk7XG4iXX0=