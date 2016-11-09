(function() {
'use strict';

var MODULE_NAME = 'instant2fa';
var HOSTED_JS_URL = 'https://js.instant2fa.com/hosted.js';

var OPTIONS = {
  uri: ['data-uri', 'string']
};


var angular;

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
  angular = require('angular');
  module.exports = MODULE_NAME;
} else {
  angular = window.angular;
}

var extend = angular.extend;

angular.module(MODULE_NAME,[])
  .directive('instant2fa', Instant2FADirective)
  .provider('Instant2FA', Instant2FAProvider);


Instant2FADirective.$inject = ['$parse', 'Instant2FA'];

function Instant2FADirective($parse, Instant2FA) {
  return { link: link };

  function link(scope, el, attrs) {
    Instant2FA.load()
      .then(function() {
        var options = getOptions(el);

        var callback = $parse(attrs.instant2fa)(scope);

        Instant2FA.configure(options, callback);
      });
  }
}

function Instant2FAProvider() {
  var defaults = {};

  this.defaults = function(options) {
    extend(defaults,options);
  };


  this.load = function(Instant2FA) {
    return Instant2FA.load();
  };

  this.load.$inject = ['Instant2FA'];



  this.$get = function($document, $q) {
    return new Instant2FAService($document,$q,defaults);
  };

  this.$get.$inject = ['$document', '$q'];
}


function Instant2FAService($document, $q, providerDefaults) {
  var defaults = {};
  var promise;

  this.configure = function(options, callback) {
    return new window.Instant2FAPage(extend({},
      providerDefaults,
      defaults,
      options
    ), callback);
  };

  this.load = function() {
    if (!promise)
      promise = loadLibrary($document,$q);

    return promise;
  };

  this.defaults = function(options) {
    extend(defaults,options);
  };
}

function getOptions(el) {
  var opt, def, val, options = {};

  for (opt in OPTIONS) {
    if (!OPTIONS.hasOwnProperty(opt))
      continue;

    def = OPTIONS[opt];
    val = parseValue(el.attr(def[0]),def[1]);

    if (val != null)
      options[opt] = val;
  }

  options.element = el[0];

  return options;
}

function loadLibrary($document, $q) {
  var deferred = $q.defer();

  var doc = $document[0];
  var script = doc.createElement('script');
  script.src = HOSTED_JS_URL;

  script.onload = function () {
    deferred.resolve();
  };

  script.onreadystatechange = function () {
    var rs = this.readyState;
    if (rs === 'loaded' || rs === 'complete')
      deferred.resolve();
  };

  script.onerror = function () {
    deferred.reject(new Error('Unable to load hosted.js'));
  };

  var container = doc.getElementsByTagName('head')[0];
  container.appendChild(script);

  return deferred.promise;
}

function parseValue(value, type) {
  if (type === 'boolean') {
    return value && value !== 'false';
  } else if (type === 'number') {
    return value && Number(value);
  } else if (type === 'boolean-or-auto') {
    if (value === 'auto')
      return value;
    else
      return parseValue(value,'boolean');
  } else {
    return value;
  }
}

})();
