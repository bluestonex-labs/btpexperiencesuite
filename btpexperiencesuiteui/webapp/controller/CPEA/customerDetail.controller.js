sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/mvc/View",
    "sap/ui/core/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, FlattenedDataset, XMLView, View, CoreLibrary) {
        "use strict";

        return Controller.extend("bsx.btpexperiencesuiteui.controller.CPEA.customerDetail", {
            onInit: function () {

               
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
            
            onAfterRendering: function() {
                this.createDetailConsumptionChart();
            },
            navToCustomers: function(){
                this.getOwnerComponent().getRouter().navTo("CPEACUST");
            },

            navBack:function(){
                history.go(-1);
            },

            createDetailConsumptionChartOld: function(){
                /* Bind line chart */
                var oVizFrameLine = this.getView().byId("detailConsumption");
                var oModelLine = new sap.ui.model.json.JSONModel();
                var dataLine = {
                        "Population" : [
                            {"Year": "2010","Value": "158626687"},
                            {"Year": "2011","Value": "531160986"},
                            {"Year": "2012","Value": "915105168"},
                            {"Year": "2013","Value": "1093786762"},
                            {"Year": "2014","Value": "1274018495"},
                            {"Year": "2015","Value": "1274018496"}
                        ]};
                oModelLine.setData(dataLine);

                var oDatasetLine = new FlattenedDataset({
                    dimensions : [{
                        name : "Year",
                        value : "{Year}"}],
                                   
                    measures : [{
                        name : "Population",
                        value : "{Value}"} ],
                                 
                    data : {
                        path : "/Population"
                    }
                });		
                oVizFrameLine.setDataset(oDatasetLine);
                oVizFrameLine.setModel(oModelLine);	
                oVizFrameLine.setVizType('line');

                // oVizFrameLine.setVizProperties({
                //     plotArea: {
                //         colorPalette : d3.scale.category20().range()
                //         }});
                
                var feedValueAxisLine = new sap.viz.ui5.controls.common.feeds.FeedItem({
                      'uid': "valueAxis",
                      'type': "Measure",
                      'values': ["Population"]
                    }), 
                    feedCategoryAxisLine = new sap.viz.ui5.controls.common.feeds.FeedItem({
                      'uid': "categoryAxis",
                      'type': "Dimension",
                      'values': ["Year"]
                    });
                oVizFrameLine.addFeed(feedValueAxisLine);
                oVizFrameLine.addFeed(feedCategoryAxisLine);
            },

            createDetailConsumptionChart: function (oEvent){
                var chart = this.getView().byId("appChart");
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
                                Count: 90,
                                Type: "January"
                                },
                                    1: {
                                Count: 80,
                                Type: "February"
                                },
                                    2: {
                                Count: 85,
                                Type: "March"
                                },
                                    3: {
                                Count: 70,
                                Type: "April"
                                },
                                    4: {
                                Count: 80,
                                Type: "May"
                                },
                                    5: {
                                Count: 95,
                                Type: "June"
                                },
                                    6: {
                                Count: 75,
                                Type: "July"
                                },
                                        7: {
                                Count: 60,
                                Type: "August"
                                },
                                8: {
                                    Count: 60,
                                    Type: "September"
                                    },
                                    9: {
                                        Count: 90,
                                        Type: "October"
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
                            value: "{Type}"
                        }],
                        measures: [{
                            name: "Consumption",
                            value: "{Count}"
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
                            values: ["Consumption"]
                        });
                        chart.addFeed(l);
                //	}
                    var n = new sap.viz.ui5.controls.common.feeds.FeedItem({
                        uid: "categoryAxis", //for donut this = "color"
                        type: "Dimension",
                        values: ["Month"]
                    });
                    chart.addFeed(n);
                    
                }
        });
    });
