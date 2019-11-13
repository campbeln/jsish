//################################################################################################
/** @file Additional Type Functionality mixin for ish.js
 * @mixin ish.type
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
 * @ignore
 */ //############################################################################################
!function () {
    'use strict';

    function init(core) {
        var bServerside = core.config.ish().onServer,                                   //# code-golf
            _root = (bServerside ? global : window),                                    //# code-golf
            _undefined /*= undefined*/,                                                 //# code-golf
            _null = null                                                                //# code-golf
        ;

        //################################################################################################
        /** Collection of additional Type-based functionality.
         * @namespace ish.type
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.type, function (/*oProtected*/) {
            var oReturnVal = {
                //#
                is: {
                    //#########
                    /** Determines if the passed value is truthy.
                     * @function ish.type.is.truthy
                     * @param {variant} x Value to interrogate.
                     * @returns {boolean} Value representing if the passed value is truthy.
                     */ //#####
                    truthy: function (x) {
                        return (
                            x !== 0 &&
                            x !== "" &&
                            x !== NaN &&
                            x !== _null &&
                            x !== false &&
                            x !== _undefined
                        );
                    }, //# type.is.truthy


                    numeric: {
                        //#########
                        /** Determines if the passed values are equal.
                         * @$note The passed values are implicitly casted per the Javascript rules (see: {@link ish.type.int.mk}).
                         * @function ish.type.is.numeric:eq
                         * @param {variant} x Value to interrogate.
                         * @param {variant} y Value to interrogate.
                         * @returns {boolean} Value representing if the passed values are equal.
                         */ //#####
                        eq: function (x, y) {
                            var bReturnVal = false;

                            //# If the passed x and y .is.numeric, .mk them .floats and reset our bReturnVal to their comparison
                            if (core.type.is.numeric(x) && core.type.is.numeric(y)) {
                                bReturnVal = (core.type.float.mk(x) === core.type.float.mk(y));
                            }

                            return bReturnVal;
                        }, //# type.is.numeric.eq


                        //#########
                        /** Compares the passed value to the reference value, determining if it is greater then, less then or equal.
                         * @function ish.type.is.numeric:cmp
                         * @param {variant} vNumber Value representing the number to compare.
                         * @param {variant} vRelativeTo Value representing the relative number to compare to.
                         * @returns {integer} Value representing if the passed value is greater then (<code>1</code>), less then (<code>-1</code>) or equal to (<code>0</code>) the passed relative value with <code>undefined</code> indicating one of the passed values was non-numeric.
                         */ //#####
                        cmp: function (vNumber, vRelativeTo) {
                            var iReturnVal = _undefined,
                                dX = core.type.float.mk(vNumber, _null),
                                dY = core.type.float.mk(vRelativeTo, _null)
                            ;

                            if (core.type.is.numeric(dX) && core.type.is.numeric(dY)) {
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
                        } //# type.is.numeric.cmp
                    } //# type.is.numeric
                }, //# core.type.is


                //#########
                /** Determines if the passed value is one of the reference values.
                 * @function ish.type.any
                 * @param {variant} x Value to interrogate.
                 * @param {variant[]} a_vReferenceValues Value representing the reference values to compare to.
                 * @param {boolean} [bUseCoercion=false] Value representing if coercion is to be used during comparisons.
                 * @returns {boolean} Value representing if the passed value is present in the reference values.
                 */ //#####
                any: function (x, a_vReferenceValues, bUseCoercion) {
                    var i,
                        fnTest = (bUseCoercion === true ?
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
                    if (core.type.arr.is(a_vReferenceValues, true)) {
                        for (i = 0; i < a_vReferenceValues.length; i++) {
                            if (fnTest(x, a_vReferenceValues[i])) {
                                bReturnVal = true;
                                break;
                            }
                        }
                    }

                    return bReturnVal;
                }, //# core.type.any


                //#########
                /** Queries the passed value.
                 * @function ish.type.query
                 * @param {variant[]|object} vCollection Value representing the collection to interrogate.
                 * @param {variant[]|object} vQuery Value representing the query.
                 * @param {object} [oOptions] Value representing the following options:
                 *      @param {boolean} [oOptions.firstEntryOnly=false] Value representing if only the first result is to be returned.
                 *      @param {boolean} [oOptions.caseInsensitive=false] Value representing if the keys are to be searched for in a case-insensitive manor.
                 *      @param {boolean} [oOptions.useCoercion=false] Value representing if coercion is to be used during comparisons.
                 *      @param {boolean} [oOptions.or=false] Value representing if multiple entries within the passed query are to be considered <code>or</code> rather than <code>and</code>.
                 *      @param {boolean} [oOptions.setKeyAs="$key"] Value representing the property name of the key set by <code>{@link ish.type.obj.toArr}</code> if the passed value is converted from an <code>object</code> to an <code>array</code>.
                 * @returns {variant[]|variant} Value representing the passed values that matched the query.
                 */ //#####
                query: function () {
                    //#
                    function doQuery(sKey, vQueryValue, oSource, oOptions) {
                        var vTestValue = (oOptions.caseInsensitive ? core.type.obj.get(oSource, sKey) : core.resolve(oSource, sKey)),
                            bReturnVal = false
                        ;

                        //# Else if the vQueryValue .is .fn, call it with fn(vTestValue, oOptions)
                        if (core.type.fn.is(vQueryValue)) {
                            bReturnVal = vQueryValue(vTestValue, oSource, oOptions);
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
                    //# [{}, {}] = core.type.query([{}, {}], { key: "val", key2: ["val1", "val2"], "path.to.key3": function(vTestValue, oSourceIndex, oOptions) { return true || false; } })
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

                        //# .extend the passed oOptions with the defaults (which also ensures the passed oOptions .is .obj)
                        oOptions = core.extend({
                            firstEntryOnly: false,
                            caseInsensitive: false,
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

                                        //# If we have an .is .arr of vQuery values to traverse, do so now
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
                //####

                //#########
                /** Generates a v4 Universally Unique Identifier (UUIDv4).
                 * @function ish.type.uuid
                 * @returns {boolean} Value representing UUIDv4.
                 */ //#####
                uuid: function() {
                    var fnReturnValue, d;

                    //# If _root.Uint8Array and _root.crypto are available, use them in our fnReturnValue
                    if (core.type.fn.is(_root.Uint8Array) && core.type.fn.is(core.resolve(_root, "crypto.getRandomValues"))) {
                        fnReturnValue = function () {
                            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
                                return (c ^ _root.crypto.getRandomValues(new _root.Uint8Array(1))[0] & 15 >> c / 4).toString(16);
                            });
                        };
                    }
                    //# Else something went wrong using the ES6 approach, so fall back to the old skool way
                    else {
                        d = (
                            Date.now() + (core.type.fn.call(core.resolve(_root, "performance.now")) || 0)
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
                                iPrefNow = (core.type.fn.is(core.resolve(_root, "performance.now")) ? _root.performance.now() : 0),
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

                //####
                //####

                //# eq, cmp, cp, age, yyyymmdd, only
                date: {
                    //#########
                    /** Determines if the passed values are equal.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.eq
                     * @param {variant} x Value to interrogate.
                     * @param {variant} y Value to interrogate.
                     * @returns {boolean} Value representing if the passed values are equal.
                     * @see {@link http://stackoverflow.com/a/493018/235704|StackOverflow.com}
                     */ //#####
                    eq: function (x, y) {
                        var dDateX = core.type.date.mk(x, _null);
                        var dDateY = core.type.date.mk(y, _null);

                        //#     NOTE: `new Date("1970/01/01") === new Date("1970/01/01")` is always false as they are 2 different objects, while <= && >= will give the expected result
                        //#     SEE: Comment from Jason Sebring @ http://stackoverflow.com/a/493018/235704
                        return (core.type.date.is(dDateX) && core.type.date.is(dDateY) && dDateX <= dDateY && dDateX >= dDateY);
                    }, //# type.date.eq


                    //#########
                    /** Compares the passed value to the reference value, determining if it is greater then, less then or equal.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.cmp
                     * @param {variant} vDate Value representing the date to compare.
                     * @param {variant} [vRelativeTo=new Date()] Value representing the relative date to compare to.
                     * @returns {integer} Value representing if the passed value is greater then (<code>1</code>), less then (<code>-1</code>) or equal to (<code>0</code>) the passed relative value with <code>undefined</code> indicating one of the passed values was not a reconized date.
                     */ //#####
                    cmp: function (vDate, vRelativeTo) {
                        var iReturnVal = _undefined,
                            dDateX = core.type.date.mk(vDate, _null),
                            dDateY = (arguments.length < 2 ? new Date() : core.type.date.mk(vRelativeTo, _null))
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


                    //#########
                    /** Copies the passed value into a new instance.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.cp
                     * @param {variant} vDate Value representing the date to copy.
                     * @returns {date} Value representing the passed value as a new instance.
                     */ //#####
                    cp: function (vDate) {
                        var dReturnVal, // = _undefined
                            dParsed = core.type.date.mk(vDate, _null)
                        ;

                        //# If the caller passed in a valid d(ate),
                        if (core.type.date.is(dParsed)) {
                            dReturnVal = new Date(dParsed.getTime());
                        }

                        return dReturnVal;
                    }, //# type.date.cp


                    //#########
                    /** Determines the full years since the passed value.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.age
                     * @param {variant} vDOB Value representing the date of birth.
                     * @returns {integer} Value representing the full years since the passed value.
                     */ //#####
                    age: function (vDOB) {
                        var dAgeSpan,
                            dDOB = core.type.date.mk(vDOB, _null),
                            iReturnVal = -1
                        ;

                        //# If the passed dob is a valid date
                        if (core.type.date.is(dDOB)) {
                            //# Set dAgeSpan based on the milliseconds from epoch
                            dAgeSpan = new Date(_Date_now() - core.type.date.mk(dDOB, _null));
                            iReturnVal = Math.abs(dAgeSpan.getUTCFullYear() - 1970);
                        }

                        return iReturnVal;
                    }, //# date.age


                    //#########
                    /** Determines the date of the passed value formatted as <code>YYYY/MM/DD</code>.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.yyyymmdd
                     * @param {variant} [vDate=new Date()] Value representing the date.
                     * @param {variant} [vDefault=undefined] Value representing the default return value if casting fails.
                     * @param {string} [sDelimiter="/"] Value representing the date delimiter.
                     * @returns {integer} Value representing the passed value formatted as <code>YYYY/MM/DD</code>.
                     */ //#####
                    yyyymmdd: function (vDate, vDefault, sDelimiter) {
                        var dDate = core.type.date.mk(vDate, (arguments.length > 1 ? vDefault : new Date()));

                        sDelimiter = core.type.str.mk(sDelimiter, "/");

                        return (core.type.date.is(dDate) ?
                            dDate.getFullYear() + sDelimiter + core.type.str.lpad((dDate.getMonth() + 1), "0", 2) + sDelimiter + core.type.str.lpad(dDate.getDate(), "0", 2) :
                            ""
                        );
                        //dCalDate.getHours() + ':' + core.type.str.mk(dCalDate.getMinutes()).lPad("0", 2) + ':' + core.type.str.mk(dCalDate.getSeconds()).lPad("0", 2)
                    }, //# date.yyyymmdd


                    //#########
                    /** Determines the date part only of the passed value.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.only
                     * @param {variant} [vDate=new Date()] Value representing the date.
                     * @param {variant} [vDefault=undefined] Value representing the default return value if casting fails.
                     * @returns {integer} Value representing the date part only of the passed value.
                     */ //#####
                    only: function (vDate, vDefault) {
                        return core.type.date.mk(core.type.date.yyyymmdd.apply(this, [vDate, vDefault]) + " 00:00:00");
                    }, //# date.only


                    //#########
                    /** Resets the datetime offset of the passed value to the local system's datetime offset.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.fixOffset
                     * @param {variant} [vDate=new Date()] Value representing the date.
                     * @returns {integer} Value representing the passed value reset to the local system's datetime offset.
                     */ //#####
                    //# TODO: Verify this works as expected
                    fixOffset: function (vDate) {
                        var dDate = core.type.date.mk(vDate);

                        return new Date(
                            dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate(),
                            dDate.getUTCHours(), dDate.getUTCMinutes(), dDate.getUTCSeconds()
                        );
                    }
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
                    function doSearch(s, a_vReference, fnTest) {
                        var i, bResult,
                            bReturnVal = false
                        ;

                        //#
                        for (i = 0; i < a_vReference.length; i++) {
                            bResult = doSearchCompare(s, a_vReference[i], fnTest);

                            //#
                            if (bResult === true) {
                                bReturnVal = iResult;
                                break;
                            }
                            else if (bResult !== false) {
                                bReturnVal = iResult;
                            }
                        }

                        return bReturnVal;
                    } //# doSearch

                    //#
                    function doSearchCompare(x, q, fnTest) {
                        var sX = core.type.str.mk(x),
                            sReference = core.type.str.mk(q),
                            bReturnVal = false
                        ;

                        //# If the passed s(tring) .starts with sReference, set our bReturnVal to true
                        if (fnTest(sX.indexOf(sReference), sX.length, sReference.length)) {
                            bReturnVal = true;
                        }
                        //# Else if the passed s(tring) .starts with sReference after .trim'ing and .toLowerCase'ing, set our bReturnVal to 1 (truthy)
                        else {
                            sX = sX.trim().toLowerCase();
                            sReference.trim().toLowerCase();
                            if (fnTest(sX.indexOf(sReference), sX.length, sReference.length)) {
                                bReturnVal = 1;
                            }
                        }

                        return bReturnVal;
                    } //# doSearchCompare


                    return {
                        //#########
                        /** Determines if the passed values are equal.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.eq
                         * @param {variant} s Value to interrogate.
                         * @param {variant} t Value to interrogate.
                         * @param {boolean} [bCaseInsensitive=true] Value representing if the keys are to be searched for in a case-insensitive manor.
                         * @returns {boolean} Value representing if the passed values are equal.
                         */ //#####
                        eq: function (s, t, bCaseInsensitive) {
                            s = core.type.str.mk(s, "");
                            t = core.type.str.mk(t, "");

                            //# Unless specifically told not to, compare the passed string as bCaseInsensitive
                            return (bCaseInsensitive !== false ?
                                (s.toLowerCase() === t.toLowerCase()) :
                                (s === t)
                            );
                        }, //# type.str.eq


                        //#########
                        /** Compares the passed value to the reference value(s), determining if it is equal, equal when case-insensitive and trimmed or not equal.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.cmp
                         * @param {variant} s Value representing the string to compare.
                         * @param {variant|variant[]} [vReference] Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value is equal (<code>true</code>), equal when case-insensitive and trimmed (<code>1</code>) or not equal (<code>false</code>) to the passed relative value.
                         */ //#####
                        cmp: function () {
                            //# .compare's two strings, returning truthy or false based on their relationship
                            function compare(x, y) {
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
                            } //# compare


                            return function (s, vRelativeTo) {
                                var i,
                                    bReturnVal = false
                                ;

                                //# If the passed vRelativeTo .is an .arr, traverse it, bReturnVal'ing on the first .compare hit
                                if (core.type.arr.is(vRelativeTo)) {
                                    for (i = 0; i < vRelativeTo.length; i++) {
                                        bReturnVal = compare(s, vRelativeTo[i]);
                                        if (bReturnVal) {
                                            break;
                                        }
                                    }
                                }
                                //# Else the passed vReference .is not an .arr, so bReturnVal the result of .compare
                                else {
                                    bReturnVal = compare(s, vReference);
                                }

                                return bReturnVal;
                            };
                        }(), //# type.str.cmp.*

                        //cp:

                        //#########
                        /** Prepends the passed character onto the passed value to a minimum length.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.lpad
                         * @param {variant} s Value representing the string to pad.
                         * @param {string} sChar Value representing the character to pad with.
                         * @param {integer} iLength Value representing the minimum length to pad to.
                         * @returns {string} Value representing the passed value prepended with the pad character to the minimum length.
                         */ //#####
                        lpad: function (s, sChar, iLength) {
                            return doPad(s, sChar, iLength, true);
                        }, //# type.str.lpad


                        //#########
                        /** Appends the passed character onto the passed value to a minimum length.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.rpad
                         * @param {variant} s Value representing the string to pad.
                         * @param {string} sChar Value representing the character to pad with.
                         * @param {integer} iLength Value representing the minimum length to pad to.
                         * @returns {string} Value representing the passed value appended with the pad character to the minimum length.
                         */ //#####
                        rpad: function (s, sChar, iLength) {
                            return doPad(s, sChar, iLength, false);
                        }, //# type.str.rpad


                        //#########
                        /** Compares the passed value to the reference value, determining if it begins with, begins with when case-insensitive and trimmed or does not begin with the reference value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.starts
                         * @param {variant} s Value representing the string to compare.
                         * @param {variant|variant[]} [vReference] Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value begins with (<code>true</code>), begins with when case-insensitive and trimmed (<code>1</code>) or does not begin with (<code>false</code>) to the passed reference value.
                         */ //#####
                        begins: function (s, vReference) {
                            return doSearch(s, core.type.arr.mk(vReference, [vReference]), function (iIndexOf /*, iS, iReference*/) {
                                return (iIndexOf === 0);
                            });
                        }, //# type.str.begins


                        //#########
                        /** Compares the passed value to the reference value, determining if it ends with, ends with when case-insensitive and trimmed or does not end with the reference value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.ends
                         * @param {variant} s Value representing the string to compare.
                         * @param {variant|variant[]} [vReference] Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value ends with (<code>true</code>), ends with when case-insensitive and trimmed (<code>1</code>) or does not end with (<code>false</code>) to the passed reference value.
                         */ //#####
                        ends: function (s, vReference) {
                            return doSearch(s, core.type.arr.mk(vReference, [vReference]), function (iIndexOf, iS, iReference) {
                                return (iIndexOf === (iS - iReference));
                            });
                        }, //# type.str.ends


                        //#########
                        /** Compares the passed value to the reference value, determining if it ends with, ends with when case-insensitive and trimmed or does not end with the reference value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.ends
                         * @param {variant} s Value representing the string to compare.
                         * @param {variant|variant[]} [vReference] Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value ends with (<code>true</code>), ends with when case-insensitive and trimmed (<code>1</code>) or does not end with (<code>false</code>) to the passed reference value.
                         */ //#####
                        contains: function (s, vReference) {
                            return doSearch(s, core.type.arr.mk(vReference, [vReference]), function (iIndexOf /*, iS, iReference*/) {
                                return (iIndexOf > -1);
                            });
                        }, //# type.str.contains


                        //#########
                        /** Removes the referenced leading and trailing characters from the passed value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.sub
                         * @param {variant} s Value representing the string.
                         * @param {integer} iFromStart Value representing the number of characters to remove from the beginning of the passed value.
                         * @param {integer} iFromEnd Value representing the number of characters to remove from the end of the passed value.
                         * @returns {string} Value representing the remaining characters from the passed value.
                         */ //#####
                        sub: function (s, iFromStart, iFromEnd) {
                            var sReturnVal = core.type.str.mk(s),
                                iStart = core.type.int.mk(iFromStart),
                                iEnd = sReturnVal.length - core.type.int.mk(iFromEnd)
                            ;

                            return sReturnVal.substring(
                                (iStart < 0 ? 0 : iStart),
                                (iEnd < 0 ? 0 : iEnd)
                            );
                        }, //# type.str.sub


                        //#########
                        /** Interpolates variables within the passed value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.replace
                         * @param {variant} s Value representing the string.
                         * @param {object} oData Value representing the data to interpolate within the passed value.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {RegExp} [oOptions.pattern] Value representing the regular expression that defines the interpolation delimiters.
                         *      @param {boolean} [oOptions.start="{"] Value representing the leading interpolation delimiter.
                         *      @param {boolean} [oOptions.end="}"] Value representing the trailing interpolation delimiter.
                         * @returns {string} Value representing the results of the passed value's interpolation.
                         */ //#####
                        replace: function() {
                            var rePattern = /{([^{]+)}/g;

                            return function(s, oData, oOptions) {
                                var reCurrentPattern, vCurrent;

                                //#
                                s = core.type.str.mk(s);
                                oData = core.type.obj.mk(oData);
                                oOptions = core.type.obj.mk(oOptions);
                                reCurrentPattern = oOptions.pattern || rePattern;

                                //#
                                if (oOptions.start && oOptions.end) {
                                    reCurrentPattern = new RegExp(oOptions.start + "([^" + oOptions.start + "]+)" + oOptions.end, "g");
                                }

                                return s.replace(reCurrentPattern, function(ignore, sKey) {
                                    vCurrent = core.resolve(oData, sKey);

                                    return (core.type.fn.is(vCurrent) ?
                                        vCurrent() :
                                        core.type.str.mk(vCurrent)
                                    );
                                });
                            }
                        }() //# type.str.replace
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
                //*/

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

                        //# If the passed x and y .is .arr and both have the same iLen
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
                        vDeepCopy = core.type.int.mk((vDeepCopy === true ? -1 : vDeepCopy), 0);

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

                    unique: function (a_vArray, a_vArray2, bCaseInsensitive) {
                        bCaseInsensitive = (bCaseInsensitive === true || a_vArray2 === true);

                        if (core.type.arr.is(a_vArray)) {
                            if (core.type.arr.is(a_vArray2)) {
                                return a_vArray.filter(function (v) {
                                    return (a_vArray2.indexOf(v) === -1 && (!bCaseInsensitive || a_vArray2.indexOf((v + "").toLowerCase()) === -1));
                                });
                            }
                            else {
                                return a_vArray.reduce(function (acc, v) {
                                    if (acc.indexOf(v) === -1 && (!bCaseInsensitive || acc.indexOf((v + "").toLowerCase()) === -1)) {
                                        acc.push(v);
                                    }
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
                    a - The variant to interrogate.
                    fnTest - Function returning true/false that tests each value for type.
                    Returns:
                    Boolean value representing if the value is an array of type.
                    */
                    of: function (a, fnTest) {
                        var i,
                            bReturnVal = (core.type.arr.is(a, true) && core.type.fn.is(fnTest))
                        ;

                        //# If the arguments are properly recognized traverse the passed a(rray), fnTest'ing each current value as we go (flipping our bReturnVal and falling from the loop on a failure)
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

                    extract: function (a_oObj, vPath) {
                        var i, o_vReturnVal;

                        //#
                        if (core.type.arr.is(a_oObj)) {
                            o_vReturnVal = [];
                            for (i = 0; i < a_oObj.length; i++) {
                                o_vReturnVal.push(core.resolve(a_oObj, vPath));
                            }
                        }

                        return o_vReturnVal
                    }, //# type.arr.ofKey

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

                        function natural(a_vArray, bReverse) {
                            if (core.type.arr.is(a_vArray)) {
                                var a_vReturnVal = a_vArray.slice(0).sort(naturalCompare);
                                return (bReverse === true ? a_vReturnVal.reverse() : a_vReturnVal);
                            }
                        } //# natural

                        //#
                        function orderBy(a_vArray, vOptions) {
                            var a_vReturnVal /*= undefined*/,
                                oOptions = core.type.obj.mk(vOptions),
                                sPath = core.type.str.mk(oOptions.path),
                                bReverse = (oOptions.reverse === true),
                                fnCompare = core.type.fn.mk(oOptions.compare, function (a, b) {
                                    var vA = core.resolve(a, sPath),
                                        vB = core.resolve(b, sPath)
                                    ;

                                    return (
                                        vA > vB ? (bReverse ? -1 : 1) :
                                        vA < vB ? (bReverse ? 1 : -1) :
                                        0
                                    );
                                })
                            ;

                            //# If the caller passed in a valid arr.is
                            if (core.type.arr.is(a_vArray, true)) {
                                //# Clone the a_vArray into our a_vReturnVal
                                a_vReturnVal = a_vArray.slice(0);
                                a_vReturnVal.sort(fnCompare);
                            }

                            return a_vReturnVal;
                        } //# orderBy


                        //#
                        return core.extend(natural, {
                            natural: natural,
                            by: orderBy
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

                    function objCompare(oOptions) {
                        var fnCompares = [];

                        //#
                        fnCompares.push(
                            oOptions.useCoercion ?
                            function (vSource, vCompare) { return vSource == vCompare; } :
                            function (vSource, vCompare) { return vSource === vCompare; }
                        );
                        fnCompares.push(
                            oOptions.caseInsensitive ? (
                                oOptions.trim ?
                                function (vSource, vCompare) { return core.type.str.is(vSource) && core.type.str.cmp(vSource, vCompare); } :
                                function (vSource, vCompare) { return core.type.str.is(vSource) && core.type.str.ep(vSource, vCompare, true); }
                            ) : (
                                oOptions.trim ?
                                function (vSource, vCompare) { return core.type.str.is(vSource) && core.type.str.mk(vSource).trim() === core.type.str.mk(vCompare).trim(); } :
                                function (vSource, vCompare) { return core.type.str.is(vSource) && core.type.str.mk(vSource) === core.type.str.mk(vCompare); }
                            )
                        );

                        //# If we are still to recurse, setup the fnCompares to do so
                        if (core.type.int.is(oOptions.maxDepth) && oOptions.maxDepth !== 0) {
                            fnCompares.push(
                                function (vSource, vCompare) {
                                    return core.type.obj.is(vSource) &&
                                        core.type.obj.eq(vSource, vCompare, core.extend({}, oOptions, { maxDepth: oOptions.maxDepth - 1 }))
                                    ;
                                }
                            );
                        }

                        //# If there is a .compare .fn in the oOptions, .push it into the fnCompares
                        if (core.type.fn.is(oOptions.compare)) {
                            fnCompares.push(oOptions.compare);
                        }

                        //# Return the comparison wrapper function to the caller
                        return function (vSource, vCompare) {
                            var i,
                                bReturnVal = false
                            ;

                            //#
                            for (i = 0; i < fnCompares.length; i++) {
                                if (fnCompares[i](vSource, vCompare)) {
                                    bReturnVal = true;
                                    break;
                                }
                            }

                            return bReturnVal;
                        };
                    } //# objCompare

                    return {
                        //#
                        eq: function (oSource, oCompare, oOptions) {
                            var i,
                                a_sSourceKeys = core.type.obj.ownKeys(oSource),
                                a_sCompareKeys = core.type.obj.ownKeys(oCompare),
                                bReturnVal = false
                            ;

                            //# If both oSource and oCompare's .ownkeys match (ignoring the order of the respective arrays)
                            if (core.type.arr.cmp(a_sSourceKeys, a_sCompareKeys /*, false*/)) {
                                //# Set the defaults for the passed oOptions (forcing it into an .is .obj as we go) then calculate our fnCompare
                                oOptions = core.extend({
                                    //compare: core.type.fn.noop,
                                    useCoercion: true,
                                    caseInsensitive: false,
                                    trim: false,
                                    maxDepth: 0
                                }, oOptions);
                                fnCompare = objCompare(oOptions);
                                bReturnVal = true;

                                //#
                                for (i = 0; i < a_sSourceKeys.length; i++) {
                                    if (!fnCompare(oSource[a_sSourceKeys[i]], oCompare[a_sSourceKeys[i]])) {
                                        bReturnVal = false;
                                        break;
                                    }
                                }
                            }

                            return bReturnVal;
                        }, //# type.obj.eq

                        //cmp:

                        //#
                        cp: function (o, vDeepCopy) {
                            var oReturnVal /* = _undefined */;

                            //# If the caller passed in a valid o(bject), .extend our oReturnVal as a new .is .obj
                            if (core.type.obj.is(o)) {
                                oReturnVal = (vDeepCopy ?
                                    core.extend(vDeepCopy, {}, o) :
                                    core.extend({}, o)
                                );
                            }

                            return oReturnVal;
                        }, //# type.obj.cp

                        //#
                        clone: function (vSource, vKeysOrFromTo) {
                            var i, a_sOwnKeys,
                                oFromTo = {},
                                vReturnVal /*= undefined*/
                            ;

                            //#
                            if (core.type.str.is(vKeysOrFromTo)) {
                                vKeysOrFromTo = [vKeysOrFromTo];
                            }

                            /*
                            //# If the caller passed in an .is .arr of keys, set it into our a_sOwnKeys
                            //#     NOTE: `core.type.obj.is` returns true for arrays, so this test must come first
                            if (core.type.arr.is(vKeysOrFromTo)) {
                                a_sOwnKeys = vKeysOrFromTo;
                                oFromTo = {};

                                //# Traverse a_sOwnKeys, setting each into our (flat) oFromTo definition
                                for (i = 0; i < a_sOwnKeys.length; i++) {
                                    oFromTo[a_sOwnKeys[i]] = a_sOwnKeys[i];
                                }
                            }
                            //# Else if the caller passed in a mapping .is .obj, set it into our oFromTo definition and collect a_sOwnKeys
                            else if (core.type.obj.is(vKeysOrFromTo)) {
                                oFromTo = vKeysOrFromTo;
                                a_sOwnKeys = core.type.obj.ownKeys(oFromTo);
                            }
                            */

                            //# If the caller passed in a mapping .is .obj, set it into our oFromTo definition and collect a_sOwnKeys
                            if (core.type.obj.is(vKeysOrFromTo, { strict: true })) {
                                oFromTo = vKeysOrFromTo;
                                a_sOwnKeys = core.type.obj.ownKeys(oFromTo);
                            }
                            //# Else
                            else {
                                //# if the caller passed in an .is .arr of keys, set it into our a_sOwnKeys
                                if (core.type.arr.is(vKeysOrFromTo)) {
                                    a_sOwnKeys = vKeysOrFromTo;
                                }
                                //#
                                else if (core.type.obj.is(vSource)) {
                                    a_sOwnKeys = core.type.obj.ownKeys(vSource);
                                }

                                //#
                                if (a_sOwnKeys) {
                                    //# Traverse a_sOwnKeys, setting each into our (flat) oFromTo definition
                                    for (i = 0; i < a_sOwnKeys.length; i++) {
                                        oFromTo[a_sOwnKeys[i]] = a_sOwnKeys[i];
                                    }
                                }
                            }

                            //# If vKeysOrFromTo was either an .is .arr or .is .obj
                            if (a_sOwnKeys) {
                                //# If the passed vSource .is .arr, set our vReturnVal to an array
                                if (core.type.arr.is(vSource)) {
                                    vReturnVal = [];

                                    //# Traverse the vSource, .push'ing each .doCopy into our vReturnVal
                                    for (i = 0; i < vSource.length; i++) {
                                        vReturnVal.push(doCopy(vSource[i], oFromTo, a_sOwnKeys));
                                    }
                                }
                                //# Else if the passed vSource .is .obj, .doCopy directly into our vReturnVal
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

                            //# If the passed oSource .is .obj, traverse its a_sKeys and setup our a_vReturnVal
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

                        //#
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
                        has: function (vSource, vKeys, bKeysArePaths) {
                            var i,
                                a_sKeys = (core.type.arr.is(vKeys) ? vKeys : [vKeys]),
                                bReturnVal = (vSource && core.type.fn.is(vSource.hasOwnProperty))
                            ;

                            //# If the vSource is valid
                            if (bReturnVal) {
                                //# If the bKeysArePaths traverse the a_sKeys accordingly
                                if (bKeysArePaths) {
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        //# If the current a_sKeys doesn't .existed in vSource, unflip our bReturnVal and fall from the loop
                                        if (!core.resolve(core.resolve.returnMetadata, vSource, a_sKeys[i]).existed) {
                                            bReturnVal = false;
                                            break;
                                        }
                                    }
                                }
                                //# Else we just have to traverse the a_sKeys as-is
                                else {
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        //# If this a_sKeys isn't a .hasOwnProperty of vSource, unflip our bReturnVal and fall from the loop
                                        if (!vSource.hasOwnProperty(a_sKeys[i])) {
                                            bReturnVal = false;
                                            break;
                                        }
                                    }
                                }
                            }

                            return bReturnVal;
                        }, //# type.obj.has

                        //#
                        prune: function (o, a_sAddlKeysToPrune) {
                            var sCurrentKey, i,
                                a_sOwnKeys = core.type.obj.ownKeys(o),
                                oReturnVal = core.type.obj.empty()
                            ;

                            //#
                            a_sAddlKeysToPrune = core.type.arr.mk(a_sAddlKeysToPrune);

                            //#
                            for (i = 0; i < a_sOwnKeys.length; i++) {
                                sCurrentKey = a_sOwnKeys[i];

                                if (o[sCurrentKey] !== _undefined && a_sAddlKeysToPrune.indexOf(sCurrentKey) === -1) {
                                    oReturnVal[sCurrentKey] = o[sCurrentKey];
                                }
                            }

                            return oReturnVal;
                        }, //# type.obj.prune

                        //#
                        diff: function (oSource, oCompare, oOptions) {
                            var fnCompare, i,
                                a_sSourceKeys = core.type.obj.ownKeys(oSource),
                                a_sCompareKeys = core.type.obj.ownKeys(oCompare),
                                oReturnVal = core.type.obj.empty()
                            ;

                            //# If we have a_sSourceKeys and a_sCompareKeys (which also determines that the passed oSource and oCompare .is .obj)
                            if (core.type.arr.is(a_sSourceKeys) && core.type.arr.is(a_sCompareKeys)) {
                                //# Set the defaults for the passed oOptions (forcing it into an .is .obj as we go) then calculate our fnCompare
                                oOptions = core.extend({
                                    //compare: core.type.fn.noop,
                                    useCoercion: true,
                                    caseInsensitive: true,
                                    trim: true,
                                    includeMissingKeys: true,
                                    caseInsensitiveKeys: true,
                                    pruneUndefinedValues: false
                                }, oOptions, { maxDepth: null });
                                fnCompare = objCompare(oOptions);

                                //# If we are to find .caseInsensitiveKeys, use core.type.obj.get to resolve each a_sSourceKeys
                                if (oOptions.caseInsensitiveKeys) {
                                    //# Traverse the a_sSourceKeys, fnCompare'ing the passed oSource to the oCompare (loading any mismatches into our oReturnVal) as we go
                                    for (i = 0; i < a_sSourceKeys.length; i++) {
                                        if (!fnCompare(core.type.obj.get(oSource, a_sSourceKeys[i]), core.type.obj.get(oCompare, a_sSourceKeys[i]))) {
                                            oReturnVal[a_sSourceKeys[i]] = oCompare[a_sSourceKeys[i]];
                                        }

                                        //# .rm the current a_sSourceKeys from our a_sCompareKeys
                                        core.type.arr.rm(a_sCompareKeys, a_sSourceKeys[i]);
                                    }
                                }
                                //# Else the a_sSourceKeys are case sensitive, so resolve each a_sSourceKeys normally
                                else {
                                    //# Traverse the a_sSourceKeys, fnCompare'ing the passed oSource to the oCompare (loading any mismatches into our oReturnVal) as we go
                                    for (i = 0; i < a_sSourceKeys.length; i++) {
                                        if (!fnCompare(oSource[a_sSourceKeys[i]], oCompare[a_sSourceKeys[i]])) {
                                            oReturnVal[a_sSourceKeys[i]] = oCompare[a_sSourceKeys[i]];
                                        }

                                        //# .rm the current a_sSourceKeys from our a_sCompareKeys
                                        core.type.arr.rm(a_sCompareKeys, a_sSourceKeys[i]);
                                    }
                                }

                                //# If we are to .includeMissingKeys, traverse any remaining a_sCompareKeys and set them into our oReturnVal
                                if (oOptions.includeMissingKeys) {
                                    for (i = 0; i < a_sCompareKeys.length; i++) {
                                        oReturnVal[a_sCompareKeys[i]] = oCompare[a_sCompareKeys[i]];
                                    }
                                }
                            }

                            return (oOptions.pruneUndefinedValues ? core.type.obj.prune(oReturnVal) : oReturnVal);
                        },

                        //#
                        resolveFirst: function (oObject, a_vPaths) {
                            var i, oResolved,
                                vReturnVal /*= undefined */
                            ;

                            //# If the caller passed in valid arguments, traverse the a_vPaths
                            if (core.type.obj.is(oObject) && core.type.arr.is(a_vPaths, true)) {
                                for (i = 0; i < a_vPaths.length; i++) {
                                    //# .resolve the current a_vPaths, .returnMetadata'ing into oResolved
                                    oResolved = core.resolve(core.resolve.returnMetadata, oObject, a_vPaths[i]);

                                    //# If the current a_vPaths .existed, reset our vReturnVal and fall from the loop
                                    if (oResolved.existed) {
                                        vReturnVal = oResolved.value;
                                        break;
                                    }
                                }
                            }

                            return vReturnVal;
                        }, //# type.obj.resolveFirst

                        //# No object properties exist until you add them
                        //#     FROM: https://davidwalsh.name/javascript-tricks
                        empty: function () {
                            return Object.create(_null);
                        } //# type.obj.empty
                    };
                }() //# core.type.obj
            };

            //#
            if (!bServerside) {
                //# cp
                oReturnVal.dom = function () {
                    function pender(vDomParent, vDomToAdd, bPrepend) {
                        var i,
                            _parent = core.type.dom.mk(vDomParent, null),
                            _domToAdd = core.type.dom.mk(vDomToAdd, null),
                            bReturnVal = !!(_parent && vDomToAdd)
                        ;

                        //# If we have a _parent and _domToAdd, bPrepend or .appendChild it
                        if (bReturnVal) {
                            if (core.type.arr.is(vDomToAdd)) {
                                //#
                                if (bPrepend) {
                                    for (i = vDomToAdd.length; i > 0; i--) {
                                        _domToAdd = core.type.dom.mk(vDomToAdd[i], null);
                                        _domToAdd && _parent.insertBefore(_domToAdd, _parent.childNodes[0]);
                                    }
                                }
                                //#
                                else {
                                    for (i = 0; i < vDomToAdd.length; i++) {
                                        _domToAdd = core.type.dom.mk(vDomToAdd[i], null);
                                        _domToAdd && _parent.appendChild(_domToAdd);
                                    }
                                }
                            }
                            //#
                            else if (core.type.dom.is(_domToAdd)) {
                                (bPrepend ?
                                    _parent.insertBefore(_domToAdd, _parent.childNodes[0]) :
                                    _parent.appendChild(_domToAdd)
                                );
                            }
                        }

                        return bReturnVal;
                    } //# pender

                    return {
                        // eq:
                        // cmp:

                        cp: function (x, bDeepCopy) {
                            if (core.type.dom.is(x) && core.type.fn.is(x.cloneNode)) {
                                return x.cloneNode(core.type.bool.mk(bDeepCopy));
                            }
                        }, //# type.dom.cp

                        prepend: function (vDomParent, vDomToAdd) {
                            return pender(vDomParent, vDomToAdd, true);
                        }, //# type.dom.prepend

                        append: function (vDomParent, vDomToAdd) {
                            return pender(vDomParent, vDomToAdd /*, false*/);
                        }, //# type.dom.append

                        replace: function (vTarget, vReplacement) {
                            var _target = core.type.dom.mk(vTarget, null),
                                _replacement = (vReplacement ? core.type.dom.parse(vReplacement)[0] : null), //# TODO: add looping
                                bReturnVal = !!(_target && _target.parentNode)
                            ;

                            //# If the _target and _replacement are valid, .replaceChild now
                            if (bReturnVal) {
                                if (_replacement) {
                                    _target.parentNode.replaceChild(_replacement, _target);
                                }
                                else {
                                    _target.remove();
                                }
                            }

                            return bReturnVal;
                        } //# type.dom.replace
                    };
                }(); //# core.type.dom
            }

            return oReturnVal;
        }); //# core.type
    } //# init

    /*
        diff: function ($assert) {
            var o1 = { n: 1, i: 2, c: 3, k: 4, camp: "Camp" },
                o2 = { n: 1, e: 22, k: 4, camp: " camP " },
                oResult1 = { i: undefined, c: undefined, camp: " camP " },
                oResult2 = { i: undefined, c: undefined }
            ;

            //#

        }
    */


    //# If we are running server-side
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = init;
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], init);
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}();
