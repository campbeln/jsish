/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function () {
    'use strict';

    function init(core) {
        /*
        ####################################################################################################
        Class: core.data.csv
        CSV logic.
        Requires:
        <core.extend>, <core.resolve>,
        <core.type.true.is>, <core.type.arr.is>, <core.type.obj.is>,
        <core.type.str.mk>,
        *<core.type.obj.ownKeys>, *<core.type.arr.rm>, *<core.type.obj.has>
        ####################################################################################################
        */
        core.oop.partial(core.io, {
            csv: { // core.extend(core.resolve(true, core.data, "csv"), {
                //#
                //#     From: https://stackoverflow.com/a/14991797/235704
                parse: function (str, sDelimiter) {
                    var row, col, c, cc, nc,
                        arr = [],
                        quote = false  // true means we're inside a quoted field
                    ;

                    sDelimiter = sDelimiter || ",";

                    // iterate over each character, keep track of current row and column (of the returned array)
                    for (row = col = c = 0; c < str.length; c++) {
                        cc = str[c];                           // current character
                        nc = str[c+1];                         // next character
                        arr[row] = arr[row] || [];             // create a new row if necessary
                        arr[row][col] = arr[row][col] || '';   // create a new column (start with empty string) if necessary

                        // If the current character is a quotation mark, and we're inside a
                        // quoted field, and the next character is also a quotation mark,
                        // add a quotation mark to the current column and skip the next character
                        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

                        // If it's just one quotation mark, begin/end quoted field
                        if (cc == '"') { quote = !quote; continue; }

                        // If it's a sDelimiter and we're not in a quoted field, move on to the next column
                        if (cc == sDelimiter && !quote) { ++col; continue; }

                        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
                        // and move on to the next row and move to column 0 of that new row
                        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

                        // If it's a newline (LF or CR) and we're not in a quoted field,
                        // move on to the next row and move to column 0 of that new row
                        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
                        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

                        // modification to allow proper handling of line feeds (per user655063)
                        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; } if (cc == '\n' && !quote) { ++row; col = 0; continue; }

                        // Otherwise, append the current character to the current column
                        arr[row][col] += cc;
                    }
                    return arr;
                }, //# io.csv.parse

                //#
                stringify: function (a_oData, oOptions) {
                    var a_sKeys, iKeysLength, i, j, vCurrent,
                        sReturnVal = ""
                    ;

                    //# TODO: maybe in debug? core.type.obj.toCSV.$last = arguments;
                    //core.type.obj.toCSV.$last = arguments;

                    //#
                    oOptions = core.extend({
                        //keys: null,
                        quotes: false,
                        delimiter: ","
                    }, oOptions);
                    a_sKeys = oOptions.keys || core.type.obj.ownKeys(core.resolve(a_oData, "0"));
                    core.type.arr.rm(a_sKeys, "$$hashKey"); //# TODO: AngularJS specific
                    oOptions.delimiter = core.type.str.mk(oOptions.delimiter, ",");
                    oOptions.quotes = core.type.is.true(oOptions.quotes);

                    //#
                    if (core.type.arr.is(a_sKeys, true)) {
                        iKeysLength = a_sKeys.length;
                        sReturnVal = a_sKeys.join(oOptions.delimiter) + "\n";

                        //#
                        if (core.type.arr.is(a_oData, true)) {
                            for (i = 0; i < a_oData.length; i++) {
                                for (j = 0; j < iKeysLength; j++) {
                                    //# Pass in a_sKeys[j] in an array so .resolve doesn't parse it for .'s
                                    vCurrent = core.resolve(a_oData[i], [a_sKeys[j]]);

                                    //#
                                    if (vCurrent === undefined) {
                                        if (!core.type.obj.has(a_oData[i], a_sKeys[j])) {
                                            vCurrent = "";
                                        }
                                    }
                                    //#
                                    else if (core.type.obj.is(vCurrent) || core.type.arr.is(vCurrent)) {
                                        vCurrent = JSON.stringify(vCurrent);
                                    }
                                    //#
                                    else if (!core.type.num.is(vCurrent)) {
                                        vCurrent = core.type.str.mk(vCurrent);

                                        //#
                                        if (oOptions.quotes || vCurrent.indexOf(oOptions.delimiter) > -1 || vCurrent.indexOf('"') > -1 || vCurrent.indexOf('\n') > -1) {
                                            vCurrent = '"' + vCurrent.replace(/"/g, '""') + '"';
                                        }
                                    }
                                    //#
                                    else if (oOptions.quotes) {
                                        vCurrent = '"' + vCurrent + '"';
                                    }

                                    sReturnVal += vCurrent + ((iKeysLength - 1) === j ? "\n" : oOptions.delimiter);
                                }
                            }
                        }
                    }

                    return sReturnVal;
                }, //# io.csv.stringify
            }
        }); //# core.io.csv
    } //# init


    //# If we are running server-side (or possibly have been required as a CommonJS module)
    if (typeof window === 'undefined') { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = init;
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}();
