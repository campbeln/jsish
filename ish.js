//################################################################################################
/** @file Q: Are you using Vanilla Javascript?<br/>A: ...ish
 * <div style="font-size: 75%; margin-top: 20px;">
 *  Javascript code snippets organized in an isomorphic OOP structure, including:
 *  <ul>
 *      <li>Type-safety and type-casting - assisting developers in overcoming issues related to loose typing via Vanilla Javascript (rather than syntactic sugar à la TypeScript)</li>
 *      <li>OOP features - partial class definitions with shared private members, dynamic polymorphism/function overloading, and multiple inheritance</li>
 *      <li>Object traversal, extension and querying features</li>
 *      <li>Custom events</li>
 *      <li>Data interpolation - CSV, XML, Punycode and POJO parsing</li>
 *      <li>Additional Types - Enumerations, GUID</li>
 *      <li>Large/small number support</li>
 *      <li>Support back to IE8, with most features supported back to IE6</li>
 *      <li>Growing unit test coverage with <code><a href="https://www.chaijs.com/api/assert/" target="_new">Chai.Assert</a></code></li>
 *  </ul>
 *  with all non-UI features available both client-side (in-browser) and server-side (Node/etc.).
 *  <p style="margin-top: 20px;">
 *      All features are organized in individually includable mixins organized by namespace/major features with only the core <code>ish.js</code> functionality required to bootstrap.
 *  </p>
 * </div>
 * @version 0.12.2019-12-30
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
 */ /**
 * ish.js's (renameable) global object.
 * @namespace ish
 */ //############################################################################################
