//################################################################################################
/** @file OOP Inheritance mixin for ishJS
 * @mixin ish.oop.inherit
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
 */ //############################################################################################
!function () {
    'use strict';

    function init(core) {
    //################################################################################################
    /** Collection of Multiple Inheritance-based functionality.
     * @namespace ish.oop.inherit
     */ //############################################################################################
    core.oop.partial(core.oop, function (/*oProtected*/) {
            var _this = this,
                oOopData = _this.oopData
            ;

            //# add(the)OopDataType d(erivedFrom), defaulting to []
            //#     NOTE: Setting up a .watch for the .event isn't necessary as the added data type will be defaulted to [] automajicially
            _this.addOopDataType("d", []);
            //core.io.event.watch("ish.oop._setOopEntry", function (/*vTarget, oProtected*/) {
            //    oOopData.d.push([]);
            //});


            return {
                /*
                Implementation of multiple inheritance for Javascript
                */
                inherit: function () {
                    //# Safely returns the d(erivedFrom) array stored in oopData for the vTarget
                    function derivedFrom(vTarget) {
                        return oOopData.d[
                            oOopData.i.indexOf(vTarget)
                        ] || [];
                    } //# derivedFrom


                    return core.extend(
                        //#########
                        /** .
                         * @function ish.oop.inherit.!
                         * @param {object[]} a_oBaseClassHierarchy Value representing the following options
                         * @param {object|function} vTarget Value representing the following options
                         */ //#####
                        function (a_oBaseClassHierarchy, vTarget) {
                            var oProtected, i,
                                a_oProtected = [{}] //# Pre-populate a_oProtected with a blank object to receive vTarget's oProtected interfaces
                            ;

                            //# If the passed a_oBaseClassHierarchy .is an .arr and vTarget is a valid .extend target
                            if (core.type.arr.is(a_oBaseClassHierarchy) && core.type.obj.is(vTarget, { allowFn: true })) {
                                //# Traverse the a_oBaseClassHierarchy, .push'ing each .p(rotected) reference (if any) into a_oProtected
                                //#      NOTE: We traverse the a_oBaseClassHierarchy in reverse because .extend works as right-most wins, while a_oBaseClassHierarchy is left-most wins
                                for (i = a_oBaseClassHierarchy.length - 1; i > -1; i--) {
                                    oProtected = oOopData.p[oOopData.i.indexOf(a_oBaseClassHierarchy[i])];
                                    if (core.type.obj.is(oProtected, { nonEmpty: true })) {
                                        a_oProtected.push(oProtected);
                                    }
                                }

                                //# 
                                _this.setOopEntry(vTarget, core.extend.apply(null, a_oProtected), { d: a_oBaseClassHierarchy });
                            }
                            //# 
                            else {
                                throw "ish.oop.inherit: `a_oBaseClassHierarchy` must be an array and `vTarget` must be an object or function."
                            }
                        }, { //# core.oop.inherit
                            //#
                            is: function (vTarget) {
                                return core.type.arr.is(derivedFrom(vTarget), true);
                            }, //# core.oop.inherit.is

                            //#
                            instanceOf: function (vTarget, vTest) {
                                return (derivedFrom(vTarget).indexOf(vTest) > -1);
                            }, //# core.oop.inherit.instanceOf

                            //# lineage?
                            derivedFrom: derivedFrom
                        }
                    );
                }() //# oop.inherit
            };

        }); //# core.oop.inherit
    } //# init


    //# If we are running server-side
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
}();
