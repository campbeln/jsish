//################################################################################################
/** @file Javascript Evaluation mixin for ish.js
 * @mixin ish.io.evaler
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2021, Nick Campbell
 */ //############################################################################################
/*global module, define, global */                              //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
//<MIXIN>
(function (fnEvalerMetaFactory) {
    'use strict';

    var bServerside = (typeof window === 'undefined'),
        _root = (bServerside ? global : window),
        _document = (bServerside ? {} : document)
    ;


    function init(core) {
        //# Build the passed fnEvalerMetaFactory
        //#     NOTE: The fnLocalEvaler is specifically placed outside of the "use strict" block to allow for the local eval calls below to persist across eval'uations
        var $evalFactory = fnEvalerMetaFactory(_root, _document, { //# baseServices
            is: {
                arr: function (x) {
                    return core.type.arr.is(x);
                },
                fn: function (x) {
                    return core.type.fn.is(x);
                },
                obj: function (o, bAllowFn) {
                    return core.type.obj.is(o, { allowFn: bAllowFn });
                },
                str: function (s) {
                    //# NOTE: This function also treats a 0-length string (null-string) as a non-string
                    return core.type.str.is(s, true);
                }
            }, //# is

            newId: core.resolve(core.type, "dom.id"), //# !bServerside

            extend: core.extend,
            serverside: bServerside
        });


        //################################################################################################
        /** Collection of Javascript Evaluation-based functionality.
         * @namespace ish.io.evaler
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io, function (/*oProtected*/) {
            var eEnvironments = {
                global: "global",
                local: "local",
                masked: "masked",
                useStrict: "useStrict",
                json: "json"
            };

            //# If we are not on the bServerside, also setup .isolated and .sandbox (as they require DOM interaction)
            if (!bServerside) {
                eEnvironments.isolated = "isolated";
                eEnvironments.sandbox = "sandbox";
            }

            //#########
            /** Interface to evaluate Javascript under the established <code>this</code>/context and environment.
             * @callback fnIshIoEvaler
             * @param {string|string[]} vJS Value representing the Javascript string(s) to evaluate.
             * @param {object} [oInjectData=undefined] Value representing the variables to expose to the code to be evaluated.
             * @param {boolean} [bReturnAsMetadata=false] Value representing if the metadata object <code>{ js: string[], results: variant[], errors: object[{ index: integer, error: object, js: string }] }</code> is returned in place of any returned value(s) from the evaluated Javascript.
             * @returns {variant|object} Value representing the returned value(s) (if any) from the evaluated Javascript or the metadata object.
             */ //#####
            return {
                //#########
                /** Provides an interface to evaluate Javascript under the passed <code>this</code>/context and environment.
                 * @function ish.io.evaler.!
                 * @param {object} oThis Value representing the <code>this</code> context to evaluate the Javascript under. <note><code>ish.io.evaler.types.masked</code> utilize this argument as the scope rather than <code>this</code> context.</note>
                 * @param {string} [eEnvironment=ish.io.evaler.environment.masked] Value representing the type of evaluation environment.
                 * @returns {fnIshIoEvaler} Value representing the requested evaler function; <code>evaler(vJS, oInjectData, bReturnAsMetadata)</code>.
                 */ //#####
                evaler: core.extend(
                    function (oThis, eEnvironment) {
                        var fnReturnVal;

                        //# Ensure the eEnvironment defaults to .masked if it was not passed in
                        eEnvironment = core.type.str.mk(eEnvironment, eEnvironments.masked);

                        //# If the passed eEnvironment is recognized
                        if (core.type.fn.is($evalFactory[eEnvironment])) {
                            //# If this is a .sandbox request, create a new $iframe
                            if (eEnvironment === eEnvironments.sandbox) {
                                fnReturnVal = $evalFactory[eEnvironment]($evalFactory.iframeFactory("allow-scripts", "" /*, undefined*/)).global();
                            }
                            //# Else setup the .evaler via our $evalFactory
                            else {
                                fnReturnVal = $evalFactory[eEnvironment](oThis);
                            }
                        }

                        //(vJS, oInject, bReturnObject)
                        return fnReturnVal;
                    }, //# io.evaler
                    {
                        //#########
                        /** Enumeration of Javascript evaluation environments.
                         * @function ish.io.evaler:environments
                         * @$asProperty
                         * @returns {object} =environments Value representing the following properties:
                         *      @returns {object} =environments.global Value representing Javascript evaluation in the global context.
                         *      @returns {object} =environments.local Value representing Javascript evaluation in a local function-scoped context.
                         *      @returns {object} =environments.masked Value representing Javascript evaluation in a local function-scoped context with all global variables masked.
                         *      @returns {object} =environments.useStrict Value representing Javascript evaluation in a local function-scoped context with <code>'use strict';</code> applied.
                         *      @returns {object} =environments.json Value representing Javascript evaluation via <code>JSON.parse()</code>.
                         *      @returns {object} =environments.isolated Value representing Javascript evaluation in an iFrame's global context.<note><client>Client-side only.</client></note>
                         *      @returns {object} =environments.sandbox Value representing Javascript evaluation in an iFrame's global context via <code>window.postMessage</code>.<note><client>Client-side only.</client></note>
                         */ //#####
                        environments: eEnvironments
                    }
                )
            };
        }); //# core.io.evaler

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.evaler");
    } //# init


    //# If we are running server-side
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
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
    //# Pass in the fnEvalerMetaFactory used by cjs3Core
    //#     NOTE: We pass in the fnEvalerFactory requirements locally into the metaFactory, with the generated $services (along with window and document) passed into the factory later
    function /*fnEvalerMetaFactory*/(fnEvalerFactory, fnLocalEvaler, fnMaskedEvaler, fnUseStrictEvaler, fnSandboxEvalerFactory /*, $services*/) {
        return function (_root, _document, $services) {
            //# Build the passed fnEvalerFactory
            //#     NOTE: The fnLocalEvaler is specifically placed outside of the "use strict" block to allow for the local eval calls below to persist across eval'uations
            return fnEvalerFactory(_root, _document, $services, fnLocalEvaler, fnMaskedEvaler, fnUseStrictEvaler, fnSandboxEvalerFactory);
        };
    }(
        //# <EvalerJS>
        //# Base factory for the evaler logic
        //#     NOTE: $services requires - is.arr(x), is.obj(x), is.fn(x), is.str(x) [fnSandboxEvalerFactory], newId(sPrefix)
        function /*fnEvalerFactory*/(_root, _document, $services, fnLocalEvaler, fnMaskedEvaler, fnUseStrictEvaler, fnSandboxEvalerFactory) {
            "use strict";

            var fnJSONParse, oEvalerFactory,
                sVersion = "v0.10a",
                fnGlobalEvaler = null
            ;

            //# Optionally returns a Javascript string or sets up the fnGlobalEvaler to access the global version of eval
            function getGlobalEvaler(bCode) {
                //# Build the Javascript code that safely collects the global version of eval
                //#     NOTE: A fallback function is recommended as in some edge cases this function can return `undefined`
                //#     NOTE: Based on http://perfectionkills.com/global-eval-what-are-the-options/#the_problem_with_geval_windowexecscript_eval
                var sGetGlobalEval =
                        "try{" +
                            "var _root=(typeof window==='undefined'?global:window)" + //# Node support
                            "return(function(g,Object){" +
                                "return((1,eval)('Object')===g" +
                                    "?function(){return(1,eval)(arguments[0]);}" +
                                    ":(_root.execScript?function(){return _root.execScript(arguments[0]);}:undefined)" +
                                ");" +
                            "})(Object,{});" +
                        "}catch(e){return undefined;}"
                ;

                //# If we are supposed to return the bCode, do so now
                if (bCode) {
                    return sGetGlobalEval;
                }
                //# Else if we haven't setup the fnGlobalEvaler yet, do so now
                //#     NOTE: A function defined by a Function() constructor does not inherit any scope other than the global scope (which all functions inherit), even though we are not using this paticular feature (as getGlobalEvaler gets the global version of eval)
                else if (fnGlobalEvaler === null) {
                    fnGlobalEvaler = new Function(sGetGlobalEval)();
                }
            } //# getGlobalEvaler


            //# Factory function that configures and returns a looper function for the passed fnEval and oContext
            function looperFactory(fnEval, $root, oContext, bInContext /*, $sandboxWin*/) {
                //# Return the configured .looper function to the caller
                return function evaler(vJS, oInject, bReturnObject) {
                    var i,
                        bAsArray = $services.is.arr(vJS),
                        bInjections = $services.is.obj(oInject),
                        oReturnVal = {
                            js: (bAsArray ? vJS : [vJS]),
                            results: [],
                            errors: []
                        }
                    ;

                    //# Determine the type of fnEval and process accordingly
                    switch (fnEval) {
                        case fnLocalEvaler:
                        case fnMaskedEvaler:
                        case fnUseStrictEvaler: {
                            //# Polyfill Object.keys for use by calls to fnLocalEvaler, fnMaskedEvaler and fnUseStrictEvaler
                            //#     NOTE: From http://tokenposts.blogspot.com.au/2012/04/javascript-objectkeys-browser.html via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
                            if (!Object.keys) Object.keys = function (o) {
                                if (o !== Object(o))
                                    throw new TypeError('Object.keys called on a non-object');
                                var k = [], p;
                                for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
                                return k;
                            };

                            //# As this is either fnLocalEvaler, fnMaskedEvaler or fnUseStrictEvaler, we need to let them traverse the .js and non-oContext oInject'ions, so call them accordingly
                            //#     NOTE: oReturnVal is updated byref, so there is no need to collect a return value
                            if (bInContext) {
                                fnEval.call(oContext, oReturnVal, 0, (bInjections ? { o: oInject, k: Object.keys(oInject), c: '' } : null));
                            } else {
                                fnEval(oReturnVal, 0, (bInjections ? { o: oInject, k: Object.keys(oInject), c: '' } : null));
                            }
                            break;
                        }
                        default: {
                            //# If we have a $root (as 'json' does not) and the passed oInject .is.obj
                            if ($root && bInjections) {
                                //# Traverse oInject, setting each .hasOwnProperty into the $root (leaving $root's current definition if there is one)
                                for (i in oInject) {
                                    if ($root[i] === undefined && oInject.hasOwnProperty(i)) {
                                        $root[i] = oInject[i];
                                    }
                                }
                            }

                            //# Traverse the .js, .pushing each fnEval .results into our oReturnVal (optionally .call'ing bInContext if necessary as we go)
                            for (i = 0; i < oReturnVal.js.length; i++) {
                                try {
                                    //oReturnVal.results.push(bInContext ? fnEval.call(oContext, oReturnVal.js[i]) : fnEval(oReturnVal.js[i]));
                                    oReturnVal.results.push(fnEval(oReturnVal.js[i]));
                                } catch (e) {
                                    //# An error occured fnEval'ing the current i(ndex), so .push undefined into this i(ndex)'s entry in .results and log the .errors
                                    oReturnVal.results.push(undefined);
                                    oReturnVal.errors.push({ index: i, error: e, js: oReturnVal.js[i] });
                                }
                            }
                        }
                    }

                    //# If we are supposed to bReturnObject return our oReturnVal, else only return the .results (either bAsArray or just the first index)
                    return (bReturnObject ? oReturnVal : (bAsArray ? oReturnVal.results : oReturnVal.results[0]));
                };
            } //# looperFactory


            //# Adds an IFRAME to the DOM based on the passed sSandboxAttr and sURL
            function iframeFactory(sSandboxAttr, sURL, $domTarget) {
                var sID = $services.newId("sandbox");

                //# As long as the caller didn't request an IFRAME without a sandbox attribute, reset sSandboxAttr to an attribute definition
                sSandboxAttr = (sSandboxAttr === null ?
                    '' :
                    ' sandbox="' + (sSandboxAttr ? sSandboxAttr : "allow-scripts") + '"'
                    );

                //# .insertAdjacentHTML IFRAME at the beginning of the .body (or .head)
                //#     NOTE: In order to avoid polyfilling .outerHTML, we simply hard-code the IFRAME code below
                //#     TODO: Optionally calculate sURL based on the script path
                ($domTarget || _document.body || _document.head || _document.getElementsByTagName("head")[0])
                    .insertAdjacentHTML('afterbegin', '<iframe src="' + sURL + '" id="' + sID + '" style="display:none;"' + sSandboxAttr + '></iframe>')
                ;

                //# Return the $iframe object to the caller
                return _document.getElementById(sID);
            } //# iframeFactory


            //# Factory function that returns a looper function for the requested evaluation eMode, oContext and oConfig
            function evalerFactory(eMode, oContext, oConfig) {
                var fnEvaler, fnReturnValue,
                    sEval = "eval",
                    bContextPassed = (oContext !== undefined && oContext !== null)
                ;

                //# Default the oContext to _root if it wasn't passed
                //#     TODO: Is this default value logic still required?
                oContext = (bContextPassed ? oContext : _root);

                //# Determine the eMode and process accordingly
                switch (eMode/*.substr(0, 1).toLowerCase()*/) {
                    //# global (meaning oContext should be a window object)
                    case "g": {
                        //# If this is a request for the current _root
                        if (oContext === _root) {
                            //# Ensure the fnGlobalEvaler has been setup, then safely set it (or optionally fnLocalEvaler if we are to .f(allback)) into fnEvaler
                            getGlobalEvaler();
                            fnEvaler = (!fnGlobalEvaler && oConfig.f ? fnLocalEvaler : fnGlobalEvaler);

                            //# If we were able to collect an fnEvaler above, return the configured looper
                            if (fnEvaler) {
                                fnReturnValue = looperFactory(fnEvaler, _root/*, undefined, false*/);
                            }
                        }
                        //# Else if the passed oContext has an .eval function (e.g. it's a window object)
                        //#     NOTE: We Do some back flips with sEval below because strict mode complains about using .eval as it's a pseudo-reserved word, see: https://mathiasbynens.be/notes/reserved-keywords
                        else if ($services.is.fn(oContext[sEval])) {
                            //# Attempt to collect the foreign fnGlobalEvaler, then safely set it (or optionally the foreign fnLocalEvaler if we are to .f(allback)) into fnEvaler
                            fnEvaler = oContext[sEval]("(function(){" + getGlobalEvaler(true) + "})()");
                            fnEvaler = (!fnEvaler && oConfig.f ? function (/* sJS */) { return oContext[sEval](arguments[0]); } : fnEvaler);

                            //# If we were able to collect an fnEvaler above, return the configured looper (or the fnEvaler if this is a .r(ecursiveCall))
                            if (fnEvaler) {
                                fnReturnValue = (oConfig.r ? fnEvaler : looperFactory(fnEvaler, oContext/*, undefined, false*/));
                            }
                        }
                        //# Else the passed oContext is not valid for a global request, so return undefined
                        //#     NOTE: The code below isn't actually necessary as this is the default behavior of a function with no defined return
                        //else {
                        //    return undefined;
                        //}
                        break;
                    }
                    //# local
                    case "l": {
                        fnReturnValue = looperFactory(fnLocalEvaler, _root, oContext, bContextPassed);
                        break;
                    }
                    //# masked
                    case "m": {
                        fnReturnValue = looperFactory(fnMaskedEvaler, _root, oContext, bContextPassed);
                        break;
                    }
                    //# "use strict"
                    case "u": {
                        fnReturnValue = looperFactory(fnUseStrictEvaler, _root, oContext, bContextPassed);
                        break;
                    }
                    //# isolated
                    case "i": {
                        if (!$services.serverside) {
                            //# Ensure the passed oConfig .is.obj, then build the IFRAME and collect its .contentWindow
                            //#     NOTE: We send null into .iframeFactory rather than "allow-scripts allow-same-origin" as browsers log a warning when this combo is set, and as this is simply an isolated (rather than a sandboxed) scope the code is trusted, but needs to have its own environment
                            oConfig = ($services.is.obj(oConfig) ? oConfig : {});
                            oConfig.iframe = iframeFactory(null, "" /*, undefined*/);
                            oConfig.window = oConfig.iframe.contentWindow;

                            //# Recurse to collect the isolated .window's fnEvaler (signaling to .f(allback) and that we are .r(ecursing))
                            fnEvaler = evalerFactory("g", oConfig.window, { f: 1, r: 1 });

                            //# Return the configured looper, defaulting oContext to the $sandboxWin if !bContextPassed
                            //#     NOTE: Since we default oContext to _root above, we need to look at bContextPassed to send the correct second argument
                            //#     NOTE: Due to the nature of eval'ing in the global namespace, we are not able to .call with a oContext
                            //fnReturnValue = looperFactory(fnEvaler, oConfig.window, (bContextPassed ? oContext : null), bContextPassed);
                            //fnReturnValue = looperFactory(fnEvaler, oConfig.window /*, oContext, bContextPassed*/);
                            var fnReturnValue2 = looperFactory(fnEvaler, oConfig.window /*, oContext, bContextPassed*/);

                            // neek
                            fnReturnValue = function (one, two, three) {
                                return fnReturnValue2(one, two, three);
                            };
                        }
                        break;
                    }
                        //# json
                    case "j": {
                        //# JSON.parse never allows for oInject'ions nor a oContext, so never pass a oContext into the .looperFactory (which in turn locks out oInject'ions)
                        fnReturnValue = looperFactory(fnJSONParse/*, _root, undefined, undefined, false*/);
                        break;
                    }
                }

                return fnReturnValue;
            } //# evalerFactory


            //# Set our .version and .extend the passed $services with our own EvalerJS (evaler) logic
            //#      NOTE: Setting up $services like this allows for any internal logic to be overridden as well as allows for all versions of CjsSS to coexist under a single definition (though some .conf logic would need to be used)
            //$services.version.evaler = sVersion; //# neek
            if (!$services.serverside) {
                $services.extend($services, {
                    evaler: {
                        iframeFactory: iframeFactory
                    }
                });
            }

            //# If the native JSON.parse is available, set fnJSONParse to it
            if (_root.JSON && _root.JSON.parse) {
                fnJSONParse = _root.JSON.parse;
            }

            //# Configure and return our return value
            oEvalerFactory = {
                ver: sVersion,
                global: function (bFallback, $root) {
                    return evalerFactory("g", $root || _root, { f: bFallback });
                },
                //local: undefined,
                //masked: undefined,
                //useStrict: undefined,
                isolated: function (oReturnedByRef) {
                    return evalerFactory("i", null, oReturnedByRef);
                }
                //json: undefined
                //sandbox: undefined
            };
            if (fnLocalEvaler) {
                oEvalerFactory.local = function (oContext) {
                    return evalerFactory("l", oContext /*, {}*/);
                };
            }
            if (fnMaskedEvaler) {
                oEvalerFactory.masked = function (oContext) {
                    return evalerFactory("m", oContext /*, {}*/);
                };
            }
            if (fnUseStrictEvaler) {
                oEvalerFactory.useStrict = function (oContext) {
                    return evalerFactory("u", oContext /*, {}*/);
                };
            }
            if (fnJSONParse) {
                oEvalerFactory.json = function () {
                    return evalerFactory("j" /*, undefined, {}*/);
                };
            }
            if (!$services.serverside && fnSandboxEvalerFactory) {
                oEvalerFactory.sandbox = fnSandboxEvalerFactory(_root, $services, { looper: looperFactory, iframe: iframeFactory });
            }
            return oEvalerFactory;
        },

        //#
        //#     NOTE: Placed here to limit its scope and local variables as narrowly as possible (hence the use of arguments[0])
        function /*fnLocalEvaler*/(/* oData, i, oInjectData */) {
            //# If oInjectData was passed, traverse the injection .o(bject) .shift'ing off a .k(ey) at a time as we set each as a local var
            if (arguments[2]) {
                while (arguments[2].k.length > 0) {
                    arguments[2].c = arguments[2].k.shift();
                    eval("var " + arguments[2].c + "=arguments[2].o[arguments[2].c];");
                }
            }

            //# Ensure the passed i (aka arguments[1]) is 0
            //#     NOTE: i (aka arguments[1]) must be passed in as 0 ("bad assignment")
            //arguments[1] = 0;

            //# Traverse the .js, processing each entry as we go
            //#     NOTE: We use a getto-version of a for loop below to keep JSHint happy and to limit the exposed local variables to `arguments` only
            while (arguments[1] < arguments[0].js.length) {
                try {
                    eval(arguments[0].js[arguments[1]]);
                } catch (e) {
                    //# An error occured fnEval'ing the current index, so .push undefined into this index's entry in .results and log the .errors
                    arguments[0].results.push(undefined);
                    arguments[0].errors.push({ index: arguments[1], error: e, js: arguments[0].js[arguments[1]] });
                }
                arguments[1]++;
            }

            //# Return the modified arguments[0] to the caller
            //#     NOTE: As this is modified byref there is no need to actually return arguments[0]
            //return arguments[0];
        },

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
            //#     TODO: .call the New Function with `use strict` inline to avoid automatic access to the Global object, see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply and fixes issues in setTimeout, see: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
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
        },

        //#
        //#     NOTE: Placed here to limit its scope and local variables as narrowly as possible (hence the use of arguments[0])
        //#     NOTE: Since we cannot conditionally invoke strict mode (see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#Invoking_strict_mode) we need 2 implementations for fnLocalEvaler and fnUseStrictEvaler
        function /*fnUseStrictEvaler*/(/* oData, i, oInjectData */) {
            //# If oInjectData was passed, traverse the injection .o(bject) .shift'ing off a .k(ey) at a time as we set each as a local var
            //#     NOTE: We do this outside of the "use strict" function below so we don't need to pollute the global context while still having persistent var's across eval'uations (which "use strict" doesn't allow)
            if (arguments[2]) {
                while (arguments[2].k.length > 0) {
                    arguments[2].c = arguments[2].k.shift();
                    eval("var " + arguments[2].c + "=arguments[2].o[arguments[2].c];");
                }
            }

            //# Ensure the passed i (aka arguments[1]) is 0
            //#     NOTE: i (aka arguments[1]) must be passed in as 0 ("bad assignment")
            //arguments[1] = 0;

            //# Setup the internal function with "use strict" in place
            (function () {
                "use strict";

                //# Traverse the .js, processing each entry as we go
                //#     NOTE: We use a getto-version of a for loop below to keep JSHint happy and to limit the exposed local variables to `arguments` only
                while (arguments[1] < arguments[0].js.length) {
                    try {
                        eval(arguments[0].js[arguments[1]]);
                    } catch (e) {
                        //# An error occured fnEval'ing the current index, so .push undefined into this index's entry in .results and log the .errors
                        arguments[0].results.push(undefined);
                        arguments[0].errors.push({ index: arguments[1], error: e, js: arguments[0].js[arguments[1]] });
                    }
                    arguments[1]++;
                }
            })(arguments[0], 0, arguments[2]);

            //# Return the modified arguments[0] to the caller
            //#     NOTE: As this is modified byref there is no need to actually return arguments[0]
            //return arguments[0];
        },

        //#
        //#     NOTE: $services requires - is.arr(x), is.str(x)
        function /*fnSandboxEvalerFactory*/(_window, $services, $factories) {
            "use strict";

            var oPromiseFns = {},
                bSendingString = false,
                bInit = false,
                iID = 0
            ;


            //# Returns a promise interface that uses .postMessage
            function promise(sType, oContext /*, bInContext, $sandboxWin*/) {
                //# Pull the $sandboxWin from the passed arguments
                //#     NOTE: Since .looperFactory or .promise are called based on the scope, both have to conform to an argument list while both have differing requirements. arguments[2] (aka bInContext) is used by looperFactory while arguments[3] (aka $sandboxWin) is used by promise. Further, in order to avoid unused variables/JSHint complaints, we need to collect $sandboxWin from the arguments
                var $sandboxWin = arguments[3];

                //# If we we have not yet .init'd .postMessage under our own _window, do so now
                //#     NOTE: The looping logic is contained below allowing us to run multiple statements in order and without needing to track that all callbacks have been made
                //#     NOTE: Due to the nature of .$sandbox and the code below, the eval'uated code is exposed to only the "s" variable in the .global and .local functions
                if (!bInit) {
                    bInit = true;

                    //# Ensure the .addEventListener interface is setup/polyfilled then .addEventListener under our _window so we can recieve the .postMessage's
                    _window.addEventListener = _window.addEventListener || function (e, f) { _window.attachEvent('on' + e, f); };
                    _window.addEventListener("message",
                        function (oMessage) {
                            var oData;

                            //# Ensure bSendingString has been setup then collect our oData
                            //#     NOTE: IE8-9 do not allow the transmission of objects via .postMessage, so we have to JSON.stringify/.parse in their case (or any other case where objects aren't sent), thankfully IE8-9 support JSON!
                            bSendingString = $services.is.str(oMessage.data);
                            oData = (bSendingString ? _window.JSON.parse(oMessage.data) : oMessage.data);

                            //# If the .origin is null and we have the .id within our .promises
                            //#     NOTE: Non-"allow-same-origin" sandboxed IFRAMEs return "null" rather than a valid .origin so we need to check the .source before accepting any .postMessage's
                            if (oMessage.origin === "null" && oPromiseFns[oData.id]) {
                                //# Fire the fnCallback stored in .promises (and protected by validating the .source), passing back the .r(esult) and the .arg(ument) then delete it from .promises
                                //#     NOTE: Filtering based on .source/$targetWin is done within the .promises functions
                                oPromiseFns[oData.id](
                                    oMessage.source,
                                    {
                                        results: oData.r,
                                        errors: oData.e,
                                        js: oData.js
                                    },
                                    oData.arg
                                );
                                delete oPromiseFns[oData.id];
                            }
                        },
                        false
                    );

                    //# .postMessage to ourselves so we can ensure bSendingString has been setup (targetDomain'ing * to ensure we can target ourselves)
                    try {
                        _window.postMessage({}, "*");
                    } catch (e) {
                        bSendingString = true;
                    }
                }

                //# Return the promise to the caller
                return function (vJS, oInject, bReturnObject) {
                    var bAsArray = $services.is.arr(vJS);

                    return {
                        then: function (fnCallback, sArg) {
                            var oData = {
                                js: (bAsArray ? vJS : [vJS]),
                                id: iID++,
                                arg: sArg,
                                type: sType,
                                context: oContext,
                                inject: oInject
                            };

                            //# Set our fnCallback within .promises, filtering by $sandboxWin to ensure we trust the $source
                            oPromiseFns[iID] = function ($source, oResults, sArg) {
                                if ($source === $sandboxWin) {
                                    //# If we are supposed to bReturnObject return our oResults, else only return the .results (either bAsArray or just the first index)
                                    fnCallback(
                                        (bReturnObject ? oResults : (bAsArray ? oResults.results : oResults.results[0])),
                                        sArg
                                    );
                                }
                            };

                            //# .postMessage to our $sandboxWin (post-incrementing .id as we go and targetDomain'ing * so we reach our non-"allow-same-origin")
                            $sandboxWin.postMessage(
                                (bSendingString ? _window.JSON.stringify(oData) : oData),
                                "*"
                            );
                        }
                    };
                };
            } //# promise


            //# Wires up a sandbox within the passed $iframe
            //#     NOTE: http://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/#privilege-separation , https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage
            function sandboxFactory($iframe) {
                var $sandboxWin = $iframe.contentWindow,
                //# Set bUsePostMessage and fnProcess based on the presence of allow-same-origin and .postMessage
                //#     NOTE: There is no need for a bFailover to add "allow-same-origin" if .postMessage isn't supported as both of these features are modern and either supported in pair or not
                    bUsePostMessage = (_window.postMessage && ($iframe.getAttribute("sandbox") + "").indexOf("allow-same-origin") === -1),
                    fnProcess = (bUsePostMessage ? promise : $factories.looper)
                ;

                //# Return the sandbox interface to the caller
                return {
                    iframe: $iframe,
                    window: $sandboxWin,
                    secure: bUsePostMessage,

                    //# Global/Isolated eval interface within the sandbox
                    //#     NOTE: There is no point to pass a $root here as we use the passed $iframe's .contentWindow
                    global: function (bFallback /*, $root*/) {
                        var sInterface = (bFallback ? "isolated" : "global");

                        return fnProcess(
                            (bUsePostMessage ? sInterface : $sandboxWin.$sandbox[sInterface]),
                            $sandboxWin
                            //, false
                        );
                    },

                    //# Local/Context eval interface within the sandbox
                    local: function (oContext) {
                        var bContextPassed = (arguments.length === 1),
                            sInterface = (bContextPassed ? "context" : "local")
                        ;

                        return fnProcess(
                            (bUsePostMessage ? sInterface : $sandboxWin.$sandbox[sInterface]),
                            oContext || $sandboxWin,
                            bContextPassed,
                            $sandboxWin
                        );
                    }
                };
            } //# sandboxFactory


            //# Return the sandbox factory to the caller
            return function (v1, v2, v3) {
                //# Determine how many arguments were passed and process accordingly
                switch (arguments.length) {
                    //# If we are called with nutin' setup a new non-"allow-same-origin"'d $iframe
                    case 0: {
                        sandboxFactory($factories.iframe("allow-scripts", "" /*, undefined*/));
                        break;
                    }
                    //# If we were called with an $iframe
                    case 1: {
                        sandboxFactory(v1);
                        break;
                    }
                    //# If we were called with a sSandboxAttr, sURL and optional $domTarget
                    case 2:
                    case 3: {
                        sandboxFactory($factories.iframe(v1, v2, v3));
                        break;
                    }
                }
            }; //# return
        }

        /* { //# Example implementation of $services as required by fnEvalerFactory and fnSandboxEvalerFactory
            //# Datatype checking functionality
            is: {
                str: function (s) {
                    //# NOTE: This function also treats a 0-length string (null-string) as a non-string
                    return ((typeof s === 'string' || s instanceof String) && s !== ''); //# was: (typeof s === 'string' || s instanceof String);
                },
                arr: function (a) {
                    return (_Object_prototype_toString.call(a) === '[object Array]');
                },
                obj: function (o, bAllowFn) {
                    return (o && o === Object(o) && (bAllowFn === true || !$baseServices.is.fn(o)));
                },
                fn: function (f) {
                    return (_Object_prototype_toString.call(f) === '[object Function]');
                }
            }, //# is

            extend: ish.extend,
            serverside: (typeof window === 'undefined'),

            //# Returns an unused HTML ID
            //#     NOTE: Use the following snipit to ensure a DOM _element has an .id while still collecting the sID: `sID = _element.id = _element.id || $baseServices.newId();`
            //#     NOTE: sPrefix must begin with /A-Za-z/ to be HTML4 compliant (see: http://stackoverflow.com/questions/70579/what-are-valid-values-for-the-id-attribute-in-html)
            newId: function (sPrefix) {
                var sReturnVal;

                //# Ensure a sPrefix was passed
                sPrefix = sPrefix || $baseServices.config.attr + "_";

                //# Do while our sReturnVal exists as a DOM ID in the _document, try to find a unique ID returning the first we find
                do {
                    sReturnVal = sPrefix + Math.random().toString(36).substr(2, 5);
                } while (_document.getElementById(sReturnVal));

                return sReturnVal;
            } //# newId
        }*/
        //# </EvalerJS>
    ) //# fnEvalerMetaFactory
));
//</MIXIN>