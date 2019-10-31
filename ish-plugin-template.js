/** ################################################################################################
 * XYZ mixin for ishJS
 * @mixin ish.type.enum
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
################################################################################################# */
!function () {
    'use strict';


    function init(core) {
        //################################################################################################
        /** Collection of X-based functionality.
         * @namespace ish.X
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.X, {
        }); //# core.?
    }

    //# If we are running server-side (or possibly have been required as a CommonJS module)
    if (typeof window === 'undefined') { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = init;
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}();
