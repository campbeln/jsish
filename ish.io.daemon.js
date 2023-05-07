//################################################################################################
/** @file Daemon mixin for ish.js
 * @mixin ish.io.daemon
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2023, Nick Campbell
 */ //############################################################################################
/*global module, define */                                      //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict'; //<MIXIN>

    function init(core) {
        //################################################################################################
        /** Collection of Daemon-based functionality.
         * @namespace ish.io.daemon
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io, function (/*oProtected*/) {
            var oDaemons = {
                intervals: {
                    //m60000: undefined
                },
                ids: [],
                data: [],
                counter: 0
            };

            //# Factory function called by setInterval to execute the .register'ed .ids's
            function daemon(iInterval) {
                var sKey = "m" + iInterval;

                return function () {
                    var fn, oData, i,
                        iCount = 0
                    ;

                    //# Traverse our .register'ed .ids's, pulling the oData and fn for each loop and resetting out iCount
                    for (i = 0; i < oDaemons.ids.length; i++) {
                        oData = oDaemons.data[i];
                        fn = oData.fn;

                        //# If the current oData's .target equals our iInterval, inc our iCount
                        if (oData.target === iInterval) {
                            iCount++;

                            //# If we have to look at oData's .delayXIntervals
                            if (oData.interval !== iInterval || core.type.date.time.is(oData.at)) {
                                //# If the current .delayXIntervals is due to be called (pre-decrementing as we go), reset the .delayXIntervals and call the fn while pre-inc'ing .callCount
                                if (--oData.delayXIntervals <= 0) {
                                    //# Calculate our .delayXIntervals
                                    //#     NOTE: We subtract 1 to count this interval
                                    oData.delayXIntervals = (core.type.date.time.is(oData.at) ?
                                        core.io.daemon.units.day :
                                        (oData.interval / oData.target)
                                    ) - 1;
                                    setTimeout(fn(++oData.callCount, core.extend({}, oData)), 0);
                                    oData.lastCall = new Date();
                                }
                            }
                            //# Else we call the fn on every loop, so do so now while pre-inc'ing .callCount
                            else {
                                setTimeout(fn(++oData.callCount, core.extend({}, oData)), 0);
                                oData.lastCall = new Date();
                            }

                            //# If we've reached our .maxIntervals, .unregister the fn
                            /*if (oData.maxIntervals === oData.callCount) {
                                core.io.daemon.unregister(fn);
                            }*/
                        }
                    }

                    //# If there are no longer any .registered .ids's, .clearInterval and reset its ID so it can be respawned in .register
                    if (iCount === 0) {
                        clearInterval(oDaemons.intervals[sKey]);
                        oDaemons.intervals[sKey] = 0;
                    }
                };
            } //# daemon


            return {
                daemon: {
                    //#########
                    /** Registers the passed function as a daemon executed at the passed interval.
                     * @function ish.io.daemon.register
                     * @param {function} fn Value representing the function to execute.
                     * @param {integer|string} [vInterval=ish.io.daemon.units.minute] Value representing the number of milliseconds between invocations or the <code>hh:mm</code> to execute as a time string (in 24-hour format).
                     * @returns {integer} Value representing the ID of the registered daemon function or <code>0</code> if the call was unsuccessful.
                     */ //#####
                    register: function (fn, vInterval) {
                        var oSeconds, sKey,
                            iID = 0,
                            oData = {
                                interval: vInterval
                            }
                        ;

                        //# If the passed fn is valid, populate our oData
                        if (core.type.fn.is(fn)) {
                            oData.registered = true;
                            oData.callCount = 0;
                            oData.fn = fn;
                            oData.started = new Date();
                            //oData.lastCall = undefined;
                            //oData.maxIntervals = core.type.int.mk(oData.maxIntervals, -1);
                            //oData.maxIntervals = (oData.maxIntervals < 1 ? -1 : oData.maxIntervals);

                            //# If we are to call daily at a specific time, determine the oSeconds
                            if (core.type.date.time.is(oData.interval)) {
                                oSeconds = {
                                    at: core.type.date.time.seconds(oData.interval),
                                    now: core.type.date.time.seconds()
                                };

                                //# Set our .interval, .target and .delayXIntervals to fire at the next .at
                                //#     NOTE: If we haven't passed .at yet we can subtract .now from .at, else we need to determine the remaining seconds in today plus the .at into tomorrow
                                oData.at = oData.interval;
                                oData.interval = 60000;
                                oData.target = 60000;
                                oData.delayXIntervals = (oSeconds.at > oSeconds.now ?
                                    oSeconds.at - oSeconds.now :
                                    core.io.daemon.units.day - oSeconds.now + oSeconds.at
                                );
                            }
                            //#
                            /*else if (core.type.arr.is(oData.at, true)) {
                                for (oData.i = 0; oData.i < oData.at.length; oData.i++) {
                                    core.io.daemon.register(fn, core.extend({}, oData, { at: oData[oData.i] }));
                                }
                            }*/
                            //# Else we are to call on the .interval, so determine it, the .target and it's related .delayXIntervals
                            else {
                                //oData.at = undefined;
                                oData.interval = core.type.int.mk(oData.interval, 60000);
                                oData.target = (oData.interval % 60000 === 0 ? 60000 : oData.interval);
                                oData.delayXIntervals = (oData.interval / oData.target);
                            }

                            //# Determine the iID for this daemon then set the .id and .push the above transformed oData into our arrays and determine the sKey name
                            iID = ++oDaemons.counter;
                            oData.id = iID;
                            oDaemons.ids.push(iID);
                            oDaemons.data.push(oData);
                            sKey = "m" + oData.target;

                            //# If we don't have an active .setInterval for the .target, kick it off now
                            if (!oDaemons.intervals[sKey]) {
                                oDaemons.intervals[sKey] = setInterval(daemon(oData.target), oData.target);
                            }
                        }

                        return iID;
                    }, //# io.daemon.register


                    //#########
                    /** Unregisters the referenced daemon function.
                     * @function ish.io.daemon.unregister
                     * @param {integer} iDaemonID Value representing the ID of the registered daemon function.
                     * @returns {object} Value representing the status of the referenced daemon function.
                     */ //#####
                    unregister: function (iDaemonID) {
                        var oStatus,
                            iIndex = oDaemons.ids.indexOf(iDaemonID),
                            bReturnVal = (iIndex > -1)
                        ;

                        //# If we were able to locate the iIndex, .splice the entries from .ids and .data
                        if (bReturnVal) {
                            oDaemons.ids.splice(iIndex, 1);
                            oStatus = oDaemons.data.splice(iIndex, 1);
                        }

                        return (bReturnVal ? oStatus : { registered: false });
                    }, //# io.daemon.unregister


                    //#########
                    /** Determines the status of the referenced daemon function.
                     * @function ish.io.daemon.status
                     * @$note If <code>iDaemonID</code> isn't numeric, then all the status of all registered daemon functions are returned.
                     * @param {integer} [iDaemonID] Value representing the ID of the registered daemon function.
                     * @returns {object|object[]} Value representing the status of the referenced daemon function(s).
                     */ //#####
                    status: function (iDaemonID) {
                        var vReturnVal, i;

                        //# If the passed iDaemonID .is .int, determine it's .indexOf and reset our vReturnVal accordingly
                        if (core.type.int.is(iDaemonID)) {
                            i = oDaemons.ids.indexOf(iDaemonID);
                            vReturnVal = (i > -1 ? core.extend({}, oDaemons.data[i]) : { registered: false });
                        }
                        //# Else we need to return the .status of all registered daemons, so reset our vReturnVal to an array and .push a copy of each .data entry in
                        else {
                            vReturnVal = [];
                            for (i = 0; i < oDaemons.data.length; i++) {
                                vReturnVal.push(core.extend({}, oDaemons.data[i]));
                            }
                        }

                        return vReturnVal;
                    }, //# io.daemon.status


                    //#########
                    /** Halts all registered daemon functions.
                     * @function ish.io.daemon.halt
                     * @note <code>bConfirm</code> is used as a safety measure to help ensure that <code>ish.io.daemon.halt</code> is not called accidentally.
                     * @param {boolean} bConfirm Value representing if all registered daemon functions are to be halted. <code>true</code> unregisters all functions; all other values leave the registered daemon functions unchanged.
                     * @returns {object[]} Value representing the final status of all daemon functions that were successfully unregistered.
                     */ //#####
                    halt: function (bConfirm) {
                        var i,
                            a_oReturnVal = []
                        ;

                        //# If the caller bConfirm'd that they REALLY want to .halt all .registered .ids's, traverse them and .unregister them one by one while .push'ing each .status result into our a_oReturnVal
                        if (bConfirm === true) {
                            for (i = 0; i < oDaemons.ids.length; i++) {
                                a_oReturnVal.push(core.io.daemon.unregister(oDaemons.ids[i]));
                            }
                        }

                        return a_oReturnVal;
                    }, //# io.daemon.halt


                    //#########
                    /** Represents units of time as milliseconds.
                     * @$note <code>second</code>, <code>minute</code>, <code>hour</code>, <code>day</code> and <code>week</code> are provided in the returned <code>object</code>.
                     * @function ish.io.daemon.units
                     * @$asProperty
                     * @returns {object} Value representing units of time as milliseconds.
                     */ //#####
                    units: {
                        second: 1000,
                        minute: 60000,
                        hour: (60000 * 60),
                        day: (60000 * 60 * 24),
                        week: (60000 * 60 * 24 * 7)
                    } //# io.daemon.units
                } //# io.daemon
            };
        }); //# core.io.daemon

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.daemon");

        //# Return core to allow for chaining
        return core;
    } //# init


    //# If we are running server-side
    //#     NOTE: Generally compliant with UMB, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
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
        return init(document.querySelector("SCRIPT[ish]").ish);
    }

    //</MIXIN>
}());