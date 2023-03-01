/*
####################################################################################################
 * Polyfills for ish.js
####################################################################################################
Breaking Changes:
$ver                                    ver
is.arrOf                                is.arr.of
mk.age                                  mk.date.age
mk.yyyymmdd                             mk.date.yyyymmdd
mk.dateOnly                             mk.date.only
comp.*                                  cmp.*
?fn.convert                             [REMOVED]
fn.extend                               [REMOVED]
net.ping                                [Reimplemented as HEAD call]
net.ajax.*                              [REMOVED]
net.create                              net.crud.create
net.read                                net.crud.read
net.update                              net.crud.update
net.delete                              net.crud.delete
net.ajax.options                        net.options
net.ajax.xhr                            net.xhr
dom.css.*                               css.*
dom.css.add                             dom.include.css
dom.class.*                             css.class.*
data.storage                            web.storage
===
cookie().remove =>          cookie().rm
cookie().string =>          cookie().str
cookie(sName, oOptions, oDefault) => cookie(sName, oDefault, oOptions)
dom.attr.add =>             dom.setAttributes
dom.getByLineage.both =>    dom.getByLineage.any
dom.script.add =>           dom.include.script
queryString =>              web.queryString
cookie =>                   web.cookie
net.absoluteUrl =>          web.absoluteUrl
dom.include(sSrc, vCallback, bAsync) => (sSrc, oOptions)
dom.include(x, { fn: fnCallback }) => { onload: fnCallback }
===
data.map => data.obj.cp
data.cp => data.obj.cp
data.remap => data.obj.mv
data.has => [REMOVED]
data.remove => data.obj.rm
data.getKey => data.obj.get
data.arr.remove => data.arr.rm
data.arr.removeAll => data.arr.rm
data.getByValue => data.query
data.getByValues => data.query
data.getFirstByValue => data.query
data.arr.filter => data.query
===
fs.* => io.fs.*
log.* => io.log.*
event.* => io.event.*
dom.* => ui.dom.*
css.* => ui.css.*
data.csv.* => io.csv.*
data.* => type.*
cmp.* => type.*.cmp
===
type.selector.is => type.str.is.selector
type.list.is => [REMOVED]
type.coll.is => type.is.collection
type.num.is => type.is.numeric
type.json.is => type.str.is.json
type.json.mk => type.obj.mk
type.is.val => type.is.value
type.enum.is.val => type.enum.is.value
type.enum.is.desc => type.enum.is.label
type.is.ish.options => config.ish()
===
type.fn.arguments => type.fn.is.arguments
type.fn.debounce(options.immediate) => type.fn.debounce(options.leading)
type.fn.poll(options.retries) => type.fn.poll(options.maxAttempts)
type.is.numeric.rangeStr => type.is.numeric.large.range
type.is.numeric.precision => type.is.numeric.large.precision
type.is.numeric.compare => type.is.numeric.large.compare
===
io.web.cookie.str => io.web.cookie.stringify
ish.type.str.cmp.any => ish.type.str.cmp
ish.type.str.cmp.starts => ish.type.str.begins
*/


