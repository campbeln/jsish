//################################################################################################
/** @file Additional Type Functionality mixin for ish.js
 * @mixin ish.type
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2021, Nick Campbell
 * @ignore
 */ //############################################################################################
/*global module, define, global, WeakMap */                     //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict'; //<MIXIN>

    function init(core, atob, btoa) {
        var bServerside = core.config.ish().onServer,                                   //# code-golf
            _root = (bServerside ? global : window),                                    //# code-golf
            _undefined /*= undefined*/,                                                 //# code-golf
            _null = null,                                                               //# code-golf
            _Date_now = Date.now                                                        //# code-golf
        ;

        //################################################################################################
        /** Collection of additional Type-based functionality.
         * @namespace ish.type
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.type, function (oProtected) {
            var oCoreType = {
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
                            x !== _null &&
                            x !== false &&
                            x !== _undefined &&

                            //# Rely on the inline polyfill of Number.isNaN from MDN to determine if x is NaN
                            //#     NOTE: The following works because NaN is the only value in javascript which is not equal to itself.
                            //#     See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
                            /*x !== NaN*/ !(typeof x === 'number' && x !== x)
                        );
                    }, //# type.is.truthy


                    numeric: {
                        //#########
                        /** Determines if the passed values are equal.
                         * @$note The passed values are implicitly casted per the Javascript rules (see: {@link ish.type.float.mk}).
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
                         * @$note The passed values are implicitly casted per the Javascript rules (see: {@link ish.type.float.mk}).
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
                        }, //# type.is.numeric.cmp


                        //#########
                        /** Extracts the passed value's numeric characters.
                         * @function ish.type.is.numeric:extract
                         * @param {variant} x Value to interrogate.
                         * @param {variant} [vDefaultVal=0] Value representing the default return value if casting fails.
                         * @returns {integer} Value representing the passed value's numeric characters.
                         */ //#####
                        extract: function (x, vDefaultVal) {
                            var a_sReturnVal;

                            //# Force the passed x into a string for the .match below, .join'ing the results in our a_sReturnVal
                            x = core.type.str.mk(x);
                            a_sReturnVal = x.match(/\d/g) || [];
                            return core.type.int.mk(a_sReturnVal.join(""), (arguments.length > 1 ? vDefaultVal : 0));
                        }, //# type.is.numeric.extract


                        //#########
                        /** Sums the referenced numbers in the passed value.
                         * @function ish.type.is.numeric:sum
                         * @param {Array<integer>|object[]|object} vCollection Value representing the numbers to sum.
                         * @param {string|string[]} [vPath] Value representing the path to the requested property as a period-delimited string (e.g. "parent.child.array.0.key") or an array of strings.
                         * @returns {integer} Value representing sum of the passed values.
                         */ //#####
                        sum: function (vCollection, vPath) {
                            var i,
                                fReturnVal = 0
                            ;

                            //#
                            if (core.type.arr.is(vCollection, true)) {
                                //#
                                if (core.type.str.is(vPath, true) || core.type.arr.is(vPath, true)) {
                                    for (i = 0; i < vCollection.length; i++) {
                                        fReturnVal += core.type.float.mk(core.resolve(vCollection[i], vPath));
                                    }
                                }
                                //#
                                else {
                                    for (i = 0; i < vCollection.length; i++) {
                                        fReturnVal += core.type.float.mk(vCollection[i]);
                                    }
                                }
                            }
                            //#
                            else if (core.type.obj.is(vCollection, true)) {
                                //#
                                for (i in vCollection) {
                                    if (vCollection.hasOwnProperty(i)) {
                                        fReturnVal += core.type.float.mk(vCollection[i]);
                                    }
                                }
                            }

                            return fReturnVal;
                        }, //# type.is.numeric.sum


                        //#########
                        /** Statistical analysis (mean/average, median, mode, range, sum, count and sorted list of values) of the referenced numbers in the passed value.
                         * @function ish.type.is.numeric:stats
                         * @param {Array<integer>|object[]} a_vCollection Value representing the numbers to analyse.
                         * @param {string|string[]} [vPath] Value representing the path to the requested property as a period-delimited string (e.g. "parent.child.array.0.key") or an array of strings.
                         * @returns {integer} Value representing sum of the passed values.
                         */ //#####
                        stats: function (a_vCollection, vPath) {
                            var sKey, fCurrent, i,
                                oMode = {},
                                oReturnVal = {
                                    count: 0,
                                    //average: mean,
                                    //mean: undefined,
                                    //median: undefined,
                                    mode: [],
                                    //sum: undefined,
                                    //range: undefined,
                                    values: []
                                }
                            ;

                            //#
                            if (core.type.arr.is(a_vCollection, true)) {
                                oReturnVal.sum = 0;

                                //# If we were passed a vPath, then a_vCollection is an array of objects
                                if (arguments.length === 2) {
                                    //#
                                    for (i = 0; i < a_vCollection.length; i++) {
                                        fCurrent = core.type.float.mk(core.resolve(a_vCollection[i], vPath));
                                        oReturnVal.sum += fCurrent;
                                        oReturnVal.values.push(fCurrent);
                                    }
                                }
                                //# Else a_vCollection is an array of numeric values
                                else {
                                    //#
                                    for (i = 0; i < a_vCollection.length; i++) {
                                        fCurrent = core.type.float.mk(a_vCollection[i]);
                                        oReturnVal.sum += core.type.float.mk(a_vCollection[i]);
                                        oReturnVal.values.push(fCurrent);
                                    }
                                }

                                //#
                                oReturnVal.count = oReturnVal.values.length;
                                oReturnVal.mean = oReturnVal.average = (oReturnVal.sum / oReturnVal.count);
                                oReturnVal.values.sort();

                                //# If we have an odd number of values in our .values, grab the middle most one
                                //#     NOTE: We need to use Math.floor because array indexes are 0-based rather than 1-based
                                if (oReturnVal.count % 2 === 1) {
                                    i = Math.floor(oReturnVal.count / 2);
                                    oReturnVal.median = oReturnVal.values[i];
                                }
                                //# Else we have an even number of values in our .values, so we need to average the middle-most 2
                                //#     NOTE: We need to -1 from the calculated i because array indexes are 0-based rather than 1-based
                                else {
                                    i = (oReturnVal.count / 2);
                                    oReturnVal.median = ((oReturnVal.values[i - 1] + oReturnVal.values[i]) / 2);
                                }

                                //#
                                for (i = 0; i < oReturnVal.count; i++) {
                                    oMode[oReturnVal.values[i]] = oMode[oReturnVal.values[i]] || 0;
                                    oMode[oReturnVal.values[i]]++;
                                }

                                //# Calculate the .mode(s) of the .values
                                fCurrent = 1;
                                for (sKey in oMode) {
                                    if (oMode[sKey] > fCurrent) {
                                        fCurrent = oMode[sKey];
                                        oReturnVal.mode = [core.type.float.mk(sKey)];
                                    }
                                    else if (oMode[sKey] === fCurrent) {
                                        oReturnVal.mode.push(core.type.float.mk(sKey));
                                    }
                                }
                                oReturnVal.mode.sort();

                                //# Calculate the .range (largest value - smallest)
                                oReturnVal.range = (oReturnVal.values[oReturnVal.count - 1] - oReturnVal.values[0]);
                            }

                            return oReturnVal;
                        }, //# type.is.numeric.stats


                        //#########
                        /** Formats the passed value based on the passed format.
                         * @function ish.type.is.numeric:format
                         * @param {object} [vOptions] Value representing the number of decimal places or the following options:
                         *      @param {boolean} [vOptions.decimalPlaces=2] Value representing the number of decimal places.
                         *      @param {boolean} [vOptions.decimal='.'] Value representing the decimal place delimiter.
                         *      @param {boolean} [vOptions.section=','] Value representing the thousands section delimiter.
                         *      @param {boolean} [vOptions.sectionLength=3] Value representing the thousands section length.
                         * @returns {string} Value representing the formatted number.
                         * @see {@link https://stackoverflow.com/a/14428340/235704|StackOverflow.com}
                         */ //#####
                        format: function (x, vOptions) {
                            var sRegExp;

                            //# Ensure the passed vOptions .is .obj (while setting it's defaults), ensure the passed x is a .float and set sRegExp
                            vOptions = core.extend(
                                {
                                    decimalPlaces: 2,
                                    decimal: ".",
                                    section: ",",
                                    sectionLength: 3
                                }, (core.type.int.is(vOptions) ?
                                    { decimalPlaces: vOptions } :
                                    vOptions
                                )
                            );
                            x = core.type.float.mk(x);
                            sRegExp = '\\d(?=(\\d{' + vOptions.sectionLength + '})+' + (vOptions.decimalPlaces > 0 ? '\\D' : '$') + ')';

                            //# If we have .decimalPlaces to limit, do the rounding via .toFixed now
                            if (vOptions.decimalPlaces > -1) {
                                x = x.toFixed(vOptions.decimalPlaces);
                            }

                            return (vOptions.decimal ?
                                x.replace('.', vOptions.decimal) :
                                x
                            ).replace(new RegExp(sRegExp, 'g'), '$&' + vOptions.section);
                        }, //# type.is.numeric.format


                        hex: {
                            is: function (vValue) {
                                var bReturnVal = false;

                                try {
                                    vValue = parseInt(vValue, 16);
                                    bReturnVal = true;
                                } catch (e) {}

                                return bReturnVal;
                            }, //# type.is.numeric.hex.is

                            mk: function (vValue, vDefault) {
                                var sReturnVal = (arguments.length === 2 ? vDefault : 0);

                                //#
                                if (core.type.int.is(vValue)) {
                                    sReturnVal = core.type.float.mk(vValue).toString(16);
                                }
                                //#
                                else if (core.type.is.numeric.hex.is(vValue)) {
                                    sReturnVal = vValue;
                                }

                                return sReturnVal;
                            }, //# type.is.numeric.hex.mk

                            parse: function (vValue, vDefault) {
                                var iReturnVal = (arguments.length === 2 ? vDefault : 0);

                                try {
                                    iReturnVal = parseInt(vValue, 16);
                                } catch (e) {}

                                return iReturnVal;
                            } //# type.is.numeric.hex.parse
                        },


                        base64: function () {
                            //# FROM: https://gist.github.com/GeorgioWan/16a7ad2a255e8d5c7ed1aca3ab4aacec
                            function hexToBase64(str) {
                                return btoa(String.fromCharCode.apply(null,
                                str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
                                );
                            } //# hexToBase64
                            function base64ToHex(str) {
                                for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
                                    var tmp = bin.charCodeAt(i).toString(16);
                                    if (tmp.length === 1) tmp = "0" + tmp;
                                    hex[hex.length] = tmp;
                                }
                                return hex.join("");
                            } //# base64ToHex

                            return {
                                encode: function (vValue, bPaddingCharacters) {
                                    var sHex = core.type.is.numeric.hex.mk(vValue, null),
                                        sReturnVal = ""
                                    ;

                                    //# If we got a sHex vValue, convert it .hexToBase64 while optionally stripping the bPaddingCharacters
                                    if (sHex /* !== null*/) {
                                        sReturnVal = hexToBase64(sHex);
                                        sReturnVal = (bPaddingCharacters ? sReturnVal : sReturnVal.replace(/=/g, ""));
                                    }

                                    return sReturnVal;
                                }, //# type.is.numeric.base64.encode

                                decode: function (sBase64) {
                                    var sHex = "";

                                    try {
                                        sHex = base64ToHex(sBase64);
                                    } catch (e) {}

                                    return sHex;
                                } //# type.is.numeric.base64.decode
                            };
                        }()
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
                 * @param {object|object[]} vQuery Value representing the query.
                 * @param {object} [oOptions] Value representing the following options:
                 *      @param {boolean} [oOptions.firstEntryOnly=false] Value representing if only the first result is to be returned.
                 *      @param {boolean} [oOptions.caseInsensitive=false] Value representing if the keys are to be searched for in a case-insensitive manor.
                 *      @param {boolean} [oOptions.useCoercion=false] Value representing if coercion is to be used during comparisons.
                 *      @param {boolean} [oOptions.useKeyValue=false] Value representing if the query is specified as a key/value.
                 * @returns {variant[]|variant} Value representing the passed values that matched the query.
                 */ //#####
                query: function () {
                    var yNoValue = core.type.symbol();

                    //#
                    function doQuery(vKey, vQueryValue, oSource, oOptions) {
                        var a_sKeys, i,
                            bMatched = false,
                            oReturnVal = {
                                match: false,
                                matches: [],
                                items: []
                            }
                        ;

                        function queryTestValue(vTestValue, sKey) {
                            //# If the vQueryValue .is .fn, call it with fn(vTestValue, oOptions)
                            if (core.type.fn.is(vQueryValue)) {
                                bMatched = vQueryValue(vTestValue, oSource, oOptions, sKey);
                            }
                            //#
                            else if (vQueryValue instanceof RegExp) {
                                bMatched = !!(core.type.str.mk(vTestValue).match(vQueryValue));
                            }
                            //# Else we'll consider the vCurrent oQuery value as singular
                            else {
                                bMatched = (core.type.obj.is(oSource) &&
                                    (oOptions.useCoercion && vTestValue == vQueryValue) ||
                                    (vTestValue === vQueryValue)
                                );
                            }

                            //#
                            if (bMatched) {
                                oReturnVal.match = true;
                                oReturnVal.matches.push({
                                    //path: _undefined,
                                    key: sKey,
                                    value: vTestValue
                                });
                                oReturnVal.items.push(oSource);
                            }
                        } //# queryTestValue

                        //# If the vKey .is a .regexp
                        if (core.type.regexp.is(vKey)) {
                            //# Pull the a_sKeys for the oSource
                            a_sKeys = core.type.obj.ownKeys(oSource);
                            for (i = 0; i < a_sKeys.length; i++) {
                                //# If the current a_sKeys is a .match
                                if (a_sKeys[i].match(vKey)) {
                                    //# If we are looking for yNoValue in particular, .push the current a_sKeys into our .matches
                                    if (vQueryValue === yNoValue) {
                                        oReturnVal.matches.push({
                                            //path: _undefined,
                                            key: a_sKeys[i],
                                            value: oSource[a_sKeys[i]]
                                        });

                                        //# Make sure .match is true
                                        oReturnVal.match = true;
                                    }
                                    //# Else call queryTestValue with the current a_sKeys
                                    else {
                                        queryTestValue(
                                            oOptions.caseInsensitive ? core.type.obj.get(oSource, a_sKeys[i]) : core.resolve(oSource, a_sKeys[i]),
                                            a_sKeys[i]
                                        );
                                    }
                                }
                            }
                            console.log(oReturnVal);
                        }
                        //# Else call queryTestValue with the vKey
                        else {
                            queryTestValue(
                                oOptions.caseInsensitive ? core.type.obj.get(oSource, vKey) : core.resolve(oSource, vKey),
                                vKey
                            );
                        }

                        return oReturnVal;
                    } //# doQuery

                    //#
                    //# ["val1", "val2"] = core.type.query([{}, {}], ["path.to.val"])
                    //# [{}, {}] = core.type.query([{}, {}], { key: "val", key2: ["val1", "val2"], "path.to.key3": function(vTestValue, oSourceIndex, oOptions) { return true || false; } })
                    return function (vCollection, vQuery, oOptions) {
                        var a_oCollection, a_sKeys, vCurrent, oResults, h, i, j, k,
                            a_oReturnVal = [],
                            a_oReturnValQuery = []
                        ;

                        //# Ensure the passed vQuery is an array
                        vQuery = core.type.arr.mk(vQuery, [vQuery]);

                        //# .extend the passed oOptions with the defaults (which also ensures the passed oOptions .is .obj)
                        oOptions = core.extend({
                            firstEntryOnly: false,
                            caseInsensitive: false,
                            useCoercion: false,
                            useKeyValue: false
                        }, oOptions);

                        //# Calculate our a_oCollection based on the passed vCollection
                        a_oCollection = (core.type.arr.is(vCollection) ?
                            vCollection : (core.type.obj.is(vCollection) ?
                                core.type.obj.toArr(vCollection, oOptions.setKeyAs) :
                                [vCollection]
                            )
                        );

                        //# If we have a_oCollection
                        if (core.type.arr.is(a_oCollection, true)) {
                            //# Traverse the passed vQuery(ies)
                            for (h = 0; h < vQuery.length; h++) {
                                //# If we are to .useKeyValue, set the a_sKeys to the passed .key
                                if (oOptions.useKeyValue) {
                                    a_sKeys = [ vQuery[h].key ];
                                }
                                //# Else pull the a_sKeys for the current vQuery
                                else {
                                    a_sKeys = (core.type.obj.is(vQuery[h], { allowFn: true }) ?
                                        Object.keys(vQuery[h]) :
                                        _undefined
                                    );
                                }

                                //# If the current vQuery has a_sKeys
                                if (core.type.arr.is(a_sKeys, true)) {
                                    //# Traverse our a_oCollection
                                    for (i = 0; i < a_oCollection.length; i++) {
                                        //# Traverse our vQuery's a_sKeys
                                        for (j = 0; j < a_sKeys.length; j++) {
                                            //# If we are to .useKeyValue, set the vCurrent .value (defaulting if there's yNoValue)
                                            if (oOptions.useKeyValue) {
                                                vCurrent = (core.type.is.value(vQuery[h]) && vQuery[h].hasOwnProperty("value") ? vQuery[h].value : yNoValue);
                                            }
                                            //# Else we are not to .useKeyValue, so pull from the vCurrent value directly from the vQuery
                                            else {
                                                vCurrent = vQuery[h][a_sKeys[j]];
                                            }

                                            //# If we have an .is .arr of vQuery values to traverse, do so now
                                            if (core.type.arr.is(vCurrent)) {
                                                for (k = 0; k < vCurrent.length; k++) {
                                                    //# If the vCurrent value .matches our current a_oCollection item, fall from the inner loop
                                                    oResults = doQuery(a_sKeys[j], vCurrent[k], a_oCollection[i], oOptions);
                                                    if (oResults.match) {
                                                        break;
                                                    }
                                                }
                                            }
                                            //# Else we'll consider the vCurrent vQuery value as singular, so collect the oResults from doQuery
                                            else {
                                                oResults = doQuery(a_sKeys[j], vCurrent, a_oCollection[i], oOptions);
                                            }

                                            //# If this is an AND-based vQuery and the vCurrent vQuery isn't an .match or this is an OR-based vQuery and we've already found our .match, fall from the middle loop
                                            if ((!oOptions.or && !oResults.match) || (oOptions.or && oResults.match)) {
                                                break;
                                            }
                                        }

                                        //# If the current a_oCollection record passed each vQuery value, .push the oResults.matches into our a_oReturnVal
                                        if (oResults.match) {
                                            a_oReturnVal = a_oReturnVal.concat(oResults.items); //a_oCollection[i]
                                            a_oReturnValQuery = a_oReturnValQuery.concat(oResults.matches);
                                            a_oReturnVal.$query = a_oReturnValQuery;

                                            //# If we are looking for the .firstEntryOnly, reset h to fall from the outer loop then fall from the middle loop
                                            if (oOptions.firstEntryOnly) {
                                                h = vQuery.length;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        return (oOptions.firstEntryOnly ? a_oReturnVal[0] : a_oReturnVal);
                    };
                }(), //# core.type.query


                //#########
                /** Registers a new type interface under <code>ish.type</code>.
                 * @function ish.type.register
                 * @param {string} sTypeName Value representing the type name to register.
                 *      <br/><note>This must be unique (e.g. not currently in use under <code>ish.type</code>).</note>
                 * @param {function|RegExp} vTest Value representing the test that verifies the type as a <code>RegExp<code> expression or a function that implements the test, accepting 1 argument (<code>x</code>) and returning truthy if the value is of a valid type.
                 * @param {variant} [vMkDefaultVal] Value representing the default value returned by the <code>mk</code> interface if a <code>vDefaultVal</code> is not provided in the call.
                 *      <br/><note>If this argument is omitted, a <code>mk</code> is not created.</note>
                 * @returns {boolean} Value representing if the new type interface was successfully registered under <code>ish.type</code>.
                 *      <br/><note>The <code>ish.type[sTypeName]</code> type interface is created with an <code>is</code> and optional <code>mk</code> functions. <code>is</code> accepts at least 1 argument which defines the variable to test. <code>mk</code> accepts 2 arguments (<code>vValToTest</code>, <code>vDefraultVal</code>) while calling the <code>is</code> interface, passing in <code>vValToTest</code> to determine if it is a valid type.</note>
                 */ //#####
                register: function (sTypeName, vTest, vMkDefaultVal) {
                    /*
                    Example: https://www.geeksforgeeks.org/how-to-validate-ssn-social-security-number-using-regular-expression/
                    ish.type.register("ssn", /^(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, "000-00-0000");

                    ^ represents the starting of the string.
                    (?!666|000|9\\d{2})\\d{3} represents the first 3 digits should not starts with 000, 666, or between 900 and 999.
                    – represents the string followed by a hyphen (-).
                    (?!00)\\d{2} represents the next 2 digits should not starts with 00 and it should be any from 01-99.
                    – represents the string followed by a hyphen (-).
                    (?!0{4})\\d{4} represents the next 4 digits can’t 0000 and it should be any from 0001-9999.
                    $ represents the ending of the string.
                    */
                    var oInterface = {
                            is: (core.type.fn.is(vTest) ? vTest : (
                                    core.type.regexp.is(vTest) ?
                                    function (x) {
                                        return vTest.test(x + "");
                                    } :
                                    _undefined
                                )
                            )
                        },
                        bReturnVal = (
                            core.type.str.is(sTypeName, true) &&
                            core.type[sTypeName] === undefined &&
                            oInterface.is
                        )
                    ;

                    //# If the caller passed in a valid sTypeName and vTest
                    if (bReturnVal) {
                        //# If the caller passed in a vMkDefaultVal, setup the .mk oInterface
                        if (arguments.length > 2) {
                            oInterface.mk = function (x, vDefaultVal) {
                                return (fnTest(x) ?
                                    x : (
                                        arguments.length > 1 ? vDefaultVal : vMkDefaultVal
                                    )
                                );
                            };
                        }

                        //# Set the oInterface under the unique sTypeName
                        core.type[sTypeName] = oInterface;
                    }

                    return bReturnVal;
                },

                //####
                //####

                //# TODO tests, docs
                regexp: {
                    is: function (x) {
                        return x instanceof RegExp;
                    }
                },

                //#########
                /** Universally Unique Identifier (UUID)-based type functionality.
                 * @namespace ish.type.uuid
                 */ //#####
                uuid: function() {
                    var fnReturnValue, d;

                    //#
                    function fixVersion(iVersion) {
                        iVersion = core.type.int.mk(iVersion, 0);
                        return (iVersion < 1 || iVersion > 5 ? 4 : iVersion);
                    } //# fixVersion

                    //# If _root.Uint8Array and _root.crypto are available, use them in our fnReturnValue
                    if (core.type.fn.is(_root.Uint8Array) && core.type.fn.is(core.resolve(_root, "crypto.getRandomValues"))) {
                        fnReturnValue = function (iVersion) {
                            /*jslint bitwise: true */           //# Enable bitwise operators for JSHint
                            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
                                return (c ^ _root.crypto.getRandomValues(new _root.Uint8Array(1))[0] & 15 >> c / 4).toString(16);
                            }).replace(/^(.{13})-4/, "$1-" + fixVersion(iVersion));
                        };
                    }
                    //# Else something went wrong using the ES6 approach, so fall back to the old skool way
                    else {
                        fnReturnValue = function (iVersion) {
                            d = (
                                Date.now() + (core.type.fn.call(core.resolve(_root, "performance.now")) || 0)
                            );

                            /*jslint bitwise: true */           //# Enable bitwise operators for JSHint
                            return ('xxxxxxxx-xxxx-' + fixVersion(iVersion) + 'xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function (c) {
                                var r = (d + Math.random() * 16) % 16 | 0;
                                d = Math.floor(d / 16);
                                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                            });
                        };

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

                    //#
                    return core.extend(
                        //#########
                        /** Generates a Universally Unique Identifier (UUID).
                         * @function ish.type.uuid.get
                         * @$aka ish.type.uuid
                         * @param {integer} [iVersion=4] Value representing the UUID version to create, with valid values ranging between <code>1</code>-<code>5</code>.
                         * @returns {boolean} Value representing UUID.
                         * @see {@link https://stackoverflow.com/a/2117523/235704|StackOverflow.com}
                         */ //#####
                        function (iVersion) {
                            return fnReturnValue(iVersion);
                        }, {
                            get: fnReturnValue,

                            //#########
                            /** Determines if the passed value represents a UUID.
                             * @function ish.type.uuid.is
                             * @param {string} x Value to interrogate.
                             * @param {boolean|object} [vOptions] Value representing if Nil UUIDs are to be ignored or the following options:
                             *      @param {boolean} [vOptions.excludeNilUUID=false] Value representing if Nil UUIDs are to be ignored.
                             *      @param {boolean} [vOptions.allowBrackets=false] Value representing if enclosing brackets (<code>{}</code>) are to be allowed.
                             *      @param {integer} [vOptions.version] Value representing the required UUID version, with valid values ranging between <code>1</code>-<code>5</code>.
                             * @returns {boolean} Value representing if the passed value represents a UUID.
                             * @see {@link https://tools.ietf.org/html/rfc4122#section-4.1.7|ietf.org}
                             */ //#####
                            is: function (x, vOptions) {
                                var oOptions = core.type.obj.mk(vOptions),
                                    bExcludeNilUUID = (vOptions === true || oOptions.excludeNilUUID === true),
                                    sVersion = (fixVersion(oOptions.version) === oOptions.version ?
                                        oOptions.version :
                                        "1-5"
                                    ),
                                    reTest = new RegExp(bExcludeNilUUID ?
                                        "^[0-9a-f]{8}-[0-9a-f]{4}-[" + sVersion + "][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$" :
                                        "^[0-9a-f]{8}-[0-9a-f]{4}-[0," + sVersion + "][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$",
                                    "i"),
                                    bReturnVal = false
                                ;

                                //# If x .is a .str
                                if (core.type.str.is(x, true)) {
                                    //# If we are to .allowBrackets, .trim and remove any {}'s
                                    if (oOptions.allowBrackets) {
                                        x = core.type.uuid.format(x);
                                    }

                                    bReturnVal = reTest.test(x);
                                }

                                return bReturnVal;
                            }, //# type.uuid.is


                            //#########
                            /** Casts the passed value into a UUID.
                             * @function ish.type.uuid.mk
                             * @param {string} x Value to interrogate.
                             * @param {variant} [vDefaultVal=ish.type.uuid()] Value representing the default return value if casting fails.
                             * @returns {object} Value representing the passed value as a UUID.
                             */ //#####
                            mk: function (x, vDefaultVal) {
                                var vReturnVal;

                                //#
                                if (core.type.uuid.is(x, true)) {
                                    vReturnVal = x;
                                }
                                //#
                                else if (arguments.length > 1) {
                                    vReturnVal = vDefaultVal;
                                }
                                //#
                                else {
                                    vReturnVal = core.type.uuid();
                                }

                                return vReturnVal;
                            }, //# type.uuid.mk


                            //#########
                            /** Removes any non-canonical brackets (e.g. <code>{}</code>) from the passed value.
                             * @function ish.type.uuid.format
                             * @param {string} x Value to interrogate.
                             * @param {boolean} [bUppercase=false] Value representing if the UUID should be represented in uppercase letters.
                             * @returns {object} Value representing the passed value as a formatted UUID.
                             */ //#####
                            format: function (x, bUppercase) {
                                //# Ensure the passed x .is a .str, then .trim and leading/trailing spaces and {}'s and case it based on the passed bUppercase
                                x = core.type.str.mk(x)
                                    .trim()
                                    .replace(/^\{/, "").replace(/\}$/, "")
                                    [bUppercase === true ? "toUpperCase" : "toLowerCase"]()
                                ;

                                //#
                                if (/^[0-9a-f]{32}$/i.test(x)) {
                                    x = x.replace(/^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/i, "$1-$2-$3-$4-$5");
                                }

                                //# If the above formatted x .is a .uuid (ensuring that we do not enter an infinite loop by passing allowBrackets = false), return it to the caller, else return a (falsy) null-string
                                //#     NOTE: As we are not explicitly .excludeNilUUID, this will properly format it as well.
                                return (
                                    core.type.uuid.is(x /*, { allowBrackets: false }*/) ?
                                        x :
                                        ""
                                );
                            },

                            //#########
                            /** Encodes and decodes Universally Unique Identifiers (UUID) in Base64.
                             * @function ish.type.uuid.base64
                             * @note UUIDs encoded in Base64 rather than hexadecimal (Base16) produce up to 39% shorter string lengths. UUIDs are 128bit numbers encoded in hexadecimal resulting in 36 character strings (32 plus 4 dashes). Encoding the 128bit number in Base64 reduces the string length to 24 characters (22 plus 2 optional padding characters).
                             * @param {variant} [vValue=ish.type.uuid()] Value representing a standard UUID to be returned as a Base64 encoded UUID or a Base64 encoded UUID to be returned as a standard UUID.
                             * @returns {string} Value representing a new Base64 encoded UUID, the passed UUID in Base64, the passed Base64 encoded UUID as a standard UUID or a <code>null-string</code> if the passed UUID was not recognized.
                             */ //#####
                            base64: function (vValue) {
                                var sReturnVal;

                                //# If no vValue was passed (implying a UUID creation) or it .is a .uuid, .base64.encode it
                                if (arguments.length === 0 || core.type.uuid.is(vValue)) {
                                    sReturnVal = core.type.is.numeric.base64.encode(
                                        (arguments.length === 0 ? core.type.uuid() : core.type.uuid.format(vValue)).replace(/-/g, "")
                                    );
                                }
                                //# Else a vValue was passed, so .decode it as a .base64 vValue
                                else {
                                    sReturnVal = core.type.uuid.format(
                                        core.type.is.numeric.base64.decode(vValue)
                                    );
                                }

                                return sReturnVal;
                            }
                        }
                    );
                }(), //# core.type.uuid

                //####
                //####

                bool: {
                    mk: {
                        //#########
                        /** Casts the passed value into a boolean based on language.
                         * @function ish.type.bool.mk:fuzzy
                         * @param {variant} x Value to interrogate.
                         * @param {variant} [vDefaultVal=undefined] Value representing the default return value if casting fails.
                         * @param {string[]} [a_sTruthy=['1','true','yes','on']] Value representing the lowercase strings to interpret as `true` values.
                         * @param {string[]} [a_sFalsy=['0','false','no','off']] Value representing the lowercase strings to interpret as `false` values.
                         * @returns {boolean} Value representing the passed value as a boolean type.
                         * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Falsy|Mozilla.org}
                         */ //#####
                        fuzzy: function () {
                            //# Setup the logic to be returned
                            function fuzzy(x, vDefaultVal, a_sTruthy, a_sFalsy) {
                                var bReturnVal = core.type.bool.mk(x, _undefined);

                                //# If our call to .bool.mk fails, we've got work to do
                                if (bReturnVal === _undefined) {
                                    //# Ensure the passed arguments are in the expected format
                                    x = core.type.str.mk(x).trim().toLowerCase();
                                    vDefaultVal = (arguments.length > 1 ? vDefaultVal : _undefined);

                                    //# Ensure the passed a_sTruthy and a_sFalsy .is an .arr, defaulting if nothing was passed
                                    //#     NOTE: 'true'/'false' are handled within core.type.bool.mk above.
                                    a_sTruthy = core.type.arr.mk(a_sTruthy, fuzzy.truthy);
                                    a_sFalsy = core.type.arr.mk(a_sFalsy, fuzzy.falsy);

                                    //# If x is within our a_sTruthy, set our bReturnVal accordingly
                                    if (a_sTruthy.indexOf(x) > -1) {
                                        bReturnVal = true;
                                    }
                                    //# Else if x is within our a_sFalsy, set our bReturnVal accordingly
                                    else if (a_sFalsy.indexOf(x) > -1) {
                                        bReturnVal = false;
                                    }
                                    //# Else set our bReturnVal to the vDefaultVal as all other attempts to resolve the boolean value of x have failed
                                    else {
                                        bReturnVal = vDefaultVal;
                                    }
                                }

                                return bReturnVal;
                            } //# fuzzy

                            //# Attach the default .truthy and .falsy arrays then return
                            fuzzy.truthy = [/*'1', 'true',*/ 'yes' ,'on'];
                            fuzzy.falsy = [/*'0', 'false',*/ 'no' ,'off'];
                            return fuzzy;
                        }()
                    }
                }, //# core.type.bool


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
                     * @param {variant} x Value representing the date to compare.
                     * @param {variant} [vRelativeTo=new Date()] Value representing the relative date to compare to.
                     * @returns {integer} Value representing if the passed value is greater then (<code>1</code>), less then (<code>-1</code>) or equal to (<code>0</code>) the passed relative value with <code>undefined</code> indicating one of the passed values was not a reconized date.
                     */ //#####
                    cmp: function (x, vRelativeTo) {
                        var iReturnVal = _undefined,
                            dDateX = core.type.date.mk(x, _null),
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
                     * @param {variant} x Value representing the date to copy.
                     * @returns {date} Value representing the passed value as a new instance.
                     */ //#####
                    cp: function (x) {
                        var dReturnVal, // = _undefined
                            dParsed = core.type.date.mk(x, _null)
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
                     * @param {variant} x Value representing the date of birth.
                     * @returns {integer} Value representing the full years since the passed value.
                     */ //#####
                    age: function (x) {
                        var dAgeSpan,
                            dDOB = core.type.date.mk(x, _null),
                            iReturnVal = -1
                        ;

                        //# If the passed dob is a valid date
                        if (core.type.date.is(dDOB)) {
                            //# Set dAgeSpan based on the milliseconds from epoch
                            dAgeSpan = new Date(Date.now() - dDOB);
                            iReturnVal = Math.abs(dAgeSpan.getUTCFullYear() - 1970);
                        }

                        return iReturnVal;
                    }, //# date.age


                    //#########
                    /** Determines the difference between two dates.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.diff
                     * @param {variant} x Value representing the first date to compare.
                     * @param {variant} [y=new Date()] Value representing the second date to compare.
                     * @param {string} [eUnitOfTime="d"] Value representing the unit of time to return; <code>s</code> seconds, <code>m</code> minutes, <code>h</code> hours, <code>d</code> days, <code>w</code> weeks, <code>M</code> months, <code>Y</code> years.
                     * @returns {integer} Value representing the difference between two dates.
                     */ //#####
                    diff: function (x, y, eUnitOfTime) {
                        var iMS,
                            dX = core.type.date.mk(x),
                            dY = core.type.date.mk(y),
                            dReturnVal = null
                        ;

                        //# Determine the eUnitOfTime, setting iMS accordingly (or dReturnVal)
                        switch (core.type.str.mk(eUnitOfTime, "d")) {
                            case "s": {
                                iMS = 1000;
                                break;
                            }
                            case "m": {
                                iMS = 1000 * 60;
                                break;
                            }
                            case "h": {
                                iMS = 1000 * 60 * 60;
                                break;
                            }
                            case "d": {
                                iMS = 1000 * 60 * 60 * 24;
                                break;
                            }
                            case "w": {
                                iMS = 1000 * 60 * 60 * 24 * 7;
                                break;
                            }
                            case "M": { //# month
                                dReturnVal = (dY.getMonth() - dX.getMonth() + (12 * (dY.getFullYear() - dX.getFullYear())));
                                break;
                            }
                            case "Y": {
                                dReturnVal = (dY.getFullYear() - dX.getFullYear());
                                break;
                            }
                        }

                        //#
                        if (dReturnVal === null) {
                            dReturnVal = ((dY - dX) / iMS);
                        }

                        return dReturnVal;
                    }, //# date.diff


                    //#########
                    /** Determines the date part only of the passed value.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.only
                     * @param {variant} [x=new Date()] Value representing the date.
                     * @param {variant} [vDefault=undefined] Value representing the default return value if casting fails.
                     * @returns {integer} Value representing the date part only of the passed value.
                     */ //#####
                    only: function (x, vDefault) {
                        return core.type.date.mk(core.type.date.yyyymmdd.apply(this, [x, vDefault]) + " 00:00:00");
                    }, //# date.only


                    //#########
                    /** Resets the datetime offset of the passed value to the local system's datetime offset.
                     * @$note The passed values are implicitly casted per <code>{@link ish.type.date.mk}</code>.
                     * @function ish.type.date.utcToLocalOffset
                     * @param {variant} [x=new Date()] Value representing the date.
                     * @returns {integer} Value representing the passed value reset to the local system's datetime offset.
                     */ //#####
                    utcToLocalOffset: function (x) {
                        var dDate = core.type.date.mk(x);

                        return new Date(
                            dDate.getUTCFullYear(), dDate.getUTCMonth(), dDate.getUTCDate(),
                            dDate.getUTCHours(), dDate.getUTCMinutes(), dDate.getUTCSeconds()
                        );
                    } //# date.utcToLocalOffset
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
                                bReturnVal = bResult; //iResult;
                                break;
                            }
                            else if (bResult !== false) {
                                bReturnVal = bResult; //iResult;
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
                         * @param {variant} x Value to interrogate.
                         * @param {variant} y Value to interrogate.
                         * @param {boolean} [bCaseInsensitive=true] Value representing if the keys are to be searched for in a case-insensitive manor.
                         * @returns {boolean} Value representing if the passed values are equal.
                         */ //#####
                        eq: function (x, y, bCaseInsensitive) {
                            x = core.type.str.mk(x, "");
                            y = core.type.str.mk(y, "");

                            //# Unless specifically told not to, compare the passed string as bCaseInsensitive
                            return (bCaseInsensitive !== false ?
                                (x.toLowerCase() === y.toLowerCase()) :
                                (x === y)
                            );
                        }, //# type.str.eq


                        //#########
                        /** Compares the passed value to the reference value(s), determining if it is equal, equal when case-insensitive and trimmed or not equal.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.cmp
                         * @param {variant} x Value representing the string to compare.
                         * @param {variant|variant[]} vReference Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value is equal (<code>true</code>), equal when case-insensitive and trimmed (<code>1</code>) or not equal (<code>false</code>) to the passed reference string(s).
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


                            return function (x, vReference) {
                                var i,
                                    bReturnVal = false
                                ;

                                //# If the passed vReference .is an .arr, traverse it, bReturnVal'ing on the first .compare hit
                                if (core.type.arr.is(vReference)) {
                                    for (i = 0; i < vReference.length; i++) {
                                        bReturnVal = compare(x, vReference[i]);
                                        if (bReturnVal) {
                                            break;
                                        }
                                    }
                                }
                                //# Else the passed vReference .is not an .arr, so bReturnVal the result of .compare
                                else {
                                    bReturnVal = compare(x, vReference);
                                }

                                return bReturnVal;
                            };
                        }(), //# type.str.cmp.*

                        //cp:

                        //#########
                        /** Prepends the passed character onto the passed value to a minimum length.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.lpad
                         * @param {variant} x Value representing the string to pad.
                         * @param {string} sChar Value representing the character to pad with.
                         * @param {integer} iLength Value representing the minimum length to pad to.
                         * @returns {string} Value representing the passed value prepended with the pad character to the minimum length.
                         */ //#####
                        lpad: function (x, sChar, iLength) {
                            return doPad(x, sChar, iLength, true);
                        }, //# type.str.lpad


                        //#########
                        /** Appends the passed character onto the passed value to a minimum length.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.rpad
                         * @param {variant} x Value representing the string to pad.
                         * @param {string} sChar Value representing the character to pad with.
                         * @param {integer} iLength Value representing the minimum length to pad to.
                         * @returns {string} Value representing the passed value appended with the pad character to the minimum length.
                         */ //#####
                        rpad: function (x, sChar, iLength) {
                            return doPad(x, sChar, iLength, false);
                        }, //# type.str.rpad


                        //#########
                        /** Compares the passed value to the reference value, determining if it begins with, begins with when case-insensitive and trimmed or does not begin with the reference value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.begins
                         * @param {variant} x Value representing the string to compare.
                         * @param {variant|variant[]} vReference Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value begins with (<code>true</code>), begins with when case-insensitive and trimmed (<code>1</code>) or does not begin with (<code>false</code>) to the passed reference value.
                         */ //#####
                        begins: function (x, vReference) {
                            return doSearch(x, core.type.arr.mk(vReference, [vReference]), function (iIndexOf /*, iX, iReference*/) {
                                return (iIndexOf === 0);
                            });
                        }, //# type.str.begins


                        //#########
                        /** Compares the passed value to the reference value, determining if it ends with, ends with when case-insensitive and trimmed or does not end with the reference value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.ends
                         * @param {variant} x Value representing the string to compare.
                         * @param {variant|variant[]} vReference Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value ends with (<code>true</code>), ends with when case-insensitive and trimmed (<code>1</code>) or does not end with (<code>false</code>) to the passed reference value.
                         */ //#####
                        ends: function (x, vReference) {
                            return doSearch(x, core.type.arr.mk(vReference, [vReference]), function (iIndexOf, iX, iReference) {
                                return (iIndexOf != -1 && iIndexOf === (iX - iReference));
                            });
                        }, //# type.str.ends


                        //#########
                        /** Compares the passed value to the reference value, determining if it is contained within, contained within when case-insensitive and trimmed or is not contained within with the reference value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.contains
                         * @param {variant} x Value representing the string to compare.
                         * @param {variant|variant[]} vReference Value representing the reference string(s) to compare to.
                         * @returns {boolean|integer} Value representing if the passed value is contained within (<code>true</code>), contained within when case-insensitive and trimmed (<code>1</code>) or is not contained within (<code>false</code>) to the passed reference value.
                         */ //#####
                        contains: function (x, vReference) {
                            return doSearch(x, core.type.arr.mk(vReference, [vReference]), function (iIndexOf /*, iX, iReference*/) {
                                return (iIndexOf > -1);
                            });
                        }, //# type.str.contains


                        //#########
                        /** Removes the referenced leading and trailing characters from the passed value.
                         * @$note The passed values are implicitly casted per <code>{@link ish.type.str.mk}</code>.
                         * @function ish.type.str.sub
                         * @param {variant} x Value representing the string.
                         * @param {integer} iFromStart Value representing the number of characters to remove from the beginning of the passed value.
                         * @param {integer} iFromEnd Value representing the number of characters to remove from the end of the passed value.
                         * @returns {string} Value representing the remaining characters from the passed value.
                         */ //#####
                        sub: function (x, iFromStart, iFromEnd) {
                            var sReturnVal = core.type.str.mk(x),
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
                         * @param {variant} x Value representing the string.
                         * @param {object} oData Value representing the data to interpolate within the passed value.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {RegExp} [oOptions.pattern] Value representing the regular expression that defines the interpolation delimiters.
                         *      @param {boolean} [oOptions.start="{"] Value representing the leading interpolation delimiter.
                         *      @param {boolean} [oOptions.end="}"] Value representing the trailing interpolation delimiter.
                         * @returns {string} Value representing the results of the passed value's interpolation.
                         */ //#####
                        replace: function() {
                            var rePattern = /{([^{]+)}/g;

                            return function(x, oData, oOptions) {
                                var reCurrentPattern, vCurrent;

                                //#
                                x = core.type.str.mk(x);
                                oData = core.type.obj.mk(oData);
                                oOptions = core.type.obj.mk(oOptions);
                                reCurrentPattern = oOptions.pattern || rePattern;

                                //#
                                if (oOptions.start && oOptions.end) {
                                    reCurrentPattern = new RegExp(oOptions.start + "([^" + oOptions.start + "]+)" + oOptions.end, "g");
                                }

                                return x.replace(reCurrentPattern, function(ignore, sKey) {
                                    vCurrent = core.resolve(oData, sKey);

                                    return (core.type.fn.is(vCurrent) ?
                                        vCurrent() :
                                        core.type.str.mk(vCurrent)
                                    );
                                });
                            };
                        }() //# type.str.replace
                    };
                }(), //# core.type.str


                //# cp
                fn: {
                    //eq:
                    //cmp:
                    //#
                    //#     SEE: https://stackoverflow.com/a/22534864/235704
                    /*cp: function (fn) {
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
                    }*/ //# type.fn.cp


                    //#########
                    /** Injects dependencies into the passed function from the passed value.
                     * @function ish.type.fn.inject
                     * @param {function} fn Value representing the function to execute.
                     * @param {object} oDependencies Value representing the dependencies to inject.
                     * @param {boolean} [bNoCallWhenMissing=false] Value representing if the passed function is to be called if dependencies are missing.
                     * @returns {object} =interface Value representing the following properties:
                     *      @returns {boolean} =interface.success Value indicating if the passed function was executed.
                     *      @returns {string[]} =interface.missing Value indicating the missing dependencies.
                     */ //#####
                    inject: function (fn, oDependencies, bNoCallWhenMissing) {
                        var i,
                            oMetadata = core.type.fn.metadata(fn),
                            a_sKeys = core.type.obj.ownKeys(oDependencies),
                            oReturnVal = {
                                success: (oMetadata.is && core.type.arr.is(a_sKeys, true)),
                                missing: []
                            }
                        ;

                        //# If we have a fn and oDependencies to .inject, traverse the .parameters
                        if (oReturnVal.success) {
                            for (i = 0; i < oMetadata.parameters.length; i++) {
                                //# If the oDependencies don't have the current .parameter
                                if (a_sKeys.indexOf(oMetadata.parameters[i]) === -1) {
                                    oReturnVal.missing.push(oMetadata.parameters[i]);
                                }

                                //# Reset the current .parameters with the related oDependencies
                                //#     NOTE: Unknown a_sKeys will set as undefined
                                oMetadata.parameters[i] = oDependencies[oMetadata.parameters[i]];
                            }

                            //# Redetermine our .success based on bNoCallWhenMissing or .missing.length
                            oReturnVal.success = (!bNoCallWhenMissing || oReturnVal.missing.length === 0);

                            //# If we're not to bNoCallWhenMissing, asynchronously .run the fn with the above replaced .parameters
                            if (oReturnVal.success) {
                                setTimeout(function () {
                                    core.type.fn.run(fn, { args: oMetadata.parameters });
                                });
                            }
                        }

                        return oReturnVal;
                    }, //# fn.inject


                    //#########
                    /** Wraps the passed function, ensuring it is executed as much as possible without ever executing more than once per wait duration.
                     *   <br/>The passed function is executed via <code>function.apply()</code>.
                     * @function ish.type.fn.throttle
                     * @param {function} fn Value representing the function to execute.
                     * @param {object} [oOptions] Value representing the desired options:
                     *      @param {variant} [oOptions.context=undefined] Value representing the context (e.g. <code>this</code>) the passed function is executed under.
                     *      @param {integer} [oOptions.wait=500] Value representing the minimum number of milliseconds (1/1000ths of a second) between each call.
                     *      @param {boolean} [oOptions.leading=true] Value representing if the passed function is to be executed immediately on the first call.
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
                        oOptions = oProtected.processFnOptions(oOptions, {
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
                            args = core.type.fn.convert(arguments);
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
                        oOptions = oProtected.processFnOptions(oOptions, {
                            //context: _undefined,
                            leading: false
                        }, 500);

                        return function (/*arguments*/) {
                            var callNow = oOptions.leading && !timeout;
                            context = oOptions.context;
                            args = core.type.fn.convert(arguments);
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
                    /** Creates a proxy function that forwards calls to all registered functions.
                     * @function ish.type.fn.proxy
                     * @returns {function} =proxy Value representing the proxy function that forwards calls to all registered functions along with an interface with the following properties:
                     *      @returns {function} =proxy.add Registers the passed function to the parent proxy function; <code>add(fn)</code>:
                     *          <table class="params">
                     *              <tr><td class="name"><code>fn</code><td><td class="type param-type">function<td><td class="description last">Value representing the function to register.</td></tr>
                     *              <tr><td class="name">Returns:<td><td class="type param-type">boolean<td><td class="description last">Value representing if the passed function has been successfully registered.</td></tr>
                     *          </table>
                     *      @returns {function} =proxy.rm Unregisters the passed function from the parent proxy function; <code>rm(fn)</code>:
                     *          <table class="params">
                     *              <tr><td class="name"><code>fn</code><td><td class="type param-type">function<td><td class="description last">Value representing the function to unregister.</td></tr>
                     *              <tr><td class="name">Returns:<td><td class="type param-type">boolean<td><td class="description last">Value representing if the passed function has been successfully unregistered.</td></tr>
                     *          </table>
                     */ //#####
                    proxy: function (bPreventDefault) {
                        var a_fns = [];

                        //#
                        function callProxy(fn, _arguments, _this) {
                            setTimeout(function () {
                                core.type.fn.run(fn, { args: _arguments, context: _this });
                            }, 0);
                        } //# callProxy


                        return core.extend(
                            function proxy(/*arguments*/) {
                                //#
                                for (var i = 0; i < a_fns.length; i++) {
                                    callProxy(a_fns[i], arguments, this);
                                }
                                return (bPreventDefault === true);
                            }, {
                                //#########
                                /** Registers the passed function to the parent proxy function.
                                 * @function ish.type.fn.proxy:add
                                 * @param {function} fn Value representing the function to register.
                                 * @returns {boolean} Value representing if the passed function has been successfully registered.
                                 * @ignore
                                 */ //#####
                                add: function (fn) {
                                    var bReturnVal = core.type.fn.is(fn);

                                    if (bReturnVal) {
                                        a_fns.push(fn);
                                    }

                                    return bReturnVal;
                                }, //# type.fn.proxy.add

                                //#########
                                /** Unregisters the passed function from the parent proxy function.
                                 * @function ish.type.fn.proxy:rm
                                 * @param {function} fn Value representing the function to unregister.
                                 * @returns {boolean} Value representing if the passed function has been successfully unregistered.
                                 * @ignore
                                 */ //#####
                                rm: function (fn) {
                                    var iIndex = a_fns.indexOf(fn),
                                        bReturnVal = (iIndex > -1)
                                    ;

                                    if (bReturnVal) {
                                        a_fns.splice(iIndex, 1);
                                    }

                                    return bReturnVal;
                                } //# type.fn.proxy.rm
                            }
                        );
                    } //# type.fn.proxy
                }, //# core.type.fn


                //# cmp, cp, unique, matches, randomize, of, countOf, sort
                arr: {
                    //eq: function () {}, //# type.arr.eq

                    //#########
                    /** Compares the passed value to the reference value, determining if the values match, match when coerced or match in a different order.
                     * @function ish.type.arr.cmp
                     * @param {variant[]} x Value representing the array to compare.
                     * @param {variant[]} y Value representing the reference array.
                     * @param {boolean} [bInOrderOnly=false] Value representing if the comparison is to be in matching order only.
                     * @returns {integer|boolean} Value representing if the values match (<code>true</code>), match when coerced (<code>1</code>) or match in a different order (<code>2</code>) the passed relative value with <code>false</code> indicating the arrays do not match.
                     */ //#####
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


                    //#########
                    /** Copies the passed value into a new instance.
                     * @function ish.type.arr.cp
                     * @param {variant[]} x Value representing the array to copy.
                     * @param {boolean|integer} [vMaxDepth=0] Indicates if a deep copy is to occur. <code>false</code>/<code>0</code> performs a shallow copy, a positive integer indicates the max depth to perform a deep copy to, <code>true</code> and all other integer values perform a deep copy to an unlimited depth.
                     * @returns {variant[]} Value representing the passed value as a new instance.
                     */ //#####
                    cp: function (x, vMaxDepth) {
                        var vCurrent, i,
                            a_vReturnVal /* = _undefined */
                        ;

                        //#
                        vMaxDepth = core.type.int.mk((vMaxDepth === true ? -1 : vMaxDepth), 0);

                        //# If the caller passed in a valid a(rray)
                        if (core.type.arr.is(x)) {
                            //#
                            if (vMaxDepth !== 0) {
                                a_vReturnVal = [];

                                //#
                                for (i = 0; i < x.length; i++) {
                                    vCurrent = x[i];

                                    if (core.type.arr.is(vCurrent)) {
                                        a_vReturnVal.push(core.type.arr.cp(vCurrent, vMaxDepth - 1));
                                    }
                                    else if (core.type.obj.is(vCurrent)) {
                                        a_vReturnVal.push(core.type.obj.cp(vCurrent, vMaxDepth - 1));
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
                            //# Else we don't need to do a vMaxDepth, so set our a_vReturnVal to a .slice'd clone of the a(rray)
                            else {
                                a_vReturnVal = x.slice(0);
                            }
                        }

                        return a_vReturnVal;
                    }, //# type.arr.cp


                    //#########
                    /** Determines the unique entries within the passed value.
                     * @function ish.type.arr.unique
                     * @param {variant[]} x Value representing the array to compare.
                     * @param {boolean} [bCaseInsensitive=false] Value representing if the passed value is to be compared in a case-insensitive manor.
                     * @returns {variant[]} Value representing the passed values' unique entries.
                     */ //#####
                    unique: function (x, bCaseInsensitive) {
                        var a_vReturnVal = [];

                        //#
                        bCaseInsensitive = (bCaseInsensitive === true);

                        //#
                        if (core.type.arr.is(x)) {
                            a_vReturnVal = x.reduce(function (acc, v) {
                                if (acc.indexOf(v) === -1 && (!bCaseInsensitive || acc.indexOf((v + "").toLowerCase()) === -1)) {
                                    acc.push(v);
                                }
                                return acc;
                            }, []);
                        }

                        return a_vReturnVal;
                    }, //# type.arr.unique


                    //#########
                    /** Determines the matching entries within the passed values.
                     * @function ish.type.arr.matches
                     * @param {variant[]} x Value representing the array to compare.
                     * @param {variant[]} y Value representing the reference array.
                     * @returns {variant[]} Value representing the passed values' matching entries.
                     */ //#####
                    matches: function (x, y) {
                        var a_vReturnVal = [];

                        if (core.type.arr.is(x) && core.type.arr.is(y)) {
                            a_vReturnVal = x.filter(function (v) {
                                return y.indexOf(v) !== -1;
                            });
                        }

                        return a_vReturnVal;
                    }, //# type.arr.matches


                    //#########
                    /** Randomizes the entries within the passed value.
                     * @function ish.type.arr.randomize
                     * @param {variant[]} x Value to interrogate.
                     * @returns {variant[]} Value representing the passed value's randomized entries.
                     */ //#####
                    randomize: function (x) {
                        var a_vReturnVal = [];

                        if (core.type.arr.is(x)) {
                            a_vReturnVal = x.sort(function (/*a, b*/) {
                                return Math.random() >= 0.5 ? -1 : 1;
                            });
                        }

                        return a_vReturnVal;
                    }, //# type.arr.randomize


                    //#########
                    /** Extracts the passed paths from the within the passed value.
                     * @function ish.type.arr.extract
                     * @param {variant[]} x Value to interrogate.
                     * @param {string|Array<string>} a_vPath Value representing the path to the requested property as a period-delimited string (e.g. "parent.child.array.0.key") or an array of strings.
                     * @returns {variant[]} Value representing the extracted entries from the passed value.
                     */ //#####
                    extract: function (x, vPath) {
                        var i,
                            o_vReturnVal = []
                        ;

                        //#
                        if (core.type.arr.is(x)) {
                            for (i = 0; i < x.length; i++) {
                                o_vReturnVal.push(core.resolve(x[i], vPath));
                            }
                        }

                        return o_vReturnVal;
                    }, //# type.arr.extract


                    //#########
                    /** Counts the instances of the passed value within the passed collection.
                     * @function ish.type.arr.countOf
                     * @param {variant[]} x Value representing the array to interrogate.
                     * @param {variant} vValue Value representing the entries to count.
                     * @returns {integer} Value representing the count of the passed value within the passed collection.
                     */ //#####
                    countOf: function(x, vValue) {
                        var iReturnVal = 0;

                        if (core.type.arr.is(x)) {
                            iReturnVal = x.filter(function (v) {
                                return v === vValue;
                            }).length;
                        }

                        return iReturnVal;
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


                        //#
                        return core.extend(
                            //#########
                            /** Sorts the entries in the passed value into a new array via Javascript's default sort.
                             * @function ish.type.arr.sort
                             * @param {variant[]} x Value representing the array to interrogate.
                             * @param {boolean} bReverse Value representing if the entries are to be reversed.
                             * @returns {variant[]} Value the entries in the passed value into a new array via Javascript's default sort.
                             * @see {@link https://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort/15479354#15479354|StackOverflow.com}
                             */ //#####
                            function (x, bReverse) {
                                var a_vReturnVal = core.type.arr.mk(x).slice(0).sort();
                                return (bReverse ? a_vReturnVal.reverse() : a_vReturnVal);
                            }, {
                                //#########
                                /** Sorts the entries in the passed value into a new array via a natural sort.
                                 * @function ish.type.arr.sort:natural
                                 * @param {variant[]} x Value representing the array to interrogate.
                                 * @param {boolean} bReverse Value representing if the entries are to be reversed.
                                 * @returns {variant[]} Value representing the entries in the passed value into a new array via a natural sort.
                                 * @see {@link https://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort/15479354#15479354|StackOverflow.com}
                                 */ //#####
                                natural: function (a_vArray, bReverse) {
                                    if (core.type.arr.is(a_vArray)) {
                                        var a_vReturnVal = a_vArray.slice(0).sort(naturalCompare);
                                        return (bReverse === true ? a_vReturnVal.reverse() : a_vReturnVal);
                                    }
                                }, //# natural


                                //#########
                                /** Sorts the entries in the passed value into a new array via the comparator.
                                 * @function ish.type.arr.sort:by
                                 * @param {variant[]} x Value representing the array to interrogate.
                                 * @param {object} [oOptions] Value representing the following options:
                                 *      @param {string} [oOptions.path=""] Value representing the path to the requested property as a period-delimited string (e.g. "parent.child.array.0.key") or an array of strings.
                                 *      @param {boolean} [oOptions.reverse=false] Value representing if the entries are to be reversed.
                                 *      @param {function} [oOptions.compare=function (a, b) { return ish.resolve(a, oOptions.path) > ish.resolve(b, oOptions.path); }] Value representing the function that implements the compare, accepting 2 arguments (<code>a</code>, <code>b</code>) and returning truthy if <code>a > b</code>.
                                 * @returns {variant[]} Value representing the entries in the passed value into a new array via the comparator.
                                 */ //#####
                                by: function (a_vArray, vOptions) {
                                    var a_vReturnVal /*= undefined*/,
                                        oOptions = core.type.obj.mk(vOptions),
                                        sPath = core.type.str.mk(oOptions.path),
                                        bReverse = (oOptions.reverse === true),
                                        fnCompare = core.type.fn.mk(oOptions.compare, function (a, b) {
                                            var vA = core.resolve(a, sPath),
                                                vB = core.resolve(b, sPath),
                                                iReturn = 0
                                            ;

                                            //#
                                            if (vA < vB) {
                                                iReturn = 1;
                                            }
                                            else if (vA > vB) {
                                                iReturn = -1;
                                            }
                                            return (iReturn * (bReverse ? 1 : -1));
                                        })
                                    ;

                                    //# If the caller passed in a valid arr.is
                                    if (core.type.arr.is(a_vArray, true)) {
                                        //# Clone the a_vArray into our a_vReturnVal
                                        a_vReturnVal = a_vArray.slice(0);
                                        a_vReturnVal.sort(fnCompare);
                                    }

                                    return a_vReturnVal;
                                } //# by
                            }
                        );
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
                                function (vSource, vCompare) { return core.type.str.is(vSource) && core.type.str.eq(vSource, vCompare, true); }
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
                        is: {
                            //#########
                            /** Determines if the passed value conforms to the passed interface.
                             * @function ish.type.obj.is:interface
                             * @param {object|function} x Value to interrogate.
                             * @param {object} oInterface Value representing the interface, where each value represents a string representing a type under <code>ish.type</code> or a value representing the function that implements the test, accepting 1 argument (<code>x</code>) and returning truthy if the value is of a valid type.
                             * @param {boolean} [bStrict=false] Value indicating if the passed value is not allowed to have any additional keys outside of the those in the passed interface.
                             * @returns {boolean} Value representing if the passed value conforms to the passed interface.
                             */ //#####
                            interface: function (x, oInterface, bStrict) {
                                var a_sKeys, sKey, i,
                                    bReturnVal = (core.type.obj.is(x, { allowFn: true }) && core.type.obj.is(oInterface, true))
                                ;

                                //# If the caller passed in valid values, pull the a_sKeys from the oInterface
                                if (bReturnVal) {
                                    a_sKeys = core.type.obj.ownKeys(oInterface);

                                    //# Traverse the a_sKeys, pulling each sKey as we go
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        sKey = a_sKeys[i];

                                        //# If the current sKey .is a .str, try to .resolve it to core.type[sKey].is
                                        if (core.type.str.is(oInterface[sKey])) {
                                            oInterface[sKey] = core.resolve(core.type, [oInterface[sKey], "is"]);
                                        }

                                        //# If x doesn't .hasOwnProperty, or the current sKey .is(n't) a .fn or the oInterface's test returns falsy, flip our bReturnVal and fall from the loop
                                        if (!x.hasOwnProperty(sKey) ||
                                            !core.type.fn.is(oInterface[sKey]) ||
                                            !oInterface[sKey](x[sKey])
                                        ) {
                                            bReturnVal = false;
                                            break;
                                        }
                                    }

                                    //# If x passed all tests above and we are supposed to be bStrict, ensure x has no other a_sKeys
                                    //#     NOTE: As we tested all of the oInterface's a_sKeys above, so long as x's .ownKeys are the same .length we know there are no additional keys in x
                                    if (bReturnVal && bStrict === true) {
                                        bReturnVal = (core.type.obj.ownKeys(x).length === a_sKeys.length);
                                    }
                                }

                                return bReturnVal;
                            }, //# type.obj.is.interface

                            //#########
                            /** Determines if the passed value has any circular references.
                             * @function ish.type.obj.is:cyclic
                             * @param {object|function} x Value to interrogate.
                             * @param {boolean} bReturnReport Value indicating if an array of circular references is to be returned.
                             * @returns {boolean} Value representing if the passed value has any circular references.
                             */ //#####
                            cyclic: function cr(x, bReturnReport) {
                                var a_sKeys = [],
                                    a_oStack = [],
                                    wm_oSeenObjects = new WeakMap(), //# see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
                                    oReturnVal = {
                                        found: false,
                                        report: []
                                    }
                                ;

                                //# Setup the recursive logic to locate any circular references while kicking off the initial call
                                (function doIsCyclic(oTarget, sKey) {
                                    var a_sTargetKeys, sCurrentKey, i;

                                    //# If we've seen this oTarget before, flip our .found to true
                                    if (wm_oSeenObjects.has(oTarget)) {
                                        oReturnVal.found = true;

                                        //# If we are to bReturnReport, add the entries into our .report
                                        if (bReturnReport) {
                                            oReturnVal.report.push({
                                                instance: oTarget,
                                                source: a_sKeys.slice(0, a_oStack.indexOf(oTarget) + 1).join('.'),
                                                duplicate: a_sKeys.join('.') + "." + sKey
                                            });
                                        }
                                    }
                                    //# Else if oTarget is an instanceof Object, determine the a_sTargetKeys and .set our oTarget into the wm_oSeenObjects
                                    else if (oTarget instanceof Object) {
                                        a_sTargetKeys = Object.keys(oTarget);
                                        wm_oSeenObjects.set(oTarget /*, undefined*/);

                                        //# If we are to bReturnReport, .push the  current level's/call's items onto our stacks
                                        if (bReturnReport) {
                                            if (sKey) { a_sKeys.push(sKey); }
                                            a_oStack.push(oTarget);
                                        }

                                        //# Traverse the a_sTargetKeys, pulling each into sCurrentKey as we go
                                        //#     NOTE: If you want all properties, even non-enumerables, see Object.getOwnPropertyNames() so there is no need to call .hasOwnProperty (per: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
                                        for (i = 0; i < a_sTargetKeys.length; i++) {
                                            sCurrentKey = a_sTargetKeys[i];

                                            //# If we've already .found a circular reference and we're not bReturnReport, fall from the loop
                                            if (oReturnVal.found && !bReturnReport) {
                                                break;
                                            }
                                            //# Else if the sCurrentKey is an instanceof Object, recurse to test
                                            else if (oTarget[sCurrentKey] instanceof Object) {
                                                doIsCyclic(oTarget[sCurrentKey], sCurrentKey);
                                            }
                                        }

                                        //# .delete our oTarget into the wm_oSeenObjects
                                        //#     NOTE: Not 100% sure why this is required, but without it .source is missing above and less .duplicates are found(!?)
                                        wm_oSeenObjects.delete(oTarget);

                                        //# If we are to bReturnReport, .pop the current level's/call's items off our stacks
                                        if (bReturnReport) {
                                            if (sKey) { a_sKeys.pop(); }
                                            a_oStack.pop();
                                        }
                                    }
                                }(x, '')); //# doIsCyclic

                                return (bReturnReport ? oReturnVal.report : oReturnVal.found);
                            } //# type.obj.is.cyclic
                        }, //# type.obj.is

                        //#########
                        /** Determines if the passed values are equal.
                         * @function ish.type.obj.eq
                         * @param {object|function} x Value to interrogate.
                         * @param {object|function} y Value to interrogate.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {function} [oOptions.compare=undefined] Value representing the function that implements the compare, accepting 2 arguments (<code>a</code>, <code>b</code>) and returning truthy if <code>a > b</code>.
                         *      @param {boolean} [oOptions.useCoercion=true] Value representing if coercion is to be used during comparisons.
                         *      @param {boolean} [oOptions.caseInsensitive=false] Value representing if the values are to be compared in a case-insensitive manor.
                         *      @param {boolean} [oOptions.trimWhitespace=false] Value representing if leading and trailing whitespace is to be trimmed prior to comparison.
                         *      @param {boolean|integer} [oOptions.maxDepth=0] Value representing if a deep comparison is to occur. <code>false</code>/<code>0</code> performs a shallow comparison, a positive integer indicates the max depth to perform a deep comparison to, <code>true</code> and all other integer values perform a deep comparison to an unlimited depth.
                         * @returns {boolean} Value representing if the passed values are equal.
                         */ //#####
                        eq: function (x, y, oOptions) {
                            var fnCompare, i,
                                a_sSourceKeys = core.type.obj.ownKeys(x),
                                a_sCompareKeys = core.type.obj.ownKeys(y),
                                bReturnVal = false
                            ;

                            //# If both x and y's .ownkeys match (ignoring the order of the respective arrays)
                            if (core.type.arr.cmp(a_sSourceKeys, a_sCompareKeys /*, false*/)) {
                                //# Set the defaults for the passed oOptions (forcing it into an .is .obj as we go) then calculate our fnCompare
                                oOptions = core.extend({
                                    //compare: core.type.fn.noop,
                                    useCoercion: true,
                                    caseInsensitive: false,
                                    trimWhitespace: false,
                                    maxDepth: 0
                                }, oOptions);
                                oOptions.maxDepth = (
                                    oOptions.maxDepth === false ?
                                    0 :
                                        oOptions.maxDepth === true ?
                                        -1 :
                                            core.type.int.mk(oOptions.maxDepth)
                                );
                                fnCompare = objCompare(oOptions);
                                bReturnVal = true;

                                //#
                                for (i = 0; i < a_sSourceKeys.length; i++) {
                                    if (!fnCompare(x[a_sSourceKeys[i]], y[a_sSourceKeys[i]])) {
                                        bReturnVal = false;
                                        break;
                                    }
                                }
                            }

                            return bReturnVal;
                        }, //# type.obj.eq


                        //#########
                        /** Determines the unique entries within the passed value.
                         * @function ish.type.obj.unique
                         * @param {object[]|function[]} x Value representing the array to compare.
                         * @param {string|string[]} vPaths Value representing the values to interrogate.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {function} [oOptions.compare=undefined] Value representing the function that implements the compare, accepting 2 arguments (<code>a</code>, <code>b</code>) and returning truthy if <code>a > b</code>.
                         *      @param {boolean} [oOptions.useCoercion=true] Value representing if coercion is to be used during comparisons.
                         *      @param {boolean} [oOptions.caseInsensitive=false] Value representing if the values are to be compared in a case-insensitive manor.
                         *      @param {boolean} [oOptions.trimWhitespace=false] Value representing if leading and trailing whitespace is to be trimmed prior to comparison.
                         *      @param {boolean|integer} [oOptions.maxDepth=0] Value representing if a deep comparison is to occur. <code>false</code>/<code>0</code> performs a shallow comparison, a positive integer indicates the max depth to perform a deep comparison to, <code>true</code> and all other integer values perform a deep comparison to an unlimited depth.
                         * @returns {variant[]} Value representing the passed values' unique entries.
                         */ //#####
                        unique: function (x, vPaths, oOptions) {
                            var fnCompare, vCurrentVal, i, j, k, bFound,
                                a_sPaths = core.type.arr.mk(vPaths, [vPaths]),
                                a_vReturnVal = []
                            ;

                            //# Set the defaults for the passed oOptions (forcing it into an .is .obj as we go) then calculate our fnCompare
                            oOptions = core.extend({
                                //compare: core.type.fn.noop,
                                useCoercion: true,
                                caseInsensitive: false,
                                trimWhitespace: false,
                                maxDepth: 0
                            }, oOptions);
                            oOptions.maxDepth = (
                                oOptions.maxDepth === false ?
                                0 :
                                    oOptions.maxDepth === true ?
                                    -1 :
                                        core.type.int.mk(oOptions.maxDepth)
                            );
                            fnCompare = objCompare(oOptions);

                            //# If the passed x value .is and .arr
                            if (core.type.arr.is(x, true)) {
                                //# Traverse our a_sPaths
                                for (i = 0; i < a_sPaths.length; i++) {
                                    //# Traverse the passed x value, flipping bFound to false on each loop
                                    for (j = 0; j < x.length; j++) {
                                        bFound = false;

                                        //# If the current x index .hasOwnProperty, set the vCurrentVal and look at it further
                                        if (x[j] && x[j].hasOwnProperty(a_sPaths[i])) {
                                            vCurrentVal = x[j];

                                            //# Traverse our a_vReturnVal, fnCompare'ing each entry with the vCurrentVal and falling from the loop if it's bFound
                                            for (k = 0; k < a_vReturnVal.length; k++) {
                                                if (fnCompare(core.resolve(a_vReturnVal[k], a_sPaths[i]), core.resolve(vCurrentVal, a_sPaths[i]))) {
                                                    bFound = true;
                                                    break;
                                                }
                                            }
                                        }

                                        //# If the vCurrentVal wasn't bFound in our a_vReturnVal, .push the vCurrentVal in
                                        if (!bFound) {
                                            a_vReturnVal.push(vCurrentVal);
                                        }
                                    }

                                    //#
                                    x = a_vReturnVal;
                                    a_vReturnVal = [];
                                }

                                //#
                                a_vReturnVal = x;
                            }

                            return a_vReturnVal;
                        }, //# type.obj.unique

                        //cmp:

                        //#########
                        /** Copies the passed value into a new instance.
                         * @function ish.type.obj.cp
                         * @param {variant[]} x Value representing the object to copy.
                         * @param {boolean|integer} [vMaxDepth=0] Value representing if a deep copy is to occur. <code>false</code>/<code>0</code> performs a shallow copy, a positive integer indicates the max depth to perform a deep copy to, <code>true</code> and all other integer values perform a deep copy to an unlimited depth.
                         * @returns {variant[]} Value representing the passed value as a new instance.
                         */ //#####
                        cp: function (x, vMaxDepth) {
                            var oReturnVal /* = _undefined */;

                            //# If the caller passed in a valid o(bject), .extend our oReturnVal as a new .is .obj
                            if (core.type.obj.is(x)) {
                                oReturnVal = (vMaxDepth ?
                                    core.extend(vMaxDepth, {}, x) :
                                    core.extend({}, x)
                                );
                            }

                            return oReturnVal;
                        }, //# type.obj.cp


                        //#########
                        /** Copies the referenced keys into a new instance.
                         * @function ish.type.obj.clone
                         * @param {variant[]} x Value representing the object to copy.
                         * @param {string|string[]|object} [vKeysOrFromTo] Value representing the key(s) to copy into the new object, with the option to remap keys when an object is passed.
                         * @returns {variant[]} Value representing the passed value as a new instance.
                         */ //#####
                        clone: function (x, vKeysOrFromTo) {
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
                            //#     NOTE: `core.type.obj.is` returns true for arrays, `{ strict: true }` is required
                            if (core.type.obj.is(vKeysOrFromTo, { strict: true })) {
                                oFromTo = vKeysOrFromTo;
                                a_sOwnKeys = core.type.obj.ownKeys(oFromTo);
                            }
                            //# Else we need to look to the other sources
                            else {
                                //# If the caller passed in an .is .arr of keys, set it into our a_sOwnKeys
                                if (core.type.arr.is(vKeysOrFromTo)) {
                                    a_sOwnKeys = vKeysOrFromTo;
                                }
                                //# Else if x .is .obj, pull it's .ownKeys
                                else if (core.type.obj.is(x)) {
                                    a_sOwnKeys = core.type.obj.ownKeys(x);
                                }

                                //# If we were able to collect the a_sOwnKeys above
                                if (a_sOwnKeys) {
                                    //# Traverse a_sOwnKeys, setting each into our (flat) oFromTo definition
                                    for (i = 0; i < a_sOwnKeys.length; i++) {
                                        oFromTo[a_sOwnKeys[i]] = a_sOwnKeys[i];
                                    }
                                }
                            }

                            //# If vKeysOrFromTo was either an .is .arr or .is .obj
                            if (a_sOwnKeys) {
                                //# If the passed x .is .arr, set our vReturnVal to an array
                                if (core.type.arr.is(x)) {
                                    vReturnVal = [];

                                    //# Traverse the x, .push'ing each .doCopy into our vReturnVal
                                    for (i = 0; i < x.length; i++) {
                                        vReturnVal.push(doCopy(x[i], oFromTo, a_sOwnKeys));
                                    }
                                }
                                //# Else if the passed x .is .obj, .doCopy directly into our vReturnVal
                                else if (core.type.obj.is(x)) {
                                    vReturnVal = doCopy(x, oFromTo, a_sOwnKeys);
                                }
                            }

                            return vReturnVal;
                        }, //# type.obj.clone


                        //#########
                        /** Mutates the passed value into an array.
                         * @function ish.type.obj.toArr
                         * @param {object|function} x Value representing the object to mutate.
                         * @param {string} [sSetKeyAs=undefined] Value representing the name of the key to set the original key's name under.
                         * @returns {variant[]} Value representing the passed value mutated into an array.
                         */ //#####
                        toArr: function (x, sSetKeyAs) {
                            var a_vReturnVal, i,
                                bSetKey = core.type.str.is(sSetKeyAs, true),
                                a_sKeys = (core.type.obj.is(x, { allowFn: true }) ? Object.keys(x) : _undefined)
                            ;

                            //# If the passed x .is .obj, setup our a_vReturnVal
                            if (a_sKeys) {
                                a_vReturnVal = [];

                                //# Traverse the a_sKeys, .push'ing each into our a_vReturnVal and bSetKey (if necessary)
                                for (i = 0; i < a_sKeys.length; i++) {
                                    a_vReturnVal.push(x[a_sKeys[i]]);
                                    if (bSetKey) {
                                        x[a_sKeys[i]][sSetKeyAs] = a_sKeys[i];
                                    }
                                }
                            }

                            return a_vReturnVal;
                        }, //# type.obj.toArr


                        //#########
                        /** Joins the passed value into a string.
                         * @function ish.type.obj.join
                         * @param {object|function} x Value representing the object to join.
                         * @param {string} [sDelimiter=""] Value representing the delimiter to be included between values.
                         * @param {string} [sKeyDelimiter=undefined] Value representing if the keys are to be included within the string, defining the delimiter to be included between keys and their related values.
                         * @returns {variant[]} Value representing the passed value mutated into an array.
                         */ //#####
                        join: function (x, sDelimiter, sKeyDelimiter) {
                            var i,
                                a_sOwnKeys = core.type.obj.ownKeys(x),
                                bIncludeKeys = core.type.str.is(sKeyDelimiter),
                                sReturnVal = ""
                            ;

                            //# Ensure the passed sDelimiter .is a .str, defaulting to "" if need be
                            sDelimiter = core.type.str.mk(sDelimiter);

                            //# If we were able to collect the passed x's a_sOwnKeys
                            if (a_sOwnKeys) {
                                //# If we are supposed to bIncludeKeys, build our sReturnVal accordingly
                                if (bIncludeKeys) {
                                    for (i = 0; i < a_sOwnKeys.length - 1; i++) {
                                        sReturnVal += a_sOwnKeys[i] + sKeyDelimiter + x[a_sOwnKeys[i]] + sDelimiter;
                                    }

                                    //# Append the final key onto our sReturnVal
                                    sReturnVal += a_sOwnKeys[i] + sKeyDelimiter;
                                }
                                //# Else we are not supposed to bIncludeKeys, building our sReturnVal accordingly
                                else {
                                    for (i = 0; i < a_sOwnKeys.length - 1; i++) {
                                        sReturnVal += x[a_sOwnKeys[i]] + sDelimiter;
                                    }
                                }

                                //# Append the final value onto our sReturnVal
                                sReturnVal += x[a_sOwnKeys[i]];
                            }

                            return sReturnVal;
                        }, //# type.obj.join


                        //#########
                        /** Moves the referenced keys into the passed new keys.
                         * @function ish.type.obj.mv
                         * @param {object|function|variant[]} x Value representing the object(s) to interrogate.
                         * @param {object} [oFromTo] Value representing the keys to move.
                         * @param {boolean} [bSetToUndefined=false] Value representing if the moved keys are to be <code>delete</code>d (<code>false</code>) or reset to <code>undefined</code> (<code>true</code>).
                         * @returns {boolean} Value representing if the keys have been moved.
                         */ //#####
                        mv: function (x, oFromTo, bSetToUndefined) {
                            var bReturnVal = core.type.obj.is(oFromTo, { nonEmpty: true });

                            //# If the caller passed in a valid oFromTo, toss our arguments into the oProtected.processObj
                            if (bReturnVal) {
                                bReturnVal = oProtected.processObj(x, oFromTo, bSetToUndefined);
                            }

                            return bReturnVal;
                        }, //# type.obj.mv


                        //#########
                        /** Determines if the referenced keys are present in the passed value.
                         * @function ish.type.obj.has
                         * @param {object|function} x Value representing the object to interrogate.
                         * @param {string|string[]} vKeys Value representing the key(s) to interrogate.
                         * @param {boolean} [bKeysArePaths=true] Value representing if the passed keys represent dot-delimited paths (e.g. <code>grandparent.parent.array.1.property</code>, see: {@link: ish.resolve}).
                         * @returns {boolean} Value representing if the referenced keys are present in the passed value.
                         */ //#####
                        has: function (x, vKeys, bKeysArePaths) {
                            var i,
                                a_sKeys = (core.type.arr.is(vKeys) ? vKeys : [vKeys]),
                                bReturnVal = core.type.fn.is(x, { allowFn: true })
                            ;

                            //# If x is valid
                            if (bReturnVal) {
                                //# If the bKeysArePaths traverse the a_sKeys accordingly
                                if (bKeysArePaths !== false) {
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        //# If the current a_sKeys doesn't .existed in x, unflip our bReturnVal and fall from the loop
                                        if (!core.resolve(core.resolve.returnMetadata, x, a_sKeys[i]).existed) {
                                            bReturnVal = false;
                                            break;
                                        }
                                    }
                                }
                                //# Else we just have to traverse the a_sKeys as-is
                                else {
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        //# If this a_sKeys isn't a .hasOwnProperty of x, unflip our bReturnVal and fall from the loop
                                        if (!x.hasOwnProperty(a_sKeys[i])) {
                                            bReturnVal = false;
                                            break;
                                        }
                                    }
                                }
                            }

                            return bReturnVal;
                        }, //# type.obj.has


                        //#########
                        /** Removes values set to <code>undefined</code> along with any referenced keys from the passed value.
                         * @function ish.type.obj.prune
                         * @param {object|function} x Value representing the object to interrogate.
                         * @param {string|string[]} [vAddlKeysToPrune] Value representing any additional key(s) to remove.
                         * @returns {boolean} Value representing the remaining keys from the passed value.
                         */ //#####
                        prune: function (x, vAddlKeysToPrune) {
                            var sCurrentKey, i,
                                a_sOwnKeys = core.type.obj.ownKeys(x),
                                oReturnVal = core.type.obj.empty()
                            ;

                            //# Ensure the passed vAddlKeysToPrune is an .arr
                            vAddlKeysToPrune = core.type.arr.mk(vAddlKeysToPrune, vAddlKeysToPrune);

                            //#
                            for (i = 0; i < a_sOwnKeys.length; i++) {
                                sCurrentKey = a_sOwnKeys[i];

                                if (x[sCurrentKey] !== _undefined && vAddlKeysToPrune.indexOf(sCurrentKey) === -1) {
                                    oReturnVal[sCurrentKey] = x[sCurrentKey];
                                }
                            }

                            return oReturnVal;
                        }, //# type.obj.prune


                        //#########
                        /** Determines the differences between the passed values.
                         * @function ish.type.obj.diff
                         * @param {object|function} x Value to interrogate.
                         * @param {object|function} y Value to interrogate.
                         * @param {object} [oOptions] Value representing the following options:
                         *      @param {function} [oOptions.compare=undefined] Value representing the function that implements the compare, accepting 2 arguments (<code>a</code>, <code>b</code>) and returning truthy if <code>a > b</code>.
                         *      @param {boolean} [oOptions.useCoercion=true] Value representing if coercion is to be used during comparisons.
                         *      @param {boolean} [oOptions.caseInsensitive=false] Value representing if the values are to be compared in a case-insensitive manor.
                         *      @param {boolean} [oOptions.trimWhitespace=false] Value representing if leading and trailing whitespace is to be trimmed prior to comparison.
                         *      @param {boolean} [oOptions.includeMissingKeys=false] Value representing if keys present in <code>y</code> but missing from <code>x</code> are to be included in the reported differences.
                         *      @param {boolean} [oOptions.caseInsensitiveKeys=false] Value representing if keys are to be treated as case insensitive.
                         *      @param {boolean} [oOptions.pruneUndefinedValues=false] Value representing if if keys with <code>undefined</code> as their value are to be removed from the return value.
                         * @returns {object} Value representing the differences between the passed values.
                         */ //#####
                        diff: function (x, y, oOptions) {
                            var fnCompare, i,
                                a_sSourceKeys = core.type.obj.ownKeys(x),
                                a_sCompareKeys = core.type.obj.ownKeys(y),
                                oReturnVal = core.type.obj.empty()
                            ;

                            //# If we have a_sSourceKeys and a_sCompareKeys (which also determines that the passed x and y .is .obj)
                            if (core.type.arr.is(a_sSourceKeys) && core.type.arr.is(a_sCompareKeys)) {
                                //# Set the defaults for the passed oOptions (forcing it into an .is .obj as we go) then calculate our fnCompare
                                oOptions = core.extend({
                                    //compare: core.type.fn.noop,
                                    useCoercion: true,
                                    caseInsensitive: true,
                                    trimWhitespace: true,
                                    //maxDepth: 0,
                                    includeMissingKeys: true,
                                    caseInsensitiveKeys: true,
                                    pruneUndefinedValues: false
                                }, oOptions, { maxDepth: null });
                                fnCompare = objCompare(oOptions);

                                //# If we are to find .caseInsensitiveKeys, use core.type.obj.get to resolve each a_sSourceKeys
                                if (oOptions.caseInsensitiveKeys) {
                                    //# Traverse the a_sSourceKeys, fnCompare'ing the passed x to the y (loading any mismatches into our oReturnVal) as we go
                                    for (i = 0; i < a_sSourceKeys.length; i++) {
                                        if (!fnCompare(core.type.obj.get(x, a_sSourceKeys[i]), core.type.obj.get(y, a_sSourceKeys[i]))) {
                                            oReturnVal[a_sSourceKeys[i]] = y[a_sSourceKeys[i]];
                                        }

                                        //# .rm the current a_sSourceKeys from our a_sCompareKeys
                                        core.type.arr.rm(a_sCompareKeys, a_sSourceKeys[i]);
                                    }
                                }
                                //# Else the a_sSourceKeys are case sensitive, so resolve each a_sSourceKeys normally
                                else {
                                    //# Traverse the a_sSourceKeys, fnCompare'ing the passed x to the y (loading any mismatches into our oReturnVal) as we go
                                    for (i = 0; i < a_sSourceKeys.length; i++) {
                                        if (!fnCompare(x[a_sSourceKeys[i]], y[a_sSourceKeys[i]])) {
                                            oReturnVal[a_sSourceKeys[i]] = y[a_sSourceKeys[i]];
                                        }

                                        //# .rm the current a_sSourceKeys from our a_sCompareKeys
                                        core.type.arr.rm(a_sCompareKeys, a_sSourceKeys[i]);
                                    }
                                }

                                //# If we are to .includeMissingKeys, traverse any remaining a_sCompareKeys and set them into our oReturnVal
                                if (oOptions.includeMissingKeys) {
                                    for (i = 0; i < a_sCompareKeys.length; i++) {
                                        oReturnVal[a_sCompareKeys[i]] = y[a_sCompareKeys[i]];
                                    }
                                }
                            }

                            return (oOptions.pruneUndefinedValues ? core.type.obj.prune(oReturnVal) : oReturnVal);
                        }, //# type.obj.diff


                        //#########
                        /** Provides access to an object structure's nested properties, returning the first found path.
                         * @function ish.type.obj.resolveFirst
                         * @param {object} oObject Value to interrogate.
                         * @param {Array<string>|Array<Array<string>>} a_vPaths Value representing the paths to the requested property's as a period-delimited string (e.g. "parent.child.array.0.key") or an array of strings.
                         * @returns {variant} Value representing the variant at the referenced path.
                         */ //#####
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


                        //#########
                        /** Provides an object structure as a string in Javascript's Object Literal Notation.
                         * @note <code>JSON.stringify</code> returns <code>Object</code>s in JSON (e.g. with quoted keys <code>{ "key": "value" }</code>) while <code>ish.type.obj.stringify</code> returns <code>Object</code>s in Javascript's Object Literal notation (e.g. <code>{ key: "value" }</code>).
                         * @function ish.type.obj.stringify
                         * @param {object} oObject Value to interrogate.
                         * @returns {variant} Value representing the passed object as a string in Javascript's Object Literal Notation.
                         * @see {@link https://stackoverflow.com/a/11233515/235704|StackOverflow.com}
                         */ //#####
                        stringify: function n(oObject) {
                            var a_sKeys, i,
                                sReturnVal = ""
                            ;

                            //# If the passed oObject .is and .obj
                            if (core.type.obj.is(oObject)) {
                                a_sKeys = Object.keys(oObject); //core.type.obj.ownKeys(oObject);

                                //#
                                for (i = 0; i < a_sKeys.length; i++) {
                                    a_sKeys[i] = a_sKeys[i] + ":" + core.type.obj.stringify(oObject[a_sKeys[i]]);
                                }
                                sReturnVal = "{" + a_sKeys.join(",") + "}";

                                /*return Object
                                    .keys(oObject)
                                    .map(key => `${key}:${core.type.obj.stringify(oObject[key])}`)
                                    .join(",")
                                ;*/
                            }
                            //# Else the passed oObject .is not an .obj, so stringify using the native JSON.stringify
                            else {
                                sReturnVal = JSON.stringify(oObject);
                            }

                            return sReturnVal;
                        }, //# type.obj.stringify


                        //#########
                        /** Creates an empty object.
                         * @$note Creating an object via <code>{}</code> results in an object that includes <code>__proto__</code> and <code>hasOwnProperty</code>. This method returns an object with no properties.
                         * @function ish.type.obj.empty
                         * @returns {object} Value representing an empty object.
                         * @see {@link https://davidwalsh.name/javascript-tricks|DavidWalsh.name}
                         */ //#####
                        empty: function () {
                            return Object.create(_null);
                        } //# type.obj.empty
                    };
                }() //# core.type.obj
            };

            //#
            if (!bServerside) {
                //# cp
                oCoreType.dom = function () {
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
                                        if (_domToAdd) {
                                            _parent.insertBefore(_domToAdd, _parent.childNodes[0]);
                                        }
                                    }
                                }
                                //#
                                else {
                                    for (i = 0; i < vDomToAdd.length; i++) {
                                        _domToAdd = core.type.dom.mk(vDomToAdd[i], null);
                                        if (_domToAdd) {
                                            _parent.appendChild(_domToAdd);
                                        }
                                    }
                                }
                            }
                            //#
                            else if (core.type.dom.is(_domToAdd)) {
                                if (bPrepend) {
                                    _parent.insertBefore(_domToAdd, _parent.childNodes[0]);
                                }
                                else {
                                    _parent.appendChild(_domToAdd);
                                }
                            }
                        }

                        return bReturnVal;
                    } //# pender

                    return {
                        // eq:
                        // cmp:

                        //#########
                        /** Copies the passed value into a new instance using {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode|cloneNode}.
                         * @$note This is functionally a type-safe wrapper of {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode|cloneNode}.
                         * @function ish.type.dom.cp
                         * @param {variant[]} x Value representing the DOM element to copy.
                         * @param {boolean} [bDeepCopy=false] Value representing if the children of the DOM element should also be cloned. <code>false</code> performs a copy of the DOM element only while <code>true</code> also performs a copy of the child DOM elements.
                         * @returns {variant[]} Value representing the passed value as a new instance.
                         */ //#####
                        cp: function (x, bDeepCopy) {
                            if (core.type.dom.is(x) && core.type.fn.is(x.cloneNode)) {
                                return x.cloneNode(bDeepCopy === true);
                            }
                        }, //# type.dom.cp


                        //#########
                        /** Prepends the passed value into the referenced parent as the first element.
                         * @$note The passed DOM elements are passed through {@link: ish.type.dom.mk}.
                         * @function ish.type.dom.prepend
                         * @param {variant} vDomParent Value representing the parent DOM element.
                         * @param {variant} vDomToAdd Value representing the DOM element to insert.
                         * @returns {boolean} Value representing if the passed value was successfully inserted.
                         */ //#####
                        prepend: function (vDomParent, vDomToAdd) {
                            return pender(vDomParent, vDomToAdd, true);
                        }, //# type.dom.prepend


                        //#########
                        /** Appends the passed value into the referenced parent as the last element.
                         * @$note The passed DOM elements are passed through {@link: ish.type.dom.mk}.
                         * @function ish.type.dom.append
                         * @param {variant} vDomParent Value representing the parent DOM element.
                         * @param {variant} vDomToAdd Value representing the DOM element to insert.
                         * @returns {boolean} Value representing if the passed value was successfully inserted.
                         */ //#####
                        append: function (vDomParent, vDomToAdd) {
                            return pender(vDomParent, vDomToAdd /*, false*/);
                        }, //# type.dom.append


                        //#########
                        /** Replaces the referenced DOM element with the passed value.
                         * @$note The passed DOM elements are passed through {@link: ish.type.dom.mk}.
                         * @function ish.type.dom.replace
                         * @param {variant} vTarget Value representing the target DOM element to replace.
                         * @param {variant} vReplacement Value representing the DOM element to insert.
                         * @returns {boolean} Value representing if the passed value was successfully inserted.
                         */ //#####
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

            return oCoreType;
        }); //# core.type

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.type-ex");
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
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = function (core) {
            init(
                core,
                x => Buffer.from(x, 'base64').toString(),
                x => Buffer.from(x).toString('base64')
            );
        };
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], function (core) {
            init(core, window.atob, window.btoa);
        });
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish, window.atob, window.btoa);
    }

    //</MIXIN>
}());
