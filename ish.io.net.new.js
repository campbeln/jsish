//################################################################################################
/** @file Networking mixin for ish.js
 * @mixin ish.io.net
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 */ //############################################################################################
/*global module, define, require, XMLHttpRequest, ActiveXObject */  //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                         //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core, fetch, XHRConstructor) {
        //################################################################################################
        /** Collection of Networking-based functionality.
         * @namespace ish.io.net
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io, function (/*oProtected*/) {
            var _undefined = undefined,
                oCache = {},
                oXHROptions = {
                    async: true,
                    cache: true,
                    useCache: false
                    //beforeSend: undefined,
                    //onreadystatechange: undefined
                },
                oVerbs = {   //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                    get: function (vBaseOptions) {
                        return function (sUrl, vCallOptions) {
                            return processVerb("GET", sUrl, _undefined, vBaseOptions, vCallOptions);
                        };
                    },
                    post: function (vBaseOptions) {
                        return function (sUrl, oBody, vCallOptions) {
                            return processVerb("POST", sUrl, oBody, vBaseOptions, vCallOptions);
                        };
                    },
                    put: function (vBaseOptions) {
                        return function (sUrl, oBody, vCallOptions) {
                            return processVerb("PUT", sUrl, oBody, vBaseOptions, vCallOptions);
                        };
                    },
                    "delete": function (vBaseOptions) {
                        return function (sUrl, vCallOptions) {
                            return processVerb("DELETE", sUrl, _undefined, vBaseOptions, vCallOptions);
                        };
                    },
                    head: function (vBaseOptions) {
                        return function (sUrl, vCallOptions) {
                            return processVerb("HEAD", sUrl, _undefined, vBaseOptions, vCallOptions);
                        };
                    }
                }
            ;


            //# Processes the verb into the correct response type (fetch, xhr or xhrAsync)
            function processVerb(sVerb, sUrl, oBody, vBaseOptions, vCallOptions) {
                var iWait,
                    oOptions = core.extend({},
                        vBaseOptions,
                        (core.type.fn.is(vCallOptions) ?
                            { fn: vCallOptions, arg: null /*, cache: oOptions.cache, useCache: oOptions.useCache */ } :
                            vCallOptions
                    )
                ;

                //# If a retry or wait interface is defined
                //#     TODO: Remove .wait
                if (oOptions.hasOwnProperty("retry") || oOptions.hasOwnProperty("wait")) {
                    oOptions.retry = oOptions.retry || oOptions.wait;
                    iWait = (core.type.int.mk(oOptions.retry, 500));
                    oOptions.maxAttempts = core.type.int.mk(oOptions.maxAttempts, 5);
                    oOptions.attempts = 1;
                    oOptions.retry = (core.type.fn.is(oOptions.retry) ? oOptions.retry : function (iAttemptCount) {
                        return (
                            iAttemptCount < oOptions.maxAttempts ?
                            iWait :
                            null
                        );
                    });
                }

                return (oOptions.hasOwnProperty("fn") ?         //# If this is an xhr request
                    (core.type.fn.is(oOptions.fn) ?             //# If this is a sync xhr request
                        doXhr(sVerb, sUrl, oBody, core.extend({}, oXHROptions, oOptions)).send() :
                        doXhrPromise(sVerb, sUrl, oBody, core.extend({}, oXHROptions, oOptions))
                    ) :                                         //# Else this is a fetch request
                    doFetch(sVerb, sUrl, oBody, oOptions)
                );
            } //# processVerb


            //# Safely returns a new xhr instance via the XHRConstructor
            function getXhr() {
                //# IE5.5+ (ActiveXObject IE5.5-9), based on http://toddmotto.com/writing-a-standalone-ajax-xhr-javascript-micro-library/
                try {
                    return new XHRConstructor('MSXML2.XMLHTTP.3.0');
                } catch (e) {
                    core.type.is.ish.expectedErrorHandler(e);
                    //return _undefined;
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
                    oData = core.resolve(oCache, [sVerb.toLowerCase(), sUrl])
                ;

                //# If we are supposed to .useCache and we were able to find the oData in the oCache
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
                                core.resolve(true, oCache, [sVerb.toLowerCase(), sUrl], oData);
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
                                core.resolve(true, oCache, [sVerb.toLowerCase(), sUrl], oData);
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
                                fnPromiseReject(oData);
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


            //# Wrapper for a Fetch call
            function doFetch(sVerb, sUrl, oBody, oOptions) {
                var sReturnType = "json";
                //# init
                //#     SEE: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
                //#     SEE: https://javascript.info/fetch-api
                var oInit = {
                    method: "GET",              //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                    body: undefined,            //# String, FormData, Blob, BufferSource, URLSearchParams - NOTE: Not allowed on GET and HEAD

                    headers: {},                //# { "Content-Type": "text/plain;charset=UTF-8" }
                    mode: "cors",               //# "cors", "no-cors", "same-origin",
                    credentials: "same-origin", //# "omit", "same-origin", "include", FederatedCredential, PasswordCredential
                    cache: "default",           //# "default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached", SEE: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
                    redirect: "follow",         //# "redirect", "error", "manual"
                    referrer: "",               //# same-origin URL, "same-origin", "", USVString
                    referrerPolicy: "",         //# "", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url", SEE: https://w3c.github.io/webappsec-referrer-policy/#referrer-policies
                    integrity: undefined,       //# e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=
                    keepalive: false,           //# false/true
                    signal: undefined,          //# AbortSignal
                    //window: window,           //# Non-standard?

                    returnType: "json",         //# "arrayBuffer", "blob", "formData", "json", "text"
                    //retry: 500,                  //# integer, function
                    //attempts: 5,                //# integer
                    async: false,               //# false/true

                    useCache: false,            //# false/true
                    //cache: false,               //# false/true
                    fn: undefined,              //# function callback
                    arg: undefined,             //# variant
                    //headers: {},                //# { "Content-Type": "text/plain;charset=UTF-8" }
                    mimeType: undefined,        //# string
                    contentType: undefined,     //# string
                    responseType: "text"        //# "text", "response"
                };
                // function || { fn: function } === xhr, 

                try {
                    fetch('http://127.0.0.1:3501/lights/xmas/off')
                    .then(function /*fetchPromise*/(oResponse) {
                        sReturnType = (["arrayBuffer", "blob", "formData", "json", "text"].indexOf(sReturnType) === -1 ?
                            "text" :
                            sReturnType
                        );

                        //# Based on .ok, return the chainedResponsePromise
                        //#     SEE: https://developer.mozilla.org/en-US/docs/Web/API/Response
                        return (oResponse.ok ?
                            oResponse[sReturnType]() :
                            Promise.reject(oResponse)
                        );
                    })
                    .then(function /*chainedResponsePromise*/(data) {
                        console.log(data);
                    })
                    .catch(function (e) {
                        console.warn('Something went wrong.', e);
                    })
                ;
                }
                catch (e) {
                    //Promise.reject(oResponse)
                }

            } //# doFetch


            //#
            function netInterfaceFactory(vBaseOptions) {
                return {
                    //#########
                    /** Represents the HTTP Request Verbs as a CRUD (Create, Read, Update, Delete) interface.
                     * @function ish.io.net.crud
                     * @$asProperty
                     * @ignore
                     */ //#####
                    crud: {
                        //#########
                        /** Calls the passed URL to create a new entity (via <code>PUT</code>).
                         * @function ish.io.net.crud:create
                         * @param {string} sURL Value representing the URL to interrogate.
                         * @param {object} [oBody] Value representing the body of the request.
                         * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                         *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                         *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                         *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                         *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                         *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                         *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                         *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                         *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                         */ //#####
                        create: oVerbs.put(vBaseOptions),

                        //#########
                        /** Calls the passed URL to read an entity (via <code>GET</code>).
                         * @function ish.io.net.crud:read
                         * @param {string} sURL Value representing the URL to interrogate.
                         * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                         *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                         *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                         *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                         *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                         *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                         *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                         *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                         *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                         */ //#####
                        read: oVerbs.get(vBaseOptions),

                        //#########
                        /** Calls the passed URL to update an entity (via <code>POST</code>).
                         * @function ish.io.net.crud:update
                         * @param {string} sURL Value representing the URL to interrogate.
                         * @param {object} [oBody] Value representing the body of the request.
                         * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                         *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                         *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                         *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                         *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                         *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                         *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                         *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                         *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                         */ //#####
                        update: oVerbs.post(vBaseOptions),

                        //#########
                        /** Calls the passed URL to remove an entity (via <code>DELETE</code>).
                         * @function ish.io.net.crud:delete
                         * @param {string} sURL Value representing the URL to interrogate.
                         * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                         *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                         *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                         *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                         *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                         *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                         *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                         *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                         *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                         */ //#####
                        'delete': oVerbs.delete(vBaseOptions)
                    }, //# io.net.async.crud

                    //#########
                    /** Calls the passed URL via the <code>GET</code> HTTP Verb.
                     * @function ish.io.net.get
                     * @param {string} sURL Value representing the URL to interrogate.
                     * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                     *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                     *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                     *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                     *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                     *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                     *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                     *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                     *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                     */ //#####
                    get: oVerbs.get(vBaseOptions),

                    //#########
                    /** Calls the passed URL via the <code>PUT</code> HTTP Verb.
                     * @function ish.io.net.put
                     * @param {string} sURL Value representing the URL to interrogate.
                     * @param {object} [oBody] Value representing the body of the request.
                     * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                     *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                     *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                     *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                     *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                     *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                     *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                     *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                     *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                     */ //#####
                    put: oVerbs.put(vBaseOptions),

                    //#########
                    /** Calls the passed URL via the <code>POST</code> HTTP Verb.
                     * @function ish.io.net.post
                     * @param {string} sURL Value representing the URL to interrogate.
                     * @param {object} [oBody] Value representing the body of the request.
                     * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                     *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                     *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                     *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                     *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                     *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                     *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                     *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                     *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                     */ //#####
                    post: oVerbs.post(vBaseOptions),

                    //#########
                    /** Calls the passed URL via the <code>DELETE</code> HTTP Verb.
                     * @function ish.io.net.delete
                     * @param {string} sURL Value representing the URL to interrogate.
                     * @param {function|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                     *      @param {function} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                     *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                     *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                     *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                     *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                     *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                     *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                     *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                     */ //#####
                    'delete': oVerbs.delete(vBaseOptions),

                    //#########
                    /** Calls the passed URL via the <code>HEAD</code> HTTP Verb.
                     * @function ish.io.net.head
                     * @param {string} sURL Value representing the URL to interrogate.
                     * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                     *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                     *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                     *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                     *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                     *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                     *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                     *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                     *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                     */ //#####
                    head: oVerbs.head(vBaseOptions),

                    //#########
                    /** Calls the passed URL simulating a ping via the <code>HEAD</code> HTTP Verb.
                     * @function ish.io.net.ping
                     * @param {string} sURL Value representing the URL to interrogate.
                     * @param {fnIshIoNetCallback|object} [vCallback] Value representing the function to be called when the request returns or the desired options:
                     *      @param {fnIshIoNetCallback} [vCallback.fn] Value representing the function to be called when the request returns; <code>vCallback.fn(bSuccess, oResponse, vArg, $xhr)</code>.
                     *      @param {variant} [vCallback.arg] Value representing the argument that will be passed to the callback function.
                     *      @param {object} [vCallback.headers] Value representing the HTTP headers of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).
                     *      @param {string} [vCallback.mimeType] Value representing the MIME Type of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType|Mozilla.org}).
                     *      @param {string} [vCallback.contentType] Value representing the Content Type HTTP Header of the request (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/setRequestHeader|Mozilla.org}).<note>When <code>vCallback.contentType</code> is set, its value will override any value set in <code>vCallback.headers['content-type']</code>.</note>
                     *      @param {string} [vCallback.responseType='text'] Value representing the type of data contained in the response (see: {@link: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType|Mozilla.org}).
                     *      @param {boolean} [vCallback.cache=false] Value representing if the response is to be cached.
                     *      @param {boolean} [vCallback.useCache=false] Value representing if the response is to be sourced from the cache if it's available.<note>When <code>!vCallback.useCache</code>, the HTTP Header <code>Cache-Control</code> is set to <code>no-cache, max-age=0</code>.</note>
                     */ //#####
                    ping: function (sUrl, vCallback) {
                        oVerbs.head(vBaseOptions)(sUrl, vCallback || function (/* bSuccess, oData, vArg, $xhr */) {});
                    }
                };
            } //# netInterfaceFactory


            //# Return the core.io.net functionality
            //#########
            /** Callback utilized by <code>ish.io.net</code> on completion of a XMLHttpRequest request.
             * @callback fnIshIoNetCallback
             * @param {boolean} bSuccess Value representing if the request returned successfully.
             * @param {object} oResponse Value representing the results of the request:
             *      @param {boolean} oResponse.ok Value representing if the request returned successfully.
             *      @param {integer} oResponse.status Value representing the XMLHttpRequest's <code>status</code>.
             *      @param {string} oResponse.url Value representing the URL of the request.
             *      @param {string} oResponse.verb Value representing the HTTP Verb of the request.
             *      @param {boolean} oResponse.async Value representing if the request was asynchronous.
             *      @param {boolean} oResponse.aborted Value representing if the request was aborted prior to completion.
             *      @param {boolean} oResponse.loaded Value representing if the URL was successfully loaded (DEPRECATED).
             *      @param {variant} oResponse.response Value representing the XMLHttpRequest's <code>responseText</code> or <code>response</code>.
             *      @param {string} oResponse.text Value representing the XMLHttpRequest's <code>responseText</code>.
             *      @param {object} oResponse.json Value representing the XMLHttpRequest's <code>responseText</code> as parsed JSON.
             * @param {variant} vArg Value representing the value passed in the original call as <code>vCallback.arg</code>.
             * @param {object} $xhr Value representing the underlying <code>XMLHttpRequest</code> management object.
             */ //#####
            return {
                net: core.extend(
                    //#########
                    /** Provides an interface that retries up to the passed definition before returning an unsuccessful result.
                     * @function ish.io.net.!
                     * @param {object} [oOptions] Value representing the desired options:
                     *      @param {integer|function} [oOptions.retry=500] Value representing the number of milliseconds (1/1000ths of a second) or function called per attempt that returns the number of milliseconds between each call; <code>iWaitMilliseconds = oOptions.retry(iAttemptCount)</code>.
                     *      @param {integer|function} [oOptions.wait=500] Value representing the number of milliseconds (1/1000ths of a second) or function called per attempt that returns the number of milliseconds between each call; <code>iWaitMilliseconds = oOptions.wait(iAttemptCount)</code> (DEPRECATED).
                     *      @param {integer} [oOptions.maxAttempts=5] Value representing the maximum number of attempts before returning an unsuccessful result.
                     * @returns {object} =interface Value representing the following properties:
                     *      @returns {object} =interface.get {@link: ish.io.net.get}.
                     *      @returns {object} =interface.put {@link: ish.io.net.put}.
                     *      @returns {object} =interface.post {@link: ish.io.net.post}.
                     *      @returns {object} =interface.delete {@link: ish.io.net.delete}.
                     *      @returns {object} =interface.head {@link: ish.io.net.head}.
                     *      @returns {object} =interface.crud {@link: ish.io.net.crud}.
                     */ //#####
                    function (oOptions) {
                        //#
                        return netInterfaceFactory(oOptions);
                    },
                    netInterfaceFactory(/*undefined*/),
                    {
                        //#########
                        /** Provides access to the request cache.
                         * @function ish.io.net.cache
                         * @param {object} oImportCache Value representing the cached entries to import into the current cache as <code>verb.url.data</code>.
                         * @returns {object} Value representing the request cache.
                         */ //#####
                        cache: function (oImportCache) {
                            core.extend(oCache, oImportCache);
                            return oCache;
                        }, //# io.net.cache

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
                            var oOptions = core.extend({},
                                (core.type.fn.is(vCallback) ?
                                    { fn: vCallback, arg: null } :
                                    vCallback
                                ),
                                { retry: fnRetry, async: bAsync }
                            );

                            return doXhr(sVerb, sUrl, oBody, oOptions);
                        },
                        //xhr.options = xhr.options,

                        //#########
                        /** IP-based type functionality.
                         * @function ish.io.net.ip
                         * @$asProperty
                         * @ignore
                         */ //#####
                        ip: {
                            //#########
                            /** Determines if the passed value represents an IP.
                             * @function ish.io.net.ip:is
                             * @param {variant} x Value to interrogate.
                             * @returns {integer} Value representing the type of IP; <code>4</code> representing an IPv4, <code>6</code> representing an IPv6 and <code>0</code> (<code>falsey</code>) representing a non-IP.
                            */ //#####
                            is: core.extend(
                                function (x) {
                                    return (
                                        core.app.ip.is.v4(x) ?
                                        4 :
                                            core.app.ip.is.v6(x) ?
                                            6 :
                                            0
                                    );
                                }, function () {
                                    //# Create the reIPv4 and mega reIPv6 RegEx based on the various valid patters |'ed together
                                    //#     NOTE: The RegEx's are set as RegEx's below for intellisense/highlighting/etc and not for any other reason
                                    var reIPv4 = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                                        reIPv6 = new RegExp('^(?:' +
                                            /(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/                              .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,7}:/                                           .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}/                           .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,5}:(?:[0-9a-fA-F]{1,4}:)[0-9a-fA-F]{1,4}/      .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,4}:(?:[0-9a-fA-F]{1,4}:){2}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,3}:(?:[0-9a-fA-F]{1,4}:){3}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,2}:(?:[0-9a-fA-F]{1,4}:){4}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /(?:[0-9a-fA-F]{1,4}:){1,1}:(?:[0-9a-fA-F]{1,4}:){5}[0-9a-fA-F]{1,4}/   .source + '|' +
                                            /::(?:(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4})?/                     .source +
                                        ')$'
                                    );

                                    return {
                                        //#########
                                        /** Determines if the passed value represents an IPv4.
                                         * @function ish.io.net.ip:is:v4
                                         * @param {variant} x Value to interrogate.
                                         * @returns {boolean} Value representing if the passed value represents an IPv4.
                                        */ //#####
                                        v4: function (x) {
                                            return reIPv4.test(x + "");
                                        }, //# core.app.ip.is.v4

                                        //#########
                                        /** Determines if the passed value represents an IPv6.
                                         * @function ish.io.net.ip:is:v6
                                         * @param {variant} x Value to interrogate.
                                         * @returns {boolean} Value representing if the passed value represents an IPv6.
                                        */ //#####
                                        v6: function (x) {
                                            return reIPv6.test(x + "");
                                        } //# core.app.ip.is.v6
                                    };
                                }()
                            ) //# core.app.ip.is
                        }, //# core.app.ip


                        //#########
                        /** Enumeration of HTTP Status Codes.
                         * @function ish.io.net.status
                         * @$asProperty
                         * @returns {object} =status Value representing the following properties:
                         *      @returns {object} =status.info Value representing 1xx HTTP status codes.
                         *      @returns {object} =status.success Value representing 2xx HTTP status codes.
                         *      @returns {object} =status.redirection Value representing 3xx HTTP status codes.
                         *      @returns {object} =status.clientError Value representing 4xx HTTP status codes.
                         *      @returns {object} =status.serverError Value representing 5xx HTTP status codes.
                         */ //#####
                        status: {
                            info: {
                                continue: 100,
                                switchingProtocols: 101,
                                processing: 102,
                                earlyHints: 103
                            },
                            success: {
                                ok: 200,
                                created: 201,
                                accepted: 202,
                                nonAuthInfo: 203,
                                noContent: 204,
                                resetContent: 205,
                                partialContent: 206,
                                multiStatus: 207,
                                alreadyReported: 208,
                                imUsed: 226
                            },
                            redirection: {
                                multipleChoices: 300,
                                movedPermanently: 301,
                                found: 302,
                                seeOther: 303,
                                notModified: 304,
                                useProxy: 305,
                                switchProxy: 306,
                                temporaryRedirect: 307,
                                permanentRedirect: 30
                            },
                            clientError: {
                                badRequest: 400,
                                unauthorized: 401,
                                paymentRequired: 402,
                                forbidden: 403,
                                notFound: 404,
                                methodNotAllowed: 405,
                                notAcceptable: 406,
                                proxyAuthRequired: 407,
                                requestTimeout: 408,
                                conflict: 409,
                                gone: 410,
                                lengthRequired: 411,
                                preconditionFailed: 412,
                                payloadTooLarge: 413,
                                uriTooLong: 414,
                                unsupportedMediaType: 415,
                                rangeNotSatisfiable: 416,
                                expectationFailed: 417,
                                imATeapot: 418,
                                misdirectedRequest: 421,
                                unprocessableEntity: 422,
                                locked: 423,
                                failedDependency: 424,
                                upgradeRequired: 426,
                                preconditionRequired: 428,
                                tooManyRequests: 429,
                                requestHeaderFieldsTooLarge: 431,
                                unavailableForLegalReasons: 451
                            },
                            serverError: {
                                internalServerError: 500,
                                notImplemented: 501,
                                badGateway: 502,
                                serviceUnavailable: 503,
                                gatewayTimeout: 504,
                                httpVersionNotSupported: 505,
                                variantAlsoNegotiates: 506,
                                insufficientStorage: 507,
                                loopDetected: 508,
                                notExtended: 510,
                                networkAuthRequired: 511
                            }
                        } //# io.net.status
                    }
                )
            };
        }); //# core.io.net

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.net");
    }


    //# If we are running server-side
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = function (core) {
            init(core, require('node-fetch'), require("xmlhttprequest").XMLHttpRequest);
        };
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], function (core) {
            init(core, XMLHttpRequest || ActiveXObject);
        });
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        /*global ActiveXObject: false */ //# JSHint "ActiveXObject variable undefined" error suppressor
        init(document.querySelector("SCRIPT[ish]").ish, document.fetch, XMLHttpRequest || ActiveXObject);
    }
}());
