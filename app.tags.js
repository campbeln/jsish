!function(core) {
    "use strict"



    function metrics(sTarget) {
        var iStart = new Date().getTime(),
            oReturnVal = {
                split: function () {
                    return (new Date().getTime() - iStart);
                },
                stop: function () {
                    core.app.data.$scope[sTarget] = oReturnVal.split() + " ms";
                },
                err: function (/*sStatus*/) {
                    core.app.data.$scope[sTarget] = "timed out";
                }
            }
        ;

        //#
        core.app.data.$scope[sTarget] = "Working...";
        return oReturnVal;
    }



    core.app.tags = {
        //#
        edit: function(oItem) {
            var sTemplate = core.ui.dom.templateLiteral(function(){/*
                    <div>
                        <textarea ng-model='ngDialogData.lnotes' style='width: 100%; height: 350px;'></textarea>
                        <div>
                            <button ng-click='ngDialogData.save(ngDialogData.lnotes)'>Save</button>
                            <button ng-click='ngDialogData.close()'>Close</button>
                        </div>
                    </div>
                */}),
                oDialog = core.lib.ui.dialog(sTemplate, {
                    data: {
                        lnotes: oItem.lnotes,
                        source: oItem,
                        save: function (sNotes) {
                            oItem.lnotes = sNotes;

                            core.io.net.post(core.app.data.baseUrl + "tag/update", core.extend({}, oItem, { $$hashKey: undefined }), { fn: function (bSuccess, oResponse, vArg, $xhr) {
                                if (!bSuccess) {
                                    // Deleting tags in the shared account for (userdirhashhere) is not supported. We don't want people deleting other people's tags :). Get a private account from Fred - just use the Live Chat window at lower right.
                                    core.lib.modal.alert("An error occured saving the note. Please try again later. (" + $xhr.status + ", " + oResponse.aborted + ")");
                                }
                            }, mimeType: 'text/plain', headers: { "Content-type": "application/json" } });

                            oDialog.close();
                        },
                        close: function () {
                            oDialog.close();
                        }
                    }
                })
            ;

            //return oDialog;
        }, //# core.app.tags.edit


        //#
        remove: function (oItem, a_oCollection) {
            core.io.net.post(core.app.data.baseUrl + "tag/update?remove=true", { _uuid: oItem._uuid }, { fn: function (bSuccess, oResponse, vArg, $xhr) {
                if (bSuccess) {
                    core.lib.ui.sync(function () {
                        core.type.arr.rm(a_oCollection, oItem);
                    });
                }
                else {
                    switch ($xhr.status) {
                        case 401: {
                            core.lib.modal.alert("401: Unauthorized");
                            break;
                        }
                        case 403: {
                            core.lib.modal.alert("403: Forbidden");
                            break;
                        }
                        default: {
                            //alert("An error occured saving the note. Please try again later. (" + $xhr.status + ", " + oResponse.aborted + ")");
                            core.lib.modal.alert("Deleting tags in the shared account for " + core.app.data.userHash + " is not supported. We don't want people deleting other people's tags :). Get a private account from Fred - just use the Live Chat window at lower right.");
                            break;
                        }
                    }
                }
            }, mimeType: 'text/plain', headers: { "Content-type": "application/json" } });
        }, //# core.app.tags.remove


        //#
        add: function (etype, evalue, ltype, lvalue, notes) {
            var dataObj = {
                etype: etype,
                evalue: evalue,
                ltype: ltype,
                lvalue: lvalue,
                notes: notes
            };

            //#
            core.io.net.post(
                core.app.data.baseUrlUser + "terabithia/tag",
                {
                    etype: etype,
                    evalue: evalue,
                    ltype: ltype,
                    lvalue: lvalue,
                    notes: notes
                },
                {
                    fn: function (bSuccess, oResponse /*, vArg, $xhr*/) {
                        //#
                        if (bSuccess) {
                            //data, status, headers, config
                            setTimeout(function () {
                                // FIXME dont lookup tags when storing history
                                if (etype === 'hname' && ltype != 'history') {
                                    core.app.tags.domain(core.app.data.selected.Domain);
                                }
                                else if (etype === 'ipv4' && ltype != 'history') {
                                    core.app.tags.domain(core.app.data.selected.Ip, core.app.data.selected.Mask);
                                }
                            }, 500)
                        }
                        //#
                        else {
                            core.lib.modal.alert("Unable to store tag; " + JSON.stringify({ data: oResponse.data }));
                        }
                    },
                    mimeType: 'text/plain',
                    headers: { "Content-type": "application/json" }
                }
            );
        }, //# core.app.tags.add


        //#
        ip: function (sIP, sMask) {
            var a_oData, i,
                a_oUI = [],
                oStatus = core.app.status() // storedtagsiptimeTaken - TODO: Never used!?
            ;

            //#
            sIP = core.app.ip.mk(sIP);
            sMask = core.app.ip.mask.mk(sMask);

            //#
            core.io.net.get(core.app.data.baseUrl +'tag/search/all?lt=!history&ev_cidr=' + sIP + '/' + sMask, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                if (bSuccess) {
                    core.lib.ui.sync(function () {
                        //#
                        //core.app.tags.ip.status = oStatus;
                        a_oData = oResponse.data.results;
                        core.app.data.api.ip.tags = {
                            ui: a_oUI,
                            data: a_oData
                        };

                        //#
                        for (i = 0; i < a_oData.length; i++) {
                            a_oUI.push({ "text": a_oData[i].lv });
                        }

                        (bSuccess ? oStatus.stop() : oStatus.error());
                    });
                }
            });
        }, //# core.app.tags.ip


        //#
        domain: function (sDomain) {
            var a_oData, a_sHostname, a_sEV, iHostLength, iMatches, i, j,
                a_oUI = [],
                oStatus = core.app.status() // storedtagstimeTaken - TODO: Never used!?
            ;

            //#
            core.io.net.get(core.app.data.baseUrlUser + 'terabithia/lookup-base-dname?d=' + sDomain, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                //#
                sDomain = (oResponse.data || sDomain);
                a_sHostname = sDomain.split(".").reverse();
                iHostLength = a_sHostname.length;
                iHostLength = (iHostLength < 2 ? 2 : iHostLength);

                //#
                core.io.net.get(core.app.data.baseUrl + 'tag/search/all?lt=!history&ev_hname_ph=' + sDomain, function (bSuccess, oResponse /*, vArg, $xhr*/) {
                    core.lib.ui.sync(function() {
                        //core.app.tags.domain.status = oStatus;
                        a_oData = core.resolve(oResponse.data, "results");
                        core.app.data.api.domain.tags = {
                            ui: a_oUI,
                            data: a_oData
                        };

                        //<frank>
                        //Figure out if the domain has a public suffix and match the correct number of parts
                        //FIXME it is likely more efficient to match the parts as a whole instead of looping - The looping below isn't too big a deal
                        if (core.type.arr.is(a_oData)) {
                            for (i = 0; i < a_oData.length; i++) {
                                a_sEV = a_oData[i].ev.split(".").reverse();

                                //#
                                if (a_sEV.length >= iHostLength) {
                                    iMatches = 0;

                                    for (j = 0; j < iHostLength; j++) {
                                        if (a_sEV[j].toLowerCase() == a_sHostname[j].toLowerCase()) {
                                            iMatches++;
                                        }
                                    }
                                    if (iMatches >= iHostLength) {
                                        a_oUI.push({ "text": a_oData[i].lv });
                                    }
                                }
                            }
                        }
                        //</frank>

                        (bSuccess ? oStatus.stop() : oStatus.error());
                    });
                });
            }); //# core.io.net.get
        } //# core.app.tags.domain
    }; //# core.app.tags

}(document.querySelector("SCRIPT[ish]").ish);
