/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function () {
    'use strict';

    function init(core) {
        /*
        ####################################################################################################
        Class: core.log
        Console and error handling functionality.
        Requires:
        <core.extend>,
        <core.type.str.is>, <core.type.fn.is>,
        <core.type.bool.mk>,
        <core.type.fn.call>, <core.type.fn.tryCatch>,
        ~<core.io.net.ping>
        ####################################################################################################
        */
        core.oop.partial(core.io, function (/*oProtected*/) {
/*
https://www.stacktracejs.com/#!/docs/stacktrace-js

var callback = function(a_oStackframes) {
  var stringifiedStack = a_oStackframes.map(function(sf) {
    return sf.toString();
  }).join('\n');
  console.log(stringifiedStack);
};
var errback = function(err) { console.log(err.message); };


//# window.onerror integration
window.onerror = function(msg, file, line, col, error) {
    // callback is called with an Array[StackFrame]
    StackTrace.fromError(error).then(callback).catch(errback);
};


//# Get stack trace from an Error
var error = new Error('BOOM!');
StackTrace.fromError(error).then(callback).catch(errback);


//# Generate a stacktrace from walking arguments.callee
StackTrace.generateArtificially().then(callback).catch(errback);


//# Trace every time a given function is invoked
//#     NOTE: callback is called with an Array[StackFrame] every time the wrapped interestingFn is called
interestingFnWrapped = StackTrace.instrument(interestingFn, callback, errback)
interestingFnUnwrapped = StackTrace.deinstrument(interestingFn);
*/

            var oLog, oOptions,
                eSeverity = {
                    error: 1,
                    warn: 2,
                    log: 3
                }
            ;

            //#
            function logToServer(eSeverity, _args) {
                var _img, sUrl;

                //# If this is a eSeverity .logLevel we are logging, we need to logToServer
                if (eSeverity <= oOptions.logLevel) {
                    //# If we have a .url to .ping
                    if (core.type.str.is(oOptions.url, true)) {
                        sUrl = oOptions.url + "?error=" + JSON.stringify({
                            message: _args[0],
                            url: _args[1],
                            line: _args[2],
                            col: _args[3],
                            error: _args[4]
                        });
                        //"message=" + encodeURIComponent(sMessage) + "&" +
                        //"url=" + encodeURIComponent(sUrl) + "&" +
                        //"line=" + encodeURIComponent(iLine) + "&" +
                        //"col=" + encodeURIComponent(iColumn) + "&" +
                        //"error=" + encodeURIComponent(_error)

                        //# If core.io.net.ping is defined, .ping the sUrl
                        if (core.type.fn.is(core.resolve(core, "io.net.ping"))) {
                            core.io.net.ping(sUrl);
                        }
                        //# Else there is no core.io.net.ping, so fallback to a IMG.src
                        else {
                            _img = _img || document.createElement("img");
                            _img.src = sUrl;
                        }
                    }

                    //# .call the .callback (if any)
                    core.type.fn.call(oOptions.callback, this, _args); //# TODO: Refactor `this` to `this || _null`?
                }
            } //# logToServer


            //#
            function catchErrors(sMessage, sUrl, iLine, iColumn, _error) {
                //#
                logToServer(eSeverity.error, [sMessage, sUrl, iLine, iColumn, _error]);

                //# Surpress dialog
                return core.type.bool.mk(oOptions.surpressErrors);
            } //# catchErrors


            //# Safely logs the arguments to the console
            function toConsole(/*arguments*/) {
                logToServer(eSeverity.log, arguments);
                try {
                    window.console.log.apply(this, arguments); //# TODO: Refactor `this` to `this || null`?
                } catch (e) { core.type.ish.expectedErrorHandler(e); }
            } //# toConsole


            //#
            oLog = core.extend(toConsole, {
                //# Safely logs the arguments to the console
                console: toConsole,

                //#
                options: function(oLogOptions) {
                    oOptions = core.extend({
                        severity: eSeverity,
                        logLevel: eSeverity.error,
                        logAllErrors: false,
                        surpressErrors: true,
                        callback: null,
                        url: null
                    }, oLogOptions);

                    //#
                    if (oOptions.logAllErrors) {
                        core.type.fn.tryCatch(function() {
                            window.onerror = catchErrors;
                        }, { context: this, default: {} })();
                    }
                    //#
                    else {
                        window.onerror = null;
                    }
                }, //# options

                //# Raises an error
                raise: function (sMessage) {
                    logToServer(eSeverity.error, sMessage);
                    throw sMessage;
                }, //# raise

                //# Safely warns the arguments to the console
                warn: function (/*arguments*/) {
                    logToServer(eSeverity.warn, arguments);
                    try {
                        if (window.console && core.type.fn.is(window.console.warn)) {
                            window.console.warn.apply(this, arguments);
                        }
                        else {
                            oLog.console.apply(this, arguments);
                        }
                    } catch (e) { core.type.ish.expectedErrorHandler(e); }
                } //# warn
            });

            return {
                log: oLog
            };
        }); //# core.io.log
    } //# init


    //# If we are running server-side (or possibly have been required as a CommonJS module)
    if (typeof window === 'undefined') { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = init;
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}();
