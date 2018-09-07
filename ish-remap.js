/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';


    //# Temp Mappings to old locations (core.is, core.mk, core.fn)
    core.is = {
        str: core.type.str.is,
        date: core.type.date.is,
        int: core.type.int.is,
        float: core.type.float.is,
        bool: core.type.bool.is,
        obj: core.type.obj.is,
        arr: core.type.arr.is,

        json: core.type.json.is,
        dom: core.type.dom.is,

        num: core.type.num.is,
        fn: core.type.fn.is,

        type: core.type.is,
        val: core.type.is.val,
        'true': core.type.is.true,
        native: core.type.is.native,

        list: core.type.list.is,
        selector: core.type.selector.is
    }; //# core.is

    core.mk = {
        str: core.type.str.mk,
        date: core.type.date.mk,
        int: core.type.int.mk,
        float: core.type.float.mk,
        bool: core.type.bool.mk,
        obj: core.type.obj.mk,
        arr: core.type.arr.mk,

        json: core.type.json.mk,
        dom: core.type.dom.mk
    }; //# core.mk

    core.fn = core.type.fn;

}(document.querySelector("SCRIPT[ish]").ish);
