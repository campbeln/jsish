//################################################################################################
/** @file Browser-based Clipboard mixin for ish.js
 * @mixin ish.ui.clipboard
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 * @ignore
 */ //############################################################################################
(function (core) {
    "use strict";

    //# Build the core.lib.ui.clipboard wrapper around ClipboardJS's implementation
    //#     NOTE: core.require includes the required scripts/CSS then runs the provided function
    core.require(["ish.ui.css.js", "libs/clipboard.min.js"], function (/*a_sUrls, bAllLoaded*/) {
        /*
        ####################################################################################################
        Class: core.ui.clipboard
        Clipboard-based functionality.
        Requires:
        <core.extend>
        ####################################################################################################
        */
        core.oop.partial(core.ui, function (/*oProtected*/) {
            var oClipboardOptions = {
                clickTimeout: 1000,
                iconClass: "fa-clipboard",
                clickClass: "fa-check"
            };

            //#
            function clipboard(_element, vValue) {
                //#
                _element.clipboard = new window.Clipboard(_element, {
                    text: function (/*_element*/) {
                        core.ui.css.class.rm(_element, oClipboardOptions.iconClass);
                        core.ui.css.class.add(_element, oClipboardOptions.clickClass);

                        setTimeout(function() {
                            core.ui.css.class.rm(_element, oClipboardOptions.clickClass);
                            core.ui.css.class.add(_element, oClipboardOptions.iconClass);
                            //_element.clipboard.destroy();
                        }, oClipboardOptions.clickTimeout);

                        return (core.type.fn.is(vValue) ? vValue(_element) : vValue);
                    }
                });
                /*
                _element.clipboard.on('success', function (e) {
                    console.log(e);
                    //e.stopPropagation();
                });

                _element.clipboard.on('error', function (e) {
                    console.log(e);
                    //e.stopPropagation();
                });
                */
            } //# clipboard

            return {
                clipboard: core.extend(clipboard, {
                    options: function (oOptions) {
                        oClipboardOptions = core.extend(oClipboardOptions, oOptions);
                    }
                })
            };
        }); //# core.ui.clipboard
    }, { baseUrl: "" }); //# core.ui.clipboard

    //# .fire the plugin's loaded event
    core.io.event.fire("ish.ui.clipboard");

}(document.querySelector("SCRIPT[ish]").ish)); //# Web-only
