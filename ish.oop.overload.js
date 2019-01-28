/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';


    /*
    ####################################################################################################
    Class: core.type.fn.overload
    Function Overloading-based functionality (Polymorphism).
    Requires:
    <core.extend>, 
    <core.type.*.is>, <core.type.str.is>, <core.type.fn.is>, <core.type.arr.is>,
    <core.type.arr.mk>, 
    <core.type.fn.call>
    ####################################################################################################
    */
    core.oop.partial(core.oop, function (/*oProtected*/) {
        var a_fnOverloads = [];

        //#
        function registerAlias(fnOverload, fn, sAlias) {
            //#
            if (core.type.str.is(sAlias, _true) && !fnOverload[sAlias]) {
                fnOverload[sAlias] = fn;
            }
        } //# registerAlias

        /*
        Implementation of dynamic polymorphism for Javascript
        */
        return {
            overload: core.extend(
                //#
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
                                            oEntry = _undefined;
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
                                //#
                                add: function (fn, a_vArgumentTests, sAlias) {
                                    var i,
                                        bValid = core.type.fn.is(fn),
                                        iLen = (core.type.arr.is(a_vArgumentTests) ? a_vArgumentTests.length : 0)
                                    ;

                                    //sAlias = 'fn_'+arguments.length+Array.from(arguments).map((arg)=>typeof arg).join('_')

                                    //#
                                    if (bValid) {
                                        //# Traverse the a_vArgumentTests, processinge each to ensure they are functions (or references to )
                                        for (i = 0; i < iLen; i++) {
                                            if (!core.type.fn.is(a_vArgumentTests[i])) {
                                                a_vArgumentTests[i] = core.resolve(core.type, [a_vArgumentTests[i], "is"]);
                                                if (!core.type.fn.is(a_vArgumentTests[i])) {
                                                    bValid = _false;
                                                }
                                            }
                                        }
                                    }

                                    //# If the a_vArgumentTests are bValid, set the info into oData under the a_vArgumentTests's iLen
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
                                        throw "lang.overload: All tests must be functions or strings referencing `is.*`.";
                                    }
                                }, //# overload*.add

                                //#
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
                }, //# lang.overload
                {
                    //#
                    is: function (fnTarget) {
                        return (a_fnOverloads.indexOf(fnTarget) > -1);
                    } //# lang.overload.is
                }
            )
        };
    }); //# core.oop.overload

}(document.querySelector("SCRIPT[ish]").ish);