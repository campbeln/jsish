//################################################################################################
/** @file Additional Date Functionality mixin for ish.js
 * @mixin ish.type.date
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 * @ignore
 */ //############################################################################################
/*global module, define */                                      //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core) {
        //################################################################################################
        /** Collection of additional Date-based functionality.
         * @namespace ish.type.date
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.type, function (/*oProtected*/) {
            var oDate,
                enumDays = {
                    sun: 0,
                    mon: 1,
                    tue: 3,
                    wed: 4,
                    thu: 5,
                    sat: 6
                },
                oConfig = {
                    weekOfYear: enumDays.sun, //# === core.type.date.enums.weekOfYear.simple.sun
                    format: {
                        s: {
                            "1": "st",
                            "2": "nd",
                            "3": "rd",
                            "11": "th",
                            "12": "th",
                            "13": "th",
                            x: "th"
                        },
                        WWW: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
                        WWWW: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                        MMM: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                        MMMM: ["January","February","March","April","May","June","July","August","September","October","November","December"],
                        T: ["a","p"],
                        TT: ["am","pm"]
                    }
                }
            ;

            /*
            //############################################################
            //# Determines the ISO 8601 week number (also known as the 4 day rule) for the given date.
            //############################################################
            //# Last Updated: April 19, 2006
            function weekOfYear_ISO8601(dDateTime) {
                var iDaysInWeek1, iJan1, iDec31,
                    cTHURSDAY = 4,
                    iYYYY = dDateTime.getFullYear(),
                    oReturnVal = {
                        w: 0,
                        yyyy: iYYYY
                    }
                ;

                //#### Determine the iJan1 and iDec31 days of the week for the year (index 1)
                //####     NOTE: Sunday = 0 ... Saturday = 6
                //####     NOTE: January = 0 ... December = 11
                iJan1 = new Date(iYYYY, 0, 1).getDay();
                iDec31 = new Date(iYYYY, 11, 31).getDay();

                //#### Convert iJan1 to 1-based and starting on Monday (as per ISO 8601)
                //####     NOTE: Due to the nature of the calculations below, we do not need to do this conversion on iDec31
                //####     NOTE: Monday = 1 ... Sunday = 7
                if (iJan1 == 0) {
                    iJan1 = 7;
                }

                //#### Determine the number of iDaysInWeek1
                //####     NOTE: Since Monday is the start of the week (as per ISO 8601) and iJan1 was converted to conform to "Monday = 1 ... Sunday = 7" above, -8 is the correct means to calculate the iDaysInWeek1 (ex: 8 - 7 [Sun] = 1 day in that week)
                iDaysInWeek1 = (8 - iJan1);

                //#### Calculate the number of .w(eeks) (NOT including the first week) between the start of the year (index 1) and the passed dDateTime
                //####     NOTE: Partial weeks are also counted thanks to the rounding up of .ceil
                oReturnVal.w = Math.ceil((oDate.dayOfYear(dDateTime) - iDaysInWeek1) / 7);

                //#### If the iDaysInWeek1 includes cTHURSDAY, include the first week in the a_iReturn value's week (index 0) (so inc iReturn by 1)
                //####     NOTE: Since "Monday = 1 ... Sunday = 7", the simple "greater than" calculation below works as required
                if (iDaysInWeek1 >= cTHURSDAY) {
                    oReturnVal.w++;
                }

                //#### If the week (index 0) has been calculated to 53 on a non-53 week year
                //####     NOTE: .Years with 53 weeks must either start or end on a cTHURSDAY, otherwise they would not have more then 364 days to push them into the 53rd week (as 364 / 7 == 52, so any year with 364 or fewer days has 52 weeks)
                if (oReturnVal.w > 52 && iJan1 != cTHURSDAY && iDec31 != cTHURSDAY) {
                    //#### Increment the .yyyy and reset the .w(eek) to 1 (as the date is part of next year's week count)
                    oReturnVal.yyyy++;
                    oReturnVal.w = 1;
                }

                //#### If the week (index 0) is still 0, then we are looking at the last week of the previous year
                if (oReturnVal.w == 0) {
                    //#### Recurse to calculate the week containing Dec31 for the previous year
                    oReturnVal = weekOfYear_ISO8601(new Date(iYYYY - 1, 11, 31));
                }

                return oReturnVal;
            } //# weekOfYear_ISO8601
            */

            //############################################################
            //# Determines the simple week number (functionally equivalent to Excel's WeekNum) for the given date.
            //############################################################
            //# Last Updated: April 19, 2006
            function weekOfYear_Simple(vDateTime, eStartOfWeek) {
                var iDaysInFirstWeek = 7,
                    dDate = core.type.date.mk(vDateTime, 0),
                    eJan1 = (new Date(dDate.getFullYear(), 0, 1)).getDay()
                ;

                //#### If eJan1 differs from the eStartOf(the)Week
                //####     NOTE: This logic is correct thanks to the +1 in the line below. This accounts for the first week (even if, as in this case, the first week is a full week)
                //####     TODO: Verify "+ 1" change below is working
                if (eJan1 !== eStartOfWeek) {
                    //#### Calculate the iDaysIn(the)FirstWeek based on the eStart(day)Of(the)Week less Jan 1st's .DayOfWeek (+7/%7 so that the result is positive and properly looped back around)
                    iDaysInFirstWeek = ((eStartOfWeek - eJan1 + 1 + 7) % 7);
                }

                //#### Determine and return the .WeekOfYear_Simple based on the passed vDateTime's .DayOfYear, less the iDaysIn(the)FirstWeek +1 (to allow for the first week)
                return Math.ceil((oDate.dayOfYear(dDate) - iDaysInFirstWeek) / 7) + 1;
            } //# weekOfYear_Simple


            //#
            oDate = {
                //#########
                /** Enumerations for Days (<code>ish.type.date.enum.days</code>) and Week of Year (<code>ish.type.date.enum.weekOfYear</code>).
                 * @function ish.type.date.enums
                 */ //#####
                enums: {
                    days: enumDays,
                    weekOfYear: {
                        absolute: -1,
                        //iso8601: -2,
                        simple: enumDays
                    }
                }, //# type.date.enums


                //#########
                /** Formats the passed value based on the passed format.
                 * @function ish.type.date.format
                 * @$note The date format is specified using the following values:
                 * <ul>
                 *  <li><code>D</code>: Day of Month as number</li><li><code>DD</code>: Day of Month as 2-digit number (zero-padded)</li><li><code>S</code>: Day of Month's One's Place Suffix (e.g. <code>st</code>, <code>nd</code>, <code>rd</code>, <code>th</code>).</li>
                 *  <li style='margin-top: 15px;'><code>W</code>: Day of Week as 1-character (e.g. <code>M</code>)</li><li><code>WWW</code>: Day of Week as 3-characters (e.g. <code>Mon</code>)</li><li><code>WWWW</code>: Day of Week as word (e.g. <code>Monday</code>)</li>
                 *  <li style='margin-top: 15px;'><code>M</code>: Month as number</li><li><code>MM</code>: Month as 2-digit number (zero-padded)</li><li><code>MMM</code>: Month as 3-characters (e.g. <code>Jan</code>)</li><li><code>MMMM</code>: Month as word (e.g. <code>January</code>)</li>
                 *  <li style='margin-top: 15px;'><code>w</code>: Week of Year's Week as number</li><li><code>ww</code>: Week of Year's Week as 2-digit number (zero-padded)</li><li><code>yy</code>: Week of Year's Year as 2-digit number</li><li><code>yyyy</code>: Week of Year's Year as 4-digit number</li>
                 *  <li style='margin-top: 15px;'><code>YY</code>: Year as 2-digit number (zero-padded)</li><li><code>YYYY</code>: Year as 4-digit number</li>
                 *  <li style='margin-top: 15px;'><code>J</code>: Day of Year as number</li><li><code>JJJ</code>: Day of Year as 3-digit number (zero-padded)</li>
                 *  <li style='margin-top: 15px;'><code>E</code>: Timestamp as number</li><li><code>e</code>: <code>window.performance</code>-based Timestamp as number</li>
                 *  <li style='margin-top: 15px;'><code>H</code>: 24 Hour as number</li><li><code>HH</code>: 24 Hour as 2-digit number (zero-padded)</li>
                 *  <li style='margin-top: 15px;'><code>h</code>: 12 Hour as number</li><li><code>hh</code>: 12 Hour as 2-digit number (zero-padded)</li>
                 *  <li style='margin-top: 15px;'><code>m</code>: Minutes as number</li><li><code>mm</code>: Minutes as 2-digit number (zero-padded)</li>
                 *  <li style='margin-top: 15px;'><code>s</code>: Seconds as number</li><li><code>ss</code>: Seconds as 2-digit number (zero-padded)</li>
                 *  <li style='margin-top: 15px;'><code>t</code>: Meridian as 1-character (e.g. <code>a</code>, <code>p</code>)</li><li><code>tt</code>: Meridian as 2-characters (e.g. <code>am</code>, <code>pm</code>)</li>
                 *  <li style='margin-top: 15px;'><code>zz</code>: Timezone Offset in Minutes as number (per {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset|MDN})</li><li><code>zzzz</code>: Timezone Offset as <code>±hh:mm</code> (e.g. <code>-08:00</code>, per {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset|MDN})</li>
                 * </ul>
                 * @param {variant} vDateTime Value to interrogate.
                 * @param {string} sFormat Value representing the date format.
                 * @returns {string} Value representing the formatted date.
                 */ //#####
                //# Last Updated: April 19, 2006
                format: function (vDateTime, sFormat) {
                    var vTemp, i,
                        oDecoders = {
                            $order: []
                        },
                        fnLpad = core.type.fn.mk(core.type.str.lpad, function (x) {
                            return (core.resolve(x, "length") === 0 ? "0" + x : x);
                        })
                    ;

                    //# .registers the decoder value
                    function register(sDecode, sValue) {
                        oDecoders[sDecode] = sValue;
                        oDecoders.$order.push(sDecode);
                    } //# register

                    vDateTime = core.type.date.mk(vDateTime, null);

                    //# If we were passed a valid vDateTime and sFormat
                    if (core.type.date.is(vDateTime) && core.type.str.is(sFormat, true)) {
                        //#### Borrow the use of i to store the month day, setting D, DD and S accordingly
                        i = vDateTime.getDate();
                        register("D", i);
                        register("DD", fnLpad(i, '0', 2));
                        register("S", oConfig.format.s[i] || oConfig.format.s[i % 10] || oConfig.format.s.x);

                        //#### Borrow the use of i to store the day of the week, setting W, WWW and WWWW according to the above determined .DayOfWeek in the borrowed i
                        i = vDateTime.getDay();
                        register("W", i);
                        register("WWW", oConfig.format.WWW[i]);
                        register("WWWW", oConfig.format.WWWW[i]);

                        //#### Borrow the use of i to store the month, setting M, MM, MMM and MMMM accordingly
                        //####     NOTE: .getMonth is 0-based
                        i = vDateTime.getMonth();
                        register("M", i + 1);
                        register("MM", fnLpad(i + 1, '0', 2));
                        register("MMM", oConfig.format.MMM[i]);
                        register("MMMM", oConfig.format.MMMM[i]);

                        //#### Borrow the use of vTemp to store the .WeekOfYear, setting w, ww, yy and yyyy accordingly
                        vTemp = core.type.date.weekOfYear(vDateTime, oConfig.weekOfYear);
                        register("w", vTemp.w);
                        register("ww", fnLpad(vTemp.w, '0', 2));

                        //#### Reset the borrowed vTemp to store the MakeString'd .Year and then borrow i to determine its .Length, finally setting yy and yyyy accordingly
                        vTemp = core.type.str.mk(vTemp.yyyy);
                        i = (vTemp.length - 2);
                        register("yy", fnLpad(vTemp.substr(i < 0 ? 0 : i), '0', 2));
                        register("yyyy", vTemp);

                        //#### Borrow the use of vTemp to store the MakeString'd .getFullYear and then borrow i to determine its .Length, finally setting YY and YYYY accordingly
                        vTemp = core.type.str.mk(vDateTime.getFullYear());
                        i = (vTemp.length - 2);
                        register("YY", fnLpad(vTemp.substr(i < 0 ? 0 : i), '0', 2));
                        register("YYYY", vTemp);

                        //#### Borrow the use of i to store the .dayOfYear, setting J and JJJ accordingly
                        i = oDate.dayOfYear(vDateTime);
                        register("J", i);
                        register("JJJ", fnLpad(i, '0', 3));

                        //#### Set E based on the current Timestamp (down converting the .getTime'd returned milliseconds into seconds)
                        //####    NOTE: Can debug output at http://www.argmax.com/mt_blog/archive/000328.php?ts=1058415153
                        register("E", parseInt(vDateTime.getTime() / 1000));
                        register("e", core.type.date.timestamp());

                        //#### Borrow the use of i to store the 24 hour, setting HH and H accordingly
                        i = vDateTime.getHours();
                        register("H", i);
                        register("HH", fnLpad(i, '0', 2));

                        //# If the .Hour within i is before noon, set tt to "am", else set tt to "pm"
                        register("t", oConfig.format.T[(i % 12) === i ? 0 : 1]);
                        register("tt", oConfig.format.TT[(i % 12) === i ? 0 : 1]);

                        //#### Determine the 12-hour time from the above collected .Hour (fixing 0 hours as necessary), then set hh and hh accordingly
                        i = (i % 12 || 12);
                        register("h", i);
                        register("hh", fnLpad(i, '0', 2));

                        //#### Borrow the use of i to store the .Minute, setting m and mm accordingly
                        i = vDateTime.getMinutes();
                        register("m", i);
                        register("mm", fnLpad(i, '0', 2));

                        //#### Borrow the use of i to store the .Second, setting s and ss accordingly
                        i = vDateTime.getSeconds();
                        register("s", i);
                        register("ss", fnLpad(i, '0', 2));

                        //# Borrow the use of i to store the .getTimezoneOffset, setting zzzz accordingly
                        i = -vDateTime.getTimezoneOffset();
                        register("zz", i * -1);
                        register("zzzz",
                            (i > -1 ? '+' : '-') + fnLpad(Math.floor(Math.abs(i / 60)), '0', 2) + ':' + fnLpad(Math.floor(Math.abs(i % 60)), '0', 2)
                        );

                        //# Traverse the above defined oDecoders, preprocessing the sFormat by replacing the user-set values with {{i}}
                        //#     NOTE: Preprocessing is required as (for example) "m" appears in "December"
                        for (i = oDecoders.$order.length - 1; i > -1; i--) {
                            vTemp = oDecoders.$order[i];
                            sFormat = sFormat.replace(new RegExp("[$]?" + vTemp, 'g'), "{{" + i + "}}"); //# Support $legacy format
                        }

                        //#### Traverse the above defined oDecoders, replacing each ordered .$order[key] with its above determined value within the passed sFormat
                        //####    NOTE: The ordered oDecoders.$order is traversed in reverse to because definitions are set from shortest to longest (i.e. - M, MM, MMM, and MMMM)
                        for (i = oDecoders.$order.length - 1; i > -1; i--) {
                            vTemp = oDecoders.$order[i];
                            sFormat = sFormat.replace(new RegExp("\\{\\{" + i + "\\}\\}", 'g'), oDecoders[vTemp]);
                            //sFormat = sFormat.replace(new RegExp("[$]" + vTemp, 'g'), oDecoders[vTemp]);
                        }
                    }
                    //# Else something was amiss, so reset the sFormat to a null-string
                    else {
                        sFormat = "";
                    }

                    //# Return the above modified sFormat to the caller
                    return sFormat;
                }, //# type.date.format


                //#########
                /** Formats the passed value in ISO 8601 format with the local timezone offset.
                 * @function ish.type.date.isoLocalString
                 * @param {variant} vDateTime Value to interrogate.
                 * @returns {string} Value representing the passed value in ISO 8601 format with the local timezone offset.
                 * @see {@link https://stackoverflow.com/a/17415677/235704|StackOverflow.com}
                 * @see {@link https://en.wikipedia.org/wiki/ISO_8601#Time_offsets_from_UTC|ISO 8601}
                 */ //#####
                isoLocalString: function () {
                    function l0Pad(i) {
                        return core.type.str.lpad(Math.floor(Math.abs(i)), '0', 2);
                    } //# l0Pad

                    return function (vDateTime) {
                        var dDate = core.type.date.mk(vDateTime),
                            iTimezoneOffset = -dDate.getTimezoneOffset()
                        ;

                        return dDate.getFullYear() + '-' + l0Pad(dDate.getMonth() + 1) + '-' + l0Pad(dDate.getDate()) +
                            'T' + l0Pad(dDate.getHours()) + ':' + l0Pad(dDate.getMinutes()) + ':' + l0Pad(dDate.getSeconds()) +
                            (iTimezoneOffset > -1 ? '+' : '-') + l0Pad(iTimezoneOffset / 60) + ':' + l0Pad(iTimezoneOffset % 60)
                        ;
                    };
                }(), //# type.date.isoLocalString


                //#########
                /** Determines the day of the year of the passed value.
                 * @function ish.type.date.dayOfYear
                 * @param {variant} vDateTime Value to interrogate.
                 * @returns {string} Value representing the day of the year of the passed value.
                 */ //#####
                //# Last Updated: April 12, 2006
                dayOfYear: function (vDateTime) {
                    vDateTime = core.type.date.mk(vDateTime, null);

                    //# If the caller passed in a valid vDateTime
                    if (core.type.date.is(vDateTime)) {
                        return Math.ceil(
                            //#### Retrieve the number of milliseconds different between the passed vDateTime and Jan 1st of the year it represents
                            (vDateTime.getTime() - new Date(vDateTime.getFullYear(), 0, 1, 0, 0, 0, 0).getTime()) /
                            //#### Convert the above retrieved value from milliseconds into seconds (hence / 1000), then into whole (Math.ceil) days (60 seconds in a minute, 60 minutes in an hour and 24 hours in a day, hence 60 / 60 / 24) + 1 (as it is a 1-based calculation), returning the result to the caller
                            1000 / 60 / 60 / 24
                        ) + 1;
                    }
                }, //# type.date.dayOfYear


                //#########
                /** Determines the week of the year of the passed value.
                 * @function ish.type.date.weekOfYear
                 * @param {variant} vDateTime Value to interrogate.
                 * @returns {string} Value representing the week of the year of the passed value.
                 */ //#####
                //# Last Updated: April 13, 2006
                weekOfYear: function (vDateTime, eWeekOfYear) {
                    var enumWeekOfYear = oDate.enums.weekOfYear,
                        oReturnVal = {
                            w: 0,
                            yyyy: 0
                        }
                    ;

                    //# Ensure the caller passed a valid vDateTime
                    vDateTime = core.type.date.mk(vDateTime, null);

                    //# If the caller passed a valid vDateTime
                    if (vDateTime) {
                        //#### Re-default the oReturnVal's .yyyy to the passed vDateTime's .getFullYear and ensure eWeekOfYear is set
                        oReturnVal.yyyy = vDateTime.getFullYear();
                        eWeekOfYear = core.type.int.mk(eWeekOfYear, oConfig.weekOfYear);

                        //#### Determine the eWeekOfYear and process accordingly
                        switch (eWeekOfYear) {
                            /*
                            //#### If this is an .iso8601 week number request, pass the call off to .iso8601
                            case enumWeekOfYear.iso8601: {
                                oReturnVal = weekOfYear_ISO8601(vDateTime);
                                break;
                            }
                            */

                            //#### If this is an .absolute week number request
                            case enumWeekOfYear.absolute: {
                                //#### Calculate the .absolute week number based on the rounded up Julian .dayOfYear (as .absolute week numbers are based on days since Jan 1st, irrespective of its week day)
                                oReturnVal.w = Math.ceil(oDate.dayOfYear(vDateTime) / 7);
                                break;
                            }

                            //#### If this is an .cnSimple_* week number request, pass the call off to .weekOfYear.simple
                            case enumWeekOfYear.simple.sun:
                            case enumWeekOfYear.simple.mon:
                            case enumWeekOfYear.simple.tue:
                            case enumWeekOfYear.simple.wed:
                            case enumWeekOfYear.simple.thu:
                            case enumWeekOfYear.simple.fri:
                            case enumWeekOfYear.simple.sat: {
                                //#### Determine oReturnVal's .w(eek)
                                oReturnVal.w = weekOfYear_Simple(vDateTime, eWeekOfYear);
                                break;
                            }
                        }
                    }

                    return oReturnVal;
                } //# type.date.weekOfYear
            };

            //#########
            /** <code>ish.type.date</code> configuration values.
             * @function ish.config.type:date
             * @param {object} [oOptions] Value representing the updated configuration values.
             * @returns {object} Value representing <code>ish.type.date</code>'s configuration values.
             */ //#####
            if (!core.type.fn.run(core.resolve(core.config, "type.date"), { args: oConfig })) {
                core.resolve(true, core.config, "type").date = core.config(oConfig);
            }


            return {
                date: oDate
            };
        }); //# core.type.date

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.type.date-format");
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
}());
