//################################################################################################
/** @file Browser-based Document Object Model mixin for ish.js
 * @mixin ish.ui.dom
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2023, Nick Campbell
 * @ignore
 */ //############################################################################################
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
//<MIXIN>
(function (core) {
    'use strict';

    var _window = window,                                                           //# code-golf
        _document = document,                                                       //# code-golf
        _head = _document.head,                                                     //# code-golf
        _undefined /*= undefined*/,                                                 //# code-golf
        _document_querySelector = _document.querySelector.bind(_document),          //# code-golf
        _document_querySelectorAll = _document.querySelectorAll.bind(_document)     //# code-golf
    ;


    //# .require the necessary ish plugins
    //#     NOTE: core.require includes the required scripts/CSS then runs the provided function
    core.require(["ish.io.net.js"], function (/*a_sUrls, bAllLoaded*/) {
        /*
        ####################################################################################################
        Class: core.dom
        DOM-manipulation functionality.
        Requires:
        <core.extend>, <core.resolve>, 
        <core.type.str.is>, <core.type.dom.is>, <core.type.obj.is>, <core.type.fn.is>, 
        <core.type.dom.mk>, <core.type.arr.mk>, <core.type.obj.mk>, <core.type.str.mk>, <core.type.int.mk>, 
        <core.type.fn.call>, <core.type.fn.poll>, 
        *<core.io.net.xhr>
        ####################################################################################################
        */
        core.oop.partial(core.ui, function (/*oProtected*/) {
            var oDOM;

            //#
            function include(/* [vElement | sUrl,] oOptions */) {
                var $xhr, _template, _replace, vTemp, oOptions,
                    _a = arguments,
                    vFirstArg = _a[0]
                ;

                //# If we were passed more than just oOptions, we need to process the vFirstArg
                //#     NOTE: The [attributes] set on or by the passed vFirstArg take president over values set in oOptions
                if (_a.length > 1) {
                    oOptions = _a[1];
                    _replace = core.type.dom.mk(vFirstArg, _undefined);

                    //# If the vFirstArg .is .dom, pull the [src] (if any) from the DOM element to _replace
                    if (_replace) {
                        vTemp = _replace.getAttribute("src") || oOptions.src;
                    }
                    //# Else we need to pull our DOM element to _replace from the oOptions (if any)
                    else {
                        _replace = core.type.dom.mk(oOptions.replace, _undefined);

                        //# If the vFirstArg .is .str, (eventually) set it into our .src
                        if (core.type.str.is(vFirstArg, true)) {
                            vTemp = vFirstArg;
                        }
                    }
                }
                //# Else we were only passed oOptions
                else {
                    oOptions = vFirstArg;
                    _replace = core.type.dom.mk(oOptions.replace, _undefined);
                    //# If the vFirstArg .is .dom, pull the [src] (if any) from the DOM element to _replace
                    if (_replace) {
                        vTemp = _replace.getAttribute("src") || oOptions.src;
                    }
                }

                //# Ensure the passed oOptions is a new object then default .async to true unless it's specifically set to false and set the above resolved .url (in vTemp)
                oOptions = core.extend({}, oOptions); //, oDOM.options(_replace)
                oOptions.async = (oOptions.async !== false);
                oOptions.src = vTemp;
                _replace = _replace || core.type.dom.mk(oOptions.replace, _undefined);

                //# Configure the $xhr to retrieve the .src
                $xhr = core.io.net.xhr("GET", oOptions.async, oOptions.src, function (bSuccess, oTextData, vArg, $xhr) {
                    if (bSuccess) {
                        _template = core.type.dom.mk(oTextData.text, core.type.dom.mk("<div>" + oTextData.text + "</div>"));

                        //# If we have a DOM element to _replace
                        if (_replace) {
                            _replace.parentNode.replaceChild(_template, _replace);

                            //# .loadScripts that are present in the _template (if any)
                            loadScripts(_template, oOptions);
                        }
                        //# Else we do not have a DOM element to _replace, so just .write out the .text inline at the current document location
                        else {
                            _document.getElementsByTagName("BODY")[0].appendChild(_template);
                        }
                    }

                    //# Now that the include is complete, .call the .callback and onload (if any)
                    vTemp = [bSuccess, _template, oOptions.arg, $xhr];
                    core.type.fn.call(oOptions.callback, this, vTemp);
                    if (_replace) {
                        core.type.fn.call(core.resolve(_window, _replace.getAttribute("onload")), this, vTemp);
                    }
                });

                //# If this is an .async call, set the $xhr's .responseType
                if (oOptions.async) {
                    $xhr.responseType = "document";
                }

                //# Now that the $xhr is fully configured, .send it
                $xhr.send();
            } //# include


            //#
            //#     Example: <include src="path/to/file.html" onload="jsFunctionName">
            function includeAll(vIncludes, oOptions) {
                var i,
                    a__includes = core.type.arr.mk(vIncludes, [vIncludes])
                ;

                //# Traverse the a__includes, tossing each at .include as we go
                for (i = 0; i < a__includes; i++) {
                    include(a__includes[i], oOptions);
                }
            } //# includeAll


            //#
            function loadScripts(vBaseElement, oOptions) {
                var a__scripts, _currentScript, _script, i,
                    _element = core.type.dom.mk(vBaseElement)
                ;

                //# Ensure the passed oOptions .is .obj then collect the a__scripts
                oOptions = core.type.obj.mk(oOptions);
                a__scripts = core.type.arr.mk(_element.querySelectorAll(oOptions.selector || "SCRIPT")); //# SCRIPT:not([type='text/ng-template'])

                //# Traverse the a__scripts
                for (i = 0; i < a__scripts.length; i++) {
                    _currentScript = a__scripts[i];
                    _script = _document.createElement("script");

                    if (core.type.str.is(_currentScript.src, true)) {
                        _script.src = _currentScript.src;
                    }
                    //#     TODO: Add oOptions.evalScript because it's faster?
                    else {
                        _script.text = (_currentScript.text || _currentScript.textContent || _currentScript.innerHTML || "");
                    }

                    _currentScript.parentNode.replaceChild(_script, _currentScript);
                }

                return a__scripts;
            } //# loadScripts


            //#
            function get(sSelector, bAll) {
                var vReturnVal;

                //#
                if (bAll) {
                    vReturnVal = core.type.arr.mk(_document_querySelectorAll(sSelector));
                }
                else {
                    vReturnVal = _document_querySelector(sSelector);
                }

                return vReturnVal;
            } //# get


            //#
            function input_value_CheckboxOrRadio(_formElement, vNewValue, bSet) {
                if (bSet) {
                    _formElement.checked = core.type.bool.mk(vNewValue, _formElement.value === vNewValue);
                }

                //# return based on if the _formElement is .checked
                return (_formElement.checked ? _formElement.value : "");
            } //# input_value_CheckboxOrRadio


            //#
            oDOM = core.extend(get, {
                get: get,

                //#
                include: core.extend(include, {
                    html: include,
                    bySelector: includeAll,

                    //#
                    //# was: vBaseElement, oOptions | sSrc, oOptions | oOptions
                    scripts: function (/* [vParent | sSrc,] oOptions */) {
                        var vScript,
                            _a = arguments,
                            vFirstArg = _a[0],
                            oOptions = core.type.obj.mk(_a.length > 1 ? _a[1] : vFirstArg),
                            _parent = core.type.dom.mk(vFirstArg, core.type.dom.mk(oOptions.parent, _undefined)),
                            sSrc = (!_parent && core.type.str.is(vFirstArg, true) ? vFirstArg : oOptions.src)
                        ;

                        //# If a _parent was passed in, this must be a .loadScripts request
                        if (_parent) {
                            vScript = loadScripts(_parent, oOptions);
                        }
                        //# Else there is no _parent, so this must be a SCRIPT request
                        else {
                            //#
                            vScript = _document.createElement("script");
                            vScript.type = "text/javascript";
                            vScript.onload = oOptions.onload; //# was: .callback
                            vScript.text = oOptions.code;
                            vScript.src = sSrc;

                            //# Auto-majicially set any passed .attributes then append the _element into out _head
                            oDOM.setAttributes(vScript, oOptions.attributes);
                            _head.appendChild(vScript);
                        }

                        return vScript;
                    }, //# script

                    //#
                    css: function (/* [sHref,] oOptions */) {
                        var _element,
                            _a = arguments,
                            vFirstArg = _a[0],
                            oOptions = core.type.obj.mk(_a.length > 1 ? _a[1] : vFirstArg),
                            sHref = (core.type.str.is(vFirstArg, true) ? vFirstArg : oOptions.href)
                        ;

                        //# If an sHref was passed in, this must be a LINK request
                        if (core.type.str.is(sHref, true)) {
                            _element = _document.createElement("link");
                            _element.rel = "stylesheet";
                            _element.href = sHref;
                        }
                        //# Else there is no sHref, so this must be a STYLE request
                        else {
                            _element = document.createElement('style');
                            _element.type = 'text/css';
                            if (_element.styleSheet){
                                _element.styleSheet.cssText = oOptions.code;
                            } else {
                                _element.appendChild(_document.createTextNode(oOptions.code));
                            }
                        }

                        //# Auto-majicially set any passed .attributes, append the _element into out _head and return the DOM reference to the caller
                        oDOM.setAttributes(_element, oOptions.attributes);
                        _head.appendChild(_element);
                        return _element;
                    } //# css
                }), //# dom.include

                //#
                script: {
                    //#
                    find: function (sFilename, oOptions) {
                        var sPath, iLocation, i, bCaseSensitive,
                            l__scripts = _document.getElementsByTagName("SCRIPT"),
                            _returnVal /*= undefined */
                        ;

                        //# Ensure the passed oOptions .is .obj then determine if we are to be bCaseSensitive
                        oOptions = core.type.obj.mk(oOptions);
                        bCaseSensitive = (oOptions.caseSensitive !== false);

                        //# If the caller passed in a valid sFilename
                        if (core.type.str.is(sFilename, true)) {
                            //# Convert sFilename based on the passed bCaseSensitive and prefix a "/" if necessary
                            sFilename = (bCaseSensitive ? sFilename : sFilename.toLowerCase());
                            sFilename = (oOptions.allowPartialFilename || sFilename[0] === "/" ? "" : "/") + sFilename;

                            //# Traverse the SCRIPT tags, pulling the .src and .indexOf the sFilename while converting for bCaseSensitive
                            for (i = 0; i < l__scripts.length; i++) {
                                sPath = l__scripts[i].src.split("?")[0];
                                sPath = (bCaseSensitive ? sPath : sPath.toLowerCase());
                                iLocation = sPath.indexOf(sFilename);

                                //# If the sFilename is in the last position, set our _returnVal and fall from the loop
                                if (iLocation === (sPath.length - sFilename.length)) {
                                    _returnVal = l__scripts[i];
                                    break;
                                }
                            }
                        }

                        return _returnVal;
                    }, //# find

                    //#
                    current: function (oOptions) {
                        var _document_scripts = _document.scripts;

                        function doFind() {
                            return oDOM.script.find(oOptions.filename, oOptions);
                        }

                        //# Ensure the passed oOptions .is .obj
                        oOptions = core.type.obj.mk(oOptions);

                        //# As long as the .currentScript isn't false, use it or the _document's, else .find it based on .filename
                        return (oOptions.currentScript !== false ?
                            _document.currentScript || _document_scripts[_document_scripts.length] || doFind() :
                            doFind()
                        );
                    } //# current
                }, //# script

                //#
                options: function (vTarget) {
                    var vOptions, sOptions,
                        _element = core.type.dom.mk(vTarget, _undefined),
                        vReturnVal /*= _undefined*/
                    ;

                    //# If we were able to locate the vTarget
                    if (core.type.dom.is(_element)) {
                        //# Process the sOptions/vOptions, first trying to .resolve the reference in our _window then as .json and finally calling any function references
                        sOptions = _element.getAttribute("options");
                        vOptions = core.resolve(_window, sOptions);
                        vReturnVal = core.type.fn.call(vOptions, _window, _element) || vOptions || core.type.obj.mk(sOptions, _undefined) || sOptions;
                    }

                    return vReturnVal;
                }, //# options


                //# template literal pseudo-polyfill
                //#     NOTE: Mostly dumb 2-line version of https://github.com/sindresorhus/multiline from https://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript
                templateLiteral: function (fnTemplate) {
                    var sTemplate = fnTemplate.toString();
                    return sTemplate.slice(sTemplate.indexOf("/*") + 2, sTemplate.lastIndexOf("*/") - sTemplate.length);
                }, //# templateLiteral


                //#
                component: core.extend(
                    function (vTarget, sTemplateName, oOptions) {
                        var _compiled, sID, sSrc,
                            _template = _document_querySelector("TEMPLATE[name='" + sTemplateName + "']"),
                            _target = core.type.dom.mk(vTarget),
                            oContext /*= undefined*/
                        ;

                        //#
                        function error() {
                            core.io.console.error("ish.ui.dom.component: No DOM objects matching TEMPLATE[name='" + sTemplateName + "'] and/or " + vTarget);
                        }

                        //# Ensure we have an .is .obj for the passed oOptions
                        oOptions = core.type.obj.mk(oOptions);
                        oContext = core.type.obj.mk(oOptions.context);
                        sSrc = core.type.str.mk(_target.getAttribute("src"), oOptions.src || "");

                        //# If we could locate the referenced _target and _template
                        if (core.type.dom.is(_target) && core.type.dom.is(_template)) {
                            //#
                            if (oOptions.replace !== false) {
                                _compiled = _document.createElement("DIV");
                                _compiled.innerHTML = _template.innerHTML;
                                _target.parentNode.replaceChild(_compiled, _target);
                                _target = _compiled;
                            }
                            //#
                            else {
                                _target.innerHTML = _template.innerHTML;
                            }

                            //#
                            sID = oDOM.getId(sTemplateName);
                            _target.setAttribute('id', sID);
                            oContext.$metadata = {
                                element: _target,
                                id: sID,
                                options: oOptions,
                                template: _template
                            };
                            _target.context = oContext;
                            loadScripts(_target, oOptions);
                            core.type.fn.call(oOptions.callback, _target, [true, _target, oContext /*, oOptions*/]);
                        }
                        //# Else if there is an sSrc available, pass the call into dom.include
                        else if (core.type.str.is(sSrc, true)) {
                            oDOM.include(sSrc, core.extend(oOptions.include, {
                                callback: function (bSuccess, _template, vArg, $xhr) {
                                    if (bSuccess) {
                                        oDOM.component(_target, sTemplateName, oOptions);
                                    }
                                    else {
                                        error();
                                    }

                                    //#
                                    core.type.fn.call(core.resolve(oOptions.include, "callback"), this, [bSuccess, _template, vArg, $xhr]);
                                }
                            }));
                        }
                        //#
                        else if (core.type.is.numeric(oOptions.poll)) {
                            core.type.fn.poll(
                                function () {
                                    return core.type.dom.is(_document_querySelector("TEMPLATE[name='" + sTemplateName + "']"));
                                },
                                {
                                    onsuccess: function () {
                                        oDOM.component(_target, sTemplateName, oOptions);
                                    },
                                    onfailure: error,
                                    timeout: oOptions.poll,
                                    wait: 100
                                }
                            )();
                        }
                        else {
                            error();
                        }
                    }, {
                        context: function (vSelector) {
                            return oDOM.getByLineage(vSelector, "context", { test: 'p' }).value;
                        } //# context
                    }
                ), //# dom.component


                /*
                Function: matchesSelector
                Determines if the passed DOM reference matches the passed selector.
                Parameters:
                _element - The DOM reference to interrogate.
                sSelector - The selector to match on.
                Returns:
                Boolean value representing if the DOM element matches the selector.
                About:
                From: http://davidwalsh.name/essential-javascript-functions
                */
                matchesSelector: function (vElement, sSelector) {
                    var _element_prototype = Element.prototype,
                        fnTest = _element_prototype.matches ||
                            _element_prototype.webkitMatchesSelector ||
                            _element_prototype.mozMatchesSelector ||
                            _element_prototype.msMatchesSelector ||
                            function (s) {
                                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
                            },
                        _element = core.type.dom.mk(vElement, _undefined)
                    ;

                    return (_element && fnTest.call(_element, sSelector));
                }, //# dom.matchesSelector


                //#
                //#     TODO: Make able to set multiple vElements?
                setAttributes: function (vElement, oAttributes) {
                    var sKey,
                        _element = core.type.dom.mk(vElement, _undefined),
                        bReturnVal = (core.type.dom.is(_element) && core.type.obj.is(oAttributes, { nonEmpty: true }))
                    ;

                    if (bReturnVal) {
                        for (sKey in oAttributes) {
                            if (oAttributes.hasOwnProperty(sKey)) {
                                _element.setAttribute(sKey, oAttributes[sKey]);
                            }
                        }
                    }

                    return bReturnVal;
                }, //# dom.setAttributes


                //#
                getByLineage: function () {
                    //#
                    function byAttribute(_element, sAttributeName, oOptions) {
                        var sValue, bIgnoreBlanks;

                        //#
                        oOptions = core.type.obj.mk(oOptions);
                        bIgnoreBlanks = (oOptions.ignoreBlanks !== false);

                        //#
                        if (_element.hasAttribute(sAttributeName)) {
                            sValue = _element.getAttribute(sAttributeName);

                            if (!bIgnoreBlanks || sValue) {
                                return {
                                    //element: _element,
                                    value: sValue
                                };
                            }
                        }
                    } //# byAttribute

                    //#
                    function byProperty(_element, sPropertyName, oOptions) {
                        var sValue, bIgnoreBlanks;

                        //#
                        oOptions = core.type.obj.mk(oOptions);
                        bIgnoreBlanks = (oOptions.ignoreBlanks !== false);

                        //#
                        if (_element.hasOwnProperty(sPropertyName)) {
                            sValue = _element[sPropertyName];

                            if (!bIgnoreBlanks || sValue) {
                                return {
                                    //element: _element,
                                    value: sValue
                                };
                            }
                        }
                    } //# byProperty

                    //#
                    function byAny(_element, sTarget, oOptions) {
                        return byAttribute(_element, sTarget, oOptions) || byProperty(_element, sTarget, oOptions);
                    } //# byAny

                    //#
                    function get(vElement, sTarget, oOptions) {
                        var iMaxDepth, oTest, bCustomTest, fnTest,
                            _element = core.type.dom.mk(vElement, _undefined),
                            oReturnVal = {
                                element: _undefined,
                                value: _undefined,
                                depth: 0
                            }
                        ;

                        //#
                        oOptions = core.type.obj.mk(oOptions);
                        iMaxDepth = core.type.int.mk(oOptions.maxDepth, -1);
                        bCustomTest = core.type.fn.is(oOptions.test);
                        fnTest = (
                            bCustomTest ?
                            oOptions.test :
                            function (sTest) {
                                switch (core.type.str.mk(sTest).substr(0, 1).toLowerCase()) {
                                    case "p": { //# property
                                        return byProperty;
                                    }
                                    case "*": { //# "any"
                                        return byAny;
                                    }
                                    //case "a": //# attribute
                                    default: {
                                        return byAttribute;
                                    }
                                }
                            }(oOptions.test)
                        );

                        //#
                        if (bCustomTest || core.type.str.is(sTarget, true)) {
                            while (core.type.dom.is(_element)) {
                                oTest = fnTest(_element, sTarget, oOptions);

                                //#
                                if (core.type.obj.is(oTest)) {
                                    oReturnVal.element = _element;
                                    oReturnVal.value = oTest.value;
                                    //core.extend(oReturnVal, oTest);
                                    break;
                                }

                                //#
                                if (iMaxDepth === 0) {
                                    break;
                                }

                                //#
                                _element = _element.parentElement;
                                oReturnVal.depth++;
                                iMaxDepth--;
                            }
                        }

                        return oReturnVal;
                    } //# get

                    //#
                    return core.extend(get, {
                        attribute: function (vElement, sTarget, oOptions) {
                            return byAttribute(core.type.dom.mk(vElement, null), sTarget, oOptions);
                        },
                        property: function (vElement, sTarget, oOptions) {
                            return byProperty(core.type.dom.mk(vElement, null), sTarget, oOptions);
                        },
                        any: function (vElement, sTarget, oOptions) {
                            return byAny(core.type.dom.mk(vElement, null), sTarget, oOptions);
                        }
                    });
                }(), //# dom.getByLineage


                //# TODO: Remove
                getId: function (sPrefix) {
                    var sID;

                    sPrefix = core.type.str.mk(sPrefix);

                    do {
                        sID = sPrefix + Math.random().toString(36).substr(2,5);
                    } while (_document.getElementById(sID));

                    return sID;
                }, //# dom.getId


                //#
                input: {
                    //#
                    //#     TODO: Update to: https://www.wintellect.com/data-binding-pure-javascript/
                    /*
                    function Binding(b) {
                        _this = this
                        this.elementBindings = []
                        this.value = b.object[b.property]
                        this.valueGetter = function(){
                            return _this.value;
                        }
                        this.valueSetter = function(val){
                            _this.value = val
                            for (var i = 0; i < _this.elementBindings.length; i++) {
                                var binding=_this.elementBindings[i]
                                binding.element[binding.attribute] = val
                            }
                        }
                        this.addBinding = function(element, attribute, event){
                            var binding = {
                                element: element,
                                attribute: attribute
                            }
                            if (event){
                                element.addEventListener(event, function(event){
                                    _this.valueSetter(element[attribute]);
                                })
                                binding.event = event
                            }
                            this.elementBindings.push(binding)
                            element[attribute] = _this.value
                            return _this
                        }

                        Object.defineProperty(b.object, b.property, {
                            get: this.valueGetter,
                            set: this.valueSetter
                        });

                        b.object[b.property] = this.value;
                    }


                    var obj = {a:123}
                    var myElement = document.getElementById("myText")
                    new Binding({
                        object: obj,
                        property: "a",
                        element: myElement,
                        attribute: "value",
                        event: "keyup"
                    })
                    */
                    bind: function (vFormElements) {
                        var a__elements, _element, a_sPath, oModel, vCurrentValue, sTarget, i;

                        //# If the passed vFormElements .is.selector, collect them via .querySelectorAll
                        if (core.type.str.is.selector(vFormElements)) {
                            a__elements = _document.querySelectorAll(vFormElements);
                        }
                        //# Else if the passed vFormElements is a string, attempt to .mk it a .dom then set it into a__elements
                        else if (core.type.str.is(vFormElements)) {
                            _element = core.type.dom.mk(vFormElements, null);
                            a__elements = (_element ? [_element] : null);
                        }
                        //# Else if the passed vFormElements .is an .arr, set it into a__elements
                        else if (core.type.arr.is(vFormElements)) {
                            a__elements = vFormElements;
                        }
                        //# Else if no arguments were passed, assume a selector of [model] to populate the a__elements
                        else if (arguments.length === 0) {
                            a__elements = _document.querySelectorAll("[model]");
                        }

                        //# If the a__elements .is.collection
                        if (core.type.is.collection(a__elements, { disallow0Length: true, allowArray: true })) {
                            //# Traverse the a__elements, setting the current _element and sTarget as we go
                            for (i = 0; i < a__elements.length; i++) {
                                _element = a__elements[i];
                                sTarget = _element.getAttribute("model");

                                //# If the current _element and sTarget are valid
                                if (core.type.dom.is(_element) && core.type.str.is(sTarget, true)) {
                                    if (!_element.bound) {
                                        a_sPath = sTarget.split(".");
                                        sTarget = a_sPath.pop();
                                        _element.bound = true;
                                        oModel = (core.type.arr.is(a_sPath, true) ? core.resolve(true, _window, a_sPath) : _window);
                                        vCurrentValue = oModel[sTarget];

                                        //# TODO: Move out of loop
                                        (function (_element, oModel, sTarget) {
                                            Object.defineProperty(
                                                oModel,
                                                sTarget,
                                                {
                                                    get: function() {
                                                        return core.ui.dom.input.value(_element);
                                                    },
                                                    set: function(x) {
                                                        core.ui.dom.input.value(_element, x);
                                                        _element.onchange();
                                                    }
                                                }
                                            );
                                            oModel[sTarget] = vCurrentValue;
                                        }(_element, oModel, sTarget));
                                    }
                                }
                                //#
                                else {
                                    throw "[model] cannot be blank - " + _element.outerHTML;
                                }
                            }
                        }
                    }, //# dom.input.bind


                    //#
                    value: function (vFormElement, vNewValue) {
                        var i, a__formElements,
                            vReturnVal /* = _undefined */,
                            bSet = (arguments.length > 1),
                            _formElement = core.type.dom.mk(vFormElement, null)
                        ;

                        //# If a (seemingly) valid _formElement was passed
                        if (_formElement && _formElement.type) {
                            //# Determine the _formElement's .type, collecting it's .value into our vReturnVal (optionally bSet'ing it to vNewValue as we go)
                            switch (_formElement.type.toLowerCase()) {
                                case 'text':
                                case 'textarea':
                                case 'password':
                                case 'hidden':
                                case 'button':
                                case 'submit':
                                case 'reset': {
                                    if (bSet) {
                                        _formElement.value = vNewValue;
                                    }
                                    vReturnVal = _formElement.value;
                                    break;
                                }

                                case 'radio': {
                                    //# Pull the group of radio buttons based on their .name
                                    a__formElements = document.querySelectorAll("input[type='radio'][name='" + _formElement.name + "']");

                                    //# If we were able to locate our related a__formElements, default our vReturnVal
                                    if (a__formElements && a__formElements.length > 0) {
                                        vReturnVal = "";

                                        //# Traverse the a__formElements's looking for the .checked (and new vNewValue)
                                        for (i = 0; i < a__formElements.length; i++) {
                                            if (bSet && a__formElements[i].value === vNewValue) {
                                                a__formElements[i].checked = core.type.bool.mk(vNewValue, a__formElements[i].value === vNewValue);
                                            }

                                            //# Set our vReturnVal based on if the current a__formElements is .checked, setting our vReturnVal and falling from the loop if so
                                            if (a__formElements[i].checked) {
                                                vReturnVal = a__formElements[i].value;
                                                break;
                                            }
                                        }
                                    }
                                    //# Else we couldn't find our related a__formElements, so treat the _formElement as a checkbox (the old logic)
                                    else {
                                        vReturnVal = input_value_CheckboxOrRadio(_formElement, vNewValue, bSet);
                                    }

                                    break;
                                }

                                case 'checkbox': {
                                    vReturnVal = input_value_CheckboxOrRadio(_formElement, vNewValue, bSet);
                                    break;
                                }

                                case 'select-one': {
                                    if (bSet) {
                                        _formElement.value = vNewValue;
                                    }
                                    vReturnVal = _formElement.options[_formElement.selectedIndex].value;
                                    break;
                                }

                                case 'select-multiple': {
                                    //# Reset our vReturnVal to an array
                                    vReturnVal = [];

                                    //# If we are to bSet the vNewValue
                                    if (bSet) {
                                        //# If the vNewValue is an array of values, traverse the _formElement's .options, .selected'ing each that has it's .value within vNewValue
                                        if (core.type.arr.is(vNewValue)) {
                                            for (i = 0; i < _formElement.options.length; i++) {
                                                _formElement.options[i].selected = vNewValue.indexOf(_formElement.options[i].value) > -1;
                                            }
                                        }
                                        //# Else a single value was passed, so reset the _formElement's .value
                                        else {
                                            _formElement.value = vNewValue;
                                        }
                                    }

                                    //# Traverse the _formElement's .options
                                    for (i = 0; i < _formElement.options.length; i++) {
                                        //# If the current .option is .selected, .push its .value into our vReturnVal
                                        if (_formElement.options[i].selected) {
                                            vReturnVal.push(_formElement.options[i].value);
                                        }
                                    }
                                    break;
                                }

                                //case 'image':
                                //case 'file':
                            }

                            return vReturnVal;
                        }
                    } //# dom.input.value

                    /*
                    updated: function(sFormName, sInputName) {
                        var a_oInput = new Array(null);
                        var bReturn = false;
                        var iReturnIndex = 0;
                        var oInput, i;

                            //#### Collect the oInput based on the passed arguments
                        oInput = this.Input(sFormName, sInputName)

                            //#### If the oInput was successfully collected above
                        if (oInput) {
                                //#### If the passed oInput represents a single input, place it into the 0th element in a_oInput
                            if (oInput.type) {
                                a_oInput[0] = oInput;
                            }
                                //#### Else the passed oInput (probably) represents multiple inputs, so it into a_oInput
                            else {
                                a_oInput = oInput;
                            }

                                //#### If the above determined a_oInput is an array
                            if (! isNaN(a_oInput.length)) {
                                    //#### Traverse the above determined a_oInput
                                for (i = 0; i < a_oInput.length; i++) {
                                        //#### If the current a_oInput is valid
                                    if (a_oInput[i] && a_oInput[i].type) {
                                            //#### Determine the .toLowerCase'd .type of the current a_oInput and process accordingly
                                        switch (a_oInput[i].type.toLowerCase()) {
                                            case 'text':
                                            case 'textarea':
                                            case 'password': {
                                                    //#### If the a_oInput's .value differs from its .defaultValue, reset the bReturn value to true
                                                if (a_oInput[i].value != a_oInput[i].defaultValue) {
                                                    bReturn = true;
                                                }
                                                break;
                                            }

                                            case 'radio':
                                            case 'checkbox': {
                                                    //#### If the a_oInput's .checked value differs from its .defaultChecked value, reset the bReturn value to true
                                                if (a_oInput[i].checked != a_oInput[i].defaultChecked) {
                                                    bReturn = true;
                                                }
                                                break;
                                            }

                                            case 'select-one':
                                            case 'select-multiple': {
                                                var j;
                                                var bDefaultValueSpecified = false;

                                                    //#### Traverse the a_oInput's .options to determine if the developer specified any as .defaultSelected
                                                for (j = 0; j < a_oInput[i].options.length; j++) {
                                                        //#### If the current .option is set as .defaultSelected, flip bDefaultValueSpecified and fall from the loop
                                                    if (a_oInput[i].options[j].defaultSelected) {
                                                        bDefaultValueSpecified = true;
                                                        break;
                                                    }
                                                }

                                                    //#### (Re)Traverse the a_oInput's .options
                                                for (j = 0; j < a_oInput[i].options.length; j++) {
                                                        //#### If the developer set some .defaultSelected .options
                                                    if (bDefaultValueSpecified) {
                                                            //#### If the a_oInput's .selected value differs from its .defaultSelected value, reset the bReturn value to true and fall from the loop
                                                        if (a_oInput[i].options[j].selected != a_oInput[i].options[j].defaultSelected) {
                                                            bReturn = true;
                                                            break;
                                                        }
                                                    }
                                                        //#### Else there are not any .defaultSelected .options set, so if the user has selected something other then the first .option, reset the bReturn value to true
                                                    else if (a_oInput[i].options[j].selected && j != 0) {
                                                        bReturn = true;
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                    }

                                        //#### If the bReturn value was flipped above, fall from the loop
                                    if (bReturn) {
                                        break;
                                    }
                                }
                            }
                        }

                            //#### Return the above determined bReturn value to the caller
                        return bReturn;
                    };
                    */
                } //# dom.input
            });

            return {
                dom: oDOM
            };
        }); //# core.ui
    }, { baseUrl: "" }); //# core.ui.dom

    //# .fire the plugin's loaded event
    core.io.event.fire("ish.ui.dom");

    //# Return core to allow for chaining
    return core;

}(document.querySelector("SCRIPT[ish]").ish)); //# Web-only
//</MIXIN>
