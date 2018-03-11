/*
####################################################################################################
Class: ish
ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
By: Nick Campbell
License: MIT
####################################################################################################
*/
!function (core) {
    'use strict';

    var _window = window,                                                           //# code-golf
        _document = document,                                                       //# code-golf
        _head = _document.head,                                                     //# code-golf
        _undefined /*= undefined*/,                                                 //# code-golf
        _document_querySelector = _document.querySelector.bind(_document),          //# code-golf
        _document_querySelectorAll = _document.querySelectorAll.bind(_document)     //# code-golf
    ;

    //# 
    if (!core.type.fn.is(core.io.net.xhr)) {
        core.require(['ish.io.net']/*, function (a_oScripts, bAllLoaded) {}, { onerror: function (_script) {} }*/);
    }


    /*
    ####################################################################################################
    Class: core.dom
    DOM-manipulation functionality.
    Requires:
    <core.extend>, <core.resolve>, 
    <core.type.str.is>, <core.type.dom.is>, <core.type.num.is>, <core.type.obj.is>, <core.type.fn.is>, 
    <core.type.dom.mk>, <core.type.arr.mk>, <core.type.obj.mk>, <core.type.json.mk>, <core.type.str.mk>, <core.type.int.mk>, 
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
            //#     NOTE: The [attributes] set on or by the passed vFirstArg take presidence over values set in oOptions
            if (_a.length > 1) {
                oOptions = _a[1];
                _replace = core.type.dom.mk(vFirstArg, _undefined);

                //# If the vFirstArg .is.dom, pull the [src] (if any) from the DOM element to _replace
                if (_replace) {
                    vTemp = _replace.getAttribute("src") || oOptions.src;
                }
                //# Else we need to pull our DOM element to _replace from the oOptions (if any)
                else {
                    //_replace = core.type.dom.mk(oOptions.replace, _undefined);

                    //# If the vFirstArg .is.str, (eventually) set it into our .src
                    if (core.type.str.is(vFirstArg, true)) {
                        vTemp = vFirstArg;
                    }
                }
            }
            //# Else we were only passed oOptions
            else {
                oOptions = vFirstArg;
                _replace = core.type.dom.mk(oOptions.replace, _undefined);
                //# If the vFirstArg .is.dom, pull the [src] (if any) from the DOM element to _replace
                if (_replace) {
                    vTemp = _replace.getAttribute("src") || oOptions.src;
                }
            }

            //# Ensure the passed oOptions is a new object then default .async to true unless it's specificially set to false and set the above resolved .url (in vTemp)
            oOptions = core.extend({}, oOptions); //, oDOM.options(_replace)
            oOptions.async = (oOptions.async !== false);
            oOptions.src = vTemp;
            _replace = _replace || core.type.dom.mk(oOptions.replace, _undefined);

            //# Configure the $xhr to retrieve the .src
            $xhr = core.io.net.xhr(oOptions.src, "GET", oOptions.async, function (bSuccess, oTextData, vArg, $xhr) {
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

            //# Ensure the passed oOptions .is.obj then collect the a__scripts
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

                    //# Ensure the passed oOptions .is.obj then determine if we are to be bCaseSensitive
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

                    //# Ensure the passed oOptions .is.obj
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
                if (core.type.dom.type(_element)) {
                    //# Process the sOptions/vOptions, first trying to .resolve the reference in our _window then as .json and finially calling any function references
                    sOptions = _element.getAttribute("options");
                    vOptions = core.resolve(_window, sOptions);
                    vReturnVal = core.type.fn.call(vOptions, _window, _element) || vOptions || core.type.json.mk(sOptions, _undefined) || sOptions;
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
                        core.io.console.err("ish.ui.dom.component: No DOM objects matching TEMPLATE[name='" + sTemplateName + "'] and/or " + vTarget);
                    }

                    //# Ensure we have an .is.obj for the passed oOptions
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
                    else if (core.type.num.is(oOptions.poll)) {
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


            //#
            getId: function (sPrefix) {
                var sID;

                sPrefix = core.type.str.mk(sPrefix);

                do {
                    sID = sPrefix + Math.random().toString(36).substr(2,5);
                } while (_document.getElementById(sID));

                return sID;
            } //# dom.getId
        });

        return {
            dom: oDOM
        };
    }); //# core.ui

}(document.getElementsByTagName("HTML")[0].ish);
