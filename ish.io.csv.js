//################################################################################################
/** @file CSV mixin for ish.js
 * @mixin ish.io.csv
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2019, Nick Campbell
 */ //############################################################################################
!function () {
    'use strict';

    function init(core) {
    //################################################################################################
    /** Collection of CSV-based functionality.
     * @namespace ish.io.csv
     * @ignore
     */ //############################################################################################
    core.oop.partial(core.io, {
            csv: { // core.extend(core.resolve(true, core.data, "csv"), {
                //#########
                /** Parses the passed value into a Javascript object representing the CSV data.
                 * @function ish.io.csv.parse
                 * @param {string} sCSV Value representing the CSV data to parse.
                 * @param {string} [sDelimiter=','] Value representing the CSV delimiter.
                 * @returns {object[]} Value representing the CSV data.
                 * @see {@link https://stackoverflow.com/a/14991797/235704|StackOverflow.com}
                 */ //#####
                parse: function (sCSV, sDelimiter) {
                    var row, col, c, cc, nc,
                        arr = [],
                        quote = false  // true means we're inside a quoted field
                    ;

                    sDelimiter = sDelimiter || ",";

                    // iterate over each character, keep track of current row and column (of the returned array)
                    for (row = col = c = 0; c < sCSV.length; c++) {
                        cc = sCSV[c];                          // current character
                        nc = sCSV[c+1];                        // next character
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

                //#########
                /** Converts the passed value to a CSV string.
                 * @function ish.io.csv.stringify
                 * @param {object[]} a_oData Value representing the data to serialize into a CSV string.
                 * @param {string|object} [vOptions] Value representing the CSV delimiter or the desired options:
                 *      @param {string} [vOptions.delimiter=','] Value representing the CSV delimiter.
                 *      @param {boolean} [vOptions.quotes=false] Value representing each serialized value is to be surrounded by double-quotes (e.g. <code>"</code>).
                 *      @param {string[]} [vOptions.keys=undefined] Value representing the keys to include within the serialized CSV string.
                 * @returns {string} Value representing the CSV data.
                 */ //#####
                stringify: function (a_oData, vOptions) {
                    var a_sKeys, oOptions, vCurrent, iKeysLength, i, j,
                        sReturnVal = ""
                    ;

                    //#
                    oOptions = core.extend(
                        {
                            //keys: undefined,
                            quotes: false,
                            delimiter: ","
                        }, (
                            core.type.str.is(vOptions, true) ?
                                { delimiter: vOptions } :
                                vOptions
                        )
                    );
                    a_sKeys = oOptions.keys || core.type.obj.ownKeys(core.resolve(a_oData, "0"));
                    core.type.arr.rm(a_sKeys, "$$hashKey"); //# TODO: AngularJS specific
                    oOptions.delimiter = core.type.str.mk(oOptions.delimiter, ",");
                    oOptions.quotes = core.type.bool.is(oOptions.quotes, true);

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
                                    else if (!core.type.is.numeric(vCurrent)) {
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
                } //# io.csv.stringify
            }
        }); //# core.io.csv
    } //# init


    //# If we are running server-side
    //#     NOTE: Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports, like Node.
    if (typeof module === 'object' && module.exports) { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = init;
    }
    //# Else if we are running in an .amd environment, register as an anonymous module
    else if (typeof define === 'function' && define.amd) {
        define([], init);
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}();
