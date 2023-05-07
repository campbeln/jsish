//################################################################################################
/** @file OOP Inheritance mixin for ish.js
 * @mixin ish.oop.inherit
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2023, Nick Campbell
 */ //############################################################################################
/*global module, define */                                      //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict'; //<MIXIN>

    function init(core) {
        //################################################################################################
        /** Collection of Multiple Inheritance-based functionality.
         * @namespace ish.oop.inherit
         * @ignore
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
                inherit: function () {
                    //# Safely returns the d(erivedFrom) array stored in oopData for the vTarget
                    function derivedFrom(vTarget) {
                        return oOopData.d[
                            oOopData.i.indexOf(vTarget)
                        ] || [];
                    } //# derivedFrom


                    return core.extend(
                        //#########
                        /** Inherits the passed hierarchy into the passed value.
                         * @function ish.oop.inherit.!
                         * @param {object[]} a_oHierarchy Value representing the following options: TODO
                         * @param {object|function} vTarget Value representing the object to inherit into.
                         */ //#####
                        function (a_oHierarchy, vTarget) {
                            var oProtected, i,
                                a_oProtected = [{}] //# Pre-populate a_oProtected with a blank object to receive vTarget's oProtected interfaces
                            ;

                            //# If the passed a_oHierarchy .is an .arr and vTarget is a valid .extend target
                            if (core.type.arr.is(a_oHierarchy) && core.type.obj.is(vTarget, { allowFn: true })) {
                                //# Traverse the a_oHierarchy, .push'ing each .p(rotected) reference (if any) into a_oProtected
                                //#      NOTE: We traverse the a_oHierarchy in reverse because .extend works as right-most wins, while a_oHierarchy is left-most wins
                                for (i = a_oHierarchy.length - 1; i > -1; i--) {
                                    oProtected = oOopData.p[oOopData.i.indexOf(a_oHierarchy[i])];
                                    if (core.type.obj.is(oProtected, { nonEmpty: true })) {
                                        a_oProtected.push(oProtected);
                                    }
                                }

                                //#
                                _this.setOopEntry(vTarget, core.extend.apply(null, a_oProtected), { d: a_oHierarchy });
                            }
                            //#
                            else {
                                throw "ish.oop.inherit: `a_oHierarchy` must be an array and `vTarget` must be an object or function.";
                            }
                        }, { //# core.oop.inherit
                            //#########
                            /** Determines if the passed value has been the subject of multiple inheritance.
                             * @function ish.oop.inherit.is
                             * @param {object|function} vTarget Value representing the object to test.
                             * @returns {boolean} Value representing if the passed value has been the subject of multiple inheritance.
                             */ //#####
                            is: function (vTarget) {
                                return core.type.arr.is(derivedFrom(vTarget), true);
                            }, //# core.oop.inherit.is


                            //#########
                            /** Determines if the passed value is an instance of the passed reference value.
                             * @function ish.oop.inherit.instanceOf
                             * @param {object|function} vTarget Value representing the object to test.
                             * @param {object|function} vReference Value representing the reference object.
                             * @returns {boolean} Value representing if the passed value is an instance of the passed reference value.
                             */ //#####
                            instanceOf: function (vTarget, vReference) {
                                return (derivedFrom(vTarget).indexOf(vReference) > -1);
                            }, //# core.oop.inherit.instanceOf


                            //#########
                            /** Determines the base values of the passed reference value.
                             * @function ish.oop.inherit.derivedFrom
                             * @param {object|function} vReference Value representing the reference value.
                             * @returns {boolean} Value representing the base values of the passed reference value.
                             */ //#####
                            derivedFrom: function (vReference) {
                                return derivedFrom(vReference).slice(0); //# core.type.arr.clone(derivedFrom(vReference));
                            }
                        }
                    );
                }() //# oop.inherit
            };
        }); //# core.oop.inherit

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.oop.inherit");

        //# Return core to allow for chaining
        return core;
    } //# init


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
        return init(document.querySelector("SCRIPT[ish]").ish);
    }

    //</MIXIN>
}());
