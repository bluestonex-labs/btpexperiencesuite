sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/mvc/View",
    "sap/ui/core/library",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, FlattenedDataset, XMLView, View, CoreLibrary, BusyIndicator, MessageBox) {
        "use strict";

        return Controller.extend("bsx.btpexperiencesuiteui.controller.CPEA.landingPage", {
            onInit: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                this.appModulePath = jQuery.sap.getModulePath(appPath);

                this.getOwnerComponent().getRouter().getRoute("CPEA").attachPatternMatched(this._onCpeaRouteMatched, this);

                //Create JSON Model for IDP users
                var oCpeaModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oCpeaModel, "oCpeaModel");

                var oCpeaCurrentYearModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oCpeaCurrentYearModel, "oCpeaCurrentYearModel");

                var oSrvOvwModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oSrvOvwModel, "oSrvOvwModel");

                var oChartModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oChartModel, "oConsumptionChartModel");

                var oCustomerModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oCustomerModel, "oCustomerModel");

                sap.ui.getCore().setModel(oCustomerModel, "oCustomerModel");

                var oCustLicenseModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oCustLicenseModel, "oCustLicenseModel");

                sap.ui.getCore().setModel(oCustLicenseModel, "oCustLicenseModel");

                var oBarChartColorModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oBarChartColorModel, "oBarChartColorModel");

                var oOvwChartModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oOvwChartModel, "oOvwChartModel");

                /* get the Token to access APIs */
                // this.getToken();
                // this.getToken2();
                /* trigger the API */

                //    var oView = new XMLView();
                //    var oOverviewPage = XMLView("ovp","bsx.cpeavisualizationui.view.CPEAOverview");
                //var oOverviewPage = XMLView("bsx.cpeavisualizationui.view.CPEAOverview");
                /*    var oOverviewPage = sap.ui.xmlview({
                        viewName : "bsx.cpeavisualizationui.view.CPEAOverview"
                    }); */
                //    this.getView().byId("cpeaContentBox").addItem(oOverviewPage); 
                /*    XMLView.lcreate({
                        viewName: "bsx.cpeavisualizationui.view.CPEAOverview"
                    })
                    .then(function(oView) {
                        this.getView().byId("cpeaContentBox").addItem(oView); 
                    }); */
            },

            _onCpeaRouteMatched: function () {
                this.setCurrentMonth();
                var sStartDate = "202301";
                var sEndDate = "202312";

                this.triggerResourceConsumptionApi(sStartDate, sEndDate);
                this.triggerSrvOvwApi(sStartDate, sEndDate);
            },

            setCurrentMonth: function () {
                var oToday = new Date();

                /*    var sFromYear = oDatePicker.getFrom().getFullYear();
                    var sFromMonth = oDatePicker.getFrom().getUTCMonth() + 1;
                    sFromMonth = String(sFromMonth).padStart(2, "0");
    
                    var sFromDate = sFromYear.toString() + sFromMonth.toString();
    
                    var sToYear = oDatePicker.getTo().getFullYear();
                    var sToMonth = oDatePicker.getTo().getUTCMonth() + 1;
                    sToMonth = String(sToMonth).padStart(2, "0");
    
                    var sToDate = sToYear.toString() + sToMonth.toString(); */
            },

            triggerResourceConsumptionApi: function (sStartDate, sEndDate) {
                var sDest = "/reporting";
                //var url = this.appModulePath + sDest + "/reports/v1/monthlySubaccountsCost?fromDate=202101&toDate=202312"; 
                var url = this.appModulePath + sDest + "/reports/v1/monthlySubaccountsCost?fromDate=" + sStartDate + "&toDate=" + sEndDate;
                var that = this;
                var startDate = sStartDate;
                var endDate = sEndDate;

                BusyIndicator.show(500);
                $.ajax({
                    url: url,
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    //data: JSON.stringify(oPayload),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Accept", "application/json");
                    },
                    success: function (oData, oResponse) {
                        BusyIndicator.hide();
                        that.getView().getModel("oCpeaModel").setData(oData);

                        if (startDate === "202301" && endDate === "202312") {
                            that.getView().getModel("oCpeaCurrentYearModel").setData(oData);
                            //var srvId = "scp-launchpad"
                            //var srvId = that.getView().byId("srvSelect").getSelectedKey();
                            //that.formatSrvOvwChartModel(srvId);
                            //    that.renderSrvOvwChart(srvId);
                        }

                        that.formatConsumptionModel();
                        //that.renderConsumptionChart();

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the Monthly Subaccounts Cost" + errorThrown);
                    }
                }, this);
            },

            triggerSrvOvwApi: function (sStartDate, sEndDate) {
                var sDest = "/reporting";
                //var url = this.appModulePath + sDest + "/reports/v1/monthlySubaccountsCost?fromDate=202101&toDate=202312"; 
                var url = this.appModulePath + sDest + "/reports/v1/monthlySubaccountsCost?fromDate=" + sStartDate + "&toDate=" + sEndDate;
                var that = this;
                var startDate = sStartDate;
                var endDate = sEndDate;

                BusyIndicator.show(500);
                $.ajax({
                    url: url,
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    //data: JSON.stringify(oPayload),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Accept", "application/json");
                    },
                    success: function (oData, oResponse) {
                        BusyIndicator.hide();
                        that.getView().getModel("oSrvOvwModel").setData(oData);

                        if (oData.content.length > 0) {
                            var srvId = that.getView().byId("srvSelect").getSelectedKey();
                            that.formatSrvOvwChartModel(srvId);
                        } else {
                            MessageBox.information("There is no service overview data for your current date selection");
                            that.getView().byId("srvOvwDate").setValue("");
                        }

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the Monthly Subaccounts Cost" + errorThrown);
                    }
                }, this);
            },

            onSelectSrv: function () {
                var srvId = this.getView().byId("srvSelect").getSelectedKey();
                this.formatSrvOvwChartModel(srvId);
            },

            onAfterRendering: function () {
                //this.renderOverviewChart();
            },

            navToCustomers: function () {
                this.getOwnerComponent().getRouter().navTo("CPEACUST");
            },

            formatConsumptionModel: function () {
                const groupBy = key => array =>
                    array.reduce(
                        (objectsByKeyValue, obj) => ({
                            ...objectsByKeyValue,
                            [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
                        }),
                        {}
                    );

                var oModel = this.getView().getModel("oCpeaModel");
                var oData = oModel.getData();

                const groupByDirectory = groupBy('directoryId');
                const groupByDirectoryName = groupBy('directoryName');

                var oDataByDirName = groupByDirectoryName(oData.content);
                var aDistinctDirs = Object.keys(oDataByDirName);
                this.sortAscending(aDistinctDirs);

                var aCostObject = [], aCustomers = [], aColors = [], sHeight = 80;
                for (var i = 0; i < aDistinctDirs.length; i++) {

                    if (aDistinctDirs[i] !== "") {

                        /*customer vs cost model */
                        var oCostObject = {
                            "customerName": "",
                            "cost": "",
                            "height": "",
                            "backgroundCss": ""
                        };

                        oCostObject.customerName = aDistinctDirs[i].split(' ')[0];
                        oCostObject.cost = 0;
                        for (var j = 0; j < oDataByDirName[aDistinctDirs[i]].length; j++) {
                            oCostObject.cost = parseFloat(oCostObject.cost) + parseFloat(oDataByDirName[aDistinctDirs[i]][j].cost);
                            oCostObject.cost = parseFloat(oCostObject.cost).toFixed(2);
                        }

                        aCostObject.push(oCostObject);

                        /*customer model */
                        var oCustObject = {
                            "customerName": ""
                        };

                        if (aDistinctDirs[i].split(' ')[0] !== "") {
                            oCustObject.customerName = aDistinctDirs[i].split(' ')[0];
                            aCustomers.push(oCustObject);
                        }
                    }
                }

                this.getView().getModel("oCustomerModel").setData(aCustomers);

                this.sortDescendingFloat(aCostObject);

                var sCssClass = "";

                for (var i = 0; i < aCostObject.length; i++) {
                    aCostObject[i].height = sHeight;
                    sHeight = sHeight - 10;

                    sCssClass = "chartBar" + i;
                    aCostObject[i].backgroundCss = sCssClass;

                }
                this.getView().getModel("oConsumptionChartModel").setData(aCostObject);

                var oChartColors = [
                    {
                        "color": "rgba(63,187,254,1)",
                        "color": "rgba(88,177,255,1)",
                        "color": "rgba(112,160,255,1)",
                        "color": "rgba(133,139,255,1)",
                        "color": "rgba(148,115,255,1)",
                        "color": "rgba(159,91,255,1)",
                    }
                ]

                var aCssClasses = [
                    { "class": "chartBar1" },
                    { "class": "chartBar2" },
                    { "class": "chartBar3" },
                    { "class": "chartBar4" },
                    { "class": "chartBar5" },
                    { "class": "chartBar6" }
                ]
                this.getView().getModel("oBarChartColorModel").setData(aCssClasses);

                //$.when(this.loadCustomerLicenseCount()).then(this.finalizeLicenseCountDetails());
                //this.loadCustomerLicenseCount();
            },

            renderConsumptionChart: function (oEvent) {
                var chart = this.getView().byId("consumptionChart");

                if (chart) {
                    chart.destroyDataset();
                    chart.destroyFeeds();
                }
                chart.setVizType("column");
                chart.setVizProperties({
                    plotArea: {
                        // colorPalette: this.req2TypeColors,
                        dataLabel: {
                            visible: true,
                            defaultState: true
                        }
                    },
                    tooltip: {
                        visible: true
                    },
                    legendGroup: {
                        layout: {
                            position: "top"
                        }
                    },
                    title: {
                        text: "",
                        visible: false
                    },
                    valueAxis: {
                        title: {
                            visible: false,
                            text: "Cost in GBP"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: false,
                            text: "Customers"
                        }
                    }
                });
                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var a = sap.ui.core.format.DateFormat.getInstance({
                    style: "short"
                });
                var i = new sap.viz.ui5.data.FlattenedDataset({
                    dimensions: [{
                        name: "Sub Account Name",
                        value: "{customerName}"
                    }],
                    measures: [{
                        name: "Cost in GBP",
                        value: "{cost}"
                    }],
                    data: {
                        path: "/"
                    }
                });
                chart.setDataset(i);
                var oModel = this.getView().getModel("oConsumptionChartModel");
                chart.setModel(oModel);

                //	for (var s = 0; s < this.reqTypeObjCollection.length; s++) {
                var l = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", //for donut this = "size"
                    type: "Measure",
                    values: ["Cost in GBP"]
                });
                chart.addFeed(l);

                var n = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "categoryAxis", //for donut this = "color"
                    type: "Dimension",
                    values: ["Sub Account Name"]
                });
                chart.addFeed(n);

            },

            formatSrvOvwChartModel: function (srvId) {
                BusyIndicator.show(500);
                /*form the model for chart */
                var oCpeaData = this.getView().getModel("oSrvOvwModel").getData().content;
                var oSrvOvwData = oCpeaData.filter(function (el) {
                    return el.serviceId == srvId;
                });

                const groupBy = key => array =>
                    array.reduce(
                        (objectsByKeyValue, obj) => ({
                            ...objectsByKeyValue,
                            [obj[key]]: (objectsByKeyValue[obj[key]] || []).concat(obj)
                        }),
                        {}
                    );

                const grpByDirSrvOvw = groupBy('directoryId');
                const grpByDirNameSrvOvw = groupBy('directoryName');
                const grpByReportYearMonth = groupBy('reportYearMonth');

                var oDataByDirName = grpByDirNameSrvOvw(oSrvOvwData);
                var aDistinctDirs = Object.keys(oDataByDirName);
                this.sortAscending(aDistinctDirs);

                var oDataByRepYearMonth = grpByReportYearMonth(oSrvOvwData);
                var aDistinctDirsByMonth = Object.keys(oDataByRepYearMonth);
                this.sortAscending(aDistinctDirsByMonth);

                /* for unique customers */
                for (var i = 0; i < aDistinctDirs.length; i++) {
                    var aUsageObject = [], aCustomers = [], aUsageFinalObject = [];
                    /* for unique reportYearMonth */

                    for (var j = 0; j < Object.keys(oDataByDirName).length; j++) {
                        for (var k = 0; k < aDistinctDirsByMonth.length; k++) {
                            //aUsageObject = [];
                            var aDataByRepMonth = oDataByDirName[aDistinctDirs[j]].filter(function (el) {
                                return el.reportYearMonth == aDistinctDirsByMonth[k];
                            });

                            /*customer vs cost model */
                            var oUsageObject = {
                                "customerName": "",
                                "usage": "",
                                "reportYearMonth": ""
                            };

                            var sMonth = aDistinctDirsByMonth[k].slice(4);
                            var sYear = aDistinctDirsByMonth[k].slice(0, 4);
                            var sMonthName = "";
                            switch (sMonth) {
                                case "01":
                                    sMonthName = "JAN";
                                    break;
                                case "02":
                                    sMonthName = "FEB";
                                    break;
                                case "03":
                                    sMonthName = "MAR";
                                    break;
                                case "04":
                                    sMonthName = "APR";
                                    break;
                                case "05":
                                    sMonthName = "MAY";
                                    break;
                                case "06":
                                    sMonthName = "JUNE";
                                    break;
                                case "07":
                                    sMonthName = "JULY";
                                    break;
                                case "08":
                                    sMonthName = "AUG";
                                    break;
                                case "09":
                                    sMonthName = "SEP";
                                    break;
                                case "10":
                                    sMonthName = "OCT";
                                    break;
                                case "11":
                                    sMonthName = "NOV";
                                    break;
                                case "12":
                                    sMonthName = "DEC";
                                    break;
                                default:
                                    sMonthName = "";
                                    break;
                            };

                            oUsageObject.reportYearMonth = sMonthName + "-" + sYear;
                            oUsageObject.customerName = aDistinctDirs[j].split(' ')[0];
                            oUsageObject.usage = 0;

                            for (var l = 0; l < aDataByRepMonth.length; l++) {
                                oUsageObject.usage = parseFloat(oUsageObject.usage) + parseFloat(aDataByRepMonth[l].usage);
                            }
                            aUsageObject.push(oUsageObject);
                        }
                        this.getView().getModel("oOvwChartModel").setData(aUsageObject);
                        continue;

                    }
                }

                var aDirByYearMonth = grpByReportYearMonth(aUsageObject);
                var aDistinctYearMonth = Object.keys(aDirByYearMonth);
                var aCustUsageObject = [];

                for (var l = 0; l < aDistinctYearMonth.length; l++) {
                    var oCustUsageObject = {};
                    oCustUsageObject["reportYearMonth"] = aDistinctYearMonth[l];
                    var aCustDetPerYearMonth = aDirByYearMonth[aDistinctYearMonth[l]];
                    for (var m = 0; m < aCustDetPerYearMonth.length; m++) {
                        var customerName = aDirByYearMonth[aDistinctYearMonth[l]][m].customerName;
                        oCustUsageObject[customerName] = parseFloat(aDirByYearMonth[aDistinctYearMonth[l]][m].usage).toFixed(2);
                    }
                    aCustUsageObject.push(oCustUsageObject);
                }
                this.getView().getModel("oOvwChartModel").setData(aCustUsageObject);

                this.renderSrvOvwChart();

                BusyIndicator.hide();
            },

            renderSrvOvwChart: function () {
                BusyIndicator.show(500);
                var chart = this.getView().byId("overviewChart");

                if (chart) {
                    chart.destroyDataset();
                    chart.destroyFeeds();
                }
                chart.setVizType("line");
                chart.setVizProperties({
                    plotArea: {
                        // colorPalette: this.req2TypeColors,
                        dataLabel: {
                            visible: true,
                            defaultState: true
                        }
                    },
                    tooltip: {
                        visible: true
                    },
                    legendGroup: {
                        layout: {
                            position: "top"
                        }
                    },
                    title: {
                        text: "",
                        visible: false
                    },
                    valueAxis: {
                        title: {
                            visible: false,
                            text: "No of Requests"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: false,
                            text: "Date"
                        }
                    }
                });
                //var json = new sap.ui.model.json.JSONModel(oData);
                var json = this.getView().getModel("oOvwChartModel");
                var jsonData = json.getData();
                var aCustomers = Object.keys(jsonData[0]);
                var aMeasures = [];

                for (var i = 0; i < aCustomers.length; i++) {
                    if (aCustomers[i] !== "reportYearMonth") {
                        var oCustObject = {
                            name: "",
                            value: ""
                        };
                        oCustObject["name"] = aCustomers[i];
                        oCustObject["value"] = "{" + aCustomers[i] + "}";

                        aMeasures.push(oCustObject);
                    }
                }

                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var a = sap.ui.core.format.DateFormat.getInstance({
                    style: "short"
                });
                var i = new sap.viz.ui5.data.FlattenedDataset({
                    dimensions: [{
                        name: "Report Year Month",
                        value: "{reportYearMonth}"
                    }],
                    measures: aMeasures,
                    data: {
                        path: "/"
                    }
                });
                chart.setDataset(i);

                chart.setModel(json);

                for (var i = 0; i < aCustomers.length; i++) {
                    if (aCustomers[i] !== "reportYearMonth") {
                        var oValue = aCustomers[i];
                        var f = new sap.viz.ui5.controls.common.feeds.FeedItem({
                            uid: "valueAxis",
                            type: "Measure",
                            values: [oValue]
                        });

                        chart.addFeed(f);
                    }
                }
                var n = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "categoryAxis", //for donut this = "color"
                    type: "Dimension",
                    values: ["Report Year Month"]
                });
                chart.addFeed(n);
                BusyIndicator.hide();
            },

            loadCustomerLicenseCount: function () {
                var aCustomers = this.getView().getModel("oCustomerModel").getData();
                this.aLicenseCount = [];
                for (var i = 0; i < aCustomers.length; i++) {
                    var sCustomer = aCustomers[i].customerName;
                    $.when(this.fetchTotalLicenseCount(sCustomer), this.fetchIdpActiveLicenseCount(sCustomer)).then(this.generateLicenseData(sCustomer));

                }
            },

            fetchTotalLicenseCount: function (sCustomer) {
                var sDest = ""; this.sTotalLicense = "";
                sCustomer = sCustomer.toUpperCase();
                switch (sCustomer) {
                    case "BRAKES":
                        sDest = "/cis_brakesdev";
                        break;
                    default:
                        sDest = "/cis_bsxtdd";
                        break;
                }
                var url = this.appModulePath + sDest + "/scim/Users";
                var that = this;
                BusyIndicator.show(500);
                $.ajax({
                    url: url,
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    //data: JSON.stringify(oPayload),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Accept", "application/json");
                    },
                    success: function (oData, oResponse) {
                        BusyIndicator.hide();
                        that.sTotalLicense = oData.totalResults;
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the total license count of customer " + sCustomer);
                    }
                }, this);
            },

            fetchIdpActiveLicenseCount: function (sCustomer) {
                var sDest = ""; this.sActiveLicense = "";
                sCustomer = sCustomer.toUpperCase();
                switch (sCustomer) {
                    case "BRAKES":
                        sDest = "/cis_brakesdev";
                        break;
                    default:
                        sDest = "/cis_bsxtdd";
                        break;
                }
                var url = this.appModulePath + sDest + "/scim/Users?filter=active eq true";
                var that = this;
                BusyIndicator.show(500);
                $.ajax({
                    url: url,
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    //data: JSON.stringify(oPayload),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Accept", "application/json");
                    },
                    success: function (oData, oResponse) {
                        BusyIndicator.hide();
                        that.sActiveLicense = oData.totalResults;
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the active license count of customer " + sCustomer);
                    }
                }, this);
            },

            generateLicenseData: function (sCustomer) {
                var sTotalLicenseCount = "", sActiveLicenseCount = "";
                sTotalLicenseCount = this.sTotalLicense;
                sActiveLicenseCount = this.sActiveLicense;
                var oLicense = {
                    "customerName": "",
                    "totalUsers": "",
                    "activeUsers": "",
                    "inactiveUsers": ""
                };

                oLicense.customerName = sCustomer;
                oLicense.totalUsers = this.sTotalLicense;
                oLicense.activeUsers = this.sActiveLicense;
                oLicense.inactiveUsers = parseInt(oLicense.totalUsers) - parseInt(oLicense.activeUsers);

                this.aLicenseCount.push(oLicense);
            },

            finalizeLicenseCountDetails: function () {
                this.getView().getModel("oCustLicenseModel").setData(this.aLicenseCount);
            },

            onConsumptionDateChange: function (oEvent) {
                var oDatePicker = oEvent.getSource();
                var bValid = oEvent.getParameter("valid");

                if (bValid) {
                    oDatePicker.setValueState("None");

                    var sFromDateTime = oDatePicker.getFrom().toISOString();
                    var sToDateTime = oDatePicker.getTo().toISOString();

                    //var sFromDate = oFromDateTime.split('T')[0];
                    //var sToDate = oToDateTime.split('T')[0];

                    var sFromYear = oDatePicker.getFrom().getFullYear();
                    var sFromMonth = oDatePicker.getFrom().getUTCMonth() + 1;
                    sFromMonth = String(sFromMonth).padStart(2, "0");

                    var sFromDate = sFromYear.toString() + sFromMonth.toString();

                    var sToYear = oDatePicker.getTo().getFullYear();
                    var sToMonth = oDatePicker.getTo().getUTCMonth() + 1;
                    sToMonth = String(sToMonth).padStart(2, "0");

                    var sToDate = sToYear.toString() + sToMonth.toString();

                    this.triggerResourceConsumptionApi(sFromDate, sToDate);
                } else {
                    oDatePicker.setValueState("Error");
                }
            },

            onSrvDateChange: function (oEvent) {
                var oDatePicker = oEvent.getSource();
                var bValid = oEvent.getParameter("valid");

                if (bValid) {
                    oDatePicker.setValueState("None");

                    var sFromDateTime = oDatePicker.getFrom().toISOString();
                    var sToDateTime = oDatePicker.getTo().toISOString();

                    //var sFromDate = oFromDateTime.split('T')[0];
                    //var sToDate = oToDateTime.split('T')[0];

                    var sFromYear = oDatePicker.getFrom().getFullYear();
                    var sFromMonth = oDatePicker.getFrom().getUTCMonth() + 1;
                    sFromMonth = String(sFromMonth).padStart(2, "0");

                    var sFromDate = sFromYear.toString() + sFromMonth.toString();

                    var sToYear = oDatePicker.getTo().getFullYear();
                    var sToMonth = oDatePicker.getTo().getUTCMonth() + 1;
                    sToMonth = String(sToMonth).padStart(2, "0");

                    var sToDate = sToYear.toString() + sToMonth.toString();

                    this.triggerSrvOvwApi(sFromDate, sToDate);
                } else {
                    oDatePicker.setValueState("Error");
                }
            },

            renderOverviewChart: function (oEvent) {
                var chart = this.getView().byId("overviewChart");

                if (chart) {
                    chart.destroyDataset();
                    chart.destroyFeeds();
                }
                chart.setVizType("line");
                chart.setVizProperties({
                    plotArea: {
                        // colorPalette: this.req2TypeColors,
                        dataLabel: {
                            visible: true,
                            defaultState: true
                        }
                    },
                    tooltip: {
                        visible: true
                    },
                    legendGroup: {
                        layout: {
                            position: "top"
                        }
                    },
                    title: {
                        text: "",
                        visible: false
                    },
                    valueAxis: {
                        title: {
                            visible: false,
                            text: "No of Requests"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: false,
                            text: "Date"
                        }
                    }
                });
                var oData = {

                    "results": {
                        0: {
                            Customer1: 90,
                            Customer2: 80,
                            Customer3: 70,
                            Customer4: 55,
                            Customer5: 65,
                            Customer6: 70,
                            Month: "January"
                        },
                        1: {
                            Customer1: 75,
                            Customer2: 85,
                            Customer3: 90,
                            Customer4: 50,
                            Customer5: 55,
                            Customer6: 90,
                            Month: "February"
                        },
                        2: {
                            Customer1: 90,
                            Customer2: 80,
                            Customer3: 70,
                            Customer4: 65,
                            Customer5: 60,
                            Customer6: 80,
                            Month: "March"
                        },
                        3: {
                            Customer1: 90,
                            Customer2: 80,
                            Customer3: 70,
                            Customer4: 30,
                            Customer5: 65,
                            Customer6: 70,
                            Month: "April"
                        },
                        4: {
                            Customer1: 75,
                            Customer2: 85,
                            Customer3: 90,
                            Customer4: 45,
                            Customer5: 40,
                            Customer6: 90,
                            Month: "May"
                        },
                        5: {
                            Customer1: 90,
                            Customer2: 80,
                            Customer3: 70,
                            Customer4: 50,
                            Customer5: 60,
                            Customer6: 80,
                            Month: "June"
                        },
                        6: {
                            Customer1: 90,
                            Customer2: 80,
                            Customer3: 70,
                            Customer4: 25,
                            Customer5: 50,
                            Customer6: 70,
                            Month: "July"
                        },
                        7: {
                            Customer1: 70,
                            Customer2: 80,
                            Customer3: 70,
                            Customer4: 30,
                            Customer5: 60,
                            Customer6: 85,
                            Month: "August"
                        },
                        8: {
                            Customer1: 85,
                            Customer2: 90,
                            Customer3: 70,
                            Customer4: 55,
                            Customer5: 65,
                            Customer6: 70,
                            Month: "September"
                        },
                        9: {
                            Customer1: 90,
                            Customer2: 80,
                            Customer3: 85,
                            Customer4: 50,
                            Customer5: 60,
                            Customer6: 90,
                            Month: "October"
                        }
                    }

                };
                var json = new sap.ui.model.json.JSONModel(oData);
                /*
                    var t = [];
                    
                    //setting the measures/////////////
                
                    for (var s = 0; s < this.reqTypeObjCollection.length; s++) {
                        var r = {};
                        r["name"] = this.reqTypeObjCollection[s].Desc;
                        r["value"] = "{" + this.reqTypeObjCollection[s].Desc + "}";
                        t.push(r);
                    }
                    ////////////////////
                    */
                jQuery.sap.require("sap.ui.core.format.DateFormat");
                var a = sap.ui.core.format.DateFormat.getInstance({
                    style: "short"
                });
                var i = new sap.viz.ui5.data.FlattenedDataset({
                    dimensions: [{
                        name: "Month",
                        value: "{Month}"
                    }],
                    measures: [{
                        name: "Customer 1",
                        value: "{Customer1}"
                    },
                    {
                        name: "Customer 2",
                        value: "{Customer2}"
                    },
                    {
                        name: "Customer 3",
                        value: "{Customer3}"
                    },
                    {
                        name: "Customer 4",
                        value: "{Customer4}"
                    },
                    {
                        name: "Customer 5",
                        value: "{Customer5}"
                    },
                    {
                        name: "Customer 6",
                        value: "{Customer6}"
                    }],
                    data: {
                        path: "/results"
                    }
                });
                chart.setDataset(i);
                //	var o = this.getView().getModel("trendByObjSetModel");
                chart.setModel(json);


                //	for (var s = 0; s < this.reqTypeObjCollection.length; s++) {
                var l = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", //for donut this = "size"
                    type: "Measure",
                    values: ["Customer 1"]
                });
                var l2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", //for donut this = "size"
                    type: "Measure",
                    values: ["Customer 2"]
                });
                var l3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", //for donut this = "size"
                    type: "Measure",
                    values: ["Customer 3"]
                });
                var l4 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", //for donut this = "size"
                    type: "Measure",
                    values: ["Customer 4"]
                });
                var l5 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", //for donut this = "size"
                    type: "Measure",
                    values: ["Customer 5"]
                });
                var l6 = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "valueAxis", //for donut this = "size"
                    type: "Measure",
                    values: ["Customer 6"]
                });
                chart.addFeed(l);
                chart.addFeed(l2);
                chart.addFeed(l3);
                chart.addFeed(l4);
                chart.addFeed(l5);
                chart.addFeed(l6);
                //	}
                var n = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "categoryAxis", //for donut this = "color"
                    type: "Dimension",
                    values: ["Month"]
                });
                chart.addFeed(n);

            },

            sortAscending: function (aRows) {
                aRows.sort((a, b) => {
                    const nameA = a.toUpperCase(); // ignore upper and lowercase
                    const nameB = b.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });
            },

            sortDescendingFloat: function (aCostObject) {
                aCostObject.sort((a, b) => {
                    /* const nameA = a.cost; 
                    const nameB = b.cost; 
                    if (nameA > nameB) {
                        return -1;
                    }
                    if (nameA < nameB) {
                        return 1;
                    }

                    // names must be equal
                    return 0; */

                    return parseFloat(b.cost) - parseFloat(a.cost);
                });

            },

            manageCustomer: function () {
                this.getOwnerComponent().getRouter().navTo("CPEACUSTDETAIL");
            }


        });
    });
