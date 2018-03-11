/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';


    /*
    ####################################################################################################
    Class: core.type.inherit
    Multiple Inheirtance-based functionality (Polymorphism).
    Requires:
    <core.extend>, 
    <core.type.obj.is>, <core.type.arr.is>, 
    <core.type.arr.mk>, 
    <core.type.fn.call>
    ####################################################################################################
    */
    core.oop.partial(core.oop, function (/*oProtected*/) {
        var _this = this,
            oOopData = _this.oopData
        ;

        //# add(the)OopDataType d(erivedFrom), defaulting to []
        //#     NOTE: Setting up a .watch for the .event isn't necessary as the added data type will be defaulted to [] automajicially
        _this.addOopDataType("d", []);
        //core.io.event.watch("ish.oop._setOopEntry", function (/*sEventName, vTarget, oProtected*/) {
        //    oOopData.d.push([]);
        //});

        
        return {
            /*
            Implementation of multiple inheirtance for Javascript
            */
            inherit: function () {
                //# Safely returns the d(erivedFrom) array stored in oopData for the vTarget
                function derivedFrom(vTarget) {
                    return oOopData.d[
                        oOopData.i.indexOf(vTarget)
                    ] || [];
                } //# derivedFrom


                return core.extend(
                    function (a_oBaseClassHierarchy, vTarget) {
                        var oProtected, i,
                            a_oProtected = [{}] //# Pre-populate a_oProtected with a blank object to recieve vTarget's oProtected interfaces
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
                            _this.setOopEntry(vTarget, core.extend.apply(_null, a_oProtected), { d: a_oBaseClassHierarchy });
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

}(document.getElementsByTagName("HTML")[0].ish);
