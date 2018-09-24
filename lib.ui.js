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

    //#
    core.extend(core.resolve(true, core.lib, "ui"), {
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
    }); //# core.lib.ui

    //#
    init();
}(window.$z);
