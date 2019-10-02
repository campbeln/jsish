/** ################################################################################################
 * Browser-based Base Libraries mixin for ishJS
 * @mixin ish.lib
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
################################################################################################# */
!function(core) {
    "use strict"

    function init() {
        //core.ui.dom.include.scripts("/js/clipboard.min.js");

        //#
        /*core.ui.dom.include(
            core.ui.dom.templateLiteral(function () {/ *
                <div id="static-modal" class="modal fade" tabindex="-1" role="dialog">
                    <div class="modal-dialog">
                        <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                            <h4 class="modal-title">Modal title</h4>
                        </div>
                        <div class="modal-body">
                            <p>One fine body…</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
                        </div>
                        </div><!-- /.modal-content -->
                    </div><!-- /.modal-dialog -->
                </div><!-- /.modal -->
            * /}), {

            }
        );*/
    }



    /** ################################################################################################
     * @namespace core.lib
     * @desc Stub-object for External Library-based functionality.
     * @requires core.extend
     * @requires core.type.fn.is
    ################################################################################################# */
    core.oop.partial(core.lib.ui, function (/*oProtected*/) {
        var fnSyncer, fnBinder;

        function doRegister(fn, bIsSync) {
            var bReturnVal = core.type.fn.is(fn);

            //#
            if (bReturnVal) {
                if (bIsSync) {
                    fnSyncer = fn;
                }
                else {
                    fnBinder = fn;
                }
            }

            return bReturnVal;
        } //# doRegister

        return {
            sync: core.extend(
                function (fnCallback, oOptions) {
                    //#
                    function fnSyncerWrapped() {
                        var bValidRequest = core.type.fn.is(fnCallback) && core.type.fn.is(fnSyncer),
                            vResult = (bValidRequest ? core.type.fn.call(fnSyncer, _null, [fnCallback]) : _null)
                        ;

                        //# If this is a bValidRequest and the caller wants the vResult do it, else return the value of bValidRequest to indicate the success/failure of the fnSyncer .call above
                        return (bValidRequest && oOptions.asResult ? vResult : bValidRequest);
                    } //# fnSyncerWrapped


                    //# Ensure the passed oOptions is an .obj
                    oOptions = core.type.obj.mk(oOptions);

                    //# If no arguments were sent, return the validity of fnSyncer, else return fnSyncerWrapped or its result as per .asFn
                    return (arguments.length === 0 ?
                        core.type.fn.is(fnSyncer) :
                        (oOptions.asFn ? fnSyncerWrapped : fnSyncerWrapped())
                    );
                }, {
                    register: function (fn) {
                        return doRegister(fn, true);
                    }
                }
            ), //# core.lib.ui.sync

            bind: core.extend(
                function (vDom, oContext) {
                    return (arguments.length === 0 ?
                        core.type.fn.is(fnBinder) :
                        core.type.fn.call(fnBinder, _null, [vDom, oContext])
                    );
                }, {
                    register: function (fn) {
                        return doRegister(fn /*, false*/);
                    }
                }
            ), //# core.lib.ui.bind


            //#
            dialog: function (sTemplate, oOptions) {
                //#
                oOptions = core.type.obj.mk(oOptions);

                //#
                return core.lib.ng.ngDialog.open({
                    template: sTemplate,
                    plain: !oOptions.isSelector,
                    data: oOptions.data,
                    className: oOptions.class || "ngdialog-theme-flat ngdialog-theme-custom"
                });

                //#
                /*return new Modal(

                );*/
            }, //# core.lib.ui.dialog

            //#
            component: {
                register: function (eCategory, sName) {
                    var _component = document.querySelector("[component='true'][name='" + eCategory + "/" + sName + "']"),
                        oBucket = _component.component.bucket,
                        oData = core.resolve(core.app.data.includes, [eCategory]),
                        a_oOrdered = oData.$ordered || []
                    ;

                    a_oOrdered.push(oBucket);
                    oData.$ordered = a_oOrdered;
                } //# component.register

            }, //# core.lib.ui.component


            //#     FROM: https://stackoverflow.com/a/37421357
            inputMask: function () {
                // Apply filter to all inputs with data-filter:
                var input, state,
                    inputs = document.querySelectorAll('input[mask]')
                ;

                for (input of inputs) {
                    state = {
                        value: input.value,
                        start: input.selectionStart,
                        end: input.selectionEnd,
                        pattern: RegExp('^' + input.dataset.filter + '$')
                    };

                    input.addEventListener('input', function (/*event*/) {
                        if (state.pattern.test(input.value)) {
                            state.value = input.value;
                        }
                        else {
                            input.value = state.value;
                            input.setSelectionRange(state.start, state.end);
                        }
                    });

                    input.addEventListener('keydown', function (/*event*/) {
                        state.start = input.selectionStart;
                        state.end = input.selectionEnd;
                    });
                }
            }
        };
    });

    //#
    init();
}(window.$z);
