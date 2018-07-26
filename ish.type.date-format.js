/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';


    /*
    ####################################################################################################
	Class: core.type.date
	Additional Date calculation logic (format, dayOfYear and weekOfYear).
    Requires:
    <core.type.date.is>, <core.type.str.is>, 
    <core.type.date.mk>, <core.type.str.mk>, <core.type.int.mk>, 
    *<core.type.str.lpad>
    ####################################################################################################
    */
    core.oop.partial(core.type, function (/*oProtected*/) {
        var oDate,
            enumDays = {
                sun: 0,
                mon: 1,
                tue: 3,
                wed: 4,
                thu: 5,
                sat: 6
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
        //# Determines the simple week number (functionally equivlent to Excel's WeekNum) for the given date.
        //############################################################
        //# Last Updated: April 19, 2006
        function weekOfYear_Simple(dDateTime, eStartOfWeek) {
            var iDaysInFirstWeek = 7,
                dDate = core.type.date.mk(dDateTime, 0),
                eJan1 = (new Date(dDate.getFullYear(), 0, 1)).getDay()
            ;

            //#### If eJan1 differs from the eStartOf(the)Week
            //####     NOTE: This logic is correct thanks to the +1 in the line below. This accounts for the first week (even if, as in this case, the first week is a full week)
            //####     TODO: Verify "+ 1" change below is working
            if (eJan1 !== eStartOfWeek) {
                //#### Calculate the iDaysIn(the)FirstWeek based on the eStart(day)Of(the)Week less Jan 1st's .DayOfWeek (+7/%7 so that the result is positive and properly looped back around)
                iDaysInFirstWeek = ((eStartOfWeek - eJan1 + 1 + 7) % 7);
            }

            //#### Determine and return the .WeekOfYear_Simple based on the passed dDateTime's .DayOfYear, less the iDaysIn(the)FirstWeek +1 (to allow for the first week)
            return Math.ceil((oDate.dayOfYear(dDate) - iDaysInFirstWeek) / 7) + 1;
        } //# weekOfYear_Simple


        //#
        oDate = {
            //#
            enums: {
                days: enumDays,
                weekOfYear: {
                    absolute: -1,
                    //iso8601: -2,
                    simple: enumDays
                }
            }, //# type.date.enums

            //#
            config: {
                weekOfYear: enumDays.sun, //# === core.type.date.enums.weekOfYear.simple.sun
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
                MMMM: ["January","Febuary","March","April","May","June","July","August","September","October","November","December"],
                TT: ["am","pm"]
            }, //# type.date.config


            //############################################################
            //# Formats the provided date based on the referenced format.
            //############################################################
            //# Last Updated: April 19, 2006
            format: function(dDateTime, sFormat) {
                var regex, vTemp, i,
                    oDecoders = {
                        $: []
                    },
                    fnLpad = core.type.str.lpad,
                    oConfig = core.type.date.config
                ;

                //# .registers the decoder value
                function register(sDecode, sValue) {
                    oDecoders[sDecode] = sValue;
                    oDecoders.$.push(sDecode);
                } //# register

                dDateTime = core.type.date.mk(dDateTime, null);

                //# If we were passed a valid dDateTime and sFormat
                if (core.type.date.is(dDateTime) && core.type.str.is(sFormat, true)) {
                    //#### Borrow the use of i to store the month day, setting $D, $DD and $S accordingly
                    i = dDateTime.getDate();
                    register("$D", i);
                    register("$DD", fnLpad(i, '0', 2));
                    register("$S", oConfig.s[i] || oConfig.s[i % 10] || oConfig.s.x);

                    //#### Borrow the use of i to store the day of the week, setting $W, $WWW and $WWWW according to the above determined .DayOfWeek in the borrowed i
                    i = dDateTime.getDay();
                    register("$W", i);
                    register("$WWW", oConfig.WWW[i]);
                    register("$WWWW", oConfig.WWWW[i]);

                    //#### Borrow the use of i to store the month, setting $M, $MM, $MMM and $MMMM accordingly
                    //####     NOTE: .getMonth is 0-based
                    i = dDateTime.getMonth();
                    register("$M", i + 1);
                    register("$MM", fnLpad(i + 1, '0', 2));
                    register("$MMM", oConfig.MMM[i]);
                    register("$MMMM", oConfig.MMMM[i]);

                    //#### Borrow the use of vTemp to store the .WeekOfYear, setting $w, $ww, $yy and $yyyy accordingly
                    vTemp = core.type.date.weekOfYear(dDateTime, oConfig.weekOfYear);
                    register("$w", vTemp.w);
                    register("$ww", fnLpad(vTemp.w, '0', 2));

                    //#### Reset the borrowed vTemp to store the MakeString'd .Year and then borrow i to determine its .Length, finally setting $yy and $yyyy accordingly
                    vTemp = core.type.str.mk(vTemp.yyyy);
                    i = (vTemp.length - 2);
                    register("$yy", fnLpad(vTemp.substr(i < 0 ? 0 : i), '0', 2));
                    register("$yyyy", vTemp);

                    //#### Borrow the use of vTemp to store the MakeString'd .getFullYear and then borrow i to determine its .Length, finally setting $YY and $YYYY accordingly
                    vTemp = core.type.str.mk(dDateTime.getFullYear());
                    i = (vTemp.length - 2);
                    register("$YY", fnLpad(vTemp.substr(i < 0 ? 0 : i), '0', 2));
                    register("$YYYY", vTemp);

                    //#### Borrow the use of i to store the .dayOfYear, setting $J and $JJJ accordingly
                    i = oDate.dayOfYear(dDateTime);
                    register("$J", i);
                    register("$JJJ", fnLpad(i, '0', 3));

                    //#### Set $E based on the current Timestamp (down converting the .getTime'd returned milliseconds into seconds)
                    //####    NOTE: Can debug output at http://www.argmax.com/mt_blog/archive/000328.php?ts=1058415153
                    register("$E", parseInt(dDateTime.getTime() / 1000));

                    //#### Borrow the use of i to store the 24 hour, setting $HH and $H accordingly
                    i = dDateTime.getHours();
                    register("$H", i);
                    register("$HH", fnLpad(i, '0', 2));

                    //# If the .Hour within i is before noon, set $tt to "am", else set $tt to "pm"
                    register("$tt", oConfig.TT[(i % 12) == i ? 0 : 1]);

                    //#### Determine the 12-hour time from the above collected .Hour (fixing 0 hours as necessary), then set $hh and $hh accordingly
                    i = (i % 12 || 12);
                    register("$h", i);
                    register("$hh", fnLpad(i, '0', 2));

                    //#### Borrow the use of i to store the .Minute, setting $m and $mm accordingly
                    i = dDateTime.getMinutes();
                    register("$m", i);
                    register("$mm", fnLpad(i, '0', 2));

                    //#### Borrow the use of i to store the .Second, setting $s and $ss accordingly
                    i = dDateTime.getSeconds();
                    register("$s", i);
                    register("$ss", fnLpad(i, '0', 2));

                    //#### Traverse the above defined oDecoders, replacing each ordered .$[key] with its above determined value within the passed sFormat
                    //####    NOTE: The ordered oDecoders.$ is traversed in reverse to because definitions are set from shortest to longest (i.e. - M, MM, MMM, and MMMM)
                    for (i = oDecoders.$.length - 1; i >= 0; i--) {
                        vTemp = oDecoders.$[i];
                        regex = new RegExp("\\" + vTemp, 'g');
                        sFormat = sFormat.replace(regex, oDecoders[vTemp]);
                    }
                }
                //# Else something was amiss, so reset the sFormat to a null-string
                else {
                    sFormat = "";
                }

                //# Return the above modified sFormat to the caller
                return sFormat;
            }, //# type.date.format


            //############################################################
            //# Gets the day of the year for the provided date.
            //############################################################
            //# Last Updated: April 12, 2006
            dayOfYear: function(dDateTime) {
                //# If the caller passed in a valid dDateTime
                if (core.type.date.is(dDateTime)) {
                    return Math.ceil(
                        //#### Retrieve the number of milliseconds different between the passed dDateTime and Jan 1st of the year it represents
                        (dDateTime.getTime() - new Date(dDateTime.getFullYear(), 0, 1, 0, 0, 0, 0).getTime()) /
                        //#### Convert the above retrieved value from milliseconds into seconds (hence / 1000), then into whole (Math.ceil) days (60 seconds in a minute, 60 minutes in an hour and 24 hours in a day, hence 60 / 60 / 24) + 1 (as it is a 1-based calculation), returning the result to the caller
                        1000 / 60 / 60 / 24
                    ) + 1;
                }
            }, //# type.date.dayOfYear


            //############################################################
            //# Determines the referenced week number for the given date.
            //############################################################
            //# Last Updated: April 13, 2006
            weekOfYear: function(dDateTime, eWeekOfYear) {
                var enumWeekOfYear = oDate.enums.weekOfYear,
                    oReturnVal = {
                        w: 0,
                        yyyy: 0
                    }
                ;

                //# Ensure the caller passed a valid dDateTime
                if (core.type.date.is(dDateTime)) {
                    //#### Redefault the oReturnVal's .yyyy to the passed dDateTime's .getFullYear and ensure eWeekOfYear is set
                    oReturnVal.yyyy = dDateTime.getFullYear();
                    eWeekOfYear = core.type.int.mk(eWeekOfYear, oDate.config.weekOfYear);

                    //#### Determine the eWeekOfYear and process accordingly
                    switch (eWeekOfYear) {
                        /*
                        //#### If this is an .iso8601 week number request, pass the call off to .iso8601
                        case enumWeekOfYear.iso8601: {
                            oReturnVal = weekOfYear_ISO8601(dDateTime);
                            break;
                        }
                        */

                        //#### If this is an .absolute week number request
                        case enumWeekOfYear.absolute: {
                            //#### Calculate the .absolute week number based on the rounded up Julian .dayOfYear (as .absolute week numbers are based on days since Jan 1st, irrespective of its week day)
                            oReturnVal.w = Math.ceil(oDate.dayOfYear(dDateTime) / 7);
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
                            oReturnVal.w = weekOfYear_Simple(dDateTime, eWeekOfYear);
                            break;
                        }
                    }
                }

                return oReturnVal;
            } //# type.date.weekOfYear
        };

        return {
            date: oDate
        };
    }); //# core.type.date

}(document.getElementsByTagName("HTML")[0].ish);
