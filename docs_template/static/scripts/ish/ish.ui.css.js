//################################################################################################
/** @file Browser-based CSS mixin for ish.js
 * @mixin ish.ui.css
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2023, Nick Campbell
 * @ignore
 */ //############################################################################################
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
/*jslint bitwise: true */                                       //# Enable bitwise operators for JSHint
//<MIXIN>
(function (core) {
    'use strict';

    /*
    ####################################################################################################
    Class: core.css
    CSS-manipulation functionality.
    Requires:
    <core.resolve>, <core.extend>,
    <core.type.arr.is>,
    <core.type.dom.mk>, <core.type.str.mk>, <core.type.obj.mk>, <core.type.int.mk>
    ####################################################################################################
    */
    core.oop.partial(core.ui, function (/*oProtected*/) {
        var _defaultStyle,
            _head = document.head
        ;

        //#
        function hasClass(vElement, sClassName) {
            var _element = core.type.dom.mk(vElement);

            if (_element.classList) {
                return _element.classList.contains(sClassName);
            }
            else {
                return !!_element.className.match(new RegExp('(\\s|^)' + sClassName + '(\\s|$)'));
            }
        } //# hasClass


        //#
        return {
            css: {
                insertRules: function (vRules, oOptions) {
                    var _style, _sheet, iRulesCount, iIndex, i,
                        a_sRules = (core.type.arr.is(vRules) ? vRules : [core.type.str.mk(vRules)])
                    ;

                    //# Ensure the passed oOptions .is .obj then calculate our _style and iIndex
                    oOptions = core.type.obj.mk(oOptions);
                    _style = core.type.dom.mk(oOptions.style, _defaultStyle);
                    iIndex = core.type.int.mk(oOptions.index, -1);

                    //# If the _style was not successfully calculated above, we need to setup our _defaultStyle
                    if (!_style) {
                        //# .createElement, do the WebKit hack then .append it into the _head
                        _defaultStyle = _style = document.createElement('style');
                        _defaultStyle.appendChild(document.createTextNode(''));
                        _head.appendChild(_defaultStyle);
                    }

                    //# Now that we definitly have a _style, determine its _sheet and iRulesCount
                    _sheet = _style.sheet;
                    iRulesCount = core.type.int.mk(core.resolve(_sheet, "cssRules.length"), -1);

                    //#
                    if (_sheet) {
                        //# If we are to .insertRules at the end of the _style, traverse the passed a_sRules from 0-n, .insert(ing each)Rule as we go
                        if (iIndex < 0) {
                            for (i = 0; i < a_sRules.length; i++) {
                                _sheet.insertRule(a_sRules[i], iRulesCount + i);
                            }
                        }
                        //# Else we are to .insertRules at a specific iIndex, so traverse the passed a_sRules from n-0 .insert(ing each)Rule in passed array order
                        else {
                            for (i = a_sRules.length; i > 0; i--) {
                                _sheet.insertRule(a_sRules[i], iIndex);
                            }
                        }
                    }

                    return _style;
                }, //# css.insertRules

                /**
                 * Increase/Decrease the lightness of a color in the hex color format by an absolute amount.
                 *
                 * @param {String} color      The string of the specified color.
                 * @param {Number} amount     The percentage 0-100.
                 *
                 * @return {String}           The lighten or darken color in hex color format.
                 */
                adjustColor: function (sColor, iPercent) {
                    var iColor, iR, iG, iB,
                        bPound /* = false */
                    ;

                    //# Parse the passed sColor and iPercent, removing and noting any leading bPound as we go
                    sColor = core.type.str.mk(sColor);
                    if (sColor[0] === "#") {
                        sColor = sColor.slice(1);
                        bPound = true;
                    }
                    iColor = parseInt(sColor, 16);
                    iPercent = core.type.int.mk(iPercent);

                    //# Calculate the new RGB hex-color based on the passed iPercent
                    //#     NOTE: iPercent does not need to be ranged to -100:100 like iR/iG/iB below because they are ranged 0:255
                    iR = (iColor >> 16) + iPercent;
                    iR = (iR > 255 ? 255 : (iR < 0 ? 0 : iR));
                    iG = (iColor & 0x0000FF) + iPercent;
                    iG = (iG > 255 ? 255 : (iG < 0 ? 0 : iG));
                    iB = ((iColor >> 8) & 0x00FF) + iPercent;
                    iB = (iB > 255 ? 255 : (iB < 0 ? 0 : iB));

                    //# Prepend a leading bPound if one was passed, then calculate the base-16 RGB hex-color calculated above, returnign the result to the caller
                    return (bPound ? "#" : "") + (iG | (iB << 8) | (iR << 16)).toString(16);
                }, //# css.adjustColor

                //#
                class: core.extend(hasClass, {
                    has: hasClass,

                    add: function (vElement, sClassName) {
                        var _element = core.type.dom.mk(vElement);

                        if (_element.classList) {
                            _element.classList.add(sClassName);
                        }
                        else if (!hasClass(_element, sClassName)) {
                            _element.className += " " + sClassName;
                        }
                    }, //# css.class.add

                    rm: function (vElement, sClassName) {
                        var _element = core.type.dom.mk(vElement);

                        if (_element.classList) {
                            _element.classList.remove(sClassName);
                        }
                        else if (hasClass(_element, sClassName)) {
                            _element.className = _element.className.replace(new RegExp('(\\s|^)' + sClassName + '(\\s|$)'), ' ');
                        }
                    }, //# css.class.rm

                    toggle: function (vElement, sClassName) {
                        var _element = core.type.dom.mk(vElement);

                        if (hasClass(_element, sClassName)) {
                            hasClass.rm(_element, sClassName);
                        }
                        else {
                            hasClass.add(_element, sClassName);
                        }
                    } //# css.class.toggle
                }) //# css.class
            }
        };
    }); //# core.ui.css

    //# .fire the plugin's loaded event
    core.io.event.fire("ish.ui.css");

    //# Return core to allow for chaining
    return core;

}(window.head.ish || document.querySelector("SCRIPT[ish]").ish)); //# Web-only
//</MIXIN>
