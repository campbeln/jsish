/** ################################################################################################
 * Plain Old Javascript Object Parser mixin for ishJS
 * @mixin ish.type.obj.pojo
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
################################################################################################# */
!function (fnMaskedEvaler) {
    'use strict';

    //$z.type.obj.pojo('{ neek: false, camp: core.type.str.is("yep") }', null, { context: { core: $z }, check: true })
    function init(core) {
        /*
        ####################################################################################################
        Class: core.type.obj.pojo
        Additional Variable Type-based functionality (type.*.cp, type.*.cmp, type.*.eq, type.*.rm, etc) plus uuid, enum and query.
        Requires:
        <core.resolve>, <core.extend>,
        <core.type.fn.is>, <core.type.arr.is>, <core.type.obj.is>, <core.type.str.is>, <core.type.date.is>,
        <core.type.str.mk>, <core.type.int.mk>, <core.type.date.mk>, <core.type.float.mk>,
        <core.type.fn.call>,
        ~<core.io.net.get>
        ####################################################################################################
        */
        core.oop.partial(core.type.obj, function (/*oProtected*/) {
            return {
                pojo: core.extend(
                    /*
                    Function: pojo
                    Determines if the passed value is a string representing a Plain Old Javascript Object (POJO).
                    Parameters:
                    sPojo - The string to interrogate.
                    vDefault - The default value to return if casting fails.
                    oOptions - Object representing the desired options:
                        oOptions.context - Object who's keys represent the variables to expose to the `eval`uated string.
                        oOptions.check - Boolean value representing if the passed sPojo is to be verified via `type.pojo.check`.
                        oOptions.reject - Variant; Boolean value representing if functions are to be rejected, or Array of strings representing the values that cause a POJO string to be rejected. Default: `["eval", "Function", ".prototype.", ".constructor", "function", "=>"]`.
                    Returns:
                    Object representing the `eval`uated Plain Old Javascript Object (POJO).
                    */
                    function (sPojo, vDefault, oOptions) {
                        var oReturnVal = (arguments.length > 1 ? vDefault : {}),
                            oArguments = {
                                //r: null,
                                //e: null,
                                js: sPojo
                            }
                        ;

                        //#
                        oOptions = core.type.obj.mk(oOptions);

                        //# If we (seem) to be eval'ing a valid sPojo run it in our fnMaskedEvaler, collecting the .r(esult) into our oReturnVal
                        if (core.type.pojo.check(sPojo, (oOptions.check ? oOptions.reject : null))) {
                            fnMaskedEvaler(oArguments, core.type.obj.is(oOptions.context, true) ?
                                { o: oOptions.context, k: core.type.obj.ownKeys(oOptions.context), c: '' } :
                                null
                            );
                            oReturnVal = oArguments.r || oReturnVal;
                        }

                        return oReturnVal;
                    }, {
                        /*
                        Function: check
                        Determines if the passed value is a safe string representing a Plain Old Javascript Object (POJO).
                        Parameters:
                        sPojo - The string to interrogate.
                        vReject - Variant; Boolean value representing if functions are to be rejected, or Array of strings representing the values that cause a POJO string to be rejected. Default: `["eval", "Function", ".prototype.", ".constructor", "function", "=>"]`.
                        Note:
                        This function represents a "better than nothing" approach to checking the relative safety of the passed sPojo string, however, sPojo strings should only be loaded from trusted sources.
                        Returns:
                        Boolean value representing if the value is a string representing a safe Plain Old Javascript Object (POJO).
                        */
                        check: function (sPojo, vReject) {
                            var i,
                                bReturnVal = core.type.arr.is(vReject),
                                a_vReject = (bReturnVal ? vReject : [
                                    /eval(\/\*.*?\*\/)?(\/\/.*?)?\(/g, /Function(\/\*.*?\*\/)?(\/\/.*?)?\(/g,
                                    ".prototype.", ".constructor"
                                ])
                            ;

                            //# If the borrowed bReturnVal is indicating that vReject isn't an .arr and vReject also isn't false, then ensure that functions are a_vReject'd as well
                            if (!bReturnVal && vReject !== false) {
                                a_vReject = a_vReject.concat([/function(\/\*.*?\*\/)?(\/\/.*?)?\(/g, "=>"]);
                            }

                            //# Remove all whitespace from the passed sPojo then reset our bReturnVal based on its value
                            sPojo = core.type.str.mk(sPojo).replace(/\s/g, "");
                            bReturnVal = (sPojo && sPojo[0] === "{" && sPojo[sPojo.length - 1] === "}");

                            //# If sPojo seems valid thus far, traverse the a_vReject array, flipping our bReturnVal and falling from the loop if we find any a_vReject's
                            if (bReturnVal) {
                                for (i = 0; i < a_vReject.length; i++) {
                                    if (a_vReject[i] instanceof RegExp) {
                                        if (a_vReject[i].test(sPojo)) {
                                            bReturnVal = false;
                                            break;
                                        }
                                    }
                                    else if (sPojo.indexOf(a_vReject[i]) > -1) {
                                        bReturnVal = false;
                                        break;
                                    }
                                }
                            }

                            return bReturnVal;
                        } //# type.obj.pojo.check
                    }
                )
            };
        }); //# core.type.obj.pojo
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
}(
    //#
    //#     NOTE: The fnMaskedEvaler is placed here to limit its scope and local variables as narrowly as possible (hence the use of `arguments[x]`)
    //#     Based on code inspired by https://stackoverflow.com/a/543820/235704
    function /*fnMaskedEvaler*/(oData, oInjectData) {
        var i,
            a_sKeys = Object.keys(this || {}),
            oMask = {}
        ;

        //# oMask out the locally accessible objects (including i, oMask and a_sKeys)
        for (i = 0; i < a_sKeys.length; i++) {
            oMask[a_sKeys[i]] = undefined;
        }

        //# If oInjectData was passed, traverse the injection .o(bject) .shift'ing off the c(urrent) .k(ey) as we go and set each as a local var
        if (oInjectData) {
            while (oInjectData.k.length > 0) {
                oInjectData.c = oInjectData.k.shift();
                //eval("var " + oInjectData.c + "=oInjectData.o[oInjectData.c];");
                oMask[oInjectData.c] = oInjectData.o[oInjectData.c];
            }
        }

        try {
            //eval("oData.r=" + oData.js);
            oData.r = (new Function("with(this){return " + oData.js + "}")).call(oMask);
        } catch (e) {
            //# An error occurred fnEval'ing the current index, so set .r(esult) to null and log the .e(rror)
            oData.r = null;
            oData.e = e;
        }

        //# Return the modified oData to the caller
        //#     NOTE: As this is modified byref there is no need to actually return oData
        //return oData;
    } //# fnMaskedEvaler
);
