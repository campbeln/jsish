/** ################################################################################################
 * @class ish
 * @classdesc ishJS Functionality (Q: Are you using Vanilla Javascript? A: ...ish)
 * @author Nick Campbell
 * @license MIT
################################################################################################# */
!function () {
    'use strict';

    function init(core) {
        var bServerside = core.type.ish.onServer,                                       //# code-golf
            _root = (bServerside ? global : window),                                    //# code-golf
            _document = (bServerside ? {} : document),                                  //# code-golf
            _null = null,                                                               //# code-golf
            _undefined /*= undefined*/                                                  //# code-golf
        ;


        /*
        ####################################################################################################
        Class: core.io.web
        Input/Output-based Web functionality.
        Requires:
        <core.resolve>,
        <core.type.obj.is>, <core.type.str.is>, <core.type.fn.is>, <core.type.arr.is>,
        <core.type.json.mk>, <core.type.str.mk>, <core.type.int.mk>, <core.type.obj.mk>,
        <core.type.fn.call>, <core.type.arr.rm>, <core.type.obj.get>,
        ~<core.io.log.warn>
        ####################################################################################################
        */
        core.oop.partial(core.io, {
            web: core.extend(
                {
                    /*
                    ####################################################################################################
                    Class: core.io.web.cookie
                    Parses the referenced cookie and returns an object to manage it.
                    Requires:
                    <core.type.*.is>, <core.type.fn>
                    ####################################################################################################
                    */
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


                        return function (sName, oDefault, oOptions) {
                            var oModel,
                                fnCookies = fnIsomorphic(oOptions),
                                $returnValue = {
                                    name: sName,
                                    original: _undefined,
                                    //options: oOptions,
                                    data: _undefined,
                                    isNew: true,
                                    str: function () {
                                        return JSON.stringify($returnValue.data);
                                    }, //# str
                                    set: function () {
                                        var dExpires, sDomain, sPath, iMaxAge;

                                        //# Ensure the .path and .maxAge are valid or defaulted to root and .seconds7Days respectively
                                        sPath = oOptions.path = core.type.str.mk(oOptions.path, "/");
                                        sDomain = oOptions.domain = core.type.str.mk(oOptions.domain);
                                        iMaxAge = oOptions.maxAge = core.type.int.mk(oOptions.maxAge, (1000 * 60 * 24 * 7));

                                        //# If this is not a session cookie, setup dExpires
                                        if (iMaxAge > 0) {
                                            dExpires = new Date();
                                            dExpires.setSeconds(dExpires.getSeconds() + iMaxAge);
                                        }

                                        //# .encodeURIComponent the .string, set the max-age and path and toss it into the .cookie collection
                                        //#     NOTE: http://www.w3.org/Protocols/rfc2109/rfc2109 - The Domain attribute specifies the domain for which the cookie is valid. An explicitly specified domain must always start with a dot.
                                        fnCookies.set(sName, encodeURIComponent($returnValue.str()) +
                                            "; path=" + sPath +
                                            (iMaxAge > 0 ? "; max-age=" + iMaxAge : "") +
                                            (dExpires ? "; expires=" + dExpires.toUTCString() : "") +
                                            (sDomain ? '; domain=.' + sDomain : "") +
                                        "; ");

                                        //# Flip .isNew to false (as its now present on the browser)
                                        $returnValue.isNew = false;
                                    }, //# set

                                    rm: function () {
                                        //# Set the max-age and path and toss it into the .cookie collection
                                        //$returnValue.data = _null;
                                        fnCookies.set(sName, "; expires=Thu, 01 Jan 1970 00:00:01 GMT;" + " path=" + oOptions.path + "; ");
                                        return true;
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
                                        oModel = core.type.json.mk($returnValue.original);
                                        return true;
                                    }
                                }
                                return false;
                            }

                            //#
                            oOptions = core.type.obj.mk(oOptions);
                            $returnValue.options = oOptions;

                            //# If a seemingly valid sName was passed
                            if (!core.type.str.is(sName) || sName === "") {
                                throw (core.$path + ".cookie: A [String] value must be provided for the cookie name.");
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


                    /*
                    ####################################################################################################
                    Class: core.web.queryString
                    Parses the referenced cookie and returns an object to manage it.
                    Requires:
                    <core.type.*.is>, <core.type.*.mk>, <core.type.fn>,
                    ~<core.io.log.warn>
                    ####################################################################################################
                    */
                    queryString: function () {
                        var $queryString,
                            bLoaded = false
                        ;

                        //# serializes the passed model (up to 3-dimensions)
                        function serialize(model, vOptions) {
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

                            //# Traverse each key within the passed model
                            for (key in model) {
                                if (model.hasOwnProperty(key)) {
                                    value = model[key];
                                    key = e(key.trim());

                                    //# If the current value is null or undefined, record a null-string value
                                    if (!core.type.is.val(value)) {
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
                                        core.type.arr.is(a[a.length]) ? a[a.length].push(arguments[i]) : a[a.length] = new Array(a[a.length], arguments[i]);
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
                                        core.type.fn.call(core.resolve(core, "io.log.warn"), this, "'length' is a reserved name and cannot be used as a sub-key. Your sub-key has been changed to 'LENGTH'."); //# TODO: Refactor `this` to `this || _null`?
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
                                        if (r[k][sk]) { core.type.arr.is(r[k][sk]) ? r[k][sk].push(v) : r[k][sk] = new Array(r[k][sk], v); }
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


                        //# Parses the query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
                        //#     Supports: ?test=Hello&person=neek&person=jeff&person[]=jim&person[extra]=john&test3&nocache=1398914891264&person=frank,jim;person=aaron
                        return {
                            ser: {
                                ize: serialize,
                                de: deserialize
                            }, //# ser

                            //# Parses the query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
                            //#     Supports: ?test=Hello&person=neek&person=jeff&person[]=jim&person[extra]=john&test3&nocache=1398914891264&person=frank,jim;person=aaron
                            get: function (sKey, bCaseInsensitive) {
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
                            }, //# get

                            //# Parses the sUrl's query string into an object model, returning an object containing the .model and a .value function to retrieve the values (see note below).
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
                            } //# parse
                        };
                    }(), //# io.web.queryString


                    /*
                    Function: url
                    Parses the passed URL into its component parts.
                    Parameters:
                    sUrl - String representing the target URL to extract the component parts from.
                    About:
                    From: https://www.sitepoint.com/url-parsing-isomorphic-javascript/, http://davidwalsh.name/essential-javascript-functions
                    Returns:
                    Object representing the component parts of the URL (e.g. href, protocol, host, hostname, port, pathname, search, hash, username, password and origin).
                    */
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
                    storage: function () {
                        var window_localStorage = _root.localStorage,         //# code-golf
                            window_sessionStorage = _root.sessionStorage      //# code-golf
                        ;

                        function get(sKey, bSession) {
                            var sValue = (bSession ? window_sessionStorage : window_localStorage).getItem(sKey);

                            return core.type.json.mk(sValue, sValue);
                        }

                        return core.extend(get, {
                            set: function (sKey, vValue, bSession) {
                                var sValue = (core.type.obj.is(vValue) ? core.type.json.mk(vValue, vValue) : core.type.str.mk(vValue));

                                (bSession ? window_sessionStorage : window_localStorage).setItem(sKey, sValue);
                            },
                            get: get,
                            rm: function (sKey, bSession) {
                                (bSession ? window_sessionStorage : window_localStorage).removeItem(sKey);
                            },
                            clear: function (bSession) {
                                (bSession ? window_sessionStorage : window_localStorage).clear();
                            }
                        });
                    }() //# web.storage
                })
            )
        }); //# core.io.web

        //#
        core.io.event.fire("ish.io.web");
    }


    //# If we are running server-side (or possibly have been required as a CommonJS module)
    if (typeof window === 'undefined') { //if (typeof module !== 'undefined' && this.module !== module && module.exports) {
        module.exports = init;
    }
    //# Else we are running in the browser, so we need to setup the _document-based features
    else {
        init(document.querySelector("SCRIPT[ish]").ish);
    }
}();
