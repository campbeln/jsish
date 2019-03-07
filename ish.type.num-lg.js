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
        Class: core.type.num
        Additional Numeric calculation logic (range, gle and precision).
        Requires:
        <core.type.num.is>,
        <core.type.str.mk>
        ####################################################################################################
        */
        core.oop.partial(core.type, {
            num: {
                //############################################################
                //# Determines if the passed sNumber is within the passed range
                //#    NOTE: "return (sNumber >= sMin && sNumber <= sMax)" would work in 99.9% of the checks we'll do with this function, but in the case of huge/tiny numbers (such as NUMERIC(x,y)'s in Oracle), this wouldn't cut it as the numbers would be too large/small to be represented in any available numeric variables
                //############################################################
                //# Last Updated: February 21, 2006
                range: function(sNumber, sMin, sMax) {
                    return (
                        //#### If the passed sNumber is greater then or equal to the passed sMin
                        core.type.num.cmp(sNumber, sMin) >= 0 &&
                        //#### If the passed sNumber is less then or equal to the passed sMax
                        core.type.num.cmp(sNumber, sMax) <= 0
                    );
                }, //# type.num.range

                //############################################################
                //# Determines if the passed sNumber is greater then, less then or equal to the passed sComparedTo
                //#     Return values:
                //#          -1 if sNumber is less then sComparedTo
                //#          1 if sNumber is greater then sComparedTo
                //#          0 if the passed values are equal, or if one of the passed values was non-numeric
                //############################################################
                //# Last Updated: February 21, 2006
                compare: function(sNumber, sComparedTo) {
                    //#### Ensure the passed sNumber and sComparedTo are strings
                    sNumber += "";
                    sComparedTo += "";

                        //#### Define and init the required local vars
                    var iNumberNumericPrecision = core.type.num.precision(sNumber);
                    var iRangeNumericPrecision = core.type.num.precision(sComparedTo);
                    var iReturn;
                    var bNumberIsPositive = (sNumber.indexOf("-") !== 0);
                    var bRangeIsPositive = (sComparedTo.indexOf("-") !== 0);

                        //#### If the passed sNumber or sComparedTo were non-numeric, set our iReturn value to 0
                    if (iNumberNumericPrecision === -1 || iRangeNumericPrecision === -1) {
                        iReturn = 0;
                    }
                        //#### Else if the signs of the passed sNumber and sComparedTo do not match
                    else if (bNumberIsPositive != bRangeIsPositive) {
                            //#### If the bNumberIsPositive, then the sComparedTo is negetive, so set our iReturn value to 1 (as sNumber is greater then the sComparedTo)
                        if (bNumberIsPositive) {
                            iReturn = 1;
                        }
                            //#### Else the sNumber is negetive and the bRangeIsPositive, so set our iReturn value to -1 (as sNumber is less then the sComparedTo)
                        else {
                            iReturn = -1;
                        }
                    }
                        //#### Else the signs of the passed sNumber and sComparedTo match
                    else {
                            //#### If the above-determined .NumericPrecision's are specifying numbers of less then 1 billion
                        if (iRangeNumericPrecision < 10 && iNumberNumericPrecision < 10) {
                                //#### Define and init the additionally required vars
                                //####     NOTE: We know that both sNumber and sComparedTo are numeric as non-numeric value are caught by .NumericPrecision above
                            var fNumber = parseFloat(sNumber);
                            var fRange = parseFloat(sComparedTo);

                                //#### If the sNumber and sComparedTo are equal, set our iReturn value to 0
                            if (fNumber == fRange) {
                                iReturn = 0;
                            }
                                //#### Else if the sNumber is greater then the sComparedTo, set our iReturn value to 1
                            else if (fNumber > fRange) {
                                iReturn = 1;
                            }
                                //#### Else the fNumber is less then the sComparedTo, so set our iReturn value to -1
                            else {
                                iReturn = -1;
                            }
                        }
                            //#### Else we're dealing with number ranges over 1 billion, so let's get creative...
                        else {
                                //#### If the iNumber('s)NumericPrecision is less then the iRange('s)NumericPrecision
                            if (iNumberNumericPrecision < iRangeNumericPrecision) {
                                    //#### If the bNumberIsPositive (and thanks to the check above the bRangeIs(also)Positive), return -1 (as the sNumber is a smaller positive number then the sComparedTo, making it less)
                                if (bNumberIsPositive) {
                                    iReturn = -1;
                                }
                                    //#### Else the bNumberIs(not)Positive (and thanks to the check above the bRangeIs(also not)Positive), so return 1 (as the sNumber is a smaller negetive number then the sComparedTo, making it greater)
                                else {
                                    iReturn = 1;
                                }
                            }
                                //#### Else if the iNumber('s)NumericPrecision is more then the iRange('s)NumericPrecision
                            else if (iNumberNumericPrecision > iRangeNumericPrecision) {
                                    //#### If the bNumberIsPositive (and thanks to the check above the bRangeIs(also)Positive), return 1 (as the sNumber is a bigger positive number then the sComparedTo, making it greater)
                                if (bNumberIsPositive) {
                                    iReturn = 1;
                                }
                                    //#### Else the bNumberIs(not)Positive (and thanks to the check above the bRangeIs(also not)Positive), so return -1 (as the sNumber is a bigger negetive number then the sComparedTo, making it less)
                                else {
                                    iReturn = -1;
                                }
                            }
                                //#### Else the iNumber('s)NumericPrecision is equal to the iRange('s)NumericPrecision, so additional checking is required
                            else {
                                    //#### Define and set the additionally required decimal point position variables
                                var iNumberDecimalPoint = sNumber.indexOf(".");
                                var iRangeDecimalPoint = sComparedTo.indexOf(".");

                                    //#### If either/both of the decimal points were not found above, reset iNumberDecimalPoint/iRangeDecimalPoint to their respective .lengths (which logicially places the iRangeDecimalPoint at the end of the sCurrentRange, which is where it is located)
                                    //####    NOTE: Since this function only checks that the passed sNumber is within the passed range, the values "whole" -vs- "floating point" number distinction is ignored as for our purposes, it is unimportant.
                                if (iNumberDecimalPoint == -1) {
                                    iNumberDecimalPoint = sNumber.length;
                                }
                                if (iRangeDecimalPoint == -1) {
                                    iRangeDecimalPoint = sComparedTo.length;
                                }

                                    //#### If the sNumber's decimal point is to the left of sComparedTo's (making sNumber less then sComparedTo), set our iReturn value to -1
                                if (iNumberDecimalPoint < iRangeDecimalPoint) {
                                    iReturn = -1;
                                }
                                    //#### Else if the sNumber's decimal point is to the right of sComparedTo's (making sNumber greater then sComparedTo), set our iReturn value to 1
                                else if (iNumberDecimalPoint > iRangeDecimalPoint) {
                                    iReturn = 1;
                                }
                                    //#### Else the sNumber's decimal point is in the same position as the sComparedTo's decimal point
                                else {
                                        //#### Define and init the additionally required vars
                                    var iCurrentNumberNumber;
                                    var iCurrentRangeNumber;
                                    var i;

                                        //#### Default our iReturn value to 0 (as only > and < are checked in the loop below, so if the loop finishes without changing the iReturn value then the sNumber and sComparedTo are equal)
                                    iReturn = 0;

                                        //#### Setup the value for i based on if the bNumberIsPositive (setting it to 0 if it is, or 1 if it isn't)
                                        //####    NOTE: This is done to skip over the leading "-" sign in negetive numbers (yea it's ugly, but it works!)
                                        //####    NOTE: Since at this point we know that signs of sNumber and sComparedTo match, we only need to check bNumberIsPositive's value
                                    i = (bNumberIsPositive) ? (0) : (1);

                                        //#### Traverse the sNumber/sComparedTo strings from front to back (based on the above determined starting position)
                                        //####     NOTE: Since everything is is the same position and the same precision, we know that sNumber's .lenght is equal to sComparedTo's
                                    for (i; i < sNumber.length; i++) {
                                            //#### As long as we're not looking at the decimal point
                                        if (i != iNumberDecimalPoint) {
                                                //#### Determine the iCurrentNumberNumber and iCurrentRangeNumber for this loop
                                            iCurrentNumberNumber = parseInt(sNumber[i]);
                                            iCurrentRangeNumber = parseInt(sComparedTo[i]);

                                                //#### If the iCurrentNumberNumber is less then the iCurrentRangeNumber
                                            if (iCurrentNumberNumber < iCurrentRangeNumber) {
                                                    //#### sNumber is less then sComparedTo, so set our iReturn value to -1 and fall from the loop
                                                iReturn = -1;
                                                break;
                                            }
                                                //#### Else if the iCurrentNumberNumber is greater then the iCurrentRangeNumber
                                            if (iCurrentNumberNumber > iCurrentRangeNumber) {
                                                    //#### sNumber is greater then sComparedTo, so set our iReturn value to 1 and fall from the loop
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
                }, //# type.num.compare

                //############################################################
                //# Determines the numeric precision of the passed sValue (i.e. - counts how many numeric places there are within the number, not including leading 0's)
                //############################################################
                //# Last Updated: April 19, 2006
                precision: function(vValue) {
                    var sCurrentChar, i, bStartCounting,
                        sValue = core.type.str.mk(vValue).trim(),
                        iReturnVal = (/^(-)?[0-9.,]{1,}$/.test(sValue) ? 0 : -1)
                    ;

                    //# If the sValue holds only numeric characters
                    if (iReturnVal === 0) {
                        //#### Traverse the .length of the passed sValue, collecting the sCurrentChar as we go
                        for (i = 0; i < sValue.length; i++) {
                            sCurrentChar = sValue[i]; //# .substr(i, 1)

                            //#### If the sCurrentChar .is .num
                            if (core.type.num.is(sCurrentChar)) {
                                //#### If we are supposed to bStartCounting, inc our iReturnVal
                                //####    NOTE: This is done so we ignore leading 0's (trailing 0's are still counted)
                                bStartCounting = (sCurrentChar !== '0');
                                iReturnVal += (bStartCounting ? 1 : 0);
                            }
                        }
                    }

                    return iReturnVal;
                } //# type.num.precision
            }
        }); //# core.type.num
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
