/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';

    var _window = window,
        _undefined /*= undefined*/,
        _null = null
    ;


    /*
    ####################################################################################################
	Class: core.type
    Additional Variable Type-based functionality (type.*.cp, type.*.cmp, type.*.eq, type.*.rm, etc) plus uuid, enum and query.
    Requires:
    <core.resolve>, <core.extend>,
    <core.type.fn.is>, <core.type.arr.is>, <core.type.obj.is>, <core.type.str.is>, <core.type.date.is>, <core.type.num.is>,
    <core.type.str.mk>, <core.type.int.mk>, <core.type.date.mk>, <core.type.float.mk>,
    <core.type.fn.call>,
    ~<core.io.net.get>
    ####################################################################################################
    */
   core.oop.partial(core.type, function (/*oProtected*/) {
        return {
            //# val, true
            is: {
                /*
                Function: native
                Determines if the passed value is a native Javasript function or object.
                Parameters:
                x - The varient to interrogate.
                Returns:
                Boolean value representing if the value is a native Javasript function or object.
                About:
                From: http://davidwalsh.name/essential-javascript-functions
                */
                native: function () {
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
            }, //# core.type.is

            //#
            any: function (x, a_vValues, bUseCoserion) {
                var i,
                    fnTest = (bUseCoserion === true ?
                        function (vX, vTest) {
                            return vX == vTest;
                        } :
                        function (vX, vTest) {
                            return vX === vTest;
                        }
                    ),
                    bReturnVal = false
                ;

                //#
                if (core.type.arr.is(a_vValues, true)) {
                    for (i = 0; i < a_vValues.length; i++) {
                        if (fnTest(x, a_vValues[i])) {
                            bReturnVal = true;
                            break;
                        }
                    }
                }

                return bReturnVal;
            }, //# core.type.any

            //# core.type.obj.toArr, core.type.obj.get
            query: function () {
                //#
                function doQuery(sKey, vQueryValue, oSource, oOptions) {
                    var vTestValue = (oOptions.caseInsentive ? core.type.obj.get(oSource, sKey) : core.resolve(oSource, sKey)),
                        bReturnVal = false
                    ;

                    //# Else if the vQueryValue .is.fn, call it with fn(vTestValue, oOptions)
                    if (core.type.fn.is(vQueryValue)) {
                        bReturnVal = vQueryValue(vTestValue, oOptions);
                    }
                    //#
                    else if (vQueryValue instanceof RegExp) {
                        bReturnVal = !!(core.type.str.mk(vTestValue).match(vQueryValue));
                    }
                    //# Else we'll consider the vCurrent oQuery value as singular
                    else {
                        bReturnVal = (core.type.obj.is(oSource) &&
                            (oOptions.useCoercion && vTestValue == vQueryValue) ||
                            (vTestValue === vQueryValue)
                        );
                    }

                    return bReturnVal;
                } //# doQuery

                //#
                //# ["val1", "val2"] = core.type.query([{}, {}], ["path.to.val"])
                //# [{}, {}] = core.type.query([{}, {}], { key: "val", key2: ["val1", "val2"] })
                return function (vCollection, vQuery, oOptions) {
                    var a_oCollection, vCurrent, bIsMatch, i, j, k,
                        a_oReturnVal = [],
                        bExtract = core.type.arr.is(vQuery, true),
                        a_sKeys = (bExtract ?
                            vQuery : (
                                core.type.obj.is(vQuery) ?
                                Object.keys(vQuery) :
                                _undefined
                            )
                        )
                    ;

                    //# .extend the passed oOptions with the defaults (which also ensures the passed oOptions .is.obj)
                    oOptions = core.extend({
                        firstEntryOnly: false,
                        caseInsentive: false,
                        useCoercion: false,
                        or: false,
                        setKeyAs: "$key"
                    }, oOptions);

                    //# Calculate our a_oCollection based on the passed vCollection
                    a_oCollection = (core.type.arr.is(vCollection) ?
                        vCollection : (core.type.obj.is(vCollection) ?
                            core.type.obj.toArr(vCollection, oOptions.setKeyAs) :
                            [vCollection]
                        )
                    );

                    //# If we have a_oCollection and a vQuery
                    if (core.type.arr.is(a_oCollection, true) && core.type.arr.is(a_sKeys, true)) {
                        //# If vQuery was an array
                        if (bExtract) {
                            for (i = 0; i < a_oCollection.length; i++) {
                                //#
                                if (a_sKeys.length > 1) {
                                    vCurrent = {};
                                    a_oReturnVal.push(vCurrent);

                                    for (j = 0; j < a_sKeys.length; j++) {
                                        vCurrent[a_sKeys[j]] = core.resolve(a_oCollection[i], a_sKeys[j]);
                                    }
                                }
                                //#
                                else {
                                    a_oReturnVal.push(core.resolve(a_oCollection[i], a_sKeys[0]));
                                }
                            }
                        }
                        //# Else vQuery was an object
                        else {
                            //# Traverse our a_oCollection
                            for (i = 0; i < a_oCollection.length; i++) {
                                //# Traverse our vQuery's a_sKeys, resetting bIsMatch and vCurrent for each loop
                                for (j = 0; j < a_sKeys.length; j++) {
                                    bIsMatch = false;
                                    vCurrent = vQuery[a_sKeys[j]];

                                    //# If we have an .is.arr of vQuery values to traverse, do so now
                                    if (core.type.arr.is(vCurrent)) {
                                        for (k = 0; k < vCurrent.length; k++) {
                                            //# If the vCurrent value matches our current a_oCollection item, flip bIsMatch and fall from the inner loop
                                            if (doQuery(a_sKeys[j], vCurrent[k], a_oCollection[i], oOptions)) {
                                                bIsMatch = true;
                                                break;
                                            }
                                        }
                                    }
                                    //# Else we'll consider the vCurrent vQuery value as singular, so reset bIsMatch based on doQuery
                                    else {
                                        bIsMatch = doQuery(a_sKeys[j], vCurrent, a_oCollection[i], oOptions);
                                    }

                                    //# If this is an AND-based vQuery and the vCurrent vQuery isn't an bIsMatch or this is an OR-based vQuery and we've already found our bIsMatch, fall from the middle loop
                                    if ((!oOptions.or && !bIsMatch) || (oOptions.or && bIsMatch)) {
                                        break;
                                    }
                                }

                                //# If the current a_oCollection record passed each vQuery value, .push it into our a_oReturnVal
                                if (bIsMatch) {
                                    a_oReturnVal.push(a_oCollection[i]);

                                    //# If we are looking for the .firstEntryOnly, fall from the outer loop
                                    if (oOptions.firstEntryOnly) {
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    return (oOptions.firstEntryOnly ? a_oReturnVal[0] : a_oReturnVal);
                };
            }(), //# core.type.query

            //####

            /*
            Returns a GUID/UUID v4
            */
            uuid: function() {
                var fnReturnValue, d,
                    _window_crypto = _window.crypto || {}
                ;

                //# If _window.Uint8Array and _window.crypto are available, use them in our fnReturnValue
                if (core.type.fn.is(_window_crypto.getRandomValues) && core.type.fn.is(_window.Uint8Array)) {
                    fnReturnValue = function () {
                        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
                            return (c ^ _window.crypto.getRandomValues(new _window.Uint8Array(1))[0] & 15 >> c / 4).toString(16);
                        });
                    };
                }
                //# Else something went wrong using the ES6 approach, so fall back to the
                else {
                    d = (
                        Date.now() + (core.type.fn.call(core.resolve(_window, "performance.now")) || 0)
                    );

                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = (d + Math.random() * 16) % 16 | 0;
                        d = Math.floor(d / 16);
                        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                    });

                    /*
                    var i,
                        a_bLookupTable = []
                    ;

                    //# Pre-populate our a_bLookupTable
                    for (i = 0; i < 256; i++) {
                        a_bLookupTable[i] = (i < 16 ? '0' : '') + (i).toString(16);
                    }

                    //# Set our fnReturnValue to the
                    //#     Based on code from: Jeff Ward, https://stackoverflow.com/a/21963136/235704
                    fnReturnValue = function () {
                        var xffffffff = 0xffffffff,
                            iPrefNow = (core.type.fn.is(core.resolve(_window, "performance.now")) ? _window.performance.now() : 0),
                            d0 = (Math.random() + iPrefNow) * xffffffff | 0,
                            d1 = (Math.random() + iPrefNow) * xffffffff | 0,
                            d2 = (Math.random() + iPrefNow) * xffffffff | 0,
                            d3 = (Math.random() + iPrefNow) * xffffffff | 0
                        ;

                        return a_bLookupTable[d0&0xff] + a_bLookupTable[d0>>8&0xff] + a_bLookupTable[d0>>16&0xff] + a_bLookupTable[d0>>24&0xff] +
                            '-' + a_bLookupTable[d1&0xff] + a_bLookupTable[d1>>8&0xff] +
                            '-' + a_bLookupTable[d1>>16&0x0f|0x40] + a_bLookupTable[d1>>24&0xff] +
                            '-' + a_bLookupTable[d2&0x3f|0x80] + a_bLookupTable[d2>>8&0xff] +
                            '-' + a_bLookupTable[d2>>16&0xff] + a_bLookupTable[d2>>24&0xff] + a_bLookupTable[d3&0xff] + a_bLookupTable[d3>>8&0xff] + a_bLookupTable[d3>>16&0xff] + a_bLookupTable[d3>>24&0xff]
                        ;
                    };
                    */
                }

                return fnReturnValue;
            }(), //# core.type.uuid


            /*
            //# Setup .app.templates
            !function() {
                var oTemplateData = {};

                core.app.templates = function (sTemplate) {
                    return core.extend({}, core.resolve());
                };
                core.app.templates.ready = false;
                core.app.templates.data = oTemplateData;

                core.io.net.get('data/templates.json', function (bSuccess, oResponse /*, vArg, $xhr* /) {
                    if (bSuccess) {
                        oTemplateData = core.resolve(oResponse, "data");
                        core.app.templates.ready = true;
                    }
                });
            }(); //# .app.templates

            {
                "templates": {
                    "threat": {
                        "_index": "",
                        "_type": "",
                        "_id": "",
                        "_score": null,
                        "_source": {
                            "lnotes": "",
                            "et": "",
                            "ev": "",
                            "lt": "",
                            "lv": "",
                            "ts": 0,
                            "lv_IPv4": [],
                            "lv_country": [],
                            "stat": {
                                "p": null,
                                "a": null,
                                "c": null
                            }
                        },
                        "sort": []
                    },
                    "zc_generic": {
                        "lnotes": "",
                        "et": "",
                        "ev": "",
                        "lt": "",
                        "lv": "",
                        "ts": 0,
                        "lv_IPv4": [],
                        "lv_country": [],
                        "date": 0,
                        "stat": {
                            "p": null,
                            "a": null,
                            "c": null
                        }
                    }
                }
            }
            */


            //####

            //# eq, cmp
            num: {
                /*
                Function: eq
                Determines if the passed numeric values are equal (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
                Parameters:
                s - The first numeric value to compare.
                t - The second numeric value to compare.
                Returns:
                Boolean value representing if the passed numeric values are equal.
                */
                eq: function (x, y) {
                    var bReturnVal = false;

                    //# If the passed x and y .is.num'bers, .mk them .floats and reset our bReturnVal to their comparison
                    if (core.type.num.is(x) && core.type.num.is(y)) {
                        bReturnVal = (core.type.float.mk(x) === core.type.float.mk(y));
                    }

                    return bReturnVal;
                }, //# type.num.eq


                /*
                Function: cmp
                Determines the relationship between the passed numeric values (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
                Parameters:
                x - The first numeric value to compare.
                y - The second numeric value to compare.
                Returns:
                Nullable interger value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or y is non-numeric.
                */
                cmp: function (x, y) {
                    var iReturnVal = _undefined,
                        dX = core.type.float.mk(x, _null),
                        dY = core.type.float.mk(y, _null)
                    ;

                    if (core.type.num.is(dX) && core.type.num.is(dY)) {
                        if (dX < dY) {
                            iReturnVal = -1;
                        }
                        else if (dX > dY) {
                            iReturnVal = 1;
                        }
                        else {
                            iReturnVal = 0;
                        }
                    }

                    return iReturnVal;
                } //# type.num.cmp

                // cp:
            }, //# core.type.num

            //# eq, cmp, cp, age, yyyymmdd, only
            date: {
                /*
                Function: date
                Determines if the passed dates are equal (includes implicit casting).
                Parameters:
                x - The first date to compare.
                y - The second date to compare.
                Returns:
                Boolean value representing if the passed dates are equal.
                */
                eq: function (x, y) {
                    var dDateX = core.type.date.mk(x, _null);
                    var dDateY = core.type.date.mk(y, _null);

                    //#     NOTE: `new Date("1970/01/01") === new Date("1970/01/01")` is always false as they are 2 different objects, while <= && >= will give the expected result
                    //#     SEE: Comment from Jason Sebring @ http://stackoverflow.com/a/493018/235704
                    return (core.type.date.is(dDateX) && core.type.date.is(dDateY) && dDateX <= dDateY && dDateX >= dDateY);
                }, //# type.date.eq


                /*
                Function: cmp
                Determines the relationship between the passed dates, with the second date optionally defaulting to `new Date()` (i.e. now).
                Parameters:
                x - The first date to compare.
                (Optional) y - The optional second date to compare. Default Value: `new Date()`.
                Returns:
                Nullable integer value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or the passed y is not a date.
                */
                cmp: function (x, y) {
                    var iReturnVal = _undefined,
                        dDateX = core.type.date.mk(x, _null),
                        dDateY = (arguments.length < 2 ? new Date() : core.type.date.mk(y, _null))
                    ;

                    //# If the passed dates are valid, determine dDateX's relationship to dNow
                    if (core.type.date.is(dDateX) && core.type.date.is(dDateY)) {
                        if (dDateX < dDateY) {
                            iReturnVal = -1;
                        }
                        else if (dDateX > dDateY) {
                            iReturnVal = 1;
                        }
                        else {
                            iReturnVal = 0;
                        }
                    }

                    return iReturnVal;
                }, //# type.date.cmp


                //#
                cp: function (d) {
                    //# If the caller passed in a valid d(ate),
                    if (core.type.date.is(d)) {
                        return new Date(d.getTime());
                    }
                }, //# type.date.cp

                /*
                Function: age
                Safely parses the passed value as a date of birth into the age in years.
                Parameters:
                dob - The varient to interrogate.
                Returns:
                Integer representing the age in years.
                */
                age: function (dob) {
                    var dAgeSpan,
                        iReturnVal = -1
                    ;

                    //# If the passed dob is a valid date
                    if (core.type.date.is(dob)) {
                        //# Set dAgeSpan based on the milliseconds from epoch
                        dAgeSpan = new Date(_Date_now() - core.type.date.mk(dob, _null));
                        iReturnVal = Math.abs(dAgeSpan.getUTCFullYear() - 1970);
                    }

                    return iReturnVal;
                }, //# date.age

                /*
                Function: yyyymmdd
                Safely parses the passed value into a string containing the international date format (YYYY/MM/DD).
                Parameters:
                x - The varient to interrogate.
                dDefault - The default value to return if casting fails.
                Returns:
                String representing the international date format (YYYY/MM/DD).
                */
                yyyymmdd: function (x, dDefault, sDelimiter) {
                    var dDate = core.type.date.mk(x, (arguments.length > 1 ? dDefault : new Date()));

                    sDelimiter = core.type.str.mk(sDelimiter, "/");

                    return (core.type.date.is(dDate) ?
                        dDate.getFullYear() + sDelimiter + core.type.str.lpad((dDate.getMonth() + 1), "0", 2) + sDelimiter + core.type.str.lpad(dDate.getDate(), "0", 2) :
                        ""
                    );
                    //dCalDate.getHours() + ':' + core.type.str.mk(dCalDate.getMinutes()).lPad("0", 2) + ':' + core.type.str.mk(dCalDate.getSeconds()).lPad("0", 2)
                }, //# date.yyyymmdd

                /*
                Function: only
                Safely parses the passed value into a date containing the year/month/day while replacing any time portion with midnight.
                Parameters:
                x - The varient to interrogate.
                dDefault - The default value to return if casting fails.
                Returns:
                Date representing the year/month/day in the passed value.
                */
                only: function (x, dDefault) {
                    return core.type.date.mk(core.type.date.yyyymmdd.apply(this, [x, dDefault]) + " 00:00:00");
                } //# date.only
            }, //# core.type.date

            //# eq, cmp, lpad, rpad, begins, ends, contains, sub
            str: function () {
                //#
                function doPad(s, sChar, iLength, bLPad) {
                    var sReturnVal = core.type.str.mk(s);
                    iLength = core.type.int.mk(iLength);
                    sChar = core.type.str.mk(sChar, " ");

                    //# If we are supposed to bLPad the passed s(tring)
                    if (bLPad) {
                        //# Left pad out this [string] while it's .length is less than the passed iLength
                        while (sReturnVal.length < iLength) {
                            sReturnVal = sChar + sReturnVal;
                        }
                    }
                    //# Else we are supposed to RPad the passed s(tring)
                    else {
                        //# Left pad out this [string] while it's .length is less than the passed iLength
                        while (sReturnVal.length < iLength) {
                            sReturnVal = sReturnVal + sChar;
                        }
                    }

                    return sReturnVal;
                } //# doPad

                //#
                function doSearch(s, vCriteria, bCaseInsenstive, eMode) {
                    var i, iLocation,
                        a_sCriteria = (core.type.arr.is(vCriteria) ? vCriteria : [vCriteria]),
                        bReturnVal = false
                    ;

                    //#
                    s = core.type.str.mk(s);

                    //#
                    if (bCaseInsenstive) {
                        s = s.toLowerCase();
                    }

                    //#
                    for (i = 0; i < a_sCriteria.length; i++) {
                        a_sCriteria[i] = core.type.str.mk(a_sCriteria[i]);
                        iLocation = s.indexOf(bCaseInsenstive ? a_sCriteria[i].toLowerCase() : a_sCriteria[i]);

                        if (iLocation > -1) {
                            switch (eMode) {
                                case 0: { //# begins
                                    bReturnVal = (iLocation === 0);
                                    break;
                                }
                                case -1: { //# ends
                                    bReturnVal = (iLocation + a_sCriteria[i].length === s.length);
                                    break;
                                }
                                default: {
                                    bReturnVal = true;
                                    //break;
                                }
                            }
                        }

                        //#
                        if (bReturnVal) {
                            break;
                        }
                    }

                    return bReturnVal;
                } //# doSearch

                return {
                    /*
                    Function: eq
                    Determines if the passed strings are equal (includes implicit casting and trimming of leading/trailing whitespace).
                    Parameters:
                    s - The first string to compare.
                    t - The second string to compare.
                    (Optional) bCaseInsenstive - Boolean value indicating if the comparison is to be case insenstive.
                    Returns:
                    Boolean value representing if the passed strings are equal.
                    */
                    eq: function (s, t, bCaseInsenstive) {
                        s = core.type.str.mk(s, "");
                        t = core.type.str.mk(t, "");

                        //# Unless specificially told not to, compare the passed string as bCaseInsenstive
                        return (bCaseInsenstive !== false ?
                            (s.toLowerCase() === t.toLowerCase()) :
                            (s === t)
                        );
                    }, //# type.str.eq


                    /*
                    Function: cmp
                    Determines the relationship between the passed strings (implicitly casted, trimmed and compaired as case-insensitive).
                    Parameters:
                    x - The first string to compare.
                    y - The second string to compare.
                    Returns:
                    Truthy value representing `true` if x === y, `false` if x != y or 1 if x matches y (case-insensitive and trimmed).
                    */
                    cmp: function () {
                        var fnReturnVal = function (x, y) {
                            var vReturnVal = false,
                                s1 = core.type.str.mk(x),
                                s2 = core.type.str.mk(y)
                            ;

                            //# If the strings match as-is, reset our vReturnVal to 1
                            if (s1 === s2) {
                                vReturnVal = true;
                            }
                            //# Else if the strings match after .trim'ing and .toLowerCase'ing, reset our vReturnVal to -1
                            else if (s1.trim().toLowerCase() === s2.trim().toLowerCase()) {
                                vReturnVal = 1; //# truthy
                            }

                            return vReturnVal;
                        };

                        //#
                        return core.extend(fnReturnVal, {
                            starts: function (x, q, bTrim) {
                                var sX = (bTrim ? core.type.str.mk(x).trim() : core.type.str.mk(x));
                                return (sX.indexOf(core.type.str.mk(q)) === 0);
                            }, //# type.str.cmp.starts

                            //#
                            ends: function (x, q, bTrim) {
                                var sX = (bTrim ? core.type.str.mk(x).trim() : core.type.str.mk(x)),
                                    sQuery = core.type.str.mk(q)
                                ;

                                return (sX.indexOf(sQuery) === (sX.length - sQuery.length));
                            }, //# type.str.cmp.ends

                            //#
                            any: function (x, a_sQuery, bTrim) {
                                var i,
                                    vReturnVal = false
                                ;

                                //# If the caller passed in a a_sQuery array with values, traverse it looking for the first truthy vReturnVal
                                if (core.type.arr.is(a_sQuery, true)) {
                                    for (i = 0; i < a_sQuery.length; i++) {
                                        vReturnVal = fnReturnVal(x, a_sQuery[i], bTrim);
                                        if (vReturnVal) {
                                            break;
                                        }
                                    }
                                }

                                return vReturnVal;
                            } //# type.str.cmp.any
                        });
                    }(), //# type.str.cmp.*

                    //cp:

                    lpad: function (s, sChar, iLength) {
                        return doPad(s, sChar, iLength, true);
                    }, //# type.str.lpad

                    rpad: function (s, sChar, iLength) {
                        return doPad(s, sChar, iLength, false);
                    }, //# type.str.rpad

                    begins: function (s, vCriteria, bCaseInsenstive) {
                        return doSearch(s, vCriteria, bCaseInsenstive, 1);
                    }, //# type.str.begins

                    ends: function (s, vCriteria, bCaseInsenstive) {
                        return doSearch(s, vCriteria, bCaseInsenstive, -1);
                    }, //# type.str.ends

                    contains: function (s, vCriteria, bCaseInsenstive) {
                        return doSearch(s, vCriteria, bCaseInsenstive /*, 0*/);
                    }, //# type.str.contains

                    sub: function (s, iFromStart, iFromEnd) {
                        var sReturnVal = core.type.str.mk(s),
                            iStart = core.type.int.mk(iFromStart),
                            iEnd = sReturnVal.length - core.type.int.mk(iFromEnd)
                        ;

                        return sReturnVal.substring(
                            (iStart < 0 ? 0 : iStart),
                            (iEnd < 0 ? 0 : iEnd)
                        );
                    } //# type.str.sub
                };
            }(), //# core.type.str

            //# cp
            /*
            fn: {
                //eq:
                //cmp:

                //#
                //#     SEE: https://stackoverflow.com/a/22534864/235704
                cp: function (fn) {
                    var sKey;

                    //#
                    function newFn() {
                        var fnReturnVal, i,
                            sEval = "",
                            a = core.type.fn.convert(arguments)
                        ;

                        //try {
                        //    fnReturnVal = new fn(...a);
                        //} catch (e) {
                            //#
                            if (a.length > 0) {
                                for (i = 0; i < a.length; i++) {
                                    sEval += "a[" + i + "],";
                                }
                                sEval = sEval.substr(0, sEval.length - 1);
                            }

                            //#
                            fnReturnVal = eval("new fn(" + sEval + ")");
                        //}

                        return fnReturnVal;
                    } //# newFn

                    //#
                    function fnReturnVal() {
                        if (this instanceof fnReturnVal) {
                            return newFn.apply(_null, arguments);
                        }
                        return fn.apply(this, arguments);
                    } //# fnReturnVal

                    //#
                    for (sKey in fn) {
                        if (fn.hasOwnProperty(sKey)) {
                            fnReturnVal[sKey] = fn[sKey];
                        }
                    }

                    return fnReturnVal;
                } //# type.fn.cp
            }, //# core.type.fn
            */

            //# cp
            dom: {
                // eq:
                // cmp:

                cp: function (x, bDeepCopy) {
                    if (core.type.dom.is(x) && core.type.fn.is(x.cloneNode)) {
                        return x.cloneNode(core.type.bool.mk(bDeepCopy));
                    }
                } //# type.dom.cp
            }, //# core.type.dom

            //# cmp, cp, unique, matches, randomize, of, countOf, sort
            arr: {
                //eq: function () {}, //# type.arr.eq

                /*
                Function: cmp
                Determines the relationship between the passed arrays (matching values, matching coerced values and matching values in different order).
                Parameters:
                x - The first array to compare.
                y - The second array to compare.
                (Optional) bInOrderOnly - Boolean value indicating if the comparison is to be in matching order only.
                Returns:
                Truthy value representing `true` if x[i] === y[i] in all cases, 1 if x[i] == y[i] in all cases, 2 if x.indexOf(y[i]) !== -1 in all cases or `false` if any value in x is missing from y
                */
                cmp: function (x, y, bInOrderOnly) {
                    var a_vYClone, iIndex, i,
                        vReturnVal = (
                            core.type.arr.is(x) && core.type.arr.is(y) &&
                            x.length === y.length
                        ),
                        iLen = (vReturnVal ? x.length : 0)
                    ;

                    //# If the passed x and y .is.arr and both have the same iLen
                    if (vReturnVal) {
                        //# Traverse the passed arrays, flipping our vReturnVal if an index isn't === or ==
                        for (i = 0; i < iLen; i++) {
                            if (x[i] !== y[i]) {
                                if (x[i] == y[i]) {
                                    vReturnVal = 1;
                                }
                                else {
                                    vReturnVal = (bInOrderOnly ? false : 2);
                                    break;
                                }
                            }
                        }

                        //# If an index didn't match via coercion (e.g. ==) and we're not looking for bInOrderOnly, see if both arrays have the same values in a different order
                        if (vReturnVal === 2) {
                            //# Create a a_vYClone of y
                            //#     NOTE: We have to create a clone as a simple list of found iIndexes won't work because values could be repeated
                            a_vYClone = y.slice(0);

                            //# Traverse x, determining the iIndex in a_vYClone as we go
                            for (i = 0; i < iLen; i++) {
                                iIndex = a_vYClone.indexOf(x[i]);

                                //# If we could not find the current iIndex, flip our vReturnVal and fall from the loop
                                if (iIndex === -1) {
                                    vReturnVal = false;
                                    break;
                                }
                                //# Else remove the iIndex from a_vYClone
                                else {
                                    a_vYClone.splice(iIndex, 1);
                                }
                            }
                        }
                    }

                    return vReturnVal;
                }, //# type.arr.cmp

                cp: function (a, vDeepCopy) {
                    var vCurrent, i,
                        a_vReturnVal /* = _undefined */
                    ;

                    //#
                    vDeepCopy = core.type.int.mk(vDeepCopy, 0);

                    //# If the caller passed in a valid a(rray)
                    if (core.type.arr.is(a)) {
                        //#
                        if (vDeepCopy !== 0) {
                            a_vReturnVal = [];

                            //#
                            for (i = 0; i < a.length; i++) {
                                vCurrent = a[i];

                                if (core.type.arr.is(vCurrent)) {
                                    a_vReturnVal.push(core.type.arr.cp(vCurrent, vDeepCopy - 1));
                                }
                                else if (core.type.obj.is(vCurrent)) {
                                    a_vReturnVal.push(core.type.obj.cp(vCurrent, vDeepCopy - 1));
                                }
                                else if (core.type.date.is(vCurrent)) {
                                    a_vReturnVal.push(core.type.date.cp(vCurrent));
                                }
                                else if (core.type.fn.is(vCurrent)) {
                                    a_vReturnVal.push(core.type.fn.cp(vCurrent));
                                }
                                else if (core.type.dom.is(vCurrent)) {
                                    a_vReturnVal.push(core.type.dom.cp(vCurrent, true));
                                }
                                else {
                                    a_vReturnVal.push(vCurrent);
                                }
                            }
                        }
                        //# Else we don't need to do a vDeepCopy, so set our a_vReturnVal to a .slice'd clone of the a(rray)
                        else {
                            a_vReturnVal = a.slice(0);
                        }
                    }

                    return a_vReturnVal;
                }, //# type.arr.cp

                unique: function (a_vArray, a_vArray2) {
                    if (core.type.arr.is(a_vArray)) {

                        if (arguments.length > 1 && core.type.arr.is(a_vArray2)) {
                            return a_vArray.filter(function (v) {
                                return a_vArray2.indexOf(v) === -1;
                            });
                        }
                        else {
                            return a_vArray.reduce(function (acc, val) {
                                if (acc.indexOf(val) === -1) acc.push(val);
                                return acc;
                            }, []);
                        }
                    }
                }, //# type.arr.unique

                matches: function (a_vArray, a_vArray2) {
                    if (core.type.arr.is(a_vArray) && core.type.arr.is(a_vArray2)) {
                        return a_vArray.filter(function (v) {
                            return a_vArray2.indexOf(v) !== -1;
                        });
                    }
                }, //# type.arr.matches

                randomize: function (a_vArray) {
                    if (core.type.arr.is(a_vArray)) {
                        return a_vArray.sort(function (/*a, b*/) {
                            return Math.random() >= 0.5 ? -1 : 1;
                        });
                    }
                }, //# type.arr.randomize

                /*
                Function: of
                Determines if the passed value is an array of type (based on the passed test function).
                Parameters:
                a - The varient to interrogate.
                fnTest - Function returning true/false that tests each value for type.
                Returns:
                Boolean value representing if the value is an array of type.
                */
                of: function (a, fnTest) {
                    var i,
                        bReturnVal = (core.type.arr.is(a, true) && core.type.fn.is(fnTest))
                    ;

                    //# If the arguments are properly reconized traverse the passed a(rray), fnTest'ing each current value as we go (flipping our bReturnVal and falling from the loop on a failure)
                    if (bReturnVal) {
                        for (i = 0; i < a.length; i++) {
                            if (!fnTest(a[i])) {
                                bReturnVal = false;
                                break;
                            }
                        }
                    }

                    return bReturnVal;
                }, //# type.arr.of

                countOf: function(a_vArray, vValue) {
                    if (core.type.arr.is(a_vArray)) {
                        return a_vArray.filter(function (v) {
                            return v === vValue;
                        }).length;
                    }
                }, //# type.arr.countOf

                sort: function () {
                    //# Natural Sort implementation for feeding into Array.sort()
                    //#     FROM: https://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort/15479354#15479354
                    function naturalCompare(a, b) {
                        var an, bn, nn,
                            ax = [],
                            bx = []
                        ;

                        a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]); });
                        b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]); });

                        while (ax.length && bx.length) {
                            an = ax.shift();
                            bn = bx.shift();
                            nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                            if (nn) return nn;
                        }

                        return (ax.length - bx.length);
                    } //# naturalCompare

                    function natural(a_vArray) {
                        if (core.type.arr.is(a_vArray)) {
                            return a_vArray.sort(naturalCompare);
                        }
                    } //# natural


                    //#
                    return core.extend(natural, {
                        natural: natural
                    });
                }() //# type.arr.sort
            }, //# core.type.arr

            //# cp, clone, toArr, join, mv, rm, has
            obj: function () {
                //#
                function doCopy(oSource, oFromTo, a_sOwnKeys) {
                    var sKey, i,
                        oReturnVal = {}
                    ;

                    for (i = 0; i < a_sOwnKeys.length; i++) {
                        sKey = a_sOwnKeys[i];
                        oReturnVal[oFromTo[sKey]] = oSource[sKey];
                    }

                    return oReturnVal;
                } //# doCopy

                return {
                    //eq: function () {}, //# type.arr.eq

                    //cmp:

                    //#
                    cp: function (o, vDeepCopy) {
                        var oReturnVal /* = _undefined */;

                        //# If the caller passed in a valid o(bject), .extend our oReturnVal as a new .is.obj
                        if (core.type.obj.is(o)) {
                            oReturnVal = (vDeepCopy ?
                                core.extend(vDeepCopy, {}, o) :
                                core.extend({}, o)
                            );
                        }

                        return oReturnVal;
                    }, //# cp

                    //#
                    clone: function (vSource, vKeysOrFromTo) {
                        var i, oFromTo, a_sOwnKeys,
                            vReturnVal /*= undefined*/
                        ;

                        //# If the caller passed in an .is.arr of keys, set it into our a_sOwnKeys
                        if (core.type.arr.is(vKeysOrFromTo)) {
                            a_sOwnKeys = vKeysOrFromTo;

                            //# Traverse a_sOwnKeys, setting each into our (flat) oFromTo definition
                            for (i = 0; i < a_sOwnKeys.length; i++) {
                                oFromTo[a_sOwnKeys[i]] = a_sOwnKeys[i];
                            }
                        }
                        //# Else if the caller passed in a mapping .is.obj, set it into our oFromTo definition and collect a_sOwnKeys
                        else if (core.type.obj.is(vKeysOrFromTo)) {
                            oFromTo = vKeysOrFromTo;
                            a_sOwnKeys = core.type.obj.ownKeys(oFromTo);
                        }

                        //# If vKeysOrFromTo was either an .is.arr or .is.obj
                        if (a_sOwnKeys) {
                            //# If the passed vSource .is.arr, set our vReturnVal to an array
                            if (core.type.arr.is(vSource)) {
                                vReturnVal = [];

                                //# Traverse the vSource, .push'ing each .doCopy into our vReturnVal
                                for (i = 0; i < vSource.length; i++) {
                                    vReturnVal.push(doCopy(vSource[i]), oFromTo, a_sOwnKeys);
                                }
                            }
                            //# Else if the passed vSource .is.obj, .doCopy directly into our vReturnVal
                            else if (core.type.obj.is(vSource)) {
                                vReturnVal = doCopy(vSource, oFromTo, a_sOwnKeys);
                            }
                        }

                        return vReturnVal;
                    }, //# type.obj.clone

                    //#
                    toArr: function (oSource, sSetKeyAs) {
                        var a_vReturnVal, i,
                            bSetKey = core.type.str.is(sSetKeyAs, true),
                            a_sKeys = (core.type.obj.is(oSource) ? Object.keys(oSource) : _undefined)
                        ;

                        //# If the passed oSource .is.obj, traverse its a_sKeys and setup our a_vReturnVal
                        if (a_sKeys) {
                            a_vReturnVal = [];
                            for (i = 0; i < a_sKeys.length; i++) {
                                //#
                                if (oSource.hasOwnProperty(a_sKeys[i])) {
                                    a_vReturnVal.push(oSource[a_sKeys[i]]);

                                    //#
                                    if (bSetKey) {
                                        oSource[a_sKeys[i]][sSetKeyAs] = a_sKeys[i];
                                    }
                                }
                            }
                        }

                        return a_vReturnVal;
                    }, //# type.obj.toArr

                    join: function (oSource, sDelimiter) {
                        var i,
                            a_sOwnKeys = core.type.obj.ownKeys(oSource),
                            sReturnVal = ""
                        ;

                        //#
                        if (a_sOwnKeys) {
                            for (i = 0; i < a_sOwnKeys.length - 1; i++) {
                                sReturnVal += oSource[a_sOwnKeys[i]] + sDelimiter;
                            }
                            sReturnVal += oSource[a_sOwnKeys[i]];
                        }

                        return sReturnVal;
                    }, //# type.obj.join

                    //#
                    mv: function (vSource, oFromTo, bSetToUndefined) {
                        var bReturnVal = core.type.obj.is(oFromTo);

                        //#
                        if (bReturnVal) {
                            bReturnVal = this.processObj(vSource, oFromTo, bSetToUndefined);
                        }

                        return bReturnVal;
                    }, //# type.obj.mv

                    //#
                    has: function (vSource, sKey) {
                        var bReturnVal = false;

                        try {
                            bReturnVal = core.type.fn.call(vSource.hasOwnProperty, this, [sKey]);
                        } catch(e) { core.type.ish.expectedErrorHandler(e); }

                        return bReturnVal;
                    } //# type.obj.has
                };
            }() //# core.type.obj
        };
    }); //# core.type

}(document.getElementsByTagName("HTML")[0].ish);
