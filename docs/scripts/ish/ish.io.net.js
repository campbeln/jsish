//################################################################################################
/** @file Networking mixin for ish.js
 * @mixin ish.io.net
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2023, Nick Campbell
 */ //############################################################################################
/*global module, define, require, Promise */                        //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                         //# Enable max complexity warnings for JSHint
(function () {
    'use strict'; //<MIXIN>

    function init(core, fetch, FormData) {
        var fnNetInterfaceFactory;

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
        core.io.net = function (oOptions) {
            //# Setup the wrapper for fnNetInterfaceFactory so that we can .partial core.io.net below
            return fnNetInterfaceFactory(oOptions);
        }; //# core.io.net


        //################################################################################################
        /** Collection of Networking-based functionality.
         * @namespace ish.io.net
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io.net, function (oProtected) {
            var _undefined /*= undefined*/,
                oCache = {}
            ;


            //# Set the fnNetInterfaceFactory into the top-level variable
            fnNetInterfaceFactory = function (vBaseOptions) {
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
                        create: oProtected.verbs.put(vBaseOptions),

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
                        read: oProtected.verbs.get(vBaseOptions),

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
                        update: oProtected.verbs.post(vBaseOptions),

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
                        'delete': oProtected.verbs.delete(vBaseOptions)
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
                    get: oProtected.verbs.get(vBaseOptions),

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
                    put: oProtected.verbs.put(vBaseOptions),

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
                    post: oProtected.verbs.post(vBaseOptions),

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
                    'delete': oProtected.verbs.delete(vBaseOptions),

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
                    head: oProtected.verbs.head(vBaseOptions),

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
                    ping: function (sUrl /*, vCallback*/) {
                        oProtected.verbs.head(vBaseOptions)(sUrl); //, vCallback || function (/* bSuccess, oData, vArg, $xhr */) {});
                    }
                };
            }; //# fnNetInterfaceFactory


            //# .extend our oProtected interfaces
            core.extend(oProtected, {
                //#
                verbs: {   //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                    get: function (vBaseOptions) {
                        return function (sUrl, vCallOptions) {
                            return oProtected.doFetch("GET", sUrl, _undefined, oProtected.processOptions(vBaseOptions, vCallOptions));
                        };
                    },
                    post: function (vBaseOptions) {
                        return function (sUrl, oBody, vCallOptions) {
                            return oProtected.doFetch("POST", sUrl, oBody, oProtected.processOptions(vBaseOptions, vCallOptions));
                        };
                    },
                    put: function (vBaseOptions) {
                        return function (sUrl, oBody, vCallOptions) {
                            return oProtected.doFetch("PUT", sUrl, oBody, oProtected.processOptions(vBaseOptions, vCallOptions));
                        };
                    },
                    "delete": function (vBaseOptions) {
                        return function (sUrl, vCallOptions) {
                            return oProtected.doFetch("DELETE", sUrl, _undefined, oProtected.processOptions(vBaseOptions, vCallOptions));
                        };
                    },
                    head: function (vBaseOptions) {
                        return function (sUrl, vCallOptions) {
                            return oProtected.doFetch("HEAD", sUrl, _undefined, oProtected.processOptions(vBaseOptions, vCallOptions));
                        };
                    }
                }, //# verbs

                //#
                netInterfaceFactory: fnNetInterfaceFactory,

                //# Processes the incoming options
                processOptions: function (vBaseOptions, vCallOptions) {
                    var iWait,
                        oOptions = core.extend({}, vBaseOptions, vCallOptions)
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

                    //#
                    if (core.type.fn.is(vBaseOptions)) {
                        oOptions = vBaseOptions(oOptions);
                    }

                    return oOptions;
                }, //# processOptions

                //# Wrapper for a Fetch call
                doFetch: async function (sVerb, sUrl, oBody, oOptions) {
                    //# init
                    //#     SEE: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters
                    //#     SEE: https://javascript.info/fetch-api
                    /*var oInit = {
                        //# fetch init options

                        method: "GET",                      //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                        body: undefined,                    //# String, FormData, Blob, BufferSource, URLSearchParams - NOTE: Not allowed on GET and HEAD

                        headers: {},                        //# { "Content-Type": "text/plain;charset=UTF-8" }
                        mode: "cors",                       //# "cors", "no-cors", "same-origin",
                        credentials: "same-origin",         //# "omit", "same-origin", "include", FederatedCredential, PasswordCredential
                        cache: "default",                   //# "default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached", SEE: https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
                        redirect: "follow",                 //# "redirect", "error", "manual"
                        referrer: "",                       //# same-origin URL, "same-origin", "", USVString
                        referrerPolicy: "",                 //# "", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url", SEE: https://w3c.github.io/webappsec-referrer-policy/#referrer-policies
                        integrity: undefined,               //# e.g., sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=
                        keepalive: false,                   //# false/true
                        signal: undefined,                  //# AbortSignal
                        //window: window,                   //# Non-standard?

                        //# ish.io.net additional oOptions

                        forceContentTypeOnJsonBody: true    //# Forces the header's Content-Type to application/json if body is .stringify'd JSON
                        returnType: "jsonOrText",           //# "arrayBuffer", "blob", "formData", "json", "text", "jsonOrText"

                        retry: 500,                         //# integer, function
                        maxAttempts: 5,                     //# integer

                        //# xhr-specific oOptions

                        async: false,                       //# false/true
                        useCache: false,                    //# false/true
                        //cache: false,                       //# false/true
                        fn: undefined,                      //# function callback
                        arg: undefined,                     //# variant
                        //headers: {},                        //# { "Content-Type": "text/plain;charset=UTF-8" }
                        mimeType: undefined,                //# string
                        contentType: undefined,             //# string
                        responseType: "text"                //# "text", "response"
                    };*/


                    var oInit, iMS, bRequestHasBody, bBodyIsFormData,
                        bJsonOrText = false,
                        syRetrying = core.type.symbol.get(),
                        oData = {
                            ok: false,
                            //status: _undefined,
                            url: sUrl,
                            verb: sVerb,
                            //async: bAsync,
                            //aborted: bAbort,
                            //response: _undefined,
                            text: _undefined,
                            json: _undefined,
                            retries: 0
                        }
                    ;

                    //# Ensure the passed oOptions is an .obj and validate it's .returnType
                    oOptions = core.type.obj.mk(oOptions);
                    oOptions.returnType = (["arrayBuffer", "blob", "formData", "json", "text", "jsonOrText"].indexOf(oOptions.returnType) === -1 ?
                        "jsonOrText" :
                        oOptions.returnType
                    );
                    if (oOptions.returnType === "jsonOrText") {
                        oOptions.returnType = "text";
                        bJsonOrText = true;
                    }

                    //# If there's a oOptions.contentType, copy it into the .headers Content-Type
                    if (core.type.str.is(oOptions.contentType, true)) {
                        oOptions.headers = core.type.obj.mk(oOptions.headers);
                        oOptions.headers["Content-Type"] = oOptions.contentType;
                    }

                    //#
                    sVerb = core.type.str.mk(sVerb).toUpperCase();
                    sVerb = (["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"].indexOf(sVerb) === -1 ?
                        "GET" :
                        sVerb
                    );
                    bRequestHasBody = (core.type.is.value(oBody) && sVerb !== "GET" && sVerb !== "HEAD");
                    bBodyIsFormData = bRequestHasBody &&
                        core.type.fn.is(oBody.append) && //# see: https://developer.mozilla.org/en-US/docs/Web/API/FormData
                        core.type.fn.is(oBody.delete) && //# TODO: Neek
                        core.type.fn.is(oBody.entries) &&
                        core.type.fn.is(oBody.get) &&
                        core.type.fn.is(oBody.getAll) &&
                        core.type.fn.is(oBody.has) &&
                        core.type.fn.is(oBody.keys) &&
                        core.type.fn.is(oBody.set) &&
                        core.type.fn.is(oBody.values)
                    ;

                    //# If this bRequestHasBody, it's oBody .is .obj, we're to .forceContentTypeOnJsonBody or we don't already have a Content-Type
                    if (bRequestHasBody &&
                        core.type.obj.is(oBody) && (
                            oOptions.forceContentTypeOnJsonBody ||
                            !core.type.str.is(core.resolve(oOptions, ["headers", "Content-Type"]), true)
                        )
                    ) {
                        //# Set the .headers Content-Type to application/json
                        oOptions.headers = core.type.obj.mk(oOptions.headers);
                        oOptions.headers["Content-Type"] = "application/json";
                    }

                    //# Set the required .method and .body elements while removing the ish-specific .returnType, .retry and .attempts into .fetch's oInit
                    oInit = core.extend(oOptions, {
                        method: sVerb,
                        body: (bRequestHasBody ?
                            (core.type.obj.is(oBody) /*&& bBodyIsFormData*/ ? JSON.stringify(oBody) : oBody) :
                            _undefined
                        ),
                        //mode: "cors",
                        //returnType: _undefined,
                        retry: _undefined,
                        attempts: _undefined
                    });

                    //#
                    return new Promise(async function callFetch(fnResolve /*, fnReject*/) {
                        //# .fetch the sURL
                        fetch(sUrl, oInit)
                            .then(async function /*fetchPromise*/(oResponse) {
                                var vReturnVal;

                                //# Set the oData based on the oResponse
                                oData.ok = oResponse.ok; // ((oResponse.status >= 200 && oResponse.status <= 299) || (oResponse.status === 0 && sUrl.substr(0, 7) === "file://"));
                                oData.status = oResponse.status;
                                oData.url = sUrl;
                                //oData.verb = sVerb;
                                //oData.async = true;
                                //oData.aborted = false;
                                oData.response = oResponse;
                                //oData.json = await oResponse.json();
                                //oData.text = await oResponse.text();

                                //# If the oData was not .ok and we have an oOptions.retry (calling it to calculate the iMS as we go)
                                if (
                                    !oData.ok &&
                                    core.type.fn.is(oOptions.retry) &&
                                    core.type.int.is(iMS = oOptions.retry(oOptions.attempts))
                                ) {
                                    //# Recurse via setTimeout to run .callFetch again, passing in our fnResolve (ignoring fnReject as we never use it)
                                    setTimeout(function () {
                                        oData.retries = oOptions.attempts++;
                                        callFetch(fnResolve /*, fnReject*/);
                                    }, iMS);

                                    //# Set our vReturnVal to .reject the fetchPromise so it's .catch'ed by chainedResponsePromise, passing syRetrying to signal it to be ignored
                                    vReturnVal = Promise.reject(syRetrying);
                                }
                                //#
                                else {
                                    //# Based on .ok, return the chainedResponsePromise
                                    //#     SEE: https://developer.mozilla.org/en-US/docs/Web/API/Response
                                    vReturnVal = (oData.ok ?
                                        await oResponse[oOptions.returnType]() :
                                        Promise.reject(oResponse) //# Set our vReturnVal to .reject the fetchPromise so it's .catch'ed by chainedResponsePromise
                                    );

                                    //#
                                    if (bJsonOrText && core.type.str.is.json(vReturnVal)) {
                                        vReturnVal = JSON.parse(vReturnVal);
                                    }
                                }

                                return vReturnVal;
                            })
                            .then(/*async*/ function /*chainedResponsePromise*/(vResponseData) {
                                oData.data = vResponseData;

                                //# If the vResponseData .is .obj or .arr, also set it into our .json
                                if (core.type.obj.is(vResponseData) || core.type.arr.is(vResponseData)) {
                                    oData.json = vResponseData;
                                }
                                //# Else if the vResponseData .is .str, also set it into our .text
                                else if (core.type.str.is(vResponseData)) {
                                    oData.text = vResponseData;
                                }

                                //# .fnResolve our oData
                                fnResolve(oData);
                            })
                            .catch(async function (oError) {
                                //# As long as oError isn't our syRetrying symbol (meaning that we're... syRetrying)
                                if (oError !== syRetrying) {
                                    //# Set the oError into the .response and .fnResolve the Promise
                                    oData.response = oError;
                                    try {
                                        oData.data = await oError[oOptions.returnType]();
                                    } catch (e) {
                                        oData.data = oError;
                                    }
                                    fnResolve(oData);
                                }
                            })
                        ;
                    });
                } //# oProtected.doFetch
            });


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
            return core.extend(
                //# Setup the default io.net.* interfaces
                fnNetInterfaceFactory(/*undefined*/),
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
                                    core.io.net.ip.is.v4(x) ?
                                    4 :
                                        core.io.net.ip.is.v6(x) ?
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
                                    }, //# core.io.net.ip.is.v4

                                    //#########
                                    /** Determines if the passed value represents an IPv6.
                                     * @function ish.io.net.ip:is:v6
                                     * @param {variant} x Value to interrogate.
                                     * @returns {boolean} Value representing if the passed value represents an IPv6.
                                    */ //#####
                                    v6: function (x) {
                                        return reIPv6.test(x + "");
                                    } //# core.io.net.ip.is.v6
                                };
                            }()
                        ) //# core.io.net.ip.is
                    }, //# core.io.net.ip

                    //#########
                    /** Converts an object of key/value pairs into a FormData representation for use with multipart form bodies.
                     * @function ish.io.net.multipartFormData
                     * @param {object} oKeyValuePairs Value representing the key/value pairs to be sent in the request body.
                     * @returns {object} Value representing the key/value pairs in a FormData object.
                     */ //#####
                    multipartFormData: function (oKeyValuePairs) {
                        var i,
                            a_sKeys = core.type.obj.ownKeys(oKeyValuePairs),
                            oReturnVal = new FormData()
                        ;

                        //# If the passed oKeyValuePairs resulted in .ownKeys, traverse them
                        if (core.type.arr.is(a_sKeys, true)) {
                            for (i = 0; i < a_sKeys.length; i++) {
                                //# .append each key/value pair into our oReturnVal
                                //#     See: https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
                                oReturnVal.append(a_sKeys[i], oKeyValuePairs[a_sKeys[i]]);
                            }
                        }

                        return oReturnVal;
                    }, //# core.io.net.multipartFormData

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
            );
        }); //# core.io.net

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.net");

        //# Return core to allow for chaining
        return core;
    }


    //# If we are running server-side
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = function (core) {
            //#     NOTE: FormData is included in NodeJS v18+ but the form-data npm package is required for versions below that
            try {
                return init(core, require('node-fetch-commonjs'), FormData);
            } catch (e) {
                return init(core, require('node-fetch-commonjs'), require('form-data'));
            }
        };
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], function (core) {
            return init(core, window.fetch, window.FormData);
        });
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        return init(window.head.ish || document.querySelector("SCRIPT[ish]").ish, window.fetch, window.FormData);
    }

    //</MIXIN>
}());
