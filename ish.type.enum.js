//################################################################################################
/** @file Enumerations mixin for ish.js
 * @mixin ish.type.enum
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 */ //############################################################################################
/*global module, define */                                      //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core) {

        //# .require the necessary ish plugins
        //#     NOTE: core.require includes the required scripts/CSS then runs the provided function
        core.require(["ish.io.net.js", "ish.type-ex.js"], function (/*a_sUrls, bAllLoaded*/) {
            //################################################################################################
            /** Collection of Enumeration-based functionality.
             * @namespace ish.type.enum
             * @ignore
             */ //############################################################################################
            core.oop.partial(core.type, function (/*oProtected*/) {
                var g_oEnums = {};

                //#
                function processOptions(vOptions) {
                    var oReturnVal = core.extend({
                            asEntry: (vOptions === true)
                            //compare: function (x, y) {
                            //    return (x === y);
                            //}
                        }, vOptions)
                    ;

                    //# If the vOptions had "i" set in the .compare, reset it to be .caseInsensitive
                    if (oReturnVal.compare === true || oReturnVal.compare === "i") { //# TODO: Remove "i"
                        oReturnVal.compare = core.type.str.cmp;
                    }
                    //# Else if .compare !.is .fn then set it to the default .compare'son function
                    else if (!core.type.fn.is(oReturnVal.compare)) {
                        oReturnVal.compare = function (x, y) {
                            return (x == y);
                        };
                    }

                    return oReturnVal;
                } //# processOptions

                //#
                function processCompareOnly(vCompare) {
                    return processOptions({
                        compare: (core.type.fn.is(vCompare) || vCompare === true || vCompare === "i" ? vCompare : undefined)
                    });
                } //# processCompareOnly

                //#
                function xcoder(sEnumName, sValue, vOptions, fnCompare) {
                    var i,
                        oReturnVal = {
                            value: sValue,
                            label: sValue,
                            notFound: true
                        },
                        a_oEnum = core.resolve(g_oEnums, sEnumName)
                    ;

                    //# If the sEnumName is valid, traverse it looking for a matching .value, setting our oReturnVal if found
                    if (core.type.arr.is(a_oEnum, true)) { //#
                        //#
                        for (i = 0; i < a_oEnum.length; i++) {
                            if (fnCompare(a_oEnum[i], vOptions)) {
                                oReturnVal = a_oEnum[i];
                                break;
                            }
                            else if (a_oEnum[i].value === undefined) {
                                oReturnVal.value = a_oEnum[i].value;
                                oReturnVal.label = a_oEnum[i].label;
                                oReturnVal.notFound = false;
                            }
                        }
                    }

                    return oReturnVal;
                } //# xcoder

                //#
                function enumAsObj(a_oEnum) {
                    var oCurrent, i,
                        oReturnVal /*= undefined*/
                    ;

                    //# If we have an a_oEnum .arr to traverse, reset our oReturnVal to an object
                    if (core.type.arr.is(a_oEnum, true)) {
                        oReturnVal = {};

                        //# Traverse our a_oEnum, entering each valid .value/.label into our oReturnVal
                        for (i = 0; i < a_oEnum.length; i++) {
                            oCurrent = a_oEnum[i];
                            if (core.type.obj.is(oCurrent)) {
                                oReturnVal[oCurrent.label] = oCurrent.value;
                            }
                        }
                    }

                    return oReturnVal;
                } //# enumAsObj


                return {
                    //#########
                    /** Determines the enumeration data for the passed value.
                     * @function ish.type.enum.!
                     * @param {string} sEnum Value representing the enumeration to interrogate.
                     * @param {boolean} [bAsObj=false] Value representing if the return value is to be represented by a simplified <code>{ label: value }</code>-based object.
                     * @returns {object[]|object} Value representing the enumeration data.
                     */ //#####
                    enum: core.extend(
                        function (sEnum, bAsObj) {
                            var a_oReturnVal = core.resolve(g_oEnums, sEnum);

                            return (bAsObj ? enumAsObj(a_oReturnVal) : a_oReturnVal);
                        }, {
                            //#########
                            /** Determines if the passed value represents a <code>label</code> or <code>value</code> within the passed enumeration entry.
                             * @function ish.type.enum.is
                             * @param {string} sEnum Value representing the enumeration to interrogate.
                             * @param {variant} vValue Value to interrogate within the passed enumeration representing a <code>label</code> or <code>value</code>.
                             * @param {boolean|function} [vCompare=function (x, y) { return (x == y); }] Value representing if the comparison is to be case-insensitive or the function to execute the comparisons.
                             * @returns {boolean} Value representing if the passed value represents a <code>label</code> or <code>value</code> within the passed enumeration entry.
                             */ //#####
                            is: core.extend(
                                function (sEnum, vValue, vCompare) {
                                    var vReturnVal;

                                    //#
                                    vReturnVal = xcoder(sEnum, vValue, processCompareOnly(vCompare), function (oPicklistEntry, oOptions) {
                                        return oOptions.compare(oPicklistEntry.label, vValue) || oOptions.compare(oPicklistEntry.value, vValue);
                                    });

                                    return (vReturnVal.notFound !== true && vReturnVal.value !== undefined);
                                }, {
                                    //#########
                                    /** Determines if the passed value represents a <code>label</code> within the passed enumeration entry.
                                     * @function ish.type.enum.is:label
                                     * @param {string} sEnum Value representing the enumeration to interrogate.
                                     * @param {string} sValue Value to interrogate within the passed enumeration representing a <code>label</code>.
                                     * @param {boolean|function} [vCompare=function (x, y) { return (x == y); }] Value representing if the comparison is to be case-insensitive or the function to execute the comparisons.
                                     * @returns {boolean} Value representing if the passed value represents a <code>label</code> within the passed enumeration entry.
                                     */ //#####
                                    label: function (sEnum, sValue, vCompare) {
                                        var vReturnVal;

                                        //#
                                        vReturnVal = xcoder(sEnum, sValue, processCompareOnly(vCompare), function (oPicklistEntry, oOptions) {
                                            return oOptions.compare(oPicklistEntry.label, sValue);
                                        });

                                        return (vReturnVal.notFound !== true && vReturnVal.value !== undefined);
                                    }, //# type.enum.is.label

                                    //#########
                                    /** Determines if the passed value represents a <code>value</code> within the passed enumeration entry.
                                     * @function ish.type.enum.is:value
                                     * @param {string} sEnum Value representing the enumeration to interrogate.
                                     * @param {variant} vValue Value to interrogate within the passed enumeration representing a <code>value</code>.
                                     * @param {boolean|function} [vCompare=function (x, y) { return (x == y); }] Value representing if the comparison is to be case-insensitive or the function to execute the comparisons.
                                     * @returns {boolean} Value representing if the passed value represents a <code>value</code> within the passed enumeration entry.
                                     */ //#####
                                    value: function (sEnum, vValue, vCompare) {
                                        var vReturnVal;

                                        //#
                                        vReturnVal = xcoder(sEnum, vValue, processCompareOnly(vCompare), function (oPicklistEntry, oOptions) {
                                            return oOptions.compare(oPicklistEntry.value, vValue);
                                        });

                                        return (vReturnVal.notFound !== true && vReturnVal.value !== undefined);
                                    }
                                } //# type.enum.is.value
                            ), //# type.enum.is

                            //#########
                            /** Casts the passed value into an enumeration.
                             * @function ish.type.enum.mk
                             * @param {string} sEnum Value representing the enumeration to interrogate.
                             * @param {variant} vValue Value to interrogate within the passed enumeration representing a <code>value</code>.
                             * @param {boolean|object} [vOptions] Value representing if the full enumeration entry is to be returned or the desired options:
                             *      @param {boolean} [vOptions.asEntry=false] Value representing if the full enumeration entry is to be returned.
                             *      @param {boolean|function} [vOptions.compare=function (x, y) { return (x == y); }] Value representing if the comparison is to be case-insensitive or the function to execute the comparison.
                             * @returns {variant|object} Value representing the passed value as an enumeration.
                             */ //#####
                            mk: function (sEnum, vValue, vOptions) { // vDefault
                                var vReturnVal;

                                //#
                                vOptions = processOptions(vOptions);
                                vReturnVal = xcoder(sEnum, vValue, vOptions, function (oPicklistEntry, oOptions) {
                                    return oOptions.compare(oPicklistEntry.label, vValue) || oOptions.compare(oPicklistEntry.value, vValue);
                                });

                                return (vOptions.asEntry ? vReturnVal : vReturnVal.value);
                            },

                            //#########
                            /** Encodes the passed value as an enumeration.
                             * @function ish.type.enum.encode
                             * @param {string} sEnum Value representing the enumeration to interrogate.
                             * @param {string} sLabel Value to interrogate within the passed enumeration representing a <code>label</code>.
                             * @param {boolean|object} [vOptions] Value representing if the full enumeration entry is to be returned or the desired options:
                             *      @param {boolean} [vOptions.asEntry=false] Value representing if the full enumeration entry is to be returned.
                             *      @param {boolean|function} [vOptions.compare=function (x, y) { return (x == y); }] Value representing if the comparison is to be case-insensitive or the function to execute the comparison.
                             * @returns {variant|object} Value representing the passed value as an enumeration.
                             */ //#####
                            encode: function (sEnum, sLabel, vOptions) {
                                var oReturnVal;

                                //#
                                vOptions = processOptions(vOptions);
                                oReturnVal = xcoder(sEnum, sLabel, vOptions, function (oPicklistEntry, oOptions) {
                                    return oOptions.compare(oPicklistEntry.label, sLabel);
                                });

                                //#
                                return (vOptions.asEntry ? oReturnVal : oReturnVal.value);
                            }, //# data.enum.encode

                            //#########
                            /** Decodes the passed value as an enumeration.
                             * @function ish.type.enum.decode
                             * @param {string} sEnum Value representing the enumeration to interrogate.
                             * @param {variant} vValue Value to interrogate within the passed enumeration representing a <code>value</code>.
                             * @param {boolean|object} [vOptions] Value representing if the full enumeration entry is to be returned or the desired options:
                             *      @param {boolean} [vOptions.asEntry=false] Value representing if the full enumeration entry is to be returned.
                             *      @param {boolean|function} [vOptions.compare=function (x, y) { return (x == y); }] Value representing if the comparison is to be case-insensitive or the function to execute the comparison.
                             * @returns {string|object} Value representing the passed value as an enumeration.
                             */ //#####
                            decode: function (sEnum, vValue, vOptions) {
                                var oReturnVal;

                                //#
                                vOptions = processOptions(vOptions);
                                oReturnVal = xcoder(sEnum, vValue, vOptions, function (oPicklistEntry, oOptions) {
                                    return oOptions.compare(oPicklistEntry.value, vValue);
                                });

                                //#
                                return (vOptions.asEntry ? oReturnVal : oReturnVal.label);
                            }, //# data.enum.decode

                            //#########
                            /** Determines if the passed value represents an enumeration.
                             * @function ish.type.enum.exists
                             * @param {string} sEnum Value representing the enumeration to interrogate.
                             * @returns {boolean} Value representing if the passed value represents an enumeration.
                             */ //#####
                            exists: function (sEnum) {
                                return core.type.arr.is(core.resolve(g_oEnums, sEnum), true);
                            }, //# data.enum.exists

                            //#########
                            /** Loads the passed value as enumeration(s) into the existing collection.
                             * @$note If <code>vEnums</code> represents a URL, the <code>ish.io.net</code> Mixin is required in order to collect the JSON file.
                             * @function ish.type.enum.load
                             * @param {string|object} vEnums Value representing the URL to a JSON file or an object defining enumeration(s).
                             * @returns {boolean} Value representing if the passed value was successfully loaded.
                             */ //#####
                            load: function (vEnums) {
                                var bReturnVal = true;

                                //# TODO: Make inline alt core.io.net.get?
                                if (core.type.str.is(vEnums) && core.type.fn.is(core.resolve(core, "io.net.get"))) {
                                    //#
                                    core.io.net.get(vEnums, {
                                        contentType: 'application/json; charset=utf-8',
                                        fn: function (bSuccess, oResponse /*, vArg, $xhr*/) {
                                            bReturnVal = bSuccess;

                                            //#
                                            if (bReturnVal) {
                                                core.extend(g_oEnums, oResponse.data);
                                            }
                                        }
                                    });
                                }
                                //#
                                else if (core.type.obj.is(vEnums)) {
                                    core.extend(g_oEnums, vEnums);
                                }
                                //#
                                else {
                                    bReturnVal = false;
                                }

                                return bReturnVal;
                            }, //# data.enum.load

                            //#########
                            /** Returns a new instance of the base interface for an enumeration.
                             * @function ish.type.enum.interface
                             * @returns {object} Value representing the base interface for an enumeration.
                             */ //#####
                            interface: function () {
                                return {
                                    value: 0,
                                    label: ""
                                };
                            } //# data.enum.interface
                        }
                    )
                };
            }); //# core.type.enum

            //#
            //# <minRemove>
            if (core.test) {
                core.oop.partial(core.test, function (/*oProtected*/) {
                    return {
                        type: {
                            enum: {
                                _order: ["load"],

                                load: function ($ /*, results*/) {
                                    $.expect(1);
                                    $.assert.isOk(
                                        core.type.enum.load({
                                            deep: {
                                                enum: {
                                                    letters: [
                                                        { value: undefined, label: "unknown" },
                                                        { value: "a", label: "eh" },
                                                        { value: "b", label: "bee" },
                                                        { value: "c", label: "cee" },
                                                        { value: "d", label: "dee", more: "info" }
                                                    ]
                                                }
                                            },
                                            numbers: [
                                                { value: undefined, label: "unknown" },
                                                { value: 1, label: "one" },
                                                { value: 2, label: "two" },
                                                { value: 3, label: "three" },
                                                { value: 4, label: "four" },
                                                { value: 5, label: "five" }
                                            ]
                                        }),
                                        "type.enum.load"
                                    );
                                },

                                _: function ($) {
                                    $.expect(7);
                                    $.assert(core.type.enum("deep.enum.letters", true).unknown === undefined, "type.enum(deep, asObj)");
                                    $.assert(core.type.enum("numbers", true).one === 1, "type.enum(shallow, asObj)");

                                    $.assert(core.type.enum("deep.enum.letters")[2].value === "b", "type.enum(deep).value");
                                    $.assert(core.type.enum("deep.enum.letters")[3].label === "cee", "type.enum(deep).label");
                                    $.assert(core.type.enum("deep.enum.letters")[4].more === "info", "type.enum(deep).more");
                                    $.assert(core.type.enum("numbers")[4].value === 4, "type.enum(shallow).value");
                                    $.assert(core.type.enum("numbers")[5].label === "five", "type.enum(shallow).label");
                                },

                                is: function ($) {
                                    $.expect(16);
                                    $.assert(core.type.enum.is("deep.enum.letters", "a"), "type.enum.is(deep)");
                                    $.assert(core.type.enum.is("deep.enum.letters", "eh"), "type.enum.is(deep)");
                                    $.assert(!core.type.enum.is("deep.enum.letters", "eee"), "!type.enum.is(deep)");
                                    $.assert(core.type.enum.is("numbers", 5), "type.enum.is(shallow) <==>");
                                    $.assert(core.type.enum.is("numbers", "5"), "type.enum.is(shallow)");
                                    $.assert(core.type.enum.is("numbers", "five"), "type.enum.is(shallow)");
                                    $.assert(!core.type.enum.is("numbers", "six"), "!type.enum.is(shallow)");

                                    $.assert(core.type.enum.is.label("deep.enum.letters", "dee"), "type.enum.is.label(deep)");
                                    $.assert(!core.type.enum.is.label("deep.enum.letters", "hach"), "!type.enum.is.label(deep)");
                                    $.assert(core.type.enum.is.label("numbers", "three"), "type.enum.is.label(shallow)");
                                    $.assert(!core.type.enum.is.label("numbers", "seven"), "!type.enum.is.label(shallow)");

                                    $.assert(core.type.enum.is.value("deep.enum.letters", "c"), "type.enum.is.value(deep)");
                                    $.assert(!core.type.enum.is.value("deep.enum.letters", "f"), "!type.enum.is.value(deep)");
                                    $.assert(core.type.enum.is.value("numbers", 1), "type.enum.is.value(shallow) <==>");
                                    $.assert(core.type.enum.is.value("numbers", "2"), "type.enum.is.value(shallow)");
                                    $.assert(!core.type.enum.is.value("numbers", "7"), "!type.enum.is.value(shallow)");
                                },

                                mk: function ($) {
                                    $.expect(3);
                                    $.assert(core.type.enum.mk("numbers", "5") == 5, "type.enum.mk(shallow) <value>");
                                    $.assert(core.type.enum.mk("numbers", "four") == 4, "type.enum.mk(shallow) <label>");
                                    $.assert(core.type.enum.mk("numbers", "7") === undefined, "type.enum.mk(shallow) <undefined>");
                                },

                                encode: function ($) {
                                    $.expect(2);
                                    $.assert(core.type.enum.encode("numbers", "7") === undefined, "type.enum.mk(shallow) <undefined>");
                                    $.assert(core.type.enum.encode("numbers", "two") === 2, "type.enum.mk(shallow) 2");
                                },

                                decode: function ($) {
                                    $.expect(4);
                                    $.assert(core.type.enum.decode("numbers", 3) === "three", "type.enum.decode");
                                    $.assert(core.type.enum.decode("numbers", "7") === "unknown", "type.enum.decode unknown");
                                    $.assert.deepEqual(core.type.enum.decode("numbers", 5, { asEntry: true }), { value: 5, label: "five" }, "type.enum.decode asEntry");
                                    $.assert.deepEqual(core.type.enum.decode("deep.enum.letters", "d", { asEntry: true }), { value: "d", label: "dee", more: "info" }, "type.enum.decode asEntry 2");
                                },

                                exists: function ($) {
                                    $.expect(3);
                                    $.assert(core.type.enum.exists("numbers"), "type.enum.exists(shallow)");
                                    $.assert(core.type.enum.exists("deep.enum.letters"), "type.enum.exists(deep)");
                                    $.assert(!core.type.enum.exists("doesnotexist"), "!type.enum.exists(");
                                },

                                interface: function ($) {
                                    $.expect(1);
                                    $.assert.deepEqual(core.type.enum.interface(), { value: 0, label: "" }, "type.enum.interface");
                                }
                            } //# type.enum
                        }
                    };
                }); //# core.test.type.enum
            } //# </minRemove>
        }, { baseUrl: "" }); //# core.type

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.type.enum");
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
