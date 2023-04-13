sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/mvc/View",
    "sap/ui/core/library",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, FlattenedDataset, XMLView, View, CoreLibrary, BusyIndicator, MessageBox, MessageToast) {
        "use strict";

        return Controller.extend("bsx.btpexperiencesuiteui.controller.MANAGE.createUser", {
            onInit: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                this.appModulePath = jQuery.sap.getModulePath(appPath);

                var oUsrMdl = this.getOwnerComponent().getModel("userModel");
                var oUsrMdlData = oUsrMdl.getData();

                if (oUsrMdlData.decodedJWTToken) {
                    this.oLocation = oUsrMdlData.decodedJWTToken.origin;
                    this.subAccId = oUsrMdlData.decodedJWTToken.ext_attr.subaccountid;
                } else {
                    this.oLocation = "";
                }

                //Create JSON Model for IDP users
                var oIdpUsersModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oIdpUsersModel, "oIdpUsersModel");

                this.getOwnerComponent().getRouter().getRoute("MANAGECREATE").attachPatternMatched(this._onManageRouteMatched, this);

            },

            onAfterRendering: function () {

            },

            _onManageRouteMatched: function(){
                this.getLoggedInUserDetails();
                this.getLoggedInUserLocationDetails();
                this.clearInputFields();
            },

            clearInputFields: function () {
                this.getView().byId("sFirstName").setValue("");
                this.getView().byId("sLastName").setValue("");
                this.getView().byId("sEmailFld").setSelectedKey("");
                this.getView().byId("sUserNameFld").setValue("");
                this.getView().byId("sUserPasswordFld").setValue("");
                this.getView().byId("expDate").setValue("");
                this.getView().byId("sUserPasswordFld").setValue("");

                //this.getView().byId("createUserBtn").setEnabled(false);
                //    this.getView().byId("sEmailFld").setValue("");
                //    this.getView().byId("sUserNameFld").setValue("");
            },
            navToCustomers: function () {
                this.getOwnerComponent().getRouter().navTo("CPEACUST");
            },

            navBack: function () {
                history.go(-1);
            },

            onListSelect: function (oEvent) {


                var btpList = this.getView().byId("btpList");
                var gwList = this.getView().byId("gwList");
                var erpList = this.getView().byId("erpList");

                var btpSwitch = this.getView().byId("btpSwitch");
                var gwSwitch = this.getView().byId("gwSwitch");
                var erpSwitch = this.getView().byId("erpSwitch");

                var title = this.getView().byId("rolesTitle");

                var accessSection = this.getView().byId("accessSection");

                if (oEvent.getSource().getId().includes("btp")) {
                    accessSection.setVisible(true);
                    btpSwitch.setState(true);
                    gwList.removeSelections();
                    erpList.removeSelections();
                    title.setText("BTP Access");
                }

                if (oEvent.getSource().getId().includes("gw")) {
                    accessSection.setVisible(true);
                    gwSwitch.setState(true);
                    btpList.removeSelections();
                    erpList.removeSelections();
                    title.setText("Gateway Access");
                }

                if (oEvent.getSource().getId().includes("erp")) {
                    accessSection.setVisible(true);
                    erpSwitch.setState(true);
                    gwList.removeSelections();
                    btpList.removeSelections();
                    title.setText("ERP Access");
                }

            },

            onSegPress: function (oEvent) {
                var box = this.getView().byId("employeeBox");

                if (oEvent.getSource().getSelectedKey() === "P") {
                    box.setVisible(true);
                }
                else {
                    box.setVisible(false);
                }
            },

            getLoggedInUserDetails: function () {
                BusyIndicator.show();
                var sDest = "/user-api";
                var sUrl = this.appModulePath + sDest + "/currentUser";
                this.loggedinUserEmail = "";
                this.firstname = "";
                this.lastname = "";
                this.name = "";
                this.displayName = "";

                //    var sPlant = this.sUserPlant;
                var that = this;

                $.ajax({
                    url: sUrl,
                    type: "GET",
                    contentType: "application/json",
                    //dataType: "json",
                    //data: JSON.stringify(oPayload),
                    /* beforeSend: function (xhr) {
                        var param = sUrl;
                        var token = that.getCSRFToken(param);
                        xhr.setRequestHeader("X-CSRF-Token", token);
                        xhr.setRequestHeader("Accept", "application/json");
        
                    }, */
                    success: function (oData, response) {
                        var oCurrentUser = JSON.parse(oData);
                        that.loggedinUserEmail = oCurrentUser.email;
                        that.firstname = oCurrentUser.firstname;
                        that.lastname = oCurrentUser.lastname;
                        that.name = oCurrentUser.name;
                        that.displayName = oCurrentUser.displayName;
                        //that.getApproverListForLoggedInPlant(that.sUserPlant);
                        BusyIndicator.hide();

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch logged in user details");
                    }
                }, that);
            },

            getLoggedInUserLocationDetails: function () {
                var that = this;
                this.sLocation = "";
                var sUserId = sap.ushell.Container.getService("UserInfo").getUser().getId();

                var sDest = "/scim_shadow_users";
                var sUrl = this.appModulePath + sDest + "/Users/" + sUserId;

                BusyIndicator.show(500);
                $.ajax({
                    url: sUrl,
                    type: "GET",
                    contentType: "application/json",
                    //dataType: "json",
                    //data: JSON.stringify(oPayload),
                    //beforeSend: function (xhr) {
                    //    xhr.setRequestHeader("Accept", "application/json");
                    //},
                    success: function (oData, oResponse) {
                        that.sLocation = oData.origin;
                        //BusyIndicator.hide();
                        that.fetchAllIdpUsers();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the current user details " + errorThrown);
                    }
                }, this);
            },

            fetchAllIdpUsers: function () {
                BusyIndicator.show(500);
                var sIdpLocation = "";
                switch (this.sLocation) {
                    case "httpsaqcgazolg.accounts.ondemand.com":
                        sIdpLocation = "/cis_bsxtdd";
                        break;
                    case "httpsaqrl92om1.accounts.ondemand.com":
                        sIdpLocation = "/cis_brakesdev";
                        break;
                    default:
                        sIdpLocation = "/cis_bsxtdd";
                }
                var url = this.appModulePath + sIdpLocation + "/scim/Users";
                var that = this;
                var limit = 25;
                //BusyIndicator.show(500);
                this.startIndex = "1";
                this.sLastPUserId = "";
                this.aResources = [];
                this.recursiveAjaxToFetchAllIdpUsers(url);

                /* $.ajax({
                    url: url,
                    type: "GET",
                    data: {
                        startIndex: '100'
                        //page : '2',
                        //page : 2
                        //'count': limit
                    },
                    //contentType: "application/json",
                    //dataType: "json",
                    //data: JSON.stringify(oPayload),
                    //beforeSend: function (xhr) {
                    //    xhr.setRequestHeader("Accept", "application/json");
                    //},
                    success: function (oData, oResponse) {
                        BusyIndicator.hide();
                        that.getView().getModel("oIdpUsersModel").setData(oData.Resources);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the IDP users " + errorThrown);
                    }
                }, this); */
            },

            recursiveAjaxToFetchAllIdpUsers: function (sUrl) {

                BusyIndicator.show();
                this.sLastPUserId = "";
                this.sNewUserNumber = "";
                this.sNewUserId = "";
                this.sTempEmail = "";
                this.sTempUserName = "";
                this.sTempEmailDomain = "@noemail.co.uk";

                var startIndex = this.startIndex, totalResults, itemsPerPage;
                var that = this;
                var url = sUrl;
                $.ajax({
                    url: url,
                    type: "GET",
                    data: {
                        startIndex: startIndex
                    },
                    success: function (oData, oResponse) {
                        totalResults = oData.totalResults;
                        itemsPerPage = oData.itemsPerPage;
                        if (that.aResources.length <= 0) {
                            that.aResources = oData.Resources;
                        } else {
                            that.aResources = that.aResources.concat(oData.Resources);
                        }

                        /* logic to fetch all the users from the API
                        the API returns a maximum of 100 users per page i.e, per AJAX call
                        hence added the recursive calling of the AJAX call to fetch all the users*/
                        if (that.aResources.length < totalResults) {
                            that.startIndex = that.aResources.length;
                            that.recursiveAjaxToFetchAllIdpUsers(url);
                        } else {
                            var aFinalResources = that.aResources;
                            for (var i = 0; i < aFinalResources.length; i++) {

                                /* var sUserSchema = aFinalResources[i].schemas[1];
                                var sValidTo = aFinalResources[i][sUserSchema].validTo;
                                aFinalResources[i].userFullName = aFinalResources[i].name.givenName + " " + aFinalResources[i].name.familyName;
                                aFinalResources[i].validTo = sValidTo; */

                                var sUserSchema = "urn:ietf:params:scim:schemas:extension:sap:2.0:User";
                                var sValidTo = "", sValidToIso = "";
                                if (aFinalResources[i][sUserSchema].validTo !== undefined) {
                                    sValidTo = aFinalResources[i][sUserSchema].validTo;
                                    sValidToIso = new Date(sValidTo).toISOString();
                                }
                                aFinalResources[i].validTo = sValidTo;
                                aFinalResources[i].validToIso = sValidToIso;

                                if (aFinalResources[i].userType !== undefined) {
                                    var sUserType = aFinalResources[i].userType.toUpperCase();
                                    var sUserCategory = "";

                                    switch (sUserType) {
                                        case "CUSTOMER":
                                            sUserCategory = "Permanent";
                                            break;
                                        case "EMPLOYEE":
                                            sUserCategory = "Permanent";
                                            break;
                                        case "PARTNER":
                                            sUserCategory = "Permanent";
                                            break;
                                        case "PUBLIC":
                                            sUserCategory = "Permanent";
                                            break;
                                        case "EXTERNAL":
                                            sUserCategory = "Temporary";
                                            break;
                                        case "ONBOARDEE":
                                            sUserCategory = "Permanent";
                                            break;
                                        default:
                                            sUserCategory = "";
                                    }
                                    aFinalResources[i].userCategory = sUserCategory;

                                } else {
                                    aFinalResources[i].userCategory = "";
                                }
                                aFinalResources[i].userCategory = sUserCategory;
                            }

                            that.getView().getModel("oIdpUsersModel").setData(aFinalResources);

                            that.sLastPUserId = aFinalResources[aFinalResources.length - 1][sUserSchema].userId;

                            that.sNewUserNumber = parseInt(that.sLastPUserId.replace(/^\D+/g, '')) + 1;
                            that.sNewUserNumber = String(that.sNewUserNumber).padStart(6, "0");

                            that.sNewUserId = "P" + that.sNewUserNumber;
                            that.sTempEmail = that.sNewUserId + that.sTempEmailDomain;
                            that.sTempUserName = "TMP" + that.sNewUserNumber;

                            if (that.getView().byId("sEmailFld") !== undefined) {
                                that.getView().byId("sEmailFld").setValue(that.sTempEmail);
                            }

                            if (that.getView().byId("sUserNameFld") !== undefined) {
                                that.getView().byId("sUserNameFld").setValue(that.sTempUserName);
                            }
                            //that.setFiltersOnUsers();
                            BusyIndicator.hide();
                        }

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the IDP users " + errorThrown);
                    }
                }, this);
            },
            
            onPressCreateUser: function (oEvent) {
                var sFirstName = this.getView().byId("sFirstName").getValue();
                var sLastName = this.getView().byId("sLastName").getValue();
                var sUserName = this.getView().byId("sUserNameFld").getValue();
                var sEmailId = this.getView().byId("sEmailFld").getValue();
                var sInitialPassword = this.getView().byId("sUserPasswordFld").getValue();
                /*Temporary = External | Permanent = Employee */
                var sUserType = "External";
                var bActive = false;
                var sExpiryDate = this.getView().byId("expDate").getValue();
                var sValidTo = new Date(sExpiryDate).toISOString();

                if (sFirstName == "" || sLastName == "" || sUserName == "" || sEmailId == "") {
                    MessageBox.error("Cannot proceed with the creation of user until all the mandatory fields are filled");
                } else {
                    this.createUserInIdp(sFirstName, sLastName, sUserName, sEmailId, sInitialPassword, sUserType, bActive, sValidTo, "");
                }
            },

            onPressCancelUser: function(oEvent){
                this.getOwnerComponent().getRouter().navTo("MANAGE");
            },
            
            createUserInIdp: function (sFirstName, sLastName, sUserName, sEmailId, sInitialPassword, sUserType, bActive, sValidTo, sPlant) {
                var that = this;

                var oNewPayload =
                {
                    "schemas": [
                        "urn:ietf:params:scim:schemas:core:2.0:User",
                        "urn:ietf:params:scim:schemas:extension:sap:2.0:User",
                        "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User" // for setting Plant in Division
                    ],
                    "userName": sUserName,
                    "password": sInitialPassword,
                    "name": {
                        "familyName": sLastName,
                        "givenName": sFirstName
                    },
                    "userType": sUserType,
                    "active": bActive,
                    "emails": [
                        {
                            "value": sEmailId,
                            "primary": true
                        }
                    ],
                    "urn:ietf:params:scim:schemas:extension:sap:2.0:User": {
                        "mailVerified": true,
                        // "validFrom": "2023-02-23T14:37:04.991Z",
                        "validTo": sValidTo
                    },
                    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
                        "division": sPlant
                    }
                };

                var oLocation = "";
                switch (this.oLocation) {
                    case "httpsaqcgazolg.accounts.ondemand.com":
                        oLocation = "/cis_bsxtdd";
                        break;
                    case "httpsaqrl92om1.accounts.ondemand.com":
                        oLocation = "/cis_brakesdev";
                        break;
                    default:
                        oLocation = "/cis_bsxtdd";
                }
                var url = this.appModulePath + oLocation + "/scim/Users";

                BusyIndicator.show(500);
                $.ajax({
                    url: url,
                    type: "POST",
                    contentType: "application/scim+json",
                    dataType: "json",
                    data: JSON.stringify(oNewPayload),
                    beforeSend: function (xhr) {
                        var param = url;
                        var token = that.getCSRFToken(param);
                        xhr.setRequestHeader("X-CSRF-Token", token);
                        xhr.setRequestHeader("Accept", "application/scim+json");

                    },
                    success: function (oData, response) {
                        BusyIndicator.hide();
                        var sIdpId = oData.id;
                        MessageBox.success("User has been created successfully in the IDP, proceeding with user creation in subaccount",{
                            onClose: function (sAction) {
                                if (sAction === "OK") {
                                    //that.createUserInSubaccount(sFirstName, sLastName, sUserName, sEmailId);
                                    that.triggerCreateUserinSubAcctWrkFlow(sIdpId, sFirstName, sLastName, sUserName, sEmailId, bActive, sValidTo, this.sApproverMail, this.sApproverId);
                                }
                            }
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("User could not be created in IDP, please re-try", errorThrown);
                    }
                }, this);

            },

            getCSRFToken: function (url) {
                var token = null;
                $.ajax({
                    url: url,
                    type: "GET",
                    async: false,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("X-CSRF-Token", "Fetch");
                    },
                    complete: function (xhr) {
                        token = xhr.getResponseHeader("X-CSRF-Token");
                    }
                });
                return token;
            },

            triggerCreateUserinSubAcctWrkFlow: function (sIdpId, sFirstName, sLastName, sUserName, sEmailId, bActive, sValidTo, sApproverMail, sApproverId) {
                var that = this;
                var sCsrfToken = this.appModulePath + "/sap_process_automation_api";
                var sDest = "/sap_process_automation_api/";
                var sWorkFlowUrl = this.appModulePath + sDest;

                var oneDay = 24 * 60 * 60 * 1000;
                var expDay = this.getView().byId("expDate").getValue();
                var sUserValidFor = Math.round(Math.abs((new Date() - new Date(expDay)) / oneDay));

                var sUserRole = "RF Role";
                var sUserType = "External";

                var oCreateUserPayload = {
                    "createnewuserpayload": {
                        "IdpId": sIdpId,
                        "ApproverId": "ssoumya",
                        "UserName": sUserName,
                        //"ApproverMail": this.sApproverMail,
                        "ApproverMail": "",
                        "UserValidFor": sUserValidFor.toString(),
                        "UserRole": sUserRole,
                        "UserMailId": sEmailId,
                        "UserLastName": sLastName,
                        "UserFirstName": sFirstName,
                        "UserExpiryDate": sValidTo,
                        "UserType": sUserType,
                        "payload": {
                            "userName": sUserName,
                            "name": {
                                "familyName": sLastName,
                                "givenName": sFirstName
                            },
                            "emails": [
                                {
                                    "type": "string",
                                    "value": sEmailId,
                                    "primary": true
                                }
                            ],
                            "active": true,
                            "verified": true,
                            "origin": "sap.default",
                            "schemas": [
                                "urn:scim:schemas:core:1.0"
                            ],
                            "userType": "External"
                        },
                        "LoggedInUserEmail": this.loggedinUserEmail,
                        "AssignRole": {
                            "rolePayload": {
                                "id": ""
                            }
                        },
                        "ActivateIdp": {
                            "activateIdpPayload": {

                            }
                        }
                    }
                };

                var workflowStartPayload = {
                    //    definitionId: "bsx.createuserworkflowbtp",
                    "definitionId": "eu10.bsx-tdd-qq8akzjn.createnewuser.createNewUser",
                    context: oCreateUserPayload
                };

                BusyIndicator.show(500);
                $.ajax({
                    url: sWorkFlowUrl,
                    type: "POST",
                    contentType: "application/json",
                    //dataType: "json",
                    data: JSON.stringify(workflowStartPayload),
                    beforeSend: function (xhr) {
                        //var param = sWorkFlowUrl;
                        //var token = that.getCSRFToken(sCsrfToken);
                        //xhr.setRequestHeader("X-CSRF-Token", token);
                        xhr.setRequestHeader("Accept", "application/json");
                        //xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYnJha2VzLWRldi1idHd3NGFidS5hdXRoZW50aWNhdGlvbi5ldTEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktLTEwNzg4Mjg1MTQiLCJ0eXAiOiJKV1QiLCJqaWQiOiAiT24rMGRGTTM1WlV0Ylk3ZXNqVTBkcjZXMmZvS3lGL3lQMHRVZ2ZETHVuMD0ifQ.eyJqdGkiOiJhOGUzMWM0YmZkMjM0ODNmODc1ZTYzMzU4NTAwNjJhNyIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiJkZGMyZDg4Yi05ZTBjLTQ1OWEtYTUyMy0wOTcyOWRiOThiMTMiLCJ6ZG4iOiJicmFrZXMtZGV2LWJ0d3c0YWJ1Iiwic2VydmljZWluc3RhbmNlaWQiOiJmN2VmNjJmYi0yMjNiLTQ5YTItOGU4OC1kY2YyMzk5MjNjYzkifSwic3ViIjoic2ItZjdlZjYyZmItMjIzYi00OWEyLThlODgtZGNmMjM5OTIzY2M5IWIxNDQ2NTB8eHN1YWEhYjEyMDI0OSIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSJdLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiY2xpZW50X2lkIjoic2ItZjdlZjYyZmItMjIzYi00OWEyLThlODgtZGNmMjM5OTIzY2M5IWIxNDQ2NTB8eHN1YWEhYjEyMDI0OSIsImNpZCI6InNiLWY3ZWY2MmZiLTIyM2ItNDlhMi04ZTg4LWRjZjIzOTkyM2NjOSFiMTQ0NjUwfHhzdWFhIWIxMjAyNDkiLCJhenAiOiJzYi1mN2VmNjJmYi0yMjNiLTQ5YTItOGU4OC1kY2YyMzk5MjNjYzkhYjE0NDY1MHx4c3VhYSFiMTIwMjQ5IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiJkMTY5YjdlZSIsImlhdCI6MTY3OTk1OTE0NSwiZXhwIjoxNjgwMDAyMzQ1LCJpc3MiOiJodHRwczovL2JyYWtlcy1kZXYtYnR3dzRhYnUuYXV0aGVudGljYXRpb24uZXUxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6ImRkYzJkODhiLTllMGMtNDU5YS1hNTIzLTA5NzI5ZGI5OGIxMyIsImF1ZCI6WyJ1YWEiLCJzYi1mN2VmNjJmYi0yMjNiLTQ5YTItOGU4OC1kY2YyMzk5MjNjYzkhYjE0NDY1MHx4c3VhYSFiMTIwMjQ5Il19.WYVc664p10BdVUeE3Bvd1YLBN7EAtpNYplxs2zmebH4t9TFzeKGbuo6LI7n5rOPRoTyNjY36mTBnWQgHHHvCf4ENLDjJCqC7j0oifA0DW3bpljj2HS8bcw0QB7DupdP0T36Aw1aS1DSEZzYJ_YQ4A38Qkc6kTkeSduPA8hCgVDP09S6pSXgA1OVDhWUQqPH1cVEW3t-kJlQY4TVWnUuaGLpL5C5gxSz5bm_YmucQe8Tf54dhB5zOrgF5LyfEVLrjwgFK3jMXXsAU9Rqod_CLtSzTqUkL8XXoFradynFKaIAuactHEB6qF7uJQfbUexYFDixWg2E7B5XKsbni1DaNgg");
                    },
                    success: function (oData, response) {
                        BusyIndicator.hide();
                        MessageBox.success("Approval workflow for creating user has been triggered successfully", {
                            onClose: function (sAction) {
                                that.getOwnerComponent().getRouter().navTo("MANAGE");
                            }
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not trigger the approval workflow for creating user, please re-try", errorThrown, {
                            onClose: function (sAction) {
                                that.getOwnerComponent().getRouter().navTo("RouteView1");
                            }
                        });
                    }
                }, this);
            },

            createUserInSubaccount: function(sFirstName, sLastName, sUserName, sEmailId){
                var that = this;

                var path = "https://cockpit.eu10.hana.ondemand.com/" + "ajax/";
                var globalAccountGuid = "8dbdeef9-0011-4c0d-86f6-1263455768f9" + "/";
                var sRegion = "cf-eu10" + "/";
                var subAccountId = this.subAccId;
            //    var subAccountId = "7bc2e4a2-b1fb-420e-8ff3-0c1938d419ab";
                var sEntity = "/" + "createShadowUser" + "/";
                var oLocation = "/btp_cockpit";

                //var url = this.appModulePath + oLocation + "/ajax/" + globalAccountGuid + sRegion + subAccountId + sEntity + subAccountId;
                
                //var url1 = "https://api.authentication.eu10.hana.ondemand.com" + "/Users";

                var sDest = "/scim_shadow_users";
                //var url = this.appModulePath + sDest + "/Users";
                //var url = this.appModulePath + sDest;
                var url = "https://api.authentication.eu10.hana.ondemand.com/Users";
                var oPayload = {
                    "origin": this.oLocation,
                    "username": sUserName,
                    "email": sEmailId
                };

                var oPayload1 = {
                    "id": "ef4772b9-3295-4d12-af66-ef07fce21227",
                    "externalId": "",
                    "meta": {
                       "attributes": [
                          "string"
                       ],
                       "version": 1,
                       "created": "2023-02-15T12:56:14.642Z",
                       "lastModified": "2023-02-15T12:56:14.642Z"
                    },
                    "userName": sUserName,
                    "name": {
                       "familyName": sLastName,
                       "givenName": sFirstName,
                       "honorificPrefix": "string",
                       "honorificSuffix": "string",
                       "formatted": "string",
                       "middleName": "string"
                    },
                    "emails": [
                       {
                          "type": "string",
                          "value": sEmailId,
                          "primary": true
                       }
                    ],
                    "approvals": [
                       {
                          "clientId": "cloud_controller",
                          "expiresAt": "2023-02-15T12:56:14.642Z",
                          "lastUpdatedAt": "2023-02-15T12:56:14.642Z",
                          "scope": "cloud_controller.write",
                          "status": "APPROVED",
                          "userId": ""
                       }
                    ],
                    "active": true,
                    "verified": true,
                    "origin": "sap.default",
                    "zoneId": subAccountId,
                    "displayName": "string",
                    "locale": "string",
                    "nickName": "string",
                    "passwordLastModified": "2023-02-15T12:56:14.642Z",
                    "previousLogonTime": 1588056537011,
                    "lastLogonTime": 1589284136890,
                    "schemas": [
                       "urn:scim:schemas:core:1.0"
                    ],
                    "phoneNumbers": [
                       {
                          "value": "123456789"
                       }
                    ],
                    "preferredLanguage": "string",
                    "profileUrl": "string",
                    "salt": "string",
                    "timezone": "string",
                    "title": "string",
                    "userType": "string"
                 };

                BusyIndicator.show(500);
                $.ajax({
                    url: url,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(oPayload1),
                    beforeSend: function (xhr) {
                        var param = url;
                        var token = that.getCSRFToken(param);
                        xhr.setRequestHeader("X-CSRF-Token", token);
                        xhr.setRequestHeader("Accept", "application/json");
                        xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYnN4LXRkZC1xcThha3pqbi5hdXRoZW50aWNhdGlvbi5ldTEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktLTEyMTM1MTE0MDQiLCJ0eXAiOiJKV1QiLCJqaWQiOiAicnhZTkNZRm1hQWF4QlM0WjZKUDRabGhnc2xHUjRRUXdGT2EwLzZwVXMrOD0ifQ.eyJqdGkiOiJhODhlYjI2ZTliZDE0MDdhYTc4MTUyYWY2ZTI5NjhhZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI3YmMyZTRhMi1iMWZiLTQyMGUtOGZmMy0wYzE5MzhkNDE5YWIiLCJ6ZG4iOiJic3gtdGRkLXFxOGFrempuIn0sInN1YiI6InNiLW5hLWZkNjlkNzM5LWRkN2MtNDk5Ni05NzM5LTFhZjU5NGUwOGQwYiFhMTI0OTY5IiwiYXV0aG9yaXRpZXMiOlsieHNfdXNlci53cml0ZSIsInVhYS5yZXNvdXJjZSIsInhzX2F1dGhvcml6YXRpb24ucmVhZCIsInhzX2lkcC53cml0ZSIsInhzX3VzZXIucmVhZCIsInhzX2lkcC5yZWFkIiwieHNfYXV0aG9yaXphdGlvbi53cml0ZSJdLCJzY29wZSI6WyJ4c191c2VyLndyaXRlIiwidWFhLnJlc291cmNlIiwieHNfYXV0aG9yaXphdGlvbi5yZWFkIiwieHNfaWRwLndyaXRlIiwieHNfdXNlci5yZWFkIiwieHNfaWRwLnJlYWQiLCJ4c19hdXRob3JpemF0aW9uLndyaXRlIl0sImNsaWVudF9pZCI6InNiLW5hLWZkNjlkNzM5LWRkN2MtNDk5Ni05NzM5LTFhZjU5NGUwOGQwYiFhMTI0OTY5IiwiY2lkIjoic2ItbmEtZmQ2OWQ3MzktZGQ3Yy00OTk2LTk3MzktMWFmNTk0ZTA4ZDBiIWExMjQ5NjkiLCJhenAiOiJzYi1uYS1mZDY5ZDczOS1kZDdjLTQ5OTYtOTczOS0xYWY1OTRlMDhkMGIhYTEyNDk2OSIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiOTM5YTExMWEiLCJpYXQiOjE2NzY0OTg4MzUsImV4cCI6MTY3NjU0MjAzNSwiaXNzIjoiaHR0cHM6Ly9ic3gtdGRkLXFxOGFrempuLmF1dGhlbnRpY2F0aW9uLmV1MTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI3YmMyZTRhMi1iMWZiLTQyMGUtOGZmMy0wYzE5MzhkNDE5YWIiLCJhdWQiOlsic2ItbmEtZmQ2OWQ3MzktZGQ3Yy00OTk2LTk3MzktMWFmNTk0ZTA4ZDBiIWExMjQ5NjkiLCJ1YWEiLCJ4c191c2VyIiwieHNfaWRwIiwieHNfYXV0aG9yaXphdGlvbiJdfQ.WnnxstYfIPsQLDhJN-_yCgqwyzVppcwiXjLGifeRPfVyHq0GTPhj2PjOaS45fq3uj2gOC5UAfGxwr9xpyUiSk9iVJ8KdDy7yX5kwSAB_sqh2aDDyJb8qccQwiZHAuVZrDBmnGJXGSfNu5IAvwqr3SiXI2MfBI4Ti7SfeDFkxIbtk0N8twySjUWOlDA0_1nNR-IfGqqdxMNVCEeV8ANunQO8W_-2OmajeBqp4KMBdKu18H_4nXM7lQR-SaNgF0GT7rQA7Vfzbo5Yq_x4EIAKgOfosaAiF4uzLx4vMxetU38IMQiGkRHRYceBo01R2BwSyvHWIMgeEFo2NqWLJvSTZ_w");

                    },
                    success: function (oData, response) {
                        BusyIndicator.hide();
                        MessageBox.success("User has been created successfully in the subaccount");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("User could not be created in subaccount, please re-try", errorThrown);
                    }
                }, this);

            }



        });
    });
