/*
####################################################################################################
Class: ish
ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
By: Nick Campbell
License: MIT
####################################################################################################
*/
!function () {
    'use strict';

    var oTarget,
    	core = {
            //resolve: function,
            //extend: function,
            //locate: function,
            //$path: '',
            $ver: '0.8.2016-12-15',
            $ish: true
        },
    	_window = window,                                       //# code-golf
        _undefined = undefined,                                 //# code-golf
        _true = true,                                           //# code-golf
        _false = false,                                         //# code-golf
        _Object_prototype_toString = Object.prototype.toString  //# code-golf
    ; //# core


    //# Polyfills
    Date.now || (Date.now = function () { return new Date; });


    /*
    Function: resolve
    Safely accesses (or optionally creates) an object structure, allowing access to deep properties without the need to ensure the object structure exists.
    Parameters:
    (Optional) bForceCreate - Boolean value representing if the path is to be forcably created. `false` creates the path if it does not already exist, `true` overwrites non-object parent path segments with objects (see About).
    oObject - The object to interrogate.
    sPath - String representing the path to the requested property (period-delimited, e.g. "parent.child.array.0").
    (Optional) vValue - Varient representing the value to set the referenced property to (used only when creating the path).
    Returns:
    Varient representing the value at the referenced path, returning undefined if the path does not exist.
    About:
    When forcing the creation of an object structure, data can be lost if an existing non-object property is used as a parent, e.g.:
    > var neek = { nick: true };
    > var deepProp = ish.resolve(true, neek, "nick.campbell");
    This will overwrite the boolean property `nick` with an object reference containing the property `campbell`.
    */
    core.resolve = function (/*bForceCreate, oObject, sPath|a_sPath, vValue*/) {
        var oObject, sPath, vValue, a_sPath, vReturnVal, bCurrentIsObj,
            a = arguments,
            i = a.length, //# borrow the use of i to store the arguments.length for use in setting the bools below
            bCreate = (i !== 2),
            bSetValue = (i === 4),
            bForceCreate = _false
        ;

        //# Setup our local variables based on the number of passed a(rguments)
        //#     NOTE: We need at least an oObject and a sPath, so if the caller passed in something other than 2 arguments, we simply assume they want to bCreate
        if (bCreate) {
            bForceCreate = (a[0] === _true);
            oObject = a[1];
            sPath = a[2];
            vValue = a[3];
        } else {
            oObject = a[0];
            sPath = a[1];
        }

        //# Now that the passed oObject is known, set our vReturnVal accordingly
        vReturnVal = (core.is.obj(oObject) ? oObject : _undefined);

        //# If the passed oObject .is.obj and sPath .is.str, .split sPath into a_sPath
        if (vReturnVal && (core.is.str(sPath) || (core.is.arr(sPath, true) && core.is.str(sPath[0])))) {
            a_sPath = (core.is.arr(sPath) ? sPath : sPath.split("."));

            //# Traverse the a_sPath
            for (i = 0; i < a_sPath.length; i++) {
                bCurrentIsObj = core.is.obj(vReturnVal);

                //# If the bCurrentIsObj and the current sPath segment exists
                if (bCurrentIsObj && a_sPath[i] in vReturnVal) {
                    //# Set oObject as the last object reference and vReturnVal as the current object reference
                    oObject = vReturnVal;
                    vReturnVal = vReturnVal[a_sPath[i]];
                }
                //# Else if we are supposed to bCreate the sPath
                else if (bCreate) {
                    //# If bCurrentIsObj isn't setup
                    if (!bCurrentIsObj) {
                        //# If we are supposed to bForceCreate
                        //#     NOTE: We only get here if the current sPath segment exists and it is not an object, as created sPath segments below are all objects
                        if (bForceCreate) {
                            //# Set a new object reference in vReturnVal then set it into oObject's last object reference
                            //#     NOTE: We enter the outer loop knowing the initial vReturnVal bCurrentIsObj, so there is no need to worry about a [0 - 1] index below as we will never enter this if on the first loop
                            oObject[a_sPath[i - 1]] = vReturnVal = {};
                        }
                        //# Else the current sPath segment doesn't exist and we're not supposed to bForceCreate it, so reset our vReturnVal to undefined and fall from the loop
                        else {
                            vReturnVal = _undefined;
                            break;
                        }
                    }

                    //# If we are supposed to bSetValue and we're on the last sPath segment
                    if (bSetValue && i === a_sPath.length) {
                        vReturnVal[a_sPath[i]] = vValue;
                        vReturnVal = vValue;
                    }
                    //# Else we're not supposed to bSetValue and/or we're not on the last sPath segment
                    else {
                        //# Set oObject as the last object reference and vReturnVal as the current object reference (creating a new object along the way as we know the current sPath segment doesn't already exist)
                        oObject = vReturnVal;
                        vReturnVal = vReturnVal[a_sPath[i]] = {};
                    }
                }
                //# Else the current sPath segment doesn't exist and we're not supposed to bCreate it, so reset our vReturnVal to undefined and fall from the loop
                else {
                    vReturnVal = _undefined;
                    break;
                }
            }
        }

        return vReturnVal;
    }; //# core.resolve


    /*
    Function: extend
    Merges the content of subsequent objects into the first one, overriding its original values
    Parameters:
    (Optional) vDeepCopy - Varient indicting if a deep copy is to occur. `true` performs a deep copy, an integer indicates the max depth to perform a deep copy to, all other values perform a shallow copy. Default value: `false`.
    oTarget - Object to recieve properties.
    oSource - Object(s) who's properties will be copied into the target.
    Returns:
    Object referencing the passed oTarget.
    About:
    Right-most source object wins.
    > var oResult = core.data.extend({}, { i: 1 }, { i: 2 });
    `oResult.i` will equal `2`.
    Heavily refactored code from http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
    */
    core.extend = function (/*vDeepCopy, oTarget, oSource*/) {
        var oTarget, oCurrent, sKey, iDepth, i,
            a = arguments,
            bDeepCopy = core.is.bool(a[0])
        ;

        //# If the first argument .is.bool or .is.num, setup the local vars accordingly
        if (bDeepCopy || core.is.num(a[0])) {
            iDepth = (bDeepCopy ? -1 : core.mk.int(a[0]));
            oTarget = a[1];
            i = 2;
        }
        //# Else the first argument is our oTarget, so setup the local vars accordingly
        else {
            iDepth = 0; //# e.g. don't bDeepCopy
            oTarget = a[0];
            i = 1;
        }

        //# Ensure our oTarget is an object
        oTarget = (core.is.obj(oTarget) ? oTarget : {});

        //# Traverse the passed source objects
        for (/*i = i*/; i < a.length; i++) {
            oCurrent = a[i];

            //# Traverse the sKeys in the oCurrent object
            for (sKey in oCurrent) {
                //# If the current sKey is a native property of oCurrent, set it into our oTarget
                if (Object.prototype.hasOwnProperty.call(oCurrent, sKey)) {
                    oTarget[sKey] = (
                        iDepth !== 0 && core.is.obj(oCurrent[sKey]) ?
                        core.extend(iDepth - 1, {}, oCurrent[sKey]) :
                        oCurrent[sKey]
                    );
                }
            }
        }

        return oTarget;
    }; //# core.extend


    /*
    Function: locate
    Locates the first window-level object variable that contains the requested property, resolving the path contained within that property.
    Parameters:
    sProperty - String representing the requested property.
    Returns:
    Object containing two properties; the full path to the target reference and the target the path references.
    About:
    This function allows library authors to give their users the ability to soft-configure where the library attaches its functionality (e.g. `window.usersAppObject.library` rather than simply `window.library`).
    */
    core.locate = function locate(sProperty) {
        var vCurrent, vTarget, sKey, i,
            bFound = false
        ;

        //# Traverse all of the top-level properties of the _window
        for (sKey in _window) {
            vCurrent = _window[sKey];

            //# If the current sKey is a native property, its entry .is.obj and its got our sProperty
            if (_window.hasOwnProperty(sKey) && core.is.obj(vCurrent) && sProperty in vCurrent) {
                vTarget = vCurrent[sProperty];

                //# If the user specified a path, prepend the _window-level sKey onto our sProperty
                //#     NOTE: We make the assumption that the path is under the current sKey
                if (core.is.str(vTarget, _true)) {
                    sProperty = sKey + "." + vTarget;
                }
                //# Else the current sKey is the target object for our functionality, so return the sKey
                else {
                    sProperty = sKey;
                }

                //# Fall from the loop as we have found what we are looking for
                bFound = true;
                break;
            }
        }

        //# If we didn't find a top-level property of the _window, look to the querystring of the .js
        if (!bFound) {
            vTarget = document.getElementsByTagName("SCRIPT");

            //# Traverse the SCRIPT tags, pulling the .src and .indexOf the ?domtarget=
            for (i = 0; i < vTarget.length; i++) {
                vCurrent = core.queryString.parse(vTarget[i].src);
                sKey = core.data.getKey(sProperty, vCurrent, true);

                //# If the sProperty was found on the current .src, reset it to its value and fall from the loop
                if (core.is.str(sKey, true)) {
                    sProperty = sKey;
                    break;
                }
            }
        }

        //# Return the .path and the (optionally created) .ref to the caller
        return {
            path: sProperty,
            ref: core.resolve(_true, _window, sProperty)
        };
    }; //# core.locate


    /*
    ####################################################################################################
	Class: core.is
	Variable type identification logic.
    Requires:
    <core.mk>
    ####################################################################################################
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
		<core.is>, <core.eq.str>, <core.comp.str>, <core.mk.str>
		*/
        str: function (s, bDisallowNullString, bTrimWhitespace) {
            return core.mk.bool(
				(typeof s === 'string' || s instanceof String) &&
				(!bDisallowNullString || s !== '') &&
				(!bTrimWhitespace || core.mk.str(s).trim() !== '')
			);
        }, //# is.str


        /*
		Function: date
		Determines if the passed value is a date.
		Parameters:
		x - The date to interrogate.
		Returns:
		Boolean value representing if the value is a date.
		See Also:
		<core.is>, <core.eq.date>, <core.comp.date>, <core.mk.date>
		*/
        date: function (x) {
            var d = new Date(x);
            return core.mk.bool(x && _Object_prototype_toString.call(d) === "[object Date]" && !isNaN(d.valueOf()));
        }, //# is.date


        /*
		Function: num
		Determines if the passed value is a numeric value (includes implicit casting per the Javascript rules, see: <core.mk.int>).
		Parameters:
		x - The numeric value to interrogate.
		Returns:
		Boolean value representing if the value is a numeric value.
		See Also:
		<core.is>, <core.eq.num>, <core.comp.num>, <core.mk.int>, <core.mk.float>
		*/
        num: function (x) {
            return core.mk.bool(/^[-0-9]?[0-9]*(\.[0-9]{1,})?$/.test(x) && !isNaN(parseFloat(x)) && isFinite(x));
        }, //# is.num


        /*
		Function: int
		Determines if the passed value is an integer value (includes implicit casting per the Javascript rules, see: <core.mk.int>).
		Parameters:
		x - The integer to interrogate.
		Returns:
		Boolean value representing if the value is an integer value.
		See Also:
		<core.is>, <core.eq.num>, <core.comp.num>, <core.mk.int>, <core.mk.float>
		*/
        int: function (x) {
            var fX = core.mk.float(x);

            return (core.is.num(x) && fX % 1 === 0);
        }, //# is.int


        /*
		Function: float
		Determines if the passed value is a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.mk.int>).
		Parameters:
		x - The numeric value to interrogate.
		Returns:
		Boolean value representing if the value is a floating point numeric value.
		See Also:
		<core.is>, <core.eq.num>, <core.comp.num>, <core.mk.int>, <core.mk.float>
		*/
        float: function (x) {
            var fX = core.mk.float(x);

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
            //return core.mk.bool(b === _true || b === _false);
            return core.mk.bool(_Object_prototype_toString.call(b) === '[object Boolean]');
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
            return core.mk.bool(v === _true ?
				_true :
				(v + "").trim().toLowerCase() === "true"
			);
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
            return core.mk.bool(_Object_prototype_toString.call(f) === '[object Function]');
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
		<core.is>, <core.mk.obj>, <core.resolve>
		*/
        obj: function (o /*, [bDisallowEmptyObject], [a_sRequiredKeys] */) {
            var a_sRequiredKeys, i,
                bDisallowEmptyObject = _false,
                bReturnVal = core.mk.bool(o && o === Object(o) && !core.is.fn(o))
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
                bReturnVal = core.mk.bool(!bDisallowEmptyObject || Object.getOwnPropertyNames(o).length !== 0);

                //# If we still have a valid Object and we have a_sRequiredKeys, traverse them
                if (bReturnVal && a_sRequiredKeys) {
                    for (i = 0; i < a_sRequiredKeys.length; i++) {
                        //# If the current a_sRequiredKeys is missing from our o(bject), flip our bReturnVal and fall from the loop
                        if (!o.hasOwnProperty(a_sRequiredKeys[0])) {
                            bReturnVal = _false;
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
		<core.is>, <core.mk.arr>
		*/
        arr: function (a, bDisallow0Length) {
            return core.mk.bool(_Object_prototype_toString.call(a) === '[object Array]' &&
				(!bDisallow0Length || a.length > 0)
			);
        }, //# is.arr


        /*
        Function: val
        Determines if the passed value is set (i.e. !== undefined || null).
        Parameters:
        v - The varient to interrogate.
        Returns:
        Boolean value representing if the value is set.
        See Also:
        <core.is>, <core.mk.arr>
        */
        val: function (v) {
            return core.mk.bool(v !== _undefined && v !== null);
        }, //# is.val


        /*
        Function: json
        Determines if the passed value is a valid JSON string.
        Parameters:
        s - The varient to interrogate.
        Returns:
        Boolean value representing if the passed value is a valid JSON string.
        See Also:
        <core.mk>, <core.mk.json>, <core.mk.obj>
        */
        json: function (s) {
            try {
                JSON.parse(s);
                return _true;
            } catch (e) {
                return _false;
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
            return core.mk.bool(x && core.is.str(x.tagName) && x.tagName !== "" && core.is.fn(x.getAttribute));
        } //# is.dom
    }; //# core.is


    /*
    ####################################################################################################
	Class: core.mk (Make)
	Variable casting logic.
    Requires:
    <core.is>, <core.data>
    ####################################################################################################
	*/
    core.mk = {
        /*
		Function: str
		Safely forces the passed value into a string.
		Parameters:
		x - The varient to interrogate.
		sDefault - The default value to return if casting fails.
		Returns:
		String representing the passed value.
		See Also:
		<core.mk>, <core.is.str>, <core.eq.str>, <core.comp.str>
		*/
        str: function (s, sDefault) {
            var sS = s + "";

            return (s && sS ?
                sS :
				(arguments.length > 1 ? sDefault : "")
			);
        }, //# mk.str


        /*
		Function: date
		Safely forces the passed value into a date.
		Parameters:
		x - The varient to interrogate.
		vDefault - The default value to return if casting fails.
		Returns:
		Date representing the passed value.
		See Also:
		<core.mk>, <core.mk.yyyymmdd>, <core.mk.age>, <core.is.date>, <core.eq.date>, <core.comp.date>
		*/
        date: function (x, vDefault) {
            return (core.is.date(x) ?
				new Date(x) :
				(arguments.length > 1 ? vDefault : new Date())
			);
        }, //# mk.date


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
		<core.mk>, <core.mk.float>, <core.is.float>, <core.mk.int>, <core.eq.num>, <core.comp.num>
		*/
        int: function (i, vDefault) {
            var iReturnVal = parseInt(i, 10);

            return (!isNaN(iReturnVal) ?
                iReturnVal :
				(arguments.length > 1 ? vDefault : 0)
			);
        }, //# mk.int


        /*
		Function: float
		Safely forces the passed value into a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.mk.int>).
		Parameters:
		f - The varient to interrogate.
		vDefault - The default value to return if casting fails.
		Returns:
		Float representing the passed value.
		See Also:
		<core.mk>, <core.mk.int>, <core.is.float>, <core.mk.int>, <core.eq.num>, <core.comp.num>
		*/
        float: function (f, vDefault) {
            var fReturnVal = parseFloat(f, 10);

            return (!isNaN(fReturnVal) ?
                fReturnVal :
				(arguments.length > 1 ? vDefault : 0)
			);
        }, //# mk.float


        /*
		Function: arr
		Safely forces the passed array reference into an array.
		Parameters:
		a - The varient to interrogate.
		a_vDefault - The default value to return if casting fails.
		Returns:
		Integer representing the age in years.
		See Also:
		<core.mk>
		*/
        arr: function (a, a_vDefault) {
            return (core.is.arr(a) ?
                a :
				(arguments.length > 1 ? a_vDefault : [])
			);
        }, //# mk.arr


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
		<core.mk>
		*/
        obj: function (o, oDefault) {
            return (core.is.obj(o) ?
                o :
                (arguments.length > 1 ? oDefault : {})
            );
        }, //# mk.obj


        /*
		Function: bool
		Safely forces the passed varient into a boolean value.
		Parameters:
		b - The varient to interrogate.
		Returns:
		Boolean value representing the truthiness of the passed varient.
		See Also:
		<core.mk>
		*/
        bool: function (b) {
            return (b ? _true : _false);
        }, //# mk.bool


        /*
		Function: age
		Safely parses the passed value as a date of birth into the age in years.
		Parameters:
		dob - The varient to interrogate.
		Returns:
		Integer representing the age in years.
		See Also:
		<core.mk>
		*/
        age: function (dob) {
            var dAgeSpan,
				iReturnVal = -1
            ;

            //# If the passed dob is a valid date
            if (core.is.date(dob)) {
                //# Set dAgeSpan based on the milliseconds from epoch
                dAgeSpan = new Date(Date.now() - core.mk.date(dob, null));
                iReturnVal = Math.abs(dAgeSpan.getUTCFullYear() - 1970);
            }

            return iReturnVal;
        }, //# mk.age


        /*
		Function: yyyymmdd
		Safely parses the passed value into a string containing the international date format (YYYY/MM/DD).
		Parameters:
		x - The varient to interrogate.
		dDefault - The default value to return if casting fails.
		Returns:
		String representing the international date format (YYYY/MM/DD).
		See Also:
		<core.mk>, <core.mk.date>, <core.mk.dateOnly>, <core.is.date>, <core.comp.date>, <core.eq.date>
		*/
        yyyymmdd: function (x, dDefault) {
            var dDate = core.mk.date(x, (arguments.length > 1 ? dDefault : new Date()));

            return (core.is.date(dDate) ?
            			dDate.getFullYear() + '/' + core.data.str.lpad((dDate.getMonth() + 1), "0", 2) + '/' + core.data.str.lpad(dDate.getDate(), "0", 2) :
				""
			);
            //dCalDate.getHours() + ':' + core.mk.str(dCalDate.getMinutes()).lPad("0", 2) + ':' + core.mk.str(dCalDate.getSeconds()).lPad("0", 2)
        }, //# mk.yyyymmdd


        /*
		Function: dateOnly
		Safely parses the passed value into a date containing the year/month/day while replacing any time portion with midnight.
		Parameters:
		x - The varient to interrogate.
		dDefault - The default value to return if casting fails.
		Returns:
		Date representing the year/month/day in the passed value.
		See Also:
		<core.mk>, <core.mk.date>, <core.mk.yyyymmdd>, <core.is.date>, <core.comp.date>, <core.eq.date>
		*/
        dateOnly: function (x, dDefault) {
            return core.mk.date(core.mk.yyyymmdd.apply(this, arguments) + " 00:00:00");
        }, //# mk.dateOnly


        /*
		Function: json
		Safely parses the passed value as a JSON string into an object.
		Parameters:
		s - The varient to interrogate.
		vDefault - The default value to return if casting fails.
		Returns:
		Object containing the parsed JSON data, or undefined if parsing failed.
		See Also:
		<core.mk>, <core.mk.obj>
		*/
        json: function (s, vDefault) {
            var oJson = (arguments.length > 1 ? vDefault : {});

            try {
                oJson = JSON.parse(s);
            } catch (e) { }

            return oJson;
        } //# mk.json
    }; //# core.mk


    /*
    ####################################################################################################
	Class: core.eq (Equals)
	Equating logic (including implicit casting of types).
    Requires:
    <core.is>, <core.mk>
    ####################################################################################################
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
		<core.eq>, <core.comp.date>, <core.is.date>, <core.mk.date>
		*/
        date: function (x, y) {
            var dDateX = core.mk.date(x, null);
            var dDateY = core.mk.date(y, null);

            //#     NOTE: `new Date("1970/01/01") === new Date("1970/01/01")` is always false as they are 2 different objects, while <= && >= will give the expected result
            //#     SEE: Comment from Jason Sebring @ http://stackoverflow.com/a/493018/235704 
            return (core.is.date(dDateX) && core.is.date(dDateY) && dDateX <= dDateY && dDateX >= dDateY);
        }, //# date


        /*
		Function: num
		Determines if the passed numeric values are equal (includes implicit casting per the Javascript rules, see: <core.mk.int>).
		Parameters:
		s - The first numeric value to compare.
		t - The second numeric value to compare.
		Returns:
		Boolean value representing if the passed numeric values are equal.
		See Also:
		<core.eq>, <core.comp.num>, <core.is.int>, <core.is.float>, <core.mk.int>, <core.mk.float>
		*/
        num: function (x, y) {
            var bReturnVal = _false;

            //# If the passed x and y .is.num'bers, .mk them .floats and reset our bReturnVal to their comparison
            if (core.is.num(x) && core.is.num(y)) {
                bReturnVal = (core.mk.float(x) === core.mk.float(y));
            }

            return bReturnVal;
        }, //# num


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
		<core.eq>, <core.comp.str>, <core.is.str>, <core.mk.str>
		*/
        str: function (s, t, bCaseInsenstive) {
            s = core.mk.str(s, "");
            t = core.mk.str(t, "");

            //# Unless specificially told not to, compare the passed string as bCaseInsenstive
            return (bCaseInsenstive !== _false ?
				(s.toLowerCase() === t.toLowerCase()) :
				(s === t)
			);
        } //# str
    }; //# core.eq


    /*
    ####################################################################################################
	Class: core.comp (Compare)
	Comparison logic (including implicit casting of types).
    Requires:
    <core.is>, <core.mk>
    ####################################################################################################
	*/
    core.comp = {
        /*
		Function: date
		Determines the relationship between the passed dates, with the second date optionally defaulting to `new Date()` (i.e. now).
		Parameters:
		x - The first date to compare.
		(Optional) y - The optional second date to compare. Default Value: `new Date()`.
		Returns:
		Nullable integer value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or the passed y is not a date.
		See Also:
		<core.comp>, <core.eq.date>, <core.is.date>, <core.mk.date>
		*/
        date: function (x, y) {
            var iReturnVal = _undefined,
                dDateX = core.mk.date(x, null),
                dDateY = (arguments.length < 2 ? new Date() : core.mk.date(y, null))
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
		Function: num
		Determines the relationship between the passed numeric values (includes implicit casting per the Javascript rules, see: <core.mk.int>).
		Parameters:
		x - The first numeric value to compare.
		y - The second numeric value to compare.
		Returns:
		Nullable interger value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or y is non-numeric.
		See Also:
		<core.comp>, <core.eq.num>, <core.is.num>, <core.is.int>, <core.is.float>, <core.mk.int>, <core.mk.float>
		*/
        num: function (x, y) {
            var iReturnVal = _undefined,
                dX = core.mk.float(x, null),
                dY = core.mk.float(y, null)
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
        }, //# num


        /*
		Function: str
        Determines the relationship between the passed strings (implicitly casted, trimmed and compaired as case-insensitive).
		Parameters:
		x - The first string to compare.
		y - The second string to compare.
		Returns:
		Truthy value representing `true` if x === y, `false` if x != y or 1 if x matches y (case-insensitive and trimmed).
		See Also:
		<core.comp>, <core.eq.str>, <core.is.str>, <core.mk.str>
		*/
        str: function (x, y) {
            var vReturnVal = _false,
                s1 = core.mk.str(x),
                s2 = core.mk.str(y)
            ;

            //# If the strings match as-is, reset our vReturnVal to 1
            if (s1 === s2) {
                vReturnVal = _true;
            }
            //# Else if the strings match after .trim'ing and .toLowerCase'ing, reset our vReturnVal to -1
            else if (s1.trim().toLowerCase() === s2.trim().toLowerCase()) {
                vReturnVal = 1; //# truthy
            }

            return vReturnVal;
        } //# str
    }; //# core.comp


    /*
    ####################################################################################################
	Class: core.fn (Function)
	Function management functionality.
    Requires:
    <core.is>, <core.mk>
    ####################################################################################################
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
        Function: tryCatch
        Safely calls the passed function, returning the default value if an error occurs during execution.
		Parameters:
		fn - Function to call.
		vContext - Varient representing the Javascript context (e.g. `this`) in which to call the function.
		vArguments - Varient representing the argument(s) to pass into the passed function.
        vDefault - Varient representing the default value to return if an error occurs. Default: `undefined`.
        bReturnObj - Boolean value representing if an Object is to be returned representing the result and error. Default `false`.
		Returns:
		Varient representing the result of the passed function.
		See Also:
		<core.fn>, <core.fn.tryCatch>, <core.fn.once>, <core.fn.poll>, <core.fn.debounce>
        */
        tryCatch: function (fn, vContext, vArguments, vDefault, bReturnObj) {
            var oReturnVal = {
                result: vDefault,
                error: null
            };

            try {
                oReturnVal.result = fn.apply(
                    vContext || this,
                    core.is.arr(vArguments) ? vArguments : [vArguments]
                );
            }
            catch (e) {
                oReturnVal.error = e;
            }

            return (bReturnObj ? oReturnVal : oReturnVal.result);
        }, //# tryCatch

        
        /*
        Function: throttle
        Enforces a maximum number of times a function can be called over time.
		Parameters:
		fn - Function to call.
		iWait - Minimum number of miliseconds between each call.
		oOptions - Object representing the desired options (see About).
		Returns:
		Varient representing the result of the passed function.
		About:
		Based on http://underscorejs.org/docs/underscore.html
		See Also:
		<core.fn>, <core.fn.once>, <core.fn.poll>, <core.fn.call>, <core.fn.debounce>
        */
        throttle: function (fn, iWait, oOptions) {
            var context, args, result,
                timeout = null,
                previous = 0
            ;
            //if (!oOptions) oOptions = {};
            oOptions = core.mk.obj(oOptions);
            var later = function () {
                previous = oOptions.leading === _false ? 0 : Date.now();
                timeout = null;
                result = fn.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function () {
                var remaining,
                    now = Date.now()
                ;
                if (!previous && oOptions.leading === _false) previous = now;
                remaining = iWait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0 || remaining > iWait) {
                    if (timeout) {
                        clearTimeout(timeout);
                        timeout = null;
                    }
                    previous = now;
                    result = fn.apply(context, args);
                    if (!timeout) context = args = null;
                } else if (!timeout && oOptions.trailing !== _false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },


        /*
		Function: debounce
		Enforces that a function cannot be called again until a certain amount of time has passed without it being called.
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
		Based on http://underscorejs.org/docs/underscore.html
		See Also:
		<core.fn>, <core.fn.once>, <core.fn.poll>, <core.fn.call>, <core.fn.throttle>
		*/
        debounce: function (fn, iWait, bImmediate) {
            var timeout, args, context, timestamp, result,
                later = function () {
                    var last = Date.now() - timestamp;

                    if (last < iWait && last >= 0) {
                        timeout = setTimeout(later, iWait - last);
                    } else {
                        timeout = null;
                        if (!bImmediate) {
                            result = fn.apply(context, args);
                            if (!timeout) context = args = null;
                        }
                    }
                }
            ;

            return function () {
                var callNow = bImmediate && !timeout;
                context = this;
                args = arguments;
                timestamp = Date.now();
                if (!timeout) timeout = setTimeout(later, iWait);
                if (callNow) {
                    result = fn.apply(context, args);
                    context = args = null;
                }

                return result;
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


    /*
    ####################################################################################################
	Class: core.net
	Base networking functionality.
    Requires:
    NONE
    ####################################################################################################
	*/
    !function () {
        var _a, _iframe;

        core.net = {
            /*
            Function: ping
            Pings the passed URL via an HTML IFRAME.
            Parameters:
            sUrl - String representing the target URL to ping.
            */
            ping: function(sUrl) {
                if (!_iframe) _iframe = document.createElement('iframe');
                _iframe.src = sUrl;
            }, //# ping


            /*
            Function: absoluteUrl
            Retrieves the absolute URL from the passed URL.
            Parameters:
            sUrl - String representing the target URL to extract the absolute URL from.
            About:
            From: http://davidwalsh.name/essential-javascript-functions
            Returns:
            String representing the absolute URL.
            */
            absoluteUrl: function (sUrl) {
                if (!_a) _a = document.createElement('a');
                _a.href = sUrl;
                return _a.href;
            } //# absoluteUrl
        };
    }(); //# core.net

    
    /*
    ####################################################################################################
	Class: core.log
    Console and error handling functionality.
    Requires:
    <core.is>, <core.fn>, <core.net>
    ####################################################################################################
	*/
    !function () {
        var oOptions,
            eSeverity = {
                error: 1,
                warn: 2,
                log: 3
            }
        ;

        //# 
        function logToServer(eSeverity, _args) {
            //# If this is a eSeverity .logLevel we are logging, we need to logToServer
            if (eSeverity <= oOptions.logLevel) {
                //# If we have a .url to .ping
                if (core.is.str(oOptions.url, _true)) {
                    core.ui.ping(oOptions.url); // + "?" +
                    //    "message=" + encodeURIComponent(sMessage) + "&" +
                    //    "url=" + encodeURIComponent(sUrl) + "&" +
                    //    "line=" + encodeURIComponent(iLine) + "&" +
                    //    "col=" + encodeURIComponent(iColumn) + "&" +
                    //    "error=" + encodeURIComponent(_error)
                    //);
                }

                //# .call the .callback (if any)
                core.fn.call(oOptions.callback, this, _args);
            }
        } //# logToServer


        //# 
        function catchErrors(sMessage, sUrl, iLine, iColumn, _error) {
            //#
            logToServer(eSeverity.error, arguments);

            //# Surpress dialog
            return core.mk.bool(oOptions.surpressErrors);
        } //# catchErrors


        //# 
        core.log = {
            //# 
            options: function(oLogOptions) {
                oOptions = core.extend({
                    severity: eSeverity,
                    logLevel: eSeverity.error,
                    logAllErrors: _false,
                    surpressErrors: _true,
                    callback: null,
                    url: null
                }, oLogOptions);

                //# 
                if (oOptions.logAllErrors) {
                    core.fn.tryCatch(function() {
                        _window.onerror = catchErrors;
                    }, this, [], {} /*, _false*/);
                }
                //# 
                else {
                    _window.onerror = null;
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
                    if (_window.console && core.is.fn(_window.console.warn)) {
                        _window.console.warn.apply(this, arguments);
                    }
                    else {
                        core.log.console.apply(this, arguments);
                    }
                } catch (e) { }
            }, //# warn

            //# Safely logs the arguments to the console
            console: function (/*arguments*/) {
                logToServer(eSeverity.log, arguments);
                try {
                    _window.console.log.apply(this, arguments);
                } catch (e) { }
            } //# console
        };
    }(); //# core.log


    /*
    ####################################################################################################
    Class: core.cookie
    Parses the referenced cookie and returns an object to manage it.
    Requires:
    <core.is>, <core.fn>, <core.data>
    ####################################################################################################
    */
    !function () {
        var oOnUnload = {
            $keys: []
        };

        //# 
        /*
        _window.addEventListener("beforeunload", function (e) {
            for (var i; i < oOnUnload.$keys.length; i++) {
                core.fn.call(oOnUnload[oOnUnload.$keys[i]]);
            }
            
            (e || _window.event).returnValue = null;
            return null;
        });
        */

        core.cookie = function (sName, vAutoSetConfig, oDefault) {
            var oModel,
				$returnValue = {
				    name: sName,
				    original: null,
				    string: function () {
				        return JSON.stringify($returnValue.data);
				    },
				    data: null,
				    isNew: _true,
				    set: function (iMaxAge, sPath, sDomain) {
				        var dExpires;

				        //# If iMaxAge was not passed in, default to .seconds7Days
				        if (iMaxAge === _undefined) {
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
				        $returnValue.isNew = _false;
				        return _true;
				    },
				    remove: function () {
				        //# .escape the .string, set the max-age and path and toss it into the .cookie collection
				        //$returnValue.data = null;
				        delete oOnUnload[sName];
				        core.data.arr.remove(oOnUnload.$keys, sName);
				        document.cookie = sName + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;" + ' path=' + (vAutoSetConfig.path || "/");
				        return _true;
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

                        //oModel = core.mk.json($returnValue.original);
                        //oModel = core.fn.tryCatch(function() {
                        //    JSON.parse($returnValue.original);
                        //}, this, [], {} /*, _false*/);

                        //oModel = ($returnValue.original ? core.serial.de($returnValue.original) : {});
                        try {
                            oModel = ($returnValue.original ? JSON.parse($returnValue.original) : {});
                        } catch (e) {
                            oModel = {};
                        }

                        return _true;
                    }
                }
                return _false;
            }

            //# So long as we've not been explicitly told to not to, hook _window.onbeforeunload
            /*
            if (vAutoSetConfig === true || core.is.obj(vAutoSetConfig)) {
                if (oOnUnload.$keys.indexOf(sName) === -1) {
                    oOnUnload.$keys.push(sName);
                    oOnUnload[sName] = function () {
                        $returnValue.set(vAutoSetConfig.maxAge, vAutoSetConfig.path, vAutoSetConfig.domain);
                    };
                }
            }
            */

            //# 
            vAutoSetConfig = (core.is.obj(vAutoSetConfig) ? vAutoSetConfig : {});

            //# If a seemingly valid sName was passed
            if (!core.is.str(sName) || sName === "") {
                throw (core.$path + ".cookie: A [String] value must be provided for the cookie name.");
            }

            //# If we can .find a current value, reset .isNew to false
            if (find()) {
                $returnValue.isNew = _false;
            }
            //# Else this .isNew cookie, so if the caller passed in a valid oDefault object, reset our oModel to it
            else if (core.is.obj(oDefault)) {
                oModel = oDefault;
            }

            //# 
            $returnValue.data = oModel;
            return $returnValue;
        };
    }(); //# core.cookie


    /*
    ####################################################################################################
    Class: core.queryString
    Parses the referenced cookie and returns an object to manage it.
    Requires:
    <core.is>, <core.mk>, <core.fn>, <core.eq>
    ####################################################################################################
    */
    !function () {
        var $queryString;

        //# serializes the passed model (up to 3-dimensions)
        function serialize(model, vOptions) {
            var key, value, subkey, i,
                oOptions = (core.is.obj(vOption) ?
                    vOption :
                    { useSemicolon: vOption === _true, encodeURI: _true }
                ),
                e = (oOptions.encodeURI === _false ?
                    function (s) { return s; } :
                    encodeURIComponent
                ),
                delimiter = (oOptions.useSemicolon === _true ?
                    "; " :
                    "&"
                ),
                returnVal = ''
            ;

            //# Traverse each key within the passed model
            for (key in model) {
                if (model.hasOwnProperty(key)) {
                    value = model[key];
                    key = e(key.trim());

                    //# If the current value is null or undefined, record a null-string value
                    if (!core.is.val(value)) {
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
            }

            return returnVal.trim().substr(0, returnVal.length - 1);
        } //# serialize
        
        
        //# Parses the passed valuetoParse into a model (up to 3-dimensions deep)
        //#    Based on: http://jsbin.com/adali3/2/edit via http://stackoverflow.com/a/2880929/235704
        //#    NOTE: All keys are .toLowerCase'd to make them case-insensitive(-ish) with the exception of a sub-keys named 'length', which are .toUpperCase'd
        //#    Supports: key=val1;key=val2;newkey=val3;obj=zero;obj=one;obj[one]=1;obj[two]=2;obj[Length]=long;obj[2]=mytwo;obj=two;obj[2]=myothertwo;obj=three
        function deserialize(valuetoParse) {
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
                    if (core.eq.str(sk, 'length')) {
                        sk = sk.toUpperCase();
                        core.fn.call(core.resolve(core, "log.warn"), this, "'length' is a reserved name and cannot be used as a sub-key. Your sub-key has been changed to 'LENGTH'.");
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
        } //# deserialize
        
        
        //# Parses the query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
        //#     Supports: ?test=Hello&person=neek&person=jeff&person[]=jim&person[extra]=john&test3&nocache=1398914891264&person=frank,jim;person=aaron
        core.queryString = {
            ser: {
                ize: serialize,
                de: deserialize
            },
            
            //# Parses the query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
            //#     Supports: ?test=Hello&person=neek&person=jeff&person[]=jim&person[extra]=john&test3&nocache=1398914891264&person=frank,jim;person=aaron
            get: function (sKey, bCaseInsenstive) {
                var vReturnVal;

                //# Ensure the cached $queryString is setup
                $queryString = $queryString || deserialize(_window.location.search.substring(1));

                //# If there were no arguments, return the cached $queryString
                if (arguments.length === 0) {
                    vReturnVal = $queryString;
                }
                //# Else we need to .getKey from the $queryString
                else {
                    vReturnVal = core.data.getKey(sKey, $queryString, bCaseInsenstive);
                }

                return vReturnVal;
            },

            //# Parses the sUrl's query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
            parse: function (sUrl) {
                var i, oReturnVal;

                //# If the passed sUrl .is.str, see if it has a query string
                if (core.is.str(sUrl, true)) {
                    i = sUrl.indexOf("?");

                    //# If the sUrl has a query string, .deserialize it into our oReturnVal
                    if (i > -1) {
                        oReturnVal = deserialize(sUrl.substr(i + 1))
                    }
                }

                return oReturnVal;
            }
        }; //# core.queryString
    }(); //# core.queryString


    /*
    ####################################################################################################
    Class: core.net.ajax
    AJAX-based Networking functionality.
    Requires:
    <core.is>, <core.net>
    ####################################################################################################
    */
    !function () {
        var oOptions = {
            async: _true
        };
        
        //# 
        function doOptions(oNetOptions) {
            oOptions = core.extend(oOptions, oNetOptions);
        } //# doOptions
        
        
        //# Wrapper for an XHR AJAX call
        function xhr(sUrl, sVerb, bAsync, vCallback) {
            /* global ActiveXObject: false */ //# JSHint "ActiveXObject variable undefined" error supressor
            var $xhr,
                XHRConstructor = (XMLHttpRequest || ActiveXObject)
            ;

            //# IE5.5+ (ActiveXObject IE5.5-9), based on http://toddmotto.com/writing-a-standalone-ajax-xhr-javascript-micro-library/
            try {
                $xhr = new XHRConstructor('MSXML2.XMLHTTP.3.0');
            } catch (e) { }

            //# If a function was passed rather than an object, object-ize it (else we assume its an object with at least a .fn)
            if (core.is.fn(vCallback)) {
                vCallback = { fn: vCallback, arg: null };
            }

            //# If we were able to collect an $xhr object
            if ($xhr) {
                //# Setup the $xhr callback
                //$xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                $xhr.onreadystatechange = function () {
                    //# If the request is finished and the .responseText is ready
                    if ($xhr.readyState === 4) {
                        vCallback.fn(
                            ($xhr.status === 200 || ($xhr.status === 0 && sUrl.substr(0, 7) === "file://")),
                            { text: $xhr.responseText, data: core.fn.call(JSON.parse, null, $xhr.responseText) },
                            vCallback.arg,
                            $xhr
                        );
                    }
                };

                //# GET the sUrl
                $xhr.open(sVerb, sUrl, (bAsync === _true));
                $xhr.send();
            }
            //# Else we were unable to collect the $xhr, so signal a failure to the vCallback.fn
            else {
                vCallback.fn(_false, null, vCallback.arg, $xhr);
            }

            return $xhr;
        } //# xhr
        
        
        //# 
        function doGet(sUrl, vCallback) {
            xhr(sUrl, "GET", oOptions.async, vCallback);
        }
        function doPost(sUrl, vCallback) {
            xhr(sUrl, "POST", oOptions.async, vCallback);
        }
        function doPut(sUrl, vCallback) {
            xhr(sUrl, "PUT", oOptions.async, vCallback);
        }
        function doDelete(sUrl, vCallback) {
            xhr(sUrl, "DELETE", oOptions.async, vCallback);
        }
        
        
        //# .extend the .ajax functionality into the existing core.net functionality
        core.extend(core.net, {
            ajax: {
                options: doOptions,
                //xhr: xhr,

                //# Setup the HTTP Verb interfaces
                put: doPut,
                get: doGet,
                post: doPost,
                'delete': doDelete,
                head: function (sUrl, vCallback) {
                    xhr(sUrl, "HEAD", oOptions.async, vCallback);
                }
            },

            //# Setup the alias CRUD interfaces directly under core.net
            create: doPut,
            read: doGet,
            update: doPost,
            'delete': doDelete
        });
    }(); //# core.net.ajax


    /*
    ####################################################################################################
	Class: core.data
	Data manipulation logic.
    ####################################################################################################
	*/
    !function () {
        //# 
        function processObj(vSource, vKeys, bSetToUndefined) {
            var i,
                //bSetToUndefined = ,
                bReturnVal = _true
            ;

            function doPrune(oSource, vKeys, bSetToUndefined) {
                var a_sKeys, sKey, i,
                    bRemap = _false
                ;

                //# If the passed vKeys is an array, set it into a_sKeys
                if (core.is.arr(vKeys)) {
                    a_sKeys = vKeys;
                }
                //# Else vKeys is a oMapping definition, so pull its .keys and flip bRemap
                else if (core.is.obj(vKeys)) {
                    a_sKeys = Object.keys(vKeys);
                    bRemap = _true;
                }

                //# Traverse the a_sKeys
                for (i = 0; i < a_sKeys.length; i++) {
                    sKey = a_sKeys[i];

                    //# If we're supposed to bRemap, do so now
                    if (bRemap && oSource.hasOwnProperty(sKey)) {
                        oSource[vKeys[sKey]] = oSource[sKey];
                    }

                    //# Either bSetToUndefined or delete the current sKey
                    if (bSetToUndefined) {
                        oSource[sKey] = _undefined;
                    }
                    else {
                        delete oSource[sKey];
                    }
                }
            } //# doPrune

            //# If the caller passed in an .is.arr vSource, traverse it passing each entry into doPrune as we go
            if (core.is.arr(vSource, _true)) {
                for (i = 0; i < vSource.length; i++) {
                    doPrune(vSource[i], vKeys, bSetToUndefined);
                }
            }
            //# Else if the caller passed in an .is.obj, pass it off to doPrune
            else if (core.is.obj(vSource)) {
                doPrune(vSource, vKeys, bSetToUndefined);
            }
            //# Else the vSource is not a valid value, so flip our bReturnVal
            else {
                bReturnVal = _false;
            }     

            return bReturnVal;       
        }

        core.data = {
            //#
            map: function (vSource, oMapping) {
                var i,
                    a_sKeys = (core.is.obj(oMapping) ? Object.keys(oMapping) : null),
                    vReturnVal /*= undefined*/
                ;

                function mapObj(oSource) {
                    var sKey, i,
                        oReturnVal = {}
                    ;

                    for (i = 0; i < a_sKeys.length; i++) {
                        sKey = a_sKeys[i];
                        oReturnVal[oMapping[sKey]] = oSource[sKey];
                    }

                    return oReturnVal;
                }

                //# If the passed oMapping .is.obj
                if (a_sKeys) {
                    //# If the passed vSource .is.arr, set our vReturnVal to an array
                    if (core.is.arr(vSource)) {
                        vReturnVal = [];

                        //# Traverse the vSource, .push'ing each .mapObj into our vReturnVal
                        for (i = 0; i < vSource.length; i++) {
                            vReturnVal.push(mapObj(vSource[i]));
                        }
                    }
                    //# Else if the passed vSource .is.obj, .mapObj directly into our vReturnVal
                    else if (core.is.obj(vSource)) {
                        vReturnVal = mapObj(vSource);
                    }
                }

                return vReturnVal;
            }, //# map

            //# 
            remap: function (vSource, oMapping, bSetToUndefined) {
                var bReturnVal = core.is.obj(oMapping);

                //#
                if (bReturnVal) {
                    bReturnVal = processObj(vSource, oMapping, bSetToUndefined);
                }

                return bReturnVal;
            },

            //# 
            remove: function (vSource, vKeys, bSetToUndefined) {
                var i, bReturnVal;

                //# If the caller passed in an .is.str, reset vKeys to an array
                if (core.is.str(vKeys, _true)) {
                    vKeys = [vKeys];
                }
                bReturnVal = core.is.arr(vKeys, _true);

                //#
                if (bReturnVal) {
                    bReturnVal = processObj(vSource, vKeys, bSetToUndefined);
                }

                return bReturnVal;
            }, //#remove

            getKey: function (sKey, oObject, bCaseInsensitive) {
                var sCurrentKey,
                    vReturnVal /* = undefined */
                ;

                //# If the called passed in a valid oObject
                if (core.is.obj(oObject)) {
                    //# If this is a bCaseInsensitive call, .toLowerCase our sKey
                    if (bCaseInsensitive) {
                        sKey = core.mk.str(sKey).toLowerCase();

                        //# Traverse the oObject, returning the first matching .toLowerCase'd sCurrentKey
                        for (sCurrentKey in oObject) {
                            if (sCurrentKey.toLowerCase() === sKey) {
                                vReturnVal = oObject[sCurrentKey];
                                break;
                            }
                        }
                    }
                    //# Else a case-specific sKey was requested
                    else {
                        vReturnVal = oObject[sKey];
                    }
                }

                return vReturnVal;
            }, //# getKey

            //# Returns the first entry within the passed collection matching the key/value pair (optionally testing as caseInsentive)
            getFirstByValue: function (key, value, collection, caseInsentive) {
                var returnValue = core.data.getByValue(key, value, collection, caseInsentive, _true);
                return (returnValue ? returnValue.data[0] : _undefined);
            }, //# getFirstByValue


            //# Returns the entry(ies) within the passed collection matching the key/value pair (optionally testing as caseInsentive)
            getByValue: function (key, value, collection, caseInsentive, firstOnly) {
                var i,
                    returnValue = { indexes: [], data: [] }
                ;

                //# If there is a valid key and collection to look thru
                if (core.is.str(key) && core.is.arr(collection, _true)) {
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
                return (core.is.arr(returnValue.data, _true) ? returnValue : _undefined);
            }, //# getByValue


            //# Returns the entry(ies) within the passed collection matching the key with the passed values (optionally testing as caseInsentive)
            getByValues: function (key, values, collection, caseInsentive) {
                var i, j, entry,
                    returnVal = { indexes: [], data: [] }
                ;

                //# If the user passed in a values Array
                if (core.is.arr(values, _true)) {
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
                return (core.is.arr(returnVal.data, _true) ? returnVal : _undefined);
            }, //# getByValues


            //# 
            arr: {
                //# Removes the target from the referenced array
                remove: function (aArray, vTarget, vReplaceWith) {
                    var i,
                        bReturnVal = _false
                    ;

                    //# If the passed aArray is one, determine the i(ndex) of the passed vTarget (resetting our bReturnVal based on finding the i(ndex))
                    if (core.is.arr(aArray, _true)) {
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
                        bValuesToRemove = core.is.arr(a_vValuesToRemove, _true)
                    ;

                    //# If the caller passed a valid a_vArray, traverse it
                    if (core.is.arr(a_vArray, _true)) {
                        for (i = 0; i < a_vArray.length; i++) {
                            //# If we have a_vValuesToRemove, reset bSkipValue for this loop
                            if (bValuesToRemove) {
                                bSkipValue = _false;

                                //# Traverse the bSkipValue, flipping bSkipValue if one is found for the current a_vArray value
                                for (j = 0; j < a_vValuesToRemove.length; j++) {
                                    if (core.eq.str(a_vArray[i], a_vValuesToRemove[j], caseInsentive)) {
                                        bSkipValue = _true;
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
                }, //# removeAll

                //# 
                filter: function (a_oData, oQuery, bUseCoercion) {
                    var a_sKeys = Objects.keys(oQuery),
                        a_oReturnVal, bIsMatch, i, j
                    ;

                    //# If we have a_oData to search
                    if (core.is.arr(a_oData, _true)) {
                        //# If we have a defined oQuery
                        if (core.is.arr(a_sKeys, _true)) {
                            a_oReturnVal = [];

                            //# Traverse our a_oData, flipping bIsMatch on each loop
                            for (i = 0; i < a_oData.length; i++) {
                                bIsMatch = _true;

                                //# Traverse our oQuery's a_sKeys
                                for (j = 0; j < a_sKeys.length; j++) {
                                    //# If we are supposed to bUseCoercion and the current a_sKeys does not match the oQuery value, unflip bIsMatch and fall from the inner loop
                                    if (bUseCoercion && core.resolve(a_oData, i + "." + a_sKeys[j]) != oQuery[a_sKeys[j]]) {
                                        bIsMatch = _false;
                                        break;
                                    }
                                        //# Else if the current a_sKeys does not exactly match the oQuery value, unflip bIsMatch and fall from the inner loop
                                    else if (core.resolve(a_oData, i + "." + a_sKeys[j]) !== oQuery[a_sKeys[j]]) {
                                        bIsMatch = _false;
                                        break;
                                    }
                                }

                                //# If the current a_oData record passed each oQuery value, .push it into our a_oReturnVal
                                if (bIsMatch) {
                                    a_oReturnVal.push(a_oData[i]);
                                }
                            }
                        }
                            //# Else the oQuery is empty, so return everything
                        else {
                            a_oReturnVal = a_oData;
                        }
                    }

                    return a_oReturnVal;
                } //# filter
            }, //# array

            //# 
            str: {
                lpad: function (s, char, len) {
                    var sReturnVal;

                    //# Ensure the passed s(tring) .is.str
                    sReturnVal = s = core.mk.str(s);

                    //# If the arguments are of the proper types and values
                    if (core.is.str(char) && char.length === 1 && core.is.num(len) && len > -1) {
                        //# Left pad out this [string] while it's .length is less than the passed len
                        while (sReturnVal.length < len) {
                            sReturnVal = char + sReturnVal;
                        }
                    }
                        //# Else the arguments were invalid, so throw the error
                    else {
                        throw "core.data.str.lpad: `char` must represent a single character and `len` must be an integer greater than 0.";
                    }

                    return sReturnVal;
                }
            } //# str

        }; //# core.data
    }();


    //##################################################
    //# Procedural code
    //##################################################
    //# .locate our _window variable oTarget.ref and set our .$path 
    oTarget = core.locate("ish");
    core.$path = oTarget.path;

    //# First overwrite any core functionality with oTarget.ref's existing functionality, then update the oTarget.ref with all of the functionality
    core.extend(core, oTarget.ref);
    core.extend(oTarget.ref, core);
}();
