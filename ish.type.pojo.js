/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core, fnLocalEvaler) {
    /*
    ####################################################################################################
	Class: core.type.pojo
    Additional Variable Type-based functionality (type.*.cp, type.*.cmp, type.*.eq, type.*.rm, etc) plus uuid, enum and query.
    Requires:
    <core.resolve>, <core.extend>,
    <core.type.fn.is>, <core.type.arr.is>, <core.type.obj.is>, <core.type.str.is>, <core.type.date.is>, <core.type.num.is>,
    <core.type.str.mk>, <core.type.int.mk>, <core.type.date.mk>, <core.type.float.mk>,
    <core.type.fn.call>,
    ~<core.io.net.get>
    ####################################################################################################
    */
   core.oop.partial(core.type, function (/*oProtected*/) {
        return {
            pojo: {
                /*
                Function: is
                Determines if the passed value is a string representing a Plain Old Javascript Object (POJO).
                Parameters:
                sPojo - The string to interrogate.
                oOptions - Object representing the desired options:
                    oOptions.context - Object who's keys represent the variables to expose to the `eval`uated string.
                    oOptions.check - Boolean value representing if the passed sPojo is to be verified via `type.pojo.check`.
                    oOptions.reject - Variant; Boolean value representing if functions are to be rejected, or Array of strings representing the values that cause a POJO string to be rejected. Default: `["eval", "Function", ".prototype.", ".constructor", "function", "=>"]`.
                Returns:
                Boolean value representing if the value is a string representing a Plain Old Javascript Object (POJO).
                */
                is: function (sPojo, oOptions) {
                    var oResult = core.type.pojo.mk(sPojo, null, oOptions);
                    return core.type.obj.is(oResult, true);
                }, //# type.pojo.is

                /*
                Function: mk
                Determines if the passed value is a string representing a Plain Old Javascript Object (POJO).
                Parameters:
                sPojo - The string to interrogate.
                vDefault - The default value to return if casting fails.
                oOptions - Object representing the desired options:
                    oOptions.context - Object who's keys represent the variables to expose to the `eval`uated string.
                    oOptions.check - Boolean value representing if the passed sPojo is to be verified via `type.pojo.check`.
                    oOptions.reject - Variant; Boolean value representing if functions are to be rejected, or Array of strings representing the values that cause a POJO string to be rejected. Default: `["eval", "Function", ".prototype.", ".constructor", "function", "=>"]`.
                Returns:
                Object representing the `eval`uated Plain Old Javascript Object (POJO).
                */
                mk: function (sPojo, vDefault, oOptions) {
                    var oReturnVal = (arguments.length > 1 ? vDefault : {}),
                        oArguments = {
                            //r: null,
                            //e: null,
                            js: sPojo
                        }
                    ;

                    //#
                    oOptions = core.type.obj.mk(oOptions);

                    //# If we (seem) to be eval'ing a valid sPojo run it in our fnLocalEvaler, collecting the .r(esult) into our oReturnVal
                    if (core.type.pojo.check(sPojo, (oOptions.check ? oOptions.reject : []))) {
                        fnLocalEvaler(oArguments, core.type.obj.is(oOptions.context, true) ?
                            { o: oOptions.context, k: core.type.obj.ownKeys(oOptions.context), c: '' } :
                            null
                        );
                        oReturnVal = oArguments.r || oReturnVal;
                    }

                    return oReturnVal;
                }, //# type.pojo.mk

                /*
                Function: check
                Determines if the passed value is a safe string representing a Plain Old Javascript Object (POJO).
                Parameters:
                sPojo - The string to interrogate.
                vReject - Variant; Boolean value representing if functions are to be rejected, or Array of strings representing the values that cause a POJO string to be rejected. Default: `["eval", "Function", ".prototype.", ".constructor", "function", "=>"]`.
                Note:
                This function represents a "better than nothing" approach to checking the relative safety of the passed sPojo string, however, sPojo strings should only be loaded from trusted sources.
                Returns:
                Boolean value representing if the value is a string representing a safe Plain Old Javascript Object (POJO).
                */
                check: function (sPojo, vReject) {
                    var i,
                        bReturnVal = core.type.arr.is(vReject),
                        a_sReject = (bReturnVal ? vReject : [
                            "eval", "Function",
                            ".prototype.", ".constructor"
                        ])
                    ;

                    //# If the borrowed bReturnVal is indicating that vReject isn't an .arr and vReject also isn't false, then ensure that functions are a_sReject'd as well
                    if (!bReturnVal && vReject !== false) {
                        a_sReject = a_sReject.concat(["function", "=>"]);
                    }

                    //# .trim the passed sPojo then reset our bReturnVal based on its value
                    sPojo = core.type.str.mk(sPojo).trim();
                    bReturnVal = (sPojo && sPojo[0] === "{" && sPojo[sPojo.length - 1] === "}");

                    //# If sPojo seems valid thus far, traverse the a_sReject array, flipping our bReturnVal and falling from the loop if we find any a_sReject's
                    if (bReturnVal) {
                        for (i = 0; i < a_sReject.length; i++) {
                            if (sPojo.indexOf(a_sReject[i]) > -1) {
                                bReturnVal = false;
                                break;
                            }
                        }
                    }

                    return bReturnVal;
                } //# type.pojo.check
            }
        };
    }); //# core.type.pojo
}(
    document.querySelector("SCRIPT[ish]").ish,

    //#
    //#     NOTE: The fnLocalEvaler is placed here to limit its scope and local variables as narrowly as possible (hence the use of `arguments[0]`)
    function /*fnLocalEvaler*/(/* oData, oInjectData */) {
        //# If oInjectData was passed, traverse the injection .o(bject) .shift'ing off a .k(ey) at a time as we set each as a local var
        if (arguments[1]) {
            while (arguments[1].k.length > 0) {
                arguments[1].c = arguments[1].k.shift();
                eval("var " + arguments[1].c + "=arguments[1].o[arguments[1].c];");
            }
        }

        try {
            eval("arguments[0].r=" + arguments[0].js);
        } catch (e) {
            //# An error occured fnEval'ing the current index, so set .r(esult) to null and log the .e(rror)
            arguments[0].r = null;
            arguments[0].e = e;
        }

        //# Return the modified arguments[0] to the caller
        //#     NOTE: As this is modified byref there is no need to actually return arguments[0]
        //return arguments[0];
    } //# fnLocalEvaler
);
//$z.type.pojo.mk('{ neek: false, camp: core.type.str.is("yep") }', null, { context: { core: $z }, check: true })
