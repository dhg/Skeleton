import {_redefineProperty} from './define-property';
import {isBrowser} from './utils';

export function registerElementPatch(_global: any) {
  if (!isBrowser || !('registerElement' in (<any>_global).document)) {
    return;
  }

  var _registerElement = (<any>document).registerElement;
  var callbacks = [
    'createdCallback',
    'attachedCallback',
    'detachedCallback',
    'attributeChangedCallback'
  ];

  (<any>document).registerElement = function (name, opts) {
    if (opts && opts.prototype) {
      callbacks.forEach(function (callback) {
        var source = 'Document.registerElement::' + callback;
        if (opts.prototype.hasOwnProperty(callback)) {
          var descriptor = Object.getOwnPropertyDescriptor(opts.prototype, callback);
          if (descriptor && descriptor.value) {
            descriptor.value = Zone.current.wrap(descriptor.value, source);
            _redefineProperty(opts.prototype, callback, descriptor);
          } else {
            opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
          }
        } else if (opts.prototype[callback]) {
          opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
        }
      });
    }

    return _registerElement.apply(document, [name, opts]);
  };
}
