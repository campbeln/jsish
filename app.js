window.cn = function (sSelector) {
    var oNeek = window.cn,
        oReturnVal = angular.element(document.getElementById(sSelector || "neek"))
    ;

    oNeek.e = oReturnVal;
    oNeek.s = oReturnVal.scope();

    return oNeek.s;
};


!function (core) {
    "use strict";

    var bInit = false;

    //#
    core.app = {
        data: {
            userId: location.pathname.split('/')[1],
            // baseUrlUser: "",
            selected: {},
            api: {
                //domain: {},
                //ip: {}
            }
        },
        enums: {},

        cookie: core.io.web.cookie("Zetacookies"),


        //#
        init: function () {
            var sIP, iMask,
                _document_location = document.location,
                sBaseUrl = _document_location.protocol + "//" + _document_location.host + "/",
                sUserHash = _document_location.pathname.split('/')[1],
                dt = new Date(),
                today = dt.getFullYear() + '-' + ('0' + (dt.getMonth()+1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2)
            ;

            if (!bInit) {
                bInit = true;

                //# .load the .theme from the user's cookie
                core.app.theme.load(null, function (/*bSuccess*/) {
                    var oTheme = core.app.theme.current();
                    core.app.data.selected.Theme = oTheme.name;
                    core.app.data.$scope.css = oTheme.css;
                });

                core.io.event.watch("ish.web", function () {
                    if (!/^[a-z0-9]{32}$/.test(sUserHash) && $z.type.str.eq(_document_location.protocol, "file:")) {
                        sUserHash = window.prompt("Please enter hash:", core.io.web.storage.get("userHash"));
                        sBaseUrl = "https://dev.zonecruncher.com/";
                        core.io.web.storage.set("userHash", sUserHash);
                    }

                    return core.io.event.unwatch;
                });

                //#
                core.extend(core.app.data, {
                    baseUrl: sBaseUrl,
                    baseUrlUser: sBaseUrl + sUserHash + "/",
                    userHash: sUserHash
                });


                sIP = core.type.str.mk(core.io.web.queryString.get("ip", true)).split('#')[0];
                iMask = core.type.int.mk(core.io.web.queryString.get("mask", true), 32);
                iMask = (iMask < 1 || iMask > 32 ? 32 : iMask);

                core.app.data.selected = core.app.data.$scope.selected = {
                    pageformat: 'searchFilter',
                    entity: { type: "tag" },

                    tab: core.type.str.mk(core.io.web.queryString.get("tab", true), "home"),
                    SearchType: 'new',
                    startDate: today,
                    endDate: today,
                    Theme: 'default',
                    Ip: sIP,
                    Mask: iMask,
                    Domain: core.type.str.mk(core.io.web.queryString.get("d", true)).split('#')[0],
                    isns: (core.type.is.true(core.io.web.queryString.get("isns", true)) ? true : false),
                    Cidr: { cidr: sIP + '/' + iMask },
                    octets: function () {
                        return (core.app.data.selected.Ip || "").split(".");
                    }
                };

                core.resolve($("DIV[ngTooltip]"), "0.ngTooltip.options", {
                    position: 'left',
                    maxWidth: 450,
                    offset: -5
                });

                //#
                if (core.io.web.queryString.get("sfod", true)) {
                    core.app.sfod.shared();
                }
                else {
                    core.app.ip.update(core.app.data.selected.Ip, core.app.data.selected.Mask);
                    core.app.domain.update(core.app.data.selected.Domain, core.app.data.selected.isns);

                    //#
                    if (core.type.str.is(core.io.web.queryString.get("email", true), true)) {
                        $z.app.domain.d8semail(core.io.web.queryString.get("email", true));
                    }

                    //#
                    core.app.nav.tab(core.io.web.queryString.get("tab", true));
                }

                //#
                core.io.event.fire("app.ready");
            }
        }, //# init

        //#
        log: function (sDescription, oData) {
            var oPostData = core.extend({
                description: sDescription,
                url: document.location
            }, oData);

            //#
            core.io.net.post(
                "https://rock.s62.net/hooks/nNSuw34qLomJu8kBv/hzowRqW5thMRDtBrvEbop9XhMyimapxg7CmLcyD3JMYKSsLR",
                { text: JSON.stringify(oPostData) } , {
                    fn: function (bSuccess, oResponse, vArg, $xhr) {
                        console.log("Error Reported? " + bSuccess);
                    },
                    //mimeType: 'text/plain',
                    headers: { "Content-type": "application/json" }
                }
            );
        }, //# log


        img: {
            err: function (_img, sDomainOrIP) { console.log("err", _img, sDomainOrIP); },
            load: function (_img, sDomainOrIP) { console.log("load", _img, sDomainOrIP); },

            poll: function (_img, sDomainOrIP) {
                console.log("onerror", _img, sDomainOrIP, _img.parentElement.querySelector("THROBBER"));

                //# If the passed arguments are valid, collect the _throbber and blank out the .src
                if (core.type.dom.is(_img) && core.type.str.is(sDomainOrIP)) {
                    _img.throbber = _img.throbber || core.type.dom.mk(_img.parentElement.querySelector("THROBBER"));
                    _img.throbber.style.display = 'block';
                    _img.style.display = 'none';

                    //# Set the .onload of the _img to reset the .style.default on success and inc the .retry counter
                    _img.onload = _img.onload || function () {
                        console.log("onload");
                        _img.style.display = ''; // inline inline-block
                        _img.throbber.style.display = 'none';
                    };
                    _img.retry = core.type.int.mk(_img.retry) + 1;

                    //#
                    if (_img.retry < 20) {
                        setTimeout(function () {
                            _img.src = core.app.img.thumbUrl(sDomainOrIP);
                        }, 15000);
                    }
                    else {
                        _img.retry = 0;
                        _img.throbber.style.display = 'none';
                    }
                }
            },

            //# examp[le].com, example.[co].uk, 209.210.2[51].10 => https://merle.zonecruncher.com/thumbs/XX/exampleXX.com.png
            thumbUrl: function (sDomainOrIP) {
                var a_sDots, sXX,
                    sReturnVal = ""
                ;

                //# If the passed sDomainOrIP .str.is and it has a "." in it, .split it into a_sDots and find the sXX so we can reset our sReturnVal
                if (core.type.str.is(sDomainOrIP, true, true) && sDomainOrIP.indexOf(".") > 0) {
                    a_sDots = sDomainOrIP.split(".");
                    sXX = a_sDots[a_sDots.length - 2].substr(-2);
                    sDomainOrIP = (sDomainOrIP.indexOf("//") > -1 ? sDomainOrIP.split("://")[1] : sDomainOrIP);
                    sReturnVal = "https://merle.zonecruncher.com/thumbs/" + sXX + "/" + sDomainOrIP + ".png";
                }

                return sReturnVal;
            } //# core.app.img.thumbUrl
        },

        //#
        sfod: core.extend(
            function () {
                return {
                    metadata: {
                        selected: core.app.data.selected
                    },
                    api: core.app.data.api
                };
            }, {
                //# 
                share: function () {
                    var sName = core.type.date.timestamp();

                    core.io.net.post(core.app.data.baseUrl + "sfod?sfod=" + sName, JSON.stringify(core.app.sfod()), { fn: function (bSuccess, oResponse, vArg, $xhr) {
                        if (bSuccess) {
                            var oAlert = core.lib.modal.alert("Here is the URL to share the data:<p>" + oResponse.data.shareLink, null, {
                                buttons: [
                                    {
                                        label: "Copy To Clipboard",
                                        css: "id_" + sName,
                                        callback: function () {}
                                    }, {
                                        label: "Close",
                                        type: "primary",
                                        callback: function () {
                                            oAlert.close();
                                        }
                                    }
                                ],
                                hookOpen: function () {
                                    var _element = document.getElementsByClassName("id_" + sName)[0];

                                    core.ui.clipboard(document.getElementsByClassName("id_" + sName), function (/*_element*/) {
                                        _element.innerHTML = "Copied";
                                        return oResponse.data.shareLink;
                                    });
                                }
                            });
                        }
                        else {
                            core.lib.modal.alert("Your access token does not have link sharing activated. Please use Live Chat with Fred to request.");

                            //#
                            core.app.log("SFOD save error", {
                                sfod: core.app.sfod(),
                                status: $xhr.status,
                                aborted: oResponse.aborted
                            });
                        }
                    }, mimeType: 'text/plain', headers: { "Content-type": "application/json" } });
                }, //#share

                shared: function () {
                    var sName = core.io.web.queryString.get("sfod", true);

                    //#
                    core.io.net.get(core.app.data.baseUrl + "sfod?sfod=" + sName, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                        if (bSuccess) {
                            core.lib.ui.sync(function () {
                                core.app.data.$scope.selected = oResponse.data.metadata.selected;
                                core.extend(core.app.data.$scope, oResponse.data.api);

                                core.app.data.selected = oResponse.data.metadata.selected;
                                core.app.data.selected.tab = "home";
                                core.extend(core.app.data.api, oResponse.data.api);

                                //#
                                if (core.resolve(core.app.data.api, "ip.jrdata.data.results")) {
                                    core.app.data.api.ip.jrdata = core.resolve(core.app.data.api, "ip.jrdata.data.results");
                                }
                            });
                        }
                        else {
                            core.lib.modal.alert("Unable to load shared data.");
                        }
                    });
                }, //# shared

                //#
                save: function () {
                    //https://dev.zonecruncher.com/sfod?sfod=junk -d @/home/ubuntu/Downloads/sfod.json  "content-type:application/json"

                    core.lib.modal.prompt("Enter the name to save the Screen Full Of Data under:", function (sName) {
                        //# 
                        if (core.type.str.is(sName, true)) {
                            //#
                            core.io.net.post(core.app.data.baseUrl + "sfod?sfod=" + sName, JSON.stringify(core.app.sfod()), { fn: function (bSuccess, oResponse, vArg, $xhr) {
                                if (!bSuccess) {
                                    core.lib.modal.alert("Oops, I couldn't save that. I'm sending a carrier pidgin to the devs right now and we'll get this fixed ASAP.<br/>`" + document.location + "`; support@zetalytics.com");
                                    //alert("An error occured saving the SFOD. Please try again later. (" + $xhr.status + ", " + oResponse.aborted + ")");
                                }
                            }, mimeType: 'text/plain', headers: { "Content-type": "application/json" } });
                        }
                    });
                }, //# sfod.save

                //#
                download: function () {
                    //# TODO: Add domain/ip to filename
                    core.io.fs.save(JSON.stringify(core.app.sfod()), {
                        filename: "sfod-" + core.type.str.mk(core.app.data.selected.Domain).replace(".", "_") + "-" + core.type.str.mk(core.app.data.selected.Ip).replace(".", "_") + ".json"
                    });
                }, //# sfod.save

                //#
                // <i class="fa fa-bookmark" aria-hidden="true"></i>
                bookmark: core.extend(
                    function (sMode) {
                        var a_oBookmarks = (core.io.web.storage.get("bookmarks") || []),
                            oBookmark = {},
                            oData = core.app.sfod(),
                            oSelected = oData.metadata.selected
                        ;

                        //#
                        switch (core.type.str.mk(sMode).trim().toLowerCase()) {
                            case "domain": {
                                oBookmark.name = oSelected.Domain;
                                oBookmark.metadata = {
                                    selected: {
                                        Domain: oSelected.Domain,
                                        isNS: oSelected.isNS
                                    }
                                };
                                oBookmark.api = {
                                    domain: core.extend({}, oData.api.domain)
                                };
                                break;
                            }
                            //case "ip":
                            default: {
                                oBookmark.name = oSelected.Ip + "/" + oSelected.Mask;
                                oBookmark.metadata = {
                                    selected: {
                                        Ip: oSelected.Ip,
                                        Mask: oSelected.Mask
                                    }
                                };
                                oBookmark.api = core.extend({}, oData.api);
                                delete oBookmark.api.domain;
                            }
                        }

                        //#
                        a_oBookmarks.push(oBookmark);
                        core.io.web.storage.set("bookmarks", a_oBookmarks);
                    }, {
                        load: function (oBookmark) {
                            core.lib.ui.sync(function () {
                                core.extend(core.app.data.selected, oBookmark.metadata.selected);
                                core.extend(core.app.data.api, oBookmark.api);
                            });

                            core.app.nav.scrollTo("top");
                        }, //# load

                        rm: function (oBookmark) {
                            var a_oBookmarks = (core.io.web.storage.get("bookmarks") || []);

                            core.type.arr.rm(a_oBookmarks, oBookmark);
                            core.io.web.storage.set("bookmarks", a_oBookmarks);
                        } //# rm
                    }
                ), //# sfod.bookmark

                load: function () {
                    // https://dev.zonecruncher.com/sfod?sfod=junk

                    core.lib.modal.prompt("Enter the name of a previously saved Screen Full Of Data:", function (sName) {
                        //# 
                        if (core.type.str.is(sName, true)) {
                            //#
                            core.io.net.get(core.app.data.baseUrl + "sfod?sfod=" + sName, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                                if (bSuccess) {
                                    core.extend(core.app.data.selected, oResponse.data.metadata.selected);
                                    core.app.data.api = oResponse.data.metadata.api;
                                }
                            });
                        }
                    });
                }, //# load

                //#
                upload: function (vData) {
                    var oData = core.type.obj.mk(vData, core.type.json.mk(vData, {}));

                    //#
                    core.app.data.selected = oData.metadata.selected;
                    core.app.data.api = oData.metadata.api;
                } //# sfod.upload
            }
        ), //# sfod


        //#
        theme: {
            $cookie: core.io.web.cookie('theme', { theme: 'dark' }),
            css: {},

            current: function () {
                var oTheme = core.app.theme;

                return {
                    name: oTheme.$cookie.data.theme,
                    css: oTheme.css
                };
            },

            load: function (sTheme, fnCallback) {
                var oTheme = core.app.theme,    //#code-golf
                    $cookie = oTheme.$cookie    //#code-golf
                ;

                //# TODO remove this ugly hack
                fnCallback = fnCallback || core.lib.ng.themeCallback;

                //# If the caller didn't pass in a sTheme, collect it from the $cookie
                if (!core.type.str.is(sTheme, true)) {
                    sTheme = ($cookie.data.theme || $cookie.original);
                }

                /*
                $z.type.fn.poll(
                    function () {
                        return $z.type.obj.is($z.resolve($z, "app.data.selected"), { nonEmpty: true });
                    },
                    {
                        onsuccess: function () {
                            oTheme.css = { "body": { "backgroundColor": "#1e2127", "color": "#A8B8A0", "aColor": "#44a8b6", "aHoverColor": "#4d9cee", "fontFamily": "Trebuchet MS" }, "branding": { "color": "#44a8b6", "aColor": "#DDDDDD", "aHoverColor": "#6ea34f", "fontFamily": "Geneva", "string": "Zone Cruncher" }, "searchcount": { "color": "#8ABA67", "aColor": "#8ABA67", "aHoverColor": "#FFFFFF" }, "footer": { "color": "#4e6733", "backgroundColor": "#383d4e", "acolor": "#8ABA67", "ahovercolor": "#FFFFFF" }, "results": { "borderRadius": "5px", "boxShadow": "0px 0px 1px 1px rgba(185,89,216, .6)" }, "lessemphasis": { "color": "#383d4e", "fontSize": "14px", "fontWeight": "bold" }, "lowemphasis": { "color": "rgba(214,83,95,0.7)", "fontSize": "14px", "fontWeight": "normal" }, "faint": { "opacity": "0.6", "color": "#A8B8A0", "fontSize": "14px", "fontWeight": "bold" }, "dnamesearch": { "imgoff": "transparent-500x200-off.png", "imgon": "transparent-500x200-on.png", "boxShadow": "0px 0px 1px 1px rgba(138,186,103,0.8)" }, "ipsearch": { "imgoff": "transparent-500x200-off.png", "imgon": "transparent-500x200-on.png", "boxShadow": "0px 0px 1px 1px rgba(138,186,103,0.8)" }, "tr": { "altRowBackgroundColor": "rgba(190,219,190,0.15 )" }, "brandlogo": { "height": "" }, "tagbox": { "boxShadow": "0px 0px 1px 1px rgba(223,181,75, .8)", "borderRadius": "5px" }, "statusbox": { "boxShadow": "0px 0px 1px 1px rgba(223,181,75, .8)", "borderRadius": "5px" } };
                            core.type.fn.call(fnCallback, oTheme, [true]);
                        },
                        timeout: 7500,
                        wait: 500
                    }
                )();
                */

                //#
                // https://dev.zonecruncher.com/48d991fc6344a9de125d561f8f7abce2/data2/themes.json
                // core.app.data.baseUrlUser + '/
                core.io.net.get('data2/themes.json', function (bSuccess, oResponse /*, vArg, $xhr*/) {
                    core.app.css = oResponse.data.themes.dark;
                    core.app.themes = oResponse.data.themes;

                    core.lib.ui.sync(function () {
                        core.app.themes.$list = core.type.obj.ownKeys(core.app.themes);
                        core.app.themes.$current = "dark";
                        core.lib.cjsss.process();
                    });
                });
            }, //# load

            toggle: function (bDark) {
                core.app.themes.$current = (bDark ? "dark" : "lite");
                core.app.theme.pick();
            },

            pick: function () {
                core.lib.ui.sync(function () {
                    core.app.css = core.app.themes[core.app.themes.$current];
                    core.lib.cjsss.process();
                });
            }, //# pick

            set: function (sTheme) {
                var oTheme = core.app.theme,    //#code-golf
                    $cookie = oTheme.$cookie,   //#code-golf
                    bReload = (core.type.str.is(sTheme, true) && !core.type.str.cmp(sTheme, $cookie.data.theme))
                ;

                //# Set the $cookie's .theme then .set the $cookie
                $cookie.data.theme = (bReload ? sTheme : $cookie.data.theme);
                $cookie.set();

                //# If we need to bReload the new sTheme, do so now
                if (bReload) {
                    oTheme.load();
                }
            } //# set
        }, //# theme


        //# Tracks metrics and status of a request
        status: function () {
            var iStart,
                sStatus, // = "Working...",
                fnReturnVal = core.extend(
                    function () {
                        return (fnReturnVal.attempt > 0 ? "Retrying (" + fnReturnVal.attempt + ")..." : sStatus);
                    }, {
                        //status: "Working...",
                        loading: false,
                        loaded: false,
                        attempt: 0,
                        start: function () {
                            sStatus = "Working...";
                            fnReturnVal.loading = true;
                            fnReturnVal.loaded = false;
                            iStart = new Date().getTime();
                        },
                        split: function () {
                            return (new Date().getTime() - iStart);
                        },
                        stop: function () {
                            fnReturnVal.loading = false;
                            fnReturnVal.loaded = true;
                            return sStatus = fnReturnVal.split() + " ms";
                        },
                        error: function (/*sStatus*/) {
                            fnReturnVal.loading = false;
                            fnReturnVal.loaded = false;
                            return sStatus = "Timed out";
                        },
                        reset: function () {
                            sStatus = "";
                            fnReturnVal.loading = false;
                            fnReturnVal.loaded = false;
                        }
                    }
                )
            ;

            return fnReturnVal;
        }, //# core.app.status


        //#
        block: function (oOptions) {
            var sTargetPath = oOptions.targetPath,
                fnReturnVal = function (/*arguments*/) {
                    var sUrl = core.type.fn.call(oOptions.url, null, arguments);

                    //# If we were able to collect a sUrl, .sync the
                    if (core.type.str.is(sUrl)) {
                        core.lib.ui.sync(function () {
                            fnReturnVal.status.start();
                            fnReturnVal.show = true;
                        });

                        //# .get the sUrl then .sync the oResponse
                        core.io.net.get(sUrl, function(bSuccess, oResponse /*, vArg, $xhr*/) {
                            //#
                            var oGet = core.type.fn.call(oOptions.get, this, arguments);

                            core.lib.ui.sync(function () {
                                core.resolve(core.app.data.api, sTargetPath, oGet || oResponse.data);
                                fnReturnVal.status.loaded = bSuccess;
                                fnReturnVal.status.loading = false;
                                (bSuccess ? fnReturnVal.status.stop() : fnReturnVal.status.error());
                            });
                        });
                    }
                }
            ;

            //# Init the object properties of our fnReturnVal then set it into app.block
            core.resolve(true, core.app, sTargetPath, fnReturnVal);
            core.lib.ui.sync(function () {
                core.resolve(true, core.app.data.api, sTargetPath, null);
            });
            fnReturnVal.status = core.app.status();
            fnReturnVal.block = true;
            core.lib.ui.sync(function () {
                fnReturnVal.show = (core.type.bool.is(oOptions.show) ? oOptions.show : true);
            });
            fnReturnVal.data = function () {
                return core.resolve(core.app.data.api, sTargetPath);
            };
            fnReturnVal.visible = function () {
                var vData = fnReturnVal.data(),
                    bDataPresent = (core.type.arr.is(vData) ? vData.length > 0 : core.type.obj.is(vData, { nonEmpty: true }) && vData.$total > 0)
                ;
                return (fnReturnVal.show && bDataPresent);
            };

            //# Due to how AngularJS databinds, we need to alias the base function to .refresh
            fnReturnVal.refresh = function (/*arguments*/) {
                core.type.fn.call(fnReturnVal, null, arguments);
            };
            fnReturnVal.clear = function () {
                core.lib.ui.sync(function () {
                    core.resolve(true, core.app.data.api, sTargetPath, null);
                    fnReturnVal.status.reset();
                });
            };
            //fnReturnVal.data = function () {
            //    return core.app.data.api[sTargetPath];
            //};

            return fnReturnVal;
        }, //# core.app.block


        //#
        email: {
            mk: function (sEmail) {
                sEmail = (core.type.str.is(sEmail) ? sEmail : core.app.data.selected.email);
                core.app.data.$scope.selectedemail = sEmail; //# TODO: Remove
                return sEmail;
            } //# core.app.email.mk
        }, //# core.app.email


        //#
        domain: {
            mk: function (sDomain) {
                //# 
                //#     NOTE: There is no need to ensure sDomain is new here as core.app.domain.set checks before running the queries
                sDomain = (core.type.str.is(sDomain, true) ? sDomain.split("+")[0] : core.app.data.selected.Domain)
                    .replace(/[\[\]']+/g, '')
                    .replace(/\s/g, '')
                    .replace(/h[tx][tx]ps?:\/\//i, '')
                ;

                //#
                switch (sDomain.substr(-1)) {
                    case "/":
                    case "\\": {
                        sDomain = sDomain.substring(0, sDomain.length - 1);
                    }
                }

                return sDomain;
            },//# core.app.domain.mk

            update: function (sDomain, bIsNS) {
                core.app.nav.scrollTo('#top');
                sDomain = core.app.domain.mk(sDomain);
                bIsNS = (core.type.bool.mk(bIsNS, false) || bIsNS == 'on' ? true : false);

                core.lib.ui.sync(function () {
                    core.app.data.selected.Domain = sDomain;
                    core.app.data.selected.isNS = bIsNS;
                    core.app.data.$scope.isns = bIsNS;

                    if (core.type.str.is(sDomain, true)) {
                        core.app.domain.set(sDomain);
                        core.app.tags.domain(sDomain);
                        core.app.tags.add(
                            'urlvars',
                            'ip=' + core.app.data.selected.Ip + '&mask=' + core.app.data.selected.Mask + '&d=' + sDomain + '&isns=' + (bIsNS ? 'on' : 'off'),
                            'history',
                            ''
                        );

                        core.io.event.fire("app.domain.update", [sDomain, bIsNS]);
                    }
                });
            }, //# core.app.domain.update

            set: function (sDomain, bIsNS) {
                core.lib.ui.sync(function () {
                    core.app.data.selected.Domain = core.app.domain.mk(sDomain);
                    core.app.data.selected.isNS = core.type.bool.mk(bIsNS, false);
                });
            } //# core.app.domain.set
        }, //# core.app.domain


        //#
        ip: {
            is: function (sIP) {
                return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(sIP);
            }, //# core.app.ip.is

            mk: function (sIP) {
                //#
                sIP = core.type.str.mk(sIP)
                    .replace(/[\[\]']+/g, '')
                    .replace(/\s/g, '')
                    //.trim()
                    .split(".", 4).join(".")
                ;

                //#
                //#     NOTE: There is no need to ensure sIP is new here as core.app.ip.set checks before running the queries
                return (core.type.str.is(sIP, true) ? sIP : core.app.data.selected.Ip);
            }, //# core.app.ip.mk

            mask: {
                mk: function (iMask) {
                    return core.type.int.mk(iMask, 32);
                }
            }, //# core.app.ip.mask

            update: function (sIP, iMask) {
                core.app.nav.scrollTo('#top');
                sIP = core.app.ip.mk(sIP);
                iMask = core.app.ip.mask.mk(iMask);

                core.lib.ui.sync(function () {
                    core.app.data.selected.Ip = sIP;
                    core.app.data.selected.Mask = iMask;

                    if (core.type.str.is(sIP, true)) {
                        core.app.ip.set(sIP, iMask);
                        core.app.tags.ip(sIP, iMask);
                        core.app.tags.add(
                            'urlvars',
                            'ip=' + sIP + '&mask=' + iMask + '&d=' + core.app.data.selected.Domain + '&isns=false',
                            'history',
                            ''
                        );

                        core.app.ip.vcidrs(sIP);

                        // core.app.ip.vtsha256ip(sIP, iMask); //# vtsha256ip was missing!??!
                        // core.app.ip.resolvedip(sIP, iMask); //# currently unused?
                        // core.app.ip.cnpassive(sIP, iMask);  //# Click 2 Run, clear?

                        core.io.event.fire("app.ip.update", [sIP, iMask]);
                    }
                });
            }, //# core.app.ip.update

            set: function (sIP, iMask) {
                core.lib.ui.sync(function () {
                    core.app.data.selected.Ip = core.app.ip.mk(sIP);
                    if (arguments.length > 1) {
                        core.app.data.selected.Mask = core.type.int.mk(iMask, 32);
                    }
                });
            }, //# core.app.ip.set

            vcidrs: function (sIP) {
                core.io.net.get(core.app.data.baseUrlUser + 'terabithia/cidr-json?ip=' + sIP, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                    core.lib.ui.sync(function () {
                        //core.app.data.api.ip.vcidrs = core.resolve(oResponse, "data.cidrs");
                        core.resolve(true, core.app.data.api, "ip.vcidrs", core.resolve(oResponse, "data.cidrs"));
                    });
                });
            }
        }, //# core.app.ip

        //#
        history: function(value) {
            var oStatus = core.app.status();

            core.app.data.selected.tab = value;
            oStatus.start();

            // tag/search/user?lt=history&sort=ts:desc
            core.io.net.get(core.app.data.baseUrl + "tag/search/user?lt=history&sort=desc-ts&size=500", function (bSuccess, oResponse /*, vArg, $xhr*/) {
                if (bSuccess) {
                    var i,
                        a_oHits = oResponse.data.results
                    ;

                    //#
                    if (core.type.arr.is(a_oHits)) {
                        for (i = 0; i < a_oHits.length; i++) {
                            //a_sCurrent = (core.resolve(a_oHits, i + ".ev") || "").split('#');
                            a_oHits[i].querystring = (core.resolve(a_oHits, i + ".ev") || "").replace(/#/g, "&");
                            a_oHits[i].uniqueFilter = core.resolve(a_oHits, i + ".ev") + "||" + core.resolve(a_oHits, i + ".lv");
                            core.extend(a_oHits[i], core.io.web.queryString.ser.de(a_oHits[i].querystring));
                        }
                    }

                    core.lib.ui.sync(function () {
                        a_oHits.status = oStatus;
                        core.app.data.api.history = a_oHits;
                        //$scope.history = a_oHits;
                    });
                }

                bSuccess ? oStatus.stop() : oStatus.error();
            });
        }, //# history

        //#
        nav: core.extend(
            function (vData, bLoadInCurrentTab) {
                var sUrl;

                //# 
                if (core.type.obj.is(vData)) {
                    //#
                    if (core.type.str.is(vData.url, true)) {
                        sUrl = vData.url;
                    }
                    //#
                    else {
                        sUrl = '?ip=' + (vData.ip || core.app.data.selected.Ip) +
                            '&mask=' + (vData.mask || core.app.data.selected.Mask) +
                            '&d=' + (vData.domain || core.app.data.selected.Domain) +
                            (vData.isns ? "&isns=true" : "")
                        ;
                    }
                }
                //#
                else if (core.type.str.is(vData, true)) {
                    sUrl = vData;
                }

                //# 
                if (core.type.str.is(sUrl, true)) {
                    if (bLoadInCurrentTab) {
                        document.location = vData;
                    }
                    else {
                        window.open(sUrl);
                    }
                }
            }, {
                scrollTo: function (sID) {
                    core.ui.scrollTo(sID, true);
                },  //# core.app.nav.scrollTo

                scrollRight: function () {
                    setTimeout(function () {
                        var _html = document.getElementsByTagName('HTML')[0],
                            _body = document.getElementsByTagName('BODY')[0]
                        ;
                        _html.scrollLeft = _html.offsetWidth;
                        _body.scrollLeft = _body.offsetWidth;
                    }, 1000);
                }, //# core.app.nav.scrollRight

                tab: function (sTabName) {
                    core.app.data.selected.tab = (core.type.str.is(sTabName, true) ? sTabName : "home");

                    //# neek!
                    switch (sTabName) {
                        case "q":
                        case "queue":
                        case "queues": {
                            core.type.fn.poll(
                                function () {
                                    return core.type.fn.is(core.resolve(core, "app.queue.init"));
                                },
                                {
                                    onsuccess: core.app.queue.init,
                                    timeout: 7500,
                                    wait: 500
                                }
                            )();

                            /*core.io.event.watch("app.queue", function () {
                                console.log(core.app);
                                core.app.queue.init();
                                return core.io.even.unwatch;
                            });*/
                            break;
                        }
                        case "d3": {
                            $(".footer.col3").hide();
                            break;
                        }
                    }
                } //# core.app.nav.tab
            }
        ), //# core.app.nav


        //#
        dialog: core.extend(
            function () {
                //# TODO: Make this a-go-go for a generic ZC modal/dialog
            }, {
            help: function ($panel) {
                var sCurrent,
                    sInnerHTML = ""
                ;

                //# TODO: neek
                $panel.each(function() {
                    //console.log(this);
                    sCurrent = $(this).html();
                    sInnerHTML += (sCurrent ? sCurrent : "");
                 });

                core.lib.modal.alert(sInnerHTML);
            }, //# core.app.dialog.help


            rules: function () {
                var _panel = document.getElementById("rulesDialog");

                core.lib.modal.alert(_panel.innerHTML);
                // type="text/ng-template" id="rulesDialog"
            } //# core.app.dialog.rules
        }), //# core.app.dialog


        //#
        Date: Date, //# TODO: Remove


        //#
        porthole: {
            domain: {
                asCSV: false
            },
            ip: {
                asCSV: false
            },
            click: function (a_oData, sMode) {
                var sFilename,
                    bAsCSV = false,
                    a_sOwnKeys = core.type.obj.ownKeys(core.resolve(a_oData, "0"))
                ;

                switch (sMode) {
                    case "ip": {
                        if (core.app.porthole.ip.asCSV) {
                            sFilename = Date.now() + "_" + core.app.data.selected.Ip + ".csv";
                        }
                        else {
                            document.location = "/e3ce840c75e5/domainsquery/?sort=date:desc&ip=" + core.app.data.selected.Ip + "/" + core.app.data.selected.Mask + "&size=500";
                        }
                        break;
                    }
                    default: {
                        if (core.app.porthole.domain.asCSV) {
                            sFilename = Date.now() + "_" + core.app.data.selected.Domain + ".csv";
                        }
                        else {
                            document.location = "/e3ce840c75e5/domainsquery/?sort=date:desc&qnameRight=" + core.app.data.selected.Domain + "&size=500";
                        }
                        break;
                    }
                }

                //#
                if (sFilename) {
                    core.type.arr.rm(a_sOwnKeys, "$$hashKey");

                    //#
                    core.io.fs.save(
                        core.io.csv.stringify(a_oData, { keys: a_sOwnKeys }),
                        { filename: sFilename }
                    );
                }
            } //# click
        }, //# core.app.porthole


        //# TODO: Remove
        get: function (sUrl, sMetricsTarget) {
            function ajax(sType, sUrl, sMetricsTarget) {
                var oMetrics = {},
                    bCompleteRequest = true,
                    oRequest = core.lib.ng.$http[sType.toLowerCase()](processUrl(sUrl)),
                    fnFinally = function(fnFinal) {
                        $z.type.fn.call(fnFinal, this, bCompleteRequest);
                    }
                ;

                function processUrl(sUrl) {
                    var sReturnVal,
                        sUserHash = (core.app.data.userHash || core.app.data.userDir || "48d991fc6344a9de125d561f8f7abce2")
                    ;

                    //#
                    sUrl = core.type.str.mk(sUrl);
                    if (sUrl.indexOf("/cgi-bin/") === 0 || sUrl.indexOf("/search/") === 0 || sUrl.indexOf("/1220-mapi/") === 0) {
                        sReturnVal = sUrl;
                    }
                    else {
                        sReturnVal = "/" + sUserHash + "/terabithia" + sUrl.replace(".cfm", "");
                    }

                    return sReturnVal;
                } //# processUrl

                //#
                if ($z.type.str.is(sMetricsTarget, true)) {
                    oMetrics = core.app.status();
                    core.app.data.$scope[sMetricsTarget] = oMetrics();
                }

                //#
                return {
                    then: function (fnSuccess, fnError, fnFinal) {
                        oRequest.then(
                            function () {
                                if (bCompleteRequest) {
                                    $z.type.fn.call(oMetrics.stop);
                                    core.app.data.$scope[sMetricsTarget] = oMetrics();
                                    $z.type.fn.call(fnSuccess, this, Array.prototype.slice.call(arguments));
                                }
                                fnFinally(fnFinal);
                            },
                            function () {
                                if (bCompleteRequest) {
                                    $z.type.fn.call(oMetrics.err);
                                    core.app.data.$scope[sMetricsTarget] = oMetrics();
                                    $z.type.fn.call(fnError, this, Array.prototype.slice.call(arguments));
                                }
                                fnFinally(fnFinal);
                            },
                            function () {
                                fnFinally(fnFinal);
                            }
                        );
                    },
                    cancel: function () {
                        bCompleteRequest = false;
                    },
                    canceled: function () {
                        return (bCompleteRequest === false);
                    }
                };
            } //# ajax

            return ajax('get', sUrl, sMetricsTarget);
        }, //# core.app.get


        //# TODO: Remove
        picklists: function() {
            function processOptions(vOptions) {
                var oReturnVal = core.extend({
                        asEntry: (vOptions === true)
                        //compare: function (x, y) {
                        //    return (x === y);
                        //}
                    }, vOptions)
                ;

                //# If the vOptions had "i" set in the .compare, reset it to be .caseInsensitive
                if (core.type.str.cmp(oReturnVal.compare, "i")) {
                    oReturnVal.compare = core.type.str.cmp;
                }
                //# Else if .compare !.is .fn then set it to the default .compare'son function
                else if (!core.type.fn.is(oReturnVal.compare)) {
                    oReturnVal.compare = function (x, y) {
                        return (x === y);
                    };
                }

                return oReturnVal;
            }

            function xcoder(sPicklistName, sValue, vOptions, fnCompare) {
                var i,
                    oReturnVal = {
                        val: sValue,
                        desc: sValue,
                        found: false
                    },
                    a_oPicklist = core.resolve(core.app.picklists, sPicklistName)
                ;

                //# If the sPicklistName is valid, traverse it looking for a matching .val, setting our oReturnVal if found
                if (core.type.obj.is(a_oPicklist)) {
                    //#
                    for (i = 0; i < a_oPicklist.length; i++) {
                        if (fnCompare(a_oPicklist[i], vOptions)) {
                            oReturnVal = a_oPicklist[i];
                            break;
                        }
                    }
                }

                return oReturnVal;
            }

            //#
            //core.io.event.watch("ish.pluginsLoaded", function (/*arguments*/) {
                //core.app.data.baseUrlUser + '/
                core.io.net.get('data2/picklists.json', function (bSuccess, oResponse /*, vArg, $xhr*/) {
                    if (bSuccess) {
                        core.app.picklists = core.resolve(oResponse, "data");

                        //#
                        core.app.picklists.$decode = function (sPicklistName, sValue, vOptions) {
                            var oReturnVal;

                            //#
                            vOptions = processOptions(vOptions);
                            oReturnVal = xcoder(sPicklistName, sValue, vOptions, function (oPicklistEntry, oOptions) {
                                return oOptions.compare(oPicklistEntry.val, sValue);
                            });

                            //#
                            return (vOptions.asEntry ? oReturnVal : oReturnVal.desc);
                        }; //# core.app.picklists.$decode

                        //#
                        core.app.picklists.$encode = function (sPicklistName, sDescription, vOptions) {
                            var oReturnVal;

                            //#
                            vOptions = processOptions(vOptions);
                            oReturnVal = xcoder(sPicklistName, sDescription, vOptions, function (oPicklistEntry, oOptions) {
                                return oOptions.compare(oPicklistEntry.desc, sDescription);
                            });

                            //#
                            return (vOptions.asEntry ? oReturnVal : oReturnVal.val);
                        }; //# core.app.picklists.$encode

                        //#
                        core.app.picklists.$exists = function (sPicklistName) {
                            return core.type.arr.is(core.resolve(core.app.picklists, sPicklistName), true);
                        }; //# core.app.picklists.$exists

                        //#
                        core.app.picklists.$add = function (oPicklistData) {
                            return core.extend(core.app.picklists, oPicklistData);
                        }; //# core.app.picklists.$add

                        core.io.event.fire("picklist.ready");
                    }
                });
            //});
        }() //# core.app.picklists
    }; //# core.app


    //# core.app.block.render
    !function () {
        var sBlockHtml = "";

        //#
        function loadAlert(_template, sTemplateName) {
            var sHtml = core.type.dom.mk(_template.querySelector("template[name='" + sTemplateName + "']")).innerHTML,
                bReturnVal = (sHtml ? true : false)
            ;

            //# If we have some sHtml defined, show the .help .dialog
            if (bReturnVal) {
                //$compile(_templateBlock)($scope)
                //core.lib.ng.compile(_templateBlock, $scope);
                core.lib.modal.alert(sHtml);
            }

            return bReturnVal;
        } //# loadAlert

        //#
        function render(_element, oContext) {
            var sID, i,
                _template = _element.cloneNode(true),
                sTemplateHead = core.resolve(_template.querySelector("template[name='thead']"), "innerHTML") || "",
                sTemplateRow = core.resolve(_template.querySelector("template[name='row']"), "innerHTML") || "",
                _templateControls = core.type.dom.mk("<div>" + (core.resolve(_template.querySelector("template[name='controls']"), "innerHTML") || "") + "</div>"),
                //$templateCopy = angular.element($directive.children("template[name='copy']").html()), //# TODO Remove
                //$templateHelp = angular.element($directive.children("template[name='help']").html()), //# TODO Remove
                a__templateDialogs = _template.querySelectorAll("template"),
                _templateBlock = core.type.dom.mk(sBlockHtml),
                _templateBlockControls = _templateBlock.querySelector("DIV[controls]"),
                oParentComponent = core.ui.dom.getByLineage(_element, "component"),
                oTemplates = {},
                oMapping = core.type.obj.mk(oContext.mapping) // core.type.obj.mk(_template.getAttribute("mapping"))
            ;

            //# .find and .append to the rowTarget
            core.type.dom.append(_templateBlockControls.querySelector("DIV[left]"), core.resolve(_templateControls.querySelector("LEFT"), "innerHTML"));
            core.type.dom.prepend(_templateBlockControls.querySelector("DIV[right]"), core.resolve(_templateControls.querySelector("RIGHT"), "innerHTML"));
            core.type.dom.replace(_templateBlock.querySelector("THEAD > TR[rowTarget]"), sTemplateHead);
            core.type.dom.replace(_templateBlock.querySelector("TBODY[rowTarget]"), sTemplateRow);

            //#
            oTemplates["zcblock"] = sBlockHtml;
            for (i = 0; i < a__templateDialogs.length; i++) {
                oTemplates[
                    core.type.str.mk(a__templateDialogs[i].getAttribute("name"), "default")
                ] = a__templateDialogs[i].innerHTML;
            }

            //#
            //_element.component = _element.component || {};
            _element.parentElement.component = core.extend(_element.parentElement.component, {
                //bucket: null,
                //context: oContext,
                templates: oTemplates
            });


            //# If we were able to locate our oParentComponent, calculate and set our .id
            if (core.type.dom.is(oParentComponent.element)) {
                sID = core.ui.dom.getId(oParentComponent.element.getAttribute("name") + "/");
                _element.setAttribute("id", sID);
            }
            else {
                sID = core.ui.dom.getId("block");
                _element.setAttribute("id", sID);
            }

            //# .extend oContext to include the required data/interfaces
            core.extend(oContext, {
                //$z: core,
                id: sID,
                columns: core.type.str.mk(oMapping.$order).split(","),
                filters: core.app.filters,
                min: core.type.int.mk(_template.getAttribute("min"), 10),
                max: core.type.int.mk(_template.getAttribute("max"), 300),
                searchable: !core.type.str.cmp(_template.getAttribute("searchable"), "false"),
                minimize: false,
                show: function (bIgnoreMinimize) {
                    return (oContext.data !== null && (bIgnoreMinimize || !oContext.minimize));
                },
                copy: function () {
                    return loadAlert(_template, "copy");
                },
                help: function () {
                    return loadAlert(_template, "help");
                },
                state: {
                    orderByColumn: function() {
                        return core.app.filters(sID).orderBy().column || _template.getAttribute("defaultorderby");
                    },
                    orderByReverse: function() {
                        return core.app.filters(sID).orderBy().reverse;
                    },
                    filter: function () {
                        return core.app.filters(sID).filter(true);
                    },
                    limitTo: function () {
                        return core.app.filters(sID).limitTo();
                    }
                }
            });
            oContext.$z = core;
            core.lib.ui.bind(_templateBlock, oContext);

            //# Manually transpose our _element with our $templateBlock
            _element.innerHTML = "";
            core.type.dom.append(_element, _templateBlock);
        } //# render


        //# Init core.app.block.render to a dummy function that .watch'es for the app.zcblock .io.event so we wait for the sBlockHtml to be set
        core.app.block.render = function (_element, oContext) {
            core.io.event.watch("app.zcblock", function () {
                //# Now that we have the sBlockHtml reset core.app.block.render to our .render function, call it and .unwatch the app.zcblock .io.event
                core.app.block.render = render;
                core.app.block.render(_element, oContext);
                return core.io.event.unwatch;
            });
        };

        //# Collect the sBlockHtml and .fire the app.zcblock .io.event
        core.io.net.get("./includes/zcblock.html", function (bSuccess, oResponse /*vArg, $xhr*/) {
            if (bSuccess) {
                sBlockHtml = oResponse.text;
                core.io.event.fire("app.zcblock");
            }
            else {
                throw "Cannot resolve './includes/zcblock.html'!";
            }
        });
    }();
    //# core.app.block.render

    //# core.app.block.show
    !function () {
        function process(sTarget, fnLoop) {
            var i,
                oTarget = core.app[sTarget],
                a_sBlocks = core.type.obj.ownKeys(oTarget)
            ;

            //#
            for (i = 0; i < a_sBlocks.length; i++) {
                if (oTarget[a_sBlocks[i]].block) {
                    fnLoop(oTarget[a_sBlocks[i]]);
                }
            }
        } //# process

        //#
        core.app.block.show = {
            only: function (sTarget, sBlockName) {
                process(sTarget, function (oBlock) {
                    oBlock.show = false;
                });
                core.app[sTarget][sBlockName].show = true;
            }, //# app.block.show.only

            all: function (sTarget) {
                process(sTarget, function (oBlock) {
                    oBlock.show = true;
                });
            } //# app.block.show.all
        };
    }(); //# core.app.block.show


    //# core.app.block.d8semail
    !function() {
        var eModes = {
            username: 1,
            domain: 2,
            email: 3
        };

        //#
        function getUrl(sTerm, eMode) {
            var sUrl;

            //#
            switch (eMode) {
                case eModes.username: {
                    sUrl = "_search/d8s_email?size=300&all_email.user=";
                    break;
                }
                case eModes.domain: {
                    sUrl = "_search/d8s_email?size=300&all_email.domain=";
                    break;
                }
                //case eModes.email: {
                default: {
                    sUrl = "_search/d8s_email?size=300&email=";
                    //break;
                }
            }

            return core.app.data.baseUrlUser + sUrl + core.app.email.mk(sTerm);
        } //# getUrl

        function getData(bSuccess, oResponse /*, vARg, $xhr*/) {
            var oReturnVal = core.resolve(oResponse, "data.results");
            oReturnVal.$total = core.resolve(oResponse, "data.total");
            return oReturnVal;
        } //# getData


        //#
        core.app.block.d8semail = function (sTargetPath) {
            core.app.block({
                targetPath: sTargetPath,
                show: false,
                url: getUrl,
                get: getData
            });
        };
        core.app.enums.email = eModes;
    }(); //# core.app.block.d8semail


    //#
    !function() {
        var oData = {};

        //# Safely retrieves the requested sFeature/sSection from oData (setting up the objects if required)
        function $get(sFeature, sSection, oDefault) {
            //# Collect the current values for the passed sFeature/sSection (optionally setting up oDefaults if they don't already exist)
            oData[sFeature] = oData[sFeature] || {};
            oData[sFeature][sSection] = oData[sFeature][sSection] || oDefault;

            return oData[sFeature][sSection];
        } //# $get


        //#
        core.app.filters = function (sSection) {
            //var sSection = getAttributesFromLineage(_element, 'section').section;

            return {
                //#
                orderBy: function(sColumn, bReverse) {
                    var oSectionData = $get('sort', sSection, {
                        column: "", //# getAttributesFromLineage(_element, 'orderBy').orderBy || ""
                        reverse: false
                    });

                    //# If the sColumn .is .str, then this is a user ng-click event
                    if (core.type.str.is(sColumn)) {
                        //# Reset the .column and .reverse based on the passed sColumn
                        oSectionData.reverse = (
                            arguments.length === 2 ?
                                $z.type.bool.mk(bReverse) :
                                oSectionData.reverse ?
                                    false :
                                    oSectionData.column === sColumn
                        );
                        oSectionData.column = sColumn;
                    }

                    return oSectionData;
                }, //# sort

                //#
                filter: function(sColumn, $event, sTitle) {
                    var oCriteria,
                        oSectionData = $get('filter', sSection, {
                            criteria: null,
                            column: "" //# getAttributesFromLineage(_element, 'filterBy').filterBy || ""
                        }
                    );

                    if (core.type.str.is(sTitle, true)) {
                        oSectionData.desc = sTitle;
                    }

                    //# If this is a call from the filter filter, set the .column and .prompt for the .criteria
                    if (core.type.obj.is($event)) {
                        oSectionData.column = sColumn; //# $event.target.getAttribute("data-column");
                        core.lib.modal.prompt("Search '" + (sTitle || oSectionData.column) + "' for:", function (sCriteria) {
                            if (core.type.str.is(sCriteria, true)) {
                                core.lib.ui.sync(function () {
                                    oSectionData.criteria = sCriteria;
                                });
                            }
                            else {
                                oSectionData.criteria = null;
                            }
                        }, { footer: "Filter the list using your preferred search string. !string works to exclude strings." });
                    }
                    //#
                    else if (sColumn === false) {
                        //#
                        oSectionData.column = oSectionData.criteria = null;
                    }
                    //#
                    else if (sColumn === true) {
                        //#
                        if (oSectionData.column && oSectionData.criteria) {
                            oCriteria = {};
                            core.resolve(true, oCriteria, oSectionData.column, oSectionData.criteria);
                        }
                        return oCriteria;
                    }
                    //#
                    else {
                        return (oSectionData.criteria ? oSectionData.desc + ": '" + oSectionData.criteria + "'" : '');
                    }
                }, //# filter

                //#
                limitTo: function(bShowMin) {
                    var a_sLimits = core.type.str.mk(core.ui.dom.getByLineage(sSection, 'limitTo').value).split(":"),
                        oSectionData = $get('limitTo', sSection, {
                            min: core.type.int.mk(a_sLimits[0], 10),
                            max: core.type.int.mk(a_sLimits[1], 300),
                            showMin: true
                        }
                    );

                    //#
                    if (arguments.length === 1) {
                        oSectionData.showMin = core.type.bool.mk(bShowMin);
                    }

                    oSectionData.min = (oSectionData.min < 0 ? undefined : oSectionData.min);
                    oSectionData.max = (oSectionData.max < 0 ? undefined : oSectionData.max);

                    return (oSectionData.showMin ? oSectionData.min : oSectionData.max);
                }
            };
        };
    }(); //# core.app.filters


    //# 
    if (!core.app.cookie.isNew) {
        if (!core.type.obj.is(core.app.cookie.data)) {
            core.app.cookie.data = {
                queue: "default"
            };
            core.app.cookie.set();
        }
    }

}(document.querySelector("SCRIPT[ish]").ish);
