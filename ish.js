/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @version 0.12.2019-09-08
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
################################################################################################# */
!function (/*global, module, require, process, __dirname*/) {
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
                ver: '0.12.2019-09-08',
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


    /** ################################################################################################
     * @namespace core.type
     * @desc Collection of variable Type-based functionality (`is` and `mk` only).
     * @requires ~core.resolve (core.type.fn.mk)
    ################################################################################################# */
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

        /*
        Determines the type of the passed argument.
        */
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
        } //# core.type

        /*
        Function: is
        Determines if the passed value is an instance of the passed type.
        Parameters:
        o - The variant to interrogate.
        t - The type to compare to.
        Returns:
        Boolean value representing if the passed value is an instance of the passed type.
        */
        type.is = function isType(o, t) {
            try {
                return (o instanceof t);
            } catch (e) {
                return false;
            }
        }; //# type.is

        /*
        Function: native
        Determines if the passed value is a native Javascript function or object.
        Parameters:
        x - The variant to interrogate.
        Returns:
        Boolean value representing if the value is a native Javascript function or object.
        About:
        From: http://davidwalsh.name/essential-javascript-functions
        */
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
        }(), //# type.is.native
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
        }(), //# type.is.native*/

        /*
        Function: is.collection
        Determines if the passed value is a list type (e.g. HTMLCollection|HTMLFormControlsCollection|HTMLOptionsCollection|NodeList|NamedNodeMap|Arguments + Object to support <IE9).
        Parameters:
        n - The variant to interrogate.
        vOptions - variant representing the following optional settings:
            vOptions === true - Boolean value representing if empty collections are to be ignored.
            vOptions.disallow0Length - Boolean value representing if empty collections are to be ignored.
            vOptions.allowObject - Boolean value representing if Objects are to be included in the test (to support <IE9).
            vOptions.allowArray - Boolean value representing if Arrays are to be included in the test.
        Returns:
        Boolean value representing if the value is a list type.
        */
        type.is.collection = function isCollection(n, vOptions) {
            var oOptions = core.type.obj.mk(vOptions),
                bDisallow0Length = (vOptions === true || oOptions.disallow0Length)
            ;

            return (
                (oOptions.allowObject && core.type.obj.is(n, { nonEmpty: bDisallow0Length })) ||
                (oOptions.allowArray && core.type.arr.is(n, bDisallow0Length)) ||
                (
                    (n && core.type.is.numeric(n.length) && (!bDisallow0Length || n.length > 0)) &&
                    /^\[object (HTMLCollection|HTMLFormControlsCollection|HTMLOptionsCollection|NodeList|NamedNodeMap|Arguments)\]$/.test(Object.prototype.toString.call(n))
                )
            );
        }; //# type.is.collection

        /*
        Function: is.numeric
        Determines if the passed value is a numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
        Parameters:
        x - The numeric value to interrogate.
        Returns:
        Boolean value representing if the value is a numeric value.
        */
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
        }; //# type.is.numeric

        /*
        */
        type.is.ish = function isIsh(o) {
            return (arguments.length === 0 || o === core);
        }; //# type.is.ish

        //####

        type.bool = {
            /*
            Function: is
            Determines if the passed value is a boolean value (e.g. `true` or `false`).
            Parameters:
            b - The boolean value to interrogate.
            Returns:
            Boolean value representing if the value is a boolean value.
            */
            is: function isBool(b, bAllowString) {
                var sB = mkStr(b).toLowerCase();

                return (
                    _Object_prototype_toString.call(b) === '[object Boolean]' ||
                    (bAllowString && (sB === "true" || sB === "false"))
                );
            }, //# bool.is

            /*
            Function: mk
            Safely forces the passed variant into a boolean value.
            Parameters:
            b - The variant to interrogate.
            bDefaultVal - The default value to return if casting fails.
            Returns:
            Boolean value representing the truthiness of the passed variant.
            */
            mk: function (b, bDefaultVal) {
                var bReturnVal = (
                    arguments.length > 1 ?
                    bDefaultVal : (
                        b ? true : false
                    )
                );

                //# Since the bReturnVal was defaulted to the bDefaultVal above, pull it's value back into our bDefaultVal
                bDefaultVal = bReturnVal;

                //#
                if (core.type.bool.is(b)) {
                    bReturnVal = b;
                }
                //#
                else if (core.type.str.is(b, true)) {
                    b = b.trim().toLowerCase();
                    bReturnVal = (b === 'true' || (
                        b === 'false' ? false : bDefaultVal
                    ));
                }

                return bReturnVal;
            } //# bool.mk
        }; //# core.type.bool

        type.int = {
            /*
            Function: is
            Determines if the passed value is an integer value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            x - The integer to interrogate.
            Returns:
            Boolean value representing if the value is an integer value.
            */
            is: function isInt(x) {
                var fX = core.type.float.mk(x);
                return (core.type.is.numeric(x) && fX % 1 === 0);
            }, //# int.is

            /*
            Function: mk
            Safely forces the passed value into an integer (includes implicit casting per the Javascript rules, see about section).
            Parameters:
            i - The variant to interrogate.
            vDefault - The default value to return if casting fails.
            iRadix - Integer between 2 and 36 that represents the radix (the base in mathematical numeral systems) of the above mentioned string.
            Returns:
            Integer representing the passed value.
            About:
            Javascript has some funky rules when it comes to casting numeric values, and they are at play in this function.
            > "12 monkeys!" === 12
            > "   12 monkeys!" === 12
            > "12monkeys!" === 12
            > "1 2 monkeys!" === 1 (not 12)
            > "1,2 monkeys!" === 1 (not 12)
            > "1,200 monkeys!" === 1 (not 1200)
            > "11 - there were 12 monkeys!" === 11
            > "twelve (12) monkeys!" === undefined
            > "$12 monkeys!" === undefined
            In short, the first non-whitespace numeric characters are used in the cast, until any non-numeric character is hit.
            */
            mk: function (i, vDefault, iRadix) {
                var iReturnVal = parseInt(i, (iRadix > 1 && iRadix < 37 ? iRadix : 10));

                return (!isNaN(iReturnVal) ?
                    iReturnVal :
                    (arguments.length > 1 ? vDefault : 0)
                );
            } //# int.mk
        }; //# core.type.int

        type.float = {
            /*
            Function: is
            Determines if the passed value is a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            x - The numeric value to interrogate.
            Returns:
            Boolean value representing if the value is a floating point numeric value.
            */
            is: function isFloat(x) {
                var fX = core.type.float.mk(x);
                return (core.type.is.numeric(x) && fX % 1 !== 0);
            }, //# float.is

            /*
            Function: mk
            Safely forces the passed value into a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            f - The variant to interrogate.
            vDefault - The default value to return if casting fails.
            iRadix - Integer between 2 and 36 that represents the radix (the base in mathematical numeral systems) of the above mentioned string.
            Returns:
            Float representing the passed value.
            */
            mk: function (f, vDefault, iRadix) {
                var fReturnVal;

                //# Thanks to Symbol()s not wanting to be casted to strings or numbers (i.e. parseFloat, regexp.test, new Date), we need to wrap the test below for the benefit of ish.type()
                try {
                    fReturnVal = parseFloat(f, (iRadix > 1 && iRadix < 37 ? iRadix : 10));
                } catch (e) {}

                return (!isNaN(fReturnVal) ?
                    fReturnVal :
                    (arguments.length > 1 ? vDefault : 0)
                );
            } //# float.mk
        }; //# core.type.float

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
                /*
                Function: is
                Determines if the passed value is a date.
                Parameters:
                x - The date to interrogate.
                Returns:
                Boolean value representing if the value is a date.
                */
                is: function isDate(x, bAllowNumeric) {
                    return mkDate(x, bAllowNumeric).b;
                }, //# date.is

                /*
                Function: mk
                Safely forces the passed value into a date.
                Parameters:
                x - The variant to interrogate.
                dDefault - The default value to return if casting fails.
                Returns:
                Date representing the passed value.
                */
                mk: function (x, dDefault) {
                    var oResult = mkDate(x, true);

                    return (oResult.b ?
                        oResult.d :
                        (arguments.length > 1 ? dDefault : new Date())
                    );
                } //# date.mk
            };
        }(); //# core.type.date

        type.str = {
            /*
            Function: is
            Determines if the passed value is a string.
            Parameters:
            s - The string to interrogate.
            bDisallowNullString - Boolean value indicating if null-strings are to be disallowed (e.g. "").
            bTrimWhitespace - Boolean value indicating if leading and trailing whitespace is to be trimmed prior to integration.
            Returns:
            Boolean value representing if the value is a string.
            */
            is: function isStr(s, bDisallowNullString, bTrimWhitespace) {
                return (
                    (typeof s === 'string' || s instanceof String) &&
                    (!bDisallowNullString || s !== "") &&
                    (!bTrimWhitespace || mkStr(s).trim() !== "")
                );
            }, //# str.is

            /*
            Function: mk
            Safely forces the passed value into a string.
            Parameters:
            x - The variant to interrogate.
            sDefault - The default value to return if casting fails.
            Returns:
            String representing the passed value.
            */
            mk: function (s, sDefault) {
                var sS = (core.type.obj.is(s, { strict: true }) ? JSON.stringify(s) : mkStr(s));

                return ((s || s === false || s === 0) && sS ?
                    sS :
                    (arguments.length > 1 ? sDefault : "")
                );
            } //# str.mk
        }; //# core.type.str

        type.fn = {
            /*
            Function: is
            Determines if the passed value is a function.
            Parameters:
            f - The variant to interrogate.
            Returns:
            Boolean value representing if the value is a function.
            */
            is: function isFn(f) {
                return (_Object_prototype_toString.call(f) === '[object Function]');
            }, //# fn.is

            //#
            mk: function (f, fnDefault) {
                var vResolved,
                    fnResolve = core.resolve || function (_root, sKey) { return _root[sKey]; },
                    fnReturnVal = (arguments.length > 1 ? fnDefault : noop)
                ;

                //# If the passed f .is a .fn, reset our fnReturnVal to it
                if (core.type.fn.is(f)) {
                    fnReturnVal = f;
                }
                //# Else we need to see if f can be vResolved
                else {
                    vResolved = (core.type.str.is(f) || core.type.arr.is(f) ? fnResolve(_root, f) : _undefined);

                    //# If the passed f .is a .str or .arr and we vResolved it to a .fn, reset our fnReturnVal to it
                    if (core.type.fn.is(vResolved)) {
                        fnReturnVal = vResolved;
                    }
                }

                return fnReturnVal;
            } //# fn.mk
        }; //# core.type.fn

        type.arr = {
            /*
            Function: is
            Determines if the passed value is an array.
            Parameters:
            a - The variant to interrogate.
            bDisallow0Length - Boolean value representing if zero length arrays are to be ignored.
            Returns:
            Boolean value representing if the value is an array.
            */
            is: function isArr(a, bDisallow0Length) {
                return (_Object_prototype_toString.call(a) === '[object Array]' &&
                    (!bDisallow0Length || a.length > 0)
                );
            }, //# arr.is

            /*
            Function: mk
            Safely forces the passed array or list reference into an array.
            Parameters:
            a - The variant to interrogate.
            a_vDefault - The default value to return if casting fails.
            Returns:
            Array representing the updated array reference.
            */
            mk: function (a, a_vDefault) {
                //# Preconvert a list reference into an array
                a = (core.type.is.collection(a) ? Array.prototype.slice.call(a) : a);

                return (core.type.arr.is(a) ?
                    a :
                    (arguments.length > 1 ? a_vDefault : [])
                );
            } //# arr.mk
        }; //# core.type.arr

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
                /*
                Function: is
                Determines if the passed value is an object.
                Parameters:
                o - The variant to interrogate.
                vOptions - variant representing the following optional settings:
                    vOptions === true - Boolean value representing if empty objects are to be ignored.
                    vOptions.strict - Boolean value representing if only [object Objects] are to be allowed.
                    vOptions.nonEmpty - Boolean value representing if empty objects are to be ignored.
                    vOptions.allowFn - Boolean value representing if functions are to be allowed.
                    vOptions.allowJSON - Boolean value representing if JSON-strings are to be allowed.
                    vOptions.requiredKeys - Array of Strings listing the keys required to be present in the object.
                    vOptions.interface - Object defining the keys and types.
                Returns:
                Boolean value representing if the value is an object.
                */
                is: function isObj(o, vOptions) {
                    var fnTest, a_sInterfaceKeys, i, bReturnVal,
                        oSettings = (vOptions && vOptions === Object(vOptions) ? vOptions : {}),
                        a_sRequiredKeys = oSettings.requiredKeys,
                        oInterface = oSettings.interface,
                        bDisallowEmptyObject = !!(vOptions === true || oSettings.nonEmpty)
                    ;

                    //# Call objBase to determine the validity of the passed o(bject), storing the results back in out o(bject) and bReturnVal
                    o = objBase(o, oSettings.allowFn, oSettings.allowJSON, oSettings.strict);
                    bReturnVal = o.b;
                    o = o.o;

                    //# If the passed o(bject) is valid
                    if (bReturnVal) {
                        //# Reset our bReturnVal based on bDisallowEmptyObject
                        bReturnVal = (!bDisallowEmptyObject || Object.keys(o).length !== 0);

                        //# If we still have a valid Object and we have a_sRequiredKeys, traverse them
                        if (bReturnVal && core.type.arr.is(a_sRequiredKeys, true)) {
                            for (i = 0; i < a_sRequiredKeys.length; i++) {
                                //# If the current a_sRequiredKeys is missing from our o(bject), flip our bReturnVal and fall from the loop
                                if (!o.hasOwnProperty(a_sRequiredKeys[0])) {
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
                                if (!o.hasOwnProperty(a_sInterfaceKeys[i]) || !core.type.fn.call(fnTest, null, o[a_sInterfaceKeys[i]])) {
                                    bReturnVal = false;
                                    break;
                                }
                            }
                        }
                    }

                    return bReturnVal;
                }, //# obj.is

                /*
                Function: mk
                Safely forces the passed object reference into an object containing the passed path optionally set to the optional value.
                Parameters:
                o - The variant to interrogate.
                sPath - String representing the path to the property.
                (Optional) vValue - variant representing the value to set the referenced property to.
                Returns:
                Object representing the updated object reference.
                */
                mk: function (o, oDefault) {
                    //# If the passed o(bject) .is .str, try to .mkJSON
                    if (core.type.str.is(o, true)) {
                        o = mkJSON(o);
                    }

                    return (core.type.obj.is(o, { allowFn: true }) ?
                        o :
                        (arguments.length > 1 ? oDefault : {})
                    );
                }, //# obj.mk
            };
        }(); //# core.type.obj

        type.symbol = {
            exists: function () {
                return core.type.fn.is(_root.Symbol);
            }, //# symbol.exists

            is: function (x) {
                return (core.type.symbol.exists() && typeof x === 'symbol');
            }, //# symbol.is

            mk: function (x, xDefault) {
                return (core.type.symbol.is(x) ?
                    x :
                    (arguments.length === 1 ? _root.Symbol() : xDefault)
                );
            } //# symbol.mk
        }; //# core.type.symbol


        return type;
    }(); //# core.type.*.is|mk


    /** ################################################################################################
     * @function resolve
     * @desc Safely accesses (or optionally creates) an object structure, allowing access to deep properties without the need to ensure the object structure exists.
     * @param {boolean} [bForceCreate] - Indicates if the path is to be forcibly created. `false` creates the path if it does not already exist, `true` overwrites non-object parent path segments with objects (see About).
     * @param {object} oObject - The object to interrogate.
     * @param {string|array[string]} vPath - variant representing the path to the requested property (array or period-delimited string, e.g. "parent.child.array.0").
     * @param {variant} [vValue] - variant representing the value to set the referenced property to (used only when creating the path).
     * @returns {variant} variant representing the value at the referenced path, returning undefined if the path does not exist.
     * @example <caption>When forcing the creation of an object structure, data can be lost if an existing non-object property is used as a parent, e.g.:</caption>
     * var neek = { nick: true };
     * var deepProp = ish.resolve(true, neek, "nick.campbell");
     * // This will overwrite the boolean property `nick` with an object reference containing the property `campbell`.
     * @requires core.type.obj.is, core.type.str.is, core.type.arr.is
    ################################################################################################# */
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
    }; //# core.resolve
    //# Setup the "unique" value for .returnMetadata so it can be detected within core.resolve (borrowing noop() for the unique value)
    //#     NOTE: Arguably this should be a Symbol rather than the borrowed noop() but the support for Symbol isn't 100%, so...
    core.resolve.returnMetadata = noop;


    /** ################################################################################################
     * @function extend
     * @desc Merges the content of subsequent objects into the first one, overriding its original values.
     * @param {boolean|integer} [vDeepCopy] - (Optional) Indicates if a deep copy is to occur. `false` performs a shallow copy, a positive integer indicates the max depth to perform a deep copy to, `true` and all other integer values perform a deep copy to an unlimited depth. Default value: `true`.
     * @param {object} oTarget - Object to receive properties.
     * @param {...object} oSource - Object(s) who's properties will be copied into the target.
     * @returns {object} Object referencing the passed oTarget.
     * @example <caption>Right-most source object wins:</caption>
     * // `oResult.i` will equal `2`.
     * var oResult = core.data.extend({}, { i: 1 }, { i: 2 });
     * // Heavily refactored code from http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
     * @requires core.type.bool.is, core.type.int.is, core.type.obj.is, core.type.arr.is, ~core.type.dom.is
     * @requires core.type.int.mk
    ################################################################################################# */
    core.extend = function (/*[vDeepCopy], oTarget, oSource, oSource2...*/) {
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
                        //# Else if we're in the midst of a deep copy and the sKey .is an .obj, .extend it into our oTarget[sKey]
                        else if (iExtendDepth !== 1 && core.type.obj.is(oSource[sKey])) {
                            oTarget[sKey] = core.extend(iExtendDepth - 1, oTarget[sKey], oSource[sKey]);
                        }
                        //#
                        else if (core.type.date.is(oSource[sKey])) {
                            oTarget[sKey] = new Date(oSource[sKey]);
                        }
                        //# Else treat the oSource[sKey] as a value, setting it into oTarget[sKey]
                        else {
                            oTarget[sKey] = oSource[sKey];
                        }
                    }
                }
            }
        }

        return oTarget;
    }; //# core.extend


    /** ################################################################################################
     * @function ish.config
     * @desc (Factory) Creates an interface that merges the content of the passed options into the underlying configuration, overriding any original values.
     * @param {object} oConfig - The object that stores the underlying configuration values.
     * @returns {function} - The function that updates and returns the object representing the configuration values.
    ################################################################################################# */
    core.config = function (oConfig) {
        return function (oOptions) {
            //# If oOptions were passed in, .extend them into our oConfig
            if (arguments.length > 0) { core.extend(oConfig, oOptions); }

            //# Always return an unattached deep copy of the oConfig to the caller
            return core.extend(true, {}, oConfig);
        };
    }; //# core.config


    /** ################################################################################################
     * @namespace core.oop
     * @desc Collection of Object-Oriented Programming-based functionality.
     * @requires core.extend
     * @requires core.type.obj.is, core.type.fn.is
     * @requires core.type.obj.mk
    ################################################################################################# */
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
                //#
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

                //#
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


    /** ################################################################################################
     * @namespace core.type
     * @desc Collection of variable Type-based functionality (non-`is`/`mk` core features).
     * @requires core.type.arr.is, core.type.obj.is, core.type.fn.is
     * @requires core.type.arr.mk, core.type.obj.mk
     * @requires core.oop.partial
    ################################################################################################# */
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
        oTypeIsIsh.public['import'] = function (a_sImport, oOptions) {
            var i;

            //# Ensure the passed a_sImport and oOptions are valid and setup
            //#     NOTE: We don't test/gate based on a_sImport being an .arr.is because this way we ensure the ish.pluginsLoaded .event is always .fire'd
            //#     NOTE: <script type="text/javascript" src="js/ish/ish.js" ish='{ "target": "$z", "plugins": { "import": ["lib.ui","app.tags","app.ui"], "baseUrl": "js/ish/", "cache": false } }'></script>
            a_sImport = core.type.arr.mk(a_sImport, [a_sImport]);
            oOptions = core.extend({
                callback: function (a_oProcessedUrls, bAllLoaded) {
                    core.io.event.fire("ish.pluginsLoaded", [a_oProcessedUrls, bAllLoaded]);
                },
                onAppend: function (_dom /*, sUrl*/) {
                    if (!bServerside && _dom) {
                        _dom.setAttribute("importedBy", oOptions.importedBy || "type.is.ish.import");
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


        /** ################################################################################################
         * @function ish.config.ish
         * @desc Merges the content of the passed options into the underlying configuration, overriding any original values.
         * @param {object} oOptions - object representing the updated configuration values.
         * @returns {object} - object representing the configuration values.
        ################################################################################################# */
        core.config.ish = core.config(oTypeIsIsh.config);

        return {
            is: {
                //# Extend our .public oTypeIsIsh interfaces onto the above-defined type.is.ish function
                ish: oTypeIsIsh.public,

                /*
                Function: val
                Determines if the passed value is set (i.e. !== undefined || null).
                Parameters:
                v - The variant to interrogate.
                Returns:
                Boolean value representing if the value is set (i.e. !== undefined || null).
                */
                val: function (v) {
                    return (v !== _undefined && v !== _null);
                }, //# type.is.val

                // Primitive Vals - Null, Undefined, Boolean, Number, String, Symbol
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
                //    vValue - The variant to interrogate, where the `length` property used for the numeric comparison (if present).
                //    vType - Function or String denoting the type testing logic which returns `truthy` if ``vValue` is of `vType`.
                //    (Optional) nMin - Numeric value representing the minimum allowed value (can be passed as `undefined` for no defined minimum).
                //    (Optional) nMax - Numeric value representing the maximum allowed value (can be passed as `undefined` for no defined maximum).
                //    Returns:
                //    Boolean value representing if the passed value is within the passed range or `undefined` if the vType cannot be resolved to a function.
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

            date: {
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
                    /*
                    Function: json
                    Determines if the passed value is a valid JSON string.
                    Parameters:
                    s - The variant to interrogate.
                    Returns:
                    Boolean value representing if the passed value is a valid JSON string.
                    */
                    json: function (s) {
                        try {
                            JSON.parse(s);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    } //# type.str.is.json
                }
            }, //# core.type.str

            arr: {
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

                of: function (a_vArray, fnTest) {
                    var i,
                        bReturnVal = (core.type.arr.is(a_vArray, true) && core.type.fn.is(fnTest))
                    ;

                    //# If the passed arguments are valid, traverse the a_vArray fnTest'ing each as we go
                    if (bReturnVal) {
                        for (i = 0; i < a_vArray.length; i++) {
                            if (!fnTest(a_vArray[i])) {
                                bReturnVal = false;
                                break;
                            }
                        }
                    }

                    return bReturnVal;
                } //# type.arr.of
            }, //# core.type.arr.*

            obj: {
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

                //#
                ownKeys: function(oSource) {
                    var i,
                        a_sReturnVal /* = _undefined */
                    ;

                    //# If the passed oSource .is .obj, collect its .keys into our a_sReturnVal
                    //#     NOTE: Object.keys is polyfilled for pre-IE9 while Object.getOwnPropertyNames is not
                    if (core.type.obj.is(oSource, { allowFn: true })) {
                        a_sReturnVal = Object.keys(oSource);

                        //# Traverse the collected oSource .keys from back to front (so we can .splice them out as we go)
                        for (i = a_sReturnVal.length; i > 0; i--) {
                            //# If the current .keys isn't a .hasOwnProperty, .splice it from our a_sReturnVal
                            if (!oSource.hasOwnProperty(a_sReturnVal[i])) {
                                a_sReturnVal.splice(i, 1);
                            }
                        }
                    }

                    return a_sReturnVal;
                }, //# type.obj.ownKeys

                //#
                get: function (oObject, sKey) {
                    var sCurrentKey,
                        vReturnVal /* = _undefined */
                    ;

                    //# If the called passed in a valid oObject, .toLowerCase our sKey
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


            /** ################################################################################################
             * @namespace core.type.fn (Function)
             * @desc Collection of Function management functionality.
             * @requires core.type.fn.is, core.type.arr.is
             * @requires core.type.arr.mk, core.type.obj.mk
            ################################################################################################# */
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
                    /*
                    */
                    arguments: function (_args) {
                        return (Object.prototype.toString.call(_args) === "[object Arguments]");
                    }, //# fn.arguments

                    /*
                    Function: convert
                    Converts the passed argument from an arguments instance, array or single variable into an Array fit to pass to fn.apply().
                    vArguments - variant representing the argument(s) to convert into an array
                    Returns:
                    Array representing the passed vArguments fit to pass to fn.apply().
                    */
                    convert: convert,


                    /*
                    Function: noop
                    Null Function with no arguments or return for use when a valid function reference is required but no action is necessary
                    */
                    noop: noop,


                    /*
                    Function: call
                    Safely calls the passed function, returning the default value if the passed function is invalid.
                    Parameters:
                    fn - Function to attempt to call.
                    vArguments - variant representing the argument(s) to pass into the passed function
                    vContext - variant representing the Javascript context (e.g. `this`) in which to call the function.
                    //oOptions - Object representing the desired options:
                    //    oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                    //    oOptions.default - variant representing the default value to return if an error occurs. Default: `undefined`.
                    Returns:
                    variant representing the result of the passed function.
                    */
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
                                    //vReturnVal = fn.apply(this, convert(vArguments));
                                    vReturnVal = fn.apply(vContext);
                                    break;
                                }
                                default: {
                                    vReturnVal = fn.apply(vContext /*|| core.resolve(vArguments, "this")*/, convert(vArguments));
                                    //break;
                                }
                            }
                        }

                        return vReturnVal;
                    }, //# fn.call


                    /*
                    Function: run
                    Safely calls the passed function, returning the default value if the passed function is invalid.
                    Parameters:
                    fn - Function to attempt to call.
                    vOptions - Variant representing an Arguments object, an Array of arguments or an Object representing the desired options:
                        oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.default - variant representing the default value to return if an error occurs. Default: `undefined`.
                        oOptions.args - array or Arguments object representing the argument(s) to pass into the passed `fn` function.
                    Returns:
                    Variant representing the result of the passed function or the default value passed in via `vOptions` if the passed `fn` is not a function.
                    */ //# TODO: Rename to call and delete original fn.call
                    run: function (fn, vOptions) {
                        var vReturnVal,
                            a_vArguments = (
                                core.type.fn.arguments(vOptions) ?
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


                    /*
                    Function: once
                    (Factory) Ensure a function is called only once.
                    Parameters:
                    fn - Function to call once.
                    oOptions - Object representing the desired options:
                        oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.rereturn - Boolean value representing if subsequent calls should return the first return value (default: true).
                    Returns:
                    Function that returns the variant representing the result of the passed function.
                    About:
                    Usage -
                    > var canOnlyFireOnce = once(function () {
                    >     console.log('Fired!');
                    > });
                    > //...
                    > canOnlyFireOnce();
                    About:
                    From: http://davidwalsh.name/essential-javascript-functions
                    */
                    once: function (fn, oOptions) {
                        var vReturnVal /*= _undefined*/;

                        //#
                        oOptions = processOptions(oOptions, {
                            rereturn: true
                        } /*, _undefined*/);
                        oOptions.call = 0;

                        return function (/*arguments*/) {
                            if (core.type.fn.is(fn)) {
                                vReturnVal = fn.apply(oOptions.context, convert(arguments));
                                fn = _null;
                            }

                            return (++oOptions.call === 1 || oOptions.rereturn ? vReturnVal : _undefined);
                        };
                    }, //# fn.once


                    /*
                    Function: tryCatch
                    (Factory) Safely calls the passed function, returning the default value if an error occurs during execution.
                    Parameters:
                    fn - Function to call.
                    oOptions - Object representing the desired options:
                        oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.default - variant representing the default value to return if an error occurs. Default: `undefined`.
                        oOptions.returnObj - Boolean value representing if an Object is to be returned representing the result and error. Default `false`.
                    Returns:
                    Function that returns the variant representing the result of the passed function.
                    */
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


                    /*
                    Function: throttle
                    (Factory) Enforces a maximum number of times a function can be called over time.
                    Parameters:
                    fn - Function to call.
                    oOptions - Object representing the desired options:
                        oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.wait - Minimum number of milliseconds between each call (default: 500).
                        oOptions.leading - The throttled function will run as much as possible, without ever going more than once per wait duration. If you’d like to disable the execution on the leading edge, pass {leading: false}.
                        oOptions.trailing - The throttled function will run as much as possible, without ever going more than once per wait duration. If you’d like to disable the execution on the trailing edge, pass {trailing: false}.
                    Returns:
                    Function that returns the variant representing the result of the passed function.
                    About:
                    Based on http://underscorejs.org/docs/underscore.html
                    Returns a function, that, when invoked, will only be triggered at most once during a given window of time. Normally, the throttled function will run as much as it can, without ever going more than once per wait duration; but if you’d like to disable the execution on the leading edge, pass {leading: false}. To disable execution on the trailing edge, ditto.
                    */
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


                    /*
                    Function: debounce
                    (Factory) Enforces that a function cannot be called again until a certain amount of time has passed without it being called.
                    Parameters:
                    fn - Function to call.
                    oOptions - Object representing the desired options:
                        oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.wait - Minimum number of milliseconds between each call (default: 500).
                        oOptions.immediate - Execute the function the first time without waiting (default: false).
                    Returns:
                    Function that returns the variant representing the result of the passed function.
                    About:
                    Usage -
                    >    var myEfficientFn = debounce(function () {
                    >        // All the taxing stuff you do
                    >    }, 250);
                    >    window.addEventListener('resize', myEfficientFn);
                    Based on http://underscorejs.org/docs/underscore.html
                    */
                    debounce: function (fn, oOptions) {
                        var timeout, args, context, timestamp, result,
                            later = function () {
                                var last = _Date_now() - timestamp;

                                if (last < oOptions.wait && last >= 0) {
                                    timeout = setTimeout(later, oOptions.wait - last);
                                } else {
                                    timeout = _null;
                                    if (!oOptions.immediate) {
                                        result = fn.apply(context, args);
                                        if (!timeout) context = args = _null;
                                    }
                                }
                            }
                        ;

                        //#
                        oOptions = processOptions(oOptions, {
                            //context: _undefined,
                            immediate: false
                        }, 500);

                        return function (/*arguments*/) {
                            var callNow = oOptions.immediate && !timeout;
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


                    /*
                    Function: poll
                    (Factory) Calls the referenced function based on the wait interval until it returns truthy.
                    Parameters:
                    fn - Function called each wait time returning truthy. On a truthy return value, oOptions.onsuccess is called (if any).
                    oOptions - Object representing the desired options:
                        oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.wait - Function or Integer defining the minimum number of milliseconds between each poll attempt (default: 500).
                        oOptions.retries - Integer defining the maximum number of polling attempts (default: 4).
                        oOptions.callback - Function to call on completion, with bSuccess as the first argument.
                        //oOptions.timeout - Maximum number of milliseconds to do the polling (default: 2000).
                    Returns:
                    Function that initiates the polling process.
                    About:
                    Based on code from: http://davidwalsh.name/essential-javascript-functions
                    */
                    poll: function () {
                        function poll(fn, oOptions) {
                            var vReturnVal, _a, iWait,
                                iAttempts = 0
                            ;

                            //# Ensure the passed oOptions .is an .obj, scrubbing and defaulting values as we go
                            oOptions = core.extend({
                                //callback: _undefined,
                                //wait: 500,
                                //retries: 4,
                                //context: {}
                            }, oOptions);
                            iWait = core.type.int.mk(oOptions.wait, 500);
                            oOptions.wait = (core.type.fn.is(oOptions.wait) ? oOptions.wait : function (/*iAttempts*/) { return iWait; });
                            oOptions.retries = core.type.int.mk(oOptions.retries, 4);

                            return function (/*arguments*/) {
                                //# .convert the arguments into an _a(rray)
                                _a = convert(arguments);

                                //# Setup and call the polling function
                                //#     NOTE: We need a named function below as we .setTimeout for each .wait interval
                                !function polling() {
                                    //# Inc our iAttempts and collect the vReturnVal
                                    iAttempts++;
                                    vReturnVal = core.type.fn.call(fn, oOptions.context, _a);

                                    //# If we got a truthy vReturnVal from the .call above, we can .call our .callback (if any) indicating bSuccess
                                    if (vReturnVal) {
                                        core.type.fn.call(oOptions.callback, oOptions.context, [true, iAttempts, vReturnVal]);
                                    }
                                    //# Else if the condition isn't met but the timeout hasn't elapsed, .setTimeout
                                    else if (iAttempts < oOptions.retries) {
                                        setTimeout(polling, oOptions.wait(iAttempts));
                                    }
                                    //# Else we've failed and are over our iAttempts, so .call our .callback (if any) indicating !bSuccess
                                    else {
                                        core.type.fn.call(oOptions.callback, oOptions.context, [false, iAttempts, vReturnVal]);
                                    }
                                }();
                            };
                        } //# fn.poll

                        //# Exponential back-off (i.e. intervals of 100, 200, 400, 800, 1600...)
                        poll.expBackoff = function (iBaseInterval) {
                            var iAttempts = 1;

                            //# Force the iBaseInterval into an .int then return the exponential backoff .interval function to the caller
                            //#     NOTE: We need to divide the iBaseInterval as we're raising 2 to the power of iAttempts below (e.g. 100 / 2 * 2^1 = 100).
                            iBaseInterval = (core.type.int.mk(iBaseInterval, 100) / 2);
                            return function (/*iAttempts*/) {
                                return (iBaseInterval * Math.pow(2, iAttempts++));
                            };
                        }; //# fn.poll.expBackoff

                        return poll;
                    }() //# fn.poll
                };
            }() //# core.type.fn.*
        };
    }); //# core.type.*


    /** ################################################################################################
     * @namespace core.io
     * @desc Input/Output-based functionality.
    ################################################################################################# */
    core.io = {
        /*
        ####################################################################################################
        Class: core.io.console
        User reporting logic.
        Requires:
        <core.resolve>,
        <core.type.fn.call>
        ####################################################################################################
        */
        console: function () {
            function doCall(sMethod, _a) {
                if (core.config.ish().debug) {
                    core.type.fn.call(core.resolve(_root, ["console", sMethod]), _null, _a);
                }
            } //# doCall

            return {
                log: function (/*arguments*/) {
                    doCall("log", arguments);
                }, //# io.console.log

                warn: function (/*arguments*/) {
                    doCall("warn", arguments);
                }, //# io.console.warn

                error: function (/*arguments*/) {
                    doCall("error", arguments);
                }, //# io.console.err
            };
        }(), //# core.io.console


        /*
        ####################################################################################################
        Class: core.io.event
        Event logic.
        Requires:
        <core.extend>, <core.resolve>,
        <core.type.arr.is>, <core.type.fn.is>,
        <core.type.fn.call>, <core.type.arr.rm>, <core.type.obj.ownKeys>
        ####################################################################################################
        */
        event: function () {
            var oEvent, fnDocReady,
                oData = {}
            ;

            //#
            function unwatch(sEvent, fnCallback) {
                return core.type.arr.rm(oData[sEvent], fnCallback);
            } //# unwatch

            //#
            function fire(sEvent, a_vArguments, fnCallback) {
                var i,
                    a_fnEvents = oData[sEvent],
                    bReturnVal = core.type.arr.is(a_fnEvents, true)
                ;

                //# If the passed sEvent is a .registered event
                if (!bReturnVal) {
                    a_fnEvents = oData[sEvent] = [];
                }

                //# Set the .last arguments for this sEvent
                //#     NOTE: We do this here so if a .watch is called after this sEvent has .fired, it can be instantly called with the .last arguments lists
                a_fnEvents.last = a_vArguments;
                a_fnEvents.callback = fnCallback;

                //# Traverse the a_fnEvents, throwing each into doCallback while adding its returned integer to our i(terator)
                //#     NOTE: doCallback returns -1 if we are to unwatch the current a_fnEvents which in turn removes it from the array
                for (i = 0; i < a_fnEvents.length; i++) {
                    i += doCallback(sEvent, a_fnEvents[i], a_vArguments);
                }

                //# Set the .fired property on the array to true
                //#     NOTE: We do this after the for loop so that doCallback'd a_fnEvents can know if this is the first invocation or nots
                a_fnEvents.fired = true;

                //#
                core.type.fn.call(fnCallback, _undefined, a_vArguments);

                return bReturnVal;
            } //# fire

            //#
            function doCallback(sEvent, fnCallback, a_vArguments) {
                var iReturnVal = 0;

                //#
                if (unwatch === core.type.fn.call(fnCallback, _undefined, a_vArguments)) {
                    unwatch(sEvent, fnCallback);
                    iReturnVal--;
                }

                return iReturnVal;
            } //# doCallback

            //#
            oEvent = core.extend(fire, {
                fire: fire,         //# (sEvent, a_vArguments, fnCallback)
                unwatch: unwatch,   //# (sEvent, fnCallback)

                //#
                registered: function () {
                    return core.type.obj.ownKeys(oData);
                }, //# registered

                //#
                fired: function (sEvent) {
                    return (core.resolve(oData, [sEvent, "fired"]) === true);
                }, //# fired

                //#
                watch: function (sEvent, fnCallback) {
                    var bReturnVal = core.type.fn.is(fnCallback);

                    //#
                    if (fnCallback) {
                        (oData[sEvent] = oData[sEvent] || [])
                            .push(fnCallback)
                        ;

                        //# If the sEvent has already been .fired prior to this .watch, .doCallback now
                        if (oData[sEvent].fired) {
                            doCallback(sEvent, fnCallback, oData[sEvent].last);
                            core.type.fn.call(oData[sEvent].callback, _undefined, oData[sEvent].last);
                        }
                    }

                    return bReturnVal;
                } //# watch
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
                    (_document.attachEvent ?
                        _document.attachEvent("onreadystatechange", function () {
                            if (_document.readyState === "complete") {
                                fnDocReady();
                            }
                        }) :
                        _root.attachEvent("onload", fnDocReady)
                    );
                }
                //# </IE6thru8Support>
            }

            return oEvent;
        }() //# core.io.event
    }; //# core.io


    /** ################################################################################################
     * @class core.require
     * @classdesc Collection of require external JS-based functionality.
     * @requires core.extend
     * @requires core.type.arr.is, core.type.fn.is, core.type.str.is, core.type.obj.is
     * @requires core.type.obj.mk, core.type.fn.mk
     * @requires core.type.fn.call, core.io.event.fire
    ################################################################################################# */
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
                function errorFactory(sInterface) {
                    return function (/*vUrls, vOptions*/) {
                        core.io.console.error("ish.require." + sInterface + " is not available on the serverside.");
                    };
                } //# errorFactory


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
                        scripts: errorFactory("scripts"),
                        links: errorFactory("scripts"),
                        css: errorFactory("scripts")
                    }
                ); //# fnRequire
            }();
        }
        //# Else we are running in the browser
        else {
            //# .extend the additional clientside-only options into oRequireOptions
            //#     NOTE: Only .callback and .onError are used bServerside
            core.extend(oRequireOptions, {
                //onAppend: function (_dom, sUrl) {},
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
                            !function (sUrl) {
                                fnProcessor(
                                    sUrl,
                                    oOptions,
                                    function /*fnEventHandler*/(_dom, bAlreadyLoaded) {
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
                                            iTimeout = setTimeout(function () { oReturnVal.onError(true); }, oOptions.waitSeconds * 1000);
                                        }

                                        return oReturnVal;
                                    } //# fnEventHandler
                                );
                            }(a_sUrls[i]);
                        }
                    }
                    //# Else the passed a_sUrls is empty, so .call the passed .callback now
                    else {
                        core.type.fn.call(oOptions.callback, _null, [a_oProcessedUrls, bAllLoaded]);
                    }
                } //# processUrls


                return core.extend(
                    function (vUrls, vOptions) {
                        var i,
                            a_oProcessedUrls = core.type.arr.mk(vUrls, [vUrls]),    //# Borrow the use of a_oProcessedUrls for the array-ified vUrls
                            oOptions = processOptions(vOptions),
                            fnCallback = oOptions.callback,
                            bAllLoaded = true,
                            a_sScripts = [],
                            a_sCSS = [],
                            a_sLinks = []
                        ;

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
                        //#
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
                            processUrls(
                                vUrls,
                                processOptions(vOptions),
                                function /*fnProcessor*/(sUrl, oOptions, fnEventHandler) {
                                    var sSrc = oOptions.baseUrl + sUrl + oOptions.urlArgs,
                                        _script = _document_querySelector("script[src='" + sSrc + "']")
                                    ;

                                    //# If there was a _script already, call .onLoad on the fnEventHandler for the _script
                                    //#     NOTE: Technically the .onLoad call below is unnecessary as fnEventHandler has already called it and reset it to .fn.noop
                                    if (core.type.dom.is(_script)) {
                                        fnEventHandler(_script, true)/*.onLoad()*/;
                                    }
                                    //# Else there wasn't a _script already, so build it
                                    else {
                                        _script = _document.createElement('script');
                                        fnEventHandler(_script /*, false*/);

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

                        //#
                        links: function (vUrls, vOptions) {
                            //# Pass the call off to .processUrls, defaulting and .process(ing the v)Options as we go
                            processUrls(
                                vUrls,
                                core.extend({
                                    rel: "",
                                    type: "",   //# SEE: https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
                                    media: ""   //# SEE: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
                                }, processOptions(vOptions)),
                                function /*fnProcessor*/(sUrl, oOptions, fnEventHandler) {
                                    var oHandler,
                                        sHref = oOptions.baseUrl + sUrl + oOptions.urlArgs,
                                        _link = _document_querySelector("link[href='" + sHref + "']")
                                    ;

                                    //# If there was a _link already, call .onLoad on the fnEventHandler for the _link
                                    //#     NOTE: Technically the .onLoad call below is unnecessary as fnEventHandler has already called it and reset it to .fn.noop
                                    if (core.type.dom.is(_link)) {
                                        fnEventHandler(_link, true)/*.onLoad()*/;
                                    }
                                    //# If there wasn't a _link already, build it and collect our oHandler
                                    else {
                                        _link = _document.createElement('link');
                                        oHandler = fnEventHandler(_link /*, false*/);

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

                        //#
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

        /** ################################################################################################
         * @function ish.config.require
         * @desc Merges the content of the passed options into the underlying configuration, overriding any original values.
         * @param {object} oOptions - object representing the updated configuration values.
         * @returns {object} - object representing the configuration values.
        ################################################################################################# */
        core.config.require = core.config(oRequireOptions);

        //# Return the full core.require interface
        return core.extend(fnRequire, {
            //# Allows dynamically defined "bundles" at runtime, allowing us to load scripts in the required order
            modules: function (a_vModuleUrls, vOptions) {
                var i = 0,
                    oOptions = processOptions(vOptions),
                    fnCallback = oOptions.callback,
                    bAllLoaded = true,
                    a_oProcessedModules = []
                ;

                //# Call .require to load the current a_vModuleUrls
                function doLoad() {
                    core.require(a_vModuleUrls[i++], oOptions);
                } //# doLoad

                //# Call our original fnCallback (if any) with the collected a_oProcessedModules
                function loaded() {
                    core.type.fn.call(fnCallback, _null, [a_oProcessedModules, bAllLoaded]);
                } //# loaded


                //#
                oOptions.callback = function (a_oProcessedUrls, bEntryAllLoaded) {
                    //# Flip bAllLoaded if bEntryAllLoaded failed and .push the a_oProcessedModules in
                    bAllLoaded = (bAllLoaded && bEntryAllLoaded);
                    a_oProcessedModules.push({
                        module: a_oProcessedUrls,
                        loaded: bEntryAllLoaded
                    });

                    //# Recurse if we have bAllLoaded til now and still have a_vModuleUrls to process, else call loaded
                    (bAllLoaded && i < a_vModuleUrls.length ? doLoad : loaded)();
                };

                //# If the caller passed in valid a_vModuleUrls, kick off .doLoad, else call .loaded to return a null result to the .callback
                (core.type.arr.is(a_vModuleUrls, true) ? doLoad : loaded)();
            } //# modules
        });
    }();


    /** ################################################################################################
     * @namespace core.lib
     * @desc Stub-object for Library-based functionality.
    ################################################################################################# */
    core.lib = oInterfaces.pub(); //# core.lib


    /** ################################################################################################
     * @namespace core.app
     * @desc Stub-object for Application-based functionality.
    ################################################################################################# */
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
            //# If we have access to module.exports, return our core reference
            if (typeof module !== 'undefined' && this.module !== module && module.exports) {
                module.exports = core;
            }

            //# Set our sTarget in the root
            //#     NOTE: this === `window` in the browser (which is `undefined` per above) and `global` on the server.
            //this[core.config.ish().target] = core;
        };
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        !function () {
            var _head = _document.head,                                                     //# code-golf
                //_body = _document.body,                                                     //# code-golf
                _document_querySelector = _document.querySelector.bind(_document)           //# code-golf
                //_document_querySelectorAll = _document.querySelectorAll.bind(_document),    //# code-golf
            ;

            //##################################################################################################
            //# Procedural code
            //# Requires:
            //# <core.extend>, <core.resolve>,
            //# <core.type.obj.mk>
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
                            core.io.net.get(sTemp, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                                core.extend(oOptions, bSuccess ? oResponse.data : _null);
                                process(_script, bSuccess);
                            });
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


            /*
            About:
            Based on code from: stackoverflow.com/a/42149818/235704
            */
            core.type.str.is.selector = function isSelector() {
                var _dummy = _document.createElement('br');

                return function (sSelector) {
                    var bReturnVal = false;

                    //# Attempt to .querySelector under the _dummy BR using the sSelector, with a thrown error indicating a non-compliant sSelector
                    try {
                        _dummy.querySelector(sSelector);
                        bReturnVal = true;
                    } catch (e) {/*oTypeIsIsh.public.expectedErrorHandler(e);*/}

                    return bReturnVal;
                };
            }(); //# core.type.selector


            //#
            core.type.dom = function () {
                var a_oWrapMap = {
                    _:      [1, "<div>", "</div>"],
                    option: [1, "<select multiple='multiple'>", "</select>"],
                    legend: [1, "<fieldset>", "</fieldset>"],
                    area:   [1, "<map>", "</map>"],
                    param:  [1, "<object>", "</object>"],
                    thead:  [1, "<table>", "</table>"],
                    tr:     [2, "<table><tbody>", "</tbody></table>"],
                    col:    [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                    td:     [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                    body:   [0, "", ""]
                };
                a_oWrapMap.optgroup = a_oWrapMap.option;
                a_oWrapMap.th = a_oWrapMap.td;
                a_oWrapMap.tbody = a_oWrapMap.tfoot = a_oWrapMap.colgroup = a_oWrapMap.caption = a_oWrapMap.thead;

                return {
                    /*
                    Function: is
                    Determines if the passed value is a DOM reference.
                    Parameters:
                    x - The variant to interrogate.
                    bAllowSelector - Boolean value representing if CSS selectors that successfully resolve to DOM elements are to be included in the test.
                    Returns:
                    Boolean value representing if the value is a DOM reference.
                    */
                    is: function isDom(x, vOptions) {
                        vOptions = core.type.obj.mk(vOptions, { allowSelector: !!vOptions });

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

                    /*
                    Function: mk
                    Safely parses the passed value into a DOM element.
                    Parameters:
                    x - The variant to interrogate. Can be a CSS Selector (used by document.querySelector), jQuery reference (x[0] will be returned), HTML string defining a single root element or DOM element.
                    _default - The default DOM element to return if casting fails.
                    Returns:
                    DOM element represented by the passed value, or _default if interrogation failed.
                    */
                    mk: function (x, _default) {
                        var _div = _document.createElement("div"),
                            _returnVal = (arguments.length > 1 ? _default : _div)
                        ;

                        //# If the passed x .is .str, .trim it
                        if (core.type.str.is(x, true)) {
                            x = x.trim();

                            //# If the passed x .is a .selector, try and collect it
                            if (core.type.str.is.selector(x)) {
                                _returnVal = _document_querySelector(x) || _document.getElementById(x) || _returnVal;
                            }
                            //# Else try to .parse the passed .is .str as HTML
                            //#     NOTE: We resolve and _returnVal the first element only, hence the .resolve
                            //#     NOTE: Since .parse will return based on a passed _default or not, we .run .parse with our own arguments to ensure proper behavior
                            else {
                                _returnVal = core.resolve(core.type.fn.run(core.type.dom.parse, arguments), "0") || _returnVal;
                            }
                        }
                        //# Else if the passed x .is .dom, set our _returnVal to it
                        else if (core.type.dom.is(x)) {
                            _returnVal = x;
                        }
                        //# Else if the first index of the passed x .is .dom, set our _returnVal to it
                        //#     NOTE: This is pretty much to support jQuery objects
                        //# TODO: is this a good idea?
                        else if (x && x[0] && core.type.dom.is(x[0])) {
                            _returnVal = x[0];
                        }

                        return _returnVal;
                    }, //# dom.mk

                    /*
                    Function: parse
                    Safely parses the passed value into a DOM element.
                    Parameters:
                    sHTML -
                    bFirstElementOnly -
                    Returns:
                    DOM element represented by the passed value, or _default if interrogation failed.
                    */
                    //#     Based on: http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element
                    parse: function (sHTML, _default) {
                        var a__returnVal, _dom, a_vMap, sTag, bBodyTag, i;

                        //# .trim any empty leading/trailing #text nodes then safely determine the first sTag (if any) within the passed sHTML along with if it's a bBodyTag
                        //#     NOTE: /g(lobal) only returns the first <tag> for whatever reason(!?) but as that's the desired effect, it's all good.
                        sHTML = core.type.str.mk(sHTML).trim();
                        sTag = core.type.str.mk(
                            (/<([^\/!]\w*)[\s\S]*?>/g.exec(sHTML) || [0,''])[1]
                        ).toLowerCase();
                        bBodyTag = (sTag === 'body');

                        //# Determine the a_vMap entry then construct our _dom including its .innerHTML
                        //#     NOTE: While we can and do parse multiple elements/nodes, we only look at the first sTag to determine the a_vMap
                        a_vMap = a_oWrapMap[sTag] || a_oWrapMap._;
                        //var _dom = (bBodyTag ? _document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', _null) : _null);
                        _dom = _document.createElement(bBodyTag ? 'html' : 'div');
                        _dom.innerHTML = a_vMap[1] + sHTML + a_vMap[2];

                        //# Set the i(ndex) and traverse down the a_vMap'd elements to collect the parsed sHTML
                        //#     NOTE: This is done to peal off the required wrapping a_oWrapMap elements from the .innerHTML above
                        i = a_vMap[0];
                        while (i-- /* > 0*/) {
                            _dom = _dom.children[0];
                        }

                        //# .mk .arr'd .childNodes into our a__returnVal
                        a__returnVal = core.type.arr.mk(_dom.childNodes);
                        a__returnVal = (
                            core.type.arr.is(a__returnVal, true) ?
                            a__returnVal : (
                                arguments.length > 1 ? [_default] : _undefined
                            )
                        );

                        return a__returnVal;
                    } //# dom.parse
                };
            }(); //# core.type.dom


            /** ################################################################################################
            * @namespace core.ui
            * @desc Stub-object for User Interface-based functionality.
            ################################################################################################# */
            core.ui = {
                //# Based on: https://stackoverflow.com/a/36929383/235704
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
                                location.hash = "#" + vElement;
                            }
                        } //# doScroll
                    ;

                    //#
                    if (bReturnVal) {
                        doScroll();
                    }

                    return bReturnVal;
                },

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
        }();
    }


    //########


    //# Procedural code
    oPrivate.init();
}(/*global, module, require, process, __dirname*/); //# NodeJS-specific features that will be undefined in the browser; see: https://nodejs.org/docs/latest/api/globals.html + https://nodejs.org/docs/latest/api/modules.html#modules_dirname
