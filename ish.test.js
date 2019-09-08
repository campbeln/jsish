/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function () {
    'use strict';


    function init(core) {
        /** ################################################################################################
         * @namespace core.test
         * @desc Stub-object for test-based functionality.
        ################################################################################################# */
        core.test = function(chai) {
            var fnReturnVal,
                $assert = chai.assert, //# https://www.chaijs.com/api/assert/
                $testFactory = function (sCurrentPath) {
                    var iCount = 0,
                        iExpected = -1
                    ;

                    //# Proxy is not as well supported as the rest of the code within ish, but as it's only used for testing and not production code this (very minor) limitation is acceptable.
                    //#     See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
                    return new Proxy(
                        {
                            assert: $assert,
                            expect: function (iExpectedTests) {
                                if (arguments.length === 0) {
                                    if (iExpected > 0) {
                                        $assert(iCount === iExpected, "Expected " + iExpected + " tests but saw " + iCount);
                                    }
                                }
                                else {
                                    iExpected = core.type.int.mk(iExpectedTests, -1);
                                    $testFactory.total += iExpected;
                                    iCount = 0;
                                }
                            }, //# expect
                            results: function (sCountOf, oError) {
                                var a_sCountOf = (sCountOf + "").split(":"),
                                    sDescription = sCurrentPath + (
                                        a_sCountOf.length > 1 ?
                                        " (test " + a_sCountOf[0] + " of " + a_sCountOf[1] + ") " + iCount :
                                        ""
                                    )
                                ;

                                //#
                                if (core.type.obj.is(oError)) {
                                    $testFactory.run--;
                                    console.warn("FAILED: " + sDescription, oError.message, oError);
                                }
                                //#
                                else {
                                    console.info("PASSED: " + sDescription);
                                }
                            } //# results
                        }, {
                            get: function (oTarget, sKey) {
                                if (sKey === "assert") {
                                    iCount++;
                                    if (iExpected > 0) { $testFactory.run++; }
                                }
                                return oTarget[sKey];
                            }
                        }
                    );
                }
            ;

            //#
            function run(oBase, sPath) {
                var vCurrent, oTester, vTesterResult, sCurrentPath, i, j,
                    a_sOwnKeys = core.type.obj.ownKeys(oBase)
                ;

                //#
                if (core.type.obj.is(oBase, { allowFn: true }) && core.type.arr.is(a_sOwnKeys)) {
                    //#
                    if (core.type.arr.is(oBase._order)) {
                        for (i = 0; i < oBase._order.length; i++) {
                            j = a_sOwnKeys.indexOf(oBase._order[i]);
                            if (j > -1) {
                                a_sOwnKeys.unshift(
                                    a_sOwnKeys.splice(j, 1)[0]
                                );
                            }
                        }
                    }

                    //#
                    for (i = 0; i < a_sOwnKeys.length; i++) {
                        sCurrentPath = a_sOwnKeys[i];
                        vCurrent = oBase[sCurrentPath];
                        sCurrentPath = sPath + (sCurrentPath === "_" ? "" : "." + sCurrentPath);
                        oTester = $testFactory(sCurrentPath);

                        //#
                        if (core.type.fn.is(vCurrent)) {
                            //#
                            try {
                                vTesterResult = vCurrent(oTester);
                                oTester.expect();

                                //#
                                if (vTesterResult !== core.test.isAsync) {
                                    $testFactory.interfaces++;
                                    oTester.results(/*""*/);
                                }
                            } catch (e) {
                                oTester.results("", e);
                            }
                        }
                        //#
                        else if (core.type.obj.is(vCurrent)) {
                            run(vCurrent, sCurrentPath);
                        }
                    }
                }
            } //# run

            //#
            $testFactory.total = 0;
            $testFactory.run = 0;
            $testFactory.interfaces = 0;

            //# Establish core.test with the initial call to .run
            fnReturnVal = function () {
                run(core.test, core.config.ish().target);

                return (
                    $testFactory.run === $testFactory.total ?
                        "SUCCESS: All " + $testFactory.total + " non-async tests" :
                        "ERRORS: " + $testFactory.run + " non-async tests of " + $testFactory.total
                    ) +
                    " passed across " + $testFactory.interfaces + " non-async interfaces"
                ;
            }; //# core.test
            fnReturnVal.isAsync = {};
            return fnReturnVal;
        }(window.chai);


        /** ################################################################################################
         * @namespace core.test
        ################################################################################################# */
        core.oop.partial(core.test, function (/*oProtected*/) {
            return {
                type: {
                    _: function ($) {
                        $.expect(17);
                        $.assert(core.type("str") === core.type.str.is, "str");
                        $.assert(core.type(1) === core.type.int.is, "int");
                        $.assert(core.type(1.1) === core.type.float.is, "float");
                        $.assert(core.type(new Date()) === core.type.date.is, "date");
                        $.assert(core.type({}) === core.type.obj.is, "obj");
                        $.assert(core.type(new Object()) === core.type.obj.is, "new Object()");
                        $.assert(core.type([]) === core.type.arr.is, "arr");
                        $.assert(core.type(new Array()) === core.type.arr.is, "new Array()");
                        $.assert(core.type(true) === core.type.bool.is, "bool");
                        $.assert(core.type(function(){}) === core.type.fn.is, "fn");
                        $.assert(core.type(new Function()) === core.type.fn.is, "new Function()");
                        //$.assert(core.type(arguments) === core.type.is.collection, "list");
                        $.assert(core.type(Symbol()) === core.type.symbol.is, "symbol");

                        $.assert(core.type(arguments, [core.type.is.collection, "arr"]) === core.type.is.collection, "coll(list) + order");
                        $.assert(core.type(2, [core.type.is.numeric, "int", "float"]) === core.type.is.numeric, "num(int) + order");
                        $.assert(core.type(2.2, [core.type.is.numeric, "int", "float"]) === core.type.is.numeric, "num(float) + order");
                        $.assert(core.type("2019-01-01", ["date", "str"]) === core.type.date.is, "date + order");
                        $.assert(core.type(3, ["str", "arr"]) === undefined, "missing type");
                    }, //# type

                    is: {
                        _: function ($) {
                            var tCustomType = function () {};

                            $.expect(7);
                            $.assert(core.type.is(new String("str"), String), "String");
                            $.assert(!core.type.is("str", String), "!String");
                            $.assert(core.type.is(new Date("1970-01-01"), Date), "Date");
                            $.assert(!core.type.is("1970-01-01", Date), "!Date");
                            $.assert(core.type.is(new Object(), Object), "Object");
                            $.assert(!core.type.is({}, String), "!Object");

                            $.assert(core.type.is(new tCustomType(), tCustomType), "tCustomType");
                        },

                        native: function ($) {
                            $.expect(2);
                            $.assert(core.type.is.native(document.querySelector), "native querySelector");
                            $.assert(!core.type.is.native(core.test), "!native");
                        },

                        collection: function ($) {
                            $.expect(22);
                            $.assert(core.type.is.collection(arguments), "arguments");
                            $.assert(core.type.is.collection(arguments, true), "arguments.length > 0");
                            $.assert(core.type.is.collection(document.querySelector("head").attributes), "NamedNodeMap");
                            $.assert(!core.type.is.collection(document.querySelector("head").attributes, true), "!NamedNodeMap.length === 0");
                            $.assert(core.type.is.collection(document.querySelector("script[ish]", true).attributes), "NamedNodeMap.length > 0");
                            $.assert(core.type.is.collection(document.querySelectorAll("blink")), "NodeList");
                            $.assert(!core.type.is.collection(document.querySelectorAll("blink"), { disallow0Length: true }), "!NodeList 0-length");
                            $.assert(core.type.is.collection(document.querySelectorAll("script"), true), "NodeList");
                            $.assert(core.type.is.collection(document.forms), "NodeList");

                            $.assert(!core.type.is.collection([]), "![]");
                            $.assert(!core.type.is.collection(new Array()), "!new Array()");
                            $.assert(!core.type.is.collection({}), "!obj");
                            $.assert(!core.type.is.collection(null), "!null");
                            $.assert(!core.type.is.collection(undefined), "!undefined");
                            $.assert(!core.type.is.collection(1), "!1");
                            $.assert(!core.type.is.collection(function () {}), "!fn");

                            $.assert(core.type.is.collection([], { allowArray: true }), "[]");
                            $.assert(!core.type.is.collection([], { disallow0Length: true, allowArray: true }), "![] 0-length");
                            $.assert(core.type.is.collection([1,2,3], { disallow0Length: true, allowArray: true }), "[].length > 0");
                            $.assert(core.type.is.collection({}, { allowObject: true }), "obj");
                            $.assert(!core.type.is.collection({}, { disallow0Length: true, allowObject: true }), "obj");
                            $.assert(core.type.is.collection({ empty: false }, { disallow0Length: true, allowObject: true }), "obj keys.length > 0");
                            /*
                            $.assert(core.type.is.collection([]), "[]");
                            $.assert(core.type.is.collection(new Array()), "new Array()");
                            $.assert(!core.type.is.collection([], true), "![] 0-length");
                            $.assert(core.type.is.collection([1,2,3], true), "[] non-0-length");

                            $.assert(core.type.is.collection(arguments), "arguments");
                            $.assert(core.type.is.collection(arguments, true), "arguments.length > 0");
                            $.assert(core.type.is.collection(document.querySelector("head").attributes), "NamedNodeMap");
                            $.assert(!core.type.is.collection(document.querySelector("head").attributes, true), "!NamedNodeMap.length === 0");
                            $.assert(core.type.is.collection(document.querySelector("script[ish]", true).attributes), "NamedNodeMap.length > 0");
                            $.assert(core.type.is.collection({}, false, true), "obj");
                            $.assert(core.type.is.collection(document.querySelectorAll("blink")), "NodeList");
                            $.assert(!core.type.is.collection(document.querySelectorAll("blink"), true), "!NodeList 0-length");
                            $.assert(core.type.is.collection(document.querySelectorAll("script"), true), "NodeList");
                            $.assert(core.type.is.collection(document.forms), "NodeList");

                            $.assert(!core.type.is.collection({}), "!obj");
                            $.assert(!core.type.is.collection(null), "!null");
                            $.assert(!core.type.is.collection(undefined), "!undefined");
                            $.assert(!core.type.is.collection(1), "!1");
                            $.assert(!core.type.is.collection(function () {}), "!fn");
                            */
                        },

                        numeric: function ($) {
                            $.expect(12);
                            $.assert(core.type.is.numeric(1), "is 1");
                            $.assert(core.type.is.numeric(0), "is 0");
                            $.assert(core.type.is.numeric(1.1), "is 1.1");
                            $.assert(!core.type.is.numeric([]), "!is []");
                            $.assert(!core.type.is.numeric(null), "!is null");
                            $.assert(!core.type.is.numeric(undefined), "!is undefined");

                            $.assert(core.type.is.numeric("1"), "is str 1");
                            $.assert(core.type.is.numeric("0"), "is str 0");
                            $.assert(core.type.is.numeric("1.1"), "is str 1.1");
                            //$.assert(core.type.is.numeric("1,1", true), "is str 1,1");
                            $.assert(!core.type.is.numeric("1,1"), "!is str 1,1");
                            $.assert(!core.type.is.numeric("0.0.0"), "!is str 0.0.0");
                            $.assert(!core.type.is.numeric("1,100.5"), "!is str 1,100.5");
                        },

                        ish: function ($) {
                            $.expect(3);
                            $.assert(core.type.is.ish(), "no args");
                            $.assert(core.type.is.ish(core), "core");
                            $.assert(!core.type.is.ish({}), "!{}");
                        },

                        "ish.import": function ($) {
                            $.expect(3);
                        },

                        val: function ($) {
                            $.expect(9);
                            $.assert(!core.type.is.val(null), "!null");
                            $.assert(!core.type.is.val(undefined), "!undefined");
                            $.assert(core.type.is.val(false), "false");
                            $.assert(core.type.is.val(0), "0");
                            $.assert(core.type.is.val(NaN), "NaN");
                            $.assert(core.type.is.val(''), "null-str");
                            $.assert(core.type.is.val(1), "1");
                            $.assert(core.type.is.val([]), "[]");
                            $.assert(core.type.is.val({}), "{}");
                        },

                        primitive: function ($) {
                            $.expect(17);
                            $.assert(core.type.is.primitive(null), "null");
                            $.assert(core.type.is.primitive(undefined), "undefined");
                            $.assert(core.type.is.primitive(false), "false");
                            $.assert(core.type.is.primitive(true), "true");
                            $.assert(core.type.is.primitive(0), "0");
                            $.assert(core.type.is.primitive(1), "1");
                            $.assert(core.type.is.primitive(2.2), "2.2");
                            $.assert(core.type.is.primitive(-3.3), "-3.3");
                            $.assert(!core.type.is.primitive(NaN), "!NaN");
                            $.assert(core.type.is.primitive(''), "null-str");
                            $.assert(core.type.is.primitive('str'), "str");
                            $.assert(core.type.is.primitive(window.Symbol()), "Symbol()");

                            $.assert(!core.type.is.primitive([]), "![]");
                            $.assert(!core.type.is.primitive({}), "!{}");
                            $.assert(!core.type.is.primitive(function () {}), "!fn");
                            $.assert(!core.type.is.primitive(window), "!window");
                            $.assert(!core.type.is.primitive(new Date()), "!new Date()");
                        }

                        //range: function ($) {
                        //    /*$.assert(core.type.range(
                        //        "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999",
                        //        "num",
                        //        0,
                        //        "19999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"
                        //    ), "100x9s");
                        //    $.assert(core.type.range(
                        //        "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999",
                        //        "num",
                        //        0,
                        //        "999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999"
                        //    ), "100x9s out of range");
                        //    */
                        //    $.assert(core.type.range(99, "int", 0, 100), "int in range");
                        //    $.assert(!core.type.range(101, core.type.int.is, 0, 100), "int out of range");

                        //    $.assert(core.type.range(9.9, "float", 0.1, 10.1), "float in range");
                        //    $.assert(!core.type.range(10.2, core.type.float.is, 0.2, 9.2), "float out of range");

                        //    $.assert(core.type.range(new Date('2019-02-01'), "date", new Date('2019-01-01'), new Date('2019-03-01')), "date in range");
                        //    $.assert(!core.type.range(new Date('2019-05-01'), core.type.date.is, new Date('2019-01-01'), new Date('2019-03-01')), "date out in range");
                        //}
                    }, //# type.is

                    bool: {
                        is: function ($) {
                            $.expect(14);
                            $.assert(core.type.bool.is(true), "is true");
                            $.assert(core.type.bool.is(false), "is false");
                            $.assert(!core.type.bool.is("true"), "!is str true");
                            $.assert(!core.type.bool.is("false"), "!is str false");
                            $.assert(core.type.bool.is("true", true), "is str allowed true");
                            $.assert(core.type.bool.is("false", true), "is str allowed false");
                            $.assert(core.type.bool.is("True", true), "is str allowed True");
                            $.assert(core.type.bool.is("FalSe", true), "is str allowed FalSe");

                            $.assert(!core.type.bool.is(""), "!null-str");
                            $.assert(!core.type.bool.is(NaN), "!NaN");
                            $.assert(!core.type.bool.is(undefined), "!undefined");
                            $.assert(!core.type.bool.is(null), "!null");
                            $.assert(!core.type.bool.is(0), "!0");
                            $.assert(!core.type.bool.is(1), "!1");
                        },

                        mk: function ($) {
                            /*
                            $.assert(core.type.bool.mk(true, false), "mk true");
                            $.assert(!core.type.bool.mk(false, true), "mk false");
                            $.assert(core.type.bool.mk("true", false), "mk str true");
                            $.assert(!core.type.bool.mk("false", true), "mk str false");
                            $.assert(core.type.bool.mk(1, false), "mk 1");
                            $.assert(!core.type.bool.mk(0, true), "mk 0");

                            $.assert(core.type.bool.mk("strings are truthy"), "mk str truthy");
                            $.assert(!core.type.bool.mk("", true), "mk string falsy");
                            $.assert(!core.type.bool.mk(null, true), "mk null falsy");
                            $.assert(!core.type.bool.mk(undefined, true), "mk undefined falsy");
                            //$.assert(core.type.bool.mk(undefined, true), "mk undefined truthy");
                            */

                            $.expect(16);
                            $.assert(core.type.bool.mk("true") === true, "str true");
                            $.assert(core.type.bool.mk("false") === false, "!str false");
                            $.assert(core.type.bool.mk(true) === true, "true");
                            $.assert(core.type.bool.mk(false) === false, "false");
                            $.assert(core.type.bool.mk(1) === true, "1");
                            $.assert(core.type.bool.mk("string are truthy") === true, "1");
                            $.assert(core.type.bool.mk(0) === false, "!0");
                            $.assert(core.type.bool.mk(undefined) === false, "!undefined");
                            $.assert(core.type.bool.mk(null) === false, "!null");
                            $.assert(core.type.bool.mk("") === false, "!null-str");
                            $.assert(core.type.bool.mk(NaN) === false, "!NaN");

                            $.assert(core.type.bool.mk(undefined, true) === true, "non-bool default true");
                            $.assert(core.type.bool.mk(undefined, false) === false, "non-bool default false");
                            $.assert(core.type.bool.mk(undefined, null) === null, "non-bool default non-bool");
                            $.assert(core.type.bool.mk("string are truthy", true) === true, "non-bool string default true");
                            $.assert(core.type.bool.mk("string are truthy", false) === false, "non-bool default false");
                        }
                    },

                    int: {
                        is: function ($) {
                            $.expect(12);
                            $.assert(core.type.int.is(1), "is 1");
                            $.assert(core.type.int.is(0), "is 0");
                            $.assert(core.type.int.is(Number.MAX_SAFE_INTEGER), "is max");
                            $.assert(core.type.int.is(Number.MIN_SAFE_INTEGER), "is min");

                            $.assert(core.type.int.is("0"), "is 0 str");
                            $.assert(core.type.int.is("1"), "is 1 str");
                            $.assert(core.type.int.is(Number.MAX_SAFE_INTEGER + ""), "is max str");
                            $.assert(core.type.int.is(Number.MIN_SAFE_INTEGER + ""), "is min str");

                            $.assert(!core.type.int.is("2 two"), "!is 2 two");
                            $.assert(!core.type.int.is("3three"), "!is 3three");
                            $.assert(!core.type.int.is(1.1), "!is 1.1");
                            $.assert(!core.type.int.is(null), "!is null");
                        },

                        mk: function ($) {
                            $.expect(10);
                            $.assert(core.type.int.mk(1) === 1, "1");
                            $.assert(core.type.int.mk(0) === 0, "0");
                            $.assert(core.type.int.mk("1") === 1, "str 1");
                            $.assert(core.type.int.mk("0") === 0, "str 0");
                            $.assert(core.type.int.mk(0.1) === 0, "0.1");
                            $.assert(core.type.int.mk(0.6) === 0, "0.6");

                            $.assert(core.type.int.mk("12 monkeys") === 12, "12 monkeys");
                            $.assert(core.type.int.mk("monkeys") === 0, "monkeys");
                            $.assert(core.type.int.mk("monkeys 12") === 0, "monkeys 12");
                            $.assert(core.type.int.mk("monkeys 12", 13) === 13, "monkeys 12");
                        }
                    },

                    float: {
                        is: function ($) {
                            $.expect(13);
                            $.assert(core.type.float.is(0.1), "is 0.1");
                            $.assert(!core.type.float.is(0.0), "!is 0.0");
                            $.assert(core.type.float.is(1.1), "is 1.1");
                            $.assert(core.type.float.is(0.001), "is 0.001");
                            $.assert(core.type.float.is(-1.1), "is -1.1");
                            //$.assert(core.type.float.is(Number.MAX_VALUE - 0.1), "is max");
                            //$.assert(core.type.float.is(Number.MIN_VALUE - 0.1), "is min");

                            $.assert(!core.type.float.is("0.0"), "!is 0.0 str");
                            $.assert(core.type.float.is("0.1"), "is 0.1 str");
                            $.assert(core.type.float.is("1.1"), "is 1.1 str");
                            $.assert(core.type.float.is("0.001"), "is 0.001 str");
                            $.assert(core.type.float.is("-1.1"), "is -1.1 str");
                            //$.assert(core.type.float.is((Number.MAX_VALUE - 0.1) + ""), "is max str");
                            //$.assert(core.type.float.is((Number.MIN_VALUE - 0.1) + ""), "is min str");

                            $.assert(!core.type.float.is("2.2 two"), "!is 2.2 two");
                            $.assert(!core.type.float.is("3.3three"), "!is 3.3three");
                            $.assert(!core.type.float.is(null), "!is null");
                        },

                        mk: function ($) {
                            $.expect(10);
                            $.assert(core.type.float.mk(1) === 1, "1");
                            $.assert(core.type.float.mk(0) === 0, "0");
                            $.assert(core.type.float.mk("1") === 1, "str 1");
                            $.assert(core.type.float.mk("0") === 0, "str 0");
                            $.assert(core.type.float.mk(0.1) === 0.1, "0.1");
                            $.assert(core.type.float.mk(0.6) === 0.6, "0.6");

                            $.assert(core.type.float.mk("12.2 monkeys") === 12.2, "12.2 monkeys");
                            $.assert(core.type.float.mk("monkeys") === 0, "monkeys");
                            $.assert(core.type.float.mk("monkeys 12.2") === 0, "monkeys 12.2");
                            $.assert(core.type.float.mk("monkeys 12.2", 13.3) === 13.3, "monkeys 12.2");
                        }
                    },

                    date: {
                        is: function ($) {
                            $.expect(12);
                            $.assert(core.type.date.is("1970/01/01"), "str epoch/date");
                            $.assert(core.type.date.is("1970-01-01"), "str epoch-date");
                            $.assert(core.type.date.is("1970-01-01 00:00:00"), "str epoch datetime");
                            $.assert(!core.type.date.is("1970-13-31"), "!str bad month");
                            $.assert(!core.type.date.is("1970-12-32"), "!str bad day");
                            $.assert(!core.type.date.is("1970-12-31 25:00:00"), "!str bad hour"); //# hour == 24 is valid!?
                            $.assert(!core.type.date.is("1970-12-31 23:61:00"), "!str bad min");
                            $.assert(!core.type.date.is("1970-12-31 23:00:61"), "!str bad sec");

                            $.assert(core.type.date.is(0), "epoch numeric");
                            $.assert(!core.type.date.is("0"), "!str epoch numeric");
                            $.assert(core.type.date.is(new Date(0)), "date epoch date");
                            $.assert(core.type.date.is(new Date()), "date now date");
                        },

                        mk: function ($) {
                            $.expect(4);
                            $.assert(core.type.date.mk(0).valueOf() === 0, "0");
                            $.assert(core.type.date.mk("0", null) === null, "str '0' default null");
                            $.assert(core.type.date.mk("2019-01-01").valueOf() === new Date("2019-01-01").valueOf(), "str 2019-01-01");
                            $.assert(core.type.date.mk("Wed Dec 31 1969 16:00:10 GMT-0800 (Pacific Standard Time)").valueOf() === new Date("Wed Dec 31 1969 16:00:10 GMT-0800 (Pacific Standard Time)").valueOf(), "str epoch");
                            //# TODO: Add other date formats?
                        },

                        timestamp: function ($) {
                            $.expect(1);
                            $.assert.isNumber(core.type.date.timestamp(), "timestamp is numeric");
                        }
                    },

                    str: {
                        is: function ($) {
                            $.expect(14);
                            $.assert(core.type.str.is(""), "null-str");
                            $.assert(core.type.str.is("str"), "str");
                            $.assert(core.type.str.is("str", true), "str");
                            $.assert(core.type.str.is(`
                                str`, true, true), "str"
                            );
                            $.assert(!core.type.str.is("", true), "!null-str");
                            $.assert(!core.type.str.is("  ", true, true), "!null-str + trim");
                            $.assert(!core.type.str.is(`  
                                `, true, true), "!null-str + trim multiline"
                            );

                            $.assert(core.type.str.is(new String()), "new String()");
                            $.assert(core.type.str.is(new String("")), "new String(null-str)");

                            $.assert(!core.type.str.is({}), "!obj");
                            $.assert(!core.type.str.is(null), "!null");
                            $.assert(!core.type.str.is(undefined), "!undefined");
                            $.assert(!core.type.str.is(1), "!1");
                            $.assert(!core.type.str.is([]), "![]");
                        },

                        mk: function ($) {
                            $.expect(11);
                            $.assert(core.type.str.mk(new Date(0)).indexOf("Wed Dec 31 1969 ") === 0, "new Date");
                            $.assert(core.type.str.mk(true) === "true", "true");
                            $.assert(core.type.str.mk(1) === "1", "1");
                            $.assert(core.type.str.mk({}) === "{}", "{}");
                            $.assert(core.type.str.mk({ neek: true }) === '{"neek":true}', "{ neek: true }");

                            $.assert(core.type.str.mk(false) === "false", "false");
                            $.assert(core.type.str.mk(0) === "0", "0");
                            $.assert(core.type.str.mk(undefined) === "", "!undefined");
                            $.assert(core.type.str.mk(null) === "", "!null");
                            $.assert(core.type.str.mk(NaN) === "", "!NaN");
                            $.assert(core.type.str.mk() === "", "!null-string");
                        },

                        "is.selector": function ($) { // TODO
                            if (ish.config.ish().serverside) {

                            }
                        },

                        "is.json": function ($) {
                            $.expect(5);
                            $.assert(core.type.str.is.json('{ "json": true }'), "json obj bool");
                            $.assert(!core.type.str.is.json("{ 'json': true }"), "!json obj bool");
                            $.assert(core.type.str.is.json('{ "json": "str" }'), "json obj str");

                            $.assert(core.type.str.is.json('[1,2,3,4,5]'), "json arr int");
                            $.assert(core.type.str.is.json('["n","i","c","k"]'), "json arr str");
                        }
                    },

                    fn: {
                        is: function ($) {
                            $.expect(8);
                            $.assert(core.type.fn.is(function() {}), "fn");
                            $.assert(core.type.fn.is(new Function()), "new Function()");
                            $.assert(core.type.fn.is(document.querySelector), "document.querySelector");

                            $.assert(!core.type.fn.is({}), "!obj");
                            $.assert(!core.type.fn.is(null), "!null");
                            $.assert(!core.type.fn.is(undefined), "!undefined");
                            $.assert(!core.type.fn.is(1), "!1");
                            $.assert(!core.type.fn.is([]), "![]");
                        },

                        mk: function ($) {
                            var fn = function(){};

                            $.expect(7);
                            $.assert(core.type.fn.mk(fn) === fn, "fn");
                            $.assert(core.type.fn.mk(new Function(), fn) !== fn, "new Function()");
                            $.assert(core.type.fn.mk(document.getElementById, fn) !== fn, "document.getElementById");
                            $.assert(core.type.fn.mk("not a fn", fn) === fn, "!str + default");
                            $.assert(core.type.fn.mk("not a fn") === core.type.fn.noop, "!str");
                            $.assert(core.type.fn.mk({}, fn) === fn, "!{}");
                            $.assert(core.type.fn.mk([], fn) === fn, "![]");
                        },

                        convert: function ($) {
                            $.expect(3);
                            $.assert.deepEqual(core.type.fn.convert(arguments), [$], "arguments");
                            $.assert.deepEqual(core.type.fn.convert(undefined), [], "undefined");
                            !function (a, b, c) {
                                $.assert.deepEqual(core.type.fn.convert(arguments), [a, b, c], "arguments");
                            }(1, "two", { three: 3 });
                        },

                        noop: function ($) {
                            $.expect(2);
                            $.assert.isFunction(core.type.fn.noop, "isFunction");
                            $.assert.deepEqual(core.type.fn.noop(), undefined, "undefined");
                        },

                        call: function ($) {
                            function fn(a, b, c) {
                                return a ||
                                    (this ? this.arg : 0) ||
                                    (arguments.length > 0 ? core.type.fn.convert(arguments) : 0) ||
                                    1
                                ;
                            }

                            $.expect(8);
                            $.assert(core.type.fn.call(fn) === 1, "fn()");
                            $.assert(core.type.fn.call(fn, { arg: 2 }) === 2, "fn() + context");
                            $.assert(core.type.fn.call(fn, null, 3) === 3, "fn(3)");
                            $.assert(core.type.fn.call(fn, null, [4, 5]) === 4, "fn(4)");
                            $.assert.deepEqual(core.type.fn.call(fn, undefined, [false, 1, 2]), [false, 1, 2], "fn(false, 1, 2)");
                            $.assert(core.type.fn.call(Date.now) === Date.now(), "Date.now");

                            $.assert(core.type.fn.call(null) === undefined, "!null");
                            $.assert(core.type.fn.call([]) === undefined, "![]");
                        },

                        run: function ($) {
                            function fn(a, b, c) {
                                return a ||
                                    (this ? this.z : 0) ||
                                    (arguments.length > 0 ? core.type.fn.convert(arguments) : 0) ||
                                    1
                                ;
                            }

                            $.expect(9);
                            $.assert(core.type.fn.run(fn) === 1, "fn()");
                            $.assert(core.type.fn.run(fn, { context: { z: 2 } }) === 2, "fn() + context");
                            $.assert(core.type.fn.run(fn, { args: [3], default: -3 }) === 3, "fn(3)");
                            $.assert(core.type.fn.run(fn, { args: [4, 5] }) === 4, "fn(4)");
                            $.assert.deepEqual(core.type.fn.run(fn, { args: [false, 1, 2] }), [false, 1, 2], "fn(false, 1, 2)");
                            $.assert(core.type.fn.run(Date.now) === Date.now(), "Date.now");

                            $.assert(core.type.fn.run(null) === undefined, "!null");
                            $.assert(core.type.fn.run([]) === undefined, "![]");
                            $.assert(core.type.fn.run([], { default: null }) === null, "default");
                        },

                        once: function ($) {
                            var fnTest,
                                fn = function () {
                                    var i = 0;

                                    return function (a) {
                                        return (
                                            (arguments.length > 0 ? a : 0) ||
                                            (this && this.arg ? this.arg : 0) ||
                                            ++i
                                        );
                                    }
                                }()
                            ;

                            $.expect(13);
                            $.assert(fn() === 1, "preflight 1");
                            $.assert(fn() === 2, "preflight 2");

                            fnTest = core.type.fn.once(fn);
                            $.assert(fnTest() === 3, "once 3");
                            $.assert(fnTest() === 3, "once also3");

                            fnTest = core.type.fn.once(fn, { rereturn: false });
                            $.assert(fnTest() === 4, "once 4");
                            $.assert(fnTest() === undefined, "once 4.undefined");
                            $.assert(fnTest() === undefined, "once 4.undefined2");

                            fnTest = core.type.fn.once(fn, { rereturn: true });
                            $.assert(fnTest() === 5, "once 5");
                            $.assert(fnTest() === 5, "once also5");
                            $.assert(fnTest() === 5, "once alsoalso5");

                            fnTest = core.type.fn.once(fn, { context: { arg: -2 } });
                            $.assert(fnTest() === -2, "once -2");
                            $.assert(fnTest() === -2, "once also-2");

                            fnTest = core.type.fn.once(fn);
                            $.assert(fnTest(-3) === -3, "once -3");
                        },

                        tryCatch: function ($) {
                            var fnTest,
                                fn = function () {
                                    var i = 0;

                                    return function (a) {
                                        if (++i % 2 === 0) {
                                            throw "i is even!";
                                        }

                                        return (
                                            (arguments.length > 0 ? a : 0) ||
                                            (this && this.arg ? this.arg : 0) ||
                                            i
                                        );
                                    }
                                }()
                            ;

                            $.expect(9);
                            $.assert(fn() === 1, "preflight 1");
                            fnTest = ish.type.fn.tryCatch(fn, { returnObj: true });
                            $.assert.deepEqual(fnTest(), { result: undefined, error: "i is even!" }, "catch even error");
                            $.assert(fnTest().result === 3, "3");
                            $.assert.deepEqual(fnTest(), { result: undefined, error: "i is even!" }, "catch even error2");
                            $.assert(fnTest().result === 5, "5");

                            fnTest = ish.type.fn.tryCatch(fn, { context: { arg: "from context" } });
                            $.assert(fnTest() === undefined, "catch even error3");
                            $.assert(fnTest() === "from context", "from context");

                            fnTest = ish.type.fn.tryCatch(fn, { context: { arg: "also from context" }, returnObj: true, default: "not from fnTest" });
                            $.assert(fnTest().result === "not from fnTest", "not from fnTest");
                            $.assert(fnTest().result === "also from context", "also from context");
                        },

                        throttle: function ($) {
                            var oResults = {},
                                fnTestFactory = function (sKey) {
                                    var i = 0;
                                    return function () {
                                        oResults[sKey].i = ++i;
                                        oResults[sKey].neek = (this ? this.neek === true : false);
                                    };
                                }
                            ;

                            oResults.t1 = { count: 0 };
                            oResults.t1.fn = core.type.fn.throttle(fnTestFactory("t1"), { wait: 50, context: { neek: true } });
                            oResults.t1.id = setInterval(function () {
                                oResults.t1.fn();
                                if (++oResults.t1.count > 49) {
                                    clearInterval(oResults.t1.id);
                                    setTimeout(function () {
                                        try {
                                            $.assert(oResults.t1.i === 10, "wait 50");
                                            $.assert(oResults.t1.neek === true, "context");
                                            $.results("1:4");
                                        } catch (e) { $.results("1:4", e) }
                                    }, 20);
                                }
                            }, 10);

                            oResults.t2 = { count: 0 };
                            oResults.t2.fn = core.type.fn.throttle(fnTestFactory("t2"), { wait: 25, trailing: true });
                            oResults.t2.id = setInterval(function () {
                                oResults.t2.fn();
                                if (++oResults.t2.count > 49) {
                                    clearInterval(oResults.t2.id);
                                    setTimeout(function () {
                                        try {
                                            $.assert(oResults.t2.i === 21, "wait 25");
                                            $.assert(oResults.t2.neek === false, "context 2");
                                            $.results("2:4");
                                        } catch (e) { $.results("2:4", e) }
                                    }, 20);
                                }
                            }, 10);

                            oResults.t3 = { count: 0 };
                            oResults.t3.fn = core.type.fn.throttle(fnTestFactory("t3"), { wait: 100, leading: false, trailing: true });
                            oResults.t3.id = setInterval(function () {
                                oResults.t3.fn();
                                if (++oResults.t3.count > 19) {
                                    clearInterval(oResults.t3.id);
                                    setTimeout(function () {
                                        try {
                                            $.assert(oResults.t3.i === 4, "wait 100");
                                            $.assert(oResults.t3.neek === false, "context 3");
                                            $.results("3:4");
                                        } catch (e) { $.results("3:4", e) }
                                    }, 20);
                                }
                            }, 20);


                            oResults.t4 = { count: 0 };
                            oResults.t4.fn = core.type.fn.throttle(fnTestFactory("t4"), { wait: 150, leading: false, trailing: true });
                            oResults.t4.id = setInterval(function () {
                                oResults.t4.fn();
                                if (++oResults.t4.count > 54) {
                                    clearInterval(oResults.t4.id);
                                    setTimeout(function () {
                                        try {
                                            $.assert(oResults.t4.i === 3, "wait 150");
                                            $.assert(oResults.t4.neek === false, "context 4");
                                            $.results("4:4");
                                        } catch (e) { $.results("4:4", e) }
                                    }, 20);
                                }
                            }, 10);

                            //# Flag that this a .isAsync test
                            return core.test.isAsync;
                        },

                        /*
                        oOptions - Object representing the desired options:
                            oOptions.context - variant representing the Javascript context (e.g. `this`) in which to call the function.
                            oOptions.wait - Minimum number of milliseconds between each call (default: 500).
                            oOptions.immediate - Execute the function the first time without waiting.
                        */ // TODO
                        debounce: function ($) {
                            var fn,
                                a_iDates = [],
                                fnTest = function () {
                                    a_iDates
                                }
                            ;


                        },

                        poll: {} // TODO
                    },

                    arr: {
                        is: function ($) {
                            $.expect(9);
                            $.assert(core.type.arr.is([]), "[]");
                            $.assert(core.type.arr.is(new Array()), "new Array()");
                            $.assert(!core.type.arr.is([], true), "![] 0-length");
                            $.assert(core.type.arr.is([1,2,3], true), "[] non-0-length");

                            $.assert(!core.type.arr.is({}), "!obj");
                            $.assert(!core.type.arr.is(null), "!null");
                            $.assert(!core.type.arr.is(undefined), "!undefined");
                            $.assert(!core.type.arr.is(1), "!1");
                            $.assert(!core.type.arr.is(function () {}), "!fn");
                        },

                        mk: function ($) {
                            var arr = [1,2,3];

                            $.expect(3);
                            $.assert(core.type.arr.mk(arr) === arr, "arr");
                            $.assert(core.type.arr.mk(new Array(), arr) !== arr, "new Array()");
                            $.assert(core.type.arr.mk("not a traditional arr", arr) === arr, "!str");
                        },

                        rm: function ($) {
                            var arr = [1,2,3,4,5,6,7,8,9,0];

                            $.expect(17);
                            $.assert(core.type.arr.rm(arr, 2, "two"), "rm 2");
                            $.assert.deepEqual(arr, [1,"two",3,4,5,6,7,8,9,0], "rm 2 deepEqual");
                            $.assert(!core.type.arr.rm(arr, 2, "two"), "!rm 2");

                            $.assert(core.type.arr.rm(arr, [4,6,7], ["four","six","seven"]), "rm 4,6,7");
                            $.assert.deepEqual(arr, [1,"two",3,"four",5,"six","seven",8,9,0], "rm 4,6,7 deepEqual");
                            $.assert(!core.type.arr.rm(arr, [4,6,7], ["four","six","seven"]), "!rm 4,6,7");

                            $.assert(core.type.arr.rm(arr, [0,11]), "rm 0,11");
                            $.assert.deepEqual(arr, [1,"two",3,"four",5,"six","seven",8,9], "rm 0,11 deepEqual");
                            $.assert(!core.type.arr.rm(arr, [0,11]), "!rm 0,11");

                            $.assert(core.type.arr.rm(arr, [8]), "rm 8");
                            $.assert.deepEqual(arr, [1,"two",3,"four",5,"six","seven",9], "rm 8 deepEqual");
                            $.assert(!core.type.arr.rm(arr, [8]), "!rm 8");

                            $.assert(!core.type.arr.rm(arr, [12]), "!rm 12");
                            $.assert(!core.type.arr.rm(arr, 14), "!rm 14");

                            $.assert(core.type.arr.rm(arr, [1,3,5,9], 0), "rm 1,3,5,9 to 0");
                            $.assert.deepEqual(arr, [0,"two",0,"four",0,"six","seven",0], "rm 1,3,5,9 deepEqual");
                            $.assert(!core.type.arr.rm(arr, [1,3,5,9]), "!rm 1,3,5,9");
                        },

                        of: function ($) {
                            $.expect(6);
                            $.assert(core.type.arr.of([1,2,3], core.type.int.is), "int.is");
                            $.assert(core.type.arr.of(["a","b"], core.type.str.is), "str.is");
                            $.assert(!core.type.arr.of(["a","b"], core.type.int.is), "!int.is");
                            $.assert(!core.type.arr.of(["a",2,"b"], core.type.str.is), "!str.is");
                            $.assert(!core.type.arr.of([1,2,3], function (x) {
                                return (core.type.int.is(x) && x < 3);
                            }), "!int.is < 3");
                            $.assert(core.type.arr.of([1,2,3], function (x) {
                                return (core.type.int.is(x) && x < 5);
                            }), "!int.is < 5");
                        }
                    },

                    obj: {
                        is: function ($) {
                            var fn = function () {},
                                fnWithProp = function () {}
                            ;
                            fnWithProp.prop = true;

                            // { nonEmpty, allowFn, requiredKeys, interface }
                            $.expect(6);
                            $.assert(core.type.obj.is({}), "{}");
                            $.assert(!core.type.obj.is({}, true), "!{} nonEmpty");
                            $.assert(core.type.obj.is(fn, { allowFn: true }), "fn");
                            $.assert(!core.type.obj.is(fn, { allowFn: true, nonEmpty: true }), "!fn no props");
                            $.assert(core.type.obj.is(fnWithProp, { allowFn: true }), "fn with props");
                            $.assert(core.type.obj.is(fnWithProp, { allowFn: true, nonEmpty: true }), "fn with props req");

                            //$.assert(core.type.obj.is({}), "{}");
                        },

                        mk: function ($) {
                            var obj = { nick: { camp: { bell: true } } };

                            $.expect(3);
                            $.assert(core.type.obj.mk(obj) === obj, "obj");
                            $.assert(core.type.obj.mk(new Object(), obj) !== obj, "new Object()");
                            $.assert(core.type.obj.mk("{}", obj) !== obj, "obj");
                        },

                        rm: function ($) {
                            var oTest;

                            function getTest() {
                                return [
                                    { a: 1, b: 2, c: 3 },
                                    { a: "one", b: "two", c: "three" },
                                    { a: "aye", b: "bee", c: "cee" },
                                ];
                            }

                            $.expect(12);
                            oTest = {
                                ref: getTest(),
                                result: getTest()
                            };
                            delete oTest.ref[0].b;
                            delete oTest.ref[1].b;
                            delete oTest.ref[2].b;
                            $.assert(core.type.obj.rm(oTest.result, "b") === 3, "rm [b]");
                            $.assert.deepEqual(oTest.result, oTest.ref, "rm'd [b]");

                            oTest = {
                                ref: getTest(),
                                result: getTest()
                            };
                            oTest.ref[0].c = undefined;
                            oTest.ref[1].c = undefined;
                            oTest.ref[2].c = undefined;
                            $.assert(core.type.obj.rm(oTest.result, "c", true) === 3, "undefined [c]");
                            $.assert.deepEqual(oTest.result, oTest.ref, "undefined'd [c]");

                            oTest = {
                                ref: getTest(),
                                result: getTest()
                            };
                            delete oTest.ref[0].a;
                            delete oTest.ref[1].a;
                            delete oTest.ref[2].a;
                            delete oTest.ref[0].c;
                            delete oTest.ref[1].c;
                            delete oTest.ref[2].c;
                            $.assert(core.type.obj.rm(oTest.result, ["a","c"]) === 6, "rm [a,c]");
                            $.assert.deepEqual(oTest.result, oTest.ref, "rm'd [a,c]");

                            oTest = {
                                ref: getTest()[1],
                                result: getTest()[1]
                            };
                            delete oTest.ref.a;
                            $.assert(core.type.obj.rm(oTest.result, ["a"]) === 1, "rm [a]");
                            $.assert.deepEqual(oTest.result, oTest.ref, "rm'd [a]");

                            oTest = {
                                ref: getTest()[2],
                                result: getTest()[2]
                            };
                            $.assert(core.type.obj.rm(oTest.result, ["d"]) === 0, "rm [d]");
                            $.assert.deepEqual(oTest.result, oTest.ref, "rm'd [d]");

                            oTest = {
                                ref: getTest()[0],
                                result: getTest()[0]
                            };
                            delete oTest.ref.a;
                            $.assert(core.type.obj.rm(oTest.result, ["a","e"]) === 1, "rm [a,e]");
                            $.assert.deepEqual(oTest.result, oTest.ref, "rm'd [a,e]");
                        },

                        ownKeys: function ($) {
                            function withProp() {}
                            withProp.prop = true;

                            $.expect(6);
                            $.assert.sameMembers(core.type.obj.ownKeys({ nick: true, camp: false, bell: 0, campbell: 1 }), ["nick","camp","bell","campbell"], "keys x4");
                            $.assert.deepEqual(core.type.obj.ownKeys({ nick: true }), ["nick"], "keys x1");
                            $.assert.deepEqual(core.type.obj.ownKeys({}), [], "keys x0");
                            $.assert.deepEqual(core.type.obj.ownKeys(function (){}), [], "fn");
                            $.assert.deepEqual(core.type.obj.ownKeys(withProp), ["prop"], "fn.prop");

                            $.assert(core.type.obj.ownKeys("str") === undefined, "!str");
                        },

                        get: function ($) {
                            $.expect(7);
                            $.assert(core.type.obj.get({ a: 1, b: 2 }, "A") === 1, "A");
                            $.assert(core.type.obj.get({ a: 1, b: 2 }, "a") === 1, "a");
                            $.assert(core.type.obj.get({ a: 1, Bee: 2 }, "bee") === 2, "bee");
                            $.assert(core.type.obj.get({ a: 1, Bee: 2 }, "cee") === undefined, "!cee");
                            $.assert(core.type.obj.get({ a: 1, "": 3 }, "") === 3, "null-str");
                            $.assert(core.type.obj.get({ a: 1, "4": 4 }, 4) === 4, "4");
                            $.assert(core.type.obj.get({ a: 1, "4": 4 }, 5) === undefined, "!5");
                        }
                    },

                    symbol: {
                        exists: function ($) {
                            $.expect(1);
                            $.assert(core.type.symbol.exists() === (window.Symbol ? true : false), "Symbol");
                        },

                        is: function ($) {
                            $.expect(7);
                            $.assert(core.type.symbol.is(window.Symbol()), "Symbol()");

                            $.assert(!core.type.symbol.is([]), "![]");
                            $.assert(!core.type.symbol.is({}), "!obj");
                            $.assert(!core.type.symbol.is(null), "!null");
                            $.assert(!core.type.symbol.is(undefined), "!undefined");
                            $.assert(!core.type.symbol.is(1), "!1");
                            $.assert(!core.type.symbol.is(function () {}), "!fn");
                        },

                        mk: function ($) {
                            var sym = window.Symbol("test");

                            $.expect(3);
                            $.assert(core.type.symbol.mk(sym) === sym, "sym");
                            $.assert(core.type.symbol.mk(window.Symbol(), sym) !== sym, "window.Symbol()");
                            $.assert(core.type.symbol.mk("not a symbol", sym) === sym, "!str");
                        }
                    },

                    dom: { // TODO
                        is: {},
                        mk: {},
                        parse: {}
                    }
                },

                resolve: function ($) {
                    var o = {
                        camp: {
                            er: {},
                            bell: {
                                nick: {
                                    bool: true,
                                    str: "ing",
                                    "dot.name": "dot"
                                },
                                zoe: {}
                            }
                        }
                    };

                    $.expect(15);
                    $.assert(core.resolve(o, "camp.er.doesnt.exist") === undefined, "resolve to nonexistent");
                    $.assert(core.resolve(o, "camp.er.doesnt") === undefined, "verify resolve to nonexistent");

                    $.assert(core.resolve(o, "camp.bell.nick.bool") === true, "resolve to bool");
                    $.assert(core.resolve(o, "camp.bell.nick.bool.length") === undefined, "resolve to bool.length");
                    $.assert(core.resolve(o, "camp.bell.nick.str.length") === 3, "resolve to str.length");
                    $.assert(core.resolve(o, ["camp", "bell", "nick", "dot.name"]) === "dot", "resolve to [as, arr]");

                    $.assert(core.resolve(true, o, ["camp", "bell", "nick", "middle"], "bill") === "bill", "create [as, arr] with val");
                    $.assert(core.resolve(o, "camp.bell.nick").middle === "bill", "verify create [as, arr] with val");
                    $.assert.isObject(core.resolve(true, o, "camp.bell.zoe.kim"), "create as.str w/o val");
                    $.assert.isObject(core.resolve(true, o, ["camp", "bell", "zoe"]).kim, "verify create as.str w/o val");

                    $.assert(core.resolve(core.resolve.returnMetadata, o, "camp.bell.zoe").existed === true, "metadata.existed = true");
                    $.assert(core.resolve(core.resolve.returnMetadata, o, "camp.bell.zoe").created === false, "metadata.created = false");
                    $.assert(core.resolve(core.resolve.returnMetadata, true, o, "camp.bell.elle").existed === false, "metadata.existed = false");
                    $.assert(core.resolve(core.resolve.returnMetadata, true, o, ["camp", "bell", "elle", "bean"], "yep").created === true, "metadata.created = true");
                    $.assert(core.resolve(core.resolve.returnMetadata, o, ["camp", "bell", "elle", "bean"]).value === "yep", "metadata.value");
                }, //# resolve

                extend: function ($) {
                    var o = {
                        x1: 1, o1: {
                            x2: 2, o2: {
                                x3: 3, o3: {
                                    x4: 4, o4: {
                                        x5: 5
                                    }
                                }
                            }
                        }
                    };

                    $.expect(7);
                    $.assert.deepEqual(core.extend({ one: 1 }, { two: 2 }), { one: 1, two: 2 }, "extend 2");
                    $.assert.deepEqual(core.extend({ one: 1 }, { two: 2 }, { three: 3 }), { one: 1, two: 2, three: 3 }, "extend 3");
                    $.assert.deepEqual(core.extend({ one: 1 }, { two: 2 }, { two: 22, three: 3 }), { one: 1, two: 22, three: 3 }, "extend 3 override");
                    $.assert.deepEqual(core.extend(1, { one: 1 }, { two: { three: 3, four: 4 } }, { two: { three: 33 } }), { one: 1, two: { three: 33 } }, "extend 3 override shallow");
                    $.assert.deepEqual(core.extend(0, { one: 1 }, { two: { three: 3, four: 4 } }, { two: { three: 33 } }), { one: 1, two: { three: 33, four: 4 } }, "extend 3 override deep");

                    $.assert.deepEqual(
                        core.extend(2, {
                            x1: 11, one: 1, o1: {
                                x2: 22, two: 2, o2: {
                                    x3: 33, three: 3, o3: {
                                        four: 44
                                    }
                                }
                            }
                        }, o),
                        {
                            x1: 1, one: 1, o1: {
                                x2: 2, two: 2, o2: {
                                    x3: 3, o3: {
                                        x4: 4, o4: {
                                            x5: 5
                                        }
                                    }
                                }
                            }
                        },
                        "extend 2 override 2 deep"
                    );

                    $.assert(false, "deepcopy test"); // TODO
                },

                require: {
                    _: {},
                    modules: {},
                    scripts: {},
                    links: {},
                    css: {}
                },

                oop: {
                    partial: function ($) {
                        var oOOP = {
                            one: function () { return 1; },
                            two: function () { return 2; }
                        };

                        $.expect(11);
                        core.oop.partial(oOOP, function (oProtected) {
                            oProtected.protectedFive = function () { return -5; };

                            return {
                                three: function () { return 3; },
                                four: function () { return 4; }
                            };
                        });
                        $.assert(oOOP.one() === 1, "fn1");
                        $.assert(oOOP.two() === 2, "fn2");
                        $.assert(oOOP.three() === 3, "fn3");
                        $.assert(oOOP.four() === 4, "fn4");

                        core.oop.partial(oOOP, function (oProtected) {
                            return {
                                five: function () { return oProtected.protectedFive() * -1; }
                            };
                        });
                        $.assert(oOOP.one() === 1, "fn1.2");
                        $.assert(oOOP.three() === 3, "fn3.2");
                        $.assert(oOOP.five() === 5, "protectedFive");

                        core.oop.partial(oOOP, {
                            six: function () { return 6; },
                            seven: 7
                        });
                        $.assert(oOOP.one() === 1, "fn1.3");
                        $.assert(oOOP.four() === 4, "fn4.2");
                        $.assert(oOOP.six() === 6, "fn6");
                        $.assert(oOOP.seven === 7, "prop7");
                        },
                    protected: function ($) {
                        var oOOP = {
                            one: function () { return -1; },
                            two: function () { return -2; }
                        };

                        core.oop.protected(oOOP, {
                            protectedThree: function () { return 3; },
                            protected4: 4
                        });
                        core.oop.partial(oOOP, function (oProtected) {
                            return {
                                three: function () { return oProtected.protectedThree() * -1; },
                                four: function() { return oProtected.protected4 * -1; },
                                five: -5
                            };
                        });
                        $.expect(5);
                        $.assert(oOOP.one() === -1, "fn-1");
                        $.assert(oOOP.two() === -2, "fn-2");
                        $.assert(oOOP.three() === -3, "fn-3");
                        $.assert(oOOP.four() === -4, "fn-4");
                        $.assert(oOOP.five === -5, "fn-5");
                        }
                },

                io: {
                    console: function ($) {
                        var _console = window.console,
                            oResults = {}
                        ;

                        $.expect(6);
                        $.assert.isFunction(_console.log, "window.console.log");

                        window.console = {
                            error: function (sDesc) {
                                oResults.error = sDesc;
                            },
                            warn: function (sDesc) {
                                oResults.warn = sDesc;
                            },
                            log: function (sDesc) {
                                oResults.log = sDesc;
                            }
                        };
                        ish.io.console.error("error");
                        ish.io.console.warn("warn");
                        ish.io.console.log("log");

                        $.assert(_console !== window.console, "preflight");
                        window.console = _console;
                        $.assert(oResults.error === "error", "console.error");
                        $.assert(oResults.warn === "warn", "console.warn");
                        $.assert(oResults.log === "log", "console.log");
                        $.assert(_console === window.console, "postflight");
                    },

                    event: { // TODO
                        fire: function ($) { // + _
                            //$.expect(6);
                            //$.assert(_console !== window.console, "preflight");
                        },
                        unwatch: function ($) {},
                        registered: function ($) {},
                        fired: function ($) {},
                        watch: function ($) {}
                    }
                },

                lib: function ($) {
                    $.expect(1);
                    $.assert.deepEqual(core.app, {
                        data: {},
                        ui: {}
                    }, "lib as interface");
                },

                app: function ($) {
                    $.expect(1);
                    $.assert.deepEqual(core.app, {
                        data: {},
                        ui: {}
                    }, "app as interface");
                }
            };
        }); //# core.test.*

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
