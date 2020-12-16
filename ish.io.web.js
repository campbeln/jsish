//################################################################################################
/** @file Web Input/Output mixin for ish.js
 * @mixin ish.io.web
 * @author Nick Campbell
 * @license MIT
 * @copyright 2014-2020, Nick Campbell
 */ //############################################################################################
/*global module, define, global, require */                     //# Enable Node globals for JSHint
/*jshint maxcomplexity:9 */                                     //# Enable max complexity warnings for JSHint
(function () {
    'use strict';

    function init(core) {
        var bServerside = core.config.ish().onServer,                                   //# code-golf
            _root = (bServerside ? global : window),                                    //# code-golf
            _document = (bServerside ? {} : document),                                  //# code-golf
            _null = null,                                                               //# code-golf
            _undefined /*= undefined*/                                                  //# code-golf
        ;


        //################################################################################################
        /** Collection of Web-based functionality.
         * @namespace ish.io.web
         * @ignore
         */ //############################################################################################
        core.oop.partial(core.io, {
            web: core.extend(
                {
                    //################################################################################################
                    /** Collection of Cookie-based functionality.
                     * @namespace ish.io.web.cookie
                     * @ignore
                     */ //############################################################################################
                    cookie: function () {
                        var fnIsomorphic = (bServerside ?
                            function (oSources) {
                                var oRequestHeaders = core.resolve(oSources, "request.headers"),
                                    oResponseHeaders = core.resolve(oSources, "response.headers")
                                ;

                                return {
                                    get: function () {
                                        //# If we have oRequestHeaders, return their .cookie's to the caller
                                        if (core.type.obj.is(oRequestHeaders)) {
                                            return core.type.arr.mk(oRequestHeaders.cookie); //# set-cookie?
                                        }
                                        //# Else we have no oRequestHeaders, so throw the error
                                        else {
                                            throw "io.web.cookie: `request` not provided in `options`.";
                                        }
                                    },
                                    set: function (sName, sValue) {
                                        var a_sCookies, i,
                                            bFound /*= false*/
                                        ;

                                        //# If we have oResponseHeaders
                                        if (core.type.obj.is(oResponseHeaders)) {
                                            //# If set-cookie isn't an array, set it as one then collect the a_sCookies
                                            if (!core.type.arr.is(oResponseHeaders["set-cookie"])) {
                                                oResponseHeaders["set-cookie"] = [];
                                            }
                                            a_sCookies = oResponseHeaders["set-cookie"];

                                            //# Traverse the a_sCookies, looking for the passed sName
                                            for (i = 0; i < a_sCookies.length; i++) {
                                                //# If this is the a_sCookies we're looking for, reset it's value to the passed info, flip bFound and fall from the loop
                                                if (cookieName(a_sCookies[i]) === sName) {
                                                    a_sCookies[i] = sName + "=" + sValue;
                                                    bFound = true;
                                                    break;
                                                }
                                            }

                                            //# If the sName wasn't bFound in the a_sCookies, .push in the passed info as a new cookie
                                            if (!bFound) {
                                                a_sCookies.push(sName + "=" + sValue);
                                            }
                                        }
                                        //# Else we have no oResponseHeaders, so throw the error
                                        else {
                                            throw "io.web.cookie: `response` not provided in `options`.";
                                        }
                                    }
                                };
                            } :
                            function () {
                                return {
                                    get: function() {
                                        return core.type.str.mk(_document.cookie).split(";");
                                    },
                                    set: function (sName, sValue) {
                                        _document.cookie = sName + "=" + sValue;
                                    }
                                };
                            }
                        );

                        //# Correctly decodes the cookie name from the passed sCookieData
                        function cookieName(sCookieData) {
                            var i = sCookieData.indexOf("=");
                            return sCookieData.substr(0, i).replace(/^\s+|\s+$/g, "");
                        } //# cookieName


                        //#########
                        /** Provides an interface to the cookie data of the passed value.
                         * @function ish.io.web.cookie
                         * @param {string} sName Value representing the cookie to retrieve.
                         * @param {object} [oDefault=undefined] Value representing if the default value of the cookie data if it hasn't been previously set.
                         * @param {object} [vOptions] Value representing the desired options:
                         *      @param {boolean} [vOptions.path="/"] Value representing if the Querystring's delimiter is to be semicolons (<code>;</code>) rather than ampersands (<code>&</code>).
                         *      @param {boolean} [vOptions.domain] Value representing the domain the cookie is related to.
                         *      @param {boolean} [vOptions.maxAge] Value representing max age in milliseconds the cookie is to be valid for.
                         * @returns {object} =interface Value representing the following properties:
                         *      @returns {string} =interface.name Value representing the cookie's name.
                         *      @returns {object} =interface.original Value representing the cookie's original data.
                         *      @returns {object} =interface.data Value representing the cookie's data.
                         *      @returns {boolean} =interface.isNew Value representing if the cookie wasn't previously present in the browser's collection.
                         *      @returns {function} =interface.stringify Returns a value representing the cookie data as JSON; <code>stringify()</code>.
                         *      @returns {function} =interface.set Sets the cookie into the browser's collection; <code>set()</code>.
                         *      @returns {function} =interface.rm Removes the cookie from the browser's collection; <code>rm()</code>.
                         */ //#####
                        return function (sName, oDefault, oOptions) {
                            var oModel,
                                fnCookies = fnIsomorphic(oOptions),
                                $returnValue = {
                                    //options: oOptions,
                                    name: sName,
                                    original: _undefined,
                                    data: _undefined,
                                    isNew: true,

                                    stringify: function () {
                                        return JSON.stringify($returnValue.data);
                                    }, //# stringify

                                    set: function () {
                                        var dExpires, sDomain, sPath, sSameSite, iMaxAge;

                                        //# Ensure the .path and .maxAge are valid or defaulted to root and .seconds7Days respectively
                                        sPath = oOptions.path = core.type.str.mk(oOptions.path, "/");
                                        sSameSite = oOptions.sameSite = core.type.str.mk(oOptions.sameSite, "Lax");
                                        sDomain = oOptions.domain = core.type.str.mk(oOptions.domain);
                                        iMaxAge = oOptions.maxAge = core.type.int.mk(oOptions.maxAge, (1000 * 60 * 60 * 24 * 7));

                                        //# If this is not a session cookie, setup dExpires
                                        if (iMaxAge > 0) {
                                            dExpires = new Date();
                                            dExpires.setSeconds(dExpires.getSeconds() + iMaxAge);
                                        }

                                        //# .encodeURIComponent the .string, set the max-age and path and toss it into the .cookie collection
                                        //#     NOTE: http://www.w3.org/Protocols/rfc2109/rfc2109 - The Domain attribute specifies the domain for which the cookie is valid. An explicitly specified domain must always start with a dot.
                                        fnCookies.set(sName, encodeURIComponent($returnValue.stringify()) +
                                            "; path=" + sPath +
                                            (iMaxAge > 0 ? "; max-age=" + iMaxAge : "") +
                                            (dExpires ? "; expires=" + dExpires.toUTCString() : "") +
                                            (sDomain ? '; domain=.' + sDomain : "") +
                                            (sSameSite ? '; SameSite=' + sSameSite : "") +
                                        "; ");

                                        //# Flip .isNew to false (as its now present on the browser)
                                        $returnValue.isNew = false;
                                    }, //# set

                                    rm: function () {
                                        //# Set the max-age and path and toss it into the .cookie collection
                                        //$returnValue.data = _undefined;
                                        fnCookies.set(sName, "; expires=Thu, 01 Jan 1970 00:00:01 GMT;" + " path=" + oOptions.path + "; ");
                                    } //# rm
                                }
                            ;

                            //# Locates the document.cookie for the passed sName
                            //#     NOTE: This is placed in a function so that the a_sCookies array will be dropped after execution
                            function find() {
                                var i, j,
                                    a_sCookies = fnCookies.get()
                                ;

                                //# Loop thru the values in .cookie looking for the passed sName, setting $returnValue.original if it's found
                                for (i = 0; i < a_sCookies.length; i++) {
                                    j = a_sCookies[i].indexOf("=");
                                    if (cookieName(a_sCookies[i]) === sName) {
                                        $returnValue.original = decodeURIComponent(a_sCookies[i].substr(j + 1));
                                        oModel = core.type.obj.mk($returnValue.original);
                                        return true;
                                    }
                                }
                                return false;
                            } //# find


                            //#
                            oOptions = core.type.obj.mk(oOptions);
                            $returnValue.options = oOptions;

                            //# If a seemingly valid sName was passed
                            if (!core.type.str.is(sName) || sName === "") {
                                throw (core.config.ish().target + ".io.web.cookie: A [String] value must be provided for the cookie name.");
                            }

                            //# If we can .find a current value, reset .isNew to false
                            if (find()) {
                                $returnValue.isNew = false;
                            }
                            //# Else this .isNew cookie, so if the caller passed in a valid oDefault object, reset our oModel to it
                            else if (core.type.obj.is(oDefault)) {
                                oModel = oDefault;
                            }

                            //#
                            $returnValue.data = oModel;
                            return $returnValue;
                        };
                    }(), //# core.web.cookie


                    //################################################################################################
                    /** Collection of QueryString-based functionality.
                     * @namespace ish.io.web.queryString
                     * @ignore
                     */ //############################################################################################
                    queryString: function () {
                        var $queryString,
                            bLoaded = false
                        ;

                        //# serializes the passed oData (up to 3-dimensions)
                        function serialize(oData, vOptions) {
                            var key, value, subkey, i,
                                oOptions = (core.type.obj.is(vOptions) ?
                                    vOptions :
                                    { useSemicolon: vOptions === true, encodeURI: true }
                                ),
                                e = (oOptions.encodeURI === false ?
                                    function (s) { return s; } :
                                    encodeURIComponent
                                ),
                                delimiter = (oOptions.useSemicolon ?
                                    "; " :
                                    "&"
                                ),
                                returnVal = ''
                            ;

                            //# Traverse each key within the passed oData
                            for (key in oData) {
                                if (oData.hasOwnProperty(key)) {
                                    value = oData[key];
                                    key = e(key.trim());

                                    //# If the current value is null or undefined, record a null-string value
                                    if (!core.type.is.value(value)) {
                                        returnVal += key + "=" + delimiter;
                                    }
                                    //# Else if the current key is a pseudo-Array object
                                    else if (core.type.obj.is(value)) {
                                        //# Traverse each subkey in the current value
                                        for (subkey in value) {
                                            //# If the current subkey is an Array, traverse it's Array outputting each of its values individually
                                            if (value[subkey] instanceof Array) {
                                                for (i = 0; i < value[subkey].length; i++) {
                                                    returnVal += key + "[" + e(subkey) + "]=" + e(value[subkey][i]) + delimiter;
                                                }
                                            }
                                            //# Else treat the current subkey as a string
                                            else {
                                                returnVal += key + "[" + e(subkey) + "]=" + e(value[subkey]) + delimiter;
                                            }
                                        }
                                    }
                                    //# Else if the current key is an Array, traverse it's Array outputting each of its values individually
                                    else if (Array.isArray(value)) {
                                        for (i = 0; i < value.length; i++) {
                                            returnVal += key + "=" + e(value[i]) + delimiter;
                                        }
                                    }
                                    //# Else if the current value isn't a function, treat the current key/value as a string
                                    else if (core.type.fn.is(value)) {
                                        returnVal += key + "=" + e(value) + delimiter;
                                    }
                                }
                            }

                            return returnVal.trim().substr(0, returnVal.length - 1);
                        } //# serialize

                        //# Parses the passed valueToParse into a model (up to 3-dimensions deep)
                        //#    Based on: http://jsbin.com/adali3/2/edit via http://stackoverflow.com/a/2880929/235704
                        //#    NOTE: All keys are .toLowerCase'd to make them case-insensitive(-ish) with the exception of a sub-keys named 'length', which are .toUpperCase'd
                        //#    Supports: key=val1;key=val2;newkey=val3;obj=zero;obj=one;obj[one]=1;obj[two]=2;obj[Length]=long;obj[2]=mytwo;obj=two;obj[2]=myothertwo;obj=three
                        function deserialize(valueToParse) {
                            //# Setup the required local variables (using annoyingly short names which are documented in the comments below)
                            //#     NOTE: Per http://en.wikipedia.org/wiki/Query_string#Structure and the W3C both & and ; are legal delimiters for a query string, hence the RegExp below
                            var b, e, k, p, sk, v, r = {},
                                d = function (v) {
                                    try {
                                        return decodeURIComponent(v).replace(/\+/g, " ") + '';
                                    } catch (e) {
                                        return (v + '').replace(/\+/g, " ") + '';
                                    }
                                }, //# d(ecode) the v(alue)
                                s = /([^&;=]+)=?([^&;]*)/g //# original regex that does not allow for ; as a delimiter:   /([^&=]+)=?([^&]*)/g
                            ;

                            //# p(ush) re-implementation
                            p = function (a) {
                                //# Traverse the passed arguments, skipping the first as it's our a(rray)
                                for (var i = 1, j = arguments.length; i < j; i++) {
                                    //# If there is already an entry at the "new" index, .push the current arguments into the sk(sub-key)'s Array (or make one if it doesn't already exist)
                                    if (a[a.length]) {
                                        if (core.type.arr.is(a[a.length])) {
                                            a[a.length].push(arguments[i]);
                                        }
                                        else {
                                            a[a.length] = new Array(a[a.length], arguments[i]);
                                        }
                                        a.length++;
                                    }
                                        //# Else this is a new entry, so just set the arguments
                                    else {
                                        a[a.length++] = arguments[i];
                                    }
                                }
                            };

                            //# While we still have key-value e(ntries) in the valueToParse via the s(earch regex)...
                            while ( (e = s.exec(valueToParse)) /* == truthy */) { //# while((e = s.exec(valueToParse)) !== _null) {
                                //# Collect the open b(racket) location (if any) then set the d(ecoded) v(alue) from the above split key-value e(ntry)
                                b = e[1].indexOf("[");
                                v = d(e[2]);

                                //# As long as this is NOT a hash[]-style key-value e(ntry)
                                if (b < 0) {
                                    //# d(ecode) the simple k(ey)
                                    k = d(e[1]).trim();

                                    //# If the k(ey) already exists, we need to transform it into a standard Array
                                    if (r[k]) {
                                        //# If the k(ey) is already an Array, .push the v(alue) into it
                                        if (r[k] instanceof Array) {
                                            r[k].push(v);
                                        }
                                        //# Else if it is a pseudo-Array object, p(ush) the v(alue) in
                                        else if (typeof r[k] === 'object') {
                                            p(r[k], v);
                                        }
                                        //# Else the k(ey) must be a single value, so transform it into a standard Array
                                        else {
                                            r[k] = new Array(r[k], v);
                                        }
                                    }
                                    //# Else this is a new k(ey), so just add the v(alue) into the r(eturn value) as a single value
                                    else {
                                        r[k] = (v ? v : _null);
                                    }
                                }
                                //# Else we've got ourselves a hash[]-style key-value e(ntry)
                                else {
                                    //# Collect the .trim'd and d(ecoded) k(ey) and sk(sub-key) based on the b(racket) locations
                                    k = d(e[1].slice(0, b)).trim();
                                    sk = d(e[1].slice(b + 1, e[1].indexOf("]", b))).trim();

                                    //# If the sk(sub-key) is the reserved 'length', then .toUpperCase it and .warn the developer
                                    if (sk === 'length') {
                                        sk = sk.toUpperCase();
                                        core.type.fn.call(core.resolve(core, "io.log.warn"), null, "'length' is a reserved name and cannot be used as a sub-key. Your sub-key has been changed to 'LENGTH'.");
                                    }

                                    //# If the k(ey) isn't already a pseudo-Array object
                                    if (!core.type.obj.is(r[k]) || core.type.arr.is(r[k])) {
                                        //# If the k(ey) is an Array
                                        if (core.type.arr.is(r[k])) {
                                            var i, a = r[k];

                                            //# Reset the k(ey) as a pseudo-Array object, then copy the previous a(rray)'s values in at their numeric indexes
                                            //#     NOTE:
                                            r[k] = { length: a.length };
                                            for (i = 0; i < a.length; i++) {
                                                r[k][i] = a[i];
                                            }
                                        }
                                        //# Else the k(ey) is a single value so transform it into a pseudo-Array object with the current value at index 0
                                        else {
                                            r[k] = { 0: r[k], length: 1 };
                                        }
                                    }

                                    //# If we have a sk(sub-key)
                                    if (sk) {
                                        //# If the sk(sub-key) already exists, .push the v(alue) into the sk(sub-key)'s Array (or make one if it doesn't already exist)
                                        if (r[k][sk]) {
                                            if (core.type.arr.is(r[k][sk])) {
                                                r[k][sk].push(v);
                                            }
                                            else {
                                                r[k][sk] = new Array(r[k][sk], v);
                                            }
                                        }
                                        //# Else the sk(sub-key) is new, so just set the v(alue)
                                        else { r[k][sk] = v; }
                                    }
                                        //# Else p(ush) the v(alue) into the k(ey)'s pseudo-Array object
                                    else { p(r[k], v); }
                                }
                            }

                            //# Return the r(eturn value)
                            return r;
                        } //# deserialize

                        //#
                        function getQS() {
                            //#
                            if (bServerside) {
                                throw "No request.url has been provided.";
                            }
                            //#
                            else {
                                return _root.location.search.substr(1);
                            }
                        } //# getQS

                        //#
                        function get(sKey, bCaseInsensitive) {
                            var vReturnVal;

                            //# Ensure the cached $queryString is setup
                            if (!bLoaded) {
                                $queryString = deserialize(getQS());
                            }

                            //# If there were no arguments, return the cached $queryString
                            if (arguments.length === 0) {
                                vReturnVal = $queryString;
                            }
                            //# Else we need to .get the key from the $queryString
                            else {
                                vReturnVal = (bCaseInsensitive ? core.type.obj.get($queryString, sKey) : $queryString[sKey]);
                            }

                            return vReturnVal;
                        } //# get


                        //#########
                        /** Retrieves the passed value from the Querystring data.
                         * @$note If <code>ish.io.web.queryString.parse</code> was not called previously, the Querystring is implicitly parsed prior to the passed value being retrieved. This will result in an error on the server-side as the Querystring cannot be automatically collected.
                         * @function ish.io.web.queryString.!
                         * @$aka ish.io.web.queryString.get
                         * @param {string} sKey Value representing the Querystring key to retrieve.
                         * @param {boolean} [bCaseInsensitive=false] Value representing if the passed value is to be retrieved from the Querystring data in a case-insensitive manor.
                         * @returns {variant} Value representing the data for the passed value.
                         */ //#####
                        return core.extend(get, {
                            //# TODO: Remove
                            ser: {
                                ize: serialize,
                                de: deserialize
                            }, //# ser

                            //#     NOTE: AKA'd above
                            get: get,

                            //#########
                            /** Parses the passed value into a Javascript object representing the Querystring data.
                             * @$note All keys are .toLowerCase'd to make them case-insensitive(-ish) with the exception of a sub-keys named 'length', which are .toUpperCase'd.
                             * @$note Supports up to 3-dimensions: <code>key=val1;key=val2;newkey=val3;obj=zero;obj=one;obj[one]=1;obj[two]=2;obj[Length]=long;obj[2]=mytwo;obj=two;obj[2]=myothertwo;obj=three</code>
                             * @function ish.io.web.queryString:parse
                             * @param {string} [sUrl=location.search] Value representing the Querystring data to parse.
                             * @returns {object} Value representing the Querystring data.
                             * @see {@link http://stackoverflow.com/a/2880929/235704|StackOverflow.com}
                             * @see {@link http://jsbin.com/adali3/2/edit|JSBin.com}
                             */ //#####
                            parse: function (sUrl) {
                                var oReturnVal, i;

                                //# Ensure the passed sUrl .is .str then locate the ?
                                sUrl = core.type.str.mk(
                                    (arguments.length > 0 ? sUrl : getQS())
                                );
                                i = sUrl.indexOf("?");

                                //# If the sUrl has a query string, .deserialize it into our oReturnVal
                                if (i > -1) {
                                    bLoaded = true;
                                    oReturnVal = deserialize(sUrl.substr(i + 1));
                                }

                                $queryString = oReturnVal || {};
                                return $queryString;
                            }, //# parse

                            //#########
                            /** Converts the passed value to a Querystring.
                             * @function ish.io.web.queryString:stringify
                             * @param {object} oData Value representing the data to serialize into a Querystring.
                             * @param {object} [vOptions] Value representing the desired options:
                             *      @param {boolean} [vOptions.useSemicolon=false] Value representing if the Querystring's delimiter is to be semicolons (<code>;</code>) rather than ampersands (<code>&</code>).
                             *      @param {boolean} [vOptions.encodeURI=true] Value representing if <code>encodeURIComponent</code> is to be used.
                             * @returns {string} Value representing the Querystring data.
                             */ //#####
                            stringify: serialize
                        });
                    }(), //# io.web.queryString


                    //#########
                    /** Parses the passed value into its URL components.
                     * @function ish.io.web.url
                     * @param {string} sUrl Value representing the URL to parse.
                     * @returns {object} Value representing the URL components.
                     * @see {@link https://www.sitepoint.com/url-parsing-isomorphic-javascript/|Sitepoint.com}
                     * @see {@link http://davidwalsh.name/essential-javascript-functions|David Walsh}
                     */ //#####
                    url: function () {
                        var $lib, fnReturnVal;

                        //#
                        function consistentInterface(oLibResult) {
                            oLibResult = core.type.obj.mk(oLibResult);

                            return {
                                href:       oLibResult.href,
                                protocol:   oLibResult.protocol,
                                host:       oLibResult.host,
                                hostname:   oLibResult.hostname,
                                port:       oLibResult.port,
                                pathname:   oLibResult.pathname,
                                search:     oLibResult.search,
                                hash:       oLibResult.hash,
                                username:   oLibResult.username,
                                password:   oLibResult.password,
                                //auth:       !!(oLibResult.username || oLibResult.password),
                                origin:     oLibResult.origin
                            };
                        } //# consistentInterface


                        //# If we are running bServerside (or possibly have been required as a CommonJS module)
                        if (bServerside) {
                            $lib = require('url');

                            fnReturnVal = function (sUrl) {
                                return consistentInterface($lib.parse(sUrl));
                            };
                        }
                        //# Else we are running in the browser, so we need to setup the _document-based features
                        else {
                            //var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
                            //var domain = matches && matches[1];
                            fnReturnVal = function (sUrl) {
                                $lib = $lib || _document.createElement('a');
                                $lib.href = sUrl;
                                return consistentInterface($lib);
                            };
                        }

                        return fnReturnVal;
                    }() //# io.web.url
                },

                //# If we aren't running bServerside (or possibly have been required as a CommonJS module), add in the browser-specific stuff
                (bServerside ? _null : {
                    //# Aliases to window.localstorage and window.sessionStorage with automajic stringification of non-string values

                    //################################################################################################
                    /** Collection of <code>window.*Storage</code>-based functionality.
                     * @namespace ish.io.web.storage
                     * @$clientsideonly
                     * @ignore
                     */ //############################################################################################
                    storage: function () {
                        var window_localStorage = _root.localStorage,         //# code-golf
                            window_sessionStorage = _root.sessionStorage      //# code-golf
                        ;

                        function get(sKey, bSession) {
                            var sValue = (bSession ? window_sessionStorage : window_localStorage).getItem(sKey);

                            return core.type.obj.mk(sValue, sValue);
                        }

                        //#########
                        /** Retrieves the passed value from the browser's <code>window.*Storage</code> data.
                         * @function ish.io.web.storage.!
                         * @$aka ish.io.web.storage.get
                         * @$clientsideonly
                         * @param {string} sKey Value representing the browser's <code>window.*Storage</code> key to retrieve.
                         * @param {boolean} [bSession=false] Value representing if the passed value is to be retrieved from the browser's <code>window.sessionStorage</code> data rather than <code>window.localStorage</code>.
                         * @returns {variant} Value representing the data for the passed value.
                         */ //#####
                        return core.extend(get, {
                            //#########
                            /** Sets the passed value into the browser's <code>window.*Storage</code> data.
                             * @function ish.io.web.storage:set
                             * @$clientsideonly
                             * @param {string} sKey Value representing the key to set.
                             * @param {variant} vValue Value representing the value to set.
                             * @param {boolean} [bSession=false] Value representing if the passed value is to be set into the browser's <code>window.sessionStorage</code> data rather than <code>window.localStorage</code>.
                             */ //#####
                            set: function (sKey, vValue, bSession) {
                                var sValue = (core.type.obj.is(vValue) ? JSON.stringify(vValue) : core.type.str.mk(vValue));

                                (bSession ? window_sessionStorage : window_localStorage).setItem(sKey, sValue);
                            },

                            //#     NOTE: AKA'd above
                            get: get,

                            //#########
                            /** Removes the passed value from the browser's <code>window.*Storage</code> data.
                             * @function ish.io.web.storage:rm
                             * @$clientsideonly
                             * @param {string} sKey Value representing the key to remove.
                             * @param {boolean} [bSession=false] Value representing if the passed value is to be removed from the browser's <code>window.sessionStorage</code> data rather than <code>window.localStorage</code>.
                             */ //#####
                            rm: function (sKey, bSession) {
                                (bSession ? window_sessionStorage : window_localStorage).removeItem(sKey);
                            },

                            //#########
                            /** Clears the browser's <code>window.*Storage</code> data.
                             * @function ish.io.web.storage:clear
                             * @$clientsideonly
                             * @param {boolean} [bSession=false] Value representing if the passed value is to be cleared from the browser's <code>window.sessionStorage</code> data rather than <code>window.localStorage</code>.
                             */ //#####
                            clear: function (bSession) {
                                (bSession ? window_sessionStorage : window_localStorage).clear();
                            }
                        });
                    }() //# web.storage
                })
            )
        }); //# core.io.web

        //# .fire the plugin's loaded event
        core.io.event.fire("ish.io.web");
    }


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
}());
