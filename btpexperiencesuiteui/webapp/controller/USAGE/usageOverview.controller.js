/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",

], function (Controller, JSONModel, History, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, Dialog) {
	"use strict";

	return Controller.extend("bsx.btpexperiencesuiteui.controller.USAGE.usageOvereview", {

		// formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */

		_PastMonths: function (e, t) {
			e.setMonth(e.getMonth() + t);
			return e;
		},

		_PastWeek: function (e, t) {
			e.setDate(e.getDate() + t);
			return e;
		},

		onInit: function () {

if (sap.ui.Device.system.tablet){
	this.getView().byId("browserCell").addStyleClass("flex");
}
this.serviceUrl = jQuery.sap.getModulePath((this.getOwnerComponent().getManifestEntry("/sap.app/id")).replaceAll(".", "/"));
//var i = t.replaceAll(".", "/");
//var s = jQuery.sap.getModulePath(i);
//this.serviceUrl = this.getOwnerComponent().getMetadata().getManifestEntry("sap.app").dataSources.mainService.uri;

			this.getView().byId("dynamicPageId").setBusy(true);
			var today = new Date();
			var start = this._PastMonths(new Date(), -1);
			var start2 = this._PastWeek(new Date(), -7);
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0! 
			var yyyy = today.getFullYear();
			if (dd < 10) {
				dd = "0" + dd;
			}
			if (mm < 10) {
				mm = "0" + mm;
			}
			var dd2 = start.getDate();
			var mm2 = start.getMonth() + 1; //January is 0! 
			var yyyy2 = start.getFullYear();
			if (dd2 < 10) {
				dd2 = "0" + dd2;
			}
			if (mm2 < 10) {
				mm2 = "0" + mm2;
			}

			this.getView().byId("dateTo").setValue(yyyy.toString() + mm.toString() + dd.toString());
			this.getView().byId("dateFrom").setValue(yyyy2.toString() + mm2.toString() + dd2.toString());

			//	var oViewModel = this._createViewModel();
		//	this.reqTypeColors = ["#5899db", "#e8743b", "#1aaa79", "#3caea3", "#173f5f", "#D06957", "#EF5030", "#184b72", "#297971", "#143753"];
            this.reqTypeColors = ["#8b82ff", "#a24fff", "#42bafe"];
			this.req2TypeColors = ["#7caee0", "#eb9069", "#EF5030", "#3caea3", "#173f5f", "#D06957", "#EF5030", "#184b72", "#297971", "#143753"];
			this.req3TypeColors = ["red", "green"];
			//	var that = this;
			//	var oModel = new sap.ui.model.json.JSONModel();
			//	this.getView().setModel(oModel, "fields");

			var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			this._oComponent = sap.ui.component(sComponentId);

			this.onDataFetch();

		},

		onDataFetch: function () {
			var dateFrom = this.getView().byId("dateFrom").getValue();
			var dateTo = this.getView().byId("dateTo").getValue();
			var that = this;

            var url = this.serviceUrl + "/sap/opu/odata/bsxc/trackappusage_srv/AppUsageSet?$filter=EDate ge '" + dateFrom + "' and EDate le '" + dateTo + "'";
			$.ajax({
				//url: "/sap/opu/odata/bsxc/trackappusage_srv/AppUsageSet?$filter=EDate ge '" + dateFrom + "' and EDate le '" + dateTo + "'",
			url: url,
                type: "GET",
				contentType: "application/json",
				dataType: "json",

				async: true,
				success: function (oData, response) {
					var userCount = [];
					var appCount = [];
					var deviceCount = [];

					oData.userCount = [];
					oData.appCount = [];
					oData.deviceCount = [];
					oData.browserCount = [];
					oData.systemCount = [];

					for (var i = 0; i < oData.d.results.length; i++) {
						
						var split = oData.d.results[i].Appname.split("_"); 
						var join = split.join(" ");
						oData.d.results[i].Appname = join;
						
						if (oData.d.results[i].Device === " Desktop") {
							oData.d.results[i].Desktop = 1;
							oData.d.results[i].Tablet = 0;
							oData.d.results[i].Phone = 0;
						//	oData.d.results[i].Web = 0;
						}
						if (oData.d.results[i].Device === " Tablet") {
							oData.d.results[i].Desktop = 0;
							oData.d.results[i].Tablet = 1;
							oData.d.results[i].Phone = 0;
						//	oData.d.results[i].Web = 0;
						}
						if (oData.d.results[i].Device === " Phone") {
							oData.d.results[i].Desktop = 0;
							oData.d.results[i].Tablet = 0;
							oData.d.results[i].Phone = 1;
						//	oData.d.results[i].Web = 0;
						}
					//	if (oData.d.results[i].Device === "WEB") {
						//	oData.d.results[i].Desktop = 0;
						//	oData.d.results[i].Tablet = 0;
						//	oData.d.results[i].Phone = 0;
						//	oData.d.results[i].Web = 1;
						//}
						if (oData.d.results[i].Device === "") {
							oData.d.results[i].Desktop = 0;
							oData.d.results[i].Tablet = 0;
							oData.d.results[i].Phone = 0;
						//	oData.d.results[i].Web = 0;
						}
					}

					oData.d.results.forEach(function (a) {
						if (!this[a.Fullname]) {
							this[a.Fullname] = {
								Fullname: a.Fullname,
								//Count: 0,
								Desktop: 0,
								Phone: 0,
								Tablet: 0,
							//	Web: 0
							Total: 0

							};
							//  oData.d.createdCounts = [];
							oData.userCount.push(this[a.Fullname]);

						}
						//	this[a.Fullname].Count ++;
						this[a.Fullname].Desktop += a.Desktop;
						this[a.Fullname].Tablet += a.Tablet;
						this[a.Fullname].Phone += a.Phone;
						this[a.Fullname].Total++;
					//	this[a.Fullname].Web += a.Web;

					}, Object.create(null));

					oData.d.results.forEach(function (a) {
						if (!this[a.Appname]) {
							this[a.Appname] = {
								Appname: a.Appname,
								//Count: 0,
								Desktop: 0,
								Phone: 0,
								Tablet: 0,
							//	Web: 0,
								Total: 0,

							};
							//  oData.d.createdCounts = [];
							oData.appCount.push(this[a.Appname]);

						}
						//	this[a.Fullname].Count ++;
						this[a.Appname].Desktop += a.Desktop;
						this[a.Appname].Tablet += a.Tablet;
						this[a.Appname].Phone += a.Phone;
					//	this[a.Appname].Web += a.Web;
						this[a.Appname].Total++;

					}, Object.create(null));

					oData.d.results.forEach(function (a) {
						if (!this[a.Device]) {
							this[a.Device] = {
								Device: a.Device,
								Count: 0,

							};
							//  oData.d.createdCounts = [];
							oData.deviceCount.push(this[a.Device]);

						}
						this[a.Device].Count++;

					}, Object.create(null));

					oData.d.results.forEach(function (a) {
						if (!this[a.Browser]) {
							this[a.Browser] = {
								Browser: a.Browser,
								Count: 0,

							};
							//  oData.d.createdCounts = [];
							oData.browserCount.push(this[a.Browser]);

						}
						this[a.Browser].Count++;

					}, Object.create(null));
					
							oData.d.results.forEach(function (a) {
						if (!this[a.OS]) {
							this[a.OS] = {
								OS: a.OS,
								Count: 0,

							};
							//  oData.d.createdCounts = [];
							oData.systemCount.push(this[a.OS]);

						}
						this[a.OS].Count++;

					}, Object.create(null));
					
			

					var oModel = new JSONModel();
					oModel.setData(oData);
					oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

					sap.ui.getCore().setModel(oModel);

					that.onInactiveFetch();
					/*	that.renderUserChart();
						that.renderDeviceChart();
						that.renderAppChart();	
						that.renderActiveChart();
						that.onRenderNumbers();	*/
				},

				error: function (jqXHR, textStatus, errorThrown) {
					var test = "F";
				}
			}, this);
		},

		onInactiveFetch: function () {

			var model = sap.ui.getCore().getModel();
			var bData = model.getData();
			bData.activeUsers = [];
			bData.inactiveUsers = [];
			
	
var url = this.serviceUrl + "/sap/opu/odata/bsxc/trackappusage_srv/UserStatusSet?$filter=FromDate eq '' and ToDate eq ''";
		//	var url = "/sap/opu/odata/bsxc/TRACKAPPUSAGE_SRV/UserStatusSet?$filter=FromDate eq '' and ToDate eq ''";
			var that = this;
			$.ajax({
				url: url,
				type: "GET",
				contentType: "application/json",
				dataType: "json",

				async: true,
				success: function (oData, response) {
					bData.inactiveUsers = oData.d.results;

					model.getData().d.results.forEach(function (a) {
						if (!this[a.UserId]) {
							this[a.UserId] = {
								UserId: a.UserId,
								Fullname: a.Fullname,
								Count: 0,
								Status: "sap-icon://status-completed",
								Color: "green"

							};
							//  oData.d.createdCounts = [];
							bData.activeUsers.push(this[a.UserId]);

						}
						this[a.UserId].Count++;

					}, Object.create(null));

					for (var n = 0; n < bData.activeUsers.length; n++) {

						var name = bData.activeUsers[n].UserId;

						for (var i = bData.inactiveUsers.length - 1; i >= 0; i--) {
							bData.inactiveUsers[i].Status = "sap-icon://status-inactive";
							bData.inactiveUsers[i].Color = "red";
							bData.inactiveUsers[i].Count = 0;
							if (bData.inactiveUsers[i].UserId === name) {
								bData.inactiveUsers.splice(i, 1);
							}
						}
					}
					
				bData.userStatusList = bData.activeUsers.concat(bData.inactiveUsers);
					/*	activeCount.forEach(function (a) {
						if (!this[a.UserId]) {
							this[a.UserId] = {
								UserId: a.UserId,
							//	Count: 0,
								
							};
							//  oData.d.createdCounts = [];
							inactiveCount.push(this[a.UserId]);
						
						}
					//	this[a.Device].Count ++;
					
					}, Object.create(null));*/
							bData.activeChart = [
									{"Status": 'Inactive',
				"Count": bData.inactiveUsers.length},
				{
				"Status": 'Active',
				"Count": bData.activeUsers.length}
			
				];
					console.log(bData);
					model.setData(bData);

					that.renderUserChart();
				//	that.renderDeviceChart();
					that.renderAppChart();
					that.renderActiveChart();
					that.onRenderNumbers();
				},

				error: function (jqXHR, textStatus, errorThrown) {
					var test = "F";
				}
			}, this);

		},

		onRenderNumbers: function () {
			
				this.getView().byId("desktopCount").setText("0");
				this.getView().byId("tabletCount").setText("0");
				this.getView().byId("mobileCount").setText("0");
				this.getView().byId("chromeCount").setText("0");
				this.getView().byId("safariCount").setText("0");
				this.getView().byId("edgeCount").setText("0");
				this.getView().byId("firefoxCount").setText("0");			
				this.getView().byId("ieCount").setText("0");
				this.getView().byId("fioriClientCount").setText("0");				
		//		this.getView().byId("chromeBox").setVisible(false);
				this.getView().byId("safariBox").setVisible(false);
		//		this.getView().byId("edgeBox").setVisible(false);
				this.getView().byId("firefoxBox").setVisible(false);
		//		this.getView().byId("ieBox").setVisible(false);
		//		this.getView().byId("clientBox").setVisible(false);
				this.getView().byId("windowsCount").setText("0");
				this.getView().byId("macCount").setText("0");
				this.getView().byId("androidCount").setText("0");
				this.getView().byId("otherCount").setText("0");
				
				var browserVisCount = 4;
				
				
			var data = sap.ui.getCore().getModel().getData();

			this.getView().byId("activeCount").setText(data.userCount.length);
			this.getView().byId("inactiveCount").setText(data.inactiveUsers.length);

			for (var i = 0; i < data.deviceCount.length; i++) {
				if (data.deviceCount[i].Device === " Desktop") {
					this.getView().byId("desktopCount").setText(data.deviceCount[i].Count);
				}
				if (data.deviceCount[i].Device === " Tablet") {
					this.getView().byId("tabletCount").setText(data.deviceCount[i].Count);
				}
				if (data.deviceCount[i].Device === " Phone") {
					this.getView().byId("mobileCount").setText(data.deviceCount[i].Count);
				}
			}
			
			for (var i = 0; i < data.systemCount.length; i++) {
				if (data.systemCount[i].OS === "Windows") {
					this.getView().byId("windowsCount").setText(data.systemCount[i].Count);
				}
				if (data.systemCount[i].OS === "Apple") {
					this.getView().byId("macCount").setText(data.systemCount[i].Count);
				}
				if (data.systemCount[i].OS === "Android") {
					this.getView().byId("androidCount").setText(data.systemCount[i].Count);
				}	
				if (data.systemCount[i].OS === "Other") {
					this.getView().byId("otherCount").setText(data.systemCount[i].Count);
				}	
			
			}
			
		for (var b = 0; b < data.browserCount.length; b++ ) {
				if (data.browserCount[b].Browser === "Google Chrome") {
					this.getView().byId("chromeCount").setText(data.browserCount[b].Count);
				}
				if (data.browserCount[b].Browser === "Safari") {
					this.getView().byId("safariCount").setText(data.browserCount[b].Count);
				}
				if (data.browserCount[b].Browser === "Microsoft Edge") {
					this.getView().byId("edgeCount").setText(data.browserCount[b].Count);
				}		
				if (data.browserCount[b].Browser === "Mozilla Firefox") {
					this.getView().byId("firefoxCount").setText(data.browserCount[b].Count);
				}	
				if (data.browserCount[b].Browser === "Internet Explorer") {
					this.getView().byId("ieCount").setText(data.browserCount[b].Count);
				}			
				if (data.browserCount[b].Browser === "Fiori Client") {
					this.getView().byId("fioriClientCount").setText(data.browserCount[b].Count);
				}		
			
			}
			

			if (this.getView().byId("safariCount").getText() !== "0"){
			this.getView().byId("safariBox").setVisible(true);
			browserVisCount ++;
			}

			if (this.getView().byId("firefoxCount").getText() !== "0"){
			this.getView().byId("firefoxBox").setVisible(true);
				browserVisCount ++;
			}	
	

		
			if (browserVisCount >= 4){
				this.getView().byId("browserCell").setWidth(2);
			}
			this.getView().byId("dynamicPageId").setBusy(false);

		},
		renderUserChart: function () {

			var chart = this.getView().byId("userChart");

			if (chart) {

				chart.destroyDataset();

				chart.destroyFeeds();

			}

			chart.setVizType("stacked_bar");

			chart.setVizProperties({

				plotArea: {

					colorPalette: this.reqTypeColors,

					dataLabel: {

						visible: true,
						showTotal: true,

						defaultState: true

					},
					sumLabel: {
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

						text: "App usage"

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
			var sData = sap.ui.getCore().getModel();
			//		sData.getData().d.materialTypeNew = [];

			//		for (var z = 0; z < 5; z++) {
			//			sData.getData().d.materialTypeNew.push(sData.getData().d.materialTypeCount[z]);
			//		}
			var i = new sap.viz.ui5.data.FlattenedDataset({

				dimensions: [{
					name: "Fullname",
					value: "{Fullname}"
				}],
				measures: [{
					name: "Desktop",
					value: "{Desktop}"
				}, {
					name: "Tablet",
					value: "{Tablet}"
				}, {
					name: "Phone",
					value: "{Phone}"
				}, 
			//	{
			//		name: "Web",
			//		value: "{Web}"
			//	}
				],
				data: {
					path: "/userCount"
				}

			});

			chart.setDataset(i);

			//var o = this.getView().getModel("trendByObjSetModel");

			chart.setModel(sData);

			var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Desktop"]
				}),
				oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Tablet"]
				}),
				oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Phone"]
				}),
			//	oFeedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
			//		"uid": "valueAxis",
			//		"type": "Measure",
			//		"values": ["Web"]
			//	}),
				oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Fullname"]
				});

			chart.addFeed(oFeedValueAxis);
			chart.addFeed(oFeedValueAxis1);
			chart.addFeed(oFeedValueAxis2);
		//	chart.addFeed(oFeedValueAxis3);
			chart.addFeed(oFeedCategoryAxis);

			//}

			// var n = new sap.viz.ui5.controls.common.feeds.FeedItem({

			//         uid: "categoryAxis", //for donut this = "color"

			//         type: "Dimension",

			//         values: ["MaterialType"]

			// });

			// chart.addFeed(n);

		},
		renderAppChart: function () {

			var chart = this.getView().byId("appChart");

			if (chart) {

				chart.destroyDataset();

				chart.destroyFeeds();

			}

			chart.setVizType("stacked_column");

			chart.setVizProperties({

				plotArea: {

					//colorPalette: this.reqTypeColors,

					dataLabel: {

						visible: true,
						showTotal: true,

						defaultState: true

					},
					sumLabel: {
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

						text: "App usage"

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
			var sData = sap.ui.getCore().getModel();
			//		sData.getData().d.materialTypeNew = [];

			//		for (var z = 0; z < 5; z++) {
			//			sData.getData().d.materialTypeNew.push(sData.getData().d.materialTypeCount[z]);
			//		}
			var i = new sap.viz.ui5.data.FlattenedDataset({

				dimensions: [{
					name: "Appname",
					value: "{Appname}"
				}],
				measures: [{
					name: "Desktop",
					value: "{Desktop}"
				}, {
					name: "Tablet",
					value: "{Tablet}"
				}, {
					name: "Phone",
					value: "{Phone}"
				},
			//	{
			//		name: "Web",
			//		value: "{Web}"
			//	}
				],
				data: {
					path: "/appCount"
				}

			});

			chart.setDataset(i);

			//var o = this.getView().getModel("trendByObjSetModel");

			chart.setModel(sData);

			var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Desktop"]
				}),
				oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Tablet"]
				}),
				oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "valueAxis",
					"type": "Measure",
					"values": ["Phone"]
				}),
			//	oFeedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
			//		"uid": "valueAxis",
			//		"type": "Measure",
			//		"values": ["Web"]
			//	}),
				oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					"uid": "categoryAxis",
					"type": "Dimension",
					"values": ["Appname"]
				});

			chart.addFeed(oFeedValueAxis);
			chart.addFeed(oFeedValueAxis1);
			chart.addFeed(oFeedValueAxis2);
		//	chart.addFeed(oFeedValueAxis3);
			chart.addFeed(oFeedCategoryAxis);
			
		

			//}

			// var n = new sap.viz.ui5.controls.common.feeds.FeedItem({

			//         uid: "categoryAxis", //for donut this = "color"

			//         type: "Dimension",

			//         values: ["MaterialType"]

			// });

			// chart.addFeed(n);

		},

		renderActiveChart: function () {
			var chart = this.getView().byId("activeChart");
			if (chart) {
				chart.destroyDataset();
				chart.destroyFeeds();
			}
			chart.setVizType("donut");
			chart.setVizProperties({
				plotArea: {
					colorPalette: this.req3TypeColors,
					dataLabel: {
						visible: true,
						defaultState: true,
						type: 'value'
					}
				},
				tooltip: {
					visible: true
				},
				legendGroup: {
					layout: {
						position: "bottom"
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
						text: "Device"
					}
				}
			});

			var test = sap.ui.getCore().getModel();

			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var a = sap.ui.core.format.DateFormat.getInstance({
				style: "short"
			});
			var i = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Status",
					value: "{Status}"
				}],
				measures: [{
					name: "Count",
					value: "{Count}"
				}],
				data: {
					path: "/activeChart"
				}
			});
			chart.setDataset(i);
			//	var o = this.getView().getModel("trendByObjSetModel");
			chart.setModel(test);

			//	for (var s = 0; s < this.reqTypeObjCollection.length; s++) {
			var l = new sap.viz.ui5.controls.common.feeds.FeedItem({
				uid: "size", //for donut this = "size"
				type: "Measure",
				values: ["Count"]
			});
			chart.addFeed(l);
			//	}
			var n = new sap.viz.ui5.controls.common.feeds.FeedItem({
				uid: "color", //for donut this = "color"
				type: "Dimension",
				values: ["Status"]
			});
			chart.addFeed(n);
			//	this.getView().byId("titleItem3").setInfo(test.getData().d.counts[0].Count + test.getData().d.counts[1].Count);

		},

