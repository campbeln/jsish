//################################################################################################
/** @file Plain Old Javascript Object Parser mixin for ish.js
 * @mixin ish.type.obj.pojo
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell (wrapper)
 */ //############################################################################################
!function (fnMaskedEvaler) {
    'use strict';

    //$z.type.obj.pojo('{ neek: false, camp: core.type.str.is("yep") }', null, { context: { core: $z }, check: true })
    function init(core) {
        //################################################################################################
        /** Collection of Plain Old Javascript Object (POJO) Parser-based functionality.
         * @namespace ish.type.obj.pojo
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.type.obj, function (/*oProtected*/) {
            return {
                pojo: core.extend(
                    //#########
                    /** Parses the passed value as a string representing a Plain Old Javascript Object (POJO).
                     * @function ish.type.obj.pojo.!
                     * @param {string} x Value representing the POJO data to parse.
                     * @param {variant} [vDefaultVal=undefined] Value representing the default return value if parsing fails.
                     * @param {object} [oOptions] Value representing the following options:
                     *      @param {object|function} [oOptions.context=null] Value representing the context that exposes properties and functionality the passed value is parsed under.
                     *      @param {boolean|string[]} [oOptions.reject=["eval", "Function", ".prototype.", ".constructor", "function", "=>"]] Value representing if functions are to be rejected or array of strings representing the values that cause a POJO string to be rejected.
                     * @returns {object[]} Value representing the POJO data.
                     * @see {@link https://stackoverflow.com/a/543820/235704|StackOverflow}
                     */ //#####
                    function (x, vDefaultVal, oOptions) {
                        var oReturnVal = (arguments.length > 1 ? vDefaultVal : {}),
                            oArguments = {
                                //r: null,
                                //e: null,
                                js: x
                            }
                        ;

                        //#
                        oOptions = core.type.obj.mk(oOptions);

                        //# If we (seem) to be eval'ing a valid POJO run it in our fnMaskedEvaler, collecting the .r(esult) into our oReturnVal
                        if (core.type.pojo.check(x, oOptions.reject)) {
                            fnMaskedEvaler(oArguments, core.type.obj.is(oOptions.context, true) ?
                                { o: oOptions.context, k: core.type.obj.ownKeys(oOptions.context), c: '' } :
                                null
                            );
                            oReturnVal = oArguments.r || oReturnVal;
                        }

                        return oReturnVal;
                    }, {
                        //#########
                        /** Determines if the passed value is a safe string representing a Plain Old Javascript Object (POJO).
                         * @$note This represents a "better than nothing" approach to checking the relative safety of the passed value. However, values should only be loaded from trusted sources.
                         * @function ish.type.obj.pojo.check
                         * @param {string} x Value representing the POJO data to check.
                         * @param {boolean|string[]} [vReject=["eval", "Function", ".prototype.", ".constructor", "function", "=>"]] Value representing if functions are to be rejected or array of strings representing the values that cause a POJO string to be rejected.
                         * @returns {object[]} Value representing if the POJO data is relatively safe.
                         */ //#####
                        check: function (x, vReject) {
                            var i,
                                bReturnVal = core.type.arr.is(vReject),
                                a_vReject = (bReturnVal ? vReject : [
                                    /eval(\/\*.*?\*\/)?(\/\/.*?)?\(/g, /Function(\/\*.*?\*\/)?(\/\/.*?)?\(/g,
                                    ".prototype.", ".constructor" //, ".call"
                                ])
                            ;

                            //# If the borrowed bReturnVal is indicating that vReject isn't an .arr and vReject also isn't false, then ensure that functions are a_vReject'd as well
                            if (!bReturnVal && vReject !== false) {
                                a_vReject = a_vReject.concat([/function(\/\*.*?\*\/)?(\/\/.*?)?\(/g, "=>"]);
                            }

                            //# Remove all whitespace from the passed x then reset our bReturnVal based on its value
                            x = core.type.str.mk(x).replace(/\s/g, "");
                            bReturnVal = (x && x[0] === "{" && x[x.length - 1] === "}");

                            //# If x seems valid thus far, traverse the a_vReject array, flipping our bReturnVal and falling from the loop if we find any a_vReject's
                            if (bReturnVal) {
                                for (i = 0; i < a_vReject.length; i++) {
                                    if (a_vReject[i] instanceof RegExp) {
                                        if (a_vReject[i].test(x)) {
                                            bReturnVal = false;
                                            break;
                                        }
                                    }
                                    else if (x.indexOf(a_vReject[i]) > -1) {
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

        //# oMask out the locally accessible objects (including i, oMask and a_sKeys), then ensure that oMask is still accessible via `this` (per: https://stackoverflow.com/questions/543533/restricting-eval-to-a-narrow-scope/543820#comment36708109_543820)
        for (i = 0; i < a_sKeys.length; i++) {
            oMask[a_sKeys[i]] = undefined;
        }
        oMask["this"] = oMask;

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
