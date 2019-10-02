/** ################################################################################################
 * Browser-based Modal mixin for ishJS
 * @mixin ish.lib.modal
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
################################################################################################# */
!function (core) {
    "use strict";


    //# Build the core.lib.modal wrapper around TingleJS's modal implementation
    //#     NOTE: core.require includes the required scripts/CSS then runs the provided function
    core.require(["ish.ui.css.js", "libs/tingle-modal/tingle.min.js", "libs/tingle-modal/tingle.min.css"], function (/*a_sUrls, bAllLoaded*/) {
        //# Add the required class into our body and .insertRules to tweak the .tingle-modal-box
        core.ui.css.class.add(document.getElementsByTagName("BODY")[0], "tingle-content-wrapper");
        core.ui.css.insertRules([
            ".tingle-modal-box          { width: auto !important;   max-width: 60%;     min-width: 30%; }",
            ".tingle-modal-box INPUT    { border: 1px solid black;  width: 60%;         background-color: #f5f5f5; }"
        ] /*, { style: _dom }*/);

        //# Setup lib.modal
        core.lib.modal = core.extend(
            function (oOptions) {
                var oModal, oCurrent, sCSS, i;

                //# 
                oOptions = core.type.obj.mk(oOptions);
                core.ui.clearSelection();

                // instanciate new modal
                oModal = new tingle.modal({
                    footer: true,
                    stickyFooter: false,
                    closeMethods: ['overlay', 'button', 'escape'],
                    closeLabel: oOptions.closeLabel || "Close",
                    //cssClass: ['custom-class-1', 'custom-class-2'],
                    onOpen: function(/*arguments*/) {
                        core.type.fn.call(oOptions.hookOpen, null, arguments);
                    },
                    onClose: function(/*arguments*/) {
                        core.type.fn.call(oOptions.callback, null, arguments);
                    },
                    beforeOpen: function(/*arguments*/) {
                        core.type.fn.call(oOptions.hookPreOpen, null, arguments);
                    },
                    beforeClose: function(/*arguments*/) {
                        //# must return true to close modal
                        if (core.type.fn.is(oOptions.hookPreClose)) {
                            return core.type.fn.call(oOptions.hookPreClose, null, arguments);
                        }
                        else {
                            return true;
                        }
                    }
                });

                // set content
                oModal.setContent(oOptions.innerHTML || core.type.dom.mk(oOptions.element).innerHTML);

                //# 
                if (core.type.arr.is(oOptions.buttons)) {
                    for (i = 0; i < oOptions.buttons.length; i++) {
                        oCurrent = core.type.obj.mk(oOptions.buttons[i]);

                        //# 
                        switch (oCurrent.type) {
                            case "primary": {
                                sCSS = "tingle-btn--primary";
                                break;
                            }
                            case "warning": {
                                sCSS = "tingle-btn--danger";
                                break;
                            }
                            //case "default": {
                            //    sCSS = "tingle-btn--default";
                            //    break;
                            //}
                            default: {
                                sCSS = "tingle-btn--default";
                            }
                        }

                        // add a button
                        oModal.addFooterBtn(oCurrent.label, 'tingle-btn tingle-btn--pull-right ' + sCSS + " " + oCurrent.css, core.type.fn.mk(oCurrent.callback));
                    }
                }
                //#
                else {
                    oModal.addFooterBtn("OK", 'tingle-btn tingle-btn--pull-right tingle-btn--primary', core.type.fn.mk(oOptions.callback, function () { oModal.close(); }));
                }

                return {
                    native: oModal,
                    open: function () {
                        oModal.open();
                    },
                    close: function () {
                        oModal.close();
                    }
                };
            }, {
                //# 
                alert: function (sText, fnCallback, oOptions) {
                    var oAlert = core.lib.modal(core.extend({
                        innerHTML: sText,
                        callback: fnCallback
                    }, oOptions));

                    //#
                    oAlert.open();
                    return oAlert;
                }, //# alert

                //# 
                confirm: function (sText, fnCallback) {
                    var oConfirm = core.lib.modal({
                        innerHTML: sText,
                        buttons: [
                            {
                                label: "OK",
                                type: "primary",
                                callback: function () {
                                    core.type.fn.call(fnCallback, null, [true]);
                                    oConfirm.close();
                                }
                            }, {
                                label: "Cancel",
                                callback: function () {
                                    core.type.fn.call(fnCallback, null, [false]);
                                    oConfirm.close();
                                }
                            }
                        ]
                    });

                    //#
                    oConfirm.open();
                    return oConfirm;
                }, //# confirm

                //# 
                prompt: function (sText, fnCallback, oOptions) {
                    var _input,
                        sID = core.ui.dom.getId(),
                        oPrompt = core.lib.modal({
                            innerHTML: "<h1>" + sText + "</h1><input type='text' id='" + sID + "'><p>" + core.type.str.mk(core.resolve(oOptions, "footer")),
                            hookOpen: function () {
                                _input = document.getElementById(sID);
                                _input.focus();
                            },
                            buttons: [
                                {
                                    label: "OK",
                                    type: "primary",
                                    callback: function () {
                                        core.type.fn.call(fnCallback, null, [_input.value]);
                                        oPrompt.close();
                                    }
                                }, {
                                    label: "Cancel",
                                    callback: function () {
                                        core.type.fn.call(fnCallback);
                                        oPrompt.close();
                                    }
                                }
                            ]
                        })
                    ;

                    //#
                    oPrompt.open();
                    return oPrompt;
                } //# prompt
            }
        );
    }, { baseUrl: "" }); //# core.lib.modal

}(document.querySelector("SCRIPT[ish]").ish); //# Web-only
