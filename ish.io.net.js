//################################################################################################
/** @file Networking mixin for ish.js
 * @mixin ish.io.net
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
 */ //############################################################################################
/*global module, define, require */                             //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core, XHRConstructor) {
        //################################################################################################
        /** Collection of Networking-based functionality.
         * @namespace ish.io.net
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io, function (/*oProtected*/) {
            var oCache = {},
                oXHROptions = {
                    async: true,
                    cache: true, //# true
                    useCache: false
                    //beforeSend: undefined,
                    //onreadystatechange: undefined
                }
            ;

            //# Wrapper for an XHR AJAX call
            function xhr(sVerb, bAsync, sUrl, vCallback, fnRetry, oBody) {
                var $xhr, iMS, bValidRequest, bResponseTypeText,
                    bAbort = false,
                    oData = core.resolve(oCache, [sVerb.toLowerCase(), sUrl])
                ;

                //# IE5.5+ (ActiveXObject IE5.5-9), based on http://toddmotto.com/writing-a-standalone-ajax-xhr-javascript-micro-library/
                try {
                    $xhr = new XHRConstructor('MSXML2.XMLHTTP.3.0');
                } catch (e) { core.type.is.ish.expectedErrorHandler(e); }

                //# If a function was passed rather than an object, object-ize it (else we assume its an object with at least a .fn)
                if (core.type.fn.is(vCallback)) {
                    vCallback = { fn: vCallback, arg: null /*, cache: oXHROptions.cache, useCache: oXHROptions.useCache */ };
                }
                bResponseTypeText = (!vCallback.responseType || (core.type.str.is(vCallback.responseType, true) && vCallback.responseType === "text"));

                //# Determine if this is a bValidRequest
                bValidRequest = ($xhr && core.type.str.is(sUrl, true));

                //# If we are supposed to .useCache and we were able to find the oData in the oCache
                if ((vCallback.useCache || oXHROptions.useCache) && core.type.obj.is(oData)) {
                    //#
                    $xhr.fromCache = true;
                    vCallback.fn( /* bSuccess, oData, vArg, $xhr */
                        (oData.status === 200 || (oData.status === 0 && oData.url.substr(0, 7) === "file://")),
                        oData,
                        vCallback.arg,
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
                                status: $xhr.status,
                                url: sUrl,
                                verb: sVerb,
                                async: bAsync,
                                aborted: bAbort,
                                loaded: (($xhr.status >= 200 && $xhr.status <= 299) || ($xhr.status === 0 && sUrl.substr(0, 7) === "file://")),
                                response: $xhr[bResponseTypeText ? 'responseText' : 'response'],
                                text: bResponseTypeText ? $xhr.responseText : null,
                                json: bResponseTypeText ? core.type.fn.tryCatch(JSON.parse)($xhr.responseText) : null
                            };
                            oData.data = oData.json; //# TODO: Remove

                            //#
                            if (vCallback.cache || oXHROptions.cache) {
                                core.resolve(true, oCache, [sVerb.toLowerCase(), sUrl], oData);
                            }

                            //# If no oData was .loaded, we haven't bAbort'ed and we have a fnRetry
                            if (!oData.loaded && !bAbort && core.type.int.is(iMS = core.type.fn.call(fnRetry))) {
                                setTimeout(function () {
                                    //if (arguments.length === 6) {
                                        xhr(sVerb, bAsync, sUrl, vCallback, fnRetry, oBody)
                                            .send(oBody)
                                        ;
                                    /*}
                                    else {
                                        xhr(sVerb, bAsync, sUrl, vCallback, fnRetry)
                                            .send()
                                        ;
                                    }*/
                                }, iMS);
                            }
                            //#
                            else {
                                vCallback.fn(/* bSuccess, oData, vArg, $xhr */
                                    !bAbort && oData.loaded,
                                    oData,
                                    vCallback.arg,
                                    $xhr
                                );
                            }
                        }
                    };
                }
                //# Else we were unable to collect the $xhr, so signal a failure to the vCallback.fn
                else {
                    core.type.fn.call(vCallback.fn, [false, null, vCallback.arg, $xhr]);
                }

                return {
                    xhr: $xhr,
                    send: function(vBody, fnHook) {
                        var a_sKeys, i,
                            sBody = ""
                        ;

                        //# If we were able to collect an $xhr object and we have an sUrl, .open and .send the request now
                        if (bValidRequest) {
                            $xhr.open(sVerb, sUrl, !!bAsync);

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
                                if (core.type.obj.is(vCallback.headers)) {
                                    a_sKeys = core.type.obj.ownKeys(vCallback.headers);
                                    for (i = 0; i < a_sKeys.length; i++) {
                                        $xhr.setRequestHeader(a_sKeys[i], vCallback.headers[a_sKeys[i]]);
                                    }
                                }
                                if (core.type.str.is(vCallback.mimeType, true)) {
                                    $xhr.overrideMimeType(vCallback.mimeType); // 'application/json; charset=utf-8' 'text/plain'
                                }
                                if (core.type.str.is(vCallback.contentType, true)) {
                                    $xhr.setRequestHeader('Content-Type', vCallback.contentType); //# 'text/plain'
                                }
                                if (core.type.str.is(vCallback.responseType, true)) {
                                    $xhr.responseType = vCallback.responseType; //# 'text'
                                }
                                if (!vCallback.useCache) {
                                    $xhr.setRequestHeader("Cache-Control", "no-cache, max-age=0");
                                }
                            }

                            $xhr.send(sBody || null);
                        }
                    },
                    abort: function () {
                        bAbort = true;
                        $xhr.abort();
                        core.io.console.warn("ish.io.net: Aborted " + sVerb + " " + sUrl);
                    }
                };
            } //# xhr
            xhr.options = function (oOptions) {
                core.extend(oXHROptions, oOptions);
                return oXHROptions;
            }; //# xhr.options


            //# see: https://developers.google.com/web/fundamentals/primers/promises
            //function promise() {
            //}


            //#
            function doGet(fnRetry) {
                return function (sUrl, vCallback) {
                    var oReturnVal = xhr("GET", oXHROptions.async, sUrl, vCallback, fnRetry /*, undefined*/);
                    oReturnVal.send();
                    return oReturnVal;
                };
            }
            function doPost(fnRetry) {
                return function (sUrl, oBody, vCallback) {
                    var oReturnVal = xhr("POST", oXHROptions.async, sUrl, vCallback, fnRetry, oBody);
                    oReturnVal.send(oBody);
                    return oReturnVal;
                };
            }
            function doPut(fnRetry) {
                return function (sUrl, oBody, vCallback) {
                    var oReturnVal = xhr("PUT", oXHROptions.async, sUrl, vCallback, fnRetry, oBody);
                    oReturnVal.send(oBody);
                    return oReturnVal;
                };
            }
            function doDelete(fnRetry) {
                return function (sUrl, vCallback) {
                    var oReturnVal = xhr("DELETE", oXHROptions.async, sUrl, vCallback, fnRetry /*, undefined*/);
                    oReturnVal.send();
                    return oReturnVal;
                };
            }
            function doHead(fnRetry) {
                return function (sUrl, vCallback) {
                    var oReturnVal = xhr("HEAD", oXHROptions.async, sUrl, vCallback, fnRetry /*, undefined*/);
                    oReturnVal.send();
                    return oReturnVal;
                };
            }


            //# Return the core.io.net functionality
            return {
                net: {
                    crud: {
                        create: doPut(/*_undefined*/),
                        read: doGet(/*_undefined*/),
                        update: doPost(/*_undefined*/),
                        'delete': doDelete(/*_undefined*/)
                    },

                    cache: function (oImportCache) {
                        core.extend(oCache, oImportCache);
                        return oCache;
                    },

                    xhr: xhr,
                    //promise: promise,
                    //xhr.options = xhr.options,

                    //# GET, POST, PUT, PATCH, DELETE, HEAD + TRACE, CONNECT, OPTIONS - https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods
                    get: doGet(/*_undefined*/),
                    put: doPut(/*_undefined*/),
                    post: doPost(/*_undefined*/),
                    'delete': doDelete(/*_undefined*/),
                    head: doHead(/*_undefined*/),
                    ping: function (sUrl, vCallback) {
                        doHead(/*_undefined*/)(sUrl, vCallback || function (/* bSuccess, oData, vArg, $xhr */) {});
                    },

                    ip: {
                        is: core.extend(
                            function (sIP) {
                                return (
                                    core.app.ip.is.v4(sIP) ?
                                    4 :
                                        core.app.ip.is.v6(sIP) ?
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
                                    v4: function (sIP) {
                                        return reIPv4.test(sIP + "");
                                    }, //# core.app.ip.is.v4

                                    v6: function (sIP) {
                                        return reIPv6.test(sIP + "");
                                    } //# core.app.ip.is.v6
                                };
                            }()
                        ) //# core.app.ip.is
                    }, //# core.app.ip

                    //#
                    retry: function (oOptions) {
                        var fnRetry, iWait;

                        //#
                        oOptions = core.extend({
                            //wait: 500,
                            //maxAttempts: 5
                        }, oOptions);
                        iWait = (core.type.int.mk(oOptions.wait, 500));
                        oOptions.wait = (core.type.fn.is(oOptions.wait) ? oOptions.wait : function (/*iAttempts*/) { return iWait; });
                        oOptions.maxAttempts = core.type.int.mk(oOptions.maxAttempts, 5);
                        oOptions.attempts = 1;

                        //#
                        fnRetry = function () {
                            return (
                                oOptions.attempts++ < oOptions.maxAttempts ?
                                oOptions.wait(oOptions.attempts) :
                                null
                            );
                        };

                        return {
                            get: doGet(fnRetry),
                            put: doPut(fnRetry),
                            post: doPost(fnRetry),
                            'delete': doDelete(fnRetry),
                            head: doHead(fnRetry),
                            crud: {
                                create: doPut(fnRetry),
                                read: doGet(fnRetry),
                                update: doPost(fnRetry),
                                'delete': doDelete(fnRetry)
                            }
                        };
                    }, //# io.net.retry

                    //# HTTP Status Codes
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
            };
        }); //# core.io.net
    }


    //# If we are running server-side
    //#     NOTE: Generally compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = function (core) {
            init(core, require("xmlhttprequest").XMLHttpRequest);
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
        init(document.querySelector("SCRIPT[ish]").ish, XMLHttpRequest || ActiveXObject);
    }
}());
