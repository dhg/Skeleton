'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _buble = require('buble');

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _stream = require('stream');

var _os = require('os');

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bubleify = function (_Transform) {
  _inherits(Bubleify, _Transform);

  function Bubleify(filename, options) {
    _classCallCheck(this, Bubleify);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Bubleify).call(this));

    _this._data = '';
    _this._filename = filename;
    _this._options = options;
    return _this;
  }

  _createClass(Bubleify, [{
    key: '_transform',
    value: function _transform(buf, enc, cb) {
      this._data += buf;
      cb();
    }
  }, {
    key: '_flush',
    value: function _flush(cb) {
      try {
        var result = (0, _buble.transform)(this._data, this._bubleOptions);
        var code = result.code;


        if (this._options.sourceMap) {
          // append sourcemaps to code
          code += _os.EOL + '//# sourceMappingURL=' + result.map.toUrl();
        }

        this.emit('bubleify', result, this._filename);
        this.push(code);
      } catch (err) {
        // emit buble error message instead of the default error
        if (this._options.bubleError && err.snippet) {
          this.emit('error', '---' + _os.EOL + err.snippet + _os.EOL + _os.EOL + err.message + _os.EOL);
        } else {
          this.emit('error', err);
        }
        return;
      }
      cb();
    }
  }, {
    key: '_bubleOptions',
    get: function get() {
      var defaults = { source: this._filename };
      var options = (0, _objectAssign2.default)(defaults, this._options);

      // copy properties to not modify the existing objects
      // set default transforms with deactivated modules
      options.transforms = (0, _objectAssign2.default)({ modules: false }, this._options.transforms);
      options.target = (0, _objectAssign2.default)({}, this._options.target);

      // remove browserify options
      delete options._flags;
      delete options.sourceMap;
      delete options.extensions;
      delete options.bubleError;

      return options;
    }
  }]);

  return Bubleify;
}(_stream.Transform);

exports.default = function (filename, options) {
  // get extensions or defaults
  var _options$extensions = options.extensions;
  var extensions = _options$extensions === undefined ? ['.js', '.jsx', '.es', '.es6'] : _options$extensions;
  // convert to json

  extensions = Array.isArray(extensions) ? extensions : [extensions];

  var enrishedOptions = (0, _objectAssign2.default)({
    sourceMap: true,
    bubleError: false
  }, options, { extensions: extensions });

  var shouldIgnoreFile = extensions.indexOf((0, _path.extname)(filename)) === -1;
  // return empty stream for files that should not be transformed
  if (shouldIgnoreFile) {
    // eslint-disable-next-line new-cap
    return (0, _stream.PassThrough)();
  }

  return new Bubleify(filename, enrishedOptions);
};
//# sourceMappingURL=Bubleify.js.map