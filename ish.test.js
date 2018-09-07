/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';

    core.extend(core, {
        test: {
            resolve: function () {
                /*
                var neek = {};
                var neek2 = { camp: { bell: true } };

                var result1 = core.resolve(neek, "camp.bell"); // === undefined
                var result2 = core.resolve(neek2, "camp.bell"); // === true

                var result3 = core.resolve(true, neek, "camp.bell"); // === {} with neek now = { camp: { bell: {} } }
                var result4 = core.resolve(true, neek, "camp.bell", "blah"); // === "blah" with neek now = { camp: { bell: "blah" } }

                var result5 = core.resolve(neek, "camp.bell", "blah"); // === undefined
                var result6 = core.resolve(neek2, "camp.bell", "blah"); // === "blah" with neek2 now = { camp: { bell: "blah" } }
                */
            }, //# resolve

            lang: {
                overload: function () {
                    /*
                    window.poly = core.lang.overload(function () { console.log(-1, arguments); })
                        .add(function () { console.log(1, arguments); }, [])
                        .add(function () { console.log(2, arguments); }, [core.type.str.is], "s")
                        .add(function () { console.log(3, arguments); }, [core.type.str.is, core.type.bool.is], "sb")
                        .add(function () { console.log(4, arguments); }, [core.type.int.is], "i")
                    ;
                    */
                },

                inherit: function () {
                    /*
                    window.inherit = {
                        subClass: {
                            fn: function () { console.log("fn.sub"); },
                            i1: "i1.sub"
                        },
                        baseClass: {
                            fn: function () { console.log("fn.base"); },
                            fn2: function () { console.log("fn2.base"); },
                            i1: "i1.base",
                            i2: "i2.base"
                        },
                        parentClass: {
                            fn: function () { console.log("fn.parent"); },
                            fn2: function () { console.log("fn2.parent"); },
                            fn3: function () { console.log("fn3.parent"); },
                            i1: "i1.parent",
                            i2: "i2.parent",
                            i3: "i3.parent"
                        },
                        result: null
                    };
                    window.inherit.result = core.lang.inherit(window.inherit.subClass, window.inherit.baseClass, window.inherit.parentClass);
                    */
                }
            }, //# lang

            require: function () {
                /*
                core.require.queue(
                    [
                        sBaseUrl + 'highcharts2/highcharts.js', //# 1
                        [
                            sBaseUrl + 'z.app.histograms.js', //# 1
                            sBaseUrl + 'z.app.charts.js', //# 1
                            sBaseUrl + 'highcharts2/map.js',
                            sBaseUrl + 'highcharts2/world.js',
                            sBaseUrl + 'highcharts2/exporting.js',
                            sBaseUrl + 'highcharts2/drilldown.js'
                        ]
                    ], function () {
                        load();
                    }
                );
                */
            } //# require
        }
    });

}(document.querySelector("SCRIPT[ish]").ish);
