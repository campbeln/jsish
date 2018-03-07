/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function () {
    'use strict';

    var _window = window,                                                           //# code-golf
        _document = document,                                                       //# code-golf
        _head = _document.head,                                                     //# code-golf
        //_body = _document.body,                                                     //# code-golf
        _undefined /*= undefined*/,                                                 //# code-golf
        _null = null,                                                               //# code-golf
        _document_currentScript = _document.currentScript,                          //# code-golf
        _Object_prototype_toString = Object.prototype.toString,                     //# code-golf
        _document_querySelector = _document.querySelector.bind(_document),          //# code-golf
        //_document_querySelectorAll = _document.querySelectorAll.bind(_document),    //# code-golf
        _Date_now = Date.now,                                                       //# code-golf
        oTypeIsh = { //# Set the .ver and .target under .type.ish (done here so it's at the top of the file for easy editing) then stub out the .app and .lib with a new .pub oInterfaces for each
            //is: function () {},
            //import: function () {},
            ver: '0.10.2018-03-02',
            options: {
                //script: _undefined,
                target: "ish",
                plugins: {
                    //import: [],
                    //path: _document.currentScript.src,
                    //cache: false,
                    //importedBy: ""
                }
            },
            expectedErrorHandler: function expectedErrorHandler(/*e*/) {}
            //script: _document_currentScript || _document_querySelector("SCRIPT[" + core.type.ish.target + "]"),
        },
        oInterfaces = {
            pub: function () {
                return {
                    data: {},
                    options: {},
                    ui: {}
                };
            }
        }, //# oInterfaces
        core = { //# Stub out the .app and .lib with a new .pub oInterfaces for each
            //resolve: function () {},
            //extend: function () {},
            //require: function () {},
            //type: {},
            //io: {},
            //ui: {},
            //app: oInterfaces.pub(),
            //lib: oInterfaces.pub() //# + sync
        }
    ;


    /** ################################################################################################
     * @function resolve
     * @desc Safely accesses (or optionally creates) an object structure, allowing access to deep properties without the need to ensure the object structure exists.
     * @param {boolean} [bForceCreate] - Indicates if the path is to be forcibly created. `false` creates the path if it does not already exist, `true` overwrites non-object parent path segments with objects (see About).
     * @param {object} oObject - The object to interrogate.
     * @param {string|array[string]} vPath - Varient representing the path to the requested property (array or period-delimited string, e.g. "parent.child.array.0").
     * @param {varient} [vValue] - Varient representing the value to set the referenced property to (used only when creating the path).
     * @returns {varient} Varient representing the value at the referenced path, returning undefined if the path does not exist.
     * @example <caption>When forcing the creation of an object structure, data can be lost if an existing non-object property is used as a parent, e.g.:</caption>
     * var neek = { nick: true };
     * var deepProp = ish.resolve(true, neek, "nick.campbell");
     * // This will overwrite the boolean property `nick` with an object reference containing the property `campbell`.
     * @requires core.type.obj.is, core.type.str.is, core.type.arr.is
    ################################################################################################# */
    core.resolve = function (/*bForceCreate, oObject, vPath|a_sPath, vValue*/) {
        var vReturnVal, vValue, vPath, oObject, a_sPath, i, bCurrentIsObj, bHaveValue, bForceCreate,
            oIsObjOptions = { allowFn: true },
            a = arguments
        ;

        //# Setup our local variables based on the passed a(rguments)
        if (a[0] === true) {
            bForceCreate = true;
            oObject = a[1];
            vPath = a[2];

            //# If the caller passed in a vValue
            if (a.length > 3) {
                bHaveValue = true;
                vValue = a[3];
            }
        } else {
            bForceCreate = false;
            oObject = a[0];
            vPath = a[1];

            //# If the caller passed in a vValue
            if (a.length > 2) {
                bHaveValue = true;
                vValue = a[2];
            }
        }

        //# Now that the passed oObject is known, set our vReturnVal accordingly
        vReturnVal = (core.type.obj.is(oObject, oIsObjOptions) ? oObject : _undefined);

        //# If the passed oObject .is.obj and vPath .is.str or .is.arr, populate our a_sPath
        if (vReturnVal && (core.type.str.is(vPath) || (core.type.arr.is(vPath, true) && core.type.str.is(vPath[0])))) {
            a_sPath = (core.type.arr.is(vPath) ? vPath : vPath.split("."));

            //# Traverse the a_sPath
            for (i = 0; i < a_sPath.length; i++) {
                bCurrentIsObj = core.type.obj.is(vReturnVal, oIsObjOptions);

                //# If the bCurrentIsObj
                if (bCurrentIsObj) {
                    //# If the current vPath segment exists
                    if (a_sPath[i] in vReturnVal) {
                        //# Set oObject as the last object reference and vReturnVal as the current object reference
                        oObject = vReturnVal;
                        vReturnVal = oObject[a_sPath[i]];
                    }
                    //# Else if we are supposed to bForceCreate the current vPath segment
                    else if (bForceCreate) {
                        //# Set the oObject as the last object reference and create the new object at the current vPath segment while setting vReturnVal as the current object reference
                        oObject = vReturnVal;
                        vReturnVal = oObject[a_sPath[i]] = {};
                    }
                    //# Else the current vPath segment doesn't exist and we're not supposed to bForceCreate it, so reset our vReturnVal to undefined and fall from the loop
                    else {
                        vReturnVal = _undefined;
                        break;
                    }
                }
                //# Else if we are bForce(ing)Create
                else if (bForceCreate) {
                    //# Set a new object reference in vReturnVal then set it into oObject's last object reference
                    //#     NOTE: We enter the outer loop knowing the initial vReturnVal bCurrentIsObj, so there is no need to worry about a [0 - 1] index below as we will never enter this if on the first loop
                    oObject[a_sPath[i]] = vReturnVal = {};
                }
                //# Else if we're not on the final vPath segment
                else if (i < a_sPath.length - 1) {
                    //# The current vPath segment doesn't exist and we're not bForce(ing)Create, so reset our vReturnVal to undefined and fall from the loop
                    vReturnVal = _undefined;
                    break;
                }
            }

            //# If we bHaveValue and a valid vReturnVal, set it now
            if (bHaveValue && vReturnVal) {
                oObject[a_sPath[a_sPath.length - 1]] = vReturnVal = vValue;
            }
        }

        return vReturnVal;
    }; //# core.resolve


    /** ################################################################################################
     * @function extend
     * @desc Merges the content of subsequent objects into the first one, overriding its original values.
     * @param {boolean|integer} [vDeepCopy] - Indictes if a deep copy is to occur. `true` performs a deep copy, a positive integer indicates the max depth to perform a deep copy to, all other values perform a shallow copy. Default value: `false`.
     * @param {object} oTarget - Object to recieve properties.
     * @param {...object} oSource - Object(s) who's properties will be copied into the target.
     * @returns {object} Object referencing the passed oTarget.
     * @example <caption>Right-most source object wins:</caption>
     * // `oResult.i` will equal `2`.
     * var oResult = core.data.extend({}, { i: 1 }, { i: 2 });
     * // Heavily refactored code from http://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
     * @requires core.type.bool.is, core.type.num.is, core.type.obj.is, core.type.arr.is, core.type.dom.is
     * @requires core.type.int.mk
    ################################################################################################# */
    core.extend = function (/*vDeepCopy, oTarget, oSource, oSource2...*/) {
        var oTarget, oCurrent, sKey, iDepth, i, j,
            a = arguments,
            bDeepCopy = core.type.bool.is(a[0])
        ;

        //# If the first argument .is.bool or .is.num, setup the local vars accordingly
        if (bDeepCopy || core.type.num.is(a[0])) {
            iDepth = (bDeepCopy ? -1 : core.type.int.mk(a[0]));
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
        //oTarget = (core.type.obj.is(oTarget, { allowFn: true }) ? oTarget : {});
        oTarget = (core.type.obj.is(oTarget, { allowFn: true }) ? oTarget : Object(oTarget));

        //# Traverse the passed source objects
        for (/*i = i*/; i < a.length; i++) {
            oCurrent = a[i];

            //# Traverse the sKeys in the oCurrent object
            for (sKey in oCurrent) {
                //# If the current sKey is a native property of oCurrent, set it into our oTarget
                if (Object.prototype.hasOwnProperty.call(oCurrent, sKey)) {
                    //# If the oCurrent sKey .is.arr, setup the oTarget's sKey as a new array
                    //#     NOTE: This is necessary as otherwise arrays are copied in as objects so things like oTarget[sKey].push don't work in the .extend'ed objects, so since arrays return true from .is.obj and array's would otherwise be copied as references in the else below, this special case is necessary
                    if (core.type.arr.is(oCurrent[sKey])) {
                        oTarget[sKey] = [];

                        //# Traverse the oCurrent array, .push'ing each value into out oTarget sKey's new array
                        for (j = 0; j < oCurrent[sKey].length; j++) {
                            oTarget[sKey].push(
                                iDepth !== 0 && core.type.obj.is(oCurrent[sKey][j]) ?
                                core.extend(iDepth - 1, {}, oCurrent[sKey][j]) :
                                oCurrent[sKey][j]
                            );
                        }
                    }
                    //# Else the oCurrent sKey isn't an .arr
                    else {
                        oTarget[sKey] = (
                            /*iDepth !== 0 &&*/ core.type.obj.is(oCurrent[sKey]) && !core.type.dom.is(oCurrent[sKey]) && oTarget[sKey] !== oCurrent[sKey] ?
                            core.extend((iDepth !== 0 ? iDepth - 1 : false), oTarget[sKey], oCurrent[sKey]) :
                            oCurrent[sKey]
                        );
                    }
                }
            }
        }

        return oTarget;
    }; //# core.extend


    /** ################################################################################################
     * @namespace core.type
     * @desc Collection of variable Type-based functionality (`is` and `mk`).
     * @requires core.resolve, core.extend
     * @requires core.type.*.is
     * @requires core.type.*.mk
     * @requires core.type.fn.call, core.type.fn.noop
    ################################################################################################# */
    core.type = function () {
        //var oTypeProtected = {};

        /*
        */
        function type(x, a_vOrder) {
            var fnCurrent, i,
                fnReturnVal /* = _undefined */
            ;

            //# Ensure the passed a_vOrder is an array, defaulting to our .typeOrder if none was passed
            a_vOrder = core.type.arr.mk(a_vOrder, core.type.options.typeOrder);

            //# If we have a a_vOrder to traverse, do so now calculating each fnCurrent as we go
            if (core.type.arr.is(a_vOrder, true)) {
                for (i = 0; i < a_vOrder.length; i++) {
                    fnCurrent = core.resolve(core.type, [a_vOrder[i], 'is']) || core.type.fn.mk(a_vOrder[i], _null);

                    //# If the passed x is a fnCurrent, reset our fnReturnVal and fall form the loop
                    if (core.type.fn.call(fnCurrent, _null, [x])) {
                        fnReturnVal = fnCurrent;
                        break;
                    }
                }
            }

            return fnReturnVal;
        } //# core.type

        //#
        type.options = {
            typeOrder: [
                'bool', 'int', 'float', /*'num',*/ 'date',
                /*'selector',*/ 'json', 'str',
                'fn', 'dom', 'arr', 'list', 'obj',
                'symbol'
            ]
        }; //# core.type.options

        /*
        Function: is
        Determines if the passed value is an instance of the passed type.
        Parameters:
        o - The varient to interrogate.
        t - The type to compare to.
        Returns:
        Boolean value representing if the passed value is an instance of the passed type.
        */
        type.is = function isType(o, t) {
            try {
                return (o instanceof t);
            } catch (e) {
                return false;
            }
        }; //# type.is

        //####

        type.bool = {
            /*
            Function: is
            Determines if the passed value is a boolean value (e.g. `true` or `false`).
            Parameters:
            b - The boolean value to interrogate.
            Returns:
            Boolean value representing if the value is a boolean value.
            */
            is: function isBool(b) {
                //return (b === true || b === false);
                return (_Object_prototype_toString.call(b) === '[object Boolean]');
            }, //# bool.is

            /*
            Function: mk
            Safely forces the passed varient into a boolean value.
            Parameters:
            b - The varient to interrogate.
            Returns:
            Boolean value representing the truthiness of the passed varient.
            */
            mk: function (b) {
                return (b ? true : false);
            } //# bool.mk
        }; //# core.type.bool

        type.int = {
            /*
            Function: is
            Determines if the passed value is an integer value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            x - The integer to interrogate.
            Returns:
            Boolean value representing if the value is an integer value.
            */
            is: function isInt(x) {
                var fX = core.type.float.mk(x);
                return (core.type.num.is(x) && fX % 1 === 0);
            }, //# int.is
            
            /*
            Function: mk
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
            */
            mk: function (i, vDefault) {
                var iReturnVal = parseInt(i, 10);
    
                return (!isNaN(iReturnVal) ?
                    iReturnVal :
                    (arguments.length > 1 ? vDefault : 0)
                );
            } //# int.mk
        }; //# core.type.int

        type.float = {
            /*
            Function: is
            Determines if the passed value is a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            x - The numeric value to interrogate.
            Returns:
            Boolean value representing if the value is a floating point numeric value.
            */
            is: function isFloat(x) {
                var fX = core.type.float.mk(x);
                return (core.type.num.is(x) && fX % 1 !== 0);
            }, //# float.is
            
            /*
            Function: mk
            Safely forces the passed value into a floating point numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            f - The varient to interrogate.
            vDefault - The default value to return if casting fails.
            Returns:
            Float representing the passed value.
            */
            mk: function (f, vDefault) {
                var fReturnVal = parseFloat(f, 10);

                return (!isNaN(fReturnVal) ?
                    fReturnVal :
                    (arguments.length > 1 ? vDefault : 0)
                );
            } //# float.mk
        }; //# core.type.float

        //#     NOTE: No .mk
        type.num = {
            /*
            Function: is
            Determines if the passed value is a numeric value (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            x - The numeric value to interrogate.
            Returns:
            Boolean value representing if the value is a numeric value.
            */
            is: function isNum(x) {
                return (
                    /^[-0-9]?[0-9]*(\.[0-9]{1,})?$/.test(x) &&
                    !isNaN(parseFloat(x, 10)) &&
                    isFinite(x)
                );
            } //# num.is

            //mk: 
        }; //# core.type.num

        type.date = {
            /*
            Function: is
            Determines if the passed value is a date.
            Parameters:
            x - The date to interrogate.
            Returns:
            Boolean value representing if the value is a date.
            */
            is: function isDate(x) {
                var d = new Date(x);
                //# TODO: fix! bFuzzy?
                return (x && _Object_prototype_toString.call(d) === "[object Date]" && !isNaN(d.valueOf()));
            }, //# date.is

            /*
            Function: mk
            Safely forces the passed value into a date.
            Parameters:
            x - The varient to interrogate.
            vDefault - The default value to return if casting fails.
            Returns:
            Date representing the passed value.
            */
            mk: function (x, vDefault) {
                return (core.type.date.is(x) ?
                    new Date(x) :
                    (arguments.length > 1 ? new Date(vDefault) : new Date())
                );
            } //# date.mk
        }; //# core.type.date


        //#     NOTE: No .mk
        type.selector = {
            /*
            About:
            Based on code from: stackoverflow.com/a/42149818/235704
            */
            is: function isSelector() {
                var _dummy = document.createElement('br');

                return function (sSelector) {
                    var bReturnVal = false;

                    try {
                        _dummy.querySelector(sSelector);
                        bReturnVal = true;
                    } catch (e) { oTypeIsh.expectedErrorHandler(e); }

                    return bReturnVal;
                };
            }() //# selector.is

            //mk: 
        }; //# core.type.selector

        type.json = {
            /*
            Function: is
            Determines if the passed value is a valid JSON string.
            Parameters:
            s - The varient to interrogate.
            Returns:
            Boolean value representing if the passed value is a valid JSON string.
            */
            is: function isJson(s) {
                try {
                    JSON.parse(s);
                    return true;
                } catch (e) {
                    return false;
                }
            }, //# json.is

            /*
            Function: mk
            Safely parses the passed value as a JSON string into an object or stringify's the passed object into a JSON string.
            Parameters:
            v - The varient to interrogate.
            vDefault - The default value to return if casting fails.
            Returns:
            Object containing the parsed JSON data, string containing the stringified object, or vDefault if parsing failed.
            */
            mk: function (v, vDefault) {
                var vJson = (arguments.length > 1 ? vDefault : {});

                //# If the passed v(arient) .is.str, lets .parse it into an object
                if (core.type.str.is(v, true)) {
                    try {
                        vJson = JSON.parse(v);
                    } catch (e) { oTypeIsh.expectedErrorHandler(e); }
                }
                //# Else if the passed v(arient) .is.boj, lets .stringify it into a string
                else if (core.type.obj.is(v)) {
                    try {
                        vJson = JSON.stringify(v);
                    } catch (e) { oTypeIsh.expectedErrorHandler(e); }
                }

                return vJson;
            }, //# json.mk
        }; //# core.type.json

        type.str = {
            /*
            Function: is
            Determines if the passed value is a string.
            Parameters:
            s - The string to interrogate.
            bDisallowNullString - Boolean value indicating if nullstrings are to be disallowed (e.g. "").
            bTrimWhitespace - Boolean value indicating if leading and trailing whitespace is to be trimmed prior to integration.
            Returns:
            Boolean value representing if the value is a string.
            */
            is: function isStr(s, bDisallowNullString, bTrimWhitespace) {
                return (
                    (typeof s === 'string' || s instanceof String) &&
                    (!bDisallowNullString || s !== '') &&
                    (!bTrimWhitespace || core.type.str.mk(s).trim() !== '')
                );
            }, //# str.is

            /*
            Function: mk
            Safely forces the passed value into a string.
            Parameters:
            x - The varient to interrogate.
            sDefault - The default value to return if casting fails.
            Returns:
            String representing the passed value.
            */
            mk: function (s, sDefault) {
                var sS = s + "";
    
                return (s && sS ?
                    sS :
                    (arguments.length > 1 ? sDefault : "")
                );
            } //# str.mk
        }; //# core.type.str


        type.fn = {
            /*
            Function: is
            Determines if the passed value is a function.
            Parameters:
            f - The varient to interrogate.
            Returns:
            Boolean value representing if the value is a function.
            */
            is: function isFn(f) {
                return (_Object_prototype_toString.call(f) === '[object Function]');
            }, //# fn.is

            //# 
            mk: function (f, fnDefault) {
                var fnReturnVal = (arguments.length > 1 ? fnDefault : core.type.fn.noop),
                    vResolved = (core.type.str.is(f) ? core.resolve(_window, f) : null)
                ;

                //# If the passed f .is a .fn, reset our fnReturnVal to it
                if (core.type.fn.is(f)) {
                    fnReturnVal = f;
                }
                //# Else if the passed f .is a .str and we vResolved it to a .fn, reset our fnReturnVal to it
                else if (core.type.fn.is(vResolved)) {
                    fnReturnVal = vResolved;
                }

                return fnReturnVal;
            } //# fn.mk
        }; //# core.type.fn

        type.dom = {
            /*
            Function: is
            Determines if the passed value is a DOM reference.
            Parameters:
            x - The varient to interrogate.
            bAllowSelector - Boolean value representing if CSS selectors that successfully resolve to DOM elements are to be included in the test.
            Returns:
            Boolean value representing if the value is a DOM reference.
            */
            is: function isDom(x, bAllowSelector) {
                //# If we are to bAllowSelector, attempt to convert x to a DOM element if its .is.str
                x = (bAllowSelector && core.type.str.is(x, true) ? _document_querySelector(x) : x);

                return (
                    x && //# core.type.is.native(x) &&
                    core.type.str.is(x.tagName) &&
                    x.tagName !== "" &&
                    //core.type.fn.is(x.cloneNode) &&
                    core.type.fn.is(x.getAttribute)
                );
            }, //# dom.is

            /*
            Function: mk
            Safely parses the passed value into a DOM element.
            Parameters:
            x - The varient to interrogate. Can be a CSS Selector (used by document.querySelector), jQuery reference (x[0] will be returned), HTML string defining a single root element or DOM element.
            _default - The default DOM element to return if casting fails.
            Returns:
            DOM element represented by the passed value, or _default if interrogation failed.
            */
            mk: function (x, _default) {
                var _div = _document.createElement("div"),
                    _returnVal = (arguments.length > 1 ? _default : _div)
                ;

                //#
                if (core.type.str.is(x)) {
                    if (core.type.selector.is(x)) {
                        _returnVal = _document_querySelector(x);
                    }
                    //# Else try to parse the passed .is.str as HTML
                    else {
                        _div.innerHTML = x;

                        //# If we were able to parse a single non-#text node, set it into our _returnVal
                        //# TODO: Make testing more betterer
                        if (_div.childNodes.length <= 2 && _div.childNodes[0].nodeType !== 3) {
                            _returnVal = _div.childNodes[0];
                        }
                        //# Else if our _returnVal was defaulted to the _div above, reset the _div's .innerHTML
                        else {
                            _div.innerHTML = "";
                        }
                    }
                }
                else if (core.type.dom.is(x)) {
                    _returnVal = x;
                }
                else if (x && x[0] && core.type.dom.is(x[0])) {
                    _returnVal = x[0];
                }

                return _returnVal;
            } //# dom.mk
        }; //# core.type.dom

        type.arr = {
            /*
            Function: is
            Determines if the passed value is an array.
            Parameters:
            a - The varient to interrogate.
            bDisallow0Length - Boolean value representing if zero length arrays are to be ignored.
            Returns:
            Boolean value representing if the value is an array.
            */
            is: function isArr(a, bDisallow0Length) {
                return (_Object_prototype_toString.call(a) === '[object Array]' &&
                    (!bDisallow0Length || a.length > 0)
                );
            }, //# arr.is

            /*
            Function: mk
            Safely forces the passed array or list reference into an array.
            Parameters:
            a - The varient to interrogate.
            a_vDefault - The default value to return if casting fails.
            Returns:
            Array representing the updated array reference.
            */
            mk: function (a, a_vDefault) {
                //# Preconvert a list reference into an array
                a = (core.type.list.is(a) ? Array.prototype.slice.call(a) : a);

                return (core.type.arr.is(a) ?
                    a :
                    (arguments.length > 1 ? a_vDefault : [])
                );
            } //# arr.mk
        }; //# core.type.arr

        //#     NOTE: No .mk
        type.list = {
            /*
            Function: is
            Determines if the passed value is a list type (e.g. HTMLCollection|NodeList|Arguments|Object with Object to support <IE9).
            Parameters:
            n - The varient to interrogate.
            bIncludeObject - Boolean value representing if Objects are to be included in the test (to support <IE9).
            Returns:
            Boolean value representing if the value is a list type.
            */
            is: function isList(n, bIncludeObject) {
                var reTest = (bIncludeObject ?
                    /^\[object (HTMLCollection|NodeList|Arguments|Object)\]$/ :
                    /^\[object (HTMLCollection|NodeList|Arguments)\]$/
                );

                return (
                    core.type.obj.is(n) &&
                    core.type.num.is(n.length) &&
                    reTest.test(Object.prototype.toString.call(n))
                );
            } //# list.is

            //mk: 
        }; //# core.type.list

        type.obj = {
            /*
            Function: is
            Determines if the passed value is an object.
            Parameters:
            o - The varient to interrogate.
            oOptions - Object representing the following optional settings:
                oOptions.allowFn - Boolean value representing if functions are to be allowed.
                oOptions.nonEmpty - Boolean value representing if empty objects are to be ignored.
                oOptions.requiredKeys - Array of Strings listing the keys required to be present in the object.
            Returns:
            Boolean value representing if the value is an object.
            */
            is: function isObj(o, oOptions) {
                var i,
                    oSettings = (oOptions && oOptions === Object(oOptions) ? oOptions : {}),
                    a_sRequiredKeys = oSettings.requiredKeys,
                    bDisallowEmptyObject = !!oSettings.nonEmpty,
                    bAllowFn = !!oSettings.allowFn,
                    bReturnVal = !!(o && o === Object(o) && (bAllowFn || !core.type.fn.is(o)))
                ;
    
                //# If the passed o(bject) is an Object
                if (bReturnVal) {
                    //# Reset our bReturnVal based on bDisallowEmptyObject
                    bReturnVal = (!bDisallowEmptyObject || Object.getOwnPropertyNames(o).length !== 0);
    
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
            }, //# obj.is

            /*
            Function: mk
            Safely forces the passed object reference into an object containing the passed path optionally set to the optional value.
            Parameters:
            o - The varient to interrogate.
            sPath - String representing the path to the property.
            (Optional) vValue - Varient representing the value to set the referenced property to.
            Returns:
            Object representing the updated object reference.
            */
            mk: function (o, oDefault) {
                var bFnToObj = (core.type.fn.is(o) && core.type.obj.is(o, { nonEmpty: true, allowFn: true }));

                //# If the passed o(bject) .is.fn and the .fn .hasOwnProperty's, .extend those .properties into a new object to return to the caller
                //#     NOTE: This has the effect of forcing the .hasOwnProperty .properties set on a .is.fn to be accessable as a standard object (but non-reference types of course get disconnected from the original object/function reference)
                if (bFnToObj) {
                    o = core.extend({}, o);
                }

                return (bFnToObj || core.type.obj.is(o) ?
                    o :
                    (arguments.length > 1 ? oDefault : {})
                );
            }, //# obj.mk
        }; //# core.type.obj


        type.symbol = function () {
            var oSymbol = {
                is: function isSymbol(x) {
                    return (oSymbol.exists() && typeof x === 'symbol');
                }, //# symbol.is

                exists: function () {
                    return core.type.fn.is(_window.Symbol);
                } //# symbol.exists
            };

            //# If we have a Symbol type, add in the .mk function
            //if (core.type.fn.is(_window.Symbol)) {
                oSymbol.mk = function (x, xDefault) {
                    return (core.type.symbol.is(x) ?
                        x :
                        (arguments.length === 1 ? _window.Symbol() : xDefault)
                    );
                }; //# symbol.mk
            //}

            return oSymbol;
        }(); //# core.type.symbol

        //####

        type.ish = oTypeIsh;
        oTypeIsh.is = function isIsh(o) {
            return (arguments.length === 0 || o === core);
        }; //# core.type.ish.is


        return type;
    }(); //# core.type.*.is|mk


    /** ################################################################################################
     * @namespace core.type
     * @desc Collection of variable Type-based functionality (required non-`is`/`mk` core features).
     * @requires core.type.arr.is, core.type.obj.is
     * @todo ?core.type.obj.rm
    ################################################################################################# */
    core.extend(core.type, {
        arr: {
            rm: function (a_vArray, vTargets, vReplacements) {
                var a_vReplacements, iTargetIndex, i,
                    iTotalReplacements = -1,
                    bHaveReplacements = (arguments.length === 3),
                    a_vTargets = (core.type.arr.is(vTargets) ? vTargets : [vTargets]),
                    bReturnVal = false
                ;

                //# If the passed a_vArray .is.arr, set our a_vReplacements and iTotalReplacements if we bHaveReplacements
                if (core.type.arr.is(a_vArray, true)) {
                    if (bHaveReplacements) {
                        a_vReplacements = (core.type.arr.is(vReplacements) ? vReplacements : [vReplacements]);
                        iTotalReplacements = a_vReplacements.length;
                    }

                    //# Traverse our a_vTargets, determining the iTargetIndex of the current a_vTargets
                    for (i = 0; i < a_vTargets.length; i++) {
                        iTargetIndex = a_vArray.indexOf(a_vTargets[i]);

                        //# If we found the iTargetIndex, flip our bReturnVal
                        if (iTargetIndex > -1) {
                            bReturnVal = true;

                            //# If we bHaveReplacements and enough iTotalReplacements, replace the iTargetIndex with its related a_vReplacements
                            if (bHaveReplacements && i < iTotalReplacements) {
                                a_vArray[iTargetIndex] = a_vReplacements[i];
                            }
                            //# Else we need to .splice the iTargetIndex from the a_vArray
                            else {
                                a_vArray.splice(iTargetIndex, 1);
                            }
                        }
                    }
                }

                return bReturnVal;
            } //# type.arr.rm
        }, //# core.type.arr.*

        obj: {
            //rm: 
            
            ownKeys: function(oSource) {
                var i,
                    a_sReturnVal /* = _undefined */
                ;

                //# If the passed oSource .is.obj, collect its .keys into our a_sReturnVal
                if (core.type.obj.is(oSource)) {
                    a_sReturnVal = Object.keys(oSource);

                    //# Traverse the collected oCource .keys from back to front (so we can .splice them out as we go)
                    for (i = a_sReturnVal.length; i > 0; i--) {
                        //# If the current .keys isn't a .hasOwnProperty, .splice it from our a_sReturnVal
                        if (!oSource.hasOwnProperty(a_sReturnVal[i])) {
                            a_sReturnVal.splice(i, 1);
                        }
                    }
                }

                return a_sReturnVal;
            }, //# type.obj.ownKeys
        
            //#
            get: function (oObject, sKey) {
                var sCurrentKey,
                    vReturnVal /* = undefined */
                ;

                //# If the called passed in a valid oObject, .toLowerCase our sKey
                if (core.type.obj.is(oObject)) {
                    sKey = core.type.str.mk(sKey).toLowerCase();

                    //# Traverse the oObject, returning the first matching .toLowerCase'd sCurrentKey
                    for (sCurrentKey in oObject) {
                        if (sCurrentKey.toLowerCase() === sKey) {
                            vReturnVal = oObject[sCurrentKey];
                            break;
                        }
                    }
                }

                return vReturnVal;
            } //# type.obj.get
        } //# core.type.obj.*
    }); //# core.type.*


    /** ################################################################################################
     * @namespace core.type.fn (Function)
     * @desc Collection of Function management functionality.
     * @requires core.type.list.is, core.type.fn.is, core.type.arr.is
     * @requires core.type.arr.mk, core.type.obj.mk
    ################################################################################################# */
    core.extend(core.type, function () {
        //# Converts the passed argument from an arguments instance, array or single variable into an Array fit to pass to fn.apply().
        function convert(vArguments) {
            //return Array.prototype.slice.call(vArguments);

            //# <ES5 Support for array-like objects
            //#     See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#Browser_compatibility
            return core.type.arr.mk(
                vArguments, (vArguments === _undefined ? [] : [vArguments])
            )
        } //# convert

        //# Processes the passed options into an Object for use in core.type.fn.*
        function processOptions(vThis, oOptions, oDefaults, iWait) {
            //# 
            return core.extend(
                { context: vThis },
                oDefaults,
                oOptions,
                (iWait !== _undefined && core.type.obj.is(oOptions) ? {
                    wait: core.type.int.mk(oOptions.wait, iWait)
                } : null)
            );
        } //# processOptions


        return {
            fn: {
                /*
                Function: convert
                Converts the passed argument from an arguments instance, array or single variable into an Array fit to pass to fn.apply().
                vArguments - Varient representing the argument(s) to convert into an array
                Returns:
                Array representing the passed vArguments fit to pass to fn.apply().
                */
                convert: convert,


                /*
                Function: noop
                Null Function with no arguments or return for use when a valid function reference is required but no action is necessary
                */
                noop: function () {},
        
        
                /*
                Function: call
                Safely calls the passed function, returning the default value if the passed function is invalid.
                Parameters:
                fn - Function to attempt to call.
                vArguments - Varient representing the argument(s) to pass into the passed function
                vContext - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                //oOptions - Object representing the desired options:
                //    oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                //    oOptions.default - Varient representing the default value to return if an error occurs. Default: `undefined`.
                Returns:
                Varient representing the result of the passed function.
                */ //# TODO: function (fn, vArguments, oOptions)
                call: function (fn, vContext, vArguments) {
                    var vReturnVal;

                    //# 
                    //oOptions = processOptions(this, oOptions, {
                    //    args: _undefined
                    //    default: _undefined
                    //} /*, _undefined*/);
                    //vReturnVal = oOptions.default;

                    //# 
                    //if (core.type.fn.is(fn)) {
                    //    vReturnVal = fn.apply(oOptions.context, oOptions.args);
                    //}

                    //# 
                    if (core.type.fn.is(fn)) {
                        switch (arguments.length) {
                            case 1: {
                                vReturnVal = fn();
                                break;
                            }
                            case 2: {
                                //vReturnVal = fn.apply(this, convert(vArguments));
                                vReturnVal = fn.apply(vContext);
                                break;
                            }
                            default: {
                                vReturnVal = fn.apply(vContext, convert(vArguments));
                                //break;
                            }
                        }
                    }

                    return vReturnVal;
                }, //# fn.call


                /*
                Function: once
                (Factory) Ensure a function is called only once.
                Parameters:
                fn - Function to call once.
                oOptions - Object representing the desired options:
                    oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                    oOptions.rereturn - Boolean value representing if subsiquent calls should return the first return value (default: true).
                Returns:
                Function that returns the Varient representing the result of the passed function.
                About:
                Usage -
                > var canOnlyFireOnce = once(function () {
                >     console.log('Fired!');
                > });
                > //...
                > canOnlyFireOnce();
                About:
                From: http://davidwalsh.name/essential-javascript-functions
                */
                once: function (fn, oOptions) {
                    var vReturnVal;

                    //# 
                    oOptions = processOptions(this, oOptions, {
                        rereturn: true
                    } /*, _undefined*/);

                    return function (/*arguments*/) {
                        if (core.type.fn.is(fn)) {
                            vReturnVal = fn.apply(oOptions.context, convert(arguments));
                            fn = _null;
                        }
        
                        return (oOptions.rereturn ? vReturnVal : _undefined);
                    };
                }, //# fn.once


                /*
                Function: tryCatch
                (Factory) Safely calls the passed function, returning the default value if an error occurs during execution.
                Parameters:
                fn - Function to call.
                oOptions - Object representing the desired options:
                    oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                    oOptions.default - Varient representing the default value to return if an error occurs. Default: `undefined`.
                    oOptions.returnObj - Boolean value representing if an Object is to be returned representing the result and error. Default `false`.
                Returns:
                Function that returns the Varient representing the result of the passed function.
                */
                tryCatch: function (fn, oOptions) {
                    //#  WAS: function (fn, vContext, vArguments, vDefault, bReturnObj)
                    var oReturnVal;

                    //# 
                    oOptions = processOptions(this, oOptions, {
                        //default: _undefined,
                        returnObj: false
                    } /*, _undefined*/);
                    oReturnVal = {
                        result: oOptions.default,
                        error: _null
                    };

                    //# 
                    return function (/*arguments*/) {
                        try {
                            oReturnVal.result = fn.apply(oOptions.context, convert(arguments));
                        } catch (e) {
                            oReturnVal.error = e;
                        }
    
                        return (oOptions.returnObj ? oReturnVal : oReturnVal.result);
                    };
                }, //# fn.tryCatch


                /*
                Function: throttle
                (Factory) Enforces a maximum number of times a function can be called over time.
                Parameters:
                fn - Function to call.
                oOptions - Object representing the desired options:
                    oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                    oOptions.wait - Minimum number of miliseconds between each call (default: 500).
                    oOptions.leading - The throttled function will run as much as possible, without ever going more than once per wait duration. If you’d like to disable the execution on the leading edge, pass {leading: false}.
                    oOptions.trailing - The throttled function will run as much as possible, without ever going more than once per wait duration. If you’d like to disable the execution on the trailing edge, pass {trailing: false}.
                Returns:
                Function that returns the Varient representing the result of the passed function.
                About:
                Based on http://underscorejs.org/docs/underscore.html
                Returns a function, that, when invoked, will only be triggered at most once during a given window of time. Normally, the throttled function will run as much as it can, without ever going more than once per wait duration; but if you’d like to disable the execution on the leading edge, pass {leading: false}. To disable execution on the trailing edge, ditto.
                */
                throttle: function (fn, oOptions) {
                    //#  WAS: function (fn, iWait, oOptions)
                    var context, args, result,
                        timeout = _null,
                        previous = 0,
                        later = function () {
                            previous = oOptions.leading === false ? 0 : _Date_now();
                            timeout = _null;
                            result = fn.apply(context, args);
                            if (!timeout) context = args = _null;
                        }
                    ;
                    
                    //# 
                    oOptions = processOptions(this, oOptions, {
                        leading: true,
                        trailing: false
                    }, 500);

                    return function (/*arguments*/) {
                        var remaining,
                            now = _Date_now()
                        ;
                        if (!previous && oOptions.leading === false) previous = now;
                        remaining = oOptions.wait - (now - previous);
                        context = oOptions.context;
                        args = convert(arguments);
                        if (remaining <= 0 || remaining > oOptions.wait) {
                            if (timeout) {
                                clearTimeout(timeout);
                                timeout = _null;
                            }
                            previous = now;
                            result = fn.apply(context, args);
                            if (!timeout) context = args = _null;
                        } else if (!timeout && oOptions.trailing !== false) {
                            timeout = setTimeout(later, remaining);
                        }
                        return result;
                    };
                }, //# fn.throttle
        
        
                /*
                Function: debounce
                (Factory) Enforces that a function cannot be called again until a certain amount of time has passed without it being called.
                Parameters:
                fn - Function to call.
                oOptions - Object representing the desired options:
                    oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                    oOptions.wait - Minimum number of miliseconds between each call (default: 500).
                    oOptions.immediate - Execute the function the first time without waiting.
                Returns:
                Function that returns the Varient representing the result of the passed function.
                About:
                Usage -
                >    var myEfficientFn = debounce(function () {
                >        // All the taxing stuff you do
                >    }, 250);
                >    window.addEventListener('resize', myEfficientFn);
                Based on http://underscorejs.org/docs/underscore.html
                */
                debounce: function (fn, oOptions) {
                    //#  WAS: function (fn, iWait, iImmediate)
                    var timeout, args, context, timestamp, result,
                        later = function () {
                            var last = _Date_now() - timestamp;
        
                            if (last < oOptions.wait && last >= 0) {
                                timeout = setTimeout(later, oOptions.wait - last);
                            } else {
                                timeout = _null;
                                if (!oOptions.immediate) {
                                    result = fn.apply(context, args);
                                    if (!timeout) context = args = _null;
                                }
                            }
                        }
                    ;

                    //# 
                    oOptions = processOptions(this, oOptions, {
                        immediate: false
                    }, 500);
        
                    return function (/*arguments*/) {
                        var callNow = oOptions.immediate && !timeout;
                        context = oOptions.context;
                        args = convert(arguments);
                        timestamp = _Date_now();
                        if (!timeout) timeout = setTimeout(later, oOptions.wait);
                        if (callNow) {
                            result = fn.apply(context, args);
                            context = args = _null;
                        }
        
                        return result;
                    };
                }, //# fn.debounce
        
        
                /*
                Function: poll
                (Factory) Calls the referenced function based on the wait interval until it returns truthy.
                Parameters:
                fn - Function called each wait time returning truthy. On a truthy return value, oOptions.onsuccess is called (if any).
                oOptions - Object representing the desired options:
                    oOptions.context - Varient representing the Javascript context (e.g. `this`) in which to call the function.
                    oOptions.wait - Minimum number of miliseconds between each poll attempt (default: 500).
                    oOptions.timeout - Maximum number of milliseconds to do the polling (Default: 2000).
                    oOptions.onsuccess - Function to call on success.
                    oOptions.onfailure - Function to call on failure.
                Returns:
                Function that initiates the polling process.
                About:
                From: http://davidwalsh.name/essential-javascript-functions
                */
                poll: function (fn, oOptions) {
                    //#  WAS: function (vTest, fnCallback, fnErrback, iTimeout, iInterval, vArgument)
                    var _a, iEndTime; // = Number(new Date()) + (iTimeout || 2000);

                    //# 
                    oOptions = processOptions(this, oOptions, {
                        //ontimeout: core.type.fn.noop,
                        //onsuccess: core.type.fn.noop
                    }, 100);
                    oOptions.timeout = core.type.int.mk(oOptions.timeout, 2000);

                    return function (/*arguments*/) {
                        //# 
                        _a = convert(arguments);
                        iEndTime = Date.now() + oOptions.timeout;
            
                        //# 
                        //#     NOTE: We need a named function below as we recurse for each .wait interval
                        !function p() {
                            //# If the condition is met, we can .call our .onsuccess (if any)
                            if (core.type.fn.call(fn, oOptions.context, _a)) {
                                core.type.fn.call(oOptions.onsuccess, oOptions.context, _a);
                            }
                            //# Else if the condition isn't met but the timeout hasn't elapsed, recurse
                            else if (Date.now() < iEndTime) { // Number(new Date())
                                setTimeout(p, oOptions.wait);
                            }
                            //# Else we've failed and timedout, so .call our .onfailure (if any)
                            else {
                                core.type.fn.call(oOptions.onfailure, oOptions.context, _a);
                                //fnErrback(new Error('timed out for ' + fnCallback + ': ' + arguments), vArgument);
                            }
                        }();
                    };
                } //# fn.poll
            }
        };
    }()); //# core.type.fn


    /** ################################################################################################
     * @class core.require
     * @classdesc Collection of RequireJS-based functionality.
     * @requires core.extend
     * @requires core.type.arr.is, core.type.fn.is, core.type.str.is, core.type.obj.is
     * @requires core.type.obj.mk, core.type.fn.mk
     * @requires core.type.fn.call, core.io.event.fire
    ################################################################################################# */
    !function (requireJs) {
        var oRequireOptions = { //# http://requirejs.org/docs/api.html#config
                //onappend: function (_script) {},  //# NOTE: Feature not present in requireJs
                onerror: function (_script) {       //# NOTE: Feature not present in requireJs
                    var oConfig = core.type.json.mk(_script.getAttribute("config"));
                    core.io.console.err("Unable to include `" + oConfig.src + "`.");
                },
                waitSeconds: 7,
                //baseUrl: "",
                //urlArgs: "",
                //paths: [],
                //bundles: {}
            }
        ;

        //# 
        //#     NOTE: The third argument `oOptions` is a feature not present in requireJs
        function requireJsLite(a_sScripts, fnCallback, oOptions) {
            var sBaseUrl, sUrlArgs, i,
                a_oScripts = [],
                iCounter = a_sScripts.length,
                bAllLoaded = true
            ;

            //# 
            oOptions = core.extend({}, oRequireOptions, oOptions);
            sBaseUrl = oOptions.baseUrl || "";
            sUrlArgs = oOptions.urlArgs || "";

            //# 
            //#     NOTE: This function is used purely to provide a scope for each a_oScripts' _script and iTimeout so the events can handle them properly
            //#     NOTE: This function has side-effects on bAllLoaded and iCounter and references sBaseUrl
            function processScript(sSrc) {
                var _script = _document.createElement('script'),
                    fnOnError = function () {
                        bAllLoaded = false;
                        fnOnload(true);
                    },
                    iTimeout = setTimeout(fnOnError, oOptions.waitSeconds * 1000),
                    fnOnload = function (bError) {  //# NOTE: bError comes across as an oEvent .onload and .onerror
                        //# clearTimeout (if any) and .push the current a_oScripts into the array
                        //#      NOTE: As per MDN, clearTimeout(undefined) does nothing, so we don't bother with an if() below
                        clearTimeout(iTimeout);
                        a_oScripts.push({
                            dom: _script,
                            loaded: (bError !== true)
                        });

                        //# 
                        if (bError === true) {
                            core.type.fn.call(oOptions.onerror, _null, [_script]);
                        }

                        //# If we have loaded all of our a_oScripts, .call our fnCallback
                        if (--iCounter < 1) {
                            core.type.fn.call(fnCallback, _null, [a_oScripts, bAllLoaded]);
                        }
                    }
                ;

                //# 
                _script.onload = fnOnload;
                _script.onerror = fnOnError;

                //# <IE6thru9Support>
                //# If our _script has .readyState defined, we need to monitor .onreadystatechange
                //#     NOTE: Between fnIE6thru9Factory and `_script.onreadystatechange` below, it costs us 9 lines of code to support IE v6-v9
                //#     Based on: https://www.html5rocks.com/en/tutorials/speed/script-loading/ and https://www.nczonline.net/blog/2009/07/28/the-best-way-to-load-external-javascript/
                _script.onreadystatechange = (_script.readyState ?
                    function () {
                        if (_script.readyState == "loaded" || _script.readyState == "complete") {
                            _script.onreadystatechange = _null;
                            fnOnload(/*false*/);
                        }
                    } :
                    _null
                );
                //# </IE6thru9Support>

                //# .setAttribute's then append the _script to our _head
                //#     NOTE: We set the src after the events because some browsers (IE) start loading the script as soon as the src is set
                _script.setAttribute('config', JSON.stringify({
                    src: sSrc,
                    baseUrl: sBaseUrl,
                    urlArgs: sUrlArgs
                }));
                _script.setAttribute('type', "text/javascript");
                _script.setAttribute('src', sBaseUrl + sSrc + sUrlArgs);
                _head.appendChild(_script);

                //# Call the RequireJs non-feature .onappend now that the _script has been .appendChild'd
                core.type.fn.call(oOptions.onappend, _null, [_script]);
            } //# processScript


            //# Traverse the a_sScripts, creating each _script and setTimeout'ing as we go
            if (core.type.arr.is(a_sScripts)) {
                for (i = 0; i < a_sScripts.length; i++) {
                    //# Process the current a_sScripts' src
                    //#     NOTE: We call out to a function here to give us a scope to store the _script and iTimeout references in for the events
                    processScript(a_sScripts[i]);
                }
            }
        } //# requireJsLite
        requireJsLite.config = function (oOptions) {
            return core.extend(oRequireOptions, oOptions);
        }; //# requireJsLite.config

        //# Ensure the passed requireJs is a function (defaulting to the above-defined requireJsLite), then ensure our oOptions' are loaded into the .config
        requireJs = core.type.fn.mk(requireJs, requireJsLite);
        //requireJs.config(oOptions);

        //# 
        core.require = core.extend(requireJs, {
            lite: (requireJs === requireJsLite),

            //# Soft-configured version of requireJs's bundles/shim
            //#     NOTE: This allows us to dynamicially define any "bundles" we require at runtime, allowing us to load scripts in the required order
            queue: function (a_vModules, fnCallback) {
                var vCurrent,
                    i = 0,
                    iLength = core.type.int.mk(core.resolve(a_vModules, "length"), 0),
                    bAllLoaded = (iLength > 0),
                    a_oResults = []
                ;

                //# 
                function doLoad() {
                    vCurrent = a_vModules[i++];
                    
                    //# Call requireJs to load the vCurrent a_vModules, copying its returned arguments into vCurrent on callback (code-golf)
                    requireJs(core.type.arr.mk(vCurrent, [vCurrent]), function (a_oScripts, bEntryAllLoaded) {
                        //# 
                        if (requireJs.lite) {
                            a_oResults.push({
                                dom: a_oScripts,
                                loaded: bEntryAllLoaded
                            });
                            if (bEntryAllLoaded === false) {
                                bAllLoaded = false;
                            }
                        }
    
                        //# Recurse if we still have a_vModules to process, else call loaded
                        (i < iLength ? doLoad() : loaded(arguments));
                    });
                } //# doLoad

                //# 
                function loaded(_a) {
                    //# Run our fnCallback with the above collected a_oResults (if any)
                    core.type.fn.call(fnCallback, _null,
                        (requireJs.lite ?
                            [a_oResults, bAllLoaded] :
                            _a
                        )
                    );
                } //# loaded


                //# If the caller passed in valid a_vModules, kick off doLoad else call loaded to return a null result to the fnCallback
                (bAllLoaded ? doLoad() : loaded());
            } //# queue
        }); //# core.require

        //# 
        core.extend(oTypeIsh, {
            'import': function (a_sImport, oOptions) {
                var i,
                    a_sUrls = []
                ;
    
                //# If we have scripts to a_sImport
                //# <script type="text/javascript" src="js/ish/ish.js" ish='{ "target": "$z", "plugins": { "import": ["lib.ui","app.notes","app.ui"], "baseUrl": "js/ish/", "cache": false } }'></script>
                if (core.type.arr.is(a_sImport, true)) {
                    //# Traverse each script to a_sImport, creating a new SCRIPT tag for each
                    for (i = 0; i < a_sImport.length; i++) {
                        a_sUrls.push(a_sImport[i] + ".js");
                    }
    
                    //# 
                    oOptions = core.extend({}, oTypeIsh.options.plugins, oOptions);
                    core.require.config({
                        waitSeconds: 7,
                        baseUrl: oOptions.baseUrl,
                        urlArgs: (oOptions.cache === false ?
                            "?nocache=" + Date.now() : 
                            ""
                        ),
                        onappend: function (_script) {
                            _script.setAttribute("importedBy", oOptions.importedBy || "type.ish.import");
                        }
                    });
                    core.require.queue(a_sUrls, function (a_oResults) {
                        core.io.event.fire("pluginsLoaded", a_oResults);
                    });
                }
            } //# type.ish.import
        }); //# core.type.ish.import
    }(_window.require); //# core.require


    /** ################################################################################################
     * @namespace core.io
     * @desc Input/Output-based functionality.
    ################################################################################################# */
    core.io = {
        /*
        ####################################################################################################
        Class: core.io.console
        User reporting logic.
        Requires:
        <core.resolve>, 
        <core.type.fn.call>
        ####################################################################################################
        */
        console: function () {
            function doCall(sMethod, _a) {
                core.type.fn.call(core.resolve(_window, ["console", sMethod]), null, _a);
            } //# doCall

            return {
                log: function (/*arguments*/) {
                    doCall("log", arguments);
                }, //# io.console.log

                warn: function (/*arguments*/) {
                    doCall("warn", arguments);
                }, //# io.console.warn

                err: function (/*arguments*/) {
                    doCall("error", arguments);
                }, //# io.console.err
            };
        }(), //# core.io.console


        /*
        ####################################################################################################
        Class: core.io.event
        Event logic.
        Requires:
        <core.extend>, <core.resolve>, 
        <core.type.arr.is>, <core.type.fn.is>, 
        <core.type.fn.call>, <core.type.arr.rm>, <core.type.obj.ownKeys>
        ####################################################################################################
        */
        event: function () {
            var oEvent,
                oData = {}
            ;

            //#
            function unwatch(sEvent, fnCallback) {
                return core.type.arr.rm(oData[sEvent], fnCallback);
            } //# unwatch

            //#
            function fire(sEvent /*, ..arguments*/) {
                var i,
                    a_fnEvents = oData[sEvent],
                    bReturnVal = core.type.arr.is(a_fnEvents, true)
                ;

                //# If the passed sEvent is a .registered event
                if (!bReturnVal) {
                    a_fnEvents = oData[sEvent] = [];
                }

                //# Set the .last arguments for this sEvent
                //#     NOTE: We do this here so if a .watch is called after this sEvent has .fired, it can be instantly called with the .last arguments lists
                a_fnEvents.last = arguments;

                //# Traverse the a_fnEvents, throwing each into doCallback while adding its returned integer to our i(terator)
                //#     NOTE: doCallback returns -1 if we are to unwatch the current a_fnEvents which in turn removes it from the array
                for (i = 0; i < a_fnEvents.length; i++) {
                    i += doCallback(sEvent, a_fnEvents[i], arguments /*, false*/);
                }

                //# Set the .fired property on the array to true
                //#     NOTE: We do this after the for loop so that doCallback'd a_fnEvents can know if this is the first invocation or nots
                a_fnEvents.fired = true;

                return bReturnVal;
            } //# fire

            //#
            function doCallback(sEvent, fnCallback, _arguments) {
                var iReturnVal = 0;

                //#
                if (unwatch === core.type.fn.call(fnCallback, this, _arguments)) { //# TODO: Refactor `this` to `this || _null`?
                    unwatch(sEvent, fnCallback);
                    iReturnVal--;
                }

                return iReturnVal;
            } //# doCallback


            //#
            oEvent = core.extend(fire, {
                fire: fire,         //# (sEvent, ..arguments)
                unwatch: unwatch,   //# (sEvent, fnCallback)

                //#
                registered: function () {
                    return core.type.obj.ownKeys(oData);
                }, //# registered

                //#
                fired: function (sEvent) {
                    return (core.resolve(oData, [sEvent, "fired"]) === true);
                }, //# fired

                //#
                watch: function (sEvent, fnCallback) {
                    var bReturnVal = core.type.fn.is(fnCallback);

                    //#
                    if (fnCallback) {
                        (oData[sEvent] = oData[sEvent] || [])
                            .push(fnCallback)
                        ;

                        //# If the sEvent has already been .fired prior to this .watch, .doCallback now
                        if (oData[sEvent].fired) {
                            doCallback(sEvent, fnCallback, oData[sEvent].last);
                        }
                    }

                    return bReturnVal;
                } //# watch
            });

            return oEvent;
        }() //# core.io.event
    }; //# core.io


    /** ################################################################################################
     * @namespace core.ui
     * @desc Stub-object for User Interface-based functionality.
    ################################################################################################# */
    core.ui = {
        /*
        //############################################################
        //# Determines if the referenced elements overlap in the 2D plane.
        //#    NOTE: This function really only needs to run correctly under those browsers that have Z-Index issues with certian elements, so true cross-platform compatibility is not really required for this function
        //############################################################
        //# Last Updated: April 19, 2006
        this.Overlap = function(oElement1, oElement2) {
            var bReturn = false;
            var iX1, iX2, iA1, iA2, iY1, iY2, iB1, iB2;

                //#### Set the Y (vertical) coords
            iB1 = this.Top(oElement1);
            iB2 = iB1 + this.Height(oElement1);
            iY1 = this.Top(oElement2);
            iY2 = iY1 + this.Height(oElement2);

                //#### If the elements seem to be in the way verticially
            if ((iY1 <= iB1 && iY2 > iB1) || (iY1 >= iB1 && iY1 < iB2)) {
                    //#### Set the X (horozontal) coords
                iA1 = this.Left(oElement1);
                iA2 = iA1 + this.Width(oElement1);
                iX1 = this.Left(oElement2);
                iX2 = iX1 + this.Width(oElement2);

                    //#### If the passed elements also overlap horozontally, flip bReturn to true
                if ((iX1 <= iA1 && iX2 > iA1) || (iX1 >= iA1 && iX1 < iA2)) {
                    bReturn = true;
                }
            }

                //#### Return the above determined bReturn to the caller
            return bReturn;
        };*/
    }; //# core.ui


    /** ################################################################################################
     * @namespace core.app
     * @desc Stub-object for Application-based functionality.
    ################################################################################################# */
    core.app = oInterfaces.pub(); //# core.app


    /** ################################################################################################
     * @namespace core.lib
     * @desc Stub-object for External Library-based functionality.
     * @requires core.extend
     * @requires core.type.fn.is
    ################################################################################################# */
    core.lib = function () {
        var fnSyncer;

        return core.extend(oInterfaces.pub(), {
            sync: core.extend(
                function (fnCallback, bReturnResult) {
                    var vResult,
                        bReturnVal = core.type.fn.is(fnCallback) && core.type.fn.is(fnSyncer)
                    ;

                    //# If the caller passed in a valid fnCallback and we have a fnSyncer to call, collect its vResult
                    if (bReturnVal) {
                        vResult = fnSyncer(fnCallback);
                    }

                    //# If we made a call above and the caller wants to bReturnResult, return the vResult, else return our bReturnVal
                    return (bReturnVal && bReturnResult ? vResult : bReturnVal);
                }, {
                    register: function (fn) {
                        var bReturnVal = core.type.fn.is(fn);

                        //# 
                        if (bReturnVal) {
                            fnSyncer = fn;
                        }

                        return bReturnVal;
                    }
                }
            ) //# core.lib.sync
        });
    }(); //# core.lib


    //########


    /*
    ####################################################################################################
	Class: core.io.web
    Input/Output-based Web functionality.
    Requires:
    <core.resolve>, 
    <core.type.obj.is>, <core.type.str.is>, <core.type.fn.is>, <core.type.arr.is>, 
    <core.type.json.mk>, <core.type.str.mk>, <core.type.int.mk>, <core.type.obj.mk>, 
    <core.type.fn.call>, <core.type.arr.rm>, <core.type.obj.get>,
    ~<core.io.log.warn>
    ####################################################################################################
    */
    core.extend(core.io, {
        web: {
            //# Aliases to window.localstorage and window.sessionStorage with automajic stringification of non-string values
            storage: function () {
                var window_localStorage = _window.localStorage,         //# code-golf
                    window_sessionStorage = _window.sessionStorage      //# code-golf
                ;

                return {
                    set: function (sKey, vValue, bSession) {
                        var sValue = (core.type.obj.is(vValue) ? core.type.json.mk(vValue, vValue) : vValue);

                        (bSession ? window_sessionStorage : window_localStorage).setItem(sKey, sValue);
                    },
                    get: function (sKey, bSession) {
                        var sValue = (bSession ? window_sessionStorage : window_localStorage).getItem(sKey);

                        return core.type.json.mk(sValue, sValue);
                    },
                    rm: function (sKey, bSession) {
                        (bSession ? window_sessionStorage : window_localStorage).removeItem(sKey);
                    },
                    clear: function (bSession) {
                        (bSession ? window_sessionStorage : window_localStorage).clear();
                    }
                };
            }(), //# web.storage


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
            absoluteUrl: function () {
                var _a;

                return function (sUrl) {
                    _a = _a || _document.createElement('a');
                    _a.href = sUrl;
                    return _a.href;
                };
            }(), //# absoluteUrl


            /*
            ####################################################################################################
            Class: core.web.cookie
            Parses the referenced cookie and returns an object to manage it.
            Requires:
            <core.type.*.is>, <core.type.fn>
            ####################################################################################################
            */
            cookie: function () {
                var oOnUnload = {
                    $keys: []
                };

                //#
                /*
                _window.addEventListener("beforeunload", function (e) {
                    for (var i; i < oOnUnload.$keys.length; i++) {
                        core.type.fn.call(oOnUnload[oOnUnload.$keys[i]]);
                    }

                    (e || _window.event).returnValue = _null;
                    return _null;
                });
                */

                return function (sName, oDefault, oOptions) {
                    var oModel,
                        $returnValue = {
                            name: sName,
                            original: _undefined,
                            //options: oOptions,
                            data: _undefined,
                            isNew: true,
                            str: function () {
                                return JSON.stringify($returnValue.data);
                            }, //# str
                            set: function () {
                                var dExpires, sDomain, sPath, iMaxAge;

                                //# Ensure the .path and .maxAge are valid or defaulted to root and .seconds7Days respectivly
                                sPath = oOptions.path = core.type.str.mk(oOptions.path, "/");
                                sDomain = oOptions.domain = core.type.str.mk(oOptions.domain);
                                iMaxAge = oOptions.maxAge = core.type.int.mk(oOptions.maxAge, (1000 * 60 * 24 * 7));

                                //# If this is not a session cookie, setup dExpires
                                if (iMaxAge > 0) {
                                    dExpires = new Date();
                                    dExpires.setSeconds(dExpires.getSeconds() + iMaxAge);
                                }

                                //# .encodeURIComponent the .string, set the max-age and path and toss it into the .cookie collection
                                _document.cookie = sName + "=" + encodeURIComponent($returnValue.str()) +
                                    "; path=" + sPath +
                                    (iMaxAge > 0 ? "; max-age=" + iMaxAge : "") +
                                    (dExpires ? "; expires=" + dExpires.toUTCString() : "") +
                                    (sDomain ? '; domain=' + sDomain : "") +
                                "; ";

                                //# Flip .isNew to false (as its now present on the browser)
                                $returnValue.isNew = false;
                            }, //# set

                            rm: function () {
                                //# .encodeURIComponent the .string, set the max-age and path and toss it into the .cookie collection
                                //$returnValue.data = null;
                                delete oOnUnload[sName];
                                core.type.arr.rm(oOnUnload.$keys, sName);
                                _document.cookie = sName + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;" + " path=" + oOptions.path;
                                return true;
                            } //# rm
                        }
                    ;

                    //# Locates the document.cookie for the passed sName
                    //#     NOTE: This is placed in a function so that the a_sCookies array will be dropped after execution
                    function find() {
                        var i, j,
                            a_sCookies = _document.cookie.split(";")
                        ;

                        //# Loop thru the values in .cookie looking for the passed sName, setting $returnValue.original if it's found
                        for (i = 0; i < a_sCookies.length; i++) {
                            j = a_sCookies[i].indexOf("=");
                            if (sName === a_sCookies[i].substr(0, j).replace(/^\s+|\s+$/g, "")) {
                                $returnValue.original = decodeURIComponent(a_sCookies[i].substr(j + 1));

                                //oModel = core.type.json.mk($returnValue.original);
                                //oModel = core.type.fn.tryCatch(function() {
                                //    JSON.parse($returnValue.original);
                                //}, { default: {} })();

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

                    //# So long as we've not been explicitly told to not to, hook _window.onbeforeunload
                    /*
                    if (oOptions === true || core.type.obj.is(oOptions)) {
                        if (oOnUnload.$keys.indexOf(sName) === -1) {
                            oOnUnload.$keys.push(sName);
                            oOnUnload[sName] = function () {
                                $returnValue.set(oOptions.maxAge, oOptions.path, oOptions.domain);
                            };
                        }
                    }
                    */

                    //#
                    oOptions = core.type.obj.mk(oOptions);
                    $returnValue.options = oOptions;

                    //# If a seemingly valid sName was passed
                    if (!core.type.str.is(sName) || sName === "") {
                        throw (core.$path + ".cookie: A [String] value must be provided for the cookie name.");
                    }

                    //# If we can .find a current value, reset .isNew to false
                    if (find()) {
                        $returnValue.isNew = false;
                    }
                    //# Else this .isNew cookie, so if the caller passed in a valid oDefault object, reset our oModel to it
                    else if (core.type.obj.is(oDefault)) {
                        oModel = oDefault;
                    }

                    //#
                    $returnValue.data = oModel;
                    return $returnValue;
                };
            }(), //# core.web.cookie


            /*
            ####################################################################################################
            Class: core.web.queryString
            Parses the referenced cookie and returns an object to manage it.
            Requires:
            <core.type.*.is>, <core.type.*.mk>, <core.type.fn>, 
            ~<core.io.log.warn>
            ####################################################################################################
            */
            queryString: function () {
                var $queryString;

                //# serializes the passed model (up to 3-dimensions)
                function serialize(model, vOptions) {
                    var key, value, subkey, i,
                        oOptions = (core.type.obj.is(vOptions) ?
                            vOptions :
                            { useSemicolon: vOptions === true, encodeURI: true }
                        ),
                        e = (oOptions.encodeURI === false ?
                            function (s) { return s; } :
                            encodeURIComponent
                        ),
                        delimiter = (oOptions.useSemicolon ?
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
                            if (!core.type.is.val(value)) {
                                returnVal += key + "=" + delimiter;
                            }
                            //# Else if the current key is a pseudo-Array object
                            else if (core.type.obj.is(value)) {
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
                            //# Else if the current value isn't a function, treat the current key/value as a string
                            else if (core.type.fn.is(value)) {
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
                                core.type.arr.is(a[a.length]) ? a[a.length].push(arguments[i]) : a[a.length] = new Array(a[a.length], arguments[i]);
                                a.length++;
                            }
                                //# Else this is a new entry, so just set the arguments
                            else {
                                a[a.length++] = arguments[i];
                            }
                        }
                    };

                    //# While we still have key-value e(ntries) in the valuetoParse via the s(earch regex)...
                    while ( (e = s.exec(valuetoParse)) /* == truthy */) { //# while((e = s.exec(valuetoParse)) !== _null) {
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
                                r[k] = (v ? v : _null);
                            }
                        }
                        //# Else we've got ourselves a hash[]-style key-value e(ntry)
                        else {
                            //# Collect the .trim'd and d(ecoded) k(ey) and sk(sub-key) based on the b(racket) locations
                            k = d(e[1].slice(0, b)).trim();
                            sk = d(e[1].slice(b + 1, e[1].indexOf("]", b))).trim();

                            //# If the sk(sub-key) is the reserved 'length', then .toUpperCase it and .warn the developer
                            if (sk === 'length') {
                                sk = sk.toUpperCase();
                                core.type.fn.call(core.resolve(core, "io.log.warn"), this, "'length' is a reserved name and cannot be used as a sub-key. Your sub-key has been changed to 'LENGTH'."); //# TODO: Refactor `this` to `this || _null`?
                            }

                            //# If the k(ey) isn't already a pseudo-Array object
                            if (!core.type.obj.is(r[k]) || core.type.arr.is(r[k])) {
                                //# If the k(ey) is an Array
                                if (core.type.arr.is(r[k])) {
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
                                if (r[k][sk]) { core.type.arr.is(r[k][sk]) ? r[k][sk].push(v) : r[k][sk] = new Array(r[k][sk], v); }
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
                return {
                    ser: {
                        ize: serialize,
                        de: deserialize
                    }, //# ser

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
                        //# Else we need to .get the key from the $queryString
                        else {
                            vReturnVal = (bCaseInsenstive ? core.type.obj.get($queryString, sKey) : $queryString[sKey]);
                        }

                        return vReturnVal;
                    }, //# get

                    //# Parses the sUrl's query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
                    parse: function (sUrl) {
                        var i, oReturnVal;

                        //# Ensure the passed sUrl .is.str then locate the ?
                        sUrl = core.type.str.mk(sUrl, document.location.search || "");
                        i = sUrl.indexOf("?");

                        //# If the sUrl has a query string, .deserialize it into our oReturnVal
                        if (i > -1) {
                            oReturnVal = deserialize(sUrl.substr(i + 1));
                        }

                        return oReturnVal || {};
                    } //# parse
                };
            }()
        }
    }); //# core.io.web


    /*
    ####################################################################################################
	Class: core.type
    Additional Variable Type-based functionality (type.*.cp, type.*.cmp, type.*.eq, type.*.rm, etc) plus uuid, enum and query.
    Requires:
    <core.resolve>, <core.extend>, 
    <core.type.fn.is>, <core.type.arr.is>, <core.type.obj.is>, <core.type.str.is>, <core.type.date.is>, <core.type.num.is>, 
    <core.type.str.mk>, <core.type.int.mk>, <core.type.date.mk>, <core.type.float.mk>, 
    <core.type.fn.call>,
    ~<core.io.net.get>
    ####################################################################################################
    */
    core.extend(core.type, {
        //# val, true
        is: {
            /*
            Function: val
            Determines if the passed value is set (i.e. !== undefined || null).
            Parameters:
            v - The varient to interrogate.
            Returns:
            Boolean value representing if the value is set.
            */
            val: function (v) {
                return (v !== _undefined && v !== _null);
            }, //# type.is.val


            /*
            Function: true
            Determines if the passed value is a truth-y value.
            Parameters:
            v - The truth-y value to interrogate.
            Returns:
            Boolean value representing if the value is a truth-y value.
            */
            'true': function (v) {
                return (v === true ?
                    true :
                    (v + "").trim().toLowerCase() === "true"
                );
            }, //# type.is.true


            /*
            Function: native
            Determines if the passed value is a native Javasript function or object.
            Parameters:
            x - The varient to interrogate.
            Returns:
            Boolean value representing if the value is a native Javasript function or object.
            About:
            From: http://davidwalsh.name/essential-javascript-functions
            */
            native: function () {
                var toString = Object.prototype.toString,       // Used to resolve the internal `[[Class]]` of values
                    fnToString = Function.prototype.toString,   // Used to resolve the decompiled source of functions
                    reHostCtor = /^\[object .+?Constructor\]$/, // Used to detect host constructors (Safari > 4; really typed array specific)
                    reNative = RegExp('^' +                     // Compile a regexp using a common native method as a template. We chose `Object#toString` because there's a good chance it is not being mucked with.
                        String(toString)                                // Coerce `Object#toString` to a string
                            .replace(/[.*+?^${}()|[\]/\\]/g, '\\$&')    // Escape any special regexp characters
                            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
                        '$'                                             // Replace mentions of `toString` with `.*?` to keep the template generic. Replace thing like `for ...` to support environments like Rhino which add extra info such as method arity.
                    )
                ;

                return function (x) {
                    var type = typeof x;
                    return type == 'function' ?
                        reNative.test(fnToString.call(x)) : // Use `Function#toString` to bypass x's own `toString` method and avoid being faked out.
                        (x && type == 'object' && reHostCtor.test(toString.call(x))) || // Fallback to a host object check because some environments will represent things like typed arrays as DOM methods which may not conform to the normal native pattern.
                        false;
                };
            }(), //# type.is.native
            /*native: function () {
                var toString = Object.prototype.toString,       // Used to resolve the internal `[[Class]]` of x
                    fnToString = Function.prototype.toString,   // Used to resolve the decompiled source of functions
                    reHostCtor = /^\[object .+?Constructor\]$/, // Used to detect host constructors (Safari > 4; really typed array specific)
                    reNative = RegExp('^' +                     // Compile a regexp using a common native method as a template. We chose `Object#toString` because there's a good chance it is not being mucked with.
                        String(toString)                                // Coerce `Object#toString` to a string
                            .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')   // Escape any special regexp characters
                                                                        // Replace mentions of `toString` with `.*?` to keep the template generic.
                                                                        // Replace thing like `for ...` to support environments like Rhino which add extra info such as method arity.
                            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
                        '$'
                    )
                ;

                return function (x) {
                    var type = typeof x;
                    return x == 'function' ?
                        reNative.test(fnToString.call(x)) :     // Use `Function#toString` to bypass the x's own `toString` method and avoid being faked out.
                                                                // Fallback to a host object check because some environments will represent things like typed arrays as DOM methods which may not conform to the normal native pattern.
                        (x && type == 'object' && reHostCtor.test(toString.call(x))) || false
                    ;
                }
            }(), //# type.is.native*/


            // Primitive Vals - Boolean, Null, Undefined, Number, String, Symbol
            primitive: function (x) {
                return (
                    x === _null ||
                    x === _undefined ||
                    core.type.bool.is(x) ||
                    core.type.num.is(x) ||
                    core.type.str.is(x /*, false*/) ||
                    core.type.symbol.is(x)
                );
            } //# type.is.primitive
        }, //# core.type.is

        //# 
        any: function (x, a_vValues, bUseCoserion) {
            var i,
                fnTest = (bUseCoserion === true ?
                    function (vX, vTest) {
                        return vX == vTest; 
                    } :
                    function (vX, vTest) {
                        return vX === vTest; 
                    }
                ),
                bReturnVal = false
            ;

            //# 
            if (core.type.arr.is(a_vValues, true)) {
                for (i = 0; i < a_vValues.length; i++) {
                    if (fnTest(x, a_vValues[i])) {
                        bReturnVal = true;
                        break;
                    }
                }
            }

            return bReturnVal;
        }, //# core.type.any

        //# core.type.obj.toArr, core.type.obj.get
        query: function () {
            //#
            function doQuery(sKey, vQueryValue, oSource, oOptions) {
                var vTestValue = (oOptions.caseInsentive ? core.type.obj.get(oSource, sKey) : core.resolve(oSource, sKey)),
                    bReturnVal = false
                ;

                //# Else if the vQueryValue .is.fn, call it with fn(vTestValue, vQueryValue, oOptions)
                if (core.type.fn.is(vQueryValue)) {
                    bReturnVal = vQueryValue(vTestValue, vQueryValue, oOptions);
                }
                //#
                else if (vQueryValue instanceof RegExp) {
                    bReturnVal = !!(core.type.str.mk(vTestValue).match(vQueryValue));
                }
                //# Else we'll consider the vCurrent oQuery value as singular
                else {
                    bReturnVal = (core.type.obj.is(oSource) &&
                        (oOptions.useCoercion && vTestValue == vQueryValue) ||
                        (vTestValue === vQueryValue)
                    );
                }

                return bReturnVal;
            } //# doQuery

            //# 
            //# ["val1", "val2"] = core.type.query([{}, {}], ["path.to.val"])
            //# [{}, {}] = core.type.query([{}, {}], { key: "val", key2: ["val1", "val2"] })
            return function (vCollection, vQuery, oOptions) {
                var a_oCollection, vCurrent, bIsMatch, i, j, k,
                    a_oReturnVal = [],
                    bExtract = core.type.arr.is(vQuery, true),
                    a_sKeys = (bExtract ?
                        vQuery : (
                            core.type.obj.is(vQuery) ?
                            Object.keys(vQuery) : 
                            _undefined    
                        )
                    )
                ;

                //# .extend the passed oOptions with the defaults (which also ensures the passed oOptions .is.obj)
                oOptions = core.extend({
                    firstEntryOnly: false,
                    caseInsentive: false,
                    useCoercion: false,
                    or: false,
                    setKeyAs: "$key"
                }, oOptions);

                //# Calculate our a_oCollection based on the passed vCollection
                a_oCollection = (core.type.arr.is(vCollection) ?
                    vCollection : (core.type.obj.is(vCollection) ?
                        core.type.obj.toArr(vCollection, oOptions.setKeyAs) :
                        [vCollection]
                    )
                );

                //# If we have a_oCollection and a vQuery
                if (core.type.arr.is(a_oCollection, true) && core.type.arr.is(a_sKeys, true)) {
                    //# If vQuery was an array
                    if (bExtract) {
                        for (i = 0; i < a_oCollection.length; i++) {
                            //# 
                            if (a_sKeys.length > 1) {
                                vCurrent = {};
                                a_oReturnVal.push(vCurrent);

                                for (j = 0; j < a_sKeys.length; j++) {
                                    vCurrent[a_sKeys[j]] = core.resolve(a_oCollection[i], a_sKeys[j]);
                                }
                            }
                            //# 
                            else {
                                a_oReturnVal.push(core.resolve(a_oCollection[i], a_sKeys[0]));
                            }
                        }
                    }
                    //# Else vQuery was an object
                    else {
                        //# Traverse our a_oCollection
                        for (i = 0; i < a_oCollection.length; i++) {
                            //# Traverse our vQuery's a_sKeys, resetting bIsMatch and vCurrent for each loop
                            for (j = 0; j < a_sKeys.length; j++) {
                                bIsMatch = false;
                                vCurrent = vQuery[a_sKeys[j]];
    
                                //# If we have an .is.arr of vQuery values to traverse, do so now
                                if (core.type.arr.is(vCurrent)) {
                                    for (k = 0; k < vCurrent.length; k++) {
                                        //# If the vCurrent value matches our current a_oCollection item, flip bIsMatch and fall from the inner loop
                                        if (doQuery(a_sKeys[j], vCurrent[k], a_oCollection[i], oOptions)) {
                                            bIsMatch = true;
                                            break;
                                        }
                                    }
                                }
                                //# Else we'll consider the vCurrent vQuery value as singular, so reset bIsMatch based on doQuery
                                else {
                                    bIsMatch = doQuery(a_sKeys[j], vCurrent, a_oCollection[i], oOptions);
                                }
    
                                //# If this is an AND-based vQuery and the vCurrent vQuery isn't an bIsMatch or this is an OR-based vQuery and we've already found our bIsMatch, fall from the middle loop
                                if ((!oOptions.or && !bIsMatch) || (oOptions.or && bIsMatch)) {
                                    break;
                                }
                            }
    
                            //# If the current a_oCollection record passed each vQuery value, .push it into our a_oReturnVal
                            if (bIsMatch) {
                                a_oReturnVal.push(a_oCollection[i]);
    
                                //# If we are looking for the .firstEntryOnly, fall from the outer loop
                                if (oOptions.firstEntryOnly) {
                                    break;
                                }
                            }
                        }
                    }
                }

                return (oOptions.firstEntryOnly ? a_oReturnVal[0] : a_oReturnVal);
            };
        }(), //# core.type.query

        //####

        /*
        Returns a GUID/UUID v4
        */
        uuid: function() {
            var fnReturnValue, d,
                _window_crypto = _window.crypto || {}
            ;

            //# If _window.Uint8Array and _window.crypto are available, use them in our fnReturnValue
            if (core.type.fn.is(_window_crypto.getRandomValues) && core.type.fn.is(_window.Uint8Array)) {
                fnReturnValue = function () {
                    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
                        return (c ^ _window.crypto.getRandomValues(new _window.Uint8Array(1))[0] & 15 >> c / 4).toString(16);
                    });
                };
            }
            //# Else something went wrong using the ES6 approach, so fall back to the
            else {
                d = (
                    Date.now() + (core.type.fn.call(core.resolve(_window, "performance.now")) || 0)
                );

                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });

                /*
                var i,
                    a_bLookupTable = []
                ;

                //# Pre-populate our a_bLookupTable
                for (i = 0; i < 256; i++) {
                    a_bLookupTable[i] = (i < 16 ? '0' : '') + (i).toString(16);
                }

                //# Set our fnReturnValue to the
                //#     Based on code from: Jeff Ward, https://stackoverflow.com/a/21963136/235704
                fnReturnValue = function () {
                    var xffffffff = 0xffffffff,
                        iPrefNow = (core.type.fn.is(core.resolve(_window, "performance.now")) ? _window.performance.now() : 0),
                        d0 = (Math.random() + iPrefNow) * xffffffff | 0,
                        d1 = (Math.random() + iPrefNow) * xffffffff | 0,
                        d2 = (Math.random() + iPrefNow) * xffffffff | 0,
                        d3 = (Math.random() + iPrefNow) * xffffffff | 0
                    ;

                    return a_bLookupTable[d0&0xff] + a_bLookupTable[d0>>8&0xff] + a_bLookupTable[d0>>16&0xff] + a_bLookupTable[d0>>24&0xff] +
                        '-' + a_bLookupTable[d1&0xff] + a_bLookupTable[d1>>8&0xff] +
                        '-' + a_bLookupTable[d1>>16&0x0f|0x40] + a_bLookupTable[d1>>24&0xff] +
                        '-' + a_bLookupTable[d2&0x3f|0x80] + a_bLookupTable[d2>>8&0xff] +
                        '-' + a_bLookupTable[d2>>16&0xff] + a_bLookupTable[d2>>24&0xff] + a_bLookupTable[d3&0xff] + a_bLookupTable[d3>>8&0xff] + a_bLookupTable[d3>>16&0xff] + a_bLookupTable[d3>>24&0xff]
                    ;
                };
                */
            }

            return fnReturnValue;
        }(), //# core.type.uuid

        //####

        //# eq, cmp
        num: {
            /*
            Function: eq
            Determines if the passed numeric values are equal (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            s - The first numeric value to compare.
            t - The second numeric value to compare.
            Returns:
            Boolean value representing if the passed numeric values are equal.
            */
            eq: function (x, y) {
                var bReturnVal = false;
    
                //# If the passed x and y .is.num'bers, .mk them .floats and reset our bReturnVal to their comparison
                if (core.type.num.is(x) && core.type.num.is(y)) {
                    bReturnVal = (core.type.float.mk(x) === core.type.float.mk(y));
                }
    
                return bReturnVal;
            }, //# type.num.eq


            /*
            Function: cmp
            Determines the relationship between the passed numeric values (includes implicit casting per the Javascript rules, see: <core.type.int.mk>).
            Parameters:
            x - The first numeric value to compare.
            y - The second numeric value to compare.
            Returns:
            Nullable interger value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or y is non-numeric.
            */
            cmp: function (x, y) {
                var iReturnVal = _undefined,
                    dX = core.type.float.mk(x, _null),
                    dY = core.type.float.mk(y, _null)
                ;
    
                if (core.type.num.is(dX) && core.type.num.is(dY)) {
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
            } //# type.num.cmp

            // cp: 
        }, //# core.type.num

        //# eq, cmp, cp, age, yyyymmdd, only
        date: {
            /*
            Function: date
            Determines if the passed dates are equal (includes implicit casting).
            Parameters:
            x - The first date to compare.
            y - The second date to compare.
            Returns:
            Boolean value representing if the passed dates are equal.
            */
            eq: function (x, y) {
                var dDateX = core.type.date.mk(x, _null);
                var dDateY = core.type.date.mk(y, _null);
    
                //#     NOTE: `new Date("1970/01/01") === new Date("1970/01/01")` is always false as they are 2 different objects, while <= && >= will give the expected result
                //#     SEE: Comment from Jason Sebring @ http://stackoverflow.com/a/493018/235704
                return (core.type.date.is(dDateX) && core.type.date.is(dDateY) && dDateX <= dDateY && dDateX >= dDateY);
            }, //# type.date.eq


            /*
            Function: cmp
            Determines the relationship between the passed dates, with the second date optionally defaulting to `new Date()` (i.e. now).
            Parameters:
            x - The first date to compare.
            (Optional) y - The optional second date to compare. Default Value: `new Date()`.
            Returns:
            Nullable integer value representing -1 if x is before y, 0 if x === y, 1 if x is after y or undefined if x or the passed y is not a date.
            */
            cmp: function (x, y) {
                var iReturnVal = _undefined,
                    dDateX = core.type.date.mk(x, _null),
                    dDateY = (arguments.length < 2 ? new Date() : core.type.date.mk(y, _null))
                ;
    
                //# If the passed dates are valid, determine dDateX's relationship to dNow
                if (core.type.date.is(dDateX) && core.type.date.is(dDateY)) {
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
            }, //# type.date.cmp


            //# 
            cp: function (d) {
                //# If the caller passed in a valid d(ate),
                if (core.type.date.is(d)) {
                    return new Date(d.getTime());
                }
            }, //# type.date.cp

            /*
            Function: age
            Safely parses the passed value as a date of birth into the age in years.
            Parameters:
            dob - The varient to interrogate.
            Returns:
            Integer representing the age in years.
            */
            age: function (dob) {
                var dAgeSpan,
                    iReturnVal = -1
                ;

                //# If the passed dob is a valid date
                if (core.type.date.is(dob)) {
                    //# Set dAgeSpan based on the milliseconds from epoch
                    dAgeSpan = new Date(_Date_now() - core.type.date.mk(dob, _null));
                    iReturnVal = Math.abs(dAgeSpan.getUTCFullYear() - 1970);
                }

                return iReturnVal;
            }, //# date.age

            /*
            Function: yyyymmdd
            Safely parses the passed value into a string containing the international date format (YYYY/MM/DD).
            Parameters:
            x - The varient to interrogate.
            dDefault - The default value to return if casting fails.
            Returns:
            String representing the international date format (YYYY/MM/DD).
            */
            yyyymmdd: function (x, dDefault, sDelimiter) {
                var dDate = core.type.date.mk(x, (arguments.length > 1 ? dDefault : new Date()));

                sDelimiter = core.type.str.mk(sDelimiter, "/");

                return (core.type.date.is(dDate) ?
                    dDate.getFullYear() + sDelimiter + core.type.str.lpad((dDate.getMonth() + 1), "0", 2) + sDelimiter + core.type.str.lpad(dDate.getDate(), "0", 2) :
                    ""
                );
                //dCalDate.getHours() + ':' + core.type.str.mk(dCalDate.getMinutes()).lPad("0", 2) + ':' + core.type.str.mk(dCalDate.getSeconds()).lPad("0", 2)
            }, //# date.yyyymmdd

            /*
            Function: only
            Safely parses the passed value into a date containing the year/month/day while replacing any time portion with midnight.
            Parameters:
            x - The varient to interrogate.
            dDefault - The default value to return if casting fails.
            Returns:
            Date representing the year/month/day in the passed value.
            */
            only: function (x, dDefault) {
                return core.type.date.mk(core.type.date.yyyymmdd.apply(this, [x, dDefault]) + " 00:00:00");
            } //# date.only
        }, //# core.type.date

        //# eq, cmp, lpad, rpad, begins, ends, contains, sub
        str: function () {
            //#
            function doPad(s, sChar, iLength, bLPad) {
                var sReturnVal = core.type.str.mk(s);
                iLength = core.type.int.mk(iLength);
                sChar = core.type.str.mk(sChar, " ");

                //# If we are supposed to bLPad the passed s(tring)
                if (bLPad) {
                    //# Left pad out this [string] while it's .length is less than the passed iLength
                    while (sReturnVal.length < iLength) {
                        sReturnVal = sChar + sReturnVal;
                    }
                }
                //# Else we are supposed to RPad the passed s(tring)
                else {
                    //# Left pad out this [string] while it's .length is less than the passed iLength
                    while (sReturnVal.length < iLength) {
                        sReturnVal = sReturnVal + sChar;
                    }
                }

                return sReturnVal;
            } //# doPad

            //#
            function doSearch(s, vCriteria, eMode) {
                var i, iLocation,
                    a_sCriteria = (core.type.arr.is(vCriteria) ? vCriteria : [vCriteria]),
                    bReturnVal = false
                ;

                //#
                s = core.type.str.mk(s);
                for (i = 0; i < a_sCriteria.length; i++) {
                    iLocation = s.indexOf(a_sCriteria[i]);

                    if (iLocation > -1) {
                        switch (eMode) {
                            case 0: { //# begins
                                bReturnVal = (iLocation === 0);
                                break;
                            }
                            case -1: { //# ends
                                bReturnVal = (iLocation + a_sCriteria[i].length === s.length);
                                break;
                            }
                            default: {
                                bReturnVal = true;
                                //break;
                            }
                        }
                    }

                    //#
                    if (bReturnVal) {
                        break;
                    }
                }

                return bReturnVal;
            } //# doSearch

            return {
                /*
                Function: eq
                Determines if the passed strings are equal (includes implicit casting and trimming of leading/trailing whitespace).
                Parameters:
                s - The first string to compare.
                t - The second string to compare.
                (Optional) bCaseInsenstive - Boolean value indicating if the comparison is to be case insenstive.
                Returns:
                Boolean value representing if the passed strings are equal.
                */
                eq: function (s, t, bCaseInsenstive) {
                    s = core.type.str.mk(s, "");
                    t = core.type.str.mk(t, "");
        
                    //# Unless specificially told not to, compare the passed string as bCaseInsenstive
                    return (bCaseInsenstive !== false ?
                        (s.toLowerCase() === t.toLowerCase()) :
                        (s === t)
                    );
                }, //# type.str.eq


                /*
                Function: cmp
                Determines the relationship between the passed strings (implicitly casted, trimmed and compaired as case-insensitive).
                Parameters:
                x - The first string to compare.
                y - The second string to compare.
                Returns:
                Truthy value representing `true` if x === y, `false` if x != y or 1 if x matches y (case-insensitive and trimmed).
                */
                cmp: function () {
                    var fnReturnVal = function (x, y) {
                        var vReturnVal = false,
                            s1 = core.type.str.mk(x),
                            s2 = core.type.str.mk(y)
                        ;
        
                        //# If the strings match as-is, reset our vReturnVal to 1
                        if (s1 === s2) {
                            vReturnVal = true;
                        }
                        //# Else if the strings match after .trim'ing and .toLowerCase'ing, reset our vReturnVal to -1
                        else if (s1.trim().toLowerCase() === s2.trim().toLowerCase()) {
                            vReturnVal = 1; //# truthy
                        }
        
                        return vReturnVal;
                    };
        
                    //#
                    return core.extend(fnReturnVal, {
                        starts: function (x, q, bTrim) {
                            var sX = (bTrim ? core.type.str.mk(x).trim() : core.type.str.mk(x));
                            return (sX.indexOf(core.type.str.mk(q)) === 0);
                        }, //# type.str.cmp.starts
        
                        //#
                        ends: function (x, q, bTrim) {
                            var sX = (bTrim ? core.type.str.mk(x).trim() : core.type.str.mk(x)),
                                sQuery = core.type.str.mk(q)
                            ;
        
                            return (sX.indexOf(sQuery) === (sX.length - sQuery.length));
                        }, //# type.str.cmp.ends
        
                        //#
                        any: function (x, a_sQuery, bTrim) {
                            var i,
                                vReturnVal = false
                            ;
        
                            //# If the caller passed in a a_sQuery array with values, traverse it looking for the first truthy vReturnVal
                            if (core.type.arr.is(a_sQuery, true)) {
                                for (i = 0; i < a_sQuery.length; i++) {
                                    vReturnVal = fnReturnVal(x, a_sQuery[i], bTrim);
                                    if (vReturnVal) {
                                        break;
                                    }
                                }
                            }
        
                            return vReturnVal;
                        } //# type.str.cmp.any
                    });
                }(), //# type.str.cmp.*

                //cp: 

                lpad: function (s, sChar, iLength) {
                    return doPad(s, sChar, iLength, true);
                }, //# type.str.lpad

                rpad: function (s, sChar, iLength) {
                    return doPad(s, sChar, iLength, false);
                }, //# type.str.rpad

                begins: function (s, vCriteria) {
                    return doSearch(s, vCriteria, 1);
                }, //# type.str.begins

                ends: function (s, vCriteria) {
                    return doSearch(s, vCriteria, -1);
                }, //# type.str.ends

                contains: function (s, vCriteria) {
                    return doSearch(s, vCriteria /*, 0*/);
                }, //# type.str.contains

                sub: function (s, iFromStart, iFromEnd) {
                    var sReturnVal = core.type.str.mk(s),
                        iStart = core.type.int.mk(iFromStart),
                        iEnd = sReturnVal.length - core.type.int.mk(iFromEnd)
                    ;

                    return sReturnVal.substring(
                        (iStart < 0 ? 0 : iStart),
                        (iEnd < 0 ? 0 : iEnd)
                    );
                } //# type.str.sub
            };
        }(), //# core.type.str

        //# cp
        /*
        fn: {
            //eq:
            //cmp:

            //#
            //#     SEE: https://stackoverflow.com/a/22534864/235704
            cp: function (fn) {
                var sKey;
    
                //#
                function newFn() {
                    var fnReturnVal, i,
                        sEval = "",
                        a = core.type.fn.convert(arguments)
                    ;
    
                    //try {
                    //    fnReturnVal = new fn(...a);
                    //} catch (e) {
                        //#
                        if (a.length > 0) {
                            for (i = 0; i < a.length; i++) {
                                sEval += "a[" + i + "],";
                            }
                            sEval = sEval.substr(0, sEval.length - 1);
                        }
    
                        //#
                        fnReturnVal = eval("new fn(" + sEval + ")");
                    //}
    
                    return fnReturnVal;
                } //# newFn
    
                //#
                function fnReturnVal() {
                    if (this instanceof fnReturnVal) {
                        return newFn.apply(_null, arguments);
                    }
                    return fn.apply(this, arguments);
                } //# fnReturnVal
    
                //#
                for (sKey in fn) {
                    if (fn.hasOwnProperty(sKey)) {
                        fnReturnVal[sKey] = fn[sKey];
                    }
                }
    
                return fnReturnVal;
            } //# type.fn.cp
        }, //# core.type.fn
        */

        //# cp
        dom: {
            // eq:
            // cmp:

            cp: function (x, bDeepCopy) {
                if (core.type.dom.is(x) && core.type.fn.is(x.cloneNode)) {
                    return x.cloneNode(core.type.bool.mk(bDeepCopy));
                }
            } //# type.dom.cp
        }, //# core.type.dom

        //# cmp, cp, unique, matches, randomize, of, countOf, sort
        arr: {
            //eq: function () {}, //# type.arr.eq

            /*
            Function: cmp
            Determines the relationship between the passed arrays (matching values, matching coerced values and matching values in different order).
            Parameters:
            x - The first array to compare.
            y - The second array to compare.
            (Optional) bInOrderOnly - Boolean value indicating if the comparison is to be in matching order only.
            Returns:
            Truthy value representing `true` if x[i] === y[i] in all cases, 1 if x[i] == y[i] in all cases, 2 if x.indexOf(y[i]) !== -1 in all cases or `false` if any value in x is missing from y
            */
            cmp: function (x, y, bInOrderOnly) {
                var a_vYClone, iIndex, i,
                    vReturnVal = (
                        core.type.arr.is(x) && core.type.arr.is(y) &&
                        x.length === y.length
                    ),
                    iLen = (vReturnVal ? x.length : 0)
                ;
    
                //# If the passed x and y .is.arr and both have the same iLen
                if (vReturnVal) {
                    //# Traverse the passed arrays, flipping our vReturnVal if an index isn't === or ==
                    for (i = 0; i < iLen; i++) {
                        if (x[i] !== y[i]) {
                            if (x[i] == y[i]) {
                                vReturnVal = 1;
                            }
                            else {
                                vReturnVal = (bInOrderOnly ? false : 2);
                                break;
                            }
                        }
                    }
    
                    //# If an index didn't match via coercion (e.g. ==) and we're not looking for bInOrderOnly, see if both arrays have the same values in a different order
                    if (vReturnVal === 2) {
                        //# Create a a_vYClone of y
                        //#     NOTE: We have to create a clone as a simple list of found iIndexes won't work because values could be repeated
                        a_vYClone = y.slice(0);
    
                        //# Traverse x, determining the iIndex in a_vYClone as we go
                        for (i = 0; i < iLen; i++) {
                            iIndex = a_vYClone.indexOf(x[i]);
    
                            //# If we could not find the current iIndex, flip our vReturnVal and fall from the loop
                            if (iIndex === -1) {
                                vReturnVal = false;
                                break;
                            }
                            //# Else remove the iIndex from a_vYClone
                            else {
                                a_vYClone.splice(iIndex, 1);
                            }
                        }
                    }
                }
    
                return vReturnVal;
            }, //# type.arr.cmp

            cp: function (a, vDeepCopy) {
                var vCurrent, i,
                    a_vReturnVal /* = _undefined */
                ;
    
                //#
                vDeepCopy = core.type.int.mk(vDeepCopy, 0);
    
                //# If the caller passed in a valid a(rray)
                if (core.type.arr.is(a)) {
                    //#
                    if (vDeepCopy !== 0) {
                        a_vReturnVal = [];
    
                        //#
                        for (i = 0; i < a.length; i++) {
                            vCurrent = a[i];
    
                            if (core.type.arr.is(vCurrent)) {
                                a_vReturnVal.push(core.type.arr.cp(vCurrent, vDeepCopy - 1));
                            }
                            else if (core.type.obj.is(vCurrent)) {
                                a_vReturnVal.push(core.type.obj.cp(vCurrent, vDeepCopy - 1));
                            }
                            else if (core.type.date.is(vCurrent)) {
                                a_vReturnVal.push(core.type.date.cp(vCurrent));
                            }
                            else if (core.type.fn.is(vCurrent)) {
                                a_vReturnVal.push(core.type.fn.cp(vCurrent));
                            }
                            else if (core.type.dom.is(vCurrent)) {
                                a_vReturnVal.push(core.type.dom.cp(vCurrent, true));
                            }
                            else {
                                a_vReturnVal.push(vCurrent);
                            }
                        }
                    }
                    //# Else we don't need to do a vDeepCopy, so set our a_vReturnVal to a .slice'd clone of the a(rray)
                    else {
                        a_vReturnVal = a.slice(0);
                    }
                }
    
                return a_vReturnVal;
            }, //# type.arr.cp

            unique: function (a_vArray, a_vArray2) {
                if (core.type.arr.is(a_vArray)) {

                    if (arguments.length > 1 && core.type.arr.is(a_vArray2)) {
                        return a_vArray.filter(function (v) {
                            return a_vArray2.indexOf(v) === -1;
                        });
                    }
                    else {
                        return a_vArray.reduce(function (acc, val) {
                            if (acc.indexOf(val) === -1) acc.push(val);
                            return acc;
                        }, []);
                    }
                }
            }, //# type.arr.unique

            matches: function (a_vArray, a_vArray2) {
                if (core.type.arr.is(a_vArray) && core.type.arr.is(a_vArray2)) {
                    return a_vArray.filter(function (v) {
                        return a_vArray2.indexOf(v) !== -1;
                    });
                }
            }, //# type.arr.matches

            randomize: function (a_vArray) {
                if (core.type.arr.is(a_vArray)) {
                    return a_vArray.sort(function (/*a, b*/) {
                        return Math.random() >= 0.5 ? -1 : 1;
                    });
                }
            }, //# type.arr.randomize

            /*
            Function: of
            Determines if the passed value is an array of type (based on the passed test function).
            Parameters:
            a - The varient to interrogate.
            fnTest - Function returning true/false that tests each value for type.
            Returns:
            Boolean value representing if the value is an array of type.
            */
            of: function (a, fnTest) {
                var i,
                    bReturnVal = (core.type.arr.is(a, true) && core.type.fn.is(fnTest))
                ;

                //# If the arguments are properly reconized traverse the passed a(rray), fnTest'ing each current value as we go (flipping our bReturnVal and falling from the loop on a failure)
                if (bReturnVal) {
                    for (i = 0; i < a.length; i++) {
                        if (!fnTest(a[i])) {
                            bReturnVal = false;
                            break;
                        }
                    }
                }

                return bReturnVal;
            }, //# type.arr.of

            countOf: function(a_vArray, vValue) {
                if (core.type.arr.is(a_vArray)) {
                    return a_vArray.filter(function (v) {
                        return v === vValue;
                    }).length;
                }
            }, //# type.arr.countOf

            sort: function () {
                //# Natural Sort implementation for feeding into Array.sort()
                //#     FROM: https://stackoverflow.com/questions/15478954/sort-array-elements-string-with-numbers-natural-sort/15479354#15479354
                function naturalCompare(a, b) {
                    var an, bn, nn,
                        ax = [],
                        bx = []
                    ;

                    a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]); });
                    b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]); });

                    while (ax.length && bx.length) {
                        an = ax.shift();
                        bn = bx.shift();
                        nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                        if (nn) return nn;
                    }

                    return (ax.length - bx.length);
                } //# naturalCompare

                function natural(a_vArray) {
                    if (core.type.arr.is(a_vArray)) {
                        return a_vArray.sort(naturalCompare);
                    }
                } //# natural


                //#
                return core.extend(natural, {
                    natural: natural
                });
            }() //# type.arr.sort
        }, //# core.type.arr

        //# cp, clone, toArr, join, mv, rm, has
        obj: function () {
            //var oProtected = core.type.protected(core.type.obj);


            //#
            function processObj(vSource, vKeys, bSetToUndefined) {
                var i,
                    //bSetToUndefined = ,
                    bReturnVal = true
                ;

                function doPrune(oSource, vKeys, bSetToUndefined) {
                    var a_sKeys, sKey, i,
                        bRemap = false
                    ;

                    //# If the passed vKeys is an array, set it into a_sKeys
                    if (core.type.arr.is(vKeys)) {
                        a_sKeys = vKeys;
                    }
                    //# Else vKeys is a oMapping definition, so pull its .keys and flip bRemap
                    else if (core.type.obj.is(vKeys)) {
                        a_sKeys = Object.keys(vKeys);
                        bRemap = true;
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
                if (core.type.arr.is(vSource, true)) {
                    for (i = 0; i < vSource.length; i++) {
                        doPrune(vSource[i], vKeys, bSetToUndefined);
                    }
                }
                //# Else if the caller passed in an .is.obj, pass it off to doPrune
                else if (core.type.obj.is(vSource)) {
                    doPrune(vSource, vKeys, bSetToUndefined);
                }
                //# Else the vSource is not a valid value, so flip our bReturnVal
                else {
                    bReturnVal = false;
                }

                return bReturnVal;
            } //# processObj

            //#
            function doCopy(oSource, oFromTo, a_sOwnKeys) {
                var sKey, i,
                    oReturnVal = {}
                ;

                for (i = 0; i < a_sOwnKeys.length; i++) {
                    sKey = a_sOwnKeys[i];
                    oReturnVal[oFromTo[sKey]] = oSource[sKey];
                }

                return oReturnVal;
            } //# doCopy

            return {
                //eq: function () {}, //# type.arr.eq

                //cmp:

                //# 
                cp: function (o, vDeepCopy) {
                    var oReturnVal /* = _undefined */;
        
                    //# If the caller passed in a valid o(bject), .extend our oReturnVal as a new .is.obj
                    if (core.type.obj.is(o)) {
                        oReturnVal = (vDeepCopy ?
                            core.extend(vDeepCopy, {}, o) :
                            core.extend({}, o)
                        );
                    }
        
                    return oReturnVal;
                }, //# cp

                //#
                clone: function (vSource, vKeysOrFromTo) {
                    var i, oFromTo, a_sOwnKeys,
                        vReturnVal /*= undefined*/
                    ;

                    //# If the caller passed in an .is.arr of keys, set it into our a_sOwnKeys
                    if (core.type.arr.is(vKeysOrFromTo)) {
                        a_sOwnKeys = vKeysOrFromTo;

                        //# Traverse a_sOwnKeys, setting each into our (flat) oFromTo definition
                        for (i = 0; i < a_sOwnKeys.length; i++) {
                            oFromTo[a_sOwnKeys[i]] = a_sOwnKeys[i];
                        }
                    }
                    //# Else if the caller passed in a mapping .is.obj, set it into our oFromTo definition and collect a_sOwnKeys
                    else if (core.type.obj.is(vKeysOrFromTo)) {
                        oFromTo = vKeysOrFromTo;
                        a_sOwnKeys = core.type.obj.ownKeys(oFromTo);
                    }

                    //# If vKeysOrFromTo was either an .is.arr or .is.obj
                    if (a_sOwnKeys) {
                        //# If the passed vSource .is.arr, set our vReturnVal to an array
                        if (core.type.arr.is(vSource)) {
                            vReturnVal = [];

                            //# Traverse the vSource, .push'ing each .doCopy into our vReturnVal
                            for (i = 0; i < vSource.length; i++) {
                                vReturnVal.push(doCopy(vSource[i]), oFromTo, a_sOwnKeys);
                            }
                        }
                        //# Else if the passed vSource .is.obj, .doCopy directly into our vReturnVal
                        else if (core.type.obj.is(vSource)) {
                            vReturnVal = doCopy(vSource, oFromTo, a_sOwnKeys);
                        }
                    }

                    return vReturnVal;
                }, //# type.obj.clone

                //#
                toArr: function (oSource, sSetKeyAs) {
                    var a_vReturnVal, i,
                        bSetKey = core.type.str.is(sSetKeyAs, true),
                        a_sKeys = (core.type.obj.is(oSource) ? Object.keys(oSource) : _undefined)
                    ;

                    //# If the passed oSource .is.obj, traverse its a_sKeys and setup our a_vReturnVal
                    if (a_sKeys) {
                        a_vReturnVal = [];
                        for (i = 0; i < a_sKeys.length; i++) {
                            //#
                            if (oSource.hasOwnProperty(a_sKeys[i])) {
                                a_vReturnVal.push(oSource[a_sKeys[i]]);

                                //#
                                if (bSetKey) {
                                    oSource[a_sKeys[i]][sSetKeyAs] = a_sKeys[i];
                                }
                            }
                        }
                    }

                    return a_vReturnVal;
                }, //# type.obj.toArr

                join: function (oSource, sDelimiter) {
                    var i,
                        a_sOwnKeys = core.type.obj.ownKeys(oSource),
                        sReturnVal = ""
                    ;

                    //#
                    if (a_sOwnKeys) {
                        for (i = 0; i < a_sOwnKeys.length - 1; i++) {
                            sReturnVal += oSource[a_sOwnKeys[i]] + sDelimiter;
                        }
                        sReturnVal += oSource[a_sOwnKeys[i]];
                    }

                    return sReturnVal;
                }, //# type.obj.join

                //#
                mv: function (vSource, oFromTo, bSetToUndefined) {
                    var bReturnVal = core.type.obj.is(oFromTo);

                    //#
                    if (bReturnVal) {
                        bReturnVal = processObj(vSource, oFromTo, bSetToUndefined);
                    }

                    return bReturnVal;
                }, //# type.obj.mv

                //#
                rm: function (vSource, vKeys, bSetToUndefined) {
                    var bReturnVal;

                    //# If the caller passed in an .is.str, reset vKeys to an array
                    if (core.type.str.is(vKeys, true)) {
                        vKeys = [vKeys];
                    }
                    bReturnVal = core.type.arr.is(vKeys, true);

                    //#
                    if (bReturnVal) {
                        bReturnVal = processObj(vSource, vKeys, bSetToUndefined);
                    }

                    return bReturnVal;
                }, //# type.obj.rm

                //#
                has: function (vSource, sKey) {
                    var bReturnVal = false;

                    try {
                        bReturnVal = core.type.fn.call(vSource.hasOwnProperty, this, [sKey]);
                    } catch(e) { oTypeIsh.expectedErrorHandler(e); }

                    return bReturnVal;
                } //# type.obj.has
            };
        }() //# core.type.obj
    }); //# core.type


    /** ################################################################################################
     * @namespace core.is|mk|fn
     * @desc Temp Mappings to old locations (core.is, core.mk, core.fn)
     * @todo REMOVE
    ################################################################################################# */
    !function () {
        core.is = {
            str: core.type.str.is,
            date: core.type.date.is,
            int: core.type.int.is,
            float: core.type.float.is,
            bool: core.type.bool.is,
            obj: core.type.obj.is,
            arr: core.type.arr.is,
    
            json: core.type.json.is,
            dom: core.type.dom.is,
    
            num: core.type.num.is,
            fn: core.type.fn.is,
    
            type: core.type.is,
            val: core.type.is.val,
            'true': core.type.is.true,
            native: core.type.is.native,
    
            list: core.type.list.is,
            selector: core.type.selector.is
        }; //# core.is

        core.mk = {
            str: core.type.str.mk,
            date: core.type.date.mk,
            int: core.type.int.mk,
            float: core.type.float.mk,
            bool: core.type.bool.mk,
            obj: core.type.obj.mk,
            arr: core.type.arr.mk,
    
            json: core.type.json.mk,
            dom: core.type.dom.mk
        }; //# core.mk

        core.fn = core.type.fn;    
    }(); //# Temp Mappings


    //##################################################################################################
    //# Procedural code
    //# Requires:
    //# <core.extend>, <core.resolve>, 
    //# <core.type.dom.is>,
    //# <core.type.json.mk>
    //##################################################################################################
    //# Optionally create then .extend our _window variable to expose core as the developer defined in SCRIPT[ish]'s JSON
    //#     NOTE: Since document.currentScript is not universally supported, we look for SCRIPT[ish] as a fallback
    !function /*init*/() {
        var sTemp,
            oOptions = oTypeIsh.options,
            sTarget = oOptions.target,
            _script = _document_currentScript || _document_querySelector("SCRIPT[" + sTarget + "]"),
            _html = _document.getElementsByTagName("HTML")[0]
        ;

        //# Set the .ish.script (if any)
        core.type.ish.script = _script;

        //# If we were able to locate our _script tag and it has .json'd [ish] options, parse them
        if (_script && core.type.json.is(_script.getAttribute(sTarget))) {
            core.extend(oOptions, core.type.json.mk(_script.getAttribute(sTarget)));

            //# Reset the .plugins.baseUrl to the developer-defined inline value (if any, borrowing sTemp as we go)
            sTemp = oOptions.plugins.baseUrl || _script.src;
            oOptions.plugins.baseUrl = sTemp.substr(0, sTemp.lastIndexOf("/") + 1);

            //# .import any .plugins defined in our oOptions (flagging them as .importedBy SCRIPT[sTarget])
            core.type.ish.import(oOptions.plugins.import, core.extend({
                importedBy: "SCRIPT[" + sTarget + "]"
            }, oOptions.plugins));

            //# Reset our sTarget to the developer-defined inline value (if any)
            sTarget = oOptions.target;
        }

        //# If we have a sTarget, overwrite core functionality with any existing functionality under _window[sTarget], then reset the _window object's reference so that the globally accessable object is a refrence to core rather than its original object reference
        //#     NOTE: We need to create the window[sTarget] in the .resolve(true, ...) below in case it is not already defined, else the .resolve will fail.
        if (core.type.str.is(sTarget, true)) {
            core.extend(core, core.resolve(true, _window, sTarget));
            core.resolve(_window, sTarget, core);
        }

        //# If we found the first _html tag, ensure there is a reference to core available on it tag so that other scripts can auto-resolve
        //#     TODO: Error is not found?
        if (core.type.dom.is(_html)) {
            _html.ish = core;
            //_html[sTarget] = core;
        }
    }(); //# Procedural code
}();
