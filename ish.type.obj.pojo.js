//################################################################################################
/** @file Plain Old Javascript Object Parser mixin for ish.js
 * @mixin ish.type.obj.pojo
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell (wrapper)
 */ //############################################################################################
/*global module, define, global */                              //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function (fnMaskedEvaler) {
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
                            fnMaskedEvaler(
                                oArguments,
                                0,
                                core.type.obj.is(oOptions.context, true) ?
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
    function /*fnMaskedEvaler*/(/* oData, i, oInjectData */) {
        //# Create the oMask under a SEAF to keep it's locals out of scope
        arguments[3] = (function /*setMask*/(oInjectData) {
            var j,
                oMask = {},
                oThis = this || {},
                bServerside = (typeof window === 'undefined'),
                a_sKeys = Object.keys(bServerside ? global : window || {})
            ;

            //# Also oMask the following reserved words
            a_sKeys = a_sKeys.concat(["arguments", "eval", "Function"]);

            //# oMask out the locally accessible objects (including i, oMask and a_sKeys)
            for (j = 0; j < a_sKeys.length; j++) {
                oMask[a_sKeys[j]] = undefined;
            }

            //# un-oMask the oThis-based variables
            a_sKeys = Object.keys(oThis);
            for (j = 0; j < a_sKeys.length; j++) {
                oMask[a_sKeys[j]] = oThis[a_sKeys[j]];
            }

            //# un-oMask the oInjectData.o-based variables
            a_sKeys = Object.keys(oInjectData || {});
            for (j = 0; j < a_sKeys.length; j++) {
                oMask[a_sKeys[j]] = oInjectData[a_sKeys[j]];
            }

            return oMask;
        }).call(this, arguments[2].o);

        //# Ensure the passed i (aka arguments[1]) is 0
        //#     NOTE: i (aka arguments[1]) must be passed in as 0 ("bad assignment")
        //arguments[1] = 0;

        //# Traverse the .js, processing each entry as we go
        //#     NOTE: We use a getto-version of a for loop below to keep JSHint happy and to limit the exposed local variables to `arguments` only
        //#     NOTE: .call the New Function with `use strict` inline to avoid automatic access to the Global object, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply and fixes issues in setTimeout, see: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
        while (arguments[1] < arguments[0].js.length) {
            try {
                //eval(arguments[0].js[arguments[1]]);
                (new Function("with(this){" + arguments[0].js[arguments[1]] + "}")).call(arguments[3]);
            } catch (e) {
                //# An error occured fnEval'ing the current index, so .push undefined into this index's entry in .results and log the .errors
                arguments[0].results.push(undefined);
                arguments[0].errors.push({ index: arguments[1], error: e, js: arguments[0].js[arguments[1]] });
            }
            arguments[1]++;
        }

        //# Return the modified oData to the caller
        //#     NOTE: As this is modified byref there is no need to actually return oData
        //return arguments[0];
    } //# fnMaskedEvaler
));
