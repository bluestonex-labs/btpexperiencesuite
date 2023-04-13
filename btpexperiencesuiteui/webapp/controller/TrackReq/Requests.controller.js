sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        return Controller.extend("bsx.btpexperiencesuiteui.controller.TrackReq.Requests", {
            onInit: function () {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.getRoute("Track").attachMatched(this._onRouteMatched, this);

                var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
                this._oComponent = sap.ui.component(sComponentId);

                			// Global variables for filtering the master list
			this._oComponent.objTypeFilter = "";
			this._oComponent.reqTypeFilter = "";
			this._oComponent.templateFilter = "";
			this._oComponent.crStatusFilter = "O";
			this._oComponent.crCreatedByFilter = "";

            },
            _onRouteMatched: function (oEvent) {
                this.fetchRequests();
            },
            onAfterRendering: function () {

            },
            fetchRequests: function () {
                var oGlobalBusyDialog = new sap.m.BusyDialog();
                oGlobalBusyDialog.open();
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var that = this;
                $.ajax({
                    url: appModulePath + "/sap/opu/odata/bsxc/ZMXT_PROC_REV_SRV/Get_request_lstSet",
                    type: "GET",
                    contentType: "application/json",
                    dataType: "json",
                    async: true,
                    success: function (oData, response) {
                        oGlobalBusyDialog.close();
                        alert("success");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        oGlobalBusyDialog.close();
                        alert("Error");
                        console.log(jqXHR.responseText); // , "ERROR", "Service call error");
                    }
                }, this);
            },
            handleLiveChange: function (oEvent) {
                if (oEvent.getParameter("value")) {
                    this._oComponent.crCreatedByFilter = oEvent.getParameter("value").toUpperCase();
                } else {
                    this._oComponent.crCreatedByFilter = "";
                }
    
            },
            onFilterPress: function (oEvent) {
                var oView = this.getView();
    
                if (!this._trackReqFilterDialog) {
                    this._trackReqFilterDialog = sap.ui.xmlfragment("bsxccx.cloudsuiteui.fragments.TrackReq.filter", this);
                }
    
                this._trackReqFilterDialog.setModel(this.getView().getModel());
                // toggle compact style
                jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._trackReqFilterDialog);
                oView.addDependent(this._trackReqFilterDialog);
                this._trackReqFilterDialog.open();
            }, 
            onFilterClose: function (oEvent) {
                this._trackReqFilterDialog.close();
            },
    
            onFilterConfirm: function (oEvent) {
                var aFilters = [];
    
                var sQuery = '';//this.getView().byId('searchField').getValue();
    
                if (sQuery && sQuery.length > 0) {
    
                    //OR clauses
                    //var oFilterCrNo_OR = new sap.ui.model.Filter("CrNo", sap.ui.model.FilterOperator.EQ, sQuery);
                    var oFilterCrDesc_OR = new sap.ui.model.Filter("CrDesc", sap.ui.model.FilterOperator.EQ, sQuery);
    
                    //AND clauses
    
                    var oFilterreqType_AND = new sap.ui.model.Filter("CrType", sap.ui.model.FilterOperator.EQ, this._oComponent.reqTypeFilter);
                    var oFilterStatus_AND = new sap.ui.model.Filter("CrStatus", sap.ui.model.FilterOperator.EQ, this._oComponent.crStatusFilter);
                    var oFilterObjType_AND = new sap.ui.model.Filter("ObjectName", sap.ui.model.FilterOperator.EQ, this._oComponent.objTypeFilter);
                    var oFilterTemplate_AND = new sap.ui.model.Filter("CrTemplate", sap.ui.model.FilterOperator.EQ, this._oComponent.templateFilter);
                    var oFilterCreatedBy_AND = new sap.ui.model.Filter("CrCrtdBy", sap.ui.model.FilterOperator.EQ, this._oComponent.crCreatedByFilter);
    
                    var filter_ORS = new sap.ui.model.Filter([oFilterCrDesc_OR], false);
                    var filter_ANDS = new sap.ui.model.Filter([filter_ORS, oFilterreqType_AND, oFilterStatus_AND, oFilterObjType_AND,
                        oFilterTemplate_AND, oFilterCreatedBy_AND
                    ], true);
    
                    aFilters.push(filter_ANDS);
    
                } else {
    
                    // searching for empty string - search box is empty
                    var oFilterreqType = new sap.ui.model.Filter("CrType", sap.ui.model.FilterOperator.EQ, this._oComponent.reqTypeFilter);
                    var oFilterStatus = new sap.ui.model.Filter("CrStatus", sap.ui.model.FilterOperator.EQ, this._oComponent.crStatusFilter);
                    var oFilterObjType = new sap.ui.model.Filter("ObjectName", sap.ui.model.FilterOperator.EQ, this._oComponent.objTypeFilter);
                    var oFilterTemplate = new sap.ui.model.Filter("CrTemplate", sap.ui.model.FilterOperator.EQ, this._oComponent.templateFilter);
                    var oFilterCreatedBy = new sap.ui.model.Filter("CrCrtdBy", sap.ui.model.FilterOperator.EQ, this._oComponent.crCreatedByFilter);
                    var filter = new sap.ui.model.Filter([oFilterreqType, oFilterStatus, oFilterObjType, oFilterTemplate, oFilterCreatedBy], true);
    
                    aFilters.push(filter);
    
                }
    
                var list = this.getView().byId('tblReqList');
    
                var binding = list.getBinding("items");
                binding.filter(aFilters, sap.ui.model.FilterType.Application);
                if (this._trackReqFilterDialog.open()) {
                    this._trackReqFilterDialog.close();
                }
            },           
        });
    });
