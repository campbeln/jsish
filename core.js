//# Setup the required global variables
var $z = window.$z || {};



//####################################################################################################
//# core
//####################################################################################################
/*
Class: core

About:
Global reference for all non-library Javascript functionality known externally as `window.$z`.
*/
//# Begin the population of the system's core namespace (mrs)
(function (core) {
    'use strict';


    //# Set the .name of our namespace (for use in error messages and the like)
    core.$name = '$z';
    core.$ver = '2016-05-26a';


    //####################################################################################################
    //# core.resolve
    //####################################################################################################
    /*
	Function: resolve
	Safely resolves the referenced path within the provided object, returning undefined if the path does not exist.

	Parameters:
	oObject - The object to interrogate.
	sPath - String representing the path to the requested property.

	Returns:
	Varient representing the value at the referenced path, returning undefined if the path does not exist.

	About:
	NOTE: To default a value, use the following snipit:
	> var v = $services.resolve({}, 'some.path') || 'default value';

	See Also:
	<core.make.obj>
	*/
    core.resolve = function (oObject, sPath) {
        var a_sPath, i,
            oReturnVal = (core.is.obj(oObject) ? oObject : undefined)
        ;

        //# If the passed oObject .is.obj and sPath .is.str, .split sPath into a_sPath
        if (oReturnVal && core.is.str(sPath)) {
            a_sPath = sPath.split(".");

            //# Traverse the a_sPath, resetting the oReturnVal to the value present at the current a_sPath or undefined if it's not present (while falling from the loop)
            for (i = 0; i < a_sPath.length; i++) {
                if (core.is.obj(oReturnVal) && a_sPath[i] in oReturnVal) {
                    oReturnVal = oReturnVal[a_sPath[i]];
                } else {
                    oReturnVal = undefined;
                    break;
                }
            }
        }

        return oReturnVal;
    }; //# core.resolve


    //####################################################################################################
    //# core.cookie
    //####################################################################################################
    /*
    Class: core.cookie
    
    About:
    Parses the referenced cookie and returns an object to manage it.
    */
    (function () {
        var oOnUnload = {
            $keys: []
        };

        //# 
        /*
        window.addEventListener("beforeunload", function (e) {
            for (var i; i < oOnUnload.$keys.length; i++) {
                core.fn.call(oOnUnload[oOnUnload.$keys[i]]);
            }
            
            (e || window.event).returnValue = null;
            return null;
        });
        */

        core.cookie = function (sName, vAutoSetConfig, oDefault) {
            var oModel,
				$returnValue = {
				    name: sName,
				    original: null,
				    string: function () {
				        //return core.serial.ize($returnValue.data, true);
				        return JSON.stringify($returnValue.data);
				    },
				    data: null,
				    isNew: true,
				    set: function (iMaxAge, sPath, sDomain) {
				        var dExpires;

				        //# If iMaxAge was not passed in, default to .seconds7Days
				        if (iMaxAge === undefined) {
				            iMaxAge = (1000 * 60 * 24 * 7);
				        }

				        //# If this is not a session cookie, setup the dExpires date
				        if (iMaxAge > 0) {
				            dExpires = new Date();
				            dExpires.setSeconds(dExpires.getSeconds() + iMaxAge);
				        }

				        //# 
				        sPath = sPath || "/";

				        //# 
				        vAutoSetConfig.maxAge = iMaxAge;
				        vAutoSetConfig.path = sPath;
				        vAutoSetConfig.domain = sDomain;

				        //# .escape the .string, set the max-age and path and toss it into the .cookie collection
				        document.cookie = sName + "=" + escape($returnValue.string()) +
							'; path=' + sPath +
							(iMaxAge > 0 ? "; max-age=" + iMaxAge : "") +
							(dExpires ? "; expires=" + dExpires.toUTCString() : "") +
							(sDomain ? '; domain=' + sDomain : '') +
						"; ";

				        //# Flip .isNew to false (as its now present on the browser) and return true
				        $returnValue.isNew = false;
				        return true;
				    },
				    remove: function () {
				        //# .escape the .string, set the max-age and path and toss it into the .cookie collection
				        //$returnValue.data = null;
				        delete oOnUnload[sName];
				        core.data.array.remove(oOnUnload.$keys, sName);
				        document.cookie = sName + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;" + ' path=' + (vAutoSetConfig.path || "/");
				        return true;
				    }
				}
            ;

            //# Locates the document.cookie for the passed sName
            //#     NOTE: This is placed in a function so that the a_sCookies array will be dropped after execution
            function find() {
                var i, j,
					a_sCookies = document.cookie.split(";")
                ;

                //# Loop thru the values in .cookie looking for the passed sName, setting $returnValue.original if it's found
                for (i = 0; i < a_sCookies.length; i++) {
                    j = a_sCookies[i].indexOf("=");
                    if (sName === a_sCookies[i].substr(0, j).replace(/^\s+|\s+$/g, "")) {
                        $returnValue.original = unescape(a_sCookies[i].substr(j + 1));
                        //oModel = ($returnValue.original ? core.serial.de($returnValue.original) : {});
                        try {
                            oModel = ($returnValue.original ? JSON.parse($returnValue.original) : {});
                        } catch (e) {
                            oModel = {};
                        }
                        return true;
                    }
                }
                return false;
            }

            //# So long as we've not been explicitly told to not to, hook window.onbeforeunload
            if (vAutoSetConfig === true || core.is.obj(vAutoSetConfig)) {
                if (oOnUnload.$keys.indexOf(sName) === -1) {
                    oOnUnload.$keys.push(sName);
                    oOnUnload[sName] = function () {
                        $returnValue.set(vAutoSetConfig.maxAge, vAutoSetConfig.path, vAutoSetConfig.domain);
                    };
                }
            }

            //# 
            vAutoSetConfig = (core.is.obj(vAutoSetConfig) ? vAutoSetConfig : {});

            //# If a seemingly valid sName was passed
            if (!core.is.str(sName) || sName === "") {
                throw (core.$name + ".cookie: A [String] value must be provided for the cookie name.");
            }

            //# If we can .find a current value, reset .isNew to false
            if (find()) {
                $returnValue.isNew = false;
            }
                //# Else this .isNew cookie, so if the caller passed in a valid oDefault object, reset our oModel to it
            else if (core.is.obj(oDefault)) {
                oModel = oDefault;
            }

            //# 
            $returnValue.data = oModel;
            return $returnValue;
        };
    })(); //# core.cookie


    //####################################################################################################
    //# core.queryString
    //####################################################################################################
    /*
    Class: core.queryString
    
    About:
    Parses the referenced cookie and returns an object to manage it.
    */
    //# Parses the queryString and returns a deserialized object to access it
    (function () {
        var $queryString;

        //# Parses the query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
        //#     Supports: ?test=Hello&person=neek&person=jeff&person[]=jim&person[extra]=john&test3&nocache=1398914891264&person=frank,jim;person=aaron
        core.queryString = function (sKey, bCaseInsenstive) {
            var vReturnVal;

            //# Ensure the cached $queryString is setup
            $queryString = $queryString || core.serial.de(window.location.search.substring(1));

            //# If there were no arguments, return the cached $queryString
            if (arguments.length === 0) {
                vReturnVal = $queryString;
            }
                //# Else if this is a bCaseInsenstive call
            else if (bCaseInsenstive) {
                sKey = (sKey + "").toLowerCase();

                //# Traverse the $queryString, returning the first matching .toLowerCase'd key
                for (var key in $queryString) {
                    if (key.toLowerCase() == sKey) {
                        vReturnVal = $queryString[key];
                        break;
                    }
                }
            }
                //# Else a case-specific sKey was requested
            else {
                vReturnVal = $queryString[sKey];
            }

            return vReturnVal;
        }; //# core.queryString
    })();


    //####################################################################################################
    //# core.console
    //####################################################################################################
    /*
	Class: core.console

	About:
	Wrapper for console functionality.
	*/
    (function () {
        core.console = {
            raise: function (sMessage) {
                throw sMessage;
            }, //# raise
            log: function () {
                try {
                    console.log.apply(this, arguments);
                } catch (e) { }
            }, //# log
            //# Safely warns the user on the console
            warn: function () {
                try {
                    if (window.console && core.is.fn(window.console.warn)) {
                        window.console.warn.apply(this, arguments);
                    }
                    else {
                        core.console.log.apply(this, arguments);
                    }
                } catch (e) { }
            } //# warn
        }; //# core.console
    })();


    //####################################################################################################
    //# core.fn (function)
    //####################################################################################################
    /*
	Class: core.fn

	About:
	Function management functionality.
	*/
    core.fn = {
        /*
		Function: call
		Safely calls the passed function.

		Parameters:
		fn - Function to call.
		vContext - Varient representing the Javascript context (e.g. `this`) in which to call the function.
		vArguments - Varient representing the argument(s) to pass into the passed function

		Returns:
		Varient representing the result of the passed function.

		See Also:
		<core.fn>, <core.fn.once>, <core.fn.poll>, <core.fn.debounce>
		*/
        call: function (fn, vContext, vArguments) {
            if (core.is.fn(fn)) {
                return fn.apply(
					vContext || this,
					core.is.arr(vArguments) ? vArguments : [vArguments]
				);
            }
        },

        /*
		Function: debounce
		Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.

		Parameters:
		fn - Function to call.
		iWait - Minimum number of miliseconds between each call.
		bImmediate - Execute the function the first time without waiting.

		Returns:
		Varient representing the result of the passed function.

		About:
		Usage -
		>    var myEfficientFn = debounce(function () {
		>        // All the taxing stuff you do
		>    }, 250);
		>    window.addEventListener('resize', myEfficientFn);
		From: http://davidwalsh.name/essential-javascript-functions

		See Also:
		<core.fn>, <core.fn.once>, <core.fn.poll>, <core.fn.call>
		*/
        debounce: function (fn, iWait, bImmediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!bImmediate) fn.apply(context, args);
                };
                var callNow = bImmediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, iWait);
                if (callNow) fn.apply(context, args);
            };
        },

        /*
		Function: poll
		Calls the referenced function based on an interval until it returns true.

		Parameters:
		fn - Function to call once.
		fnCallback - Function to call on success.
		fnErrback - Function to call on failure.
		iTimeout - Maximum number of miliseconds to do the polling (Default: 2000)
		iInterval - Number of miliseconds between each poll attempt (Default: 100)

		Returns:
		Varient representing the result of the passed function.

		About:
		From: http://davidwalsh.name/essential-javascript-functions

		See Also:
		<core.fn>, <core.fn.once>, <core.fn.debounce>, <core.fn.call>
		*/
        poll: function (fn, fnCallback, fnErrback, iTimeout, iInterval) {
            var endTime = Number(new Date()) + (iTimeout || 2000);
            iInterval = iInterval || 100;

            (function p() {
                // If the condition is met, we're done! 
                if (fn()) {
                    fnCallback();
                }
                    // If the condition isn't met but the timeout hasn't elapsed, go again
                else if (Number(new Date()) < endTime) {
                    setTimeout(p, iInterval);
                }
                    // Didn't match and too much time, reject!
                else {
                    fnErrback(new Error('timed out for ' + fn + ': ' + arguments));
                }
            })();
        }, //# poll

        /*
		Function: once
		Ensure a function is called only .once (optionally within a specific context)

		Parameters:
		fn - Function to call once.
		vContext - Varient representing the Javascript context (e.g. `this`) in which to call the function

		Returns:
		Varient representing the result of the passed function.

		About:
		Usage -
		> var canOnlyFireOnce = once(function () {
		>     console.log('Fired!');
		> });
		(From: http://davidwalsh.name/essential-javascript-functions)

		See Also:
		<core.fn>, <core.fn.poll>, <core.fn.debounce>, <core.fn.call>
		*/
        once: function (fn, vContext, vArguments) {
            var result;

            return function () {
                if (core.is.fn(fn)) {
                    result = fn.apply(
                        vContext || this,
                        core.is.arr(vArguments) ? vArguments : [vArguments]
                    );
                    fn = null;
                }

                return result;
            };
        } //# once
    }; //# core.fn



    //####################################################################################################
    //# core.tools
    //####################################################################################################
    /*
	Class: core.tools

	About:
	Bucket for various functionality.
	*/
    core.tools = {
        /*
		Function: absoluteUrl
		Retrieves the absolute URL from the passed URL.

		Parameters:
		url - String representing the target URL to extract the absolute URL from.

		About:
		From: http://davidwalsh.name/essential-javascript-functions

		Returns:
		String representing the absolute URL.

		See Also:
		<core.tools>, <core.tools.baseUrl>, <core.tools.mvcPath>
		*/
        absoluteUrl: (function () {
            var a = document.createElement('a');

            return function (url) {
                if (!a) a = document.createElement('a');
                a.href = url;
                return a.href;
            };
        })() //# absoluteUrl
    }; //# core.tools



    //####################################################################################################
    //# core.is
    //####################################################################################################
    /*
	Class: core.is

	About:
	Variable type identification logic.
	*/
    core.is = {
        /*
		Function: str
		Determines if the passed value is a string.

		Parameters:
		s - The string to interrogate.
		bDisallowNullString - Boolean value indicating if nullstrings are to be disallowed (e.g. "").
		bTrimWhitespace - Boolean value indicating if leading and trailing whitespace is to be trimmed prior to integration.

		Returns:
		Boolean value representing if the value is a string.

		See Also:
		<core.is>, <core.eq.str>, <core.cp.str>, <core.make.str>
		*/
        str: function (s, bDisallowNullString, bTrimWhitespace) {
            return (
				(typeof s == 'string' || s instanceof String) &&
				(!bDisallowNullString || s !== '') &&
				(!bTrimWhitespace || core.make.str(s).trim() !== '')
			) ? true : false;
        }, //# is.str

        /*
		Function: date
		Determines if the passed value is a date.

		Parameters:
		x - The date to interrogate.

		Returns:
		Boolean value representing if the value is a date.

		See Also:
		<core.is>, <core.eq.date>, <core.cp.date>, <core.make.date>
		*/
        date: function (x) {
            var d = new Date(x);
            return (x && Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.valueOf())) ? true : false;
        }, //# is.date

        /*
		Function: num
		Determines if the passed value is a numeric value (includes implicit casting per the Javascript rules, see: <core.make.int>).

		Parameters:
		x - The numeric value to interrogate.

		Returns:
		Boolean value representing if the value is a numeric value.

		See Also:
		<core.is>, <core.eq.num>, <core.cp.num>, <core.make.int>, <core.make.float>
		*/
        num: function (x) {
            return (/^[-0-9]?[0-9]*(\.[0-9]{1,})?$/.test(x) && !isNaN(parseFloat(x)) && isFinite(x)) ? true : false;
        }, //# is.num

        /*
		Function: int
		Determines if the passed value is an integer value (includes implicit casting per the Javascript rules, see: <core.make.int>).

		Parameters:
		x - The integer to interrogate.

		Returns:
		Boolean value representing if the value is an integer value.

		See Also:
		<core.is>, <core.eq.num>, <core.cp.num>, <core.make.int>, <core.make.float>
		*/
        int: function (x) {
            var fX = core.make.float(x);

            return (core.is.num(x) && fX % 1 === 0);
        }, //# is.int

        /*
		Function: float
		Determines if the passed value is a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.make.int>).

		Parameters:
		x - The numeric value to interrogate.

		Returns:
		Boolean value representing if the value is a floating point numeric value.

		See Also:
		<core.is>, <core.eq.num>, <core.cp.num>, <core.make.int>, <core.make.float>
		*/
        float: function (x) {
            var fX = core.make.float(x);

            return (core.is.num(x) && fX % 1 !== 0);
        }, //# is.float

        /*
		Function: bool
		Determines if the passed value is a boolean value (e.g. `true` or `false`).

		Parameters:
		b - The boolean value to interrogate.

		Returns:
		Boolean value representing if the value is a boolean value.

		See Also:
		<core.is>, <core.is.true>
		*/
        bool: function (b) {
            return (b === true || b === false) ? true : false;
        }, //# is.bool

        /*
		Function: true
		Determines if the passed value is a truth-y value.

		Parameters:
		v - The truth-y value to interrogate.

		Returns:
		Boolean value representing if the value is a truth-y value.

		See Also:
		<core.is>, <core.is.bool>
		*/
        'true': function (v) {
            return (v === true ?
				true :
				(v + "").trim().toLowerCase() === "true"
			) ? true : false;
        }, //# is.true

        /*
		Function: fn
		Determines if the passed value is a function.

		Parameters:
		f - The varient to interrogate.

		Returns:
		Boolean value representing if the value is a function.

		See Also:
		<core.is>, <core.tools.callFn>
		*/
        fn: function (f) {
            return (Object.prototype.toString.call(f) === '[object Function]') ? true : false;
        }, //# is.fn

        /*
		Function: obj
		Determines if the passed value is an object.

		Parameters:
		o - The varient to interrogate.
		bDisallowEmptyObject - Boolean value representing if empty objects are to be ignored.
        a_sRequiredKeys - 

		Returns:
		Boolean value representing if the value is an object.

		See Also:
		<core.is>, <core.make.obj>, <core.resolve>
		*/
        obj: function (o /*, [bDisallowEmptyObject], [a_sRequiredKeys] */) {
            var a_sRequiredKeys, i,
                bDisallowEmptyObject = false,
                bReturnVal = (o && o === Object(o) && !core.is.fn(o))
            ;

            //# If the passed o(bject) is an Object
            if (bReturnVal) {
                //# If we got more than one argument, traverse them setting bDisallowEmptyObject and a_sRequiredKeys as we go
                if (arguments.length > 1) {
                    for (i = 1; i < arguments.length; i++) {
                        //# If the current argument .is.true, set bDisallowEmptyObject
                        //#     NOTE: getOwnPropertyNames is IE9+
                        if (core.is.true(arguments[i])) {
                            bDisallowEmptyObject = core.is.fn(Object.getOwnPropertyNames);
                        }
                        //# Else if the current argument .is.arr, set a_sRequiredKeys
                        else if (core.is.arr(arguments[i])) {
                            a_sRequiredKeys = arguments[i];
                        }
                    }
                }

                //# Reset our bReturnVal based on bDisallowEmptyObject
                bReturnVal = (!bDisallowEmptyObject || Object.getOwnPropertyNames(o).length !== 0) ? true : false;

                //# If we still have a valid Object and we have a_sRequiredKeys, traverse them
                if (bReturnVal && a_sRequiredKeys) {
                    for (i = 0; i < a_sRequiredKeys.length; i++) {
                        //# If the current a_sRequiredKeys is missing from our o(bject), flip our bReturnVal and fall from the loop
                        if (!o.hasOwnProperty(a_sRequiredKeys[0])) {
                            bReturnVal = false;
                            break;
                        }
                    }
                }
            }

            return bReturnVal;
        }, //# is.obj

        /*
		Function: arr
		Determines if the passed value is an array.

		Parameters:
		a - The varient to interrogate.
		bDisallow0Length - Boolean value representing if zero length arrays are to be ignored.

		Returns:
		Boolean value representing if the value is an array.

		See Also:
		<core.is>, <core.make.arr>
		*/
        arr: function (a, bDisallow0Length) {
            return (Object.prototype.toString.call(a) === '[object Array]' &&
				(!bDisallow0Length || a.length > 0)
			) ? true : false;
        }, //# is.arr

        /*
		Function: val
		Determines if the passed value is set (i.e. !== undefined || null).

		Parameters:
		v - The varient to interrogate.

		Returns:
		Boolean value representing if the value is set.

		See Also:
		<core.is>, <core.make.arr>
		*/
        val: function (v) {
            return (v !== undefined && v !== null) ? true : false;
        }, //# is.val

        /*
		Function: prop
		Determines if the passed object contains the referenced property.

		Parameters:
		o - The object to interrogate.
		sProp - String representing the name the property.
		bPropIsPath - Boolean flag representing if the passed sProp represents a path (e.g. `core.is.prop(obj "child.grandchild", true)`)

		Returns:
		Boolean value representing if the property is present in the passed object.

		See Also:
		<core.is>, <core.resolve>
		*/
        prop: function (o, sProp, bPropIsPath) {
            var oObj = (core.is.arr(o, true) ? o[0] : o);

            return (bPropIsPath === true ?
				core.resolve(oObj, sProp) !== undefined :
				core.is.obj(oObj) && sProp in oObj
			) ? true : false;
        }, //# is.prop

        /*
		Function: json
		Determines if the passed value is a valid JSON string.

		Parameters:
		s - The varient to interrogate.

		Returns:
		Boolean value representing if the passed value is a valid JSON string.

		See Also:
		<core.make>, <core.make.json>, <core.make.obj>
		*/
        json: function (s) {
            try {
                JSON.parse(s);
                return true;
            } catch (e) {
                return false;
            }
        }, //# is.json

        /*
		Function: dom
		Determines if the passed value is a DOM reference.

		Parameters:
		x - The varient to interrogate.

		Returns:
		Boolean value representing if the value is a DOM reference.

		See Also:
		<core.is>
		*/
        dom: function (x) {
            return (x && core.is.str(x.tagName) && x.tagName !== "" && core.is.fn(x.getAttribute)) ? true : false;
        } //# is.dom
    }; //# core.is



    //####################################################################################################
    //# core.make
    //####################################################################################################
    /*
	Class: core.make

	About:
	Variable casting logic.
	*/
    core.make = {
        /*
		Function: str
		Safely forces the passed value into a string.

		Parameters:
		x - The varient to interrogate.
		sDefault - The default value to return if casting fails.

		Returns:
		String representing the passed value.

		See Also:
		<core.make>, <core.is.str>, <core.eq.str>, <core.cp.str>
		*/
        str: function (s, sDefault) {
            var sS = s + "";

            return (s && sS ?
                sS :
				(arguments.length > 1 ? sDefault : "")
			);
        }, //#make. str

        /*
		Function: date
		Safely forces the passed value into a date.

		Parameters:
		x - The varient to interrogate.
		vDefault - The default value to return if casting fails.

		Returns:
		Date representing the passed value.

		See Also:
		<core.make>, <core.make.yyyymmdd>, <core.make.age>, <core.is.date>, <core.eq.date>, <core.cp.date>
		*/
        date: function (x, vDefault) {
            return (core.is.date(x) ?
				new Date(x) :
				(arguments.length > 1 ? vDefault : new Date())
			);
        }, //# make.date

        /*
		Function: int
		Safely forces the passed value into an integer (includes implicit casting per the Javascript rules, see about section).

		Parameters:
		i - The varient to interrogate.
		vDefault - The default value to return if casting fails.

		Returns:
		Integer representing the passed value.

		About:
		Javascript has some funky rules when it comes to casting numeric values, and they are at play in this function.
		> "12 monkeys!" === 12
		> "   12 monkeys!" === 12
		> "12monkeys!" === 12
		> "1 2 monkeys!" === 1 (not 12)
		> "1,2 monkeys!" === 1 (not 12)
		> "1,200 monkeys!" === 1 (not 1200)
		> "11 - there were 12 monkeys!" === 11
		> "twelve (12) monkeys!" === undefined
		> "$12 monkeys!" === undefined
		In short, the first non-whitespace numeric characters are used in the cast, until any non-numeric character is hit.

		See Also:
		<core.make>, <core.make.float>, <core.is.float>, <core.make.int>, <core.eq.num>, <core.cp.num>
		*/
        int: function (i, vDefault) {
            return (!isNaN(parseInt(i, 10)) ?
				parseInt(i, 10) :
				(arguments.length > 1 ? vDefault : 0)
			);
        }, //# make.int

        /*
		Function: float
		Safely forces the passed value into a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.make.int>).

		Parameters:
		f - The varient to interrogate.
		vDefault - The default value to return if casting fails.

		Returns:
		Float representing the passed value.

		See Also:
		<core.make>, <core.make.int>, <core.is.float>, <core.make.int>, <core.eq.num>, <core.cp.num>
		*/
        float: function (f, vDefault) {
            return (!isNaN(parseFloat(f, 10)) ?
				parseFloat(f, 10) :
				(arguments.length > 1 ? vDefault : 0)
			);
        }, //# make.float

        /*
		Function: arr
		Safely forces the passed array reference into an array.

		Parameters:
		a - The varient to interrogate.
		a_vDefault - The default value to return if casting fails.

		Returns:
		Integer representing the age in years.

		See Also:
		<core.make>
		*/
        arr: function (a, a_vDefault) {
            return (core.is.arr(a) ?
                a :
				(arguments.length > 1 ? a_vDefault : [])
			);
        }, //# make.arr

        /*
		Function: obj
		Safely forces the passed object reference into an object containing the passed path optionally set to the optional value.

		Parameters:
		o - The varient to interrogate.
		sPath - String representing the path to the property.
		(Optional) vValue - Varient representing the value to set the referenced property to.

		Returns:
		Object representing the updated object reference.

		See Also:
		<core.make>, <core.resolve>
		*/
        obj: function (o, sPath, vValue) {
            var a_sPath, i,
				oReturnVal = (core.is.obj(o) ? o : {}),
				oCurrent = oReturnVal
            ;

            //# Optionally builds the sKey as an [object], returning the result
            function setIndex(oObj, sKey) {
                //# Reset sKey for this loop, then set/create it within the oReturnVal
                //#     NOTE: The validity of the current sKey is not checked as we assume that "you must be at least this smart to ride this ride"
                //#     NOTE: Due to the nature of this function, we know that oObj will always be an object (thanks to the `oReturnVal =` logic above and `|| {}` logic below)
                oObj[sKey] = oObj[sKey] || {};
                //oObj[sKey].$parent = oObj[sKey].$parent || oObj;
                return oObj[sKey];
            }

            //# If the passed sPath .is.str
            if (sPath && core.is.str(sPath)) {
                //# .split the a_sPath
                //#     NOTE: Due to how .split works above, we will always have at least 1 index in a_sPath, so there is no need to pretest it below
                a_sPath = sPath.split(".");

                //# Traverse all but the last entry of the a_sPath (hence -1), resetting the oCurrent [object] to the .setIndex as we go
                for (i = 0; i < a_sPath.length - 1; i++) {
                    oCurrent = setIndex(oCurrent, a_sPath[i]);
                }

                //# If the caller passed in 3 arguments, set the last a_sPath entry with the passed vValue
                if (arguments.length === 3) {
                    oCurrent[a_sPath[i]] = vValue;
                }
                    //# Else we need to .setIndex of the last a_sPath entry
                else {
                    /*oCurrent =*/ setIndex(oCurrent, a_sPath[i]);
                }
            }

            return oReturnVal;
        }, //# make.obj

        /*
		Function: age
		Safely parses the passed value as a date of birth into the age in years.

		Parameters:
		dob - The varient to interrogate.

		Returns:
		Integer representing the age in years.

		See Also:
		<core.make>
		*/
        age: function (dob) {
            var dAgeSpan,
				iReturnVal = -1
            ;

            //# If the passed dob is a valid date
            if (core.is.date(dob)) {
                //# Set dAgeSpan based on the milliseconds from epoch
                dAgeSpan = new Date(Date.now() - core.make.date(dob, null));
                iReturnVal = Math.abs(dAgeSpan.getUTCFullYear() - 1970);
            }

            return iReturnVal;
        }, //# make.age

        /*
		Function: yyyymmdd
		Safely parses the passed value into a string containing the international date format (YYYY/MM/DD).

		Parameters:
		x - The varient to interrogate.
		dDefault - The default value to return if casting fails.

		Returns:
		String representing the international date format (YYYY/MM/DD).

		See Also:
		<core.make>, <core.make.date>, <core.make.dateOnly>, <core.is.date>, <core.cp.date>, <core.eq.date>
		*/
        yyyymmdd: function (x, dDefault) {
            var dDate = core.make.date(x, (arguments.length > 1 ? dDefault : new Date()));

            return (core.is.date(dDate) ?
				dDate.getFullYear() + '/' + core.make.str(dDate.getMonth() + 1).lPad("0", 2) + '/' + core.make.str(dDate.getDate()).lPad("0", 2) :
				""
			);
            //dCalDate.getHours() + ':' + core.make.str(dCalDate.getMinutes()).lPad("0", 2) + ':' + core.make.str(dCalDate.getSeconds()).lPad("0", 2)
        }, //# make.yyyymmdd

        /*
		Function: dateOnly
		Safely parses the passed value into a date containing the year/month/day while replacing any time portion with midnight.

		Parameters:
		x - The varient to interrogate.
		dDefault - The default value to return if casting fails.

		Returns:
		Date representing the year/month/day in the passed value.

		See Also:
		<core.make>, <core.make.date>, <core.make.yyyymmdd>, <core.is.date>, <core.cp.date>, <core.eq.date>
		*/
        dateOnly: function (x, dDefault) {
            return core.make.date(core.make.yyyymmdd(x, dDefault));
        }, //# make.dateOnly

        /*
		Function: json
		Safely parses the passed value as a JSON string into an object.

		Parameters:
		s - The varient to interrogate.
		vDefault - The default value to return if casting fails.

		Returns:
		Object containing the parsed JSON data, or undefined if parsing failed.

		See Also:
		<core.make>, <core.make.obj>
		*/
        json: function (s, vDefault) {
            var oJson = (arguments.length > 1 ? vDefault : s);

            try {
                oJson = JSON.parse(s);
            } catch (e) { }

            return oJson;
        } //# make.json
    }; //# core.make



    //####################################################################################################
    //# core.cp (compare)
    //####################################################################################################
    /*
	Class: core.cp

	About:
	Comparison logic (including implicit casting of types).
	*/
    core.cp = {
        /*
		Function: date
		Determines the relationship between the passed dates, with the second date optionally defaulting to `new Date()` (i.e. now).

		Parameters:
		x - The first date to compare.
		(Optional) y - The optional second date to compare. Default Value: `new Date()`.

		Returns:
		Nullable integer value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or the passed y is not a date.

		See Also:
		<core.cp>, <core.eq.date>, <core.is.date>, <core.make.date>
		*/
        date: function (x, y) {
            var iReturnVal /*= undefined*/,
                dDateX = core.make.date(x, null),
                dDateY = (arguments.length < 2 ? new Date() : core.make.date(y, null))
            ;

            //# If the passed dates are valid, determine dDateX's relationship to dNow
            if (core.is.date(dDateX) && core.is.date(dDateY)) {
                if (dDateX < dDateY) {
                    iReturnVal = -1;
                }
                else if (dDateX > dDateY) {
                    iReturnVal = 1;
                }
                else {
                    iReturnVal = 0;
                }
            }

            return iReturnVal;
        }, //# date

        /*
		Function: str
		Performs a case-insensitive comparison of the passed strings (trimming both before comparison).

		Parameters:
		x - The first string to compare.
		y - The second string to compare.

		Returns:
		Boolean value representing if the strings match.

		See Also:
		<core.cp>, <core.eq.str>, <core.is.str>, <core.make.str>
		*/
        str: function (x, y) {
            return (
                core.make.str(x).trim().toLowerCase() === core.make.str(y).trim().toLowerCase()
            );
        },

        /*
		Function: num
		Determines the relationship between the passed numeric values (includes implicit casting per the Javascript rules, see: <core.make.int>).

		Parameters:
		x - The first numeric value to compare.
		y - The second numeric value to compare.

		Returns:
		Nullable interger value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or y is non-numeric.

		See Also:
		<core.cp>, <core.eq.num>, <core.is.num>, <core.is.int>, <core.is.float>, <core.make.int>, <core.make.float>
		*/
        num: function (x, y) {
            var iReturnVal /*= undefined*/,
                dX = core.make.float(x, null),
                dY = core.make.float(y, null)
            ;

            if (core.is.num(dX) && core.is.num(dY)) {
                if (dX < dY) {
                    iReturnVal = -1;
                }
                else if (dX > dY) {
                    iReturnVal = 1;
                }
                else {
                    iReturnVal = 0;
                }
            }

            return iReturnVal;
        } //# num
    }; //# core.cp



    //####################################################################################################
    //# core.eq (equal)
    //####################################################################################################
    /*
	Class: core.eq

	About:
	Equating logic (including implicit casting of types).
	*/
    core.eq = {
        /*
		Function: date
		Determines if the passed dates are equal (includes implicit casting).

		Parameters:
		x - The first date to compare.
		y - The second date to compare.

		Returns:
		Boolean value representing if the passed dates are equal.

		See Also:
		<core.eq>, <core.cp.date>, <core.is.date>, <core.make.date>
		*/
        date: function (x, y) {
            var dDateX = core.make.date(x, null);
            var dDateY = core.make.date(y, null);

            //#     NOTE: `new Date("1970/01/01") === new Date("1970/01/01")` is always false as they are 2 different objects, while <= && >= will give the expected result
            //#     SEE: Comment from Jason Sebring @ http://stackoverflow.com/a/493018/235704 
            return (core.is.date(dDateX) && core.is.date(dDateY) && dDateX <= dDateY && dDateX >= dDateY);
        }, //# date

        /*
		Function: str
		Determines if the passed strings are equal (includes implicit casting and trimming of leading/trailing whitespace).

		Parameters:
		s - The first string to compare.
		t - The second string to compare.
		bCaseInsenstive - Boolean value indicating if the comparison is to be case insenstive.

		Returns:
		Boolean value representing if the passed strings are equal.

		See Also:
		<core.eq>, <core.cp.str>, <core.is.str>, <core.make.str>
		*/
        str: function (s, t, bCaseInsenstive) {
            s = core.make.str(s, "").trim();
            t = core.make.str(t, "").trim();

            //# Unless specificially told not to, compare the passed string as bCaseInsenstive
            return (bCaseInsenstive !== false ?
				(s.toLowerCase() === t.toLowerCase()) :
				(s === t)
			);
        }, //# str

        /*
		Function: num
		Determines if the passed numeric values are equal (includes implicit casting per the Javascript rules, see: <core.make.int>).

		Parameters:
		s - The first numeric value to compare.
		t - The second numeric value to compare.

		Returns:
		Boolean value representing if the passed numeric values are equal.

		See Also:
		<core.eq>, <core.cp.num>, <core.is.int>, <core.is.float>, <core.make.int>, <core.make.float>
		*/
        num: function (x, y) {
            var bReturnVal = false;

            //# If the passed x and y .is.num'bers, .make them .floats and reset our bReturnVal to their comparison
            if (core.is.num(x) && core.is.num(y)) {
                bReturnVal = (core.make.float(x) === core.make.float(y));
            }

            return bReturnVal;
        } //# num
    }; //# core.eq



    //####################################################################################################
    //# core.data
    //####################################################################################################
    /*
	Class: core.data

	About:
	Data manipulation logic.
	*/
    core.data = {
        //# Returns the first entry within the passed collection matching the key/value pair (optionally testing as caseInsentive)
        getFirstByValue: function (key, value, collection, caseInsentive) {
            var returnValue = core.data.getByValue(key, value, collection, caseInsentive, true);
            return (returnValue ? returnValue.data[0] : undefined);
        }, //# getFirstByValue


        //# Returns the entry(ies) within the passed collection matching the key/value pair (optionally testing as caseInsentive)
        getByValue: function (key, value, collection, caseInsentive, firstOnly) {
            var i,
                returnValue = { indexes: [], data: [] }
            ;

            //# If there is a valid key and collection to look thru
            if (core.is.str(key) && core.is.arr(collection, true)) {
                //# Traverse the collection, returning the entry for the located medicalId
                for (i = 0; i < collection.length; i++) {
                    if (core.eq.str(collection[i][key], value, caseInsentive)) {
                        returnValue.data.push(collection[i]);
                        returnValue.indexes.push(i);
                        if (firstOnly) { break; }
                    }
                }
            }

            //# If we didn't find anything, return undefined, else give'em what we got
            return (core.is.arr(returnValue.data, true) ? returnValue : undefined);
        }, //# getByValue

        //# Returns the entry(ies) within the passed collection matching the key with the passed values (optionally testing as caseInsentive)
        getByValues: function (key, values, collection, caseInsentive) {
            var i, j, entry,
                returnVal = { indexes: [], data: [] }
            ;

            //# If the user passed in a values Array
            if (core.is.arr(values, true)) {
                //# Traverse the values, collecting an entry for each
                for (i = 0; i < values.length; i++) {
                    entry = core.data.getByValue(key, values[i], collection, caseInsentive);

                    //# If the current values was found, traverse it while .push'ing it's entires into our returnVal
                    if (entry) {
                        for (j = 0; j < entry.indexes.length; j++) {
                            returnVal.indexes.push(entry.indexes[j]);
                            returnVal.data.push(entry.data[j]);
                        }
                    }
                }
            }

            //# If we didn't find anything, return undefined, else give'em what we got
            return (core.is.arr(returnVal.data, true) ? returnVal : undefined);
        }, //# getByValues

        //# 
        array: {
            //# Removes the target from the referenced array
            remove: function (aArray, vTarget, vReplaceWith) {
                var i,
                    bReturnVal = false
                ;

                //# If the passed aArray is one, determine the i(ndex) of the passed vTarget (resetting our bReturnVal based on finding the i(ndex))
                if (core.is.arr(aArray, true)) {
                    i = aArray.indexOf(vTarget);
                    bReturnVal = (i > -1);

                    //# If we found the i(ndex)
                    if (bReturnVal) {
                        //# If the caller passed in 3 arguments, we need to use vReplaceWith
                        if (arguments.length === 3) {
                            aArray[i] = vReplaceWith;
                        }
                            //# Else we need to .splice it from the aArray
                        else {
                            aArray.splice(i, 1);
                        }
                    }
                }

                return bReturnVal;
            }, //# remove

            removeAll: function (a_vArray, a_vValuesToRemove, caseInsentive) {
                var i, j, bSkipValue,
                    a_vReturnVal = [],
                    bValuesToRemove = core.is.arr(a_vValuesToRemove, true)
                ;

                //# If the caller passed a valid a_vArray, traverse it
                if (core.is.arr(a_vArray, true)) {
                    for (i = 0; i < a_vArray.length; i++) {
                        //# If we have a_vValuesToRemove, reset bSkipValue for this loop
                        if (bValuesToRemove) {
                            bSkipValue = false;

                            //# Traverse the bSkipValue, flipping bSkipValue if one is found for the current a_vArray value
                            for (j = 0; j < a_vValuesToRemove.length; j++) {
                                if (core.eq.str(a_vArray[i], a_vValuesToRemove[j], caseInsentive)) {
                                    bSkipValue = true;
                                    break;
                                }
                            }

                            //# If we are not to bSkipValue, .push it into our a_vReturnVal
                            if (!bSkipValue) {
                                a_vReturnVal.push(a_vArray[i]);
                            }
                        }
                            //# Else we have no a_vValuesToRemove definition, so if the current a_vArray value is truthy
                        else if (a_vArray[i]) {
                            a_vReturnVal.push(a_vArray[i]);
                        }
                    }
                }

                return a_vReturnVal;
            } //# removeAll
        }, //# array

        //# 
        remove: function (vSource, vKeys, bSetToUndefined) {
            var k;

            //# Prunes the vKeys from the passed a_oSource
            function pruneArray(a_oSource) {
                var i, j;

                //# If the passed a_oSource and vKeys .is.arr's
                if (core.is.arr(a_oSource, true) && core.is.arr(vKeys, true)) {
                    //# Traverse the arrays, optionally bSetToUndefined or deleting each vKeys 
                    for (i = 0; i < a_oSource.length; i++) {
                        for (j = 0; j < vKeys.length; j++) {
                            if (bSetToUndefined) {
                                a_oSource[i][vKeys[j]] = undefined;
                            }
                            else {
                                delete a_oSource[i][vKeys[j]];
                            }
                        }
                    }
                }
            } //# pruneArray


            //# If the caller passed in an .is.str, reset vKeys to an array
            if (core.is.str(vKeys, true)) {
                vKeys = [vKeys];
            }

            //# If the caller passed in an .is.arr vSource, pass it directly into pruneArray
            if (core.is.arr(vSource, true)) {
                pruneArray(vSource);
            }
            //# Else if the caller passed in an .is.obj, traverse .dimension1 while pruneArray each .dimension2
            else if (core.is.obj(vSource) && core.is.arr(vSource.dimension1) && core.is.str(vSource.dimension2, true)) {
                for (k = 0; k < vSource.dimension1.length; k++) {
                    pruneArray(vSource.dimension1[k][vSource.dimension2]);
                }
            }
        }, //#remove

        //# Shallow copies the .hasOwnProperty's oFrom the source object in oTo the destination object (where oTo defines the properties to mirror across)
        //#      Example: mrs.net.post('/api/UserManagement/AssignRoles', mrs.data.mirror(oUser, mrs.glue.getType('UserRolesDto'), true)).then(...)
        mirror: function (oFrom, oTo, bReturnTo) {
            var a_sKeys, sKey, i,
                iReturnVal = 0
            ;

            //# If both oFrom and oTo are .obj's, collect the a_sKeys from our destination object in oTo the a_sKeys
            if (core.is.obj(oFrom) && core.is.obj(oTo)) {
                a_sKeys = Object.keys(oTo);

                //# Traverse the a_sKeys from our destination object, copying each in oTo our destination object that exist in both objects (inc'ing our iReturnVal as we go)
                for (i = 0; i < a_sKeys.length; i++) {
                    sKey = a_sKeys[i];
                    if (oTo.hasOwnProperty(sKey) && oFrom.hasOwnProperty(sKey)) {
                        oTo[sKey] = oFrom[sKey];
                        iReturnVal++;
                    }
                }
            }

            return (bReturnTo ? oTo : iReturnVal);
        } //# core.data.mirror

    }; //# core.data


    //####################################################################################################
    //# core.serial
    //####################################################################################################
    /*
	Class: core.serial

	About:
	Data serialization logic.
	*/
    core.serial = {
        //# serializes the passed model (up to 3-dimensions)
        ize: function (model, useSemicolon) {
            var key, value, subkey, i,
                e = encodeURIComponent,
                delimiter = (useSemicolon === true ? "; " : "&"),
                returnVal = ''
            ;

            //# Traverse each key within the passed model
            for (key in model) {
                value = model[key];
                key = e(key.trim());

                //# If the current value is null or undefined, record a null-string value
                if (core.is.val(value)) {
                    returnVal += key + "=" + delimiter;
                }
                //# Else if the current key is a pseudo-Array object
                else if (core.is.obj(value)) {
                    //# Traverse each subkey in the current value 
                    for (subkey in value) {
                        //# If the current subkey is an Array, traverse it's Array outputting each of its values individually
                        if (value[subkey] instanceof Array) {
                            for (i = 0; i < value[subkey].length; i++) {
                                returnVal += key + "[" + e(subkey) + "]=" + e(value[subkey][i]) + delimiter;
                            }
                        }
                        //# Else treat the current subkey as a string
                        else {
                            returnVal += key + "[" + e(subkey) + "]=" + e(value[subkey]) + delimiter;
                        }
                    }
                }
                //# Else if the current key is an Array, traverse it's Array outputting each of its values individually
                else if (Array.isArray(value)) {
                    for (i = 0; i < value.length; i++) {
                        returnVal += key + "=" + e(value[i]) + delimiter;
                    }
                }
                //# Else if the current value .isFunction, ignore it
                else if (core.is.fn(value)) { }
                //# Else treat the current key/value as a string
                else {
                    returnVal += key + "=" + e(value) + delimiter;
                }
            }

            return returnVal.trim().substr(0, returnVal.length - 1);
        }, //# ize

        //# Parses the passed valuetoParse into a model (up to 3-dimensions deep)
        //#    Based on: http://jsbin.com/adali3/2/edit via http://stackoverflow.com/a/2880929/235704
        //#    NOTE: All keys are .toLowerCase'd to make them case-insensitive(-ish) with the exception of a sub-keys named 'length', which are .toUpperCase'd
        //#    Supports: key=val1;key=val2;newkey=val3;obj=zero;obj=one;obj[one]=1;obj[two]=2;obj[Length]=long;obj[2]=mytwo;obj=two;obj[2]=myothertwo;obj=three
        de: function (valuetoParse) {
            //# Setup the required local variables (using annoyingly short names which are documented in the comments below)
            //#     NOTE: Per http://en.wikipedia.org/wiki/Query_string#Structure and the W3C both & and ; are legal delimiters for a query string, hence the RegExp below
            var b, e, k, p, sk, v, r = {},
                d = function (v) { return decodeURIComponent(v).replace(/\+/g, " ") + ''; }, //# d(ecode) the v(alue)
                s = /([^&;=]+)=?([^&;]*)/g //# original regex that does not allow for ; as a delimiter:   /([^&=]+)=?([^&]*)/g
            ;

            //# p(ush) re-implementation
            p = function (a) {
                //# Traverse the passed arguments, skipping the first as it's our a(rray)
                for (var i = 1, j = arguments.length; i < j; i++) {
                    //# If there is already an entry at the "new" index, .push the current arguments into the sk(sub-key)'s Array (or make one if it doesn't already exist)
                    if (a[a.length]) {
                        core.is.arr(a[a.length]) ? a[a.length].push(arguments[i]) : a[a.length] = new Array(a[a.length], arguments[i]);
                        a.length++;
                    }
                        //# Else this is a new entry, so just set the arguments
                    else {
                        a[a.length++] = arguments[i];
                    }
                }
            };

            //# While we still have key-value e(ntries) in the valuetoParse via the s(earch regex)...
            while (e = s.exec(valuetoParse)) { //# while((e = s.exec(valuetoParse)) !== null) {
                //# Collect the open b(racket) location (if any) then set the d(ecoded) v(alue) from the above split key-value e(ntry) 
                b = e[1].indexOf("[");
                v = d(e[2]);

                //# As long as this is NOT a hash[]-style key-value e(ntry)
                if (b < 0) {
                    //# d(ecode) the simple k(ey)
                    k = d(e[1]).trim();

                    //# If the k(ey) already exists, we need to transform it into a standard Array
                    if (r[k]) {
                        //# If the k(ey) is already an Array, .push the v(alue) into it
                        if (r[k] instanceof Array) {
                            r[k].push(v);
                        }
                        //# Else if it is a pseudo-Array object, p(ush) the v(alue) in
                        else if (typeof r[k] === 'object') {
                            p(r[k], v);
                        }
                        //# Else the k(ey) must be a single value, so transform it into a standard Array 
                        else {
                            r[k] = new Array(r[k], v);
                        }
                    }
                    //# Else this is a new k(ey), so just add the v(alue) into the r(eturn value) as a single value
                    else {
                        r[k] = (v ? v : null);
                    }
                }
                //# Else we've got ourselves a hash[]-style key-value e(ntry) 
                else {
                    //# Collect the .trim'd and d(ecoded) k(ey) and sk(sub-key) based on the b(racket) locations
                    k = d(e[1].slice(0, b)).trim();
                    sk = d(e[1].slice(b + 1, e[1].indexOf("]", b))).trim();

                    //# If the sk(sub-key) is the reserved 'length', then .toUpperCase it and .warn the developer
                    if (core.cp.str(sk, 'length')) {
                        sk = sk.toUpperCase();
                        core.console.warn("'length' is a reserved name and cannot be used as a sub-key. Your sub-key has been changed to 'LENGTH'.");
                    }

                    //# If the k(ey) isn't already a pseudo-Array object
                    if (!core.is.obj(r[k]) || core.is.arr(r[k])) {
                        //# If the k(ey) is an Array
                        if (core.is.arr(r[k])) {
                            var i, a = r[k];

                            //# Reset the k(ey) as a pseudo-Array object, then copy the previous a(rray)'s values in at their numeric indexes
                            //#     NOTE: 
                            r[k] = { length: a.length };
                            for (i = 0; i < a.length; i++) {
                                r[k][i] = a[i];
                            }
                        }
                        //# Else the k(ey) is a single value so transform it into a pseudo-Array object with the current value at index 0
                        else {
                            r[k] = { 0: r[k], length: 1 };
                        }
                    }

                    //# If we have a sk(sub-key)
                    if (sk) {
                        //# If the sk(sub-key) already exists, .push the v(alue) into the sk(sub-key)'s Array (or make one if it doesn't already exist)
                        if (r[k][sk]) { core.is.arr(r[k][sk]) ? r[k][sk].push(v) : r[k][sk] = new Array(r[k][sk], v); }
                        //# Else the sk(sub-key) is new, so just set the v(alue)
                        else { r[k][sk] = v; }
                    }
                    //# Else p(ush) the v(alue) into the k(ey)'s pseudo-Array object
                    else { p(r[k], v); }
                }
            }

            //# Return the r(eturn value)
            return r;
        } //# de
    }; //# serial


    //####################################################################################################
    //# core.net
    //####################################################################################################
    /*
	Class: core.net

	About:
	Network (AJAX) abstraction logic.
	*/
    (function () {
        function defaultError() {
            core.console.log("Error!");
        }

        function defaultFns(fnSuccess, fnError, fnFinal) {
            return {
                success: (core.is.fn(fnSuccess) ? fnSuccess : function () { }),
                error: (core.is.fn(fnError) ? fnError : defaultError),
                final: (core.is.fn(fnFinal) ? fnFinal : function () { })
            };
        }

        core.net = {
            process: function (oTemplate, fnSuccess, fnError, fnFinal) {
                var oFns = defaultFns(fnSuccess, fnError, fnFinal),
                    oReturnVal
                ;

                //# If the passed oTemplate is a reconized template
                if (core.is.obj(oTemplate, ['url', 'verb'])) {
                    //# Submit the oTemplate via .ajax
                    oReturnVal = jQuery.ajax(oTemplate.url, {
                        method: core.make.str(oTemplate.verb).trim().toUpperCase(),
                        data: oTemplate
                    })
                        .done(oFns.success)
                        .fail(oFns.error)
                        .always(oFns.final)
                    ;
                }

                return oReturnVal;
            } //# process
        }; //# net
    })(); //# net

})($z);