//# Polyfills
(function () {
    'use strict';


    //# Refactored from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
    if (!Date.now) {
        Date.now = function () { return new Date().getTime(); };
    } //# Date.now


    //# From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys -> http://tokenposts.blogspot.com.au/2012/04/javascript-objectkeys-browser.html
    if (!Object.keys) {
        Object.keys = function(o) {
            if (o !== Object(o))
                throw new TypeError('Object.keys called on a non-object');
            var k=[],p;
            for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
            return k;
        }
    } //# Object.keys


    //# Refactored from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    if (typeof Object.assign != 'function') {
        (function (){
            function isNullOrUndefined(q) {
                //return q === null || q === undefined;
                return q == null;
            }

            Object.defineProperty(Object, "assign", {
                // .length of function is 2
                value: function assign(target, varArgs) {
                    var oReturnVal, oSource, sKey, i,
                        a = arguments
                    ;

                    if (isNullOrUndefined(target)) {
                        throw new TypeError('Cannot convert undefined or null to object');
                    }
                    else {
                        oReturnVal = Object(target);

                        for (i = 1; i < a.length; i++) {
                            oSource = a[i];

                            if (!isNullOrUndefined(oSource)) {
                                for (sKey in oSource) {
                                    // Avoid bugs when hasOwnProperty is shadowed
                                    if (Object.prototype.hasOwnProperty.call(oSource, sKey)) {
                                        oReturnVal[sKey] = oSource[sKey];
                                    }
                                }
                            }
                        }
                    }

                    return oReturnVal;
                },
                // Must be writable: true, enumerable: false, configurable: true
                writable: true,
                //enumerable: false,
                configurable: true
            });
        }());
    } //# Object.assign


    //# document.head|body
    if (!document.head) {
        document.head = document.getElementsByTagName("HEAD")[0];
    }
    if (!document.body) {
        document.body = document.getElementsByTagName("BODY")[0];
    } //# document.head|body


    //# Document.querySelectorAll method
    //# http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed
    //# Needed for: IE7-
    //# FROM: https://github.com/inexorabletash/polyfill/blob/master/polyfill.js#L4804 , https://gist.github.com/chrisjlee/8960575
    if (!document.querySelectorAll) {
        document.querySelectorAll = function (selectors) {
            var style = document.createElement('style'), elements = [], element;
            document.documentElement.firstChild.appendChild(style);
            document._qsa = [];

            style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
            window.scrollBy(0, 0);
            style.parentNode.removeChild(style);

            while (document._qsa.length) {
                element = document._qsa.shift();
                element.style.removeAttribute('x-qsa');
                elements.push(element);
            }
            document._qsa = null;
            return elements;
        };
    }
    if (!document.querySelector) {
        document.querySelector = function (selectors) {
            var elements = document.querySelectorAll(selectors);
            return (elements.length) ? elements[0] : null;
        };
    }

    //# window.atob and window.btoa methods
    //# Needed for: <IE10
    //# FROM: https://github.com/MaxArt2501/base64-js/blob/master/base64.js , https://github.com/MaxArt2501/base64-js
    if (!window.atob || !window.btoa) {
        (function (root, factory) {
            if (typeof define === 'function' && define.amd) {
                // AMD. Register as an anonymous module.
                define([], function() {factory(root);});
            } else factory(root);
        // node.js has always supported base64 conversions, while browsers that support
        // web workers support base64 too, but you may never know.
        })(typeof exports !== "undefined" ? exports : this, function(root) {
            if (root.atob) {
                // Some browsers' implementation of atob doesn't support whitespaces
                // in the encoded string (notably, IE). This wraps the native atob
                // in a function that strips the whitespaces.
                // The original function can be retrieved in atob.original
                try {
                    root.atob(" ");
                } catch(e) {
                    root.atob = (function(atob) {
                        var func = function(string) {
                            return atob(String(string).replace(/[\t\n\f\r ]+/g, ""));
                        };
                        func.original = atob;
                        return func;
                    })(root.atob);
                }
                return;
            }

                // base64 character set, plus padding character (=)
            var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                // Regular expression to check formal correctness of base64 encoded strings
                b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

            root.btoa = function(string) {
                string = String(string);
                var bitmap, a, b, c,
                    result = "", i = 0,
                    rest = string.length % 3; // To determine the final padding

                for (; i < string.length;) {
                    if ((a = string.charCodeAt(i++)) > 255
                            || (b = string.charCodeAt(i++)) > 255
                            || (c = string.charCodeAt(i++)) > 255)
                        throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");

                    bitmap = (a << 16) | (b << 8) | c;
                    result += b64.charAt(bitmap >> 18 & 63) + b64.charAt(bitmap >> 12 & 63)
                            + b64.charAt(bitmap >> 6 & 63) + b64.charAt(bitmap & 63);
                }

                // If there's need of padding, replace the last 'A's with equal signs
                return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
            };

            root.atob = function(string) {
                // atob can work with strings with whitespaces, even inside the encoded part,
                // but only \t, \n, \f, \r and ' ', which can be stripped.
                string = String(string).replace(/[\t\n\f\r ]+/g, "");
                if (!b64re.test(string))
                    throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");

                // Adding the padding if missing, for semplicity
                string += "==".slice(2 - (string.length & 3));
                var bitmap, result = "", r1, r2, i = 0;
                for (; i < string.length;) {
                    bitmap = b64.indexOf(string.charAt(i++)) << 18 | b64.indexOf(string.charAt(i++)) << 12
                            | (r1 = b64.indexOf(string.charAt(i++))) << 6 | (r2 = b64.indexOf(string.charAt(i++)));

                    result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255)
                            : r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255)
                            : String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
                }
                return result;
            };
        });
    }
}());
