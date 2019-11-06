//################################################################################################
/** @file OOP Dynamic Polymorphism (Function Overloading) mixin for ishJS
 * @mixin ish.oop.overload
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
 */ //############################################################################################
!function () {
    'use strict';

    function init(core) {
        //################################################################################################
        /** Collection of OOP Dynamic Polymorphism (Function Overloading)-based functionality.
         * @namespace ish.oop.inherit
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
                    /** Overloads the passed value, returning a wrapper function that marshalls the calls to the proper function based on argument signature.
                     * @function ish.oop.overload.!
                     * @param {object|function} vOptions Value representing the object to inherit into.
                     * @returns {function} Value representing a wrapper function that marshalls the calls to the proper function based on argument signature, including interfaces to <code>add</code> and <code>list</code>.
                     */ //#####
                    function (vOptions) {
                        var oData = core.extend({
                                default: function (/*arguments*/) {
                                    throw "Overload not found for arguments: [" + core.type.arr.mk(arguments) + "]";
                                }
                            }, (core.type.fn.is(vOptions) ? { default: vOptions } : vOptions)),
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
                                    /** Add.
                                     * @function ish.oop.overload.*.add
                                     * @param {object|function} vOptions Value representing the object to inherit into.
                                     * @returns {function} Value representing a wrapper function that marshalls the calls to the proper function based on argument signature, including interfaces to <code>add</code> and <code>list</code>.
                                     */ //#####
                                    add: function (fn, a_vArgumentTests, sAlias) {
                                        var i,
                                            bValid = core.type.fn.is(fn),
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

                                            return fnOverload;
                                        }
                                        //# Else one of the passed arguments was not bValid, so throw the error
                                        else {
                                            throw "oop.overload: All tests must be functions or strings referencing `type.*.is`.";
                                        }
                                    }, //# overload*.add

                                    //#########
                                    /** List.
                                     * @function ish.oop.overload.*.list
                                     * @param {object|function} vOptions Value representing the object to inherit into.
                                     * @returns {function} Value representing a wrapper function that marshalls the calls to the proper function based on argument signature, including interfaces to <code>add</code> and <code>list</code>.
                                     */ //#####
                                    list: function (iArgumentCount) {
                                        return (arguments.length > 0 ? oData[iArgumentCount] || [] : oData);
                                    } //# overload*.list
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
                        /** Determines if the passed value has been the subject of function overloading.
                         * @function ish.oop.overload.is
                         * @param {function} fnTarget Value representing the function to test.
                         * @returns {boolean} Value representing if the passed value has been the subject of function overloading.
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
}();
