//################################################################################################
/** @file Pagination-based mixin for ish.js
 * @mixin ish.type.arr.pagination
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 * @ignore
 */ //############################################################################################
/*global module, define */                                      //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict'; //<MIXIN>

    function init(core) {
        //################################################################################################
        /** Collection of Pagination-based functionality.
         * @namespace ish.type.arr.pagination
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.type.arr, function (/*oProtected*/) {
            //#
            function newPage(sLabel, iPage) {
                iPage = core.type.int.mk(iPage, 0);

                return {
                    page: iPage,
                    label: sLabel,
                    isCurrent: false,
                    clickable: (iPage !== 0)
                };
            } //# newPage


            //#
            function setCurrentPage(iPage, fnReturnVal) {
                var i, iLowerPage, iUpperPage,
                    bTrailingEllipse = false,
                    iMaxPagesToShow = fnReturnVal.maxPagesToShow,
                    iHalfMaxPages = Math.ceil(iMaxPagesToShow / 2),
                    iPageCount = Math.ceil(fnReturnVal.data.length / fnReturnVal.pageSize),
                    a_iPages = []
                ;

                //# Ensure the passed iPage .is.int
                iPage = core.type.int.mk(iPage, 1);

                //#
                switch (iPage) {
                    case -1: {
                        iPage = fnReturnVal.current - 1;
                        break;
                    }
                    case -2: {
                        iPage = fnReturnVal.current + 1;
                        break;
                    }
                }
                fnReturnVal.current = (iPage < 1 ? 1 : iPage);
                fnReturnVal.current = (fnReturnVal.current > iPageCount ? iPageCount : fnReturnVal.current);

                //# If we are supposed to .showPrevNext
                if (fnReturnVal.showPrevNext && fnReturnVal.current > 1) {
                    //# .push the First page linky
                    a_iPages.push(newPage("<", -1));
                }

                //# Setup then fix the iLowerPage and iUpperPage
                iLowerPage = (fnReturnVal.current - iHalfMaxPages);
                iUpperPage = (fnReturnVal.current + iHalfMaxPages);
                if (iLowerPage < 1) {
                    iUpperPage -= iLowerPage; //# 1 - (-1) = 2
                    iLowerPage = 1;
                }
                //#
                if (iUpperPage > iPageCount) {
                    iLowerPage += (iPageCount - iUpperPage);
                    iLowerPage = (iLowerPage < 1 ? 1 : iLowerPage);
                    iUpperPage = iPageCount;
                }

                //#
                if ((iUpperPage - iLowerPage + 1) > iMaxPagesToShow) {
                    iUpperPage--;
                }

                //# If we need a leading ellipse, adjust the counters and .push it in now
                if (iLowerPage > 1) {
                    a_iPages.push(newPage("...", iLowerPage));
                    iLowerPage++;
                }

                //# If we need a bTrailingEllipse, adjust the counters and flip bTrailingEllipse
                if (iUpperPage < iPageCount) {
                    iUpperPage--;
                    bTrailingEllipse = true;
                }

                //# Traverse the iMaxPagesToShow, .push'ing each as we go
                for (i = iLowerPage; i <= iUpperPage; i++) {
                    a_iPages.push(newPage(i, i));

                    //# If we are on the .isCurrent iPage, flip it
                    if (i === iPage) {
                        a_iPages[a_iPages.length - 1].isCurrent = true;
                    }
                }

                //# If we need a bTrailingEllipse, .push it in now
                if (bTrailingEllipse) {
                    a_iPages.push(newPage("...", iUpperPage + 1));
                }

                //# If we are supposed to .showPrevNext, .push the Last page linky
                if (fnReturnVal.showPrevNext && fnReturnVal.current < iPageCount) {
                    a_iPages.push(newPage(">", -2));
                }

                fnReturnVal.pages = a_iPages;

                return iPage;
            } //# setCurrentPage


            return {
                //#########
                /** Creates an interface that represents the pagination information.
                 * @function ish.type.arr.pagination
                 * @param {variant[]} a_vData Value representing the array of data.
                 * @param {object} [oOptions] Value representing the following options:
                 *      @param {integer} [oOptions.current=1] Value representing the current page.
                 *      @param {integer} [oOptions.pageSize=10] Value representing the page size.
                 *      @param {integer} [oOptions.maxPagesToShow=10] Value representing the max pages to show.
                 *      @param {boolean} [oOptions.showPrevNext=false] Value representing if the previous/next controls will be shown.
                 * @returns {object} =interface Value representing the following properties:
                 *      @returns {object[]} =interface.pages Value representing the pagination's page descriptions; <code>{ clickable: boolean, isCurrent: boolean, label: string, page: integer }</code>.
                 *      @returns {variant[]} =interface.data Value representing the pagination's data.
                 *      @returns {integer} =interface.current Value representing the pagination's current page.
                 *      @returns {integer} =interface.pageSize Value representing the pagination's page size.
                 *      @returns {integer} =interface.maxPagesToShow Value representing the pagination's max number of pages to show.
                 *      @returns {integer} =interface.showPrevNext Value representing the pagination's max number of pages to show.
                 *      @returns {function} =interface.slice Determines the current page's records; <code>slice()</code>.
                 *      @returns {function} =interface.set Sets the current page; <code>set(iPage)</code>:
                 *          <table class="params">
                 *              <tr><td class="name"><code>iPage</code><td><td class="type param-type">integer<td><td class="description last">Value representing the page to set as current.</td></tr>
                 *          </table>
                 */ //#####
                pagination: function (a_vData, oOptions) {
                    var fnReturnVal = function (a_vData, oOptions) {
                        //#
                        a_vData = core.type.arr.mk(a_vData);

                        //# Ensure the passed oOptions .is .obj then setup the local vars and their related .properties
                        oOptions = core.type.obj.mk(oOptions);
                        core.extend(fnReturnVal, {
                            pages: null,
                            data: a_vData,
                            current: core.type.int.mk(oOptions.current, 1),
                            pageSize: core.type.int.mk(oOptions.pageSize, 10),
                            maxPagesToShow: core.type.int.mk(oOptions.maxPagesToShow, 10),
                            showPrevNext: core.type.bool.mk(oOptions.showPrevNext, false),

                            //showMiddlePages: core.type.bool.mk(oOptions.showMiddlePages, false),
                            //template: newPage,

                            //#########
                            /** Determines the current page's records.
                             * @function ish.type.arr.pagination:*:slice
                             * @returns {variant[]} Value representing the current page's records.
                             * @ignore
                             */ //#####
                            slice: function () {
                                var iIndex = ((fnReturnVal.current - 1) * fnReturnVal.pageSize);

                                return a_vData.slice(iIndex, iIndex + fnReturnVal.pageSize);
                            }, //# ish.type.arr.pagination.slice


                            //#########
                            /** Sets the current page.
                             * @function ish.type.arr.pagination:*:set
                             * @param {integer} iPage Value representing the page to set as current.
                             * @returns {integer} Value representing the current page.
                             * @ignore
                             */ //#####
                            set: function (iPage) {
                                return setCurrentPage(iPage, fnReturnVal);
                            } //# ish.type.arr.pagination.set
                        });

                        //# .setCurrentPage to .current
                        setCurrentPage(fnReturnVal.current, fnReturnVal);
                    };

                    //# Init fnReturnVal new reference with the passed a_vData/oOptions, then return it to the caller
                    fnReturnVal(a_vData, oOptions);
                    return fnReturnVal;
                }
            };
        });

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.type.arr.pagination");
    } //# init


    //# If we are running server-side
    //#     NOTE: Compliant with UMD, see: https://github.com/umdjs/umd/blob/master/templates/returnExports.js
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

    //</MIXIN>
}());
