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
        clipboard: function ($element, vValue) {
            var _element = $element[0],
                oClipboard = new Clipboard(_element, {
                    text: function (/*_element*/) {
                        $element.removeClass('fa-clipboard');
                        $element.addClass('fa-check');
    
                        setTimeout(function() {
                            $element.removeClass('fa-check');
                            $element.addClass('fa-clipboard');
                            //_element.clipboard.destroy();
                        }, 1000);
    
                        return (core.is.fn(vValue) ? vValue($element) : vValue);
                    }
                })
            ;
    
            _element.clipboard = oClipboard;
    
            oClipboard.on('success', function (e) {
                console.log(e);
                //e.stopPropagation();
            });
    
            oClipboard.on('error', function (e) {
                console.log(e);
                //e.stopPropagation();
            });
        }, //# core.lib.ui.clipboard

        //# 
        dialog: function (sTemplate, oOptions) {
            //# 
            oOptions = core.mk.obj(oOptions);

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

        } //# core.lib.ui.component

    }); //# core.lib.ui

    //# 
    init();
}(window.$z);
