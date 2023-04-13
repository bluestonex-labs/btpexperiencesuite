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

        return Controller.extend("bsx.btpexperiencesuiteui.controller.CPEA.customerOverview", {
            onInit: function () {

                this.getOwnerComponent().getRouter().getRoute("CPEACUST").attachPatternMatched(this._onCpeaCustRouteMatched, this);

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

            _onCpeaCustRouteMatched: function(){
                var oModel = sap.ui.getCore().getModel("oCustomerModel");
                this.getView().setModel(oModel, "oCustomerModel");
            },

            navToCustomers: function(){
                this.getOwnerComponent().getRouter().navTo("CPEACUST");
            },

            navBack:function(){
                history.go(-1);
            },

            onCustomerPress:function(){

                this.getOwnerComponent().getRouter().navTo("CPEACUSTDETAIL");
            }


        });
    });
