/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function (core) {
    'use strict';

    var _document = document;                                                       //# code-golf


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
                    _a = _document.createElement('a'),
                    _body = _document.body
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
            }, //# io.fs.save


            //#
            upload: function (_fileInput, oOptions) {
                var i,
                    iLen = core.resolve(_fileInput, "files.length"),
                    bReturnVal = (core.type.dom.is(_fileInput) && iLen)
                ;

                //#
                function processFile(oFile, iIndex) {
                    var oBlob,
                        _reader = new FileReader()
                    ;

                    //# Setup _reader's .onloadend event, .call'ing our .callback when it's FileReader.DONE (== 2)
                    _reader.onloadend = function (_event) {
                        if (_event.target.readyState === 2) {
                            core.type.fn.call(oOptions.callback, null, [_event.target.result, iIndex, oFile, oOptions]);
                        }
                    };

                    //# Kick off the upload by .slice'ing the oFile into our oBlob then .readAsText
                    oBlob = oFile.slice(
                        oOptions.byteStart,
                        (oOptions.byteEnd > 0 ? oOptions.byteEnd : oFile.size)
                    );
                    _reader.readAsText(oBlob);
                } //# processFile


                //# Ensure the passed oOptions are an .obj and that it's .byteStart and .byteEnd are .mk.int's
                oOptions = core.type.obj.mk(oOptions);
                oOptions.byteStart = core.type.int.mk(oOptions.byteStart);
                oOptions.byteEnd = core.type.int.mk(oOptions.byteEnd);

                //# If the caller passed in a valid _fileInput, traverse and .process(its)File's
                if (bReturnVal) {
                    for (i = 0; i < iLen; i++) {
                        processFile(_fileInput.files[i], i);
                    }
                }

                return bReturnVal;
            } //# io.fs.download
        }
    }); //# core.io.fs

}(document.querySelector("SCRIPT[ish]").ish); //# Web-only
