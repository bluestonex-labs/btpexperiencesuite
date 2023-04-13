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

        return Controller.extend("bsx.btpexperiencesuiteui.controller.CONFIG.configTree", {
            onInit: function () {

       
            },

            onSegPress: function (oEvent){


                var btpBox = this.getView().byId("btpSetup");
                var erpBox = this.getView().byId("systemSetup");

                if (oEvent.getSource().getSelectedKey() === "BTP"){
                    btpBox.setVisible(true);
                    erpBox.setVisible(false);
                }
                else {
                    btpBox.setVisible(false);
                    erpBox.setVisible(true);
                }
            },
            
            onAfterRendering: function() {
               
            },
            navToCustomers: function(){
                this.getOwnerComponent().getRouter().navTo("CPEACUST");
            },

            navBack:function(){
                history.go(-1);
            },

            onListSelect: function (oEvent){

            
                var btpList = this.getView().byId("btpList");
                var gwList = this.getView().byId("gwList");
                var erpList = this.getView().byId("erpList");

                var btpSwitch = this.getView().byId("btpSwitch");
                var gwSwitch = this.getView().byId("gwSwitch");
                var erpSwitch = this.getView().byId("erpSwitch");

                var title = this.getView().byId("rolesTitle");

                var accessSection = this.getView().byId("accessSection");

                if (oEvent.getSource().getId().includes("btp")){
                    accessSection.setVisible(true);
                    btpSwitch.setState(true);
                    gwList.removeSelections();
                    erpList.removeSelections();        
                    title.setText("BTP Access");      
                }

                if (oEvent.getSource().getId().includes("gw")){
                    accessSection.setVisible(true);
                    gwSwitch.setState(true);
                    btpList.removeSelections();
                    erpList.removeSelections();    
                    title.setText("Gateway Access");                
                }

                if (oEvent.getSource().getId().includes("erp")){
                    accessSection.setVisible(true);
                    erpSwitch.setState(true);
                    gwList.removeSelections();
                    btpList.removeSelections();    
                    title.setText("ERP Access");                
                }

            },

        

        });
    });
