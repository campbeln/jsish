//################################################################################################
/** @file OOP Dynamic Polymorphism (Function Overloading) mixin for ish.js
 * @mixin ish.oop.overload
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
 */ //############################################################################################
/*global module, define */                                      //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core) {
        //################################################################################################
        /** Collection of OOP Dynamic Polymorphism (Function Overloading)-based functionality.
         * @namespace ish.oop.overload
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.oop, function (/*oProtected*/) {
            var a_fnOverloads = [];

            //#
            function registerAlias(fnOverload, fn, sAlias) {
                //#
                if (core.type.str.is(sAlias, true) && !fnOverload[sAlias]) {
                    fnOverload[sAlias] = fn;
                }
            } //# registerAlias

            return {
                overload: core.extend(
                    //#########
                    /** Initiates a wrapper function that marshals calls to the proper function overload based on argument signature.
                     * @function ish.oop.overload.!
                     * @param {function} [fnDefault] Value representing the default overload function to execute if the arguments cannot be matched to an available overload.
                     * @returns {function} Value representing a wrapper function that marshals calls to the proper function overload based on argument signature, including interfaces to <code>add</code>, <code>default</code> and <code>list</code>.
                     */ //#####
                    function (fnDefault) {
                        var oData = {
                                //#########
                                /** Interface under the returned <code>ish.oop.overload</code> wrapper function that defines the default function overload to execute if the arguments cannot be matched to an available overload.
                                 * @function ish.oop.overload.*:default
                                 * @throws <code>Overload not found for arguments</code> unless defined at initiation.
                                 */ //#####
                                default: (core.type.fn.is(fnDefault) ?
                                    fnDefault :
                                    function (/*arguments*/) {
                                        throw "ish.oop.overload: Overload not found for arguments " + core.type.arr.mk(arguments).join(",");
                                    }
                                )
                            },
                            fnOverload = core.extend(
                                //#
                                function (/*arguments*/) {
                                    var oEntry, i, j,
                                        a = arguments,
                                        oArgumentTests = oData[a.length] || []
                                    ;

                                    //# Traverse the oArgumentTests for the number of passed a(rguments), defaulting the oEntry at the beginning of each loop
                                    for (i = 0; i < oArgumentTests.length; i++) {
                                        oEntry = oArgumentTests[i];

                                        //# Traverse the passed a(rguments), if a .test for the current oArgumentTests fails, reset oEntry and fall from the a(rgument)s loop
                                        for (j = 0; j < a.length; j++) {
                                            if (!oArgumentTests[i].tests[j](a[j])) {
                                                oEntry = undefined;
                                                break;
                                            }
                                        }

                                        //# If all of the a(rgument)s passed the .tests we found our oEntry, so break from the oArgumentTests loop
                                        if (oEntry) {
                                            break;
                                        }
                                    }

                                    //# If we found our oEntry above, .fn.call its .fn
                                    if (oEntry) {
                                        oEntry.calls++;
                                        return core.type.fn.call(oEntry.fn, this, a);
                                    }
                                    //# Else we were unable to find a matching oArgumentTests oEntry, so .fn.call our .default
                                    else {
                                        return core.type.fn.call(oData.default, this, a);
                                    }
                                }, //# overload*
                                {
                                    //#########
                                    /** Interface under the returned <code>ish.oop.overload</code> wrapper function that adds another function to the available overloads.
                                     * @function ish.oop.overload.*:add
                                     * @param {function} fn Value representing the function to add to the available overloads.
                                     * @param {string} sAlias Value representing the unique alias for the passed function.
                                     * @param {function[]|string[]} [a_vArgumentTests] Value representing the argument validators as functions or strings referencing <code>ish.types.*.is</code> functions (e.g. <code>str</code>, <code>int</code>, <code>obj</code>, etc).
                                     */ //#####
                                    add: function (fn, sAlias, a_vArgumentTests) {
                                        var i,
                                            bValid = (core.type.fn.is(fn) && core.type.str.is(sAlias, true) && !fnOverload[sAlias]),
                                            iLen = (core.type.arr.is(a_vArgumentTests) ? a_vArgumentTests.length : 0)
                                        ;

                                        //sAlias = 'fn_'+arguments.length+Array.from(arguments).map((arg)=>typeof arg).join('_')

                                        //#
                                        if (bValid) {
                                            //# Traverse the a_vArgumentTests, processing each to ensure they are functions (or references to )
                                            for (i = 0; i < iLen; i++) {
                                                if (!core.type.fn.is(a_vArgumentTests[i])) {
                                                    a_vArgumentTests[i] = core.resolve(core.type, [a_vArgumentTests[i], "is"]);
                                                    if (!core.type.fn.is(a_vArgumentTests[i])) {
                                                        bValid = false;
                                                    }
                                                }
                                            }
                                        }

                                        //# If the a_vArgumentTests are bValid, set the info into oData under the a_vArgumentTests' iLen
                                        if (bValid) {
                                            oData[iLen] = oData[iLen] || [];
                                            oData[iLen].push({
                                                fn: fn,
                                                tests: a_vArgumentTests,
                                                calls: 0
                                            });

                                            //#
                                            registerAlias(fnOverload, fn, sAlias);
                                            //return fnOverload;
                                        }
                                        //# Else one of the passed arguments was not bValid, so throw the error
                                        else {
                                            throw "ish.oop.overload: All tests must be functions or strings referencing `type.*.is`.";
                                        }
                                    }, //# overload.*.add

                                    //#########
                                    /** Interface under the returned <code>ish.oop.overload</code> wrapper function that lists the available overloaded functions.
                                     * @function ish.oop.overload.*:list
                                     * @param {integer} [iArgumentCount] Value representing the desired argument count to limit the returned list to.
                                     * @returns {object} Value representing the available overloaded functions categorized by argument count.
                                     */ //#####
                                    list: function (iArgumentCount) {
                                        return (arguments.length > 0 ? oData[iArgumentCount] || [] : oData);
                                    } //# overload.*.list
                                }
                            ) //# fnOverload = core.extend(
                        ;

                        //#
                        a_fnOverloads.push(fnOverload);
                        //registerAlias(fnOverload, oData.default, oData.alias);

                        return fnOverload;
                    }, //# oop.overload
                    {
                        //#########
                        /** Determines if the passed value is a wrapper function that marshals calls to the proper function overload based on argument signature.
                         * @function ish.oop.overload.is
                         * @param {function} fnTarget Value representing the function to test.
                         * @returns {boolean} Value representing if the passed value is a wrapper function that marshals calls to the proper function overload based on argument signature.
                         */ //#####
                        is: function (fnTarget) {
                            return (a_fnOverloads.indexOf(fnTarget) > -1);
                        } //# oop.overload.is
                    }
                )
            };
        }); //# core.oop.overload
    } //# init


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
}());