/*		renderActiveChart: function () {
			var chart = this.getView().byId("inactiveChart");
			if (chart) {
				chart.destroyDataset();
				chart.destroyFeeds();
			}
			chart.setVizType("donut");
			chart.setVizProperties({
				plotArea: {
					colorPalette: this.reqTypeColors,
					dataLabel: {
						visible: true,
						defaultState: true,
						type: 'value'
					}
				},
				tooltip: {
					visible: true
				},
				legendGroup: {
					layout: {
						position: "bottom"
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
						text: "Device"
					}
				}
			});

			var test = sap.ui.getCore().getModel();

			jQuery.sap.require("sap.ui.core.format.DateFormat");
			var a = sap.ui.core.format.DateFormat.getInstance({
				style: "short"
			});
			var i = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: "Status",
					value: "{Status}"
				}],
				measures: [{
					name: "Count",
					value: "{Count}"
				}],
				data: {
					path: "/statusCount"
				}
			});
			chart.setDataset(i);
			//	var o = this.getView().getModel("trendByObjSetModel");
			chart.setModel(test);

			//	for (var s = 0; s < this.reqTypeObjCollection.length; s++) {
			var l = new sap.viz.ui5.controls.common.feeds.FeedItem({
				uid: "size", //for donut this = "size"
				type: "Measure",
				values: ["Count"]
			});
			chart.addFeed(l);
			//	}
			var n = new sap.viz.ui5.controls.common.feeds.FeedItem({
				uid: "color", //for donut this = "color"
				type: "Dimension",
				values: ["Status"]
			});
			chart.addFeed(n);
			//	this.getView().byId("titleItem3").setInfo(test.getData().d.counts[0].Count + test.getData().d.counts[1].Count);

		},*/

		onTabChange: function () {

			this.getView().byId("dynamicPageId").setHeaderExpanded(false); 
			this.screenSize2();
			
			var bar = this.getView().byId("iconTabBar");

			if (bar.getSelectedKey() === "appDetails") {
				this.onAppTab();
			}
			if (bar.getSelectedKey() === "deviceDetails") {
				this.onDeviceTab();
			}
			if (bar.getSelectedKey() === "userDetails") {
				this.onUserTab();
			}	
		},
		onAppTab: function () {
		
			var sData = sap.ui.getCore().getModel();
			var oItemsTable = this.getView().byId("oItemsTable");
			var oItemsTemplate = this.getView().byId("oItemsTemplate");
			oItemsTable.addStyleClass("sapUiSizeCozy");

			oItemsTable.setModel(sData);

			var oBindingInfo = {
				path: "/appCount",
				template: oItemsTemplate,

			};

			oItemsTable.bindAggregation("items", oBindingInfo);

		},
		onDeviceTab: function () {
		
			var sData = sap.ui.getCore().getModel();
			var oDeviceTable = this.getView().byId("oDeviceTable");
			var oDeviceTemplate = this.getView().byId("oDeviceTemplate");
			oDeviceTable.addStyleClass("sapUiSizeCozy");

			oDeviceTable.setModel(sData);

			var oBindingInfo = {
				path: "/deviceCount",
				template: oDeviceTemplate,

			};

			oDeviceTable.bindAggregation("items", oBindingInfo);

		},		
		onUserTab: function () {
		
			var sData = sap.ui.getCore().getModel();
			var oDeviceTable = this.getView().byId("oUserTable");
			var oDeviceTemplate = this.getView().byId("oUserTemplate");
			oDeviceTable.addStyleClass("sapUiSizeCozy");

			oDeviceTable.setModel(sData);

			var oBindingInfo = {
				path: "/userStatusList",
				template: oDeviceTemplate,

			};

			oDeviceTable.bindAggregation("items", oBindingInfo);
this.onUserSearch();
		},				

		onClickApp: function (oEvent) {
			
			//reset everything
			this.getView().byId("appFirefoxBox").setVisible(false);
			this.getView().byId("appSafariBox").setVisible(false);
			
				this.getView().byId("chromeAppCount").setText("0");
				this.getView().byId("safariAppCount").setText("0");
				this.getView().byId("edgeAppCount").setText("0");
				this.getView().byId("ieAppCount").setText("0");
				this.getView().byId("firefoxAppCount").setText("0");
				this.getView().byId("fioriClientAppCount").setText("0");
				this.getView().byId("desktopAppCount").setText("0");
				this.getView().byId("tabletAppCount").setText("0");
				this.getView().byId("mobileAppCount").setText("0");
				this.getView().byId("visitAppCount").setText("0");
				this.getView().byId("visitUserCount").setText("0");	
				
				this.getView().byId("appMacCount").setText("0");
				this.getView().byId("appWindowsCount").setText("0");
				this.getView().byId("appAndroidCount").setText("0");
				this.getView().byId("appOtherCount").setText("0");	
		
				this.getView().byId("userBox1").setVisible(false);
				this.getView().byId("user1").setText("");
				this.getView().byId("progress1").setDisplayValue("");
				this.getView().byId("progress1").setPercentValue("0");	
				this.getView().byId("userBox2").setVisible(false);
				this.getView().byId("user2").setText("");
				this.getView().byId("progress2").setDisplayValue("");
				this.getView().byId("progress2").setPercentValue("0");	
				this.getView().byId("userBox3").setVisible(false);
				this.getView().byId("user3").setText("");
				this.getView().byId("progress3").setDisplayValue("");
				this.getView().byId("progress3").setPercentValue("0");	
				this.getView().byId("userBox4").setVisible(false);
				this.getView().byId("user4").setText("");
				this.getView().byId("progress4").setDisplayValue("");
				this.getView().byId("progress4").setPercentValue("0");	
				this.getView().byId("userBox5").setVisible(false);
				this.getView().byId("user5").setText("");
				this.getView().byId("progress5").setDisplayValue("");
				this.getView().byId("progress5").setPercentValue("0");		
					
					//

			var row = oEvent.getSource().getBindingContext().getPath().split("/")[2];
			if (this.getView().byId("verticalHide").getVisible() === true){
			this.getView().byId("scrollBox").scrollToElement(this.getView().byId("verticalHide"), 999);
			}
			if (this.getView().byId("verticalShow").getVisible() === true){
			this.getView().byId("scrollBox").scrollToElement(this.getView().byId("verticalShow"), 999);
			}


			var app = sap.ui.getCore().getModel().getData().appCount[row].Appname;
			var model = sap.ui.getCore().getModel();
			var oItemsTable = this.getView().byId("oVisitsTable");
			var oItemsTemplate = this.getView().byId("oVisitsTemplate");	
			var appData = [];
			var userCount = [];
			var top5Users = [];
			var chrome = 0;
			var safari = 0;
			var edge = 0;
			var ie = 0;
			var fireFox = 0;
			var client = 0;
			var apple = 0;
			var windows = 0;
			var android = 0;
			var other = 0;
			
			this.getView().byId("verticalHide").setVisible(false);
			this.getView().byId("verticalShow").setVisible(true);
			
			this.getView().byId("selectedAppName").setText(app);
			
			for (var i = 0; i < model.getData().d.results.length; i++){
			
				if (model.getData().d.results[i].Appname ===app){
					appData.push(model.getData().d.results[i]); 
				}
			} 
		
			for (var d=0; d< appData.length;d++){
				if (appData[d].Browser === "Google Chrome"){
					chrome++;
				}
					if (appData[d].Browser === "Safari"){
					safari++;
				}
					if (appData[d].Browser === "Microsoft Edge"){
					edge++;
				}
					if (appData[d].Browser === "Mozilla Firefox"){
					fireFox++;
				}
					if (appData[d].Browser === "Internet Explorer"){
					ie++;
				}
					if (appData[d].Browser === "Fiori Client"){
					client++;
				}
					if (appData[d].OS === "Apple"){
					apple++;
				}
					if (appData[d].OS === "Windows"){
					windows++;
				}
					if (appData[d].OS === "Android"){
					android++;
				}
					if (appData[d].OS === "Other"){
					other++;
				}
				
			/*	this.getView().byId("chromeAppCount").setText(chrome);
				this.getView().byId("safariAppCount").setText(safari);
				if (safari > 0){
					this.getView().byId("appSafariBox").setVisible(true);
				}
				if (fireFox > 0){
					this.getView().byId("appFirefoxBox").setVisible(true);
				}			
				this.getView().byId("edgeAppCount").setText(edge);
				this.getView().byId("ieAppCount").setText(ie);
				this.getView().byId("firefoxAppCount").setText(fireFox);
				this.getView().byId("fioriClientAppCount").setText(client);
				
				this.getView().byId("appMacCount").setText(apple);
				this.getView().byId("appWindowsCount").setText(windows);
				this.getView().byId("appAndroidCount").setText(android);
				this.getView().byId("appOtherCount").setText(other);*/
				
				appData[d].NewDate = "";
				var dateString = appData[d].EDate;
				var year        = dateString.substring(0,4);
				var month       = dateString.substring(4,6);
				var day         = dateString.substring(6,8);

				var date        = new Date(year, month-1, day).toDateString();

				appData[d].NewDate = date;
				
				var timeString = appData[d].ETime;
				var hours = timeString.substring(0,2);
				var minutes = timeString.substring(2,4);
				var seconds = timeString.substring(4,6);
				
				if (hours < 12){
					var am = "am";
				}
				if (hours >= 12){
					var am="pm";
				}
				var time = hours +  ":" + minutes +  ":" +  seconds + " " + am;
				appData[d].NewTime = time;
				
				
				appData[d].NewDate2 = "";
				var dateString2 = appData[d].DDate;
				var year2        = dateString2.substring(0,4);
				var month2       = dateString2.substring(4,6);
				var day2         = dateString2.substring(6,8);

				var date2        = new Date(year, month-1, day).toDateString();

				appData[d].NewDate2 = date2;
				
				var timeString2 = appData[d].DTime;
				var hours2 = timeString2.substring(0,2);
				var minutes2 = timeString2.substring(2,4);
				var seconds2 = timeString2.substring(4,6);
				
				if (hours2 < 12){
					var am2 = "am";
				}
				if (hours2 >= 12){
					var am2="pm";
				}
				var time2 = hours2 +  ":" + minutes2 +  ":" +  seconds2 + " " + am2;
				appData[d].NewTime2 = time2;
			} 
			
			
				this.getView().byId("chromeAppCount").setText(chrome);
				this.getView().byId("safariAppCount").setText(safari);
				if (safari > 0){
					this.getView().byId("appSafariBox").setVisible(true);
				}
				if (fireFox > 0){
					this.getView().byId("appFirefoxBox").setVisible(true);
				}			
				this.getView().byId("edgeAppCount").setText(edge);
				this.getView().byId("ieAppCount").setText(ie);
				this.getView().byId("firefoxAppCount").setText(fireFox);
				this.getView().byId("fioriClientAppCount").setText(client);
				
				this.getView().byId("appMacCount").setText(apple);
				this.getView().byId("appWindowsCount").setText(windows);
				this.getView().byId("appAndroidCount").setText(android);
				this.getView().byId("appOtherCount").setText(other);
			
			var json = new sap.ui.model.json.JSONModel(appData);
			oItemsTable.setModel(json);

			var oBindingInfo = {
				path: "/",
				template: oItemsTemplate

			};

			oItemsTable.bindAggregation("items", oBindingInfo);
			
		for (var p = 0; p< model.getData().appCount.length; p++){
			if (model.getData().appCount[p].Appname === app){
				this.getView().byId("desktopAppCount").setText(model.getData().appCount[p].Desktop);
				this.getView().byId("tabletAppCount").setText(model.getData().appCount[p].Tablet);
				this.getView().byId("mobileAppCount").setText(model.getData().appCount[p].Phone);
			}
		}
			
				appData.forEach(function (a) {
						if (!this[a.Fullname]) {
							this[a.Fullname] = {
								Fullname: a.Fullname,
								Count: 0,

							};
							//  oData.d.createdCounts = [];
							userCount.push(this[a.Fullname]);

						}
						this[a.Fullname].Count++;

					}, Object.create(null));
					
					this.getView().byId("visitAppCount").setText(appData.length);
					this.getView().byId("visitUserCount").setText(userCount.length);

	userCount.sort(function (a, b) {
						return [b.Count] - [a.Count];
					});

	if (userCount.length > 5){
		for (var o = 0; o < 5; o++){
		top5Users.push(userCount[o]);
	//	userCount = top5Users;
		} 
			userCount = top5Users;
			}

			
var counts = userCount.map(function(item) {
    return item.Count;
});

// Sum the array's values from left to right
var total = counts.reduce(function(a, b)  {
    return a + b;
});	


			
	if (userCount.length >= 1){
		this.getView().byId("userBox1").setVisible(true);
		this.getView().byId("user1").setText(userCount[0].Fullname);
		this.getView().byId("progress1").setDisplayValue(userCount[0].Count);
		this.getView().byId("progress1").setPercentValue((100/total)* userCount[0].Count);
	}	
	if (userCount.length >= 2){
		this.getView().byId("userBox2").setVisible(true);
		this.getView().byId("user2").setText(userCount[1].Fullname);
		this.getView().byId("progress2").setDisplayValue(userCount[1].Count);
		this.getView().byId("progress2").setPercentValue((100/total)* userCount[1].Count);
	}
	if (userCount.length >= 3){
		this.getView().byId("userBox3").setVisible(true);
		this.getView().byId("user3").setText(userCount[2].Fullname);
		this.getView().byId("progress3").setDisplayValue(userCount[2].Count);
		this.getView().byId("progress3").setPercentValue((100/total)* userCount[2].Count);
	}	
	if (userCount.length >= 4){
		this.getView().byId("userBox4").setVisible(true);
		this.getView().byId("user4").setText(userCount[3].Fullname);
		this.getView().byId("progress4").setDisplayValue(userCount[3].Count);
		this.getView().byId("progress4").setPercentValue((100/total)* userCount[3].Count);
	}		
	if (userCount.length >= 5){
		this.getView().byId("userBox5").setVisible(true);
		this.getView().byId("user5").setText(userCount[4].Fullname);
		this.getView().byId("progress5").setDisplayValue(userCount[4].Count);
		this.getView().byId("progress5").setPercentValue((100/total)* userCount[4].Count);
	}				
			
		},
		
		onClickDevice: function (oEvent) {
			
			//reset everything
			this.getView().byId("deviceFirefoxBox").setVisible(false);
			this.getView().byId("deviceSafariBox").setVisible(false);
			
				this.getView().byId("chromeDeviceCount").setText("0");
				this.getView().byId("safariDeviceCount").setText("0");
				this.getView().byId("edgeDeviceCount").setText("0");
				this.getView().byId("ieDeviceCount").setText("0");
				this.getView().byId("firefoxDeviceCount").setText("0");
				this.getView().byId("fioriClientDeviceCount").setText("0");

				this.getView().byId("deviceVisitAppCount").setText("0");
				this.getView().byId("deviceVisitUserCount").setText("0");	
				
				this.getView().byId("deviceMacCount").setText("0");
				this.getView().byId("deviceWindowsCount").setText("0");
				this.getView().byId("deviceAndroidCount").setText("0");
				this.getView().byId("deviceOtherCount").setText("0");	
		
				this.getView().byId("deviceUserBox1").setVisible(false);
				this.getView().byId("deviceUser1").setText("");
				this.getView().byId("deviceProgress1").setDisplayValue("");
				this.getView().byId("deviceProgress1").setPercentValue("0");	
				this.getView().byId("deviceUserBox2").setVisible(false);
				this.getView().byId("deviceUser2").setText("");
				this.getView().byId("deviceProgress2").setDisplayValue("");
				this.getView().byId("deviceProgress2").setPercentValue("0");	
				this.getView().byId("deviceUserBox3").setVisible(false);
				this.getView().byId("deviceUser3").setText("");
				this.getView().byId("deviceProgress3").setDisplayValue("");
				this.getView().byId("deviceProgress3").setPercentValue("0");	
				this.getView().byId("deviceUserBox4").setVisible(false);
				this.getView().byId("deviceUser4").setText("");
				this.getView().byId("deviceProgress4").setDisplayValue("");
				this.getView().byId("deviceProgress4").setPercentValue("0");	
				this.getView().byId("deviceUserBox5").setVisible(false);
				this.getView().byId("deviceUser5").setText("");
				this.getView().byId("deviceProgress5").setDisplayValue("");
				this.getView().byId("deviceProgress5").setPercentValue("0");		
					
					//

			var row = oEvent.getSource().getBindingContext().getPath().split("/")[2];
			if (this.getView().byId("deviceVerticalHide").getVisible() === true){
			this.getView().byId("deviceScrollBox").scrollToElement(this.getView().byId("deviceVerticalHide"), 999);
			}
			if (this.getView().byId("deviceVerticalShow").getVisible() === true){
			this.getView().byId("deviceScrollBox").scrollToElement(this.getView().byId("deviceVerticalShow"), 999);
			}


			var app = sap.ui.getCore().getModel().getData().deviceCount[row].Device;
			var model = sap.ui.getCore().getModel();
			var oItemsTable = this.getView().byId("oDevice2Table");
			var oItemsTemplate = this.getView().byId("oDevice2Template");	
			var appData = [];
			var userCount = [];
			var top5Users = [];
			var chrome = 0;
			var safari = 0;
			var edge = 0;
			var ie = 0;
			var fireFox = 0;
			var client = 0;
			var apple = 0;
			var windows = 0;
			var android = 0;
			var other = 0;
			
			this.getView().byId("deviceVerticalHide").setVisible(false);
			this.getView().byId("deviceVerticalShow").setVisible(true);
			
			this.getView().byId("selectedDeviceName").setText(app);
			
			for (var i = 0; i < model.getData().d.results.length; i++){
			
				if (model.getData().d.results[i].Device ===app){
					appData.push(model.getData().d.results[i]); 
				}
			} 
		
			for (var d=0; d< appData.length;d++){
				if (appData[d].Browser === "Google Chrome"){
					chrome++;
				}
					if (appData[d].Browser === "Safari"){
					safari++;
				}
					if (appData[d].Browser === "Microsoft Edge"){
					edge++;
				}
					if (appData[d].Browser === "Mozilla Firefox"){
					fireFox++;
				}
					if (appData[d].Browser === "Internet Explorer"){
					ie++;
				}
					if (appData[d].Browser === "Fiori Client"){
					client++;
				}
					if (appData[d].OS === "Apple"){
					apple++;
				}
					if (appData[d].OS === "Windows"){
					windows++;
				}
					if (appData[d].OS === "Android"){
					android++;
				}
					if (appData[d].OS === "Other"){
					other++;
				}
		
				appData[d].NewDate = "";
				var dateString = appData[d].EDate;
				var year        = dateString.substring(0,4);
				var month       = dateString.substring(4,6);
				var day         = dateString.substring(6,8);

				var date        = new Date(year, month-1, day).toDateString();

				appData[d].NewDate = date;
				
				var timeString = appData[d].ETime;
				var hours = timeString.substring(0,2);
				var minutes = timeString.substring(2,4);
				var seconds = timeString.substring(4,6);
				
				if (hours < 12){
					var am = "am";
				}
				if (hours >= 12){
					var am="pm";
				}
				var time = hours +  ":" + minutes +  ":" +  seconds + " " + am;
				appData[d].NewTime = time;
				
					appData[d].NewDate2 = "";
				var dateString2 = appData[d].DDate;
				var year2        = dateString2.substring(0,4);
				var month2       = dateString2.substring(4,6);
				var day2         = dateString2.substring(6,8);

				var date2        = new Date(year, month-1, day).toDateString();

				appData[d].NewDate2 = date2;
				
				var timeString2 = appData[d].DTime;
				var hours2 = timeString2.substring(0,2);
				var minutes2 = timeString2.substring(2,4);
				var seconds2 = timeString2.substring(4,6);
				
				if (hours2 < 12){
					var am2 = "am";
				}
				if (hours2 >= 12){
					var am2="pm";
				}
				var time2 = hours2 +  ":" + minutes2 +  ":" +  seconds2 + " " + am2;
				appData[d].NewTime2 = time2;
			} 
			
			
				this.getView().byId("chromeDeviceCount").setText(chrome);
				this.getView().byId("safariDeviceCount").setText(safari);
				if (safari > 0){
					this.getView().byId("deviceSafariBox").setVisible(true);
				}
				if (fireFox > 0){
					this.getView().byId("deviceFirefoxBox").setVisible(true);
				}			
				this.getView().byId("edgeDeviceCount").setText(edge);
				this.getView().byId("ieDeviceCount").setText(ie);
				this.getView().byId("firefoxDeviceCount").setText(fireFox);
				this.getView().byId("fioriClientDeviceCount").setText(client);
				
				this.getView().byId("deviceMacCount").setText(apple);
				this.getView().byId("deviceWindowsCount").setText(windows);
				this.getView().byId("deviceAndroidCount").setText(android);
				this.getView().byId("deviceOtherCount").setText(other);
			
			var json = new sap.ui.model.json.JSONModel(appData);
			oItemsTable.setModel(json);

			var oBindingInfo = {
				path: "/",
				template: oItemsTemplate

			};

			oItemsTable.bindAggregation("items", oBindingInfo);
			
/*		for (var p = 0; p< model.getData().appCount.length; p++){
			if (model.getData().appCount[p].Appname === app){
				this.getView().byId("desktopDeviceCount").setText(model.getData().appCount[p].Desktop);
				this.getView().byId("tabletDeviceCount").setText(model.getData().appCount[p].Tablet);
				this.getView().byId("mobileDeviceCount").setText(model.getData().appCount[p].Phone);
			}
		}*/
			
				appData.forEach(function (a) {
						if (!this[a.Fullname]) {
							this[a.Fullname] = {
								Fullname: a.Fullname,
								Count: 0,

							};
							//  oData.d.createdCounts = [];
							userCount.push(this[a.Fullname]);

						}
						this[a.Fullname].Count++;

					}, Object.create(null));
					
					this.getView().byId("deviceVisitAppCount").setText(appData.length);
					this.getView().byId("deviceVisitUserCount").setText(userCount.length);

	userCount.sort(function (a, b) {
						return [b.Count] - [a.Count];
					});

	if (userCount.length > 5){
		for (var o = 0; o < 5; o++){
		top5Users.push(userCount[o]);
	//	userCount = top5Users;
		} 
			userCount = top5Users;
			}

			
var counts = userCount.map(function(item) {
    return item.Count;
});

// Sum the array's values from left to right
var total = counts.reduce(function(a, b)  {
    return a + b;
});	


			
	if (userCount.length >= 1){
		this.getView().byId("deviceUserBox1").setVisible(true);
		this.getView().byId("deviceUser1").setText(userCount[0].Fullname);
		this.getView().byId("deviceProgress1").setDisplayValue(userCount[0].Count);
		this.getView().byId("deviceProgress1").setPercentValue((100/total)* userCount[0].Count);
	}	
	if (userCount.length >= 2){
		this.getView().byId("deviceUserBox2").setVisible(true);
		this.getView().byId("deviceUser2").setText(userCount[1].Fullname);
		this.getView().byId("deviceProgress2").setDisplayValue(userCount[1].Count);
		this.getView().byId("deviceProgress2").setPercentValue((100/total)* userCount[1].Count);
	}
	if (userCount.length >= 3){
		this.getView().byId("deviceUserBox3").setVisible(true);
		this.getView().byId("deviceUser3").setText(userCount[2].Fullname);
		this.getView().byId("deviceProgress3").setDisplayValue(userCount[2].Count);
		this.getView().byId("deviceProgress3").setPercentValue((100/total)* userCount[2].Count);
	}	
	if (userCount.length >= 4){
		this.getView().byId("deviceUserBox4").setVisible(true);
		this.getView().byId("deviceUser4").setText(userCount[3].Fullname);
		this.getView().byId("deviceProgress4").setDisplayValue(userCount[3].Count);
		this.getView().byId("deviceProgress4").setPercentValue((100/total)* userCount[3].Count);
	}		
	if (userCount.length >= 5){
		this.getView().byId("deviceUserBox5").setVisible(true);
		this.getView().byId("deviceUser5").setText(userCount[4].Fullname);
		this.getView().byId("deviceProgress5").setDisplayValue(userCount[4].Count);
		this.getView().byId("deviceProgress5").setPercentValue((100/total)* userCount[4].Count);
	}				
			
		},	
	
		onClickUser: function (oEvent) {
			
			//reset everything
			this.getView().byId("userFirefoxBox").setVisible(false);
			this.getView().byId("userSafariBox").setVisible(false);
			
				this.getView().byId("chromeUserCount").setText("0");
				this.getView().byId("safariUserCount").setText("0");
				this.getView().byId("edgeUserCount").setText("0");
				this.getView().byId("ieUserCount").setText("0");
				this.getView().byId("firefoxUserCount").setText("0");
				this.getView().byId("fioriClientUserCount").setText("0");

				this.getView().byId("userVisitAppCount").setText("0");
			//	this.getView().byId("userVisitUserCount").setText("0");	
				
				this.getView().byId("userMacCount").setText("0");
				this.getView().byId("userWindowsCount").setText("0");
				this.getView().byId("userAndroidCount").setText("0");
				this.getView().byId("userOtherCount").setText("0");	
		
			
					//

			var row = oEvent.getSource().getBindingContext().getPath().split("/")[2];
			if (this.getView().byId("userVerticalHide").getVisible() === true){
			this.getView().byId("userScrollBox").scrollToElement(this.getView().byId("userVerticalHide"), 999);
			}
			if (this.getView().byId("userVerticalShow").getVisible() === true){
			this.getView().byId("userScrollBox").scrollToElement(this.getView().byId("userVerticalShow"), 999);
			}


			var app = sap.ui.getCore().getModel().getData().userStatusList[row].Fullname;
			var model = sap.ui.getCore().getModel();
			var oItemsTable = this.getView().byId("oUser2Table");
			var oItemsTemplate = this.getView().byId("oUser2Template");	
			var appData = [];
			var userCount = [];
			var top5Users = [];
			var chrome = 0;
			var safari = 0;
			var edge = 0;
			var ie = 0;
			var fireFox = 0;
			var client = 0;
			var apple = 0;
			var windows = 0;
			var android = 0;
			var other = 0;
			
			this.getView().byId("userVerticalHide").setVisible(false);
			this.getView().byId("userVerticalShow").setVisible(true);
			
			this.getView().byId("selectedUserName").setText(app);
			
			for (var i = 0; i < model.getData().d.results.length; i++){
			
				if (model.getData().d.results[i].Fullname ===app){
					appData.push(model.getData().d.results[i]); 
				}
			} 
		
			for (var d=0; d< appData.length;d++){
				if (appData[d].Browser === "Google Chrome"){
					chrome++;
				}
					if (appData[d].Browser === "Safari"){
					safari++;
				}
					if (appData[d].Browser === "Microsoft Edge"){
					edge++;
				}
					if (appData[d].Browser === "Mozilla Firefox"){
					fireFox++;
				}
					if (appData[d].Browser === "Internet Explorer"){
					ie++;
				}
					if (appData[d].Browser === "Fiori Client"){
					client++;
				}
					if (appData[d].OS === "Apple"){
					apple++;
				}
					if (appData[d].OS === "Windows"){
					windows++;
				}
					if (appData[d].OS === "Android"){
					android++;
				}
					if (appData[d].OS === "Other"){
					other++;
				}
		
				appData[d].NewDate = "";
				var dateString = appData[d].EDate;
				var year        = dateString.substring(0,4);
				var month       = dateString.substring(4,6);
				var day         = dateString.substring(6,8);

				var date        = new Date(year, month-1, day).toDateString();

				appData[d].NewDate = date;
				
				var timeString = appData[d].ETime;
				var hours = timeString.substring(0,2);
				var minutes = timeString.substring(2,4);
				var seconds = timeString.substring(4,6);
				
				if (hours < 12){
					var am = "am";
				}
				if (hours >= 12){
					var am="pm";
				}
				var time = hours +  ":" + minutes +  ":" +  seconds + " " + am;
				appData[d].NewTime = time;
				
					appData[d].NewDate2 = "";
				var dateString2 = appData[d].DDate;
				var year2        = dateString2.substring(0,4);
				var month2       = dateString2.substring(4,6);
				var day2         = dateString2.substring(6,8);

				var date2        = new Date(year, month-1, day).toDateString();

				appData[d].NewDate2 = date2;
				
				var timeString2 = appData[d].DTime;
				var hours2 = timeString2.substring(0,2);
				var minutes2 = timeString2.substring(2,4);
				var seconds2 = timeString2.substring(4,6);
				
				if (hours2 < 12){
					var am2 = "am";
				}
				if (hours2 >= 12){
					var am2="pm";
				}
				var time2 = hours2 +  ":" + minutes2 +  ":" +  seconds2 + " " + am2;
				appData[d].NewTime2 = time2;
			} 
			
			
				this.getView().byId("chromeUserCount").setText(chrome);
				this.getView().byId("safariUserCount").setText(safari);
				if (safari > 0){
					this.getView().byId("userSafariBox").setVisible(true);
				}
				if (fireFox > 0){
					this.getView().byId("userFirefoxBox").setVisible(true);
				}			
				this.getView().byId("edgeUserCount").setText(edge);
				this.getView().byId("ieUserCount").setText(ie);
				this.getView().byId("firefoxUserCount").setText(fireFox);
				this.getView().byId("fioriClientUserCount").setText(client);
				
				this.getView().byId("userMacCount").setText(apple);
				this.getView().byId("userWindowsCount").setText(windows);
				this.getView().byId("userAndroidCount").setText(android);
				this.getView().byId("userOtherCount").setText(other);
			
			var json = new sap.ui.model.json.JSONModel(appData);
			oItemsTable.setModel(json);

			var oBindingInfo = {
				path: "/",
				template: oItemsTemplate

			};

			oItemsTable.bindAggregation("items", oBindingInfo);
			
	for (var p = 0; p< model.getData().userCount.length; p++){
			if (model.getData().userCount[p].Fullname === app){
				this.getView().byId("desktopUserCount").setText(model.getData().userCount[p].Desktop);
				this.getView().byId("tabletUserCount").setText(model.getData().userCount[p].Tablet);
				this.getView().byId("mobileUserCount").setText(model.getData().userCount[p].Phone);
			}
		}
			
				appData.forEach(function (a) {
						if (!this[a.Fullname]) {
							this[a.Fullname] = {
								Fullname: a.Fullname,
								Count: 0,

							};
							//  oData.d.createdCounts = [];
							userCount.push(this[a.Fullname]);

						}
						this[a.Fullname].Count++;

					}, Object.create(null));
					
					this.getView().byId("userVisitAppCount").setText(appData.length);
				//	this.getView().byId("userVisitUserCount").setText(userCount.length);


			
		},			
		
		onAppSearch: function (oEvent) {

			var sQuery = oEvent.getParameter("query");
			var filters;
			if (!sQuery) {
				filters = new Filter("Appname", FilterOperator.Contains, "");
			} else {
				var appFilter = new Filter("Appname", FilterOperator.Contains, sQuery);
	
				filters = new Filter([appFilter], false);
			}
			var oItemsTable = this.getView().byId("oItemsTable");
			var oBinding = oItemsTable.getBinding("items");
			oBinding.filter(filters);
		},
		
				onUserSearch: function (oEvent) {

			//var sQuery = oEvent.getParameter("query");
			var sQuery = this.getView().byId("userSearchField").getValue();
			var switchQuery = this.getView().byId("userSwitch").getState();
			
			var filters;
			if (sQuery === "") {
			var search = new Filter("UserId", FilterOperator.Contains, "");
			} 
			if (sQuery !== "") {
			var search = new Filter("UserId", FilterOperator.Contains, sQuery);
			} 
			if (switchQuery === true){
				var state = new Filter("Status", FilterOperator.Contains, "sap-icon://status-completed");
			}
			if (switchQuery === false) {
				var state = new Filter("Status", FilterOperator.Contains, "sap-icon://status-inactive");
			}
			
			filters = new Filter([search, state], true);
			
			var oItemsTable = this.getView().byId("oUserTable");
			var oBinding = oItemsTable.getBinding("items");
			oBinding.filter(filters);
		},
		
					onActiveSwitch: function (oEvent) {

			var sQuery = this.getView().byId("userSwitch").getState();
			
			var filters;
			if (sQuery) {
				filters = new Filter("Status", FilterOperator.Contains, "sap-icon://status-completed");
			} else {
				var appFilter = new Filter("Status", FilterOperator.Contains, "sap-icon://status-inactive");
	
				filters = new Filter([appFilter], false);
			}
			var oItemsTable = this.getView().byId("oUserTable");
			var oBinding = oItemsTable.getBinding("items");
			oBinding.filter(filters);
		},
		
		screenSize:function(oEvent){
			
			var state= oEvent.getParameter("isExpanded");
	// 	var state = this.getView().byId("dynamicPageId").getHeaderExpanded();
			if (sap.ui.Device.system.desktop === true){
			var collapsedSize = (window.screen.height) * 0.67;
			var expandedSize = (window.screen.height) * 0.55;
			}
			if (sap.ui.Device.system.tablet === true){
			var collapsedSize = (window.screen.height) * 0.82;
			var expandedSize = (window.screen.height) * 0.72;
			}
			if (sap.ui.Device.system.phone === true){
			var collapsedSize = (window.screen.height) * 0.72;
			var expandedSize = (window.screen.height) * 0.60;
			}
			
			if (state === true){
				this.getView().byId("scrollBox").setHeight(expandedSize+"px");
				this.getView().byId("deviceScrollBox").setHeight(expandedSize+"px");
				this.getView().byId("userScrollBox").setHeight(expandedSize+"px");
			}
			if (state===false){
					this.getView().byId("scrollBox").setHeight(collapsedSize+"px");
					this.getView().byId("deviceScrollBox").setHeight(collapsedSize+"px");
					this.getView().byId("userScrollBox").setHeight(collapsedSize+"px");
			}
	
		},
			screenSize2:function(oEvent){
			
	//		var state= oEvent.getParameter("isExpanded");
	 	var state = this.getView().byId("dynamicPageId").getHeaderExpanded();
			if (sap.ui.Device.system.desktop === true){
			var collapsedSize = (window.screen.height) * 0.67;
			var expandedSize = (window.screen.height) * 0.55;
			}
			if (sap.ui.Device.system.tablet === true){
			var collapsedSize = (window.screen.height) * 0.82;
			var expandedSize = (window.screen.height) * 0.72;
			}
			if (sap.ui.Device.system.phone === true){
			var collapsedSize = (window.screen.height) * 0.72;
			var expandedSize = (window.screen.height) * 0.60;
			}
			
			if (state === true){
				this.getView().byId("scrollBox").setHeight(expandedSize+"px");
				this.getView().byId("deviceScrollBox").setHeight(expandedSize+"px");
				this.getView().byId("userScrollBox").setHeight(expandedSize+"px");
			}
			if (state===false){
					this.getView().byId("scrollBox").setHeight(collapsedSize+"px");
					this.getView().byId("deviceScrollBox").setHeight(collapsedSize+"px");
					this.getView().byId("userScrollBox").setHeight(collapsedSize+"px");
			}
	
		}

	});

});