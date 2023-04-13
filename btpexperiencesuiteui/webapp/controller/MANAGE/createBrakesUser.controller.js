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

        return Controller.extend("bsx.btpexperiencesuiteui.controller.MANAGE.createBrakesUser", {
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

            },

            onAfterRendering: function () {

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

            onPressCreateUser: function (oEvent) {
                var sFirstName = this.getView().byId("sFirstName").getValue();
                var sLastName = this.getView().byId("sLastName").getValue();
                var sUserName = this.getView().byId("sUserName").getValue();
                var sEmailId = this.getView().byId("sEmail").getValue();

                if (sFirstName == "" || sLastName == "" || sUserName == "" || sEmailId == "") {
                    MessageBox.error("Cannot proceed with the creation of user until all the mandatory fields are filled");
                } else {
                    this.createUserInIdp(sFirstName, sLastName, sUserName, sEmailId);
                }
            },

            createUserInIdp: function (sFirstName, sLastName, sUserName, sEmailId) {
                var that = this;
                var oPayload = {
                    "emails": [
                        {
                            "primary": true,
                            "value": sEmailId
                        }
                    ],
                    "name": {
                        "familyName": sLastName,
                        "givenName": sFirstName
                    },
                    "schemas": [
                        "urn:ietf:params:scim:schemas:core:2.0:User"
                    ],
                    "userName": sUserName
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
                var url = this.appModulePath + oLocation + "/service/scim/Users";

                BusyIndicator.show(500);
                $.ajax({
                    url: url,
                    type: "POST",
                    contentType: "application/scim+json",
                    dataType: "json",
                    data: JSON.stringify(oPayload),
                    beforeSend: function (xhr) {
                        var param = url;
                        var token = that.getCSRFToken(param);
                        xhr.setRequestHeader("X-CSRF-Token", token);
                        xhr.setRequestHeader("Accept", "application/scim+json");

                    },
                    success: function (oData, response) {
                        BusyIndicator.hide();
                        MessageBox.success("User has been created successfully in the IDP, proceeding with user creation in subaccount",{
                            onClose: function (sAction) {
                                if (sAction === "OK") {
                                    that.createUserInSubaccount(sFirstName, sLastName, sUserName, sEmailId);
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
