/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core, ClipboardJs) {
    'use strict';

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
        function clipboard($element, vValue) {
            var _element = $element[0],
                oClipboard = new ClipboardJs(_element, {
                    text: function (/*_element*/) {
                        $element.removeClass(oClipboardOptions.iconClass);
                        $element.addClass(oClipboardOptions.clickClass);
    
                        setTimeout(function() {
                            $element.removeClass(oClipboardOptions.clickClass);
                            $element.addClass(oClipboardOptions.iconClass);
                            //_element.clipboard.destroy();
                        }, oClipboardOptions.clickTimeout);
    
                        return (core.is.fn(vValue) ? vValue($element) : vValue);
                    }
                })
            ;
    
            //# 
            _element.clipboard = oClipboard;
    
            /*
            oClipboard.on('success', function (e) {
                console.log(e);
                //e.stopPropagation();
            });
    
            oClipboard.on('error', function (e) {
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

}(document.getElementsByTagName("HTML")[0].ish, window.Clipboard);
