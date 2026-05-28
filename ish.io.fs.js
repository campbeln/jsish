//################################################################################################
/** @file Browser-based File System mixin for ish.js
 * @mixin ish.io.fs
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2024, Nick Campbell
 */ //############################################################################################
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
//<MIXIN>
(function (core, _document, _window) {
    'use strict';


    //################################################################################################
    /** Collection of Filesystem-based functionality.
     * @namespace ish.io.fs
     * @ignore
     */ //############################################################################################
    core.oop.partial(core.io, {
        fs: {
            //#########
            /** Saves the passed value by downloading it onto the client system as a string.
             * @function ish.io.fs.save
             * @$clientsideonly
             * @note Was <code>ish.ui.downloadToFile</code>.
             * @param {string|object} vData Value representing the data to download as a string.
             * @param {object} [oOptions] Value representing the desired options:
             *      @param {string} [oOptions.filename='downloaded.txt'] Value representing the default filename of the downloaded file.
             *      @param {string} [oOptions.mimeType='text/plain'] Value representing the MIME Type of the downloaded file.
             *      @param {string} [oOptions.charset='utf-u'] Value representing the character set represented within the passed value.
             *      @param {boolean} [oOptions.pretty=false] Value representing if JSON-based data is to be saved with inserted whitespace.
             */ //#####
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
                //#
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


            //#########
            /** Loads the referenced file from the client system.
             * @function ish.io.fs.load
             * @$clientsideonly
             * @note Was <code>ish.io.fs.upload</code>.
             * @param {variant|string} vFileInput Value representing the file input DOM-based object, as resolvable by <code>ish.type.dom.mk</code>.
             * @param {object} [oOptions] Value representing the desired options:
             *      @param {function} [oOptions.callback=undefined] Value representing the function to be called on completion; <code>oOptions.callback(eventTargetResult, iIndex, oFile, oOptions)</code>.
             *      @param {integer} [oOptions.byteStart=0] Value representing the byte to start reading from the file to upload.
             *      @param {string} [oOptions.byteEnd=0] Value representing the byte to end reading from the file to upload, with <code>0</code> representing all of the file.
             */ //#####
            load: function (vFileInput, oOptions) {
                var i,
                    _fileInput = core.type.dom.mk(vFileInput, null),
                    iLen = core.resolve(_fileInput, "files.length"),
                    bReturnVal = (core.type.dom.is(_fileInput) && iLen)
                ;

                //#
                function processFile(oFile, iIndex) {
                    var oBlob,
                        _reader = new _window.FileReader()
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
            } //# io.fs.load
        }
    }); //# core.io.fs

    //# .fire the plugin's loaded event
    core.io.event.fire("ish.io.fs");

    //# Return core to allow for chaining
    return core;

}(window.head.ish || document.querySelector("SCRIPT[ish]").ish, document, window)); //# Web-only
//</MIXIN>