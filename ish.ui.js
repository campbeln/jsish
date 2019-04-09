/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';

    var _window = window,                                                           //# code-golf
        _document = document,                                                       //# code-golf
        _head = _document.head,                                                     //# code-golf
        _undefined /*= undefined*/,                                                 //# code-golf
        _document_querySelector = _document.querySelector.bind(_document),          //# code-golf
        _document_querySelectorAll = _document.querySelectorAll.bind(_document)     //# code-golf
    ;


    /*
    ####################################################################################################
    Class: core.dom
    DOM-manipulation functionality.
    Requires:
    <core.extend>, <core.resolve>, 
    <core.type.str.is>, <core.type.dom.is>, <core.type.num.is>, <core.type.obj.is>, <core.type.fn.is>, 
    <core.type.dom.mk>, <core.type.arr.mk>, <core.type.obj.mk>, <core.type.json.mk>, <core.type.str.mk>, <core.type.int.mk>, 
    <core.type.fn.call>, <core.type.fn.poll>, 
    *<core.io.net.xhr>
    ####################################################################################################
    */
    core.oop.partial(core.ui, function (/*oProtected*/) {
        return {
            jsRequired: function (sID) {
                
            }
        };
    }); //# core.ui

}(document.querySelector("SCRIPT[ish]").ish); //# Web-only
