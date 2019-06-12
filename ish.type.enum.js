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
        Class: core.type.enum
        Enumeration-based functionality.
        Requires:
        <core.extend>, <core.resolve>,
        <core.type.fn.is>, <core.type.obj.is>, <core.type.arr.is>, <core.type.str.is>,
        ~<core.io.net.get>, ~<core.type.str.cmp>
        ####################################################################################################
        */
        core.oop.partial(core.type, function (/*oProtected*/) {
            var oEnums = {};

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
                        return (x === y);
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
                        found: false
                    },
                    a_oEnum = core.resolve(oEnums, sEnumName)
                ;

                //# If the sEnumName is valid, traverse it looking for a matching .val, setting our oReturnVal if found
                if (core.type.obj.is(a_oEnum)) {
                    //#
                    for (i = 0; i < a_oEnum.length; i++) {
                        if (fnCompare(a_oEnum[i], vOptions)) {
                            oReturnVal = a_oEnum[i];
                            break;
                        }
                    }
                }

                return oReturnVal;
            } //# xcoder


            //# .require any missing .prereqs
            /*core.type.ish.prereqs("ish.type.enum", {
                'ish.io.net': !core.type.fn.is(core.io.net.get),
                'ish.type-ex': !core.type.fn.is(core.type.str.cmp)
            } /*, {}* /);*/

            return {
                enum: core.extend(
                    function (sEnum) {
                        return core.resolve(oEnums, sEnum);
                    }, {
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
                        exists: function (sPicklistName) {
                            return core.type.arr.is(core.resolve(oEnums, sPicklistName), true);
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
                                        core.extend(oEnums, oResponse.data);
                                    }
                                });
                            }
                            //#
                            else if (core.type.obj.is(vEnums)) {
                                core.extend(oEnums, vEnums);
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
