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
    Class: core.io.fs
    Filesystem-based functionality.
    Requires:
    <core.type.obj.is>, 
    <core.type.obj.mk>, <core.type.str.mk>
    ####################################################################################################
    */
    core.oop.partial(core.io, {
        fs: {
            save: function (vData, oOptions) {
                var sData,
                    _a = document.createElement('a'),
                    _body = document.body
                ;

                core.io.fs.save.$last = arguments;

                //#
                oOptions = core.type.obj.mk(oOptions);

                //#
                if (core.type.obj.is(vData)) {
                    sData = JSON.stringify(vData, null, (oOptions.pretty ? "\t" : ""));
                }
                else {
                    sData = core.type.str.mk(vData);
                }

                //#
                _body.appendChild(_a);
                _a.setAttribute("style", "display:none;");
                _a.setAttribute('href',
                    'data:' + (oOptions.mimeType || 'text/plain') + ';charset=' + (oOptions.charset || 'utf-u') + ',' + encodeURIComponent(sData)
                );
                _a.setAttribute('download', oOptions.filename || "downloaded.txt");
                _a.innerHTML = "download link";
                _a.click();
                _a.remove();
            }
        }
    }); //# core.io.fs

}(document.querySelector("SCRIPT[ish]").ish);
