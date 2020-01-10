//################################################################################################
/** @file Browser-based Tooltip mixin for ish.js
 * @mixin ish.ui.tooltip
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 * @ignore
 */ //############################################################################################
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function (core) {
    "use strict";

    /*
    ####################################################################################################
    Class: core.ui.tooltip
    Tooltip-based functionality.
    Requires:
    <core.extend>
    ####################################################################################################
    */
    core.oop.partial(core.ui, function (/*oProtected*/) {
        var iTimeout,
            _window = window,
            _body = document.body,
            _tooltip = core.type.dom.mk("<div ngTooltip class='ng-tooltip'></div>"),
            fnHide = function (/*oEvent*/) {
                iTimeout = setTimeout(function () {
                    _tooltip.style.display = "none";
                }, 500);
            },
            fnProcessOptions = function (vOptions) {
                var oOptions = core.extend({},
                    core.resolve(core, "app.options.tooltip"),
                    (core.type.obj.is(vOptions) ? vOptions : { text: vOptions })
                );
                //oOptions.bindUI = core.type.fn.mk(oOptions.bindUI, function (_template) { return _template; });

                return oOptions;
            },
            fnMouseoverFactory = function (oOptions, oContext) {
                return function (oEvent) {
                    var _template,
                        oPos = _tooltip.getBoundingClientRect(),
                        oOffset = {
                            top: oPos.top + _body.scrollTop,
                            left: oPos.left + _body.scrollLeft
                        }
                    ;

                    //#
                    if (core.type.str.is(oOptions.text, true) || core.type.str.is(oOptions.template, true) || core.type.str.is(oOptions.templateUrl, true)) {
                        //#
                        clearTimeout(iTimeout);

                        //#
                        oOptions.position = core.type.str.mk(oOptions.position, "").trim().toLowerCase();

                        if (core.type.str.is(oOptions.templateUrl, true)) {
                            _template = core.type.dom.mk("<div>" + core.type.dom.mk("script[id='" + oOptions.templateUrl + "']").innerHTML + "</div>");

                            _tooltip.innerHTML = "";
                            //_tooltip.appendChild(core.type.fn.call(oOptions.bindUI, [_template]) || _template);
                            core.lib.ui.bind(_template, oContext);
                            _tooltip.appendChild(_template);
                            _tooltip.appendChild(core.type.dom.mk("<div class='ng-tooltip-arrow'></div>"));
                        }
                        else if (core.type.str.is(oOptions.template, true)) {
                            _template = core.type.dom.mk("<div>" + oOptions.template + "</div>");

                            _tooltip.innerHTML = "";
                            //_tooltip.appendChild(core.type.fn.call(oOptions.bindUI, [_template]) || _template);
                            core.lib.ui.bind(_template, oContext);
                            _tooltip.appendChild(_template);
                            _tooltip.appendChild(core.type.dom.mk("<div class='ng-tooltip-arrow'></div>"));
                        }
                        else if (core.type.fn.is(oOptions.text)) {
                            _tooltip.innerHTML = "";
                            _tooltip.appendChild(core.type.dom.mk(oOptions.argument));
                            _tooltip.appendChild(core.type.dom.mk("<div class='ng-tooltip-arrow'></div>"));
                        }
                        else {
                            _tooltip.innerHTML = oOptions.text + "<div class='ng-tooltip-arrow'></div>";
                        }

                        oPos = oEvent.target.getBoundingClientRect();
                        oPos = {
                            pos: oPos,
                            height: oPos.height || oPos.bottom - oPos.top,
                            width: oPos.width || oPos.right - oPos.left,
                            offset: core.type.int.mk(oOptions.offset, 10)
                        };
                        oPos._height = oPos.pos.height || oPos.pos.bottom - oPos.pos.top;
                        oPos._width = oPos.pos.width || oPos.pos.right - oPos.pos.left;

                        //#
                        switch (oOptions.position) {
                            case "left": {
                                oOffset.top = oPos.pos.top - (oPos.height / 2) + (oPos._height / 2);
                                oOffset.left = oPos.pos.left - oPos.width - oPos.offset;
                                break;
                            }
                            case "right": {
                                oOffset.top = oPos.pos.top - (oPos.height / 2) + (oPos._height / 2);
                                oOffset.left = oPos.pos.right + oPos.offset;
                                break;
                            }
                            case "top": {
                                oOffset.top = oPos.pos.top - oPos.height - oPos.offset;
                                oOffset.left = oPos.pos.left - (oPos.width / 2) + (oPos._width / 2);
                                break;
                            }
                            //case "bottom":
                            default: {
                                oOptions.position = "down";
                                oOffset.top = oPos.pos.top + oPos._height + oPos.offset;
                                oOffset.left = oPos.pos.left - (oPos.width / 2) + (oPos._width / 2);
                                break;
                            }
                        }
                        oOffset.top += _window.scrollY;
                        oOffset.left += _window.scrollX;

                        if (oOffset.top < 0) {
                            oOffset.top = 0;
                        }
                        if (oOffset.left < 0) {
                            oOffset.left = 0;
                        }

                        //#
                        _tooltip.style.display = "block";
                        _tooltip.setAttribute('class', "ng-tooltip ng-tooltip-" + oOptions.position);
                        //_tooltip.setAttribute('style', 'max-width: ' + core.type.int.mk(oOptions.maxWidth, 250) + 'px;');
                        //_tooltip.addClass("ng-tooltip ng-tooltip-" + oOptions.position);
                        _tooltip.style.top = oOffset.top + "px";
                        _tooltip.style.left = oOffset.left + "px";
                    }
                };
            }
        ;

        //#
        _tooltip.addEventListener("mouseout", fnHide);
        _tooltip.addEventListener("mouseover", function (/*event*/) {
            clearTimeout(iTimeout);
        });
        _body.appendChild(_tooltip);


        return {
            tooltip: function (_element, oContext, vOptions) {
                var oOptions = fnProcessOptions(vOptions);

                //#
                _element.addEventListener("mouseout", fnHide);
                _element.addEventListener(oOptions.on || 'mousemove', fnMouseoverFactory(oOptions, oContext));
                if (core.type.str.is(oOptions.hideon, true)) {
                    _tooltip.addEventListener(oOptions.hideon, fnHide);
                }
            }
        };
    }); //# core.ui.tooltip

    //# .fire the plugin's loaded event
    core.io.event.fire("ish.ui.tooltip");

}(document.querySelector("SCRIPT[ish]").ish)); //# Web-only
