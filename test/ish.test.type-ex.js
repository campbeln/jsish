//################################################################################################
/** @file Framework Unit Testing mixin for ish.js
 * @mixin ish.test
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2023, Nick Campbell
 * @ignore
 */ //############################################################################################
(function () {
    'use strict';


    function init(core) {
        core.oop.partial(core.test.type, function (/*oProtected*/) {
            return {
                is: {
                    truthy: function ($) {
                        $.expect(8);
                        $.assert(!core.type.is.truthy(0), "0");
                        $.assert(!core.type.is.truthy(""), "null-string");
                        $.assert(!core.type.is.truthy(NaN), "NaN");
                        $.assert(!core.type.is.truthy(null), "null");
                        $.assert(!core.type.is.truthy(false), "false");
                        $.assert(!core.type.is.truthy(undefined), "undefined");

                        $.assert(core.type.is.truthy(1), "1");
                        $.assert(core.type.is.truthy({}), "{}");
                    }, //# truthy

                    numeric: {
                        eq: function ($) {
                            $.expect(6);
                            $.assert(core.type.is.numeric.eq(0, 0), "0 == 0");
                            $.assert(core.type.is.numeric.eq(0, 0.0), "0 == 0.0");
                            $.assert(core.type.is.numeric.eq(1, 1.0), "1 == 1.0");
                            $.assert(core.type.is.numeric.eq("100", 100.0), "'100' == 100.0");

                            $.assert(!core.type.is.numeric.eq(0, 1), "0 == 1");
                            $.assert(!core.type.is.numeric.eq(0, 0.1), "0 == 0.1");
                        },

                        cmp: function ($) {
                            $.expect(6);
                            $.assert(core.type.is.numeric.cmp(1, 0) === 1, "0, 1");
                            $.assert(core.type.is.numeric.cmp(1, 1) === 0, "0, 1");
                            $.assert(core.type.is.numeric.cmp(0, 1) === -1, "0, 1");
                            $.assert(core.type.is.numeric.cmp(0, 2) === -1, "0, 1");

                            $.assert(core.type.is.numeric.cmp(0, null) === undefined, "0, null");
                            $.assert(core.type.is.numeric.cmp(0) === undefined, "0, null");
                        },

                        sum: function ($) {
                            $.expect(6);
                            $.assert(core.type.is.numeric.sum([1,1,1]) === 3, "[1,1,1]");
                            $.assert(core.type.is.numeric.sum([3,3,3], "") === 9, "[3,3,3]");
                            $.assert(core.type.is.numeric.sum([4,4,4], []) === 12, "[4,4,4]");

                            $.assert(core.type.is.numeric.sum([{ a: 2 },{ a: 2 },{ a: 2 }], "a") === 6, "[{ a: 2 }...]");
                            $.assert(core.type.is.numeric.sum([{ a: { b: 5 } },{ a: { b: 5 } },{ a: { b: 5 } }], "a.b") === 15, "[{ a: 5 }...]");
                            $.assert(core.type.is.numeric.sum([{ a: { b: 6 } },{ a: { b: 6 } },{ a: { b: 6 } }], ["a", "b"]) === 18, "[{ a: 5 }...]");
                        },

                        stats: function ($) {
                            $.expect(16);

                            var oResult = core.type.is.numeric.stats([5, 5, 5, 4, 2, 8, 4, 1, 1, 1, 1, 5]);
                            $.assert(oResult.average === 3.5, "average");
                            $.assert(oResult.mean === 3.5, "mean");
                            $.assert(oResult.median === 4, "median");
                            $.assert.deepEqual(oResult.mode, [1, 5], "mode");
                            $.assert(oResult.count === 12, "count");
                            $.assert(oResult.range === 7, "count");
                            $.assert(oResult.sum === 42, "sum");
                            $.assert.deepEqual(oResult.values, [1, 1, 1, 1, 2, 4, 4, 5, 5, 5, 5, 8], "values");

                            oResult = core.type.is.numeric.stats([{a:5}, {a:5}, {a:5}, {a:4}, {a:2}, {a:"8"}, {a:4}, {a:1}, {a:1}, {a:1}, {a:1}, {a:5}], "a");
                            $.assert(oResult.average === 3.5, "average");
                            $.assert(oResult.mean === 3.5, "mean");
                            $.assert(oResult.median === 4, "median");
                            $.assert.deepEqual(oResult.mode, [1, 5], "mode");
                            $.assert(oResult.count === 12, "count");
                            $.assert(oResult.range === 7, "count");
                            $.assert(oResult.sum === 42, "sum");
                            $.assert.deepEqual(oResult.values, [1, 1, 1, 1, 2, 4, 4, 5, 5, 5, 5, 8], "values");
                        }
                    }, //# numeric

                    any: function ($) {
                        $.expect(5);
                        $.assert(core.type.any(0, [0, 1, 2, 3, 4]), "0");
                        $.assert(!core.type.any(0, [1, 2, 3, '0', 4]), "'0'");
                        $.assert(core.type.any(0, [1, 2, 3, '0', 4], true), "'0', bUseCoercion");
                        $.assert(!core.type.any('0', [1, 2, 3, 0, 4]), "'0' !== 0");
                        $.assert(core.type.any('0', [1, 2, 3, 4, 0], true), "'0' == 0");
                    }
                }, //# is

                query: function ($) {
                    var a_oResult,
                        a_oData = [
                            { a: 1, b: "two", c: [1, 2, 3] },
                            { a: 10, b: "to", c: [1, 2, 3, 4] },
                            { a: 100, b: "too", c: [4, 5, 6] },
                            { a: 10, b: "tu", c: [4, 5, 6] },
                            { a: 10000, b: "two", c: [9, 8, 7, 6] }
                        ]
                    ;

                    //# [{}, {}] = core.type.query([{}, {}], { key: "val", key2: ["val1", "val2"], "path.to.key3": function(vTestValue, oSourceIndex, oOptions) { return true || false; } })

                    $.expect(5);
                    a_oResult = core.type.query(a_oData, { b: "two" });
                    $.assert(a_oResult.length === 2 && a_oResult[0].a === 1 && a_oResult[1].a === 10000, "two");

                    a_oResult = core.type.query(a_oData, { a: [1, 100] });
                    $.assert(a_oResult.length === 2 && a_oResult[0].b === "two" && a_oResult[1].b === "too", "two,too");

                    a_oResult = core.type.query(a_oData, [{ a: 10}, { b: "too" }]);
                    $.assert(a_oResult.length === 3 && a_oResult[0].b === "to" && a_oResult[1].b === "tu" && a_oResult[2].b === "too", "to,tu,too");

                    a_oResult = core.type.query(a_oData, { a: function (vTestValue /*, oSource, oOptions*/) { return vTestValue >= 100; } });
                    $.assert(a_oResult.length === 2 && a_oResult[0].a === 100 && a_oResult[1].a === 10000, "too,two");

                    a_oResult = core.type.query(a_oData, { c: function (vTestValue /*, oSource, oOptions*/) { return vTestValue.length > 3; } });
                    $.assert(a_oResult.length === 2 && a_oResult[0].c[3] === 4 && a_oResult[1].c[0] === 9, "to,two");
                }, //# query

                type: {
                    fn: {
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

                            $.expect(8, 4);

                            oResults.t1 = { count: 0 };
                            oResults.t1.fn = core.type.fn.throttle(fnTestFactory("t1"), { wait: 50, context: { neek: true } });
                            oResults.t1.id = setInterval(function () {
                                oResults.t1.fn();
                                if (++oResults.t1.count > 49) {
                                    clearInterval(oResults.t1.id);
                                    setTimeout(function () {
                                        $.asyncTests(function () {
                                            $.assert(oResults.t1.i === 10, "wait 50");
                                            $.assert(oResults.t1.neek === true, "context");
                                        });
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
                                        $.asyncTests(function () {
                                            $.assert(oResults.t2.i === 21, "wait 25");
                                            $.assert(oResults.t2.neek === false, "context 2");
                                        });
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
                                        $.asyncTests(function () {
                                            $.assert(oResults.t3.i === 4, "wait 100");
                                            $.assert(oResults.t3.neek === false, "context 3");
                                        });
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
                                        $.asyncTests(function () {
                                            $.assert(oResults.t4.i === 3, "wait 150");
                                            $.assert(oResults.t4.neek === false, "context 4");
                                        });
                                    }, 20);
                                }
                            }, 10);
                        },

                        debounce: function ($) {
                            var oResults = {},
                                fnTestFactory = function (sKey) {
                                    var i = 0;
                                    return function () {
                                        oResults[sKey].i = ++i;
                                        oResults[sKey].neek = (this ? this.neek === true : false);
                                    };
                                }
                            ;

                            $.expect(6, 3);

                            oResults.t1 = { count: 0 };
                            oResults.t1.fn = core.type.fn.debounce(fnTestFactory("t1"), { wait: 50, immediate: false, context: { neek: true } });
                            oResults.t1.id = setInterval(function () {
                                oResults.t1.fn();
                                if (++oResults.t1.count > 49) {
                                    clearInterval(oResults.t1.id);
                                    setTimeout(function () {
                                        $.asyncTests(function () {
                                            $.assert(oResults.t1.i === 1, "wait 50");
                                            $.assert(oResults.t1.neek === true, "context");
                                        });
                                    }, 75);
                                }
                            }, 10);

                            oResults.t2 = { count: 0 };
                            oResults.t2.fn = core.type.fn.debounce(fnTestFactory("t2"), { wait: 25, immediate: true });
                            oResults.t2.id = setInterval(function () {
                                oResults.t2.fn();
                                if (++oResults.t2.count > 49) {
                                    clearInterval(oResults.t2.id);
                                    setTimeout(function () {
                                        $.asyncTests(function () {
                                            $.assert(oResults.t2.i === 1, "wait 25");
                                            $.assert(oResults.t2.neek === false, "context 2");
                                        });
                                    }, 50);
                                }
                            }, 10);

                            oResults.t3 = { count: 0 };
                            oResults.t3.fn = core.type.fn.debounce(fnTestFactory("t3"), { wait: 100, immediate: true });
                            oResults.t3.id = setInterval(function () {
                                oResults.t3.fn();
                                if (++oResults.t3.count > 4) {
                                    clearInterval(oResults.t3.id);
                                    setTimeout(function () {
                                        $.asyncTests(function () {
                                            $.assert(oResults.t3.i === 5, "wait 100");
                                            $.assert(oResults.t3.neek === false, "context 3");
                                        });
                                    }, 20);
                                }
                            }, 120);
                        }
                    },

                    obj: {
                        "is.interface": function ($) {
                            //todo
                        },

                        unique: function ($) {
                            var a_oResult,
                                a_oData = [
                                    { one: 1, two: 2, three: 3, four: 4 },
                                    { one: 11, two: 2, three: 3, four: 44 },
                                    { one: "1", two: 22, three: 3, four: 444 },
                                    { one: 1, two: 2, three: 33, four: 4444 }
                                ]
                            ;

                            ish.type.query(n, { four: function (v, i) { return v > 44; } });
                            ish.type.query(n, { one: function (v, i) { return v > 1; } });
                        }
                    }
                }
            };
        }); //# core.test.

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
        init(window.head.ish || document.querySelector("SCRIPT[ish]").ish);
    }
}());
