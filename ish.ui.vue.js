//################################################################################################
/** @file Browser-based VueJS mixin for ish.js
 * @mixin ish.ui.vue
 * @author Nick Campbell
 * @license MIT
 * @copyright 2024, Nick Campbell
 * @ignore
 */ //############################################################################################
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
/*jslint bitwise: true */                                       //# Enable bitwise operators for JSHint
//<MIXIN>
(async function (core, Vue) {
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
    core.oop.partial(core.ui, async function (/*oProtected*/) {
        //var ;


        //#
        return {
            vue: {
                create: async function (vDOM, oData) {
                    var $dom = core.type.dom.mk(vDOM, null),
                        bDataPassed = core.type.obj.is(oData),
                        oReturnVal = {
                            library: Vue,
                            instance: null,
                            target: $dom,
                            key: Vue.ref(0),
                            loaded: false,

                            //#
                            data: async function () {
                                //#
                                (async function() {
                                    await oReturnVal.instance.$nextTick();
                                    oReturnVal.sync();
                                })();

                                return oData;
                            },

                            //#
                            sync: function () {
                                oReturnVal.key.value += 1;
                            }
                        }
                    ;

                    //#
                    if ($dom) {
                        //#
                        $dom.setAttribute(":key", "$instance.key");

                        //#
                        oData = (bDataPassed ? oData : core.data);

                        //#
                        oReturnVal.instance = Vue.createApp({
                            // methods: {},

                            data() {
                                return oData;
                            },

                            created: function () {
                                oReturnVal.loaded = true;
                            }
                        });

                        //#
                        oReturnVal.instance.config.globalProperties.app = core;
                        if (bDataPassed) {
                            oReturnVal.instance.config.globalProperties.data = oData;
                        }
                        oReturnVal.instance.mount($dom);
                    }

                    return oReturnVal;
                }
            }
        };
    }); //# core.ui.vue

    //# .fire the plugin's loaded event
    core.io.event.fire("ish.ui.vue");

    //# Return core to allow for chaining
    return core;

}(window.head.ish || document.querySelector("SCRIPT[ish]").ish), window.Vue); //# Web-only
//</MIXIN>
