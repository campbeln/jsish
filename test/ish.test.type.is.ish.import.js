/** ################################################################################################
 * Support file for the Framework Unit Testing plugin
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2021, Nick Campbell
################################################################################################# */
(function () {
    'use strict';

    function init(core) {
        core.test.type.is.ish.import.__completeTest(true);
    }


    //# If we are running server-
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