/*global module, define, global, require, process, __dirname*/  //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function (/*global, module, require, process, __dirname*/) {
    'use strict';

    var bServerside = (typeof window === 'undefined'), // this.window !== this      //# Are we running under nodeJS (or possibly have been required as a CommonJS module), SEE: https://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js
        _root = (bServerside ? global : window),                                    //# code-golf
        _document = (bServerside ? {} : document),                                  //# code-golf
        _undefined /*= undefined*/,                                                 //# code-golf
        _null = null,                                                               //# code-golf
        _Object_prototype_toString = Object.prototype.toString,                     //# code-golf
        _Date_now = Date.now,                                                       //# code-golf
        oPrivate = {},
        oTypeIsIsh = { //# Set the .ver and .target under .type.is.ish (done here so it's at the top of the file for easy editing) then stub out the .app and .lib with a new .pub oInterfaces for each
            config: {
                ver: '0.12.2019-12-30',
                onServer: bServerside,
                debug: true,
                //script: _undefined,
                target: "ish",
                plugins: {
                    //import: [],
                    //path: "", // _document.currentScript.src,
                    //cache: false,
                    //importedBy: ""
                },
                typeOrder: [
                    'bool',
                    'int', 'float', /*'numeric',*/
                    'date', 'str',
                    'fn', 'dom', 'arr', /*'collection',*/ 'obj',
                    'symbol'
                ]
            },
            public: {
                //is: function () {},
                //import: function () {},
                expectedErrorHandler: function expectedErrorHandler(/*e*/) {}
            }
        },
        oInterfaces = {
            pub: function () {
                return {
                    data: {},
                    //options: {},
                    ui: {}
                };
            }
        }, //# oInterfaces
        core = {
            //config: function (oConfig) { return function () {}; },
            //resolve: function () {},
            //extend: function () {},
            //require: function () {},
            //type: {},
            //oop: {},
            //io: {},
            //ui: {},
            //app: oInterfaces.pub(),
            //lib: oInterfaces.pub() //# + sync
        }
    ;

    //# Null function used as a placeholder when a valid function reference is required
    function noop() {} //# noop


    //################################################################################################
    /** Collection of Type-based functionality (<code>is</code> and <code>mk</code> only)
     * @namespace ish.type
     */ //############################################################################################
    core.type = function () {
        //# Thanks to Symbol()s not wanting to be casted to strings or numbers (i.e. parseFloat, regexp.test, new Date), we need to wrap the test below for the benefit of ish.type()
        function mkStr(s) {
            try {
                s = (s + "");
            } catch (e) {
                s = "";
            }
            return s;
        }

        //#########
        /** Determines the type of the passed value.
         * @function ish.type.!
         * @param {variant} x Value to interrogate.
         * @param {variant[]} [a_vOrder=ish.config.ish().typeOrder] Type ordering to use during interrogation.
         * @returns {function} Value indicating the type of the passed value.
         * @todo Detail recognized a_vOrder values
         */ //#####
        function type(x, a_vOrder) {
            var fnCurrent, vCurrent, i,
                fnReturnVal /* = _undefined */
            ;

            //# Ensure the passed a_vOrder is an array, defaulting to our .typeOrder if none was passed
            a_vOrder = core.type.arr.mk(a_vOrder, core.config.ish().typeOrder);

            //# If we have a a_vOrder to traverse, do so now calculating each fnCurrent as we go
            //#     NOTE: We avoid using core.type.fn.* below to keep the code requirements to just that which is defined herein
            if (core.type.arr.is(a_vOrder, true)) {
                for (i = 0; i < a_vOrder.length; i++) {
                    //# Try to .resolve the current a_vOrder from core.type.*||core.type.is.*, else .mk it a .fn (defaulting to .noop on failure)
                    //#     NOTE: We avoid using core.resolve below to keep the code requirements to just that which is defined herein
                    vCurrent = a_vOrder[i];
                    fnCurrent = (
                        (core.type[vCurrent] || {}).is ||
                        core.type.is[vCurrent] ||
                        core.type.fn.mk(vCurrent)
                    );

                    //# If the passed x returns true from the fnCurrent (indicating that it's of that type), reset our fnReturnVal and fall form the loop
                    //#     NOTE: If fnCurrent is set to .noop above, it return nothing/undefined which is interpreted as false below
                    if (fnCurrent(x)) {
                        fnReturnVal = fnCurrent;
                        break;
                    }
                }
            }

            return fnReturnVal;
        } //# ish.type

        //#########
        /** Determines if the passed value is an instance of the referenced type.
         * @namespace ish.type.is
         */ /**
         * Determines if the passed value is an instance of the passed type.
         * @function ish.type.is.!
         * @param {variant} x Value to interrogate.
         * @param {variant} t Type to use during interrogation.
         * @returns {boolean} Value representing if the passed value is an instance of the passed type.
         */ //#####
        type.is = function isType(x, t) {
            try {
                return (x instanceof t);
            } catch (e) {
                return false;
            }
        }; //# ish.type.is

        //#########
        /** Determines if the passed value is a native Javascript function or object.
         * @function ish.type.is.native
         * @param {variant} x Value to interrogate.
         * @returns {boolean} Value representing if the passed value is a native Javascript function or object.
         * @see {@link http://davidwalsh.name/essential-javascript-functions|DavidWalsh.name}
         */ //#####
        type.is.native = function () {
            var toString = Object.prototype.toString,       // Used to resolve the internal `[[Class]]` of values
                fnToString = Function.prototype.toString,   // Used to resolve the decompiled source of functions
                reHostCtor = /^\[object .+?Constructor\]$/, // Used to detect host constructors (Safari > 4; really typed array specific)
                reNative = RegExp('^' +                     // Compile a regexp using a common native method as a template. We chose `Object#toString` because there's a good chance it is not being mucked with.
                    String(toString)                                // Coerce `Object#toString` to a string
                        .replace(/[.*+?^${}()|[\]/\\]/g, '\\$&')    // Escape any special regexp characters
                        .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
                    '$'                                             // Replace mentions of `toString` with `.*?` to keep the template generic. Replace thing like `for ...` to support environments like Rhino which add extra info such as method arity.
                )
            ;

            return function isNative(x) {
                var type = typeof x;
                return type == 'function' ?
                    reNative.test(fnToString.call(x)) : // Use `Function#toString` to bypass x's own `toString` method and avoid being faked out.
                    (x && type == 'object' && reHostCtor.test(toString.call(x))) || // Fallback to a host object check because some environments will represent things like typed arrays as DOM methods which may not conform to the normal native pattern.
                    false
                ;
            };
        }(); //# ishtype.is.native
        /*native: function () {
            var toString = Object.prototype.toString,       // Used to resolve the internal `[[Class]]` of x
                fnToString = Function.prototype.toString,   // Used to resolve the decompiled source of functions
                reHostCtor = /^\[object .+?Constructor\]$/, // Used to detect host constructors (Safari > 4; really typed array specific)
                reNative = RegExp('^' +                     // Compile a regexp using a common native method as a template. We chose `Object#toString` because there's a good chance it is not being mucked with.
                    String(toString)                                // Coerce `Object#toString` to a string
                        .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')   // Escape any special regexp characters
                                                                    // Replace mentions of `toString` with `.*?` to keep the template generic.
                                                                    // Replace thing like `for ...` to support environments like Rhino which add extra info such as method arity.
                        .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
                    '$'
                )
            ;
            return function (x) {
                var type = typeof x;
                return x == 'function' ?
                    reNative.test(fnToString.call(x)) :     // Use `Function#toString` to bypass the x's own `toString` method and avoid being faked out.
                                                            // Fallback to a host object check because some environments will represent things like typed arrays as DOM methods which may not conform to the normal native pattern.
                    (x && type == 'object' && reHostCtor.test(toString.call(x))) || false
                ;
            }
        }(), //# ish.type.is.native*/

        //#########
        /** Determines if the passed value is a list type (e.g. HTMLCollection|HTMLFormControlsCollection|HTMLOptionsCollection|NodeList|NamedNodeMap|Arguments + Object to support &lt;IE9).
         * @function ish.type.is.collection
         * @param {variant} x Value to interrogate.
         * @param {object|boolean} [vOptions=false] Value representing if empty collections are to be ignored or the desired options:
         *      @param {boolean} [vOptions.disallow0Length=false] Value representing if empty collections are to be ignored.
         *      @param {boolean} [vOptions.allowObject=false] Value representing if Objects are to be included in the test (to support &lt;IE9).
         *      @param {boolean} [vOptions.allowArray=false] Value representing if Arrays are to be included in the test.
         * @returns {boolean} Value representing if the passed value is a collection type.
         */ //#####
        type.is.collection = function isCollection(x, vOptions) {
            var oOptions = core.type.obj.mk(vOptions),
                bDisallow0Length = (vOptions === true || oOptions.disallow0Length)
            ;

            return (
                (oOptions.allowObject && core.type.obj.is(x, { nonEmpty: bDisallow0Length })) ||
                (oOptions.allowArray && core.type.arr.is(x, bDisallow0Length)) ||
                (
                    (x && core.type.is.numeric(x.length) && (!bDisallow0Length || x.length > 0)) &&
                    /^\[object (HTMLCollection|HTMLFormControlsCollection|HTMLOptionsCollection|NodeList|NamedNodeMap|Arguments)\]$/.test(Object.prototype.toString.call(x))
                )
            );
        }; //# ish.type.is.collection

        //#########
        /** Determines if the passed value is a numeric value (includes implicit casting per the Javascript rules, see: {@link: ish.type.int.mk}).
         * @function ish.type.is.numeric
         * @param {variant} x Value to interrogate.
         * @returns {boolean} Value representing if the passed value is a numeric type.
         */ //#####
        type.is.numeric = function isNumeric(x) {
            var reNumber = /^[-0-9]?[0-9]*(\.[0-9]{1,})?$/, // (bAllowCommaDecimal === true ? /^[-0-9]?[0-9]*([\.\,][0-9]{1,})?$/ : /^[-0-9]?[0-9]*(\.[0-9]{1,})?$/),
                bReturnVal = false
            ;

            //# Thanks to Symbol()s not wanting to be casted to strings or numbers (i.e. parseFloat, regexp.test, new Date), we need to wrap the test below for the benefit of ish.type()
            try {
                bReturnVal = (
                    reNumber.test(x) &&
                    !isNaN(parseFloat(x)) &&
                    isFinite(x)
                );
            } catch (e) {}

            return bReturnVal;
        }; //# ish.type.is.numeric

        //#########
        /** Determines if the passed value is an instance of ish.js.
         * @function ish.type.is.ish
         * @param {variant} x Value to interrogate.
         * @returns {boolean} Value representing if the passed value is an instance of ish.js.
         */ //#####
        type.is.ish = function isIsh(x) {
            return (arguments.length === 0 || x === core);
        }; //# ish.type.is.ish

        //####
        //####

        //#########
        /** Boolean-based type functionality.
         * @namespace ish.type.bool
         */ //#####
        type.bool = {
            //#########
            /** Determines if the passed value represents a boolean.
             * @function ish.type.bool.is
             * @param {variant} x Value to interrogate.
             * @param {boolean} [bAllowString=false] Value representing if strings are to be considered valid.
             * @returns {boolean} Value representing if the passed value represents a boolean.
             */ //#####
            is: function isBool(x, bAllowString) {
                var sB = mkStr(x).toLowerCase().trim();

                return !!(
                    _Object_prototype_toString.call(x) === '[object Boolean]' ||
                    (bAllowString && (sB === "true" || sB === "false"))
                );
            }, //# bool.is

            //#########
            /** Casts the passed value into a boolean.
             * @function ish.type.bool.mk
             * @param {variant} x Value to interrogate.
             * @param {variant} [vDefaultVal=truthy_value_of_x] Value representing the default return value if casting fails.
             * @returns {boolean} Value representing the passed value as a boolean type.
             */ //#####
            mk: function (x, vDefaultVal) {
                var bReturnVal = (
                    arguments.length > 1 ?
                    vDefaultVal : (
                        x ? true : false
                    )
                );

                //# Since the bReturnVal was defaulted to the vDefaultVal above, pull it's value back into our vDefaultVal
                vDefaultVal = bReturnVal;

                //#
                if (core.type.bool.is(x)) {
                    bReturnVal = x;
                }
                //#
                else if (core.type.str.is(x, true)) {
                    x = x.trim().toLowerCase();
                    bReturnVal = (x === 'true' || (
                        x === 'false' ? false : vDefaultVal
                    ));
                }

                return bReturnVal;
            } //# bool.mk
        }; //# ish.type.bool

        //#########
        /** Integer-based type functionality.
         * @namespace ish.type.int
         */ //#####
        type.int = {
            //#########
            /** Determines if the passed value represents an integer (includes implicit casting per the Javascript rules, see: {@link: ish.type.int.mk}).
             * @function ish.type.int.is
             * @param {variant} x Value to interrogate.
             * @returns {boolean} Value representing if the passed value represents an integer.
             */ //#####
            is: function isInt(x) {
                var fX = core.type.float.mk(x);
                return (core.type.is.numeric(x) && fX % 1 === 0);
            }, //# int.is

            //#########
            /** Casts the passed value into an integer (includes implicit casting per the Javascript rules, see below).
             * @function ish.type.int.mk
             * @param {variant} x Value to interrogate.
             * @param {variant} [vDefaultVal=0] Value representing the default return value if casting fails.
             * @param {integer} [iRadix=10] Value between 2-36 that represents the radix (the base in mathematical numeral systems) passed into <code>parseInt</code>.
             * @returns {integer} Value representing the passed value as an integer type.
             * @example
             *    <caption>
             *      Javascript has some funky rules when it comes to casting numeric values, and they are at play in this function.
             *      <br/>In short, the first non-whitespace numeric characters are used in the cast, until any non-numeric character is hit.
             *    </caption>
             *     "12 monkeys!" === 12;
             *     "   12 monkeys!" === 12;
             *     "12monkeys!" === 12;
             *     "1.2 monkeys!" === 1.2;
             *     "1,2 monkeys!" === 1; // (not 1.2, sorry Europe)
             *     "1 2 monkeys!" === 1; // (not 12)
             *     "1,200 monkeys!" === 1; // (not 1200)
             *     "11 - there were 12 monkeys!" === 11;
             *     "twelve (12) monkeys!" === undefined;
             *     "$12 monkeys!" === undefined;
             */ //#####
            mk: function (x, vDefaultVal, iRadix) {
                var iReturnVal = parseInt(x, (iRadix > 1 && iRadix < 37 ? iRadix : 10));

                return (!isNaN(iReturnVal) ?
                    iReturnVal :
                    (arguments.length > 1 ? vDefaultVal : 0)
                );
            } //# int.mk
        }; //# ish.type.int

        //#########
        /** Floating Point Number-based type functionality.
         * @namespace ish.type.float
         */ //#####
        type.float = {
            //#########
            /** Determines if the passed value represents a floating point number (includes implicit casting per the Javascript rules, see: {@link: ish.type.int.mk}).
             * @function ish.type.float.is
             * @param {variant} x Value to interrogate.
             * @returns {boolean} Value representing if the passed value represents a floating point number.
            */ //#####
            is: function isFloat(x) {
                var fX = core.type.float.mk(x);
                return (core.type.is.numeric(x) && fX % 1 !== 0);
            }, //# float.is

            //#########
            /** Casts the passed value into a floating point number (includes implicit casting per the Javascript rules, see: {@link: ish.type.int.mk}).
             * @function ish.type.float.mk
             * @param {variant} x Value to interrogate.
             * @param {variant} [vDefaultVal=0] Value representing the default return value if casting fails.
             * @param {integer} [iRadix=10] Value between 2-36 that represents the radix (the base in mathematical numeral systems) passed into <code>parseFloat</code>.
             * @returns {float} Value representing the passed value as an floating point number type.
            */ //#####
            mk: function (x, vDefaultVal, iRadix) {
                var fReturnVal;

                //# Thanks to Symbol()s not wanting to be casted to strings or numbers (i.e. parseFloat, regexp.test, new Date), we need to wrap the test below for the benefit of ish.type()
                try {
                    fReturnVal = parseFloat(x, (iRadix > 1 && iRadix < 37 ? iRadix : 10));
                } catch (e) {}

                return (!isNaN(fReturnVal) ?
                    fReturnVal :
                    (arguments.length > 1 ? vDefaultVal : 0)
                );
            } //# float.mk
        }; //# ish.type.float

        //#########
        /** Date-based type functionality.
         * @namespace ish.type.date
         */ //#####
        type.date = function () {
            //#
            function mkDate(d, bAllowNumeric) {
                var bIsDate = _Object_prototype_toString.call(d) === "[object Date]";

                //# If the passed d(ate) isn't an [object Date]
                if (!bIsDate) {
                    //# If the passed d(ate) .is.numeric, parse it as a float (to allow for the widest values) and reset bIsDate
                    //#     NOTE: We have to do this before .is .str as "0" will resolve to a string
                    if (bAllowNumeric && core.type.is.numeric(d)) {
                        d = new Date(parseFloat(d));
                        bIsDate = !isNaN(d.valueOf());
                    }
                    //# Else if the passed d(ate) .is .str, try throwing it at new Date() and reset bIsDate
                    else if (core.type.str.is(d)) {
                        d = new Date(d);
                        bIsDate = !isNaN(d.valueOf());
                    }
                }

                return {
                    b: bIsDate,
                    d: d
                };
            } //# mkDate


            return {
                //#########
                /** Determines if the passed value represents a date.
                 * @function ish.type.date.is
                 * @param {variant} x Value to interrogate.
                 * @returns {boolean} Value representing if the passed value represents a date.
                 */ //#####
                is: function isDate(x, bAllowNumeric) {
                    return mkDate(x, bAllowNumeric).b;
                }, //# date.is

                //#########
                /** Casts the passed value into a date.
                 * @function ish.type.date.mk
                 * @param {variant} x Value to interrogate.
                 * @param {variant} [vDefaultVal=new Date()] Value representing the default return value if casting fails.
                 * @returns {Date} Value representing the passed value as a date type.
                 */ //#####
                mk: function (x, vDefaultVal) {
                    var oResult = mkDate(x, true);

                    return (oResult.b ?
                        oResult.d :
                        (arguments.length > 1 ? vDefaultVal : new Date())
                    );
                } //# date.mk
            };
        }(); //# ish.type.date

        //#########
        /** String-based type functionality.
         * @namespace ish.type.str
         */ //#####
        type.str = {
            //#########
            /** Determines if the passed value represents a string.
             * @function ish.type.str.is
             * @param {variant} x Value to interrogate.
             * @param {boolean} [bDisallowNullString=false] Value representing if null-strings (e.g. "") are to be disallowed.
             * @param {boolean} [bTrimWhitespace=false] Value representing if leading and trailing whitespace is to be trimmed prior to integration.
             * @returns {boolean} Value representing if the passed value represents a string.
             */ //#####
            is: function isStr(x, bDisallowNullString, bTrimWhitespace) {
                return (
                    (typeof x === 'string' || x instanceof String) &&
                    (!bDisallowNullString || x !== "") &&
                    (!bTrimWhitespace || mkStr(x).trim() !== "")
                );
            }, //# str.is

            //#########
            /** Casts the passed value into a string.
             * @function ish.type.str.mk
             * @param {variant} x Value to interrogate.
             * @param {variant} [vDefaultVal=""] Value representing the default return value if casting fails.
             * @returns {string} Value representing the passed value as a string type.
             */ //#####
            mk: function (x, vDefaultVal) {
                var sS = (core.type.obj.is(x, { strict: true }) ? JSON.stringify(x) : mkStr(x));

                return ((x || x === false || x === 0) && sS ?
                    sS :
                    (arguments.length > 1 ? vDefaultVal : "")
                );
            } //# str.mk
        }; //# ish.type.str

        //#########
        /** Function-based type functionality.
         * @namespace ish.type.fn
         */ //#####
        type.fn = {
            //#########
            /** Determines if the passed value represents a function.
             * @function ish.type.fn.is
             * @param {variant} x Value to interrogate.
             * @returns {boolean} Value representing if the passed value represents a function.
             */ //#####
            is: function isFn(x) {
                return (_Object_prototype_toString.call(x) === '[object Function]');
            }, //# fn.is

            //#########
            /** Casts the passed value into a function.
             * @function ish.type.fn.mk
             * @param {variant} x Value to interrogate.
             * @param {variant} [vDefaultVal=ish.type.fn.noop] Value representing the default return value if casting fails.
             * @returns {function} Value representing the passed value as a function type.
             */ //#####
            mk: function (x, vDefaultVal) {
                var vResolved,
                    fnResolve = core.resolve || function (_root, sKey) { return _root[sKey]; },
                    fnReturnVal = (arguments.length > 1 ? vDefaultVal : noop)
                ;

                //# If the passed x .is a .fn, reset our fnReturnVal to it
                if (core.type.fn.is(x)) {
                    fnReturnVal = x;
                }
                //# Else we need to see if f can be vResolved
                else {
                    vResolved = (core.type.str.is(x) || core.type.arr.is(x) ? fnResolve(_root, x) : _undefined);

                    //# If the passed f .is a .str or .arr and we vResolved it to a .fn, reset our fnReturnVal to it
                    if (core.type.fn.is(vResolved)) {
                        fnReturnVal = vResolved;
                    }
                }

                return fnReturnVal;
            } //# fn.mk
        }; //# ish.type.fn

        //#########
        /** Array-based type functionality.
         * @namespace ish.type.arr
         */ //#####
        type.arr = {
            //#########
            /** Determines if the passed value represents an array.
             * @function ish.type.arr.is
             * @param {variant} x Value to interrogate.
             * @param {boolean} [bDisallow0Length=false] Value representing if zero length arrays are to be ignored.
             * @returns {boolean} Value representing if the passed value represents an array.
             */ //#####
            is: function isArr(x, bDisallow0Length) {
                return (_Object_prototype_toString.call(x) === '[object Array]' &&
                    (!bDisallow0Length || x.length > 0)
                );
            }, //# arr.is

            //#########
            /** Casts the passed value into an array.
             * @function ish.type.arr.mk
             * @param {variant} x Value to interrogate.
             * @param {variant} [vDefaultVal=[]] Value representing the default return value if casting fails.
             * @returns {variant[]} Value representing the passed value as an array type.
             */ //#####
            mk: function (x, vDefaultVal) {
                //# Preconvert a .collection reference into an array
                x = (core.type.is.collection(x) ? Array.prototype.slice.call(x) : x);

                return (core.type.arr.is(x) ?
                    x :
                    (arguments.length > 1 ? vDefaultVal : [])
                );
            } //# arr.mk
        }; //# ish.type.arr

        //#########
        /** Object-based type functionality.
         * @namespace ish.type.obj
         */ //#####
        type.obj =function () {
            //#
            function mkJSON(v) {
                try {
                    return JSON.parse(v);
                } catch (e) {/*oTypeIsIsh.public.expectedErrorHandler(e);*/}
            } //# mkJSON

            //#
            function objBase(v, bAllowFn, bAllowJSON, bStrict) {
                var bReturnVal = !!(
                    v && v === Object(v) && (bAllowFn || !core.type.fn.is(v)) &&
                    (!bStrict || _Object_prototype_toString.call(v) === '[object Object]')
                );

                //# If we failed the test above, we are bAllow(ing)JSON and the passed v(ariant) .is .str
                if (!bReturnVal && bAllowJSON && core.type.str.is(v, true)) {
                    //# .mkJSON the passed v(ariant), resetting our bReturnVal based on it's success
                    v = mkJSON(v);
                    bReturnVal = !!(v);
                }

                return {
                    b: bReturnVal,
                    o: v
                };
            } //# objBase


            return {
                //#########
                /** Determines if the passed value represents an object.
                 * @function ish.type.object.is
                 * @param {variant} x Value to interrogate.
                 * @param {boolean|object} [vOptions] Value representing if empty objects are to be ignored or the following options:
                 *      @param {boolean} [vOptions.nonEmpty=false] Value representing if empty objects are to be ignored.
                 *      @param {boolean} [vOptions.strict=false] Value representing if only <code>[object Objects]</code> are to be allowed.
                 *      @param {boolean} [vOptions.allowFn=false] Value representing if functions are to be allowed.
                 *      @param {boolean} [vOptions.allowJSON=false] Value representing if JSON-strings are to be allowed.
                 *      @param {boolean} [vOptions.requiredKeys=undefined] Value listing the keys required to be present in the object.
                 *      @param {boolean} [vOptions.interface=false] Value representing the required the keys and types (see: {@link: ish.type}).
                 * @returns {boolean} Value representing if the passed value represents an object.
                 */ //#####
                is: function isObj(x, vOptions) {
                    var fnTest, a_sInterfaceKeys, i, bReturnVal,
                        oSettings = (vOptions && vOptions === Object(vOptions) ? vOptions : {}),
                        a_sRequiredKeys = oSettings.requiredKeys,
                        oInterface = oSettings.interface,
                        bDisallowEmptyObject = !!(vOptions === true || oSettings.nonEmpty)
                    ;

                    //# Call objBase to determine the validity of the passed o(bject), storing the results back in out o(bject) and bReturnVal
                    x = objBase(x, oSettings.allowFn, oSettings.allowJSON, oSettings.strict);
                    bReturnVal = x.b;
                    x = x.o;

                    //# If the passed o(bject) is valid
                    if (bReturnVal) {
                        //# Reset our bReturnVal based on bDisallowEmptyObject
                        bReturnVal = (!bDisallowEmptyObject || Object.keys(x).length !== 0);

                        //# If we still have a valid Object and we have a_sRequiredKeys, traverse them
                        if (bReturnVal && core.type.arr.is(a_sRequiredKeys, true)) {
                            for (i = 0; i < a_sRequiredKeys.length; i++) {
                                //# If the current a_sRequiredKeys is missing from our o(bject), flip our bReturnVal and fall from the loop
                                if (!x.hasOwnProperty(a_sRequiredKeys[0])) {
                                    bReturnVal = false;
                                    break;
                                }
                            }
                        }

                        //# If we still have a valid Object and we have an oInterface, collect it's a_sInterfaceKeys
                        //#     NOTE: We use the lower-level call to Object.keys rather than core.type.arr.ownKeys as this is a lower-level ish function
                        if (bReturnVal && objBase(oInterface).b) {
                            a_sInterfaceKeys = Object.keys(oInterface);

                            //# Traverse the a_sInterfaceKeys, processing each to ensure they are present in the passed o(bject)
                            for (i = 0; i < a_sInterfaceKeys.length; i++) {
                                fnTest = oInterface[a_sInterfaceKeys[i]];
                                fnTest = (core.type.fn.is(fnTest) ? fnTest : core.resolve(core.type, [a_sInterfaceKeys[i], "is"]));

                                //# If the passed o(bject) doesn't have the current a_sInterfaceKeys or it's invalid per the current fnTest, reset our bReturnVal and fall from the loop
                                if (!x.hasOwnProperty(a_sInterfaceKeys[i]) || !core.type.fn.call(fnTest, null, x[a_sInterfaceKeys[i]])) {
                                    bReturnVal = false;
                                    break;
                                }
                            }
                        }
                    }

                    return bReturnVal;
                }, //# obj.is

                //#########
                /** Casts the passed value into an object.
                 * @function ish.type.obj.mk
                 * @param {variant} x Value to interrogate.
                 * @param {variant} [vDefaultVal={}] Value representing the default return value if casting fails.
                 * @returns {object} Value representing the passed value as an object type.
                 */ //#####
                mk: function (x, vDefaultVal) {
                    //# If the passed o(bject) .is .str, try to .mkJSON
                    if (core.type.str.is(x, true)) {
                        x = mkJSON(x);
                    }

                    return (core.type.obj.is(x, { allowFn: true }) ?
                        x :
                        (arguments.length > 1 ? vDefaultVal : {})
                    );
                }, //# obj.mk
            };
        }(); //# ish.type.obj

        //#########
        /** Symbol-based type functionality.
         * @namespace ish.type.symbol
         */ //#####
        type.symbol = {
            //#########
            /** Determines if the Symbol type is present in the current environment.
             * @function ish.type.symbol.exists
             * @returns {symbol} Value representing if the Symbol type is present in the current environment.
             */ //#####
            exists: function () {
                return core.type.fn.is(_root.Symbol);
            }, //# symbol.exists

            //#########
            /** Determines if the passed value represents a symbol.
             * @function ish.type.symbol.is
             * @param {variant} x Value to interrogate.
             * @returns {symbol} Value representing if the passed value represents a symbol.
             */ //#####
            is: function (x) {
                //#     NOTE: Since the typeof call is gated by .symbol.exists below, we need to selectively enable esnext for this function in JSHint below (besides, it's not a real error, just ES6 safety from JSHint)
                /* jshint esnext: true */
                return (core.type.symbol.exists() && typeof x === 'symbol');
            }, //# symbol.is

            //#########
            /** Casts the passed value into a symbol.
             * @function ish.type.symbol.mk
             * @param {variant} x Value to interrogate.
             * @param {variant} [vDefaultVal=Symbol()] Value representing the default return value if casting fails.
             * @returns {symbol} Value representing the passed value as a symbol type.
             */ //#####
            mk: function (x, vDefaultVal) {
                return (core.type.symbol.is(x) ?
                    x :
                    (arguments.length === 1 ?
                        //# If .symbol.exists, create a new Symbol(), optionally using the passed x if it .is .str, else use a new blank object if !.symbol.exists
                        (core.type.symbol.exists() ? _root.Symbol(core.type.str.is(x) ? x : _undefined) : {}) :
                        vDefaultVal
                    )
                );
            }, //# symbol.mk
        }; //# ish.type.symbol


        return type;
    }(); //# ish.type.*.is|mk


    //################################################################################################
    /** Provides access to (and optionally creates) an object structure's nested properties.
     * @function ish.resolve
     * @param {Symbol} [returnMetadata=!ish.resolve.returnMetadata] Value representing if metadata is to be returned; <code>{ value: {variant}, created: {boolean}, existed: {boolean} }</code>.
     * @param {boolean} [bForceCreate=true] Value representing if the path is to be created if it doesn't already exist. <code>true</code> creates the path if it does not already exist.
     * @param {object} oObject Value to interrogate.
     * @param {string|string[]} vPath Value representing the path to the requested property as a period-delimited string (e.g. "parent.child.array.0.key") or an array of strings.
     * @param {variant} [vValue] Value representing the value to set the referenced property to.
     * @returns {variant} Value representing the variant at the referenced path.
     * @example
     *   <caption>
     *     When forcing the creation of an object structure, data can be lost if an existing non-object property is used as a parent.
     *     <br/>This will overwrite the boolean property <code>nick</code> with an object reference containing the property <code>campbell</code>.
     *   </caption>
     *     var neek = { nick: true };
     *     var deepProp = ish.resolve(true, neek, "nick.campbell");
     */ //############################################################################################
    core.resolve = function (/*[core.resolve.returnMetadata], [bForceCreate], oObject, vPath|a_sPath, [vValue]*/) {
        var vReturnVal, vValue, vPath, oObject, a_sPath, i, bCurrentIsObj, bHaveValue, bForceCreate,
            bPathExists = true,
            oIsObjOptions = { allowFn: true },
            a = Array.prototype.slice.call(arguments), //# NOTE: core.type.fn.convert(arguments) is not always available at this low-level :(
            bReturnMetadata = (a[0] === core.resolve.returnMetadata),
            bCreated = false,
            isVal = function (v) {
                return (v !== _null && v !== _undefined);
            }
        ;

        //# If a[0] is .returnMetadata, remove it from the a(rguments)
        if (bReturnMetadata) {
            a.shift();
        }

        //# Setup our local variables based on the passed a(rguments)
        if (a[0] === true) {
            bForceCreate = true;
            oObject = a[1];
            vPath = a[2];

            //# If the caller passed in a vValue
            if (a.length > 3) {
                bHaveValue = true;
                vValue = a[3];
            }
        } else {
            bForceCreate = false;
            oObject = a[0];
            vPath = a[1];

            //# If the caller passed in a vValue
            if (a.length > 2) {
                bHaveValue = true;
                vValue = a[2];
            }
        }

        //# Now that the passed oObject is known, set our vReturnVal accordingly
        vReturnVal = (core.type.obj.is(oObject, oIsObjOptions) ? oObject : _undefined);

        //# If the passed oObject .is .obj and vPath .is .str or .is .arr
        if (isVal(oObject) && (core.type.str.is(vPath) || (core.type.arr.is(vPath, true) && core.type.str.is(vPath[0])))) {
            //# Populate our a_sPath and reset our vReturnVal to the passed oObject (as it may be a native type with properties)
            a_sPath = (core.type.arr.is(vPath) ? vPath : vPath.split("."));
            vReturnVal = oObject;

            //# Traverse the a_sPath
            for (i = 0; i < a_sPath.length; i++) {
                bCurrentIsObj = core.type.obj.is(vReturnVal, oIsObjOptions);

                //# If the bCurrentIsObj
                if (bCurrentIsObj) {
                    //# If the current vPath segment exists
                    if (a_sPath[i] in vReturnVal) {
                        //# Set oObject as the last object reference and vReturnVal as the current object reference
                        oObject = vReturnVal;
                        vReturnVal = oObject[a_sPath[i]];
                    }
                    //# Else if we are supposed to bForceCreate the current vPath segment
                    else if (bForceCreate) {
                        //# Set the oObject as the last object reference and create the new object at the current vPath segment while setting vReturnVal as the current object reference
                        oObject = vReturnVal;
                        vReturnVal = oObject[a_sPath[i]] = {};
                        bCreated = true;
                    }
                    //# Else the current vPath segment doesn't exist and we're not supposed to bForceCreate it, so reset our vReturnVal to undefined, flip bPathExists and fall from the loop
                    else {
                        vReturnVal = _undefined;
                        bPathExists = false;
                        break;
                    }
                }
                //# Else if we have an isVal in vReturnVal and the current a_sPath exists under it, set our vReturnVal to it
                //#     NOTE: We cannot use core.type.is.val below as this is a lower-level function
                else if (isVal(vReturnVal) && vReturnVal[a_sPath[i]] !== _undefined) {
                    vReturnVal = vReturnVal[a_sPath[i]];
                }
                //# Else if we are bForce(ing)Create or we bHaveValue and this is the last index
                else if (bForceCreate || (bHaveValue && i === a_sPath.length - 1)) {
                    //# Set a new object reference in vReturnVal then set it into oObject's last object reference
                    //#     NOTE: We enter the outer loop knowing the initial vReturnVal bCurrentIsObj, so there is no need to worry about a [0 - 1] index below as we will never enter this if on the first loop
                    oObject[a_sPath[i]] = vReturnVal = {};
                    bCreated = true;
                }
                //# Else if we're not on the final vPath segment
                else { //if (i < a_sPath.length - 1) {
                    //# The current vPath segment doesn't exist and we're not bForce(ing)Create, so reset our vReturnVal to undefined, flip bPathExists and fall from the loop
                    vReturnVal = _undefined;
                    bPathExists = false;
                    break;
                }
            }

            //# If we bHaveValue and the bPathExists, set it now
            if (bHaveValue && bPathExists) {
                oObject[a_sPath[a_sPath.length - 1]] = vReturnVal = vValue;
            }
        }

        return (
            bReturnMetadata ? {
                value: vReturnVal,
                created: bCreated,
                existed: (bPathExists && !bCreated)
            } :
            vReturnVal
        );
    }; //# ish.resolve
    //#########
    /** Unique value indicating if metadata is to be returned by <code>ish.resolve</code>.
     * @property ish.resolve.returnMetadata
     * @returns Value representing if metadata is to be returned by <code>ish.resolve</code>.
     * @ignore
     */ //#####
    core.resolve.returnMetadata = core.type.symbol.mk();


    //################################################################################################
    /** Merges the content of the passed objects into the passed target, adding or overriding properties within the target.
     * <span style="display: none;">Heavily refactored code from http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/<span>
     * @function ish.extend
     * @param {boolean|integer} [vMaxDepth=0] Value representing if a deep copy is to occur. <code>false</code>/<code>0</code> performs a shallow copy, a positive integer indicates the max depth to perform a deep copy to, <code>true</code> and all other integer values perform a deep copy to an unlimited depth.
     * @param {object|function} vTarget Value representing the target object to receive properties.
     * @param {...object|...function} vSource Value(s) representing the source object(s) whose properties will be copied into the target.
     * @returns {object|function} Reference to the passed target.
     * @example
     *   <caption>
     *      Right-most source object wins:
     *   </caption>
     *     var oResult = ish.extend({}, { i: 1 }, { i: 2 }); // `oResult.i` will equal `2`.
     */ //############################################################################################
    core.extend = function (/*[vMaxDepth], vTarget, vSource, vSource2...*/) {
        var a_sKeys, oTarget, oSource, sKey, iExtendDepth, i, j, k,
            a = arguments,
            //fnIsDom = core.type.fn.mk(core.resolve(core, "type.dom.is")),
            fnHasOwnProp = function (oSource, sKey) {
                return Object.prototype.hasOwnProperty.call(oSource, sKey);
            }
        ;

        //# If the first argument .is .int or .bool, setup the local vars accordingly
        if (core.type.int.is(a[0]) || core.type.bool.is(a[0])) {
            iExtendDepth = (
                a[0] === true ?
                    0 :
                    a[0] === false ?
                    1 :
                        core.type.int.mk(a[0])
            );
            oTarget = a[1];
            i = 2;
        }
        //# Else the first argument is our oTarget, so setup the local vars accordingly
        else {
            iExtendDepth = 0;
            oTarget = a[0];
            i = 1;
        }

        //# Ensure our oTarget is an object
        oTarget = (core.type.obj.is(oTarget, { allowFn: true }) ? oTarget : {}); //# Object(oTarget)

        //# Traverse the passed oSource objects
        for (/*i = i*/; i < a.length; i++) {
            oSource = a[i];
            a_sKeys = Object.keys(oSource || {});

            //# If the oSource .is a .fn and the oTarget doesn't have that sKey yet, copy it in as-is (ignoring iExtendDepth as we can't copy functions)
            if (core.type.fn.is(oSource) && !fnHasOwnProp(oTarget, sKey)) {
                oTarget = oSource;
            }
            //# Else if the oSource doesn't have any Object.keys, (safely) .warn that it's being ignored
            /*else if (a_sKeys.length === 0) { // && (core.type.date.is(oSource) || core.type.is.native(oSource) || fnIsDom(oSource))
                try {
                    core.io.console.warn("ish.extend: Non-extendable source object ignored ", oSource);
                } catch (e) {}
            }*/
            //# Else we have to traverse the oSource's a_sKeys
            else if (a_sKeys.length > 0) {
                //# Traverse the sKeys in the oSource object
                for (j = 0; j < a_sKeys.length; j++) { // sKey in oSource
                    sKey = a_sKeys[j];

                    //# If the oSource fnHasOwnProp of sKey, we'll need to set it into our oTarget
                    if (oSource[sKey] !== _undefined && fnHasOwnProp(oSource, sKey)) {
                        //# If we're in the midst of a deep copy and the sKey .is an .arr, setup the oTarget[sKey] as a new array
                        //#     NOTE: .arr goes first as []'s return true from .is .obj
                        if (iExtendDepth !== 1 && core.type.arr.is(oSource[sKey])) {
                            oTarget[sKey] = oSource[sKey].slice();

                            //# Traverse the newly created oTarget[sKey] array, .extending any .is .obj's or .arr's as we go
                            for (k = 0; k < oTarget[sKey].length; k++) {
                                if (core.type.obj.is(oTarget[sKey][k]) || core.type.arr.is(oTarget[sKey][k])) {
                                    oTarget[sKey][k] = core.extend(iExtendDepth - 1, {}, oSource[sKey][k]);
                                }
                            }
                        }
                        //#
                        else if (core.type.date.is(oSource[sKey])) {
                            oTarget[sKey] = new Date(oSource[sKey]);
                        }
                        //# Else if we're in the midst of a deep copy and the sKey .is an .obj, .extend it into our oTarget[sKey]
                        else if (iExtendDepth !== 1 && core.type.obj.is(oSource[sKey])) {
                            oTarget[sKey] = core.extend(iExtendDepth - 1, oTarget[sKey], oSource[sKey]);
                        }
                        //# Else treat the oSource[sKey] as a value, setting it into oTarget[sKey]
                        else {
                            try {
                                oTarget[sKey] = oSource[sKey];
                            } catch (e) {/*expectederror*/}
                        }
                    }
                }
            }
        }

        return oTarget;
    }; //# ish.extend


    //################################################################################################
    /** Configuration-based functionality.
     * @namespace ish.config
     */ /**
     * Creates an interface that merges the content of the passed options into the underlying configuration, overriding any original values.
     * @function ish.config.!
     * @param {object} oConfig Object that stores the underlying configuration values.
     * @returns {function} Function that manages and returns the object representing the configuration values.
     * @example
     *   <caption>
     *      When used internally for <code>ish</code> mixins, the recommended pattern to setup a related <code>ish.config</code> entry is:
     *   </caption>
     *     ish.config.mixinPath = ish.config({ some: "mixin configuration value" });
     */ //############################################################################################
    core.config = function (oConfig) {
        return function (oOptions) {
            //# If oOptions were passed in, .extend them into our oConfig
            if (arguments.length > 0) { core.extend(oConfig, oOptions); }

            //# Always return an unattached deep copy of the oConfig to the caller
            return core.extend(true, {}, oConfig);
        };
    }; //# ish.config


    //################################################################################################
    /** Collection of Object-Oriented Programming-based functionality.
     * @namespace ish.oop
     */ //############################################################################################
    core.oop = function() {
        var oOopData = {
                i: [],  //# i(ndex)
                p: []   //# p(rotected)
            },
            oAddedDataTypes = {
                n: [],  //# n(ames)
                d: []   //# d(faultValues)
            },
            oReturnVal = {
                //#########
                /** Javascript implementation of OOP's partial "class" concept, allowing a single object to be defined across multiple locations and/or files (with support for <code>protected</code> members).
                 * @function ish.oop.partial
                 * @param {object|function} vTarget Target object to receive properties.
                 * @param {object|function} vPartial Source object whose properties will be copied into the target.
                 *     Functions receive a single argument and their <code>this</code> context set to the target object's protected interfaces; e.g. <code>vPartial(oProtectedMembers)</code>.
                 */ //#####
                partial: function (vTarget, vPartial) {
                    var iIndex =  oOopData.i.indexOf(vTarget),
                        oProtected = (iIndex === -1 ? {} : oOopData.p[iIndex]),
                        oIsObjOrFn = { allowFn: true }
                    ;

                    //# If the passed vTarget and vPartial are valid
                    if (core.type.obj.is(vTarget, oIsObjOrFn) && core.type.obj.is(vPartial, oIsObjOrFn)) {
                        //# Set the results into the oOopData
                        setOopEntry(vTarget, oProtected /*, {}*/);

                        //# .extend the vPartial result into our vTarget, passing in the oProtected interfaces as both the first argument and as `this` to vPartial
                        core.extend(vTarget,
                            core.type.fn.is(vPartial) ?
                            vPartial.apply(oProtected, [oProtected]) : //# We can't eat our own dog food here as core.type.fn.* uses core.oop.partial! - core.type.fn.call(vPartial, oProtected, [oProtected]) :
                            vPartial
                        );
                    }
                    //# Else the arguments are invalid, so throw the error
                    else {
                        throw "ish.oop.partial: Object or function required for `vTarget` and `vPartial`.";
                    }
                }, //# core.oop.partial

                //#########
                /** Merges the passed object into the passed target's protected members, adding or overriding properties within the target's protected members.
                 * @function ish.oop.protected
                 * @param {object|function} vTarget Target object to receive protected member properties.
                 * @param {object} oProtected Source object whose properties will be copied into the target's protected members.
                 */ //#####
                protected: function (vTarget, oProtected) {
                    //# Pass the call off to .setOopEntry
                    //#     NOTE: We don't simply expose setOopEntry as core.opp.protected because we want to gate the oAddedDateTypes feature
                    setOopEntry(vTarget, oProtected /*, {}*/);
                } //# core.oop.protected
            }
        ;

        //# Safely maintains the entries within oOopData
        function setOopEntry(vTarget, oProtected, oAddedDateTypes) {
            var fnSetDataType, i,
                iIndex = oOopData.i.indexOf(vTarget)
            ;

            //# Ensure the passed oProtected and oAddedDateTypes .is an .obj
            oProtected = core.type.obj.mk(oProtected);
            oAddedDateTypes = core.type.obj.mk(oAddedDateTypes);

            //# If the vTarget is new
            if (iIndex === -1) {
                //# .push the vTarget and oProtected entries into our oOopData
                oOopData.i.push(vTarget);           //# i(ndex)
                oOopData.p.push(oProtected);        //# p(rotected)

                //# Setup fnSetDataType to .push the new sNames in
                fnSetDataType = function (sName) {
                    oOopData[sName].push(oAddedDateTypes[sName] || oAddedDataTypes.d[sName]);
                };
            }
            //# Else the vTarget is already registered, so update its iIndex
            else {
                oOopData.p[iIndex] = oProtected;    //# p(rotected)

                //# Setup fnSetDataType to update the iIndex for only those sNames passed in oAddedDateTypes
                fnSetDataType = function (sName) {
                    if (oAddedDateTypes.hasOwnProperty(sName)) {
                        oOopData[sName][iIndex] = oAddedDateTypes[sName];
                    }
                };
            }

            //# Traverse the oAddedDataTypes (if any), setting each .n(ame) to the passed oAddedDateTypes or its .d(faultValue) as we go
            for (i = 0; i < oAddedDataTypes.n.length; i++) {
                fnSetDataType(oAddedDataTypes.n[i]);
            }

            //# .fire our .event now that the oOopData is completely setup
            //core.io.event.fire("ish.oop._setOopEntry", [vTarget, oProtected]);
        } //# setOopEntry

        //# Properly adds a data type to be tracked as part of oOopData
        function addOopDataType(sName, vDefaultValue) {
            var i = oAddedDataTypes.n.indexOf(sName),    //# n(ames)
                bReturnVal = (i === -1 && sName !== "i" && sName !== "p")
            ;

            //# If this is a new sName, .push it into oAddedDataTypes
            //#     NOTE: We don't specifically track i(ndex) or p(rotected) in oAddedDataTypes even though they can be overridden, but it works as designed below even in these circumstances
            if (bReturnVal) {
                oAddedDataTypes.n.push(sName);           //# n(ames)
                oAddedDataTypes.d.push(vDefaultValue);   //# d(faultValues)

                //# Create then populate the sName with the vDefaultValue for the existing oOopData
                oOopData[sName] = [];
                for (i = 0; i < oOopData.i.length; i++) {
                    oOopData[sName].push(vDefaultValue);
                }
            }

            return bReturnVal;
        } //# addOopDataType


        //# Register ourselves with ourselves so that we can .partial-class... ourselves
        //#     NOTE: Since we know that our oReturnVal/core.oop isn't already being tracked, we can call setOopEntry directly rather than going through oReturnVal.protected
        setOopEntry(oReturnVal, {
            oopData: oOopData,
            addOopDataType: addOopDataType,
            setOopEntry: setOopEntry
        } /*, {}*/);

        return oReturnVal;
    }(); //# core.oop


    //########


    //################################################################################################
    /** Collection of variable Type-based functionality (non-<code>is</code>/<code>mk</code> core features).
     * @namespace ish.type
     * @ignore
     */ //############################################################################################
    core.oop.partial(core.type, function (oProtected) {
        //#
        function doPrune(oSource, vKeys, bSetToUndefined) {
            var a_sKeys, sKey, i,
                bRemap = false,
                iReturnVal = 0
            ;

            //# If the passed vKeys is an array, set it into a_sKeys
            if (core.type.arr.is(vKeys)) {
                a_sKeys = vKeys;
            }
            //# Else vKeys is a oMapping definition, so pull its .keys and flip bRemap
            else if (core.type.obj.is(vKeys)) {
                a_sKeys = Object.keys(vKeys);
                bRemap = true;
            }

            //# Traverse the a_sKeys
            for (i = 0; i < a_sKeys.length; i++) {
                sKey = a_sKeys[i];

                //# If the current sKey exists in our oSource, inc our iReturnVal
                if (oSource.hasOwnProperty(sKey)) {
                    iReturnVal++;

                    //# If we're supposed to bRemap, do so now
                    if (bRemap) {
                        oSource[vKeys[sKey]] = oSource[sKey];
                    }

                    //# Either bSetToUndefined or delete the current sKey
                    if (bSetToUndefined) {
                        oSource[sKey] = _undefined;
                    }
                    else {
                        delete oSource[sKey];
                    }
                }
            }

            return iReturnVal;
        } //# doPrune

        //#
        function processObj(vSource, vKeys, bSetToUndefined) {
            var i,
                //bSetToUndefined = ,
                iReturnVal = 0
            ;

            //# If the caller passed in an .is .arr vSource, traverse it passing each entry into doPrune as we go
            if (core.type.arr.is(vSource, true)) {
                for (i = 0; i < vSource.length; i++) {
                    iReturnVal += doPrune(vSource[i], vKeys, bSetToUndefined);
                }
            }
            //# Else if the caller passed in an .is .obj, pass it off to doPrune
            else if (core.type.obj.is(vSource)) {
                iReturnVal = doPrune(vSource, vKeys, bSetToUndefined);
            }

            return iReturnVal;
        } //# processObj


        //# Add .processObj into the oProtected interfaces for core.type
        //#     NOTE: `this.processObj = processObj` also works
        oProtected.processObj = processObj;

        //# Add type.is.ish.import into oTypeIsIsh
        //#     NOTE: Since `import` is a reserved(ish) word, we have to use []-notation

        //#########
        /** Imports ish.js mixin functionality.
         * @function ish.type.is.ish:import
         * @param {string[]} a_sImport Value representing the mixin paths to import.
         * @param {object} [oOptions] Value representing the following options:
         *      @param {boolean} [oOptions.callback=fire:ish.pluginsLoaded] Value representing the function to be called on completion; <code>oOptions.callback(a_oProcessedUrls, bAllLoaded)</code>.
         *      @param {boolean} [oOptions.onAppend=setAttribute:importedBy] Value representing  the function to be called when the DOM element is added; <code>oOptions.onAppend(_dom, sUrl)</code>.
         *      @param {boolean} [oOptions.onError=undefined] Value representing the function to be called when an error occurs; <code>oOptions.onError(_dom, sUrl)</code>.
         *      @param {boolean} [oOptions.waitSeconds=7] Value representing the maximum number of seconds to wait before an error is returned.
         *      @param {boolean} [oOptions.baseUrl=""] Value representing the base URL to prepend on the <code>src</code> attribute (must end with <code>/</code>).
         *      @param {boolean} [oOptions.urlArgs=""] Value representing the URL's querystring to append on the <code>src</code> attribute (must start with <code>?</code>).
         *      @param {boolean} [oOptions.importedBy="ish.type.is.ish.import"] Value to be set in the DOM element's <code>importedBy</code> attribute.
         */ //#####
        oTypeIsIsh.public['import'] = function (a_sImport, oOptions) {
            var i;

            //# Ensure the passed a_sImport and oOptions are valid and setup
            //#     NOTE: We don't test/gate based on a_sImport being an .arr.is because this way we ensure the ish.pluginsLoaded .event is always .fire'd
            //#     NOTE: <script type="text/javascript" src="js/ish/ish.js" ish='{ "target": "$z", "plugins": { "import": ["lib.ui","app.tags","app.ui"], "baseUrl": "js/ish/", "cache": false } }'></script>
            a_sImport = core.type.arr.mk(a_sImport, (core.type.str.is(a_sImport, true) ? [a_sImport] : []));
            oOptions = core.extend({
                callback: function (a_oProcessedUrls, bAllLoaded) {
                    core.io.event.fire("ish.pluginsLoaded", [a_oProcessedUrls, bAllLoaded]);
                },
                onAppend: function (_dom /*, sUrl*/) {
                    if (!bServerside && _dom) {
                        _dom.setAttribute("importedBy", oOptions.importedBy || "ish.type.is.ish.import");
                    }
                }
            }, core.config.ish().plugins, oOptions);

            //# Traverse the a_sImport's, appending `.js` to each
            for (i = 0; i < a_sImport.length; i++) {
                a_sImport[i] += ".js";
            }

            //# .require the (now URL'd) a_sImport's
            core.require(a_sImport, oOptions);
        }; //# type.is.ish.import


        //#########
        /** ish.js configuration values.
         * @function ish.config.ish
         * @param {object} [oOptions] Value representing the updated configuration values.
         * @returns {object} Value representing ish.js's configuration values.
         */ //#####
        core.config.ish = core.config(oTypeIsIsh.config);

        return {
            is: {
                //# Extend our .public oTypeIsIsh interfaces onto the above-defined type.is.ish function
                ish: oTypeIsIsh.public,

                //#########
                /** Determines if the passed value is set (i.e. !== <code>undefined</code> && !== <code>null</code>).
                 * @function ish.type.is.value
                 * @param {variant} x Value to interrogate.
                 * @returns {boolean} Value representing if the passed value is set.
                 */ //#####
                value: function (x) {
                    return (x !== _undefined && x !== _null);
                }, //# type.is.value

                //#########
                /** Determines if the passed value is a primitive (i.e. <code>null</code>, <code>undefined</code>, <code>Boolean</code>, <code>Number</code>, <code>String</code> or <code>Symbol</code>).
                 * @function ish.type.is.primitive
                 * @param {variant} x Value to interrogate.
                 * @returns {boolean} Value representing if the passed value is a primitive.
                 */ //#####
                primitive: function (x) {
                    return (
                        x === _null ||
                        x === _undefined ||
                        core.type.bool.is(x) ||
                        core.type.is.numeric(x) ||
                        core.type.str.is(x /*, false*/) ||
                        core.type.symbol.is(x)
                    );
                } //# type.is.primitive

                //numeric: {
                //    /*
                //    Function: range
                //    Determines if the passed value is within the passed range.
                //    Parameters:
                //    vValue - The variant to interrogate, where the <code>length</code> property used for the numeric comparison (if present).
                //    vType - Function or String denoting the type testing logic which returns <code>truthy</code> if <code>vValue</code> is of <code>vType</code>.
                //    (Optional) nMin - Numeric value representing the minimum allowed value (can be passed as <code>undefined</code> for no defined minimum).
                //    (Optional) nMax - Numeric value representing the maximum allowed value (can be passed as <code>undefined</code> for no defined maximum).
                //    Returns:
                //    Boolean value representing if the passed value is within the passed range or <code>undefined</code> if the vType cannot be resolved to a function.
                //    */
                //    range: function (vValue, vType, nMin, nMax) {
                //        var fnTest = (core.type.fn.is(vType) ? vType : core.resolve(core.type, [vType, "is"])),
                //            bReturnVal = (core.type.fn.is(fnTest) ? core.type.fn.call(fnTest, null, [vValue]) : _undefined)
                //        ;

                //        //# If we were able to successfully verify vValue with the fnTest, reset vValue to the numeric value to interrogate
                //        if (bReturnVal) {
                //            vValue = (core.type.is.numeric(core.resolve(vValue, "length")) ? vValue.length : vValue);

                //            //# Reset our bReturnVal to the result of the range comparison
                //            bReturnVal = (
                //                (nMin === _undefined || vValue >= nMin) &&
                //                (nMax === _undefined || vValue <= nMax)
                //            );
                //        }

                //        return bReturnVal;
                //    }
                //}, //# type.is.numeric
            }, //# core.type.is.*

            bool: {
                is: {
                    //#########
                    /** Determines if the passed value represents true.
                     * @$note Values interpreted as <code>true</code> are: <code>true</code>, <code>"true"</code> (case-insensitive and trimmed) and non-<code>0</code> integers.
                     * @function ish.type.bool.is:true
                     * @param {variant} x Value to interrogate.
                     * @returns {boolean} Value representing if the passed value represents true.
                     */ //#####
                    'true': function(x) {
                        var sX = core.type.str.mk(x).trim().toLowerCase();

                        return !!(
                            x === true ||
                            (core.type.str.is(x) && sX === "true") ||
                            (core.type.int.is(x) && x !== 0)
                        );
                    }
                }
            }, //# core.type.bool

            date: {
                time: {
                    //#########
                    /** Determines if the passed value is a valid time string.
                     * @function ish.type.date.time:is
                     * @param {variant} x Value to interrogate.
                     * @returns {boolean} Value representing if the passed value is a valid time string.
                     */ //#####
                    is: function (x) {
                        //# TODO tests
                        return /^([0-1][0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/.test(x);
                    },

                    //#########
                    /** Determines the number of seconds from midnight the time string represents.
                     * @function ish.type.date.time:is
                     * @param {variant} [x=new Date()] Value to interrogate.
                     * @returns {boolean} Value representing the number of seconds from midnight the time string represents.
                     */ //#####
                    seconds: function (x) {
                        var iReturnVal = 0;

                        //# TODO tests
                        //# If x wasn't passed, determine the .seconds for now
                        if (arguments.length === 0) {
                            iReturnVal = Math.floor(
                                Math.abs(new Date() - new Date(core.type.date.yyyymmdd() + ' 00:00')) / 1000
                            );
                        }
                        //# Else if the passed x .is .time, determine the .seconds from it
                        else if (core.type.date.time.is(x)) {
                            iReturnVal = (Math.abs(new Date('1970-01-01 ' + x) - new Date('1970-01-01 00:00')) / 1000);
                        }

                        return iReturnVal;
                    }
                },

                //#########
                /** Determines the date of the passed value formatted as <code>YYYY/MM/DD</code>.
                 * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                 * @function ish.type.date.yyyymmdd
                 * @param {variant} [x=new Date()] Value representing the date.
                 * @param {variant} [vDefault=undefined] Value representing the default return value if casting fails.
                 * @param {string} [sDelimiter="/"] Value representing the date delimiter.
                 * @returns {integer} Value representing the passed value formatted as <code>YYYY/MM/DD</code>.
                 */ //#####
                yyyymmdd: function (x, vDefault, sDelimiter) {
                    var dDate = core.type.date.mk(x, (arguments.length > 1 ? vDefault : new Date()));

                    //# TODO tests
                    sDelimiter = core.type.str.mk(sDelimiter, "/");

                    return (core.type.date.is(dDate) ?
                        dDate.getFullYear() + sDelimiter + core.type.str.lpad((dDate.getMonth() + 1), "0", 2) + sDelimiter + core.type.str.lpad(dDate.getDate(), "0", 2) :
                        ""
                    );
                    //dCalDate.getHours() + ':' + core.type.str.mk(dCalDate.getMinutes()).lPad("0", 2) + ':' + core.type.str.mk(dCalDate.getSeconds()).lPad("0", 2)
                }, //# date.yyyymmdd

                //#########
                /** Provides the current <code>window.performance</code>-based timestamp.
                 * @function ish.type.date.timestamp
                 * @returns {float} Value representing the current <code>window.performance</code>-based timestamp.
                 */ //#####
                timestamp: function () {
                    var _window_performance = _root.performance,
                        _window_performance_timing = core.resolve(_window_performance, "timing")
                    ;

                    return _window_performance && _window_performance.now && _window_performance_timing && _window_performance_timing.navigationStart ?
                            _window_performance.now() + _window_performance_timing.navigationStart :
                            _Date_now()
                    ;
                } //# timestamp
            }, //# core.type.date

            str: {
                is: {
                    //#########
                    /** Determines if the passed value is valid JSON.
                     * @function ish.type.str.is:json
                     * @param {variant} x Value to interrogate.
                     * @returns {boolean} Value representing if the passed value is a valid JSON string.
                     */ //#####
                    json: function (x) {
                        try {
                            JSON.parse(x);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    } //# type.str.is.json
                }
            }, //# core.type.str

            arr: {
                clone: function (a_vArray) {
                    if (core.type.arr.is(a_vArray)) {
                        return a_vArray.slice(0);
                    }
                }, //# type.arr.clone

                //#########
                /** Removes the passed target(s) from the passed array (optionally replacing them with updated values).
                 * @function ish.type.arr.rm
                 * @param {variant[]} a_vArray Values to interrogate.
                 * @param {variant|variant[]} vTargets Value(s) to remove.
                 * @param {variant|variant[]} vReplacements Value(s) to replace the removed items.<br/><b>Note:</b> The number of replacements must match the number of targets.
                 * @returns {boolean} Value representing if one or more of the passed value(s) were successfully removed / replaced.
                 */ //#####
                rm: function (a_vArray, vTargets, vReplacements) {
                    var iTargetIndex, i,
                        iTotalReplacements = -1,
                        bHaveReplacements = (arguments.length === 3),
                        bReplacementsIsArray = core.type.arr.is(vReplacements),
                        a_vTargets = (core.type.arr.is(vTargets) ? vTargets : [vTargets]),
                        bReturnVal = false
                    ;

                    //# If the passed a_vArray .is .arr, determine our vReplacements if we bHaveReplacements
                    if (core.type.arr.is(a_vArray, true)) {
                        if (bHaveReplacements && bReplacementsIsArray) {
                            iTotalReplacements = vReplacements.length;
                        }

                        //# Traverse our a_vTargets, determining the iTargetIndex of the current a_vTargets
                        for (i = 0; i < a_vTargets.length; i++) {
                            iTargetIndex = a_vArray.indexOf(a_vTargets[i]);

                            //# If we found the iTargetIndex, flip our bReturnVal
                            if (iTargetIndex > -1) {
                                bReturnVal = true;

                                //# If we bHaveReplacements
                                if (bHaveReplacements) {
                                    //# If bReplacementsIsArray and we enough iTotalReplacements, replace the iTargetIndex with its related vReplacements
                                    if (bReplacementsIsArray && i < iTotalReplacements) {
                                        a_vArray[iTargetIndex] = vReplacements[i];
                                    }
                                    //# Else vReplacements is to be reused as it's a singular value
                                    else {
                                        a_vArray[iTargetIndex] = vReplacements;
                                    }
                                }
                                //# Else we need to .splice the iTargetIndex from the a_vArray
                                else {
                                    a_vArray.splice(iTargetIndex, 1);
                                }
                            }
                        }
                    }

                    return bReturnVal;
                }, //# type.arr.rm


                //#########
                /** Determines if the passed array only contains values that conform to the passed test.
                 * @function ish.type.arr.of
                 * @param {variant[]} x Values to interrogate.
                 * @param {function|string} vTest Value representing the test function (accepting one argument, returning truthy) or a string referencing a type under <code>ish.type</code>.
                 * @returns {boolean} Value representing if the passed array only contains values that conform to the passed test.
                 */ //#####
                of: function (x, vTest) {
                    var i,
                        fnTest = (core.type.str.is(vTest) ? core.resolve(core.type, vTest + ".is") : vTest),
                        bReturnVal = (core.type.arr.is(x, true) && core.type.fn.is(fnTest))
                    ;

                    //# If the arguments are properly recognized traverse the passed a(rray), fnTest'ing each current value as we go (flipping our bReturnVal and falling from the loop on a failure)
                    if (bReturnVal) {
                        for (i = 0; i < x.length; i++) {
                            if (!fnTest(x[i])) {
                                bReturnVal = false;
                                break;
                            }
                        }
                    }

                    return bReturnVal;
                } //# type.arr.of
            }, //# core.type.arr.*

            obj: {
                //#########
                /** Removes the passed target(s) from the passed object (optionally replacing them with updated values).
                 * @function ish.type.obj.rm
                 * @param {variant[]} a_vArray Values to interrogate.
                 * @param {variant|variant[]} vTargets Value(s) to remove.
                 * @param {variant|variant[]} vReplacements Value(s) to replace the removed items with.<br/><b>Note:</b> The number of replacements must match the number of targets.
                 * @returns {boolean} Value representing if one or more of the passed value(s) were successfully removed / replaced.
                 */ //#####
                rm: function (vSource, vKeys, bSetToUndefined) {
                    var iReturnVal;

                    //# If the caller passed in an .is .str, reset vKeys to an array
                    if (core.type.str.is(vKeys, true)) {
                        vKeys = [vKeys];
                    }

                    //#
                    if (core.type.arr.is(vKeys, true)) {
                        iReturnVal = processObj(vSource, vKeys, bSetToUndefined);
                    }

                    return iReturnVal;
                }, //# type.obj.rm

                //#########
                /** Determines the enumerable and/or non-enumerable keys of the passed value.
                 * @function ish.type.obj.ownKeys
                 * @param {object} oSource Value to interrogate.
                 * @param {object|boolean} [vOptions=false] Value representing if non-enumerable properties are to be included or the desired options:
                 *      @param {boolean} [vOptions.includeNonEnumerable=false] Value representing if non-enumerable properties are to be included.
                 *      @param {boolean} [vOptions.onlyNonEnumerable=false] Value representing if only non-enumerable properties are to be returned.
                 * @returns {string[]} Value representing the requested keys of the passed value.
                 */ //#####
                ownKeys: function(oSource, vOptions) {
                    var a_sKeys, i,
                        bGetOwnPropertyNames = core.type.fn.is(Object.getOwnPropertyNames),
                        a_sReturnVal /* = _undefined */
                    ;

                    //# Ensure the passed vOptions .is an .obj, defaulting .includeNonEnumerable to the truthy value of vOptions if its not an .obj
                    vOptions = core.type.obj.mk(vOptions, { includeNonEnumerable: vOptions === true });

                    //# If the passed oSource .is .obj, collect its .keys into our a_sReturnVal
                    //#     NOTE: Object.keys is polyfilled for pre-IE9 while Object.getOwnPropertyNames is not, possible polyfill - https://github.com/zloirock/core-js/blob/v3.2.1/packages/core-js/modules/es.object.get-own-property-names.js
                    if (core.type.obj.is(oSource, { allowFn: true })) {
                        //# If we are to return .onlyNonEnumerable properties
                        if (vOptions.onlyNonEnumerable) {
                            a_sReturnVal = (bGetOwnPropertyNames ? Object.getOwnPropertyNames(oSource) : []);
                            a_sKeys = Object.keys(oSource);

                            //# Traverse the .getOwnPropertyNames, .splice'ing out any that also exist in our a_sKeys
                            for (i = 0; i < a_sReturnVal.length; i++) {
                                if (a_sKeys.indexOf(a_sReturnVal[i]) !== -1) {
                                    a_sReturnVal.splice(i, 1);
                                }
                            }
                        }
                        //#
                        else if (vOptions.includeNonEnumerable && bGetOwnPropertyNames) {
                            a_sReturnVal = Object.getOwnPropertyNames(oSource);
                        }
                        //#
                        else {
                            a_sReturnVal = Object.keys(oSource);
                        }
                    }

                    return a_sReturnVal;
                }, //# type.obj.ownKeys

                //#########
                /** Determines the value of the passed case-insensitive key within the passed value.
                 * @$note As the key is searched for in a case-insensitive manor, the first matching lowercased key enumerated by the <code>for...in</code> statement will be returned.
                 * @function ish.type.obj.get
                 * @param {object} oSource Value to interrogate.
                 * @param {string} sKey Key to retrieve from the passed value.
                 * @returns {variant} Value representing the value of the passed case-insensitive key.
                 */ //#####
                get: function (oObject, sKey) {
                    var sCurrentKey,
                        vReturnVal /* = _undefined */
                    ;

                    //# If the caller passed in a valid oObject, .toLowerCase our sKey
                    if (core.type.obj.is(oObject)) {
                        sKey = core.type.str.mk(sKey).toLowerCase();

                        //# Traverse the oObject, returning the first matching .toLowerCase'd sCurrentKey
                        for (sCurrentKey in oObject) {
                            if (sCurrentKey.toLowerCase() === sKey) {
                                vReturnVal = oObject[sCurrentKey];
                                break;
                            }
                        }
                    }

                    return vReturnVal;
                } //# type.obj.get
            }, //# core.type.obj.*

            fn: function () {
                //# Converts the passed argument from an arguments instance, array or single variable into an Array fit to pass to fn.apply().
                function convert(vArguments) {
                    //return Array.prototype.slice.call(vArguments);

                    //# <ES5 Support for array-like objects
                    //#     See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#Browser_compatibility
                    return core.type.arr.mk(
                        vArguments, (vArguments === _undefined ? [] : [vArguments])
                    );
                } //# convert

                //# Processes the passed options into an Object for use in core.type.fn.*
                function processOptions(oOptions, oDefaults, iWait) {
                    //#
                    return core.extend(
                        { context: {} },
                        oDefaults,
                        oOptions,
                        (iWait !== _undefined && core.type.obj.is(oOptions) ? {
                            wait: core.type.int.mk(oOptions.wait, iWait)
                        } : _null)
                    );
                } //# processOptions


                return {
                    is: {
                        //#########
                        /** Determines if the passed value represents an arguments instance.
                         * @function ish.type.fn.is:args
                         * @param {variant} x Value to interrogate.
                         * @returns {boolean} Value representing if the passed value represents an arguments instance.
                         */ //#####
                        args: function (x) {
                            return (Object.prototype.toString.call(x) === "[object Arguments]");
                        } //# fn.is.args
                    },

                    //#########
                    /** Casts the passed arguments instance, array or single value into an array fit to pass to <code>function.apply()</code>.
                     * @function ish.type.fn.convert
                     * @param {variant} x Value to interrogate.
                     * @returns {variant[]} Value representing the passed value as an array.
                     */ //#####
                    convert: convert,


                    //#########
                    /** Null function with no body and no specified return value.
                     * @function ish.type.fn.noop
                     */ //#####
                    noop: noop,


                    //#########
                    /** Executes the passed function.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.call
                     * @param {function} fn Value representing the function to execute.
                     * @param {variant} [vContext=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     * @param {variant} vArguments Value representing the arguments to pass into the passed function.<br/><b>Note:</b> This value is passed through <code>ish.type.fn.convert</code> to ensure an array.
                     * @returns {variant} Value representing the passed function's return value.
                     * @todo Refactor all <code>ish.type.fn.call</code> references to use <code>ish.type.fn.run</code> as it has a more consistent interface to the rest of ish.js.
                     */ //#####
                    call: function (fn, vContext, vArguments) {
                        var vReturnVal /*= _undefined*/;

                        //#
                        if (core.type.fn.is(fn)) {
                            switch (arguments.length) {
                                case 1: {
                                    vReturnVal = fn();
                                    break;
                                }
                                case 2: {
                                    vReturnVal = fn.apply(vContext);
                                    break;
                                }
                                default: {
                                    vReturnVal = fn.apply(vContext, convert(vArguments));
                                    //break;
                                }
                            }
                        }

                        return vReturnVal;
                    }, //# fn.call


                    //#########
                    /** Executes the passed function.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.run
                     * @param {function} fn Value representing the function to execute.
                     * @param {arguments|variant[]|object} [vOptions] Value representing an arguments instance, an array of arguments or an object representing the desired options:
                     *      @param {variant} [vOptions.context=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     *      @param {variant} [vOptions.default=undefined] Value representing the default value to return if the passed function is invalid.
                     *      @param {arguments|variant[]} [vOptions.args] Value representing the arguments to pass into the passed function.<br/><b>Note:</b> This value is passed through <code>ish.type.fn.convert</code> to ensure an array.
                     * @returns {variant} Value representing the passed function's return value or the default value if the passed function is invalid.
                     */ //#####
                    run: function (fn, vOptions) {
                        var vReturnVal,
                            a_vArguments = (
                                core.type.fn.is.args(vOptions) ?
                                convert(vOptions) : (
                                    core.type.arr.is(vOptions) ?
                                    vOptions :
                                    _undefined
                                )
                            ),
                            oOptions = processOptions(a_vArguments ? {} : vOptions, {
                                //context: {},
                                args: a_vArguments,
                                default: _undefined
                            } /*, _undefined*/)
                        ;

                        //# Set our vReturnVal to the .default (which is _undefined if one isn't sent in via vOptions)
                        vReturnVal = oOptions.default;

                        //# If the passed fn .is a .fn, .apply the .context and .args
                        if (core.type.fn.is(fn)) {
                            vReturnVal = fn.apply(oOptions.context, oOptions.args);
                        }

                        return vReturnVal;
                    }, //# fn.run


                    //#########
                    /** Wraps the passed function, ensuring it is executed no more than once.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.once
                     * @param {function} fn Value representing the function to execute.
                     * @param {object} [oOptions] Value representing the desired options:
                     *      @param {variant} [oOptions.context=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     *      @param {variant} [oOptions.default=undefined] Value representing the default value to return if the passed function is invalid.
                     *      @param {boolean} [oOptions.rereturn=true] Value representing if subsequent calls should return the first return value.
                     *      @param {integer} oOptions.call <b>OUT</b> Value set by reference representing the number of calls to the passed function.
                     * @returns {function} Function that returns a value representing the passed function's return value or the default value if the passed function is invalid.
                     * @see {@link http://davidwalsh.name/essential-javascript-functions|DavidWalsh.name}
                     */ //#####
                    once: function (fn, oOptions) {
                        var vReturnVal /*= _undefined*/;

                        //#
                        oOptions = processOptions(oOptions, {
                            rereturn: true
                        } /*, _undefined*/);
                        oOptions.call = 0;
                        vReturnVal = oOptions.default;

                        return function (/*arguments*/) {
                            if (core.type.fn.is(fn)) {
                                vReturnVal = fn.apply(oOptions.context, convert(arguments));
                                fn = _null;
                            }

                            return (++oOptions.call === 1 || oOptions.rereturn ? vReturnVal : _undefined);
                        };
                    }, //# fn.once


                    //#########
                    /** Wraps the passed function, ensuring it is executed within a <code>try...catch</code> block.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.tryCatch
                     * @param {function} fn Value representing the function to execute.
                     * @param {object} [oOptions] Value representing the desired options:
                     *      @param {variant} [oOptions.context=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     *      @param {variant} [oOptions.default=undefined] Value representing the default value to return if the passed function errors.
                     *      @param {boolean} [oOptions.returnObj=false] Value representing if an object is to be returned representing the result and error.
                     * @returns {function} Function that returns a value representing the passed function's return value or the default value if the passed function errors.
                     * @see {@link http://davidwalsh.name/essential-javascript-functions|DavidWalsh.name}
                     */ //#####
                    tryCatch: function (fn, oOptions) {
                        var oReturnVal;

                        //#
                        oOptions = processOptions(oOptions, {
                            //default: _undefined,
                            returnObj: false
                        } /*, _undefined*/);

                        //#
                        return function (/*arguments*/) {
                            oReturnVal = {
                                result: oOptions.default,
                                error: _null
                            };

                            try {
                                //# Collect the .result by calling .apply on the passed fn, passing in the .context and .convert'ing the arguments as we go
                                //#     NOTE: Starting with ECMAScript 5 .apply's arguments can be a generic array-like object instead of an array; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
                                oReturnVal.result = fn.apply(oOptions.context, convert(arguments));
                            } catch (e) {
                                //# We bloweded up, so set our .error
                                oReturnVal.error = e;
                            }

                            return (oOptions.returnObj ? oReturnVal : oReturnVal.result);
                        };
                    }, //# fn.tryCatch


                    //#########
                    /** Wraps the passed function, ensuring it is executed as much as possible without ever executing more than once per wait duration.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.throttle
                     * @param {function} fn Value representing the function to execute.
                     * @param {object} [oOptions] Value representing the desired options:
                     *      @param {variant} [oOptions.context=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     *      @param {integer} [oOptions.wait=500] Value representing the minimum number of milliseconds (1/1000ths of a second) between each call.
                     *      @param {boolean} [oOptions.leading=true] Value representing if the passed function is to be executed immediently on the first call.
                     *      @param {boolean} [oOptions.trailing=false] Value representing if the passed function is to be executed at the conclusion of the last wait time.
                     * @returns {function} Function that returns a value representing the passed function's return value from the most recent call.
                     * @see {@link http://underscorejs.org/docs/underscore.html|UnderscoreJS.org}
                     */ //#####
                    throttle: function (fn, oOptions) {
                        var context, args, result,
                            timeout = _null,
                            previous = 0,
                            later = function () {
                                previous = oOptions.leading === false ? 0 : _Date_now();
                                timeout = _null;
                                result = fn.apply(context, args);
                                if (!timeout) context = args = _null;
                            }
                        ;

                        //#
                        oOptions = processOptions(oOptions, {
                            leading: true,
                            trailing: false
                        }, 500);

                        return function (/*arguments*/) {
                            var remaining,
                                now = _Date_now()
                            ;
                            if (!previous && oOptions.leading === false) previous = now;
                            remaining = oOptions.wait - (now - previous);
                            context = oOptions.context;
                            args = convert(arguments);
                            if (remaining <= 0 || remaining > oOptions.wait) {
                                if (timeout) {
                                    clearTimeout(timeout);
                                    timeout = _null;
                                }
                                previous = now;
                                result = fn.apply(context, args);
                                if (!timeout) context = args = _null;
                            } else if (!timeout && oOptions.trailing !== false) {
                                timeout = setTimeout(later, remaining);
                            }
                            return result;
                        };
                    }, //# fn.throttle


                    //#########
                    /** Wraps the passed function, ensuring it cannot be executed until the wait duration has passed without a call being made.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.debounce
                     * @param {function} fn Value representing the function to execute.
                     * @param {object} [oOptions] Value representing the desired options:
                     *      @param {variant} [oOptions.context=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     *      @param {integer} [oOptions.wait=500] Value representing the minimum number of milliseconds (1/1000ths of a second) between each call.
                     *      @param {boolean} [oOptions.leading=false] Value representing if the passed function is to be executed immediently on the first call.
                     * @returns {function} Function that returns a value representing the passed function's return value from the most recent call.
                     * @example
                     *    var myEfficientFn = ish.type.fn.debounce(function () {
                     *      // All the taxing stuff you do
                     *    }, 250);
                     *    window.addEventListener('resize', myEfficientFn);
                     */ //#####
                    debounce: function (fn, oOptions) {
                        var timeout, args, context, timestamp, result,
                            later = function () {
                                var last = _Date_now() - timestamp;

                                if (last < oOptions.wait && last >= 0) {
                                    timeout = setTimeout(later, oOptions.wait - last);
                                } else {
                                    timeout = _null;
                                    if (!oOptions.leading) {
                                        result = fn.apply(context, args);
                                        if (!timeout) context = args = _null;
                                    }
                                }
                            }
                        ;

                        //#
                        oOptions = processOptions(oOptions, {
                            //context: _undefined,
                            leading: false
                        }, 500);

                        return function (/*arguments*/) {
                            var callNow = oOptions.leading && !timeout;
                            context = oOptions.context;
                            args = convert(arguments);
                            timestamp = _Date_now();
                            if (!timeout) timeout = setTimeout(later, oOptions.wait);
                            if (callNow) {
                                result = fn.apply(context, args);
                                context = args = _null;
                            }

                            return result;
                        };
                    }, //# fn.debounce


                    //#########
                    /** Wraps the passed function, executing it once per wait duration until it returns truthy or the maximum attempts are exhaused.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.poll
                     * @param {function} fn Value representing the function to execute.
                     * @param {object} [oOptions] Value representing the desired options:
                     *      @param {variant} [oOptions.context=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     *      @param {integer|function} [oOptions.wait=500] Value representing the number of milliseconds (1/1000ths of a second) or function called per attempt that returns the number of milliseconds between each call; <code>iWaitMilliseconds = oOptions.wait(iAttemptCount)</code>.
                     *      @param {integer} [oOptions.maxAttempts=4] Value representing the maximum number of polling attempts.
                     *      @param {boolean} [oOptions.callback] Value representing the function to be called on completion; <code>oOptions.callback(bPollFunctionReturnedTruthy)</code>.
                     * @returns {function} Function that executes the passed function once per wait duration until it returns truthy or the maximum attempts are exhaused.
                     * @see {@link http://davidwalsh.name/essential-javascript-functions|DavidWalsh.name}
                     */ //#####
                    poll: function () {
                        function poll(fn, oOptions) {
                            var vReturnVal, _a, iWait,
                                iAttempts = 0
                            ;

                            //# Ensure the passed oOptions .is an .obj, scrubbing and defaulting values as we go
                            oOptions = core.extend({
                                //callback: _undefined,
                                //wait: 500,
                                //maxAttempts: 4,
                                //context: {}
                            }, oOptions);
                            iWait = core.type.int.mk(oOptions.wait, 500);
                            oOptions.wait = (core.type.fn.is(oOptions.wait) ? oOptions.wait : function (/*iAttemptCount*/) { return iWait; });
                            oOptions.maxAttempts = core.type.int.mk(oOptions.maxAttempts, 4);

                            return function (/*arguments*/) {
                                function polling() {
                                    //# Inc our iAttempts and collect the vReturnVal
                                    iAttempts++;
                                    vReturnVal = core.type.fn.call(fn, oOptions.context, _a);

                                    //# If we got a truthy vReturnVal from the .call above, we can .call our .callback (if any) indicating bSuccess
                                    if (vReturnVal) {
                                        core.type.fn.call(oOptions.callback, oOptions.context, [true, iAttempts, vReturnVal]);
                                    }
                                    //# Else if the condition isn't met but the timeout hasn't elapsed, .setTimeout
                                    else if (iAttempts < oOptions.maxAttempts) {
                                        setTimeout(polling, oOptions.wait(iAttempts));
                                    }
                                    //# Else we've failed and are over our iAttempts, so .call our .callback (if any) indicating !bSuccess
                                    else {
                                        core.type.fn.call(oOptions.callback, oOptions.context, [false, iAttempts, vReturnVal]);
                                    }
                                }

                                //# .convert the arguments into an _a(rray)
                                _a = convert(arguments);

                                //# Kick off the polling function
                                //#     NOTE: We need a named function below as we .setTimeout for each .wait interval
                                polling();
                            };
                        } //# fn.poll

                        //#########
                        /** Calculates the exponential back-off based on the passed base interval and attempt count.
                         * @function ish.type.fn.poll:expBackoff
                         * @param {integer} [iBaseInterval=100] Value representing the number of milliseconds (1/1000ths of a second) to base the exponential interval on.<br/>E.g. <code>100</code> results in intervals of <code>100</code>, <code>200</code>, <code>400</code>, <code>800</code>, <code>1600</code>, etc.
                         * @returns {function} Function that returns a value representing the number of milliseconds for the current polling attempt.
                         */ //#####
                        poll.expBackoff = function (iBaseInterval) {
                            //# Force the iBaseInterval into an .int then return the exponential backoff .interval function to the caller
                            //#     NOTE: We need to divide the iBaseInterval as we're raising 2 to the power of iAttemptCount below (e.g. 100 / 2 * 2^1 = 100).
                            iBaseInterval = (core.type.int.mk(iBaseInterval, 100) / 2);
                            return function (iAttemptCount) {
                                return (iBaseInterval * Math.pow(2, iAttemptCount));
                            };
                        }; //# fn.poll.expBackoff

                        return poll;
                    }() //# fn.poll
                };
            }() //# core.type.fn.*
        };
    }); //# core.type.*


    //################################################################################################
    /** Input/Output-based functionality.
     * @namespace ish.io
     * @ignore
     */ //############################################################################################
    core.io = {
        //################################################################################################
        /** Console-based functionality.
         *   <p>Wraps the <code>window.console</code> interface, only displaying messages on the console if <code>ish.config.ish().debug</code> is truthy.</p>
         * @namespace ish.io.console
         */ //############################################################################################
        console: function () {
            function doCall(sMethod, _a) {
                if (core.config.ish().debug) {
                    core.type.fn.call(core.resolve(_root, ["console", sMethod]), _null, _a);
                }
            } //# doCall

            return {
                //#########
                /** Logs the passed argument(s) to the console via the native <code>console.log</code> function if <code>ish.config.ish().debug</code> is truthy.
                 * @function ish.io.console.log
                 * @param {...varient} x Value(s) to log.
                 */ //#####
                log: function (/*arguments*/) {
                    doCall("log", arguments);
                }, //# io.console.log

                //#########
                /** Logs the passed argument(s) to the console via the native <code>console.warn</code> function if <code>ish.config.ish().debug</code> is truthy.
                 * @function ish.io.console.warn
                 * @param {...varient} x Value(s) to log.
                 */ //#####
                warn: function (/*arguments*/) {
                    doCall("warn", arguments);
                }, //# io.console.warn

                //#########
                /** Logs the passed argument(s) to the console via the native <code>console.error</code> function if <code>ish.config.ish().debug</code> is truthy.
                 * @function ish.io.console.error
                 * @param {...varient} x Value(s) to log.
                 */ //#####
                error: function (/*arguments*/) {
                    doCall("error", arguments);
                }, //# io.console.err
            };
        }(), //# core.io.console


        //################################################################################################
        /** Event-based functionality.
         * @namespace ish.io.event
         */ //############################################################################################
        event: function () {
            var oEvent, fnDocReady,
                oData = {}
            ;

            //#
            function unwatch(sEvent, fnCallback) {
                return core.type.arr.rm(oData[sEvent], fnCallback);
            } //# unwatch

            //# @param {function} fnCallback Function to execute on completion of the registered callbacks.
            function fire(sEvent, a_vArguments) {
                var i,
                    a_fnEvents = oData[sEvent],
                    bReturnVal = core.type.arr.is(a_fnEvents, true)
                ;

                //# If the passed sEvent isn't a .registered event, implicitly define it now
                if (!bReturnVal) {
                    //# Set a_fnEvents and oData[sEvent] to an empty array, allowing us to set .last and .fired below
                    a_fnEvents = oData[sEvent] = [];
                    a_fnEvents.counter = 0;
                }

                //# Set the .last a_vArguments for this sEvent
                //#     NOTE: We do this here so if a .watch is called after this sEvent has .fired, it can be instantly called with the .last a_vArguments
                a_fnEvents.last = a_vArguments;
                a_fnEvents.counter++;

                //# Traverse the a_fnEvents, throwing each into doCallback while adding its returned integer to our i(terator)
                //#     NOTE: doCallback returns -1 if we are to unwatch the current a_fnEvents which in turn removes it from the array
                for (i = 0; i < a_fnEvents.length; i++) {
                    i += doCallback(a_fnEvents[i], { name: sEvent, count: a_fnEvents.counter }, a_vArguments);
                }

                //# Set the .fired property on the array to true
                //#     NOTE: We do this after the for loop so that doCallback'd a_fnEvents can know if this is the first invocation or not
                a_fnEvents.fired = true;

                return bReturnVal;
            } //# fire

            //#
            function doCallback(fnCallback, oThis, a_vArguments) {
                var iReturnVal = 0;

                //#
                if (unwatch === core.type.fn.call(fnCallback, oThis, a_vArguments)) {
                    unwatch(oThis.name, fnCallback);
                    iReturnVal--;
                }

                return iReturnVal;
            } //# doCallback

            //#
            oEvent = core.extend(fire, {
                //#########
                /** Fires the passed event, executing any registered functions with the passed arguments.
                 * @function ish.io.event.fire
                 * @$aka ish.io.event
                 * @param {string} sEvent Value representing the name of the event.
                 * @param {arguments|variant[]} [a_vArguments=undefined] Value representing the arguments to pass into the event's registered functions.<br/><b>Note:</b> This value is passed through <code>ish.type.fn.convert</code> to ensure an array.
                 * @returns {boolean} Value representing if any registered functions were executed.
                 */ //#####
                fire: fire,

                //#########
                /** Determines if the passed event has been previously fired.
                 * @$note During the first call, <code>ish.io.event.fired</code> will return <code>false</code> to indicate this is the first run of the event.
                 * @function ish.io.event.fired
                 * @param {string} sEvent Value representing the name of the event.
                 * @returns {boolean} Value representing if the passed event has been previously fired.
                 */ //#####
                fired: function (sEvent) {
                    return (core.resolve(oData, [sEvent, "fired"]) === true);
                }, //# fired

                //#########
                /** Watches the passed event, executing the passed function whenever the event is fired.
                 * @$note The passed function will be executed immediately if the passed event has been previously fired.
                 * @function ish.io.event.watch
                 * @param {string} sEvent Value representing the name of the event.
                 * @param {function} fnCallback Function to execute whenever the event is fired, accepting the arguments passed into <code>ish.io.event.fire</code> and executed with <code>{ name: sEvent, count: iEventCallCount }</code> as <code>this</code>.
                 * @returns {boolean} Value representing if the passed function was successfully registered against the event.
                 */ //#####
                watch: function (sEvent, fnCallback) {
                    var bReturnVal = core.type.fn.is(fnCallback);

                    //# If the passed fnCallback .is a valid .fn
                    if (bReturnVal) {
                        (oData[sEvent] = oData[sEvent] || [])
                            .push(fnCallback)
                        ;

                        //# If the sEvent has already been .fired prior to this .watch, .doCallback now
                        if (oData[sEvent].fired) {
                            doCallback(fnCallback, { name: sEvent, count: oData[sEvent].counter }, oData[sEvent].last);
                            core.type.fn.call(oData[sEvent].callback, _undefined, oData[sEvent].last);
                        }
                    }

                    return bReturnVal;
                }, //# watch

                //#########
                /** Unregisters the passed callback from the passed event.
                 * @function ish.io.event.unwatch
                 * @param {string} sEvent Value representing the name of the event.
                 * @param {function} fnCallback Function to unregister against the event.
                 * @returns {boolean} Value representing if the passed callback was successfully unregistered against the event.
                 */ //#####
                unwatch: unwatch,

                //#########
                /** Determines if the passed callback is registered against passed event.
                 * @function ish.io.event.registered
                 * @param {string} sEvent Value representing the name of the event.
                 * @param {function} fnCallback Function that may be registered against the event.
                 * @returns {boolean} Value representing if the passed callback is registered against the event.
                 */ //#####
                registered: function (sEvent, fnCallback) {
                    var vReturnVal;

                    switch (arguments.length) {
                        case 0: {
                            vReturnVal = core.type.obj.ownKeys(oData);
                            break;
                        }
                        case 1: {
                            //#     NOTE: We don't require entries as events can be implicitly defined within .fire and can have all of their events .unwatch'ed
                            vReturnVal = (
                                core.type.str.is(sEvent, true) &&
                                core.type.arr.is(oData[sEvent] /*, false*/)
                            );
                            break;
                        }
                        case 2: {
                            vReturnVal = (
                                core.type.fn.is(fnCallback) &&
                                core.type.str.is(sEvent, true) &&
                                core.type.arr.is(oData[sEvent], true) &&
                                oData[sEvent].indexOf(fnCallback) > -1
                            );
                            break;
                        }
                    }
                    return vReturnVal;
                }, //# registered

                //#########
                /** Unregisters the passed event.
                 * @function ish.io.event.unregister
                 * @param {string} sEvent Value representing the name of the event.
                 * @returns {boolean} Value representing if the passed event has been successfully unregistered.
                 */ //#####
                unregister: function (sEvent) {
                    var bReturnVal = (
                        core.type.str.is(sEvent, true) &&
                        core.type.obj.is(oData[sEvent])
                    );

                    //# If the passed sEvent is within our oData, delete it
                    if (bReturnVal) {
                        delete oData[sEvent];
                    }

                    return bReturnVal;
                } //# unregister
            });

            //# If we are not running on the bServerside, wire-up the jQuery's $(document).ready()-esque event
            //#     FROM: https://github.com/jfriend00/docReady/blob/master/docready.js and https://stackoverflow.com/a/7053197/235704
            if (!bServerside) {
                //# Setup fnDocReady to .fire our ready event only .once
                //#     NOTE: .once is required because we have fallback calls below that we don't want secondary calls from.
                //#     NOTE: As this is a proxy for .fire, other calls to .fire("docready") won't be affected (not that any should be made).
                //#     NOTE: As this is managed by .event, any late calls to .watch("docready", fn) will .fire as expected.
                fnDocReady = core.type.fn.once(function () {
                    oEvent.fire("docready");
                }); //# fnDocReady

                //# If the _document has already been rendered, run fnDocReady
                //#     NOTE: IE only safe when .readyState is "complete", other browsers are safe when .readyState is "interactive"
                if (_document.readyState === "complete" || (!_document.attachEvent && _document.readyState === "interactive")) {
                    fnDocReady();
                }
                //# Else if this is a modern browser, hook the addEventListener.DOMContentLoaded event (and addEventListener.load as a fallback)
                //#     NOTE: This event is the equivalent of jQuery's $(document).ready()
                else if (_document.addEventListener) {
                    _document.addEventListener("DOMContentLoaded", fnDocReady);
                    _root.addEventListener("load", fnDocReady, false);
                }
                //# <IE6thru8Support>
                //# Else fallback to the non-modern browser (IE <= 8) attachEvent.onreadystatechange event (and attachEvent.onload as a fallback)
                else {
                    if (_document.attachEvent) {
                        _document.attachEvent("onreadystatechange", function () {
                            if (_document.readyState === "complete") {
                                fnDocReady();
                            }
                        });
                    }
                    else {
                        _root.attachEvent("onload", fnDocReady);
                    }
                }
                //# </IE6thru8Support>
            }

            return oEvent;
        }() //# core.io.event
    }; //# core.io


    //################################################################################################
    /** Collection of require external JS-based functionality.
     * @namespace ish.require
     */ //############################################################################################
    core.require = function() {
        var fnRequire,
            oRequireOptions = {
                //callback: function (a_oProcessedUrls, bAllLoaded) {},
                onError: function (_dom, sUrl) {
                    core.io.console.error("Unable to include `" + sUrl + "`.");
                }
            }
        ;

        //# Returns the object structure representing a single a_oProcessedUrls entry
        function processUrlEntry(_dom, sUrl, bLoaded, bTimeout) {
            return {
                dom: _dom,
                url: sUrl,
                loaded: !!bLoaded,
                timedout: !!bTimeout
            };
        } //# processUrlEntry

        //# Processes the variant version of vOptions into an object representation
        function processOptions(vOptions) {
            return (core.type.fn.is(vOptions) ? { callback: vOptions } : core.extend({}, vOptions));
        } //# processOptions


        //# If we are running bServerside (or possibly have been required as a CommonJS module)
        if (bServerside) {
            //# Set our fnRequire base function to run bServerside
            fnRequire = function () {
                //#
                //function errorFactory(sInterface) {
                //    return function (/*vUrls, vOptions*/) {
                //        core.io.console.error("ish.require." + sInterface + " is not available server-side.");
                //    };
                //} //# errorFactory


                return core.extend(
                    function (vUrls, vOptions) {
                        var i,
                            a_sUrls = core.type.arr.mk(vUrls, [vUrls]),
                            oOptions = processOptions(vOptions),
                            sPath = __dirname + (/^win/.test(process.platform) ? "\\" : "/"), // (__dirname.indexOf("\\") > 0 ? "\\" : "/"),
                            a_oProcessedUrls = [],
                            bAllLoaded = true
                        ;

                        //# Set the calculated bServerside sPath into our .baseUrl
                        //#     NOTE: __dirname, __filename along with require.main contain the specific information for this module bServerside
                        core.config.ish().baseUrl = sPath;

                        //# Traverse the a_sUrls, .require'ing (while passing in core) and .push'ing each .processUrlEntry into our a_oProcessedUrls as we go
                        for (i = 0; i < a_sUrls.length; i++) {
                            try {
                                require(sPath + a_sUrls[i])(core);
                                a_oProcessedUrls.push(
                                    processUrlEntry(_undefined, a_sUrls[i], true, false)
                                );
                            } catch (e) {
                                //# Since an error occured, flip bAllLoaded to false, .call our .onError and .push the errored .processUrlEntry into our a_oProcessedUrls
                                bAllLoaded = false;
                                core.type.fn.run(oOptions.onError, [_undefined, a_sUrls[i]]);
                                a_oProcessedUrls.push(
                                    processUrlEntry(_undefined, a_sUrls[i], false, false)
                                );
                            }
                        }

                        //# .call the provided fnCallback (if any)
                        //#     NOTE: With the exception of .onError and .callback, all of the clientside core.require features are unused bServerside
                        core.type.fn.run(oOptions.callback, [a_oProcessedUrls, bAllLoaded]);
                    },
                    {
                        //links: errorFactory("links"),
                        //css: errorFactory("css"),
                        scripts: function (vUrls, vOptions) {
                            core.require(vUrls, vOptions);
                        }
                    }
                ); //# fnRequire
            }();
        }
        //# Else we are running in the browser
        else {
            //# .extend the additional clientside-only options into oRequireOptions
            //#     NOTE: Only .callback and .onError are used bServerside
            core.extend(oRequireOptions, {
                //callback: function (a_oProcessedUrls, bAllLoaded) {},
                //onAppend: function (_dom, sUrl) {},
                //onError: function (_dom, sUrl) {},
                waitSeconds: 7,
                baseUrl: "",
                urlArgs: "",
                //# TODO
                /*urlArgs: (oOptions.cache === false ?
                    "?nocache=" + Date.now() :
                    ""
                )*/
            });

            //# Set our fnRequire base function to run clientside
            fnRequire = function () {
                var _head = _document.head,                                                     //# code-golf
                    _document_querySelector = _document.querySelector.bind(_document)           //# code-golf
                ;

                //# Processes the passed a_sUrls via the passed fnProcessor
                function processUrls(vUrls, oOptions, fnProcessor) {
                    var iLen, i,
                        a_sUrls = core.type.arr.mk(vUrls, [vUrls]),
                        a_oProcessedUrls = [],
                        bAllLoaded = true
                    ;

                    //# Local load event handler, calling the required callbacks as required
                    function loadHandler(oEventHandler, _dom, sUrl, bError, bTimedOut) {
                        //# Ensure that we're only called once per sUrl by resetting the oEventHandler's events
                        oEventHandler.onError = oEventHandler.onLoad = core.type.fn.noop;

                        //# .push the current a_sUrls into our a_oProcessedUrls
                        a_oProcessedUrls.push(
                            processUrlEntry(_dom, sUrl, (bError !== true), (bError && bTimedOut))
                        );

                        //# If we were called by .onerror, .call the oOptions.onError callback
                        if (bError) {
                            core.type.fn.call(oOptions.onError, _null, [_dom, sUrl]);
                        }

                        //# If we have loaded all of our a_sUrls, .call our .callback
                        //#     NOTE: We manage the calls via fnEventHandler above to (hopefully) ensure we only are called once per a_sUrls
                        if (a_oProcessedUrls.length === iLen) {
                            core.type.fn.call(oOptions.callback, _null, [a_oProcessedUrls, bAllLoaded]);
                        }
                    } //# loadHandler

                    //#
                    function eventHandler(_dom, bAlreadyLoaded, sUrl, iWaitSeconds) {
                        var iTimeout,
                            oReturnVal = {
                                onError: function (bTimedOut) {
                                    //# Flip bAllLoaded and call the .loadHandler
                                    bAllLoaded = false;
                                    loadHandler(oReturnVal, _dom, sUrl, true, bTimedOut);
                                },
                                onLoad: function () {
                                    //# clearTimeout (if any) and call the .loadHandler
                                    //#      NOTE: As per MDN, clearTimeout(undefined) does nothing, so we don't bother with an if() below
                                    clearTimeout(iTimeout);
                                    loadHandler(oReturnVal, _dom, sUrl /*, false, false*/);
                                }
                            }
                        ;

                        //# If the _dom element was bAlreadyLoaded on the page, call the .loadHandler via .onLoad (which .fn.noop's the oReturnVal's events byref)
                        if (bAlreadyLoaded) {
                            oReturnVal.onLoad();
                        }
                        //# Else we've got work to do, so setup our _dom element then .setTimeout at the passed .waitSeconds
                        //#     NOTE: We wrap the oReturnVal call in functions to ensure the loadHandler's .fn.noop's updates are honored
                        else {
                            _dom.onload = function () { oReturnVal.onLoad(); };
                            _dom.onerror = function () { oReturnVal.onError(); };
                            iTimeout = setTimeout(function () { oReturnVal.onError(true); }, iWaitSeconds * 1000);
                        }

                        return oReturnVal;
                    } //# eventHandler


                    //# If we have a_sUrls to fnProcessor
                    if (core.type.arr.is(a_sUrls, true)) {
                        //# .extend the passed oOptions into the defaults
                        oOptions = core.config.require(oOptions);

                        //# Determine the a_sUrls iLen and traverse them, tossing each into the fnProcessor
                        iLen = a_sUrls.length;
                        for (i = 0; i < iLen; i++) {
                            //# Ensure a local var for the sUrl for use across the fnProcessor
                            //#     NOTE: i is inc'ed past it's current value before the fnEventHandler is called
                            //#     TODO: Array.each()?
                            fnProcessor(a_sUrls[i], oOptions, eventHandler);
                        }
                    }
                    //# Else the passed a_sUrls is empty, so .call the passed .callback now
                    else {
                        core.type.fn.call(oOptions.callback, _null, [a_oProcessedUrls, bAllLoaded]);
                    }
                } //# processUrls


                return core.extend(
                    //#########
                    /** Includes functionality into the current context.
                     * @function ish.require.!
                     * @param {string|string[]} vUrls Value representing the URL(s) of the functionality to include.
                     * @param {object} [oOptions] Value representing the following options:
                     *      @param {boolean} [oOptions.callback=fire:ish.pluginsLoaded] Value representing the function to be called on completion; <code>oOptions.callback(a_oProcessedUrls, bAllLoaded)</code>.
                     *      @param {boolean} [oOptions.onAppend=setAttribute:importedBy] Value representing the function to be called when the DOM element is added; <code>oOptions.onAppend(_dom, sUrl)</code>.
                     *      @param {boolean} [oOptions.onError=undefined] Value representing the function to be called when an error occurs; <code>oOptions.onError(_dom, sUrl)</code>.
                     *      @param {boolean} [oOptions.waitSeconds=7] Value representing the maximum number of seconds to wait before an error is returned.
                     *      @param {boolean} [oOptions.baseUrl=""] Value representing the base URL to prepend on the <code>src</code> attribute (must end with <code>/</code>).
                     *      @param {boolean} [oOptions.urlArgs=""] Value representing the URL's querystring to append on the <code>src</code> attribute (must start with <code>?</code>).
                     */ //#####
                    function (vUrls, oOptions) {
                        var fnCallback, i,
                            a_oProcessedUrls = core.type.arr.mk(vUrls, [vUrls]),    //# Borrow the use of a_oProcessedUrls for the array-ified vUrls
                            bAllLoaded = true,
                            a_sScripts = [],
                            a_sCSS = [],
                            a_sLinks = []
                        ;

                        //# processOptions then set the fnCallback
                        oOptions = processOptions(oOptions);
                        fnCallback = oOptions.callback;

                        //# If we have vUrls (looking at the borrowed a_oProcessedUrls) to process
                        if (core.type.arr.is(a_oProcessedUrls, true)) {
                            //# Traverse the (borrowed) a_oProcessedUrls, sorting each into their related arrays
                            for (i = 0; i < a_oProcessedUrls.length; i++) {
                                switch (core.type.str.mk(a_oProcessedUrls[i]).match(/\.([^\./\?#]+)($|\?|#)/)[1].toLowerCase()) {
                                    case "js": {
                                        a_sScripts.push(a_oProcessedUrls[i]);
                                        break;
                                    }
                                    case "css": {
                                        a_sCSS.push(a_oProcessedUrls[i]);
                                        break;
                                    }
                                    default: {
                                        a_sLinks.push(a_oProcessedUrls[i]);
                                    }
                                }
                            }

                            //# Now that we've sorted the passed vUrls, reset the a_oProcessedUrls and i for the checks below
                            a_oProcessedUrls = [];
                            i = 0;

                            //# Replace the .callback with our own processor
                            //#     NOTE: The original fnCallback is called after all of the vUrls are processed
                            oOptions.callback = function (a_oEntryProcessedUrls, bEntryAllLoaded) {
                                //# If the a_oEntryProcessedUrls have values, .concat them into our a_oProcessedUrls and recalculate bAllLoaded
                                if (core.type.arr.is(a_oEntryProcessedUrls, true)) {
                                    a_oProcessedUrls = a_oProcessedUrls.concat(a_oEntryProcessedUrls);
                                    bAllLoaded = (bAllLoaded && bEntryAllLoaded);
                                }

                                //# If this is the final .callback, fnCallback the original .callback (if any)
                                if (--i === 0) {
                                    core.type.fn.call(fnCallback, _null, [a_oProcessedUrls, bAllLoaded]);
                                }
                            };

                            //# If we have a_sScripts/a_sCSS/a_sLinks values, inc i (for tacking in the .callback defined above) and call the series
                            if (core.type.arr.is(a_sScripts, true)) {
                                i++;
                                core.require.scripts(a_sScripts, oOptions);
                            }
                            if (core.type.arr.is(a_sCSS, true)) {
                                i++;
                                core.require.css(a_sCSS, oOptions);
                            }
                            if (core.type.arr.is(a_sLinks, true)) {
                                i++;
                                core.require.links(a_sLinks, oOptions);
                            }
                        }
                        //# Else no vUrls were passed, so call the fnCallback (if any)
                        //#     NOTE: As vUrls was .arr.mk'd above into the borrowed a_oProcessedUrls which then failed .arr.is, we know it's a null-length array for the call below
                        else {
                            core.type.fn.call(fnCallback, _null, [a_oProcessedUrls, bAllLoaded]);
                        }
                    },
                    {
                        //#########
                        /** Includes Javascript-based functionality into the current context.
                         * @function ish.require.scripts
                         * @param {string|string[]} vUrls Value representing the URL(s) of the functionality to include.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {boolean} [oOptions.callback=fire:ish.pluginsLoaded] Value representing the function to be called on completion; <code>oOptions.callback(a_oProcessedUrls, bAllLoaded)</code>.
                         *      @param {boolean} [oOptions.onAppend=setAttribute:importedBy] Value representing  the function to be called when the DOM element is added; <code>oOptions.onAppend(_dom, sUrl)</code>.
                         *      @param {boolean} [oOptions.onError=undefined] Value representing the function to be called when an error occurs; <code>oOptions.onError(_dom, sUrl)</code>.
                         *      @param {boolean} [oOptions.waitSeconds=7] Value representing the maximum number of seconds to wait before an error is returned.
                         *      @param {boolean} [oOptions.baseUrl=""] Value representing the base URL to prepend on the <code>src</code> attribute (must end with <code>/</code>).
                         *      @param {boolean} [oOptions.urlArgs=""] Value representing the URL's querystring to append on the <code>src</code> attribute (must start with <code>?</code>).
                         */ //#####
                        scripts: function (vUrls, vOptions) {
                            //# <IE6thru9Support>
                            function IE6thru9SupportFactory(_script) {
                                return function () {
                                    if (_script.readyState == "loaded" || _script.readyState == "complete") {
                                        _script.onreadystatechange = _null;
                                        _script.onload(/*false*/);
                                    }
                                };
                            } //# </IE6thru9Support>

                            //# Pass the call off to .processUrls, .process(ing the v)Options as we go
                            vOptions = processOptions(vOptions);
                            processUrls(
                                vUrls,
                                vOptions,
                                function /*fnProcessor*/(sUrl, oOptions, fnEventHandler) {
                                    var sSrc = oOptions.baseUrl + sUrl + oOptions.urlArgs,
                                        _script = _document_querySelector("script[src='" + sSrc + "']")
                                    ;

                                    //# If there was a _script already, call .onLoad on the fnEventHandler for the _script
                                    //#     NOTE: Technically the .onLoad call below is unnecessary as fnEventHandler has already called it and reset it to .fn.noop
                                    if (core.type.dom.is(_script)) {
                                        fnEventHandler(_script, true, sUrl, vOptions.waitSeconds)/*.onLoad()*/;
                                    }
                                    //# Else there wasn't a _script already, so build it
                                    else {
                                        _script = _document.createElement('script');
                                        fnEventHandler(_script, false, sUrl, vOptions.waitSeconds);

                                        //# <IE6thru9Support>
                                        //# If our _script has .readyState defined, we need to monitor .onreadystatechange
                                        //#     NOTE: In order to keep the _tcript in scope for .onreadystatechange, we use the IE6thru9SupportFactory
                                        //#     NOTE: It costs us 9 lines of code to support IE v6-v9
                                        //#     Based on: https://www.html5rocks.com/en/tutorials/speed/script-loading/ and https://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
                                        _script.onreadystatechange = (_script.readyState ? IE6thru9SupportFactory(_script) : _null);
                                        //# </IE6thru9Support>

                                        //# .setAttribute's then append the _script to our _head
                                        //#     NOTE: We set the src after the events because some browsers (IE) start loading the script as soon as the src is set
                                        _script.setAttribute('type', "text/javascript");
                                        _script.setAttribute('src', sSrc);
                                        _head.appendChild(_script);

                                        //# Call .onAppend now that the _script has been .appendChild'd
                                        core.type.fn.call(oOptions.onAppend, _null, [_script, sUrl]);
                                    }
                                } //# fnProcessor
                            );
                        }, //# require.scripts

                        //#########
                        /** Includes link-based functionality into the current context.
                         * @function ish.require.links
                         * @$clientsideonly
                         * @param {string|string[]} vUrls Value representing the URL(s) of the functionality to include.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {boolean} [oOptions.callback=fire:ish.pluginsLoaded] Value representing the function to be called on completion; <code>oOptions.callback(a_oProcessedUrls, bAllLoaded)</code>.
                         *      @param {boolean} [oOptions.onAppend=setAttribute:importedBy] Value representing the function to be called when the DOM element is added; <code>oOptions.onAppend(_dom, sUrl)</code>.
                         *      @param {boolean} [oOptions.onError=undefined] Value representing the function to be called when an error occurs; <code>oOptions.onError(_dom, sUrl)</code>.
                         *      @param {boolean} [oOptions.waitSeconds=7] Value representing the maximum number of seconds to wait before an error is returned.
                         *      @param {boolean} [oOptions.baseUrl=""] Value representing the base URL to prepend on the <code>src</code> attribute (must end with <code>/</code>).
                         *      @param {boolean} [oOptions.urlArgs=""] Value representing the URL's querystring to append on the <code>src</code> attribute (must start with <code>?</code>).
                         */ //#####
                        links: function (vUrls, vOptions) {
                            //# Pass the call off to .processUrls, defaulting and .process(ing the v)Options as we go
                            vOptions = core.extend({
                                rel: "",
                                type: "",   //# SEE: https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
                                media: ""   //# SEE: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
                            }, processOptions(vOptions));
                            processUrls(
                                vUrls,
                                vOptions,
                                function /*fnProcessor*/(sUrl, oOptions, fnEventHandler) {
                                    var oHandler,
                                        sHref = oOptions.baseUrl + sUrl + oOptions.urlArgs,
                                        _link = _document_querySelector("link[href='" + sHref + "']")
                                    ;

                                    //# If there was a _link already, call .onLoad on the fnEventHandler for the _link
                                    //#     NOTE: Technically the .onLoad call below is unnecessary as fnEventHandler has already called it and reset it to .fn.noop
                                    if (core.type.dom.is(_link)) {
                                        fnEventHandler(_link, true, sUrl, vOptions.waitSeconds)/*.onLoad()*/;
                                    }
                                    //# If there wasn't a _link already, build it and collect our oHandler
                                    else {
                                        _link = _document.createElement('link');
                                        oHandler = fnEventHandler(_link, false, sUrl, vOptions.waitSeconds);

                                        //# <NonLinkOnloadSupport>
                                        //# If our _link is missing the .onload event, steal the use of an IMG tag, which pulls the non-IMG .src and .onerror's (thus accomplishing the same goal)
                                        //#     NOTE: We wrap the oHandler call in functions to ensure the loadHandler's .fn.noop's updates are honored
                                        if (!('onload' in _link)) {
                                            oHandler.i = _document.createElement("img");
                                            oHandler.i.onload = oHandler.i.onerror = function () { oHandler.onLoad(); };
                                            oHandler.i.src = sHref;
                                        }
                                        //# </NonLinkOnloadSupport>

                                        //# Set the _link based on our oOptions then .appendChild
                                        //#     TODO: use setAttribute?
                                        _link.rel = oOptions.rel;
                                        _link.type = oOptions.type;
                                        _link.href = sHref;
                                        _link.media = oOptions.media;
                                        _head.appendChild(_link);

                                        //# Call .onAppend now that the _link has been .appendChild'd
                                        core.type.fn.call(oOptions.onAppend, _null, [_link, sUrl]);
                                    }
                                } //# fnProcessor
                            );
                        }, //# links

                        //#########
                        /** Includes CSS-based functionality into the current context.
                         * @function ish.require.css
                         * @$clientsideonly
                         * @param {string|string[]} vUrls Value representing the URL(s) of the functionality to include.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {boolean} [oOptions.callback=fire:ish.pluginsLoaded] Value representing the function to be called on completion; <code>oOptions.callback(a_oProcessedUrls, bAllLoaded)</code>.
                         *      @param {boolean} [oOptions.onAppend=setAttribute:importedBy] Value representing  the function to be called when the DOM element is added; <code>oOptions.onAppend(_dom, sUrl)</code>.
                         *      @param {boolean} [oOptions.onError=undefined] Value representing the function to be called when an error occurs; <code>oOptions.onError(_dom, sUrl)</code>.
                         *      @param {boolean} [oOptions.waitSeconds=7] Value representing the maximum number of seconds to wait before an error is returned.
                         *      @param {boolean} [oOptions.baseUrl=""] Value representing the base URL to prepend on the <code>src</code> attribute (must end with <code>/</code>).
                         *      @param {boolean} [oOptions.urlArgs=""] Value representing the URL's querystring to append on the <code>src</code> attribute (must start with <code>?</code>).
                         */ //#####
                        css: function (vUrls, vOptions) {
                            //# Ensure the passed vOptions .obj.is, defaulting the values as we go
                            core.require.links(vUrls, core.extend({
                                rel: "stylesheet",
                                type: "text/css",
                                media: "all"
                            }, processOptions(vOptions)));
                        } //# css
                    }
                ); //# fnRequire
            }();
        }

        //#########
        /** <code>ish.require</code> configuration values.
         * @function ish.config.require
         * @param {object} [oOptions] Value representing the updated configuration values.
         * @returns {object} Value representing <code>ish.require</code>'s configuration values.
         */ //#####
        core.config.require = core.config(oRequireOptions);

        //# Return the full core.require interface
        //#     NOTE: .modules is included below because it is available on both the client and server-side.
        return core.extend(fnRequire, {
            //#########
            /** Includes functionality into the current context in the defined order.
             * @function ish.require.modules
             * @param {string[]|Array<Array<string>>} a_vModuleUrls Value representing the URL(s) of the functionality to include, each entry representing a bundle that is loaded in series in the defined order.<br/><b>Note:</b> Each entry, along with the passed options, is handed off to <code>ish.require</code>. Once <code>ish.require</code> completes an entry, the next entry is processed.
             * @param {object} [oOptions] Value representing the following options:
             *      @param {boolean} [oOptions.callback=fire:ish.pluginsLoaded] Value representing the function to be called on completion; <code>oOptions.callback(a_oProcessedUrls, bAllLoaded)</code>.
             *      @param {boolean} [oOptions.onAppend=setAttribute:importedBy] Value representing  the function to be called when the DOM element is added; <code>oOptions.onAppend(_dom, sUrl)</code>.
             *      @param {boolean} [oOptions.onError=undefined] Value representing the function to be called when an error occurs; <code>oOptions.onError(_dom, sUrl)</code>.
             *      @param {boolean} [oOptions.waitSeconds=7] Value representing the maximum number of seconds to wait before an error is returned.
             *      @param {boolean} [oOptions.baseUrl=""] Value representing the base URL to prepend on the <code>src</code> attribute (must end with <code>/</code>).
             *      @param {boolean} [oOptions.urlArgs=""] Value representing the URL's querystring to append on the <code>src</code> attribute (must start with <code>?</code>).
             */ //#####
            modules: function (a_vModuleUrls, oOptions) {
                var fnPassedCallback,
                    iLoaded = 0,
                    bAllLoaded = true,
                    a_oProcessedModules = []
                ;

                //# Call .require to load the current a_vModuleUrls
                function doLoad() {
                    core.require(a_vModuleUrls[iLoaded++], oOptions);
                } //# doLoad

                //# Call the fnPassedCallback (if any) with the collected a_oProcessedModules
                function loaded() {
                    core.type.fn.call(fnPassedCallback, _null, [a_oProcessedModules, bAllLoaded]);
                } //# loaded

                //#
                oOptions = processOptions(oOptions);
                fnPassedCallback = oOptions.callback;

                //#
                oOptions.callback = function (a_oProcessedUrls, bEntryAllLoaded) {
                    //# Flip bAllLoaded if bEntryAllLoaded failed and .push the a_oProcessedModules in
                    bAllLoaded = (bAllLoaded && bEntryAllLoaded);
                    a_oProcessedModules.push({
                        module: a_oProcessedUrls,
                        loaded: bEntryAllLoaded
                    });

                    //# Recurse if we have bAllLoaded til now and still have a_vModuleUrls to process, else call loaded
                    (bAllLoaded && iLoaded < a_vModuleUrls.length ? doLoad : loaded)();
                };

                //# If the caller passed in valid a_vModuleUrls, kick off .doLoad, else call .loaded to return a null result to the .callback
                (core.type.arr.is(a_vModuleUrls, true) ? doLoad : loaded)();
            } //# modules
        });
    }();


    //################################################################################################
    /** Stub for Library-based functionality.
     * @namespace ish.lib
     * @property {object} ish.lib.data Stub for Library-based data.
     * @property {object} ish.lib.ui Stub for Library-based UI functionality.
     */ //############################################################################################
     core.lib = oInterfaces.pub(); //# core.lib


    //################################################################################################
    /** Stub for Application-based functionality.
     * @namespace ish.app
     * @property {object} ish.app.data Stub for Application-based data.
     * @property {object} ish.app.ui Stub for Application-based UI functionality.
     */ //############################################################################################
     core.app = oInterfaces.pub(); //# core.app


    //########


    //# If we are running bServerside (or possibly have been required as a CommonJS module)
    if (bServerside) {
        //##################################################################################################
        //# Procedural code
        //# Requires:
        //# <core.extend>, <core.resolve>,
        //# <core.type.obj.mk>
        //##################################################################################################
        oPrivate.init = function () {
            //# If we are running server-side
            //#     NOTE: Generally compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
            //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
            if (typeof module === 'object' && module.exports) {
                module.exports = core;
            }
            //# Else if we are running in an .amd environment, register as an anonymous module
            else if (typeof define === 'function' && define.amd) {
                define([], core);
            }

            //# Set our sTarget in the root
            //#     NOTE: this === `window` in the browser (which is `undefined` per above) and `global` on the server.
            //this[core.config.ish().target] = core;
        };
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        (function () {
            var _head = _document.head,                                                     //# code-golf
                //_body = _document.body,                                                     //# code-golf
                _document_querySelector = _document.querySelector.bind(_document)           //# code-golf
                //_document_querySelectorAll = _document.querySelectorAll.bind(_document),    //# code-golf
            ;

            //##################################################################################################
            //# Procedural code
            //##################################################################################################
            //# Optionally create then .extend our _root variable to expose core as the developer defined in SCRIPT[ish]'s JSON
            //#     NOTE: Since document.currentScript is not universally supported, we look for SCRIPT[ish] as a fallback
            oPrivate.init = function () {
                var sTemp,
                    _script = _document.currentScript || _document_querySelector("SCRIPT[" + sTarget + "]"),
                    oOptions = core.config.ish(),
                    sTarget = oOptions.target,
                    bProcessAttribute = false
                ;

                //#
                function process(bProcessAttribute) {
                    var oTarget = core.resolve(_root, sTarget),
                        bOverride = core.type.obj.is(oTarget)
                    ;

                    //# If we have an  _script[ish] to process
                    if (bProcessAttribute) {
                        //# Reset the .plugins.baseUrl to the developer-defined inline value (if any, borrowing sTemp as we go)
                        sTemp = core.config.require().baseUrl || _script.src;
                        core.config.require({ baseUrl: sTemp.substr(0, sTemp.lastIndexOf("/") + 1) });

                        //# .import any .plugins defined in our oOptions (flagging them as .importedBy SCRIPT[sTarget])
                        core.type.is.ish.import(oOptions.plugins.import, core.extend({
                            importedBy: "SCRIPT[" + sTarget + "]"
                        }, oOptions.plugins));

                        //# Reset our sTarget to the developer-defined inline value (if any)
                        //#     NOTE: This is done here and not in the `if` above so that all _script's are attributed with [ish]
                        sTarget = oOptions.target;
                    }

                    //# If we have an existing oTarget under _root[sTarget] to bOverride core
                    if (bOverride) {
                        //# bOverride core functionality with any functionality under oTarget then also reflect those changes in the _root object's reference
                        //#     NOTE: The .resolve to _root[sTarget] above pulls the object reference to oTarget, so this reference also need to be updated with the core functionality AFTER core has been bOverride'd by oTarget's interfaces
                        core.extend(core, oTarget);
                        core.extend(oTarget, core);
                    }

                    //# If bProcessAttribute isn't _null and we have a valid sTarget under _root, set the _root object's reference so that its a globally accessible object
                    //#     NOTE: We need to create the _root[sTarget] in the .resolve(true, ...) below in case it is not already defined, else the .resolve assignment will fail.
                    if (bProcessAttribute !== _null && core.type.str.is(sTarget, true)) {
                        core.resolve(true, _root, sTarget, (bOverride ? oTarget : core));
                    }
                } //# process


                //# If we were able to locate our _script tag and a _script[ish] attribute is present, .getAttribute its [ish] into sTemp
                //#     NOTE: oOptions.target will be "ish" (or whatever it is set to at the top of the file) as it has yet to be modified
                if (_script && _script.hasAttribute(sTarget)) {
                    sTemp = _script.getAttribute(sTarget);

                    //# If the _script[ish] .getAttribute .is a non-null .str
                    if (core.type.str.is(sTemp, true)) {
                        //# If the _script[ish] .getAttribute .is.json, .extend it into our oOptions
                        if (core.type.str.is.json(sTemp)) {
                            core.extend(oOptions, core.type.obj.mk(sTemp));
                            bProcessAttribute = true;
                        }
                        //# Else if the value of _script[ish] is under our _root, .extend it into our oOptions
                        else if (core.type.obj.is(core.resolve(_root, sTemp))) {
                            core.extend(oOptions, core.resolve(_root, sTemp));
                            bProcessAttribute = true;
                        }
                        //# Else attempt to load the value of _script[ish] as a JSON file, flag bProcessAttribute to skip the .process below and .extend it into our oOptions on bSuccess
                        else {
                            bProcessAttribute = _null;
                            /*
                            core.io.net.get(sTemp, function (bSuccess, oResponse /*, vArg, $xhr* /) {
                                core.extend(oOptions, bSuccess ? oResponse.data : _null);
                                process(_script, bSuccess);
                            });*/
                        }
                    }
                }
                //# Else the _script is missing or the _document.currentScript isn't attributed with [ish]
                else {
                    //# If the _script is missing, dummy one up with .createElement then .appendChild it
                    //#     NOTE: This is done so we can use the SCRIPT[ish] DOM element to collect ish in the plugins
                    if (!_script) {
                        _script = _document.createElement("SCRIPT");
                        _head.appendChild(_script);
                    }

                    //# Set _script[ish] so other scripts can auto-resolve
                    _script.setAttribute(sTarget, "");
                }

                //# Ensure there is a reference to core available on our _script tag so that other scripts can auto-resolve it then .process
                _script[sTarget] = core;
                process(_script, bProcessAttribute);
            }; //# oPrivates.init


            //#########
            /** Determines if the passed value is a valid CSS selector.
             * @function ish.type.str.is:selector
             * @$clientsideonly
             * @param {variant} x Value to interrogate.
             * @returns {boolean} Value representing if the passed value is a valid CSS selector.
             * @see {@link https://stackoverflow.com/a/42149818/235704|Based on this example}
             */ //#####
            core.type.str.is.selector = function isSelector() {
                var _dummy = _document.createElement('br');

                return function (x) {
                    var bReturnVal = false;

                    //# Attempt to .querySelector under the _dummy BR using the selector, with a thrown error indicating a non-compliant selector
                    try {
                        _dummy.querySelector(x);
                        bReturnVal = true;
                    } catch (e) {/*oTypeIsIsh.public.expectedErrorHandler(e);*/}

                    return bReturnVal;
                };
            }(); //# core.type.selector


            //#########
            /** Document Object Model-based type functionality.
             * @namespace ish.type.dom
             * @$clientsideonly
             */ //#####
            core.type.dom = function () {
                var a_oWrapMap = {
                    _:      [1, "<div>", "</div>"],
                    option: [1, "<select multiple='multiple'>", "</select>"],
                    legend: [1, "<fieldset>", "</fieldset>"],
                    area:   [1, "<map>", "</map>"],
                    param:  [1, "<object>", "</object>"],
                    thead:  [1, "<table>", "</table>"],
                    tr:     [2, "<table><tbody>", "</tbody></table>"],
                    col:    [2, "<table><colgroup>", "</colgroup></table>"],
                    td:     [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                    body:   [0, "", ""]
                };

                //# Map the matching tags to their base definitions
                a_oWrapMap.head = a_oWrapMap.body;
                a_oWrapMap.optgroup = a_oWrapMap.option;
                a_oWrapMap.th = a_oWrapMap.td;
                a_oWrapMap.tbody = a_oWrapMap.tfoot = a_oWrapMap.colgroup = a_oWrapMap.caption = a_oWrapMap.thead;

                return {
                    //#########
                    /** Determines if the passed value is a DOM element.
                     * @function ish.type.dom.is
                     * @param {variant} x Value to interrogate.
                     * @param {object|boolean} [vOptions=false] Value representing if CSS selectors that successfully resolve to DOM elements are to be reconized or the desired options:
                     *      @param {boolean} [vOptions.allowSelector=false] Value representing if CSS selectors that successfully resolve to DOM elements are to be reconized.
                     *      @param {boolean} [vOptions.allowHTML=false] Value representing if HTML that successfully parses to DOM elements are to be reconized.
                     * @returns {boolean} Value representing if the passed value is a DOM element.
                     * @see {@link https://stackoverflow.com/a/42149818/235704|Based on this example}
                     */ //#####
                    is: function isDom(x, vOptions) {
                        vOptions = core.type.obj.mk(vOptions, { allowSelector: vOptions === true });

                        //#
                        if (core.type.str.is(x, true)) {
                            //# If we are to .allowSelector, attempt to convert x to a DOM element
                            if (vOptions.allowSelector && core.type.str.is.selector(x)) {
                                x = _document_querySelector(x) || _document.getElementById(x);
                            }
                            //# Else if we are to .allowHTML, attempt to convert x to a DOM element
                            else if (vOptions.allowHTML) {
                                x = core.resolve(core.type.dom.parse(x), "0");
                            }
                        }

                        return (
                            x && //# core.type.is.native(x) &&
                            core.type.str.is(x.tagName) &&
                            x.tagName !== "" &&
                            //core.type.fn.is(x.cloneNode) &&
                            core.type.fn.is(x.getAttribute)
                        );
                    }, //# dom.is

                    //#########
                    /** Casts the passed value into a DOM element.
                     * @$note Can be a CSS Selector (used by document.querySelector), jQuery reference (x[0] will be returned), HTML string defining a single root element or DOM element.
                     * @$note If the value to interrogate represents multiple top-level DOM elements, they will be returned under a single <code><div></div></code> who has a property of <code>parsedMultiple=true</code>.
                     * @function ish.type.dom.mk
                     * @param {variant|string} x Value to interrogate.
                     * @param {element} [_defaultVal=<div></div>] Value representing the default return value if casting fails.
                     * @param {boolean} bReturnMultipleAsArray Value representing if we are to return multiple DOM elements as an array.
                     * @returns {element|element[]} Value representing the passed value as a DOM element.
                     */ //#####
                    mk: function (x, _defaultVal, bReturnMultipleAsArray) {
                        var a__parsed, i,
                            _div = _document.createElement("div"),
                            vReturnVal = (arguments.length > 1 ? _defaultVal : _div)
                        ;

                        //# If the passed x .is .str, .trim it
                        if (core.type.str.is(x, true)) {
                            x = x.trim();

                            //# If the passed x .is a .selector, try and collect it
                            if (core.type.str.is.selector(x)) {
                                vReturnVal = _document_querySelector(x) || _document.getElementById(x) || vReturnVal;
                            }
                            //# Else try to parse the passed .is .str as HTML
                            //#     NOTE: Old logic for reference
                            /*else if (true) {
                                _div.innerHTML = x;

                                //# If we were able to parse a single non-#text node, set it into our vReturnVal
                                if (_div.childNodes.length <= 2 && _div.childNodes[0].nodeType !== 3) {
                                    vReturnVal = _div.childNodes[0];
                                }
                                //# Else if our vReturnVal was defaulted to the _div above, reset the _div's .innerHTML
                                else {
                                    _div.innerHTML = "";
                                }
                            }*/
                            //# Else try to .parse the passed .is .str as HTML
                            else {
                                //# Since .parse will return based on a passed _defaultVal or not, we .run .parse with our own arguments to ensure proper behavior
                                a__parsed = core.type.fn.run(core.type.dom.parse, arguments);

                                //# If we a__parsed out elements
                                if (core.type.arr.is(a__parsed, true)) {
                                    //# If we parsed out more than one element
                                    if (a__parsed.length > 1) {
                                        //# If we are supposed to bReturnMultipleAsArray, set our vReturnVal to a__parsed
                                        if (bReturnMultipleAsArray) {
                                            vReturnVal = a__parsed;
                                        }
                                        //# Else we need to .append the a__parsed elements into the _div, so loop over them, adding each under the generic _div, then set .parsedMultiple and reset our vReturnVal accordingly
                                        else {
                                            for (i = 0; i < a__parsed.length; i++) {
                                                _div.append(a__parsed[i]);
                                            }
                                            _div.parsedMultiple = true;
                                            vReturnVal = _div;
                                        }
                                    }
                                    //# Else we only a__parsed out a single element, so set it into our vReturnVal
                                    else {
                                        vReturnVal = a__parsed[0];
                                    }
                                }
                            }
                        }
                        //# Else if the passed x .is .dom, set our vReturnVal to it
                        else if (core.type.dom.is(x)) {
                            vReturnVal = x;
                        }
                        //# Else if the first index of the passed x .is .dom, set our vReturnVal to it
                        //#     NOTE: This is pretty much to support jQuery objects
                        //#     TODO: is this a good idea? Should we loop over them like above?
                        else if (x && x[0] && core.type.dom.is(x[0])) {
                            vReturnVal = x[0];
                        }

                        return vReturnVal;
                    }, //# dom.mk

                    //#########
                    /** Parses the passed value as a DOM element.
                     * @function ish.type.dom.parse
                     * @param {string} sHTML Value to parse.
                     * @param {element} [_defaultVal=undefined] Value representing the default return value if casting fails.
                     * @returns {element} Value representing the passed value as a DOM element.
                     * @see {@link http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element|Based on this example}
                     */ //#####
                    parse: function (sHTML, _defaultVal) {
                        var a__returnVal, _dom, a_vMap, sTag, bHeadTag, bBodyTag, i;

                        //# .trim any empty leading/trailing #text nodes then safely determine the first sTag (if any) within the passed sHTML along with if it's a bBodyTag
                        //#     NOTE: /g(lobal) only returns the first <tag> for whatever reason(!?) but as that's the desired effect, it's all good.
                        sHTML = core.type.str.mk(sHTML).trim();
                        sTag = core.type.str.mk(
                            (/<([^\/!]\w*)[\s\S]*?>/g.exec(sHTML) || [0,''])[1]
                        ).toLowerCase();
                        bHeadTag = (sTag === 'head');
                        bBodyTag = (sTag === 'body');

                        //# Determine the a_vMap entry then construct our _dom including its .innerHTML
                        //#     NOTE: While we can and do parse multiple elements/nodes, we only look at the first sTag to determine the a_vMap
                        a_vMap = a_oWrapMap[sTag] || a_oWrapMap._;
                        //var _dom = (bBodyTag ? _document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', _null) : _null);
                        _dom = _document.createElement(bHeadTag || bBodyTag ? 'html' : 'div');
                        _dom.innerHTML = a_vMap[1] + sHTML + a_vMap[2];

                        //# Set the i(ndex) and traverse down the a_vMap'd elements to collect the parsed sHTML
                        //#     NOTE: This is done to peal off the required wrapping a_oWrapMap elements from the .innerHTML above
                        i = a_vMap[0];
                        while (i-- /* > 0*/) {
                            _dom = _dom.children[0];
                        }

                        //# .mk .arr'd .childNodes into our a__returnVal
                        a__returnVal = core.type.arr.mk(_dom.childNodes);

                        //#
                        if (bBodyTag) {
                            a__returnVal.shift();
                        }
                        else if (bHeadTag) {
                            a__returnVal.pop();
                        }

                        //#
                        a__returnVal = (
                            core.type.arr.is(a__returnVal, true) ?
                            a__returnVal : (
                                arguments.length > 1 ? [_defaultVal] : []
                            )
                        );

                        return a__returnVal;
                    }, //# dom.parse

                    //#########
                    /** Generates a unique DOM ID.
                     * @function ish.type.dom:id
                     * @param {string} [sPrefix=""] Value representing the DOM ID's prefix.
                     * @returns {element} Value representing a unique DOM ID.
                     */ //#####
                    id: core.extend(
                        function (sPrefix) {
                            var sID;

                            sPrefix = core.type.str.mk(sPrefix);

                            do {
                                sID = sPrefix + Math.random().toString(36).substr(2,5);
                            } while (_document.getElementById(sID));

                            return sID;
                        }, {
                            //#########
                            /** Determines if the passed value represents a reconized DOM ID.
                             * @function ish.type.dom:id:is
                             * @param {string} sID Value representing the DOM ID to test.
                             * @returns {boolean} Value representing if the passed value represents a reconized DOM ID.
                             */ //#####
                            is: function (sID) {
                                return !!_document.getElementById(sID);
                            }
                        }
                    ) //# dom.id
                };
            }(); //# core.type.dom


            //################################################################################################
            /** Collection of UI-based functionality.
             * @namespace ish.ui
             * @$clientsideonly
             */ //############################################################################################
            core.ui = {
                //#########
                /** Scrolls the browser's viewpoint to the passed DOM element.
                 * @function ish.ui.scrollTo
                 * @param {element} vElement Value to scroll the browser's viewpoint to.
                 * @param {boolean} [bSetHash=false] Value representing if the <code>document.location.hash</code> is to be set.
                 * @returns {boolean} Value representing if the passed value is a valid DOM element.
                 * @see {@link https://stackoverflow.com/a/36929383/235704|Based on this example}
                 */ //#####
                scrollTo: function (vElement, bSetHash) {
                    var _element = core.type.dom.mk(vElement, null),
                        bReturnVal = (_element !== null), // _element && core.type.fn.is(_element.getBoundingClientRect)), //# .fn.is probably not req: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
                        doScroll = function (iLastJump) {
                            var iScroll = parseInt(_element.getBoundingClientRect().top * 0.2);

                            _document.body.scrollTop += iScroll;
                            _document.documentElement.scrollTop += iScroll;

                            if (!iLastJump || iLastJump > Math.abs(iScroll)) {
                                setTimeout(function() {
                                    doScroll(Math.abs(iScroll));
                                }, 20);
                            }
                            else if (bSetHash && core.type.str.is(vElement)) {
                                _document.location.hash = "#" + vElement;
                            }
                        } //# doScroll
                    ;

                    //#
                    if (bReturnVal) {
                        doScroll();
                    }

                    return bReturnVal;
                },

                //#########
                /** Clears any page selection(s) from the browser.
                 * @function ish.ui.clearSelection
                 */ //#####
                clearSelection: function () {
                    if (_root.getSelection) {_root.getSelection().removeAllRanges();}
                    else if (_document.selection) {_document.selection.empty();}
                }

                /*
                //############################################################
                //# Determines if the referenced elements overlap in the 2D plane.
                //#    NOTE: This function really only needs to run correctly under those browsers that have Z-Index issues with certain elements, so true cross-platform compatibility is not really required for this function
                //############################################################
                //# Last Updated: April 19, 2006
                this.Overlap = function(oElement1, oElement2) {
                    var bReturn = false;
                    var iX1, iX2, iA1, iA2, iY1, iY2, iB1, iB2;
                        //#### Set the Y (vertical) coords
                    iB1 = this.Top(oElement1);
                    iB2 = iB1 + this.Height(oElement1);
                    iY1 = this.Top(oElement2);
                    iY2 = iY1 + this.Height(oElement2);
                        //#### If the elements seem to be in the way vertically
                    if ((iY1 <= iB1 && iY2 > iB1) || (iY1 >= iB1 && iY1 < iB2)) {
                            //#### Set the X (horizontal) coords
                        iA1 = this.Left(oElement1);
                        iA2 = iA1 + this.Width(oElement1);
                        iX1 = this.Left(oElement2);
                        iX2 = iX1 + this.Width(oElement2);
                            //#### If the passed elements also overlap horizontally, flip bReturn to true
                        if ((iX1 <= iA1 && iX2 > iA1) || (iX1 >= iA1 && iX1 < iA2)) {
                            bReturn = true;
                        }
                    }
                        //#### Return the above determined bReturn to the caller
                    return bReturn;
                };*/
            }; //# core.ui
        }());
    }


    //########


    //# Procedural code
    oPrivate.init();
}(/*global, module, require, process, __dirname*/)); //# NodeJS-specific features that will be undefined in the browser; see: https://nodejs.org/docs/latest/api/globals.html + https://nodejs.org/docs/latest/api/modules.html#modules_dirname
