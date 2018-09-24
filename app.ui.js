!function (core, angular) {
    'use strict'

    //#
    //core.extend(true, core.app.ui, {
    core.extend(core.app, {
        ui: {
            process: core.lib.ng.$compile,


            //#
            bucket: function () { //# Create a scope for common variables/functions
                var oReturnVal,
                    oData = {}
                ;

                //#
                function raiseError(sFunction, sMessage) {
                    throw ".app.ui.bucket." + sFunction + ": " + sMessage;
                } //# raiseError


                //#
                function getBucketBuilder(sName, eCategory) {
                    return core.resolve(oData, [eCategory, sName]);
                } //# getBucketBuilder


                //# document.currentScript psuedo-polyfill based on https://stackoverflow.com/a/22745553/235704
                function resolveScript(_script) {
                    var a__scripts;

                    if (!core.type.dom.is(_script)) {
                        a__scripts = document.getElementsByTagName( 'script' );
                        _script = a__scripts[a__scripts.length];
                    }

                    return _script;
                } //# resolveName


                //#
                function doRetry(oData, oBucket, bFromError) {
                    var oReturnVal,
                        iRetryMS = core.type.fn.call(oBucket.retry, this, [oData, oBucket, bFromError])
                    ;

                    if (core.type.num.is(iRetryMS) && iRetryMS > 0) {
                        //oReturnVal = core.lib.ui.sync(oBucket.refresh, iRetryMS);
                        oReturnVal = core.lib.ng.$timeout(oBucket.refresh, iRetryMS);
                    }

                    return oReturnVal;
                } //# retry


                //#
                function register(_documentCurrentScript, fnUrlBuilder, oOptions) {
                    var oReturnVal, oCategory, _component, sName, eCategory;

                    //#
                    _documentCurrentScript = resolveScript(_documentCurrentScript);
                    _component = _documentCurrentScript.parentElement;
                    sName = _component.getAttribute("id");
                    eCategory = (sName.indexOf("/") > -1 ? sName.split("/")[0] : "none");
                    oReturnVal = !core.type.fn.is(getBucketBuilder(sName, eCategory));

                    //# If we have a new eCategory/sName pair to .register
                    if (oReturnVal) {
                        //# .resolve the oCategory (optionally creating it as we go)
                        oCategory = core.resolve(true, oData, eCategory);

                        //# Create the getBucketBuilder function for this sName
                        oCategory[sName] = function (oInstanceOptions) {
                            var iTimer,
                                oBucket = core.extend(
                                    {
                                        $start: function () {
                                            core.extend(oBucket, {
                                                success: undefined,
                                                loading: true,
                                                retrying: false,
                                                requestMS: 0,
                                                records: []
                                            });
                                            iTimer = Date.now();
                                        }, //# $start

                                        $end: function (bSuccess, bRetry, a_vRecords) {
                                            core.extend(oBucket, {
                                                success: core.type.bool.mk(bSuccess),
                                                loading: false,
                                                retrying: core.type.bool.mk(bRetry),
                                                requestMS: (Date.now() - iTimer),
                                                records: core.type.arr.mk(a_vRecords)
                                            });
                                        }, //# $end

                                        template: function (sType) {
                                            return core.resolve(oBucket, ["element", "component", "templates", core.type.str.mk(sType, "default")]);
                                        },

                                        $document: document,

                                        name: sName,
                                        category: eCategory,
                                        //title: "",
                                        //id: "",
                                        //element: null,
                                        fnUrlBuilder: fnUrlBuilder,
                                        component: _component, //# TODO: Rename

                                        records: "data.hits.hits",
                                        show: true,
                                        model: null,
                                        results: [],
                                        error: null,
                                        clone: false,

                                        success: undefined,
                                        loading: false,
                                        retrying: false,
                                        requestMS: 0
                                    },
                                    oOptions, oInstanceOptions
                                )
                            ;

                            return oBucket;
                        };
                    }

                    return oReturnVal;
                } //# register


                //#
                function deregister(sName, eCategory) {
                    var bReturnVal = core.type.fn.is(getBucketBuilder(sName, eCategory));

                    if (bReturnVal) {
                        delete oData[eCategory][sName];
                    }

                    return bReturnVal;
                } //# deregister


                //#
                oReturnVal = core.extend(register, {
                    register: register,
                    deregister: deregister,
                    //data: oData, //# TODO: core.extend is not copying the reference

                    categories: function () {
                        return Object.keys(oData);
                    }, //# categories

                    showAll: function (eCategory, bHide) {
                        core.event(eCategory + "_showAll", [(bHide !== true)])
                    }, //# category

                    exists: function (sName, eCategory) {
                        return core.type.fn.is(getBucketBuilder(sName, eCategory));
                    },

                    //#
                    render: function (sName, eCategory, oOptions) {
                        var _element,
                            oBucket = core.type.fn.call(getBucketBuilder(sName, eCategory), this, oOptions),
                            _wrapper = document.createElement("div"),
                            oRequests = {}
                        ;

                        //#
                        oBucket.cancel = function () {
                            //#
                            core.type.fn.call(core.resolve(oRequests.get, "cancel"));
                            //core.lib.ui.sync.cancel(oRequests.retry); //# TODO: check!?!
                            core.lib.ng.$timeout.cancel(oRequests.retry); //# TODO: check!?!
                            core.lib.ng.$timeout.cancel(oRequests.get); //# TODO: check!?!
                        };

                        //#
                        oBucket.refresh = function (bOnlyIfShowing) {
                            var sUrl;

                            //#
                            if (bOnlyIfShowing !== true || oBucket.show) {
                                //#
                                oBucket.cancel();
                                sUrl = oBucket.fnUrlBuilder(oBucket.config || _element.component || core.app.data, oBucket);

                                //#
                                if (core.type.str.is(sUrl, true)) {
                                    oBucket.$start();

                                    //#
                                    oRequests.get = core.app.get(sUrl).then(/* bError, data, vArg, $xhr */
                                        function (data) {
                                            oBucket.model = data;
                                            oBucket.error = null;
                                            oBucket.results = (core.type.fn.is(oBucket.resolve) ? oBucket.resolve(data, oBucket) : core.resolve(data, core.type.str.mk(oBucket.resolve)));
                                            //oBucket.show = core.type.arr.is(oBucket.records, true);
                                            oRequests.retry = doRetry(data, oBucket, false);
                                            oBucket.$end(true, oRequests.retry, oBucket.records);
                                        },
                                        function (data) {
                                            console.log("ERROR! ", sUrl, data);
                                            oBucket.model = null;
                                            oBucket.error = data;
                                            oBucket.results = [];
                                            //oBucket.show = false;
                                            oRequests.retry = doRetry(data, oBucket, true);
                                            oBucket.$end(false, oRequests.retry);
                                        },
                                        function () {
                                            core.lib.ui.sync(function () {
                                                _element.component.context.bucket = oBucket;
                                                _element.component.context.$apply();
                                            });
                                        }
                                    );
                                }
                            }
                        } //# oBucket.refresh

                        //#
                        if (oBucket.clone !== true) {
                            core.io.event.watch(eCategory, oBucket.refresh);
                            core.io.event.watch(eCategory + "_showAll", function (bShow) {
                                oBucket.show = (bShow === true);
                            });
                        }

                        //#
                        _wrapper.innerHTML = "<div name='" + sName + "' mode='" + eCategory + "' component='true'>" +
                            oBucket.$document.querySelector("COMPONENT[name='" + sName + "'] > UI").innerHTML +
                        "</div>";
                        _element = _wrapper.children[0];
                        oBucket.element = _element;
                        $z.resolve(true, _element, "component.bucket", oBucket);

                        //#
                        core.type.fn.call(oBucket.onRender, this, [oBucket]);
                        return oBucket;
                    } //# render
                });
                oReturnVal.data = oData;
                return oReturnVal;

            }() //# bucket
        }
    });
}(window.$z); //# core.app.ui
