/** ################################################################################################
 * XYZ mixin for ish.js
 * @mixin ish.type.enum
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2021, Nick Campbell
################################################################################################# */
(function () {
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
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}());


//# Uses AMD, Node or browser globals to create a module.
//#     NOTE: If you want something that will work in other stricter CommonJS environments, or if you need to create a circular dependency, see commonJsStrict.js
(function (_root, factory) {
    //# .define as an anonymous AMD module
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    }
    //# .exports to Node
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports
    else if (typeof module === 'object' && module.exports) {
        module.exports = factory;
    }
    //# Run the factory
    else {
        factory(document.querySelector("SCRIPT[ish]").ish);
    }
}(typeof self !== 'undefined' ? self : this, function /*factory*/(core) {
    'use strict';

    //################################################################################################
    /** Collection of X-based functionality.
     * @namespace ish.X
     * @ignore
     */ //############################################################################################
    core.oop.partial(core.X, {
    }); //# core.?
}));
