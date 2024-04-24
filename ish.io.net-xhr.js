//################################################################################################
/** @file XHR Networking mixin for ish.js
 * @mixin ish.io.net
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2023, Nick Campbell
 * @ignore
 */ //############################################################################################
/*global module, define, require, XMLHttpRequest, ActiveXObject, Promise */ //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                                 //# Enable max complexity warnings for JSHint
(function () {
    'use strict'; //<MIXIN>

    function init(core, XHRConstructor) {
        //################################################################################################
        /** Collection of XHR Networking-based functionality.
         * @namespace ish.io.net
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io.net, function (oProtected) {
            var _undefined /*= undefined*/,
                //fnBaseVerbs = oProtected.verbs,
                oXHROptions = {
                    async: true,
                    cache: true,
                    useCache: false
                    //beforeSend: undefined,
                    //onreadystatechange: undefined
                }
            ;


            //# Processes the verb into the correct response type (fetch, xhr or xhrAsync)
            function processVerb(sVerb, sUrl, oBody, oOptions) {
                return (oOptions.hasOwnProperty("fn") ?         //# If this is an xhr request
                    (core.type.fn.is(oOptions.fn) ?             //# If this is a sync xhr request
                        doXhr(sVerb, sUrl, oBody, core.extend({}, oXHROptions, oOptions)).send(oBody) :
                        doXhrPromise(sVerb, sUrl, oBody, core.extend({}, oXHROptions, oOptions))
                    ) :                                         //# Else this is a fetch request
                    oProtected.doFetch(sVerb, sUrl, oBody, oOptions)
                );
            } //# processVerb


            //# Safely returns a new xhr instance via the XHRConstructor
            function getXhr() {
                //# IE5.5+ (ActiveXObject IE5.5-9), based on http://toddmotto.com/writing-a-standalone-ajax-xhr-javascript-micro-library/
                try {
                    return new XHRConstructor('MSXML2.XMLHTTP.3.0');
                } catch (e) {
                    core.type.is.ish.expectedErrorHandler(e);
                    //return undefined;
                }
            } //# getXhr


            //# Wrapper for an XHR call
            function doXhr(sVerb, sUrl, oBody, oOptions) {
                var oReturnVal, iMS,
                    bResponseTypeText = (!oOptions.responseType || (core.type.str.is(oOptions.responseType, true) && oOptions.responseType.trim().toLowerCase() === "text")),
                    bAsync = !!oOptions.async,
                    $xhr = getXhr(),
                    bValidRequest = ($xhr && core.type.str.is(sUrl, true)),
                    bAbort = false,
                    oData = core.resolve(core.io.net.cache(), [sVerb.toLowerCase(), sUrl])
                ;

                //# If we are supposed to .useCache and we were able to find the oData in the .cache
                if (oOptions.useCache && core.type.obj.is(oData)) {
                    //#
                    core.resolve($xhr, 'fromCache', true); //# $xhr.fromCache = true;
                    oOptions.fn( /* bSuccess, oData, vArg, $xhr */
                        oData.ok,
                        oData,
                        oOptions.arg,
                        $xhr
                    );
                }
                //# Else if we were able to collect an $xhr object and we have an sUrl
                else if (bValidRequest) {
                    //# Setup the $xhr callback
                    //$xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    $xhr.onreadystatechange = function () {
                        //# If the request is finished and the .responseText is ready
                        if ($xhr.readyState === 4) {
                            oData = {
                                ok: (($xhr.status >= 200 && $xhr.status <= 299) || ($xhr.status === 0 && sUrl.substr(0, 7) === "file://")),
                                status: $xhr.status,
                                url: sUrl,
                                verb: sVerb,
                                async: bAsync,
                                aborted: bAbort,
                                response: $xhr[bResponseTypeText ? 'responseText' : 'response'],
                                text: bResponseTypeText ? $xhr.responseText : null,
                                json: bResponseTypeText ? core.type.fn.tryCatch(JSON.parse)($xhr.responseText) : null
                            };
                            oData.loaded = oData.ok; //# TODO: Remove
                            oData.data = oData.json; //# TODO: Remove

                            //#
                            if (oOptions.cache) {
                                core.resolve(true, core.io.net.cache(), [sVerb.toLowerCase(), sUrl], oData);
                            }

                            //# If the oData isn't .ok, we haven't bAbort'ed and we have a .retry function, recurse via setTimeout to run another $xhr instance
                            if (
                                !oData.ok &&
                                !bAbort &&
                                core.type.fn.is(oOptions.retry) &&
                                core.type.int.is(iMS = oOptions.retry(oOptions.attempts++))
                            ) {
                                setTimeout(function () {
                                    doXhr(sVerb, sUrl, oBody, oOptions)
                                        .send(oBody)
                                    ;
                                }, iMS);
                            }
                            //#
                            else {
                                oOptions.fn(/* bSuccess, oData, vArg, $xhr */
                                    !bAbort && oData.ok,
                                    oData,
                                    oOptions.arg,
                                    $xhr
                                );
                            }
                        }
                    };
                }
                //# Else we were unable to collect the $xhr, so signal a failure to the oOptions.fn
                else {
                    core.type.fn.call(oOptions.fn, [false, null, oOptions.arg, $xhr]);
                }

                //# Build then return our (mostly) chainable oReturnVal
                oReturnVal = {
                    xhr: $xhr,
                    send: function (vBody, fnHook) {
                        var a_sKeys, i,
                            sBody = ""
                        ;

                        //# If we were able to collect an $xhr object and we have an sUrl, .open and .send the request now
                        if (bValidRequest) {
                            $xhr.open(sVerb, sUrl, bAsync);

                            //#
                            if (core.type.str.is(vBody)) {
                                sBody = vBody;
                            }
                            else if (core.type.obj.is(vBody)) {
                                sBody = JSON.stringify(vBody);
                            }
                            else if (core.type.is.value(vBody)) {
                                sBody = core.type.str.mk(vBody);
                            }

                            //#
                            if (core.type.fn.is(fnHook)) {
                                fnHook($xhr);
                            }
                            //#
                            else {
                                if (core.type.obj.is(oOptions.headers)) {
                                    a_sKeys = core.type.obj.ownKeys(oOptions.headers);
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        $xhr.setRequestHeader(a_sKeys[i], oOptions.headers[a_sKeys[i]]);
                                    }
                                }
                                if (core.type.str.is(oOptions.mimeType, true)) {
                                    $xhr.overrideMimeType(oOptions.mimeType); // 'application/json; charset=utf-8' 'text/plain'
                                }
                                if (core.type.str.is(oOptions.contentType, true)) {
                                    $xhr.setRequestHeader('Content-Type', oOptions.contentType); //# 'text/plain'
                                }
                                if (core.type.str.is(oOptions.responseType, true)) {
                                    $xhr.responseType = oOptions.responseType; //# 'text'
                                }
                                if (!oOptions.useCache) {
                                    $xhr.setRequestHeader("Cache-Control", "no-cache, max-age=0");
                                }
                            }

                            $xhr.send(sBody || null);
                        }
                        return oReturnVal;
                    },
                    abort: function () {
                        bAbort = true;
                        $xhr.abort();
                        core.io.console.warn("ish.io.net: Aborted " + sVerb + " " + sUrl);
                        return oReturnVal;
                    }
                };
                return oReturnVal;
            } //# xhr
            doXhr.options = function (oOptions) {
                core.extend(oXHROptions, oOptions);
                return oXHROptions;
            }; //# doXhr.options


            //# Wrapper for a Promise-ified XHR call
            function doXhrPromise(sVerb, sUrl, oBody, oOptions) {
                var bResponseTypeText;

                //#
                function setupXhr(fnPromiseResolve, fnPromiseReject) {
                    var a_sKeys, oData, iMS, i,
                        $xhr = getXhr()
                    ;

                    //# Setup the $xhr callback
                    $xhr.onreadystatechange = function () {
                        //# If the request is finished and the .responseType is ready
                        if ($xhr.readyState === 4) {
                            oData = {
                                ok: (($xhr.status >= 200 && $xhr.status <= 299) || ($xhr.status === 0 && sUrl.substr(0, 7) === "file://")),
                                status: $xhr.status,
                                url: sUrl,
                                verb: sVerb,
                                async: true,
                                aborted: false,
                                response: $xhr[bResponseTypeText ? 'responseText' : 'response'],
                                text: (bResponseTypeText ? $xhr.responseText : null),
                                json: (bResponseTypeText ? core.type.fn.tryCatch(JSON.parse)($xhr.responseText) : null)
                            };
                            //oData.loaded = oData.ok;
                            //oData.data = oData.json;

                            //#
                            if (oXHROptions.cache) {
                                core.resolve(true, core.io.net.cache(), [sVerb.toLowerCase(), sUrl], oData);
                            }

                            //# If the oData was not .ok and we have a oOptions.retry, recurse via setTimeout to run another $xhr instance (calculating the iMS as we go)
                            if (
                                !oData.ok &&
                                core.type.fn.is(oOptions.retry) &&
                                core.type.int.is(iMS = oOptions.retry(oOptions.attempts++))
                            ) {
                                setTimeout(function () {
                                    $xhr = setupXhr(fnPromiseResolve, fnPromiseReject);
                                }, iMS);
                            }
                            //# If the oData was .ok, fnPromiseResolve
                            else if (oData.ok) {
                                fnPromiseResolve(oData);
                            }
                            //# Else the oData isn't .ok, so fnPromiseReject
                            else {
                                //fnPromiseReject(oData);
                                fnPromiseResolve(oData);
                            }
                        }
                    };

                    //#
                    $xhr.open(sVerb, sUrl, true);
                    if (core.type.obj.is(oOptions.headers)) {
                        a_sKeys = core.type.obj.ownKeys(oOptions.headers);
                        for (i = 0; i < a_sKeys.length; i++) {
                            $xhr.setRequestHeader(a_sKeys[i], oOptions.headers[a_sKeys[i]]);
                        }
                    }
                    if (core.type.str.is(oOptions.mimeType, true)) {
                        $xhr.overrideMimeType(oOptions.mimeType); // 'application/json; charset=utf-8' 'text/plain'
                    }
                    if (core.type.str.is(oOptions.contentType, true)) {
                        $xhr.setRequestHeader('Content-Type', oOptions.contentType); //# 'text/plain'
                    }
                    if (core.type.str.is(oOptions.responseType, true)) {
                        $xhr.responseType = oOptions.responseType; //# 'text'
                    }
                    if (!oOptions.useCache) {
                        $xhr.setRequestHeader("Cache-Control", "no-cache, max-age=0");
                    }

                    return $xhr;
                } //# setupXhr


                //# Ensure the passed oOptions .is an .obj then set bResponseTypeText
                oOptions = core.type.obj.mk(oOptions);
                bResponseTypeText = (!oOptions.responseType || (core.type.str.is(oOptions.responseType, true) && oOptions.responseType.trim().toLowerCase() === "text"));

                //# Wrap the new Promise() call, returning undefined if it's unavailable
                try {
                    return new Promise(function (resolve, reject) {
                        var $xhr = setupXhr(resolve, reject);
                        $xhr.send(oBody);
                    });
                } catch (e) {
                    //return undefined;
                }
            } //# doXhrPromise


            //# Processes the vCallOptions for XHR calls
            function processXHROptions(vCallOptions) {
                return (core.type.fn.is(vCallOptions) ?
                    { fn: vCallOptions, arg: null /*, cache: oOptions.cache, useCache: oOptions.useCache */ } :
                    vCallOptions
                );
            } //# processXHROptions


            //# Override oProtected's .verbs to wire in .processVerb
            oProtected.verbs = {   //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                get: function (vBaseOptions) {
                    return function (sUrl, vCallOptions) {
                        return processVerb("GET", sUrl, _undefined, oProtected.processOptions(vBaseOptions, processXHROptions(vCallOptions)));
                    };
                },
                post: function (vBaseOptions) {
                    return function (sUrl, oBody, vCallOptions) {
                        return processVerb("POST", sUrl, oBody, oProtected.processOptions(vBaseOptions, processXHROptions(vCallOptions)));
                    };
                },
                put: function (vBaseOptions) {
                    return function (sUrl, oBody, vCallOptions) {
                        return processVerb("PUT", sUrl, oBody, oProtected.processOptions(vBaseOptions, processXHROptions(vCallOptions)));
                    };
                },
                "delete": function (vBaseOptions) {
                    return function (sUrl, vCallOptions) {
                        return processVerb("DELETE", sUrl, _undefined, oProtected.processOptions(vBaseOptions, processXHROptions(vCallOptions)));
                    };
                },
                head: function (vBaseOptions) {
                    return function (sUrl, vCallOptions) {
                        return processVerb("HEAD", sUrl, _undefined, oProtected.processOptions(vBaseOptions, processXHROptions(vCallOptions)));
                    };
                }
            }; //# oProtected.verbs

            return core.extend(
                //# Override the default io.net.* interfaces with the updated oProtected reference
                oProtected.netInterfaceFactory(/*undefined*/),
                {
                    //#########
                    /** XMLHttpRequest (XHR) management function.
                     * @function ish.io.net.xhr
                     * @param {string} sVerb Value representing the HTTP Verb.
                     * @param {boolean} bAsync Value representing if the HTTP request is to be asynchronous.
                     * @param {string} sUrl Value representing the URL to interrogate.
                     * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                     *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                     *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                     *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                     *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                     *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                     *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                     *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                     *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                     * @param {function} [fnRetry] Value representing the function to be called when the request is to be retried.
                     * @param {object} [oBody] Value representing the body of the request.
                     * @returns {object} =interface Value representing the following properties:
                     *      @returns {function} =interface.send Sends the request; <code>send(vBody, fnHook)</code>:
                     *          <table class="params">
                     *              <tr><td class="name"><code>vBody</code><td><td class="type param-type">variant | object<td><td class="description last">Value representing the body of the call.</td></tr>
                     *              <tr><td class="name"><code>fnHook</code><td><td class="type param-type">function<td><td class="description last">Value representing the function to be called before the request is sent via the underlying <code>XMLHttpRequest</code> management object; <code>fnHook($xhr)</code>.</td></tr>
                     *          </table>
                     *      @returns {function} =interface.abort Aborts the request; <code>abort()</code>.
                     *      @returns {object} =interface.xhr Value representing the underlying <code>XMLHttpRequest</code> management object.
                     */ //#####
                    xhr: function (sVerb, bAsync, sUrl, vCallback, fnRetry, oBody) {
                        return doXhr(sVerb, sUrl, oBody,
                            core.extend({},
                                processXHROptions(vCallback),
                                { retry: fnRetry, async: bAsync }
                            )
                        );
                    }
                    //xhr.options = xhr.options
                }
            );
        }); //# core.io.net

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.net-xhr");

        //# Return core to allow for chaining
        return core;
    }


    //# If we are running server-side
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = function (core) {
            return init(core, require("xmlhttprequest").XMLHttpRequest);
        };
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], function (core) {
            return init(core, XMLHttpRequest || ActiveXObject);
        });
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        /*global ActiveXObject: false */ //# JSHint "ActiveXObject variable undefined" error suppressor
        return init(window.head.ish || document.querySelector("SCRIPT[ish]").ish, XMLHttpRequest || ActiveXObject);
    }

    //</MIXIN>
}());
