import * as webSocketPatch from './websocket';
import {zoneSymbol, patchOnProperties, patchClass, isBrowser, isNode} from './utils';

var eventNames = 'copy cut paste abort blur focus canplay canplaythrough change click contextmenu dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange emptied ended input invalid keydown keypress keyup load loadeddata loadedmetadata loadstart message mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup pause play playing progress ratechange reset scroll seeked seeking select show stalled submit suspend timeupdate volumechange waiting mozfullscreenchange mozfullscreenerror mozpointerlockchange mozpointerlockerror error webglcontextrestored webglcontextlost webglcontextcreationerror'.split(' ');

export function propertyDescriptorPatch(_global) {
  if (isNode){
    return;
  }
  
  var supportsWebSocket = typeof WebSocket !== 'undefined';
  if (canPatchViaPropertyDescriptor()) {
    // for browsers that we can patch the descriptor:  Chrome & Firefox
    if (isBrowser) {
      patchOnProperties(HTMLElement.prototype, eventNames);
    }
    patchOnProperties(XMLHttpRequest.prototype, null);
    if (typeof IDBIndex !== 'undefined') {
      patchOnProperties(IDBIndex.prototype, null);
      patchOnProperties(IDBRequest.prototype, null);
      patchOnProperties(IDBOpenDBRequest.prototype, null);
      patchOnProperties(IDBDatabase.prototype, null);
      patchOnProperties(IDBTransaction.prototype, null);
      patchOnProperties(IDBCursor.prototype, null);
    }
    if (supportsWebSocket) {
      patchOnProperties(WebSocket.prototype, null);
    }
  } else {
    // Safari, Android browsers (Jelly Bean)
    patchViaCapturingAllTheEvents();
    patchClass('XMLHttpRequest');
    if (supportsWebSocket) {
      webSocketPatch.apply(_global);
    }
  }
}

function canPatchViaPropertyDescriptor() {
  if (isBrowser && !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick')
      && typeof Element !== 'undefined') {
    // WebKit https://bugs.webkit.org/show_bug.cgi?id=134364
    // IDL interface attributes are not configurable
    var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'onclick');
    if (desc && !desc.configurable) return false;
  }

  Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {
    get: function () {
      return true;
    }
  });
  var req = new XMLHttpRequest();
  var result = !!req.onreadystatechange;
  Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {});
  return result;
};

var unboundKey = zoneSymbol('unbound');

// Whenever any eventListener fires, we check the eventListener target and all parents
// for `onwhatever` properties and replace them with zone-bound functions
// - Chrome (for now)
function patchViaCapturingAllTheEvents() {
  for(var i = 0; i < eventNames.length; i++) {
    var property = eventNames[i];
    var onproperty = 'on' + property;
    document.addEventListener(property, function (event) {
      var elt = <Node>event.target, bound;
      var source = elt.constructor['name'] + '.' + onproperty;
      while (elt) {
        if (elt[onproperty] && !elt[onproperty][unboundKey]) {
          bound = Zone.current.wrap(elt[onproperty], source);
          bound[unboundKey] = elt[onproperty];
          elt[onproperty] = bound;
        }
        elt = elt.parentElement;
      }
    }, true);
  };
};
