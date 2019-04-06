/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @version 0.10.2019-03-06
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
################################################################################################# */
!function () {
    'use strict';

    var bServerside = (typeof window === 'undefined'), // this.window !== this      //# Are we running under nodeJS (or possibly have been required as a CommonJS module), SEE: https://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js
        _root = (bServerside ? global : window),                                    //# code-golf
        _document = (bServerside ? {} : document),                                  //# code-golf
        _undefined /*= undefined*/,                                                 //# code-golf
        _null = null,                                                               //# code-golf
        _Object_prototype_toString = Object.prototype.toString,                     //# code-golf
        _Date_now = Date.now,                                                       //# code-golf
        oPrivate = {},
        oTypeIsh = { //# Set the .ver and .target under .type.ish (done here so it's at the top of the file for easy editing) then stub out the .app and .lib with a new .pub oInterfaces for each
            //is: function () {},
            //import: function () {},
            ver: '0.11.2019-03-25',
            onServer: bServerside,
            options: {
                //script: _undefined,
                target: "ish",
                plugins: {
                    //import: [],
                    //path: "", // _document.currentScript.src,
                    //cache: false,
                    //importedBy: ""
                }
            },
            expectedErrorHandler: function expectedErrorHandler(/*e*/) {}
        },
        oInterfaces = {
            pub: function () {
                return {
                    data: {},
                    options: {},
                    ui: {}
                };
            }
        }, //# oInterfaces
        core = {
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
        /*
        */
        function type(x, a_vOrder) {
            var fnCurrent, i,
                fnReturnVal /* = _undefined */
            ;

            //# Ensure the passed a_vOrder is an array, defaulting to our .typeOrder if none was passed
            a_vOrder = core.type.arr.mk(a_vOrder, core.type.options.typeOrder);

            //# If we have a a_vOrder to traverse, do so now calculating each fnCurrent as we go
            //#     NOTE: We avoid using core.type.fn.* below to keep the code requirements to just that which is defined herein
            if (core.type.arr.is(a_vOrder, true)) {
                for (i = 0; i < a_vOrder.length; i++) {
                    //# Try to .resolve the current a_vOrder from core.type.*, else .mk it a .fn (defaulting to .noop on failure)
                    //#     NOTE: We avoid using core.resolve below to keep the code requirements to just that which is defined herein
                    //fnCurrent = core.resolve(core.type, [a_vOrder[i], 'is']) || core.type.fn.mk(a_vOrder[i]);
                    fnCurrent = (core.type[a_vOrder[i]] || {}).is || core.type.fn.mk(a_vOrder[i]);

                    //# If the passed x returns true from the fnCurrent (indicating that it's of that type), reset our fnReturnVal and fall form the loop
                    //#     NOTE: If fnCurrent is set to .noop above, it return nothing/undefined which is interperted as false below
                    if (fnCurrent(x)) {
                        fnReturnVal = fnCurrent;
                        break;
                    }
                }
            }

            return fnReturnVal;
        } //# core.type

        //#
        type.options = {
            typeOrder: [
                'bool', 'int', 'float', /*'num',*/ 'date',
                /*'selector',*/ 'json', 'str',
                'fn', 'dom', 'arr', 'list', 'obj',
                'symbol'
            ]
        }; //# core.type.options

        /*
        Function: is
        Determines if the passed value is an instance of the passed type.
        Parameters:
        o - The varient to interrogate.
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

            return function (x) {
                var type = typeof x;
                return type == 'function' ?
                    reNative.test(fnToString.call(x)) : // Use `Function#toString` to bypass x's own `toString` method and avoid being faked out.
                    (x && type == 'object' && reHostCtor.test(toString.call(x))) || // Fallback to a host object check because some environments will represent things like typed arrays as DOM methods which may not conform to the normal native pattern.
                    false;
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
        Function: range
        Determines if the passed value is within the passed range.
        Parameters:
        vValue - The varient to interrogate, where the `length` property used for the numeric comparison (if present).
        vType - Function or String denoting the type testing logic which returns `truthy` if ``vValue` is of `vType`.
        (Optional) nMin - Numeric value representing the minimum allowed value (can be passed as `undefined` for no defined minimum).
        (Optional) nMax - Numeric value representing the maximum allowed value (can be passed as `undefined` for no defined maximum).
        Returns:
        Boolean value representing if the passed value is within the passed range or `undefined` if the vType cannot be resolved to a function.
        */
        type.range = function (vValue, vType, nMin, nMax) {
            var fnTest = (core.type.fn.is(vType) ? vType : core.resolve(core.type, [vType, "is"])),
                bReturnVal = (core.type.fn.is(fnTest) ? core.type.fn.call(fnTest, null, [vValue]) : undefined)
            ;

            //# If we were able to successfully verify vValue with the fnTest, reset vValue to the numeric value to interrogate
            if (bReturnVal) {
                vValue = (core.type.num.is(core.resolve(vValue, "length")) ? vValue.length : vValue);

                //# Reset our bReturnVal to the result of the range comparison
                bReturnVal = (
                    (nMin === undefined || vValue >= nMin) &&
                    (nMax === undefined || vValue <= nMax)
                );
            }

            return bReturnVal;
        };

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
            is: function isBool(b) {
                //return (b === _true || b === _false);
                return (_Object_prototype_toString.call(b) === '[object Boolean]');
            }, //# bool.is

            /*
            Function: mk
            Safely forces the passed varient into a boolean value.
            Parameters:
            b - The varient to interrogate.
            bDefaultVal - The default value to return if casting fails.
            Returns:
            Boolean value representing the truthiness of the passed varient.
            */
            mk: function (b, bDefaultVal) {
                var bReturnVal = (b ? true : false);

                //#
                if (arguments.length > 1) {
                    if (core.type.bool.is(b)) {
                        bReturnVal = b;
                    }
                    else if (core.type.str.is(b)) {
                        b = b.trim().toLowerCase();
                        bReturnVal = (
                            b === 'true' ? true : (
                                b === 'false' ? false : bDefaultVal
                            )
                        );
                    }
                    else {
                        bReturnVal = bDefaultVal;
                    }
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
                return (core.type.num.is(x) && fX % 1 === 0);
            }, //# int.is

            /*
            Function: mk
            Safely forces the passed value into an integer (includes implicit casting per the Javascript rules, see about section).
            Parameters:
            i - The varient to interrogate.
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
                return (core.type.num.is(x) && fX % 1 !== 0);
            }, //# float.is

            /*
            Function: mk
            Safely forces the passed value into a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            f - The varient to interrogate.
            vDefault - The default value to return if casting fails.
            Returns:
            Float representing the passed value.
            */
            mk: function (f, vDefault) {
                var fReturnVal = parseFloat(f, 10);

                return (!isNaN(fReturnVal) ?
                    fReturnVal :
                    (arguments.length > 1 ? vDefault : 0)
                );
            } //# float.mk
        }; //# core.type.float

        //#     NOTE: No .mk
        type.num = {
            /*
            Function: is
            Determines if the passed value is a numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            x - The numeric value to interrogate.
            Returns:
            Boolean value representing if the value is a numeric value.
            */
            is: function isNum(x) {
                return (
                    /^[-0-9]?[0-9]*(\.[0-9]{1,})?$/.test(x) &&
                    !isNaN(parseFloat(x)) &&
                    isFinite(x)
                );
            } //# num.is

            //mk:
        }; //# core.type.num

        type.date = {
            /*
            Function: is
            Determines if the passed value is a date.
            Parameters:
            x - The date to interrogate.
            Returns:
            Boolean value representing if the value is a date.
            */
            is: function isDate(x) {
                var d = new Date(x);
                //# TODO: fix! bFuzzy?
                return (x && _Object_prototype_toString.call(d) === "[object Date]" && !isNaN(d.valueOf()));
            }, //# date.is

            /*
            Function: mk
            Safely forces the passed value into a date.
            Parameters:
            x - The varient to interrogate.
            dDefault - The default value to return if casting fails.
            Returns:
            Date representing the passed value.
            */
            mk: function (x, dDefault) {
                return (core.type.date.is(x) ?
                    new Date(x) :
                    (arguments.length > 1 ? dDefault : new Date())
                );
            } //# date.mk
        }; //# core.type.date

        type.json = {
            /*
            Function: is
            Determines if the passed value is a valid JSON string.
            Parameters:
            s - The varient to interrogate.
            Returns:
            Boolean value representing if the passed value is a valid JSON string.
            */
            is: function isJson(s) {
                try {
                    JSON.parse(s);
                    return true;
                } catch (e) {
                    return false;
                }
            }, //# json.is

            /*
            Function: mk
            Safely parses the passed value as a JSON string into an object or stringify's the passed object into a JSON string.
            Parameters:
            v - The varient to interrogate.
            vDefault - The default value to return if casting fails.
            Returns:
            Object containing the parsed JSON data, string containing the stringified object, or vDefault if parsing failed.
            */
            mk: function (v, vDefault) {
                var vJson = (arguments.length > 1 ? vDefault : {});

                //# If the passed v(arient) .is .str, lets .parse it into an object
                if (core.type.str.is(v, true)) {
                    try {
                        vJson = JSON.parse(v);
                    } catch (e) { oTypeIsh.expectedErrorHandler(e); }
                }
                //# Else if the passed v(arient) .is .boj, lets .stringify it into a string
                else if (core.type.obj.is(v)) {
                    try {
                        vJson = JSON.stringify(v);
                    } catch (e) { oTypeIsh.expectedErrorHandler(e); }
                }

                return vJson;
            }, //# json.mk
        }; //# core.type.json

        type.str = {
            /*
            Function: is
            Determines if the passed value is a string.
            Parameters:
            s - The string to interrogate.
            bDisallowNullString - Boolean value indicating if nullstrings are to be disallowed (e.g. "").
            bTrimWhitespace - Boolean value indicating if leading and trailing whitespace is to be trimmed prior to integration.
            Returns:
            Boolean value representing if the value is a string.
            */
            is: function isStr(s, bDisallowNullString, bTrimWhitespace) {
                return (
                    (typeof s === 'string' || s instanceof String) &&
                    (!bDisallowNullString || s !== '') &&
                    (!bTrimWhitespace || core.type.str.mk(s).trim() !== '')
                );
            }, //# str.is

            /*
            Function: mk
            Safely forces the passed value into a string.
            Parameters:
            x - The varient to interrogate.
            sDefault - The default value to return if casting fails.
            Returns:
            String representing the passed value.
            */
            mk: function (s, sDefault) {
                var sS = s + "";

                return (s && sS ?
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
            f - The varient to interrogate.
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
            a - The varient to interrogate.
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
            a - The varient to interrogate.
            a_vDefault - The default value to return if casting fails.
            Returns:
            Array representing the updated array reference.
            */
            mk: function (a, a_vDefault) {
                //# Preconvert a list reference into an array
                a = (core.type.list.is(a) ? Array.prototype.slice.call(a) : a);

                return (core.type.arr.is(a) ?
                    a :
                    (arguments.length > 1 ? a_vDefault : [])
                );
            } //# arr.mk
        }; //# core.type.arr

        //#     NOTE: No .mk
        type.list = {
            /*
            Function: is
            Determines if the passed value is a list type (e.g. HTMLCollection|NodeList|NamedNodeMap|Arguments|Object with Object to support <IE9).
            Parameters:
            n - The varient to interrogate.
            bIncludeObject - Boolean value representing if Objects are to be included in the test (to support <IE9).
            Returns:
            Boolean value representing if the value is a list type.
            */
            is: function isList(n, bIncludeObject) {
                var reTest = (bIncludeObject ?
                    /^\[object (HTMLCollection|NodeList|NamedNodeMap|Arguments|Object)\]$/ :
                    /^\[object (HTMLCollection|NodeList|NamedNodeMap|Arguments)\]$/
                );

                return (
                    core.type.obj.is(n) &&
                    core.type.num.is(n.length) &&
                    reTest.test(Object.prototype.toString.call(n))
                );
            } //# list.is

            //mk:
        }; //# core.type.list

        //#     NOTE: No .mk
        type.coll = {
            is: function (x, bDisallow0Length) {
                bDisallow0Length = core.type.bool.mk(bDisallow0Length, false);

                return (
                    type.arr.is(x, bDisallow0Length) ||
                    //type.obj.is(x, bDisallow0Length) ||
                    (type.list.is(x) && (!bDisallow0Length || x.length > 0))
                );
            } //# coll.is

            //mk:
        }, //# core.type.coll

        //#
        type.obj =function () {
            function isObjBase(o, bAllowFn) {
                return !!(o && o === Object(o) && (bAllowFn || !core.type.fn.is(o)));
            }

            return {
                /*
                Function: is
                Determines if the passed value is an object.
                Parameters:
                o - The varient to interrogate.
                vOptions - Varient representing the following optional settings:
                    vOptions === true - Boolean value representing if empty objects are to be ignored.
                    vOptions.nonEmpty - Boolean value representing if empty objects are to be ignored.
                    vOptions.allowFn - Boolean value representing if functions are to be allowed.
                    vOptions.requiredKeys - Array of Strings listing the keys required to be present in the object.
                    vOptions.interface - Object defining the keys and types.
                Returns:
                Boolean value representing if the value is an object.
                */
                is: function isObj(o, vOptions) {
                    var i, fnTest, a_sInterfaceKeys,
                        oSettings = (vOptions && vOptions === Object(vOptions) ? vOptions : {}),
                        a_sRequiredKeys = oSettings.requiredKeys,
                        oInterface = oSettings.interface,
                        bDisallowEmptyObject = (vOptions === true || !!oSettings.nonEmpty),
                        bReturnVal = isObjBase(o, !!oSettings.allowFn)
                    ;

                    //# If the passed o(bject) is an Object
                    if (bReturnVal) {
                        //# Reset our bReturnVal based on bDisallowEmptyObject
                        bReturnVal = (!bDisallowEmptyObject || Object.getOwnPropertyNames(o).length !== 0);

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
                        if (bReturnVal && isObjBase(oInterface)) {
                            a_sInterfaceKeys = Object.getOwnPropertyNames(oInterface);

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
                o - The varient to interrogate.
                sPath - String representing the path to the property.
                (Optional) vValue - Varient representing the value to set the referenced property to.
                Returns:
                Object representing the updated object reference.
                */
                mk: function (o, oDefault) {
                    var bFnIsObj = (core.type.fn.is(o) && core.type.obj.is(o, { nonEmpty: true, allowFn: true }));

                    return (bFnIsObj || core.type.obj.is(o) ?
                        o :
                        (arguments.length > 1 ? oDefault : {})
                    );
                }, //# obj.mk
            };
        }(); //# core.type.obj


        type.symbol = function () {
            var oSymbol = {
                is: function isSymbol(x) {
                    return (oSymbol.exists() && typeof x === 'symbol');
                }, //# symbol.is

                exists: function () {
                    return core.type.fn.is(_root.Symbol);
                } //# symbol.exists
            };

            //# If we have a Symbol type, add in the .mk function
            //if (core.type.fn.is(_root.Symbol)) {
                oSymbol.mk = function (x, xDefault) {
                    return (core.type.symbol.is(x) ?
                        x :
                        (arguments.length === 1 ? _root.Symbol() : xDefault)
                    );
                }; //# symbol.mk
            //}

            return oSymbol;
        }(); //# core.type.symbol

        //####

        type.ish = oTypeIsh;
        oTypeIsh.is = function isIsh(o) {
            return (arguments.length === 0 || o === core);
        }; //# core.type.ish.is


        return type;
    }(); //# core.type.*.is|mk


    /** ################################################################################################
     * @function resolve
     * @desc Safely accesses (or optionally creates) an object structure, allowing access to deep properties without the need to ensure the object structure exists.
     * @param {boolean} [bForceCreate] - Indicates if the path is to be forcibly created. `false` creates the path if it does not already exist, `true` overwrites non-object parent path segments with objects (see About).
     * @param {object} oObject - The object to interrogate.
     * @param {string|array[string]} vPath - Varient representing the path to the requested property (array or period-delimited string, e.g. "parent.child.array.0").
     * @param {varient} [vValue] - Varient representing the value to set the referenced property to (used only when creating the path).
     * @returns {varient} Varient representing the value at the referenced path, returning undefined if the path does not exist.
     * @example <caption>When forcing the creation of an object structure, data can be lost if an existing non-object property is used as a parent, e.g.:</caption>
     * var neek = { nick: true };
     * var deepProp = ish.resolve(true, neek, "nick.campbell");
     * // This will overwrite the boolean property `nick` with an object reference containing the property `campbell`.
     * @requires core.type.obj.is, core.type.str.is, core.type.arr.is
    ################################################################################################# */
    core.resolve = function (/*[bForceCreate], oObject, vPath|a_sPath, [vValue]*/) {
        var vReturnVal, vValue, vPath, oObject, a_sPath, i, bCurrentIsObj, bHaveValue, bForceCreate,
            bPathExists = true,
            oIsObjOptions = { allowFn: true },
            a = arguments
        ;

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

        //# If the passed oObject .is .obj and vPath .is .str or .is .arr, populate our a_sPath
        if (vReturnVal && (core.type.str.is(vPath) || (core.type.arr.is(vPath, true) && core.type.str.is(vPath[0])))) {
            a_sPath = (core.type.arr.is(vPath) ? vPath : vPath.split("."));

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
                    }
                    //# Else the current vPath segment doesn't exist and we're not supposed to bForceCreate it, so reset our vReturnVal to undefined, flip bPathExists and fall from the loop
                    else {
                        vReturnVal = _undefined;
                        bPathExists = false;
                        break;
                    }
                }
                //# Else if we are bForce(ing)Create or we bHaveValue and this is the last index
                else if (bForceCreate || (bHaveValue && i === a_sPath.length - 1)) {
                    //# Set a new object reference in vReturnVal then set it into oObject's last object reference
                    //#     NOTE: We enter the outer loop knowing the initial vReturnVal bCurrentIsObj, so there is no need to worry about a [0 - 1] index below as we will never enter this if on the first loop
                    oObject[a_sPath[i]] = vReturnVal = {};
                }
                //# Else if we're not on the final vPath segment
                else if (i < a_sPath.length - 1) {
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

        return vReturnVal;
    }; //# core.resolve


    /** ################################################################################################
     * @function extend
     * @desc Merges the content of subsequent objects into the first one, overriding its original values.
     * @param {boolean|integer} [vDeepCopy] - Indictes if a deep copy is to occur. `true` performs a deep copy, a positive integer indicates the max depth to perform a deep copy to, all other values perform a shallow copy. Default value: `false`.
     * @param {object} oTarget - Object to recieve properties.
     * @param {...object} oSource - Object(s) who's properties will be copied into the target.
     * @returns {object} Object referencing the passed oTarget.
     * @example <caption>Right-most source object wins:</caption>
     * // `oResult.i` will equal `2`.
     * var oResult = core.data.extend({}, { i: 1 }, { i: 2 });
     * // Heavily refactored code from http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
     * @requires core.type.bool.is, core.type.num.is, core.type.obj.is, core.type.arr.is, ~core.type.dom.is
     * @requires core.type.int.mk
    ################################################################################################# */
    core.extend = function (/*[vDeepCopy], oTarget, oSource, oSource2...*/) {
        var oTarget, oCurrent, sKey, iDepth, i, j,
            fnIsDom = core.type.fn.mk(core.resolve(core, "type.dom.is")),
            a = arguments,
            bDeepCopy = core.type.bool.is(a[0])
        ;

        //# If the first argument .is .bool or .is .num, setup the local vars accordingly
        if (bDeepCopy || core.type.num.is(a[0])) {
            iDepth = (bDeepCopy ? -1 : core.type.int.mk(a[0]));
            oTarget = a[1];
            i = 2;
        }
        //# Else the first argument is our oTarget, so setup the local vars accordingly
        else {
            iDepth = 0; //# e.g. don't bDeepCopy
            oTarget = a[0];
            i = 1;
        }

        //# Ensure our oTarget is an object
        //oTarget = (core.type.obj.is(oTarget, { allowFn: true }) ? oTarget : {});
        oTarget = (core.type.obj.is(oTarget, { allowFn: true }) ? oTarget : Object(oTarget));

        //# Traverse the passed source objects
        for (/*i = i*/; i < a.length; i++) {
            oCurrent = a[i];

            //# Traverse the sKeys in the oCurrent object
            for (sKey in oCurrent) {
                //# If the oCurrent[sKey] is a native property of oCurrent, set it into our oTarget
                if (Object.prototype.hasOwnProperty.call(oCurrent, sKey)) {
                    //# If the oCurrent[sKey] .is .arr, setup the oTarget's sKey as a new array
                    //#     NOTE: This is necessary as otherwise arrays are copied in as objects so things like oTarget[sKey].push don't work in the .extend'ed objects, so since arrays return true from .is .obj and array's would otherwise be copied as references in the else below, this special case is necessary
                    if (core.type.arr.is(oCurrent[sKey])) {
                        oTarget[sKey] = [];

                        //# Traverse the oCurrent array, .push'ing each value into out oTarget sKey's new array
                        for (j = 0; j < oCurrent[sKey].length; j++) {
                            oTarget[sKey].push(
                                iDepth !== 0 && core.type.obj.is(oCurrent[sKey][j]) ?
                                core.extend(iDepth - 1, {}, oCurrent[sKey][j]) :
                                oCurrent[sKey][j]
                            );
                        }
                    }
                    //# Else if the oCurrent[sKey] .is .fn, treat it as a value (rather than the object it truly is) and overwrite the oTarget[sKey]
                    //#     NOTE: It really isn't proper to treat functions as objects as if there are properties under it to preserve, they likely apply to the overwritten "class" structure rather than having an independently important value.
                    else if (core.type.fn.is(oCurrent[sKey]) || core.type.is.native(oCurrent[sKey]) || fnIsDom(oCurrent[sKey])) {
                        oTarget[sKey] = oCurrent[sKey];
                    }
                    //# Else determine if we need to bDeepCopy the oCurrent[sKey], setting or .extend'ing the oTarget[sKey] accordingly
                    //#     NOTE: If oCurrent[sKey] .is .fn, it does not replace the oTarget[sKey] but any properties it has does
                    //#     NOTE: We use the fnIsDom alias for core.type.dom.is as it's not present bServerSide thanks to no _document
                    else {
                        bDeepCopy = (
                            oTarget[sKey] &&
                            oTarget[sKey] !== oCurrent[sKey] &&
                            core.type.obj.is(oCurrent[sKey])
                        );
                        oTarget[sKey] = (bDeepCopy ?
                            core.extend((iDepth !== 0 ? iDepth - 1 : false), oTarget[sKey], oCurrent[sKey]) :
                            //core.extend(iDepth - 1, oTarget[sKey], oCurrent[sKey]) :
                            oCurrent[sKey]
                        );
                    }
                }
            }
        }

        return oTarget;
    }; //# core.extend


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

            //# .fire our .event now that the oOopData is completly setup
            //core.io.event.fire("ish.oop._setOopEntry", [vTarget, oProtected]);
        } //# setOopEntry

        //# Properly adds a data type to be tracked as part of oOopData
        function addOopDataType(sName, vDefaultValue) {
            var i = oAddedDataTypes.n.indexOf(sName),    //# n(ames)
                bReturnVal = (i === -1 && sName !== "i" && sName !== "p")
            ;

            //# If this is a new sName, .push it into oAddedDataTypes
            //#     NOTE: We don't specificially track i(ndex) or p(rotected) in oAddedDataTypes even though they can be overriden, but it works as designed below even in these circumstances
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
     * @requires core.type.arr.is, core.type.obj.is, core.type.list.is, core.type.fn.is
     * @requires core.type.arr.mk, core.type.obj.mk
     * @requires core.oop.partial
    ################################################################################################# */
    core.oop.partial(core.type, function (/*oProtected*/) {
        //#
        function processObj(vSource, vKeys, bSetToUndefined) {
            var i,
                //bSetToUndefined = ,
                bReturnVal = true
            ;

            function doPrune(oSource, vKeys, bSetToUndefined) {
                var a_sKeys, sKey, i,
                    bRemap = false
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

                    //# If we're supposed to bRemap, do so now
                    if (bRemap && oSource.hasOwnProperty(sKey)) {
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
            } //# doPrune

            //# If the caller passed in an .is .arr vSource, traverse it passing each entry into doPrune as we go
            if (core.type.arr.is(vSource, true)) {
                for (i = 0; i < vSource.length; i++) {
                    doPrune(vSource[i], vKeys, bSetToUndefined);
                }
            }
            //# Else if the caller passed in an .is .obj, pass it off to doPrune
            else if (core.type.obj.is(vSource)) {
                doPrune(vSource, vKeys, bSetToUndefined);
            }
            //# Else the vSource is not a valid value, so flip our bReturnVal
            else {
                bReturnVal = false;
            }

            return bReturnVal;
        } //# processObj


        //# Add .processObj into the oProtected interfaces for core.type
        this.processObj = processObj;

        return {
            is: {
                /*
                Function: val
                Determines if the passed value is set (i.e. !== undefined || null).
                Parameters:
                v - The varient to interrogate.
                Returns:
                Boolean value representing if the value is set.
                */
                val: function (v) {
                    return (v !== _undefined && v !== _null);
                }, //# type.is.val


                /*
                Function: true
                Determines if the passed value is a truth-y value.
                Parameters:
                v - The truth-y value to interrogate.
                Returns:
                Boolean value representing if the value is a truth-y value.
                */
                'true': function (v) {
                    return (v === true ?
                        true :
                        (v + "").trim().toLowerCase() === "true"
                    );
                }, //# type.is.true


                // Primitive Vals - Boolean, Null, Undefined, Number, String, Symbol
                primitive: function (x) {
                    return (
                        x === _null ||
                        x === _undefined ||
                        core.type.bool.is(x) ||
                        core.type.num.is(x) ||
                        core.type.str.is(x /*, false*/) ||
                        core.type.symbol.is(x)
                    );
                } //# type.is.primitive
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

            arr: {
                rm: function (a_vArray, vTargets, vReplacements) {
                    var a_vReplacements, iTargetIndex, i,
                        iTotalReplacements = -1,
                        bHaveReplacements = (arguments.length === 3),
                        a_vTargets = (core.type.arr.is(vTargets) ? vTargets : [vTargets]),
                        bReturnVal = false
                    ;

                    //# If the passed a_vArray .is .arr, set our a_vReplacements and iTotalReplacements if we bHaveReplacements
                    if (core.type.arr.is(a_vArray, true)) {
                        if (bHaveReplacements) {
                            a_vReplacements = (core.type.arr.is(vReplacements) ? vReplacements : [vReplacements]);
                            iTotalReplacements = a_vReplacements.length;
                        }

                        //# Traverse our a_vTargets, determining the iTargetIndex of the current a_vTargets
                        for (i = 0; i < a_vTargets.length; i++) {
                            iTargetIndex = a_vArray.indexOf(a_vTargets[i]);

                            //# If we found the iTargetIndex, flip our bReturnVal
                            if (iTargetIndex > -1) {
                                bReturnVal = true;

                                //# If we bHaveReplacements and enough iTotalReplacements, replace the iTargetIndex with its related a_vReplacements
                                if (bHaveReplacements && i < iTotalReplacements) {
                                    a_vArray[iTargetIndex] = a_vReplacements[i];
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
                    var bReturnVal;

                    //# If the caller passed in an .is .str, reset vKeys to an array
                    if (core.type.str.is(vKeys, true)) {
                        vKeys = [vKeys];
                    }
                    bReturnVal = core.type.arr.is(vKeys, true);

                    //#
                    if (bReturnVal) {
                        bReturnVal = processObj(vSource, vKeys, bSetToUndefined);
                    }

                    return bReturnVal;
                }, //# type.obj.rm

                //# Object.getOwnPropertyNames(oSource) ?
                ownKeys: function(oSource) {
                    var i,
                        a_sReturnVal /* = _undefined */
                    ;

                    //# If the passed oSource .is .obj, collect its .keys into our a_sReturnVal
                    if (core.type.obj.is(oSource)) {
                        a_sReturnVal = Object.keys(oSource);

                        //# Traverse the collected oCource .keys from back to front (so we can .splice them out as we go)
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
                        vReturnVal /* = undefined */
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
             * @requires core.type.list.is, core.type.fn.is, core.type.arr.is
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
                function processOptions(vThis, oOptions, oDefaults, iWait) {
                    //#
                    return core.extend(
                        { context: vThis },
                        oDefaults,
                        oOptions,
                        (iWait !== _undefined && core.type.obj.is(oOptions) ? {
                            wait: core.type.int.mk(oOptions.wait, iWait)
                        } : _null)
                    );
                } //# processOptions


                return {
                    /*
                    Function: convert
                    Converts the passed argument from an arguments instance, array or single variable into an Array fit to pass to fn.apply().
                    vArguments - Varient representing the argument(s) to convert into an array
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
                    vArguments - Varient representing the argument(s) to pass into the passed function
                    vContext - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                    //oOptions - Object representing the desired options:
                    //    oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                    //    oOptions.default - Varient representing the default value to return if an error occurs. Default: `undefined`.
                    Returns:
                    Varient representing the result of the passed function.
                    */ //# TODO: function (fn, vArguments, oOptions)
                    call: function (fn, vContext, vArguments) {
                        var vReturnVal /* = _undefined*/;

                        //#
                        //oOptions = processOptions(this, oOptions, {
                        //    args: _undefined
                        //    default: _undefined
                        //} /*, _undefined*/);
                        //vReturnVal = oOptions.default;

                        //#
                        //if (core.type.fn.is(fn)) {
                        //    vReturnVal = fn.apply(oOptions.context, oOptions.args);
                        //}

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
                                    vReturnVal = fn.apply(vContext || core.resolve(vArguments, "this"), convert(vArguments));
                                    //break;
                                }
                            }
                        }

                        return vReturnVal;
                    }, //# fn.call


                    /*
                    Function: once
                    (Factory) Ensure a function is called only once.
                    Parameters:
                    fn - Function to call once.
                    oOptions - Object representing the desired options:
                        oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.rereturn - Boolean value representing if subsiquent calls should return the first return value (default: true).
                    Returns:
                    Function that returns the Varient representing the result of the passed function.
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
                        var vReturnVal;

                        //#
                        oOptions = processOptions(this, oOptions, {
                            rereturn: true
                        } /*, _undefined*/);

                        return function (/*arguments*/) {
                            if (core.type.fn.is(fn)) {
                                vReturnVal = fn.apply(oOptions.context, convert(arguments));
                                fn = _null;
                            }

                            return (oOptions.rereturn ? vReturnVal : _undefined);
                        };
                    }, //# fn.once


                    /*
                    Function: tryCatch
                    (Factory) Safely calls the passed function, returning the default value if an error occurs during execution.
                    Parameters:
                    fn - Function to call.
                    oOptions - Object representing the desired options:
                        oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.default - Varient representing the default value to return if an error occurs. Default: `undefined`.
                        oOptions.returnObj - Boolean value representing if an Object is to be returned representing the result and error. Default `false`.
                    Returns:
                    Function that returns the Varient representing the result of the passed function.
                    */
                    tryCatch: function (fn, oOptions) {
                        //#  WAS: function (fn, vContext, vArguments, vDefault, bReturnObj)
                        var oReturnVal;

                        //#
                        oOptions = processOptions(this, oOptions, {
                            //default: _undefined,
                            returnObj: false
                        } /*, _undefined*/);
                        oReturnVal = {
                            result: oOptions.default,
                            error: _null
                        };

                        //#
                        return function (/*arguments*/) {
                            try {
                                oReturnVal.result = fn.apply(oOptions.context, convert(arguments));
                            } catch (e) {
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
                        oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.wait - Minimum number of miliseconds between each call (default: 500).
                        oOptions.leading - The throttled function will run as much as possible, without ever going more than once per wait duration. If you’d like to disable the execution on the leading edge, pass {leading: false}.
                        oOptions.trailing - The throttled function will run as much as possible, without ever going more than once per wait duration. If you’d like to disable the execution on the trailing edge, pass {trailing: false}.
                    Returns:
                    Function that returns the Varient representing the result of the passed function.
                    About:
                    Based on http://underscorejs.org/docs/underscore.html
                    Returns a function, that, when invoked, will only be triggered at most once during a given window of time. Normally, the throttled function will run as much as it can, without ever going more than once per wait duration; but if you’d like to disable the execution on the leading edge, pass {leading: false}. To disable execution on the trailing edge, ditto.
                    */
                    throttle: function (fn, oOptions) {
                        //#  WAS: function (fn, iWait, oOptions)
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
                        oOptions = processOptions(this, oOptions, {
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
                        oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.wait - Minimum number of miliseconds between each call (default: 500).
                        oOptions.immediate - Execute the function the first time without waiting.
                    Returns:
                    Function that returns the Varient representing the result of the passed function.
                    About:
                    Usage -
                    >    var myEfficientFn = debounce(function () {
                    >        // All the taxing stuff you do
                    >    }, 250);
                    >    window.addEventListener('resize', myEfficientFn);
                    Based on http://underscorejs.org/docs/underscore.html
                    */
                    debounce: function (fn, oOptions) {
                        //#  WAS: function (fn, iWait, iImmediate)
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
                        oOptions = processOptions(this, oOptions, {
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
                        oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                        oOptions.wait - Minimum number of miliseconds between each poll attempt (default: 500).
                        oOptions.timeout - Maximum number of milliseconds to do the polling (Default: 2000).
                        oOptions.onsuccess - Function to call on success.
                        oOptions.onfailure - Function to call on failure.
                    Returns:
                    Function that initiates the polling process.
                    About:
                    From: http://davidwalsh.name/essential-javascript-functions
                    */
                    poll: function (fn, oOptions) {
                        //#  WAS: function (vTest, fnCallback, fnErrback, iTimeout, iInterval, vArgument)
                        var _a, iEndTime; // = Number(new Date()) + (iTimeout || 2000);

                        //#
                        oOptions = processOptions(this, oOptions, {
                            //ontimeout: core.type.fn.noop,
                            //onsuccess: core.type.fn.noop
                        }, 100);
                        oOptions.timeout = core.type.int.mk(oOptions.timeout, 2000);

                        return function (/*arguments*/) {
                            //#
                            _a = convert(arguments);
                            iEndTime = Date.now() + oOptions.timeout;

                            //#
                            //#     NOTE: We need a named function below as we recurse for each .wait interval
                            !function p() {
                                //# If the condition is met, we can .call our .onsuccess (if any)
                                if (core.type.fn.call(fn, oOptions.context, _a)) {
                                    core.type.fn.call(oOptions.onsuccess, oOptions.context, _a);
                                }
                                //# Else if the condition isn't met but the timeout hasn't elapsed, recurse
                                else if (Date.now() < iEndTime) { // Number(new Date())
                                    setTimeout(p, oOptions.wait);
                                }
                                //# Else we've failed and timedout, so .call our .onfailure (if any)
                                else {
                                    core.type.fn.call(oOptions.onfailure, oOptions.context, _a);
                                    //fnErrback(new Error('timed out for ' + fnCallback + ': ' + arguments), vArgument);
                                }
                            }();
                        };
                    } //# fn.poll
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
                core.type.fn.call(core.resolve(_root, ["console", sMethod]), _null, _a);
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
                //# Else fallback to the non-modern browser (IE <= 8) attachEvent.onreadystatechange event (and attachEvent.onload as a fallback)
                else {
                    _document.attachEvent("onreadystatechange", function () {
                        if (_document.readyState === "complete") {
                            fnDocReady();
                        }
                    });
                    _root.attachEvent("onload", fnDocReady);
                }
            }

            return oEvent;
        }() //# core.io.event
    }; //# core.io


    /** ################################################################################################
     * @namespace core.lib
     * @desc Stub-object for External Library-based functionality.
     * @requires core.extend
     * @requires core.type.fn.is
    ################################################################################################# */
    core.lib = function () {
        var fnSyncer, fnBinder;

        function doRegister(fn, bIsSync) {
            var bReturnVal = core.type.fn.is(fn);

            //#
            if (bReturnVal) {
                if (bIsSync) {
                    fnSyncer = fn;
                }
                else {
                    fnBinder = fn;
                }
            }

            return bReturnVal;
        } //# doRegister

        return core.extend(oInterfaces.pub(), {
            ui: {
                sync: core.extend(
                    function (fnCallback, oOptions) {
                        //#
                        function fnSyncerWrapped() {
                            var bValidRequest = core.type.fn.is(fnCallback) && core.type.fn.is(fnSyncer),
                                vResult = (bValidRequest ? core.type.fn.call(fnSyncer, _null, [fnCallback]) : _null)
                            ;

                            //# If this is a bValidRequest and the caller wants the vResult do it, else return the value of bValidRequest to indicate the success/failure of the fnSyncer .call above
                            return (bValidRequest && oOptions.asResult ? vResult : bValidRequest);
                        } //# fnSyncerWrapped


                        //# Ensure the passed oOptions is an .obj
                        oOptions = core.type.obj.mk(oOptions);

                        //# If no arguments were sent, return the validity of fnSyncer, else return fnSyncerWrapped or its result as per .asFn
                        return (arguments.length === 0 ?
                            core.type.fn.is(fnSyncer) :
                            (oOptions.asFn ? fnSyncerWrapped : fnSyncerWrapped())
                        );
                    }, {
                        register: function (fn) {
                            return doRegister(fn, true);
                        }
                    }
                ), //# core.lib.ui.sync

                bind: core.extend(
                    function (vDom, oContext) {
                        return (arguments.length === 0 ?
                            core.type.fn.is(fnBinder) :
                            core.type.fn.call(fnBinder, _null, [vDom, oContext])
                        );
                    }, {
                        register: function (fn) {
                            return doRegister(fn /*, false*/);
                        }
                    }
                ) //# core.lib.ui.bind
            }
        });
    }(); //# core.lib


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
        //# <core.type.json.mk>
        //##################################################################################################
        oPrivate.init = function () {
            //# If we have access to module.exports, return our core reference
            if (typeof module !== 'undefined' && this.module !== module && module.exports) {
                module.exports = core;
            }

            //# Set our sTarget in the root
            //#     NOTE: this === `window` in the browser (which is `undefined` per above) and `global` on the server.
            //this[oTypeIsh.options.target] = core;
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
            //# <core.type.json.mk>
            //##################################################################################################
            //# Optionally create then .extend our _root variable to expose core as the developer defined in SCRIPT[ish]'s JSON
            //#     NOTE: Since document.currentScript is not universally supported, we look for SCRIPT[ish] as a fallback
            oPrivate.init = function () {
                var sTemp,
                    _script = _document.currentScript || _document_querySelector("SCRIPT[" + sTarget + "]"),
                    oOptions = oTypeIsh.options,
                    sTarget = oOptions.target,
                    bProcessAttribute = false
                ;

                //#
                function process(_script, bProcessAttribute) {
                    //# If we have an  _script[ish] to process
                    if (bProcessAttribute) {
                        //# Reset the .plugins.baseUrl to the developer-defined inline value (if any, borrowing sTemp as we go)
                        sTemp = oOptions.plugins.baseUrl || _script.src;
                        oOptions.plugins.baseUrl = sTemp.substr(0, sTemp.lastIndexOf("/") + 1);

                        //# .import any .plugins defined in our oOptions (flagging them as .importedBy SCRIPT[sTarget])
                        core.type.ish.import(oOptions.plugins.import, core.extend({
                            importedBy: "SCRIPT[" + sTarget + "]"
                        }, oOptions.plugins));

                        //# Reset our sTarget to the developer-defined inline value (if any)
                        //#     NOTE: This is done here and not in the `if` above so that all _script's are attributed with [ish]
                        sTarget = oOptions.target;
                    }

                    //# If bProcessAttribute isn't _null and we have a sTarget, overwrite core functionality with any existing functionality under _root[sTarget], then reset the _root object's reference so that the globally accessable object is a refrence to core rather than its original object reference
                    //#     NOTE: We need to create the window[sTarget] in the .resolve(true, ...) below in case it is not already defined, else the .resolve will fail.
                    if (core.type.bool.is(bProcessAttribute) && core.type.str.is(sTarget, true)) {
                        core.extend(core, core.resolve(true, _root, sTarget));
                        core.resolve(_root, sTarget, core);
                    }
                } //# process


                //# If we were able to locate our _script tag and a _script[ish] attribute is present, .getAttribute its [ish] into sTemp
                if (_script && _script.hasAttribute(sTarget)) {
                    sTemp = _script.getAttribute(sTarget);

                    //# If the _script[ish] .getAttribute .is a non-null .str
                    if (core.type.str.is(sTemp, true)) {
                        //# If the _script[ish] .getAttribute .is .json, .extend it into our oOptions
                        if (core.type.json.is(sTemp)) {
                            core.extend(oOptions, core.type.json.mk(sTemp));
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
                    x - The varient to interrogate.
                    bAllowSelector - Boolean value representing if CSS selectors that successfully resolve to DOM elements are to be included in the test.
                    Returns:
                    Boolean value representing if the value is a DOM reference.
                    */
                    is: function isDom(x, bAllowSelector) {
                        //# If we are to bAllowSelector, attempt to convert x to a DOM element if its .is .str
                        x = (bAllowSelector && core.type.str.is(x, true) ? _document_querySelector(x) || _document.getElementById(x) : x);

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
                    x - The varient to interrogate. Can be a CSS Selector (used by document.querySelector), jQuery reference (x[0] will be returned), HTML string defining a single root element or DOM element.
                    _default - The default DOM element to return if casting fails.
                    Returns:
                    DOM element represented by the passed value, or _default if interrogation failed.
                    */
                    mk: function (x, _default) {
                        var _div = _document.createElement("div"),
                            _returnVal = (arguments.length > 1 ? _default : _div)
                        ;

                        //#
                        if (core.type.str.is(x, true)) {
                            x = x.trim();

                            //# If the passed x .is a .selector, try and collect it
                            if (core.type.selector.is(x)) {
                                _returnVal = _document_querySelector(x) || _document.getElementById(x) || _returnVal;
                            }
                            //# Else try to parse the passed .is .str as HTML
                            else {
                                _div.innerHTML = x;

                                //# If we were able to parse a single non-#text node, set it into our _returnVal
                                //# TODO: Make testing more betterer
                                if (_div.childNodes.length <= 2 && _div.childNodes[0].nodeType !== 3) {
                                    _returnVal = _div.childNodes[0];
                                }
                                //# Else if our _returnVal was defaulted to the _div above, reset the _div's .innerHTML
                                else {
                                    _div.innerHTML = "";
                                }
                            }
                            //# Else try to .parse the passed .is .str as HTML
                            //else {
                            //    _returnVal = core.type.dom.parse(x, true) || _returnVal;
                            //}
                        }
                        else if (core.type.dom.is(x)) {
                            _returnVal = x;
                        }
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
                    parse: function (sHTML, bFirstElementOnly) {
                        var _returnVal, a_vMap, sTag, bBodyTag, i;

                        //# .trim any empty leading/trailing #text nodes then safely determine the first sTag (if any) within the passed sHTML
                        //#     NOTE: /g(lobal) only returns the first <tag> for whatever reason!?
                        sHTML = core.type.str.mk(sHTML).trim();
                        sTag = core.type.str.mk(
                            (/<([^\/!]\w*)[\s\S]*?>/g.exec(sHTML) || {})[1]
                        ).toLowerCase();

                        //# Determine if this is a bBodyTag, the a_vMap entry then construct our _returnVal including its .innerHTML
                        //#     NOTE: While we can and do parse multiple elements/nodes, we only look at the first sTag to determine the a_vMap
                        a_vMap = a_oWrapMap[sTag] || a_oWrapMap._;
                        bBodyTag = (sTag === 'body');
                        //var _dom = (bBodyTag ? _document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', _null) : _null);
                        _returnVal = _document.createElement(bBodyTag ? 'html' : 'div');
                        _returnVal.innerHTML = a_vMap[1] + sHTML + a_vMap[2];

                        //# If the sHTML is a bBodyTag, reset our _returnVal an array containing it
                        //#     NOTE: Use of Element.querySelector(...) below limits this to IE8+ without the polyfill, see: https://caniuse.com/#feat=queryselector
                        if (bBodyTag) {
                            _returnVal = [_returnVal.querySelector(sTag)];
                        }
                        //# Else set the i(ndex) and traverse down the a_vMap elements to collect the parsed sHTML
                        else {
                            i = a_vMap[0];
                            while (i-- /* > 0*/) {
                                _returnVal = _returnVal.children[0];
                            }

                            //# Reset our _returnVal to an array of its first .child(ren) if we're supposed to return the bFirstElementOnly else to all its .childNodes
                            _returnVal = (bFirstElementOnly ?
                                [_returnVal.children[0]] :
                                core.type.arr.mk(_returnVal.childNodes)
                            );
                        }

                        return (bFirstElementOnly ? _returnVal[0] : _returnVal);
                    } //# dom.parse
                };
            }(); //# core.type.dom


            //#     NOTE: No .mk
            core.type.selector = {
                /*
                About:
                Based on code from: stackoverflow.com/a/42149818/235704
                */
                is: function isSelector() {
                    var _dummy = _document.createElement('br');

                    return function (sSelector) {
                        var bReturnVal = false;

                        try {
                            _dummy.querySelector(sSelector);
                            bReturnVal = true;
                        } catch (e) { oTypeIsh.expectedErrorHandler(e); }

                        return bReturnVal;
                    };
                }() //# selector.is

                //mk:
            }; //# core.type.selector


            /** ################################################################################################
             * @class core.require
             * @classdesc Collection of RequireJS-based functionality.
             * @requires core.extend
             * @requires core.type.arr.is, core.type.fn.is, core.type.str.is, core.type.obj.is
             * @requires core.type.obj.mk, core.type.fn.mk
             * @requires core.type.fn.call, core.io.event.fire
            ################################################################################################# */
            core.require = function (requireJs) {
                var oRequireOptions = { //# http://requirejs.org/docs/api.html#config
                    //onappend: function (_script) {},  //# NOTE: Feature not present in requireJs
                    onerror: function (_script) {       //# NOTE: Feature not present in requireJs
                        var oConfig = core.type.json.mk(_script.getAttribute("config"));
                        core.io.console.error("Unable to include `" + oConfig.src + "`.");
                    },
                    //paths: [],        //# requirejs
                    //bundles: {},      //# requirejs
                    waitSeconds: 7,
                    baseUrl: "",
                    urlArgs: ""
                };

                //#
                function eventHandler(a_sUrls, fnCallback, oOptions) {
                    var a_oTracker = [],
                        bAllLoaded = true,
                        iCounter = a_sUrls.length
                    ;

                    //#
                    //#     NOTE: bError comes across as an oEvent .onload and .onerror
                    function loadHandler(_dom, bError, bTimedOut) {
                        //# .push the current a_sUrls into the array
                        a_oTracker.push({
                            dom: _dom,
                            loaded: (bError !== true),
                            timedout: !!(bError && bTimedOut)
                        });

                        //#
                        if (bError) {
                            core.type.fn.call(oOptions.onerror, _null, [_dom]);
                        }

                        //# If we have loaded all of our a_sUrls, .call our fnCallback
                        if (--iCounter < 1) {
                            core.type.fn.call(fnCallback, _null, [a_oTracker, bAllLoaded]);
                        }
                    } //# loadHandler

                    //#
                    function errorHandler(_dom, bTimedOut) {
                        bAllLoaded = false;
                        loadHandler(_dom, true, bTimedOut);
                    } //# errorHandler


                    //# If the passed a_sUrls is empty, .call the fnCallback now
                    //#     NOTE: .loadHandler will never be called via oReturnVal.onload/.onerror if there are no a_sUrls to process, hence the call here
                    if (iCounter < 1) {
                        core.type.fn.call(fnCallback, _null, [a_oTracker, bAllLoaded]);
                    }

                    //# Return the individual _dom element tracker factory to the caller
                    return function (_dom, bAlreadyLoaded) {
                        var iTimeout,
                            oReturnVal = {
                                onerror: function (bTimedOut) {
                                    errorHandler(_dom, bTimedOut);
                                },
                                onload: function () {
                                    //# clearTimeout (if any) and .push the current a_sUrls into the array
                                    //#      NOTE: As per MDN, clearTimeout(undefined) does nothing, so we don't bother with an if() below
                                    clearTimeout(iTimeout);
                                    loadHandler(_dom /*, false, false*/);
                                }
                            }
                        ;

                        //#
                        if (bAlreadyLoaded) {
                            loadHandler(_dom /*, false, false*/);
                        }
                        else {
                            iTimeout = setTimeout(function () { oReturnVal.onerror(true); }, oOptions.waitSeconds * 1000);
                            _dom.onload = oReturnVal.onload;
                            _dom.onerror = oReturnVal.onerror;
                        }

                        return oReturnVal;
                    };
                } //# eventHandler

                //#
                //#     NOTE: The third argument `oOptions` is a feature not present in requireJs
                function requireJsLite(vUrls, fnCallback, oOptions) {
                    var _script, oEventHandler, sSrc, i,
                        //# <IE6thru9Support>
                        fnIE6thru9Support = function (_script) {
                            return function () {
                                if (_script.readyState == "loaded" || _script.readyState == "complete") {
                                    _script.onreadystatechange = _null;
                                    _script.onload(/*false*/);
                                }
                            };
                        },
                        //# </IE6thru9Support>
                        a_sUrls = (core.type.arr.is(vUrls) ? vUrls : [vUrls])
                    ;

                    //#
                    oOptions = core.extend({}, oRequireOptions, oOptions);
                    oEventHandler = eventHandler(a_sUrls, fnCallback, oOptions);

                    //# Traverse the a_sUrls, creating each _script and setTimeout'ing as we go
                    for (i = 0; i < a_sUrls.length; i++) {
                        sSrc = oOptions.baseUrl + a_sUrls[i] + oOptions.urlArgs;
                        _script = _document_querySelector("script[src='" + sSrc + "']");

                        //# If there was a _script already, call .onload on the oEventHandler for the _script
                        if (core.type.dom.is(_script)) {
                            oEventHandler(_script, true).onload();
                        }
                        //# If there wasn't a _link already, build it and .appendChild
                        else {
                            _script = _document.createElement('script');
                            oEventHandler(_script);

                            //# <IE6thru9Support>
                            //# If our _script has .readyState defined, we need to monitor .onreadystatechange
                            //#     NOTE: In order to keep the _tcript in scope for .onreadystatechange, we use the fnIE6thru9Support Factory
                            //#     NOTE: It costs us 9 lines of code to support IE v6-v9
                            //#     Based on: https://www.html5rocks.com/en/tutorials/speed/script-loading/ and https://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
                            _script.onreadystatechange = (_script.readyState ? fnIE6thru9Support(_script) : _null);
                            //# </IE6thru9Support>

                            //# .setAttribute's then append the _script to our _head
                            //#     NOTE: We set the src after the events because some browsers (IE) start loading the script as soon as the src is set
                            //_script.setAttribute('config', JSON.stringify({
                            //    src: sSrc,
                            //    baseUrl: oOptions.baseUrl,
                            //    urlArgs: oOptions.urlArgs
                            //}));
                            _script.setAttribute('type', "text/javascript");
                            _script.setAttribute('src', sSrc);
                            _head.appendChild(_script);

                            //# Call the RequireJs non-feature .onappend now that the _script has been .appendChild'd
                            core.type.fn.call(oOptions.onappend, _null, [_script]);
                        }
                    }
                } //# requireJsLite
                requireJsLite.config = function (oOptions) {
                    return core.extend(oRequireOptions, oOptions);
                }; //# requireJsLite.config


                //# Ensure the passed requireJs is a function (defaulting to the above-defined requireJsLite), then ensure our oOptions' are loaded into the .config
                requireJs = core.type.fn.mk(requireJs, requireJsLite);
                //requireJs.config(oOptions);

                //#
                core.extend(oTypeIsh, {
                    'import': function (a_sImport, oOptions) {
                        var i,
                            a_sUrls = []
                        ;

                        //# If we have scripts to a_sImport
                        //# <script type="text/javascript" src="js/ish/ish.js" ish='{ "target": "$z", "plugins": { "import": ["lib.ui","app.tags","app.ui"], "baseUrl": "js/ish/", "cache": false } }'></script>
                        if (core.type.arr.is(a_sImport, true)) {
                            //# Traverse each script to a_sImport, creating a new SCRIPT tag for each
                            for (i = 0; i < a_sImport.length; i++) {
                                a_sUrls.push(a_sImport[i] + ".js");
                            }

                            //#
                            oOptions = core.extend({}, oTypeIsh.options.plugins, oOptions);
                            core.require.config({ //# TODO: Remove core.require.config setting here, add oOptions to .queue
                                waitSeconds: 7,
                                baseUrl: oOptions.baseUrl,
                                urlArgs: (oOptions.cache === false ?
                                    "?nocache=" + Date.now() :
                                    ""
                                ),
                                onappend: function (_script) {
                                    _script.setAttribute("importedBy", oOptions.importedBy || "type.ish.import");
                                }
                            });
                            core.require.queue(a_sUrls, function (a_oResults) {
                                //# So long as the .callback didn't return false, .fire the .event
                                if (core.type.fn.mk(oOptions.callback)(a_oResults) !== false) {
                                    core.io.event.fire("ish.pluginsLoaded", a_oResults);
                                }
                            });
                        }
                    }, //# type.ish.import

                    //#
                    prereqs: function (sSource, oPreReqs, oOptions) {
                        var i,
                            a_sIncludes = [],
                            a_sKeys = core.type.obj.ownKeys(oPreReqs)
                        ;

                        //# If we got a_sKeys from the passed oPreReqs, traverse them .push'ing each truthy value into a_sIncludes
                        if (core.type.arr.is(a_sKeys, true)) {
                            for (i = 0; i < a_sKeys.length; i++) {
                                if (oPreReqs[a_sKeys[i]]) {
                                    a_sIncludes.push(a_sKeys[i] + ".js");
                                }
                            }

                            //# If we have some a_sIncludes, .require them now while passing in the SCRIPT[ish] options while we go
                            if (a_sIncludes.length > 0) {
                                core.require.scripts(a_sIncludes,
                                    function (/*a_oScripts, bAllLoaded*/) {},
                                    core.extend({
                                        onerror: function (_script) {
                                            core.io.console.error(sSource + ": Unable to load '" + _script.src + "'.");
                                        }
                                    }, core.type.ish.options.plugins, oOptions)
                                );
                            }
                        }
                    } //# type.ish.prereqs
                }); //# core.type.ish.import

                //#
                return core.extend(
                    function (vUrls, fnCallback, oOptions) {
                        var i,
                            bLoadedAll = true,
                            a_sUrls = (core.type.arr.is(vUrls) ? vUrls : [vUrls]),
                            a_sScripts = [],
                            a_sCSS = [],
                            a_sLinks = [],
                            fnCollateResults = function (a_sProcessedUrls, bAllLoaded) {
                                //# If the a_sProcessedUrls have values, .concat them into our (reset) a_sUrls and recalculate bLoadedAll
                                if (core.type.arr.is(a_sProcessedUrls, true)) {
                                    a_sUrls = a_sUrls.concat(a_sProcessedUrls);
                                    bLoadedAll = (bLoadedAll && bAllLoaded);
                                }

                                //# If all of the series have returned, fnCallback
                                if (--i < 1) {
                                    core.type.fn.call(fnCallback, _null, [a_sUrls, bLoadedAll]);
                                }
                            }
                        ;

                        //# Traverse the a_sUrls, sorting each into their related arrays
                        for (i = 0; i < a_sUrls.length; i++) {
                            switch (core.type.str.mk(a_sUrls[i]).match(/\.([^\./\?#]+)($|\?|#)/)[1].toLowerCase()) {
                                case "js": {
                                    a_sScripts.push(a_sUrls[i]);
                                    break;
                                }
                                case "css": {
                                    a_sCSS.push(a_sUrls[i]);
                                    break;
                                }
                                default: {
                                    a_sLinks.push(a_sUrls[i]);
                                }
                            }
                        }

                        //# Now that we've sorted the passed a_sUrls, reset them and i for the checks below
                        a_sUrls = [];
                        i = 0;

                        //# If we have values, inc i and call the series or fnCollateResults if they're all empty
                        if (core.type.arr.is(a_sScripts, true)) {
                            i++;
                            requireJs(a_sScripts, fnCollateResults, oOptions);
                        }
                        if (core.type.arr.is(a_sCSS, true)) {
                            i++;
                            core.require.css(a_sCSS, fnCollateResults, oOptions);
                        }
                        if (core.type.arr.is(a_sLinks, true)) {
                            i++;
                            core.require.link(a_sLinks, fnCollateResults, oOptions);
                        }
                        if (i < 1) {
                            fnCollateResults(/*[], true*/);
                        }
                    }, {
                        scripts: requireJs,
                        config: requireJsLite.config,
                        lite: (requireJs === requireJsLite),

                        //# Soft-configured version of requireJs's bundles/shim
                        //#     NOTE: This allows us to dynamicially define any "bundles" we require at runtime, allowing us to load scripts in the required order
                        queue: function (a_vModules, fnCallback) {
                            var vCurrent,
                                i = 0,
                                iLength = core.type.int.mk(core.resolve(a_vModules, "length"), 0),
                                bAllLoaded = (iLength > 0),
                                a_oResults = []
                            ;

                            //#
                            function doLoad() {
                                vCurrent = a_vModules[i++];

                                //# Call requireJs to load the vCurrent a_vModules, copying its returned arguments into vCurrent on callback (code-golf)
                                requireJs(core.type.arr.mk(vCurrent, [vCurrent]), function (a_oScripts, bEntryAllLoaded) {
                                    //#
                                    if (requireJs.lite) {
                                        a_oResults.push({
                                            dom: a_oScripts,
                                            loaded: bEntryAllLoaded
                                        });
                                        if (bEntryAllLoaded === false) {
                                            bAllLoaded = false;
                                        }
                                    }

                                    //# Recurse if we still have a_vModules to process, else call loaded
                                    (i < iLength ? doLoad() : loaded(arguments));
                                });
                            } //# doLoad

                            //#
                            function loaded(_a) {
                                //# Run our fnCallback with the above collected a_oResults (if any)
                                core.type.fn.call(fnCallback, _null,
                                    (requireJs.lite ?
                                        [a_oResults, bAllLoaded] :
                                        _a
                                    )
                                );
                            } //# loaded


                            //# If the caller passed in valid a_vModules, kick off doLoad else call loaded to return a null result to the fnCallback
                            (bAllLoaded ? doLoad() : loaded());
                        }, //# queue

                        //#
                        link: function (vUrls, fnCallback, oOptions) {
                            var _link, oEventHandler, oHandler, oCurrent, i,
                                a_sUrls = (core.type.arr.is(vUrls) ? vUrls : [vUrls])
                            ;

                            //# Ensure the passed oOptions .obj.is, defaulting the values and including the oRequireOptions as we go
                            oOptions = core.extend({
                                rel: "",
                                type: "",   //# SEE: https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types
                                media: ""   //# SEE: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
                            }, oRequireOptions, oOptions);
                            oEventHandler = eventHandler(a_sUrls, fnCallback, oOptions);

                            //# Traverse the a_sUrls, pulling the oCurrent value and any existing _link's as we go
                            for (i = 0; i < a_sUrls.length; i++) {
                                oCurrent = core.type.obj.mk(a_sUrls[i], { href: a_sUrls[i] });
                                oCurrent.href = oOptions.baseUrl + oCurrent.href + oOptions.urlArgs;
                                _link = _document_querySelector("link[href='" + oCurrent.href + "']");

                                //# If there was a _link already, call .onload on the oEventHandler for the _link
                                if (core.type.dom.is(_link)) {
                                    oEventHandler(_link, true).onload();
                                }
                                //# If there wasn't a _link already, build it and .appendChild
                                else {
                                    _link = _document.createElement('link');
                                    oHandler = oEventHandler(_link);

                                    //# <NonLinkOnloadSupport>
                                    //#
                                    if (!('onload' in _link)) {
                                        oHandler.i = document.createElement("img"); //# img
                                        oHandler.i.onerror = oHandler.onload;
                                        oHandler.i.src = oCurrent.href;
                                    }
                                    //# </NonLinkOnloadSupport>

                                    //#
                                    _link.rel = oCurrent.rel || oOptions.rel;
                                    _link.type = oCurrent.type || oOptions.type;
                                    _link.href = oCurrent.href;
                                    _link.media = oCurrent.media || oOptions.media;
                                    _head.appendChild(_link);

                                    //# Call the RequireJs non-feature .onappend now that the _script has been .appendChild'd
                                    core.type.fn.call(oOptions.onappend, _null, [_link]);
                                }
                            }
                        }, //# link

                        //#
                        css: function (vUrls, fnCallback, oOptions) {
                            //# Ensure the passed oOptions .obj.is, defaulting the values as we go
                            //#     NOTE: We skip oRequireOptions as that is done within core.require.link
                            core.require.link(vUrls, fnCallback, core.extend({
                                rel: "stylesheet",
                                type: "text/css",
                                media: "all"
                            }, oOptions));
                        } //# css
                    }
                );
            }(_root.require); //# core.require


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

                clearSelection: function ()
                {
                    if (_root.getSelection) {_root.getSelection().removeAllRanges();}
                    else if (_document.selection) {_document.selection.empty();}
                }

                /*
                //############################################################
                //# Determines if the referenced elements overlap in the 2D plane.
                //#    NOTE: This function really only needs to run correctly under those browsers that have Z-Index issues with certian elements, so true cross-platform compatibility is not really required for this function
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
                        //#### If the elements seem to be in the way verticially
                    if ((iY1 <= iB1 && iY2 > iB1) || (iY1 >= iB1 && iY1 < iB2)) {
                            //#### Set the X (horozontal) coords
                        iA1 = this.Left(oElement1);
                        iA2 = iA1 + this.Width(oElement1);
                        iX1 = this.Left(oElement2);
                        iX2 = iX1 + this.Width(oElement2);
                            //#### If the passed elements also overlap horozontally, flip bReturn to true
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
}();
