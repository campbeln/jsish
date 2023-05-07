//################################################################################################
/** @file Long Number mixin for ish.js
 * @mixin ish.type.is.numeric.large
 * @author Nick Campbell
 * @license MIT
 * @copyright 2006-2023, Nick Campbell
 */ //############################################################################################
/*global module, define */                                      //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict'; //<MIXIN>

    function init(core) {
        //################################################################################################
        /** Collection of long number functionality (range, gle and precision).
         * @namespace ish.type.is.numeric.large
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.type.is, {
            numeric: {
                //#########
                /** Determines if the passed value is within the passed range.
                 * @$note <code>(sNumber >= sMin && sNumber <= sMax)</code> would work for most numeric checks, but in the case of huge/tiny numbers (such as <code>NUMERIC(x,y)</code> in Oracle), the numbers would be too large/small to be represented in Javascript's numeric variables.
                 * @function ish.type.is.numeric.large.range
                 * @param {string} sNumber Value representing the number to compare.
                 * @param {string} sMin Value representing the minimum number.
                 * @param {string} sMax Value representing the maximum number.
                 * @returns {boolean} Value representing if the passed value is within the passed range.
                 */ //#####
                //# Last Updated: February 21, 2006
                range: function (sNumber, sMin, sMax) {
                    return (
                        //#### If the passed sNumber is greater then or equal to the passed sMin
                        core.type.is.numeric.cmp(sNumber, sMin) >= 0 &&
                        //#### If the passed sNumber is less then or equal to the passed sMax
                        core.type.is.numeric.cmp(sNumber, sMax) <= 0
                    );
                }, //# type.is.numeric.large.range


                //#########
                /** Determines if the passed value is greater then, less then or equal to the passed relative value.
                 * @function ish.type.is.numeric.large.cmp
                 * @param {string} sNumber Value representing the number to compare.
                 * @param {string} sRelativeTo Value representing the relative number to compare to.
                 * @returns {integer} Value representing if the passed value is greater then (<code>1</code>), less then (<code>-1</code>) or equal to (<code>0</code>) the passed relative value with <code>undefined</code> indicating one of the passed values was non-numeric.
                 */ //#####
                //# Last Updated: February 21, 2006
                cmp: function (sNumber, sRelativeTo) {
                    //#### Ensure the passed sNumber and sRelativeTo are strings
                    sNumber += "";
                    sRelativeTo += "";

                        //#### Define and init the required local vars
                    var iNumberNumericPrecision = core.type.is.numeric.precision(sNumber);
                    var iRangeNumericPrecision = core.type.is.numeric.precision(sRelativeTo);
                    var iReturn;
                    var bNumberIsPositive = (sNumber.indexOf("-") !== 0);
                    var bRangeIsPositive = (sRelativeTo.indexOf("-") !== 0);

                        //#### If the passed sNumber or sRelativeTo were non-numeric, set our iReturn value to 0
                    if (iNumberNumericPrecision === -1 || iRangeNumericPrecision === -1) {
                        //iReturn = undefined;
                    }
                        //#### Else if the signs of the passed sNumber and sRelativeTo do not match
                    else if (bNumberIsPositive != bRangeIsPositive) {
                            //#### If the bNumberIsPositive, then the sRelativeTo is negetive, so set our iReturn value to 1 (as sNumber is greater then the sRelativeTo)
                        if (bNumberIsPositive) {
                            iReturn = 1;
                        }
                            //#### Else the sNumber is negetive and the bRangeIsPositive, so set our iReturn value to -1 (as sNumber is less then the sRelativeTo)
                        else {
                            iReturn = -1;
                        }
                    }
                        //#### Else the signs of the passed sNumber and sRelativeTo match
                    else {
                            //#### If the above-determined .NumericPrecision's are specifying numbers of less then 1 billion
                        if (iRangeNumericPrecision < 10 && iNumberNumericPrecision < 10) {
                                //#### Define and init the additionally required vars
                                //####     NOTE: We know that both sNumber and sRelativeTo are numeric as non-numeric value are caught by .NumericPrecision above
                            var fNumber = parseFloat(sNumber);
                            var fRange = parseFloat(sRelativeTo);

                                //#### If the sNumber and sRelativeTo are equal, set our iReturn value to 0
                            if (fNumber == fRange) {
                                iReturn = 0;
                            }
                                //#### Else if the sNumber is greater then the sRelativeTo, set our iReturn value to 1
                            else if (fNumber > fRange) {
                                iReturn = 1;
                            }
                                //#### Else the fNumber is less then the sRelativeTo, so set our iReturn value to -1
                            else {
                                iReturn = -1;
                            }
                        }
                            //#### Else we're dealing with number ranges over 1 billion, so let's get creative...
                        else {
                                //#### If the iNumber('s)NumericPrecision is less then the iRange('s)NumericPrecision
                            if (iNumberNumericPrecision < iRangeNumericPrecision) {
                                    //#### If the bNumberIsPositive (and thanks to the check above the bRangeIs(also)Positive), return -1 (as the sNumber is a smaller positive number then the sRelativeTo, making it less)
                                if (bNumberIsPositive) {
                                    iReturn = -1;
                                }
                                    //#### Else the bNumberIs(not)Positive (and thanks to the check above the bRangeIs(also not)Positive), so return 1 (as the sNumber is a smaller negetive number then the sRelativeTo, making it greater)
                                else {
                                    iReturn = 1;
                                }
                            }
                                //#### Else if the iNumber('s)NumericPrecision is more then the iRange('s)NumericPrecision
                            else if (iNumberNumericPrecision > iRangeNumericPrecision) {
                                    //#### If the bNumberIsPositive (and thanks to the check above the bRangeIs(also)Positive), return 1 (as the sNumber is a bigger positive number then the sRelativeTo, making it greater)
                                if (bNumberIsPositive) {
                                    iReturn = 1;
                                }
                                    //#### Else the bNumberIs(not)Positive (and thanks to the check above the bRangeIs(also not)Positive), so return -1 (as the sNumber is a bigger negetive number then the sRelativeTo, making it less)
                                else {
                                    iReturn = -1;
                                }
                            }
                                //#### Else the iNumber('s)NumericPrecision is equal to the iRange('s)NumericPrecision, so additional checking is required
                            else {
                                    //#### Define and set the additionally required decimal point position variables
                                var iNumberDecimalPoint = sNumber.indexOf(".");
                                var iRangeDecimalPoint = sRelativeTo.indexOf(".");

                                    //#### If either/both of the decimal points were not found above, reset iNumberDecimalPoint/iRangeDecimalPoint to their respective .lengths (which logicially places the iRangeDecimalPoint at the end of the sCurrentRange, which is where it is located)
                                    //####    NOTE: Since this function only checks that the passed sNumber is within the passed range, the values "whole" -vs- "floating point" number distinction is ignored as for our purposes, it is unimportant.
                                if (iNumberDecimalPoint == -1) {
                                    iNumberDecimalPoint = sNumber.length;
                                }
                                if (iRangeDecimalPoint == -1) {
                                    iRangeDecimalPoint = sRelativeTo.length;
                                }

                                    //#### If the sNumber's decimal point is to the left of sRelativeTo's (making sNumber less then sRelativeTo), set our iReturn value to -1
                                if (iNumberDecimalPoint < iRangeDecimalPoint) {
                                    iReturn = -1;
                                }
                                    //#### Else if the sNumber's decimal point is to the right of sRelativeTo's (making sNumber greater then sRelativeTo), set our iReturn value to 1
                                else if (iNumberDecimalPoint > iRangeDecimalPoint) {
                                    iReturn = 1;
                                }
                                    //#### Else the sNumber's decimal point is in the same position as the sRelativeTo's decimal point
                                else {
                                        //#### Define and init the additionally required vars
                                    var iCurrentNumberNumber;
                                    var iCurrentRangeNumber;
                                    var i;

                                        //#### Default our iReturn value to 0 (as only > and < are checked in the loop below, so if the loop finishes without changing the iReturn value then the sNumber and sRelativeTo are equal)
                                    iReturn = 0;

                                        //#### Setup the value for i based on if the bNumberIsPositive (setting it to 0 if it is, or 1 if it isn't)
                                        //####    NOTE: This is done to skip over the leading "-" sign in negetive numbers (yea it's ugly, but it works!)
                                        //####    NOTE: Since at this point we know that signs of sNumber and sRelativeTo match, we only need to check bNumberIsPositive's value
                                    i = (bNumberIsPositive) ? (0) : (1);

                                        //#### Traverse the sNumber/sRelativeTo strings from front to back (based on the above determined starting position)
                                        //####     NOTE: Since everything is is the same position and the same precision, we know that sNumber's .lenght is equal to sRelativeTo's
                                    for (i; i < sNumber.length; i++) {
                                            //#### As long as we're not looking at the decimal point
                                        if (i != iNumberDecimalPoint) {
                                                //#### Determine the iCurrentNumberNumber and iCurrentRangeNumber for this loop
                                            iCurrentNumberNumber = parseInt(sNumber[i]);
                                            iCurrentRangeNumber = parseInt(sRelativeTo[i]);

                                                //#### If the iCurrentNumberNumber is less then the iCurrentRangeNumber
                                            if (iCurrentNumberNumber < iCurrentRangeNumber) {
                                                    //#### sNumber is less then sRelativeTo, so set our iReturn value to -1 and fall from the loop
                                                iReturn = -1;
                                                break;
                                            }
                                                //#### Else if the iCurrentNumberNumber is greater then the iCurrentRangeNumber
                                            if (iCurrentNumberNumber > iCurrentRangeNumber) {
                                                    //#### sNumber is greater then sRelativeTo, so set our iReturn value to 1 and fall from the loop
                                                iReturn = 1;
                                                break;
                                            }
                                        }
                                    } //# for
                                }
                            }
                        }
                    }

                        //#### Return the above determined iReturn value to the caller
                    return iReturn;
                }, //# ish.type.is.numeric.large.cmp


                //#########
                /** Determines the numeric precision of the passed value.
                 * @function ish.type.is.numeric.large.precision
                 * @param {string} sNumber Value representing the number to compare.
                 * @returns {integer} Value representing the numeric precision of the passed value.
                 */ //#####
                //# Last Updated: April 19, 2006
                precision: function (sNumber) {
                    var sCurrentChar, i, bStartCounting,
                        sValue = core.type.str.mk(sNumber).trim(),
                        iReturnVal = (/^(-)?[0-9.,]{1,}$/.test(sValue) ? 0 : -1)
                    ;

                    //# If the sValue holds only numeric characters
                    if (iReturnVal === 0) {
                        //#### Traverse the .length of the passed sValue, collecting the sCurrentChar as we go
                        for (i = 0; i < sValue.length; i++) {
                            sCurrentChar = sValue[i]; //# .substr(i, 1)

                            //#### If the sCurrentChar is.numeric
                            if (core.type.is.numeric(sCurrentChar)) {
                                //#### If we are supposed to bStartCounting, inc our iReturnVal
                                //####    NOTE: This is done so we ignore leading 0's (trailing 0's are still counted)
                                bStartCounting = (sCurrentChar !== '0');
                                iReturnVal += (bStartCounting ? 1 : 0);
                            }
                        }
                    }

                    return iReturnVal;
                } //# ish.type.is.numeric.large.precision
            }
        }); //# core.type.num

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.type.is.numeric.large");

        //# Return core to allow for chaining
        return core;
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
        return init(document.querySelector("SCRIPT[ish]").ish);
    }

    //</MIXIN>
}());
