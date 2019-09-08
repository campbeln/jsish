/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function () {
    'use strict';

    function init(core) {

        //# .require the necessary ish plugins
        //#     NOTE: core.require includes the required scripts/CSS then runs the provided function
        core.require(["ish.io.net.js", "ish.type-ex.js"], function (/*a_sUrls, bAllLoaded*/) {
            /*
            ####################################################################################################
            Class: core.type.enum
            Enumeration-based functionality.
            Requires:
            <core.extend>, <core.resolve>,
            <core.type.fn.is>, <core.type.obj.is>, <core.type.arr.is>, <core.type.str.is>,
            ~<core.io.net.get>, ~<core.type.str.cmp>
            ####################################################################################################
            */
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
                    if (oReturnVal.compare === "i") {
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
                function xcoder(sEnumName, sValue, vOptions, fnCompare) {
                    var i,
                        oReturnVal = {
                            val: sValue,
                            desc: sValue,
                            notFound: true
                        },
                        a_oEnum = core.resolve(g_oEnums, sEnumName)
                    ;

                    //# If the sEnumName is valid, traverse it looking for a matching .val, setting our oReturnVal if found
                    if (core.type.arr.is(a_oEnum, true)) { //#
                        //#
                        for (i = 0; i < a_oEnum.length; i++) {
                            if (fnCompare(a_oEnum[i], vOptions)) {
                                oReturnVal = a_oEnum[i];
                                break;
                            }
                            else if (a_oEnum[i].val === undefined) {
                                oReturnVal.val = a_oEnum[i].val;
                                oReturnVal.desc = a_oEnum[i].desc;
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

                        //# Traverse our a_oEnum, entering each valid .val/.desc into our oReturnVal
                        for (i = 0; i < a_oEnum.length; i++) {
                            oCurrent = a_oEnum[i];
                            if (core.type.obj.is(oCurrent)) {
                                oReturnVal[oCurrent.desc] = oCurrent.val;
                            }
                        }
                    }

                    return oReturnVal;
                } //# enumAsObj


                return {
                    enum: core.extend(
                        function (sEnum, bAsObj) {
                            var a_oReturnVal = core.resolve(g_oEnums, sEnum);

                            return (bAsObj ? enumAsObj(a_oReturnVal) : a_oReturnVal);
                        }, {
                            //#
                            is: core.extend(
                                function (sEnum, vValue, vOptions) {
                                    var vReturnVal;

                                    //#
                                    vReturnVal = xcoder(sEnum, vValue, processOptions(vOptions), function (oPicklistEntry, oOptions) {
                                        return oOptions.compare(oPicklistEntry.desc, vValue) || oOptions.compare(oPicklistEntry.val, vValue);
                                    });

                                    return (vReturnVal.notFound !== true && vReturnVal.val !== undefined);
                                }, {
                                    desc: function (sEnum, vValue, vOptions) {
                                        var vReturnVal;

                                        //#
                                        vReturnVal = xcoder(sEnum, vValue, processOptions(vOptions), function (oPicklistEntry, oOptions) {
                                            return oOptions.compare(oPicklistEntry.desc, vValue);
                                        });

                                        return (vReturnVal.notFound !== true && vReturnVal.val !== undefined);
                                    }, //# type.enum.is.desc

                                    val: function (sEnum, vValue, vOptions) {
                                        var vReturnVal;

                                        //#
                                        vReturnVal = xcoder(sEnum, vValue, processOptions(vOptions), function (oPicklistEntry, oOptions) {
                                            return oOptions.compare(oPicklistEntry.val, vValue);
                                        });

                                        return (vReturnVal.notFound !== true && vReturnVal.val !== undefined);
                                    }
                                } //# type.enum.is.val
                            ), //# type.enum.is

                            //#
                            mk: function (sEnum, vValue, vOptions) { // vDefault
                                var vReturnVal;

                                //#
                                vOptions = processOptions(vOptions);
                                vReturnVal = xcoder(sEnum, vValue, vOptions, function (oPicklistEntry, oOptions) {
                                    return oOptions.compare(oPicklistEntry.desc, vValue) || oOptions.compare(oPicklistEntry.val, vValue);
                                });

                                return (vOptions.asEntry ? vReturnVal : vReturnVal.val);
                            },

                            //#
                            encode: function (sEnum, sDescription, vOptions) {
                                var oReturnVal;

                                //#
                                vOptions = processOptions(vOptions);
                                oReturnVal = xcoder(sEnum, sDescription, vOptions, function (oPicklistEntry, oOptions) {
                                    return oOptions.compare(oPicklistEntry.desc, sDescription);
                                });

                                //#
                                return (vOptions.asEntry ? oReturnVal : oReturnVal.val);
                            }, //# data.enum.encode

                            //#
                            decode: function (sEnum, sValue, vOptions) {
                                var oReturnVal;

                                //#
                                vOptions = processOptions(vOptions);
                                oReturnVal = xcoder(sEnum, sValue, vOptions, function (oPicklistEntry, oOptions) {
                                    return oOptions.compare(oPicklistEntry.val, sValue);
                                });

                                //#
                                return (vOptions.asEntry ? oReturnVal : oReturnVal.desc);
                            }, //# data.enum.decode

                            //#
                            exists: function (sEnum) {
                                return core.type.arr.is(core.resolve(g_oEnums, sEnum), true);
                            }, //# data.enum.exists

                            //#
                            load: function (vEnums) {
                                var bReturnVal = true;

                                //# TODO: Make inline alt core.io.net.get?
                                if (core.type.str.is(vEnums) && core.type.fn.is(core.resolve(core, "io.net.get"))) {
                                    //#
                                    core.io.net.get(vEnums, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                                        bReturnVal = bSuccess;

                                        //#
                                        if (bReturnVal) {
                                            core.extend(g_oEnums, oResponse.data);
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

                            //#
                            interface: function () {
                                return {
                                    val: 0,
                                    desc: ""
                                };
                            } //# data.enum.interface
                        }
                    )
                };
            }); //# core.type.enum

            //#
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
                                                        { val: undefined, desc: "unknown" },
                                                        { val: "a", desc: "eh" },
                                                        { val: "b", desc: "bee" },
                                                        { val: "c", desc: "cee" },
                                                        { val: "d", desc: "dee", more: "info" }
                                                    ]
                                                }
                                            },
                                            numbers: [
                                                { val: undefined, desc: "unknown" },
                                                { val: 1, desc: "one" },
                                                { val: 2, desc: "two" },
                                                { val: 3, desc: "three" },
                                                { val: 4, desc: "four" },
                                                { val: 5, desc: "five" }
                                            ]
                                        }),
                                        "type.enum.load"
                                    );
                                },

                                _: function ($) {
                                    $.expect(7);
                                    $.assert(core.type.enum("deep.enum.letters", true).unknown === undefined, "type.enum(deep, asObj)");
                                    $.assert(core.type.enum("numbers", true).one === 1, "type.enum(shallow, asObj)");

                                    $.assert(core.type.enum("deep.enum.letters")[2].val === "b", "type.enum(deep).val");
                                    $.assert(core.type.enum("deep.enum.letters")[3].desc === "cee", "type.enum(deep).desc");
                                    $.assert(core.type.enum("deep.enum.letters")[4].more === "info", "type.enum(deep).more");
                                    $.assert(core.type.enum("numbers")[4].val === 4, "type.enum(shallow).val");
                                    $.assert(core.type.enum("numbers")[5].desc === "five", "type.enum(shallow).desc");
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

                                    $.assert(core.type.enum.is.desc("deep.enum.letters", "dee"), "type.enum.is.desc(deep)");
                                    $.assert(!core.type.enum.is.desc("deep.enum.letters", "hach"), "!type.enum.is.desc(deep)");
                                    $.assert(core.type.enum.is.desc("numbers", "three"), "type.enum.is.desc(shallow)");
                                    $.assert(!core.type.enum.is.desc("numbers", "seven"), "!type.enum.is.desc(shallow)");

                                    $.assert(core.type.enum.is.val("deep.enum.letters", "c"), "type.enum.is.val(deep)");
                                    $.assert(!core.type.enum.is.val("deep.enum.letters", "f"), "!type.enum.is.val(deep)");
                                    $.assert(core.type.enum.is.val("numbers", 1), "type.enum.is.val(shallow) <==>");
                                    $.assert(core.type.enum.is.val("numbers", "2"), "type.enum.is.val(shallow)");
                                    $.assert(!core.type.enum.is.val("numbers", "7"), "!type.enum.is.val(shallow)");
                                },

                                mk: function ($) {
                                    $.expect(3);
                                    $.assert(core.type.enum.mk("numbers", "5") == 5, "type.enum.mk(shallow) <val>");
                                    $.assert(core.type.enum.mk("numbers", "four") == 4, "type.enum.mk(shallow) <desc>");
                                    $.assert(core.type.enum.mk("numbers", "7") === undefined, "type.enum.mk(shallow) <undefined>");
                                },

                                encode: function ($) {
                                    $.expect(1);
                                    $.assert(core.type.enum.encode("numbers", "7") === undefined, "type.enum.mk(shallow) <undefined>");
                                },

                                decode: function ($) {
                                    $.expect(1);
                                    $.assert(false, "decode untested");
                                }
                            } //# type.enum
                        }
                    };
                }); //# core.test.type.enum
            }
        }, { baseUrl: "" }); //# core.type
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
