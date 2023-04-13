sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/mvc/View",
    "sap/ui/core/library",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/ui/layout/HorizontalLayout",
    "sap/ui/layout/VerticalLayout",
    "sap/m/library",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/core/Fragment"
    //"cockpit/xsuaa/uaa/UaaUrlUtil"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, FlattenedDataset, XMLView, View, CoreLibrary, BusyIndicator, MessageBox, HorizontalLayout, VerticalLayout, mobileLibrary, FilterOperator, Filter, Fragment) {
        "use strict";


        return Controller.extend("bsx.btpexperiencesuiteui.controller.MANAGE.manageUsers", {
            onInit: function () {
                var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                var appPath = appId.replaceAll(".", "/");
                this.appModulePath = jQuery.sap.getModulePath(appPath);

                var sUserId = sap.ushell.Container.getService("UserInfo").getUser().getId();

                this.getOwnerComponent().getRouter().getRoute("MANAGE").attachPatternMatched(this._onManageRouteMatched, this);

                //Create JSON Model for IDP users
                var oIdpUsersModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oIdpUsersModel, "oIdpUsersModel");

                // create json model to get the logged in user
                //var oUserModel = new JSONModel("/services/userapi/currentUser");
                var oUserModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(oUserModel, "oUserModel");

                /*get location details for managed approuter - START */
                this.fetchLoggedInUserDetails();
                /*get location details for managed approuter - END */

                var oIdpUsersCount = new sap.ui.model.json.JSONModel();
                oIdpUsersCount.setData({
                    count: ""
                });
                this.getView().setModel(oIdpUsersCount, "oIdpUsersCount");

                /* works only for standalone approuter - START */
                var oUsrMdl = this.getOwnerComponent().getModel("userModel");
                var oUsrMdlData = oUsrMdl.getData();

                if (oUsrMdlData.decodedJWTToken) {
                    this.sLocation = oUsrMdlData.decodedJWTToken.origin;
                } else {
                    this.sLocation = "";
                }
                /* works only for standalone approuter - END */

                //Create JSON Model for single IDP user for editing
                var oIdpEditUserModel = new sap.ui.model.json.JSONModel();
                sap.ui.getCore().setModel(oIdpEditUserModel, "oIdpEditUserModel");
            },

            onAfterRendering: function () {

            },

            _onManageRouteMatched: function (oEvent) {
                //this.fetchLoggedInUserDetails();
                this.oPasswdResetDialog = null;
                this.getLoggedInUserLocationDetails();
                this.resetControls();
            },

            onAddNewUser: function () {
                this.getOwnerComponent().getRouter().navTo("MANAGECREATE");
                /*if (!this.oCreateUserDialog) {
                    Fragment.load({
                        name: "bsx.btpexperiencesuiteui.fragments.createNewUser",
                        controller: this
                    }).then(function (oDialog) {
                        this.oCreateUserDialog = oDialog;
                        this.getView().addDependent(this.oCreateUserDialog);
                        this.oCreateUserDialog.open();
                    }.bind(this));
                } else {
                    this.oCreateUserDialog.open();
                } */
            },

            navBack: function () {
                history.go(-1);
            },

            /* old approach */
            fetchLoggedInUserDetails: function () {
                var sDest = "/user-api";
                var sUrl = this.appModulePath + sDest + "/currentUser";
                this.loggedinUserEmail = "";
                this.firstname = "";
                this.lastname = "";
                this.name = "";
                this.displayName = "";
                var that = this;

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
                        BusyIndicator.hide();
                        var oCurrentUser = JSON.parse(oData);
                        that.loggedinUserEmail = oCurrentUser.email;
                        that.firstname = oCurrentUser.firstname;
                        that.lastname = oCurrentUser.lastname;
                        that.name = oCurrentUser.name;
                        that.displayName = oCurrentUser.displayName;
                        that.userUuid = oCurrentUser.userUuid;
                        /* to identify the user origin location */
                        //that.getLoggedInUserLocationDetails();
                        BusyIndicator.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the current user details " + errorThrown);
                    }
                }, this);
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

                            if (sap.ui.getCore().byId("sEmail") !== undefined) {
                                sap.ui.getCore().byId("sEmail").setValue(that.sTempEmail);
                            }

                            if (sap.ui.getCore().byId("sUserName") !== undefined) {
                                sap.ui.getCore().byId("sUserName").setValue(that.sTempUserName);
                            }
                            that.setFiltersOnUsers();
                            BusyIndicator.hide();
                        }

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not fetch the IDP users " + errorThrown);
                    }
                }, this);
            },

            resetUserPwd: function (oEvent) {
                var sUserMailId = oEvent.getSource().getParent().getCells()[1].getText();
                var sUserName = oEvent.getSource().getParent().getCells()[1].getTitle();
                if (sUserMailId) {
                    sUserMailId = sUserMailId.toLowerCase();
                    /*TESTING : RESET PASSWORD only for JOHN EXAMPLE user */
                    //if (sUserMailId == "john.example@sap.com") {
                    this.resetUserPassword(sUserMailId, sUserName);;
                    //} else {
                    //    MessageBox.alert("For TESTING, password reset is only allowed for user - john.example@sap.com");
                    // }
                } else {
                    console.log("User mail Id is empty!!! Please check");
                }
            },

            resetUserPassword: function (sUserMailId, sUserName) {
                //var url = this.appModulePath + "/sap/opu/odata/sap/ZRF_REPLENISHMENT_SRV/TOListSet";
                var sLocation = "";
                switch (this.sLocation) {
                    case "httpsaqcgazolg.accounts.ondemand.com":
                        sLocation = "/cis_bsxtdd";
                        break;
                    case "httpsaqrl92om1.accounts.ondemand.com":
                        sLocation = "/cis_brakesdev";
                        break;
                    default:
                        sLocation = "/cis_bsxtdd";
                }
                var url = this.appModulePath + sLocation + "/service/users/statusPassword/new";
                var that = this;
                /* NEW CODE BEGIN*/
                this.oPasswdResetDialog = new sap.m.Dialog({
                    type: sap.m.DialogType.Message,
                    title: "Set initial password",
                    escapeHandler: function () {

                    },
                    content: [
                        new VerticalLayout({
                            content: [
                                new VerticalLayout({
                                    width: "300px",
                                    content: [
                                        new sap.m.Label({ text: "Password: ", required: true }),
                                        new sap.m.Input("sPwdFld", {
                                            liveChange: function(oEvent){
                                                this.validatePassword(oEvent)
                                            }.bind(this)
                                        }),
                                        new sap.m.Label({ text: "Re-enter Password: ", required: true }),
                                        new sap.m.Input("sReenterPwdFld", {
                                            change: function (oEvent) {
                                                var sConfirmPwd = oEvent.getSource().getValue();
                                                var sPwd = sap.ui.getCore().byId("sPwdFld").getValue();

                                                if (sConfirmPwd !== sPwd) {
                                                    oEvent.getSource().setValueState("Error");
                                                    oEvent.getSource().setValueStateText("Passwords do not match");
                                                    sap.ui.getCore().byId("resetPwdBtn").setEnabled(false);
                                                } else {
                                                    if(this.bValidPassword){
                                                        this.sResetPwd = sConfirmPwd;
                                                        oEvent.getSource().setValueState("None");
                                                        sap.ui.getCore().byId("resetPwdBtn").setEnabled(true);
                                                    }
                                                }

                                            }.bind(this)
                                        })
                                    ]
                                })
                            ]
                        })
                    ],
                    beginButton: new sap.m.Button("resetPwdBtn", {
                        type: sap.m.ButtonType.Emphasized,
                        text: "Reset",
                        enabled: false,
                        press: function () {
                            // this.sResetPwd = sap.ui.getCore().byId("sPwdFld").getValue();
                            if (this.sResetPwd == "") {
                                //    this.sResetPwd = "Initial1!"
                                sap.ui.getCore().byId("sPwdFld").setValueState("Error");
                                sap.ui.getCore().byId("sPwdFld").setValueStateText("Password cannot be empty");
                            } else {
                                var oPayload =
                                {
                                    "identifier": "mail",
                                    "mail": sUserMailId,
                                    "password": this.sResetPwd
                                };
                                var that = this;
                                $.ajax({
                                    url: url,
                                    type: "PUT",
                                    contentType: "application/json",
                                    //dataType: "json",
                                    data: JSON.stringify(oPayload),
                                    success: function (oData, response) {

                                        BusyIndicator.hide();
                                        that.oPasswdResetDialog.close();
                                        sap.ui.getCore().byId("sPwdFld").destroy();
                                        sap.ui.getCore().byId("sReenterPwdFld").destroy();
                                        that.oPasswdResetDialog.destroy();
                                        that.oPasswdResetDialog = null;

                                        var sNewPassword = "The user password has been reset successfully and the new password is " + "<strong>" + that.sResetPwd + "</strong>" + "<br>" +
                                        "Please make a note of the newly set password";
                                        var formattedText = new sap.m.FormattedText("formattedTxtMsg", {
                                            htmlText: sNewPassword
                                        });
                                        MessageBox.success(formattedText, {
                                            onClose: function (sAction) {
                                                if (sAction === "OK") {
                                                    that.triggerEmailNotification(sUserName, sUserMailId);
                                                    that.fetchAllIdpUsers();
                                                }
                                            }
                                        });
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {

                                        BusyIndicator.hide();
                                        that.oPasswdResetDialog.close();
                                        sap.ui.getCore().byId("sPwdFld").destroy();
                                        sap.ui.getCore().byId("sReenterPwdFld").destroy();
                                        that.oPasswdResetDialog.destroy();
                                        that.oPasswdResetDialog = null;

                                        if (jqXHR.getAllResponseHeaders().includes("x-message-code: PASSWORD_IN_HISTORY")) {
                                            MessageBox.error("Password could not be reset as the new password is already in history, please choose a different password and try again!");
                                        } else if (jqXHR.getAllResponseHeaders().includes("x-message-code: INSUFFICIENT_PASSWORD_COMPLEXITY")) {
                                            MessageBox.error("Password could not be reset as the new password's complexity is not sufficient, please choose a different password and try again!");
                                        }
                                        else {
                                            MessageBox.error("Password could not be reset, please retry with another password" + errorThrown);
                                        }
                                    }
                                }, that);
                            }

                        }.bind(this)
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: function () {
                            this.oPasswdResetDialog.close();
                            sap.ui.getCore().byId("sPwdFld").destroy();
                            sap.ui.getCore().byId("sReenterPwdFld").destroy();
                            this.oPasswdResetDialog.destroy();
                            this.oPasswdResetDialog = null;
                        }.bind(this)
                    })
                });
                this.oPasswdResetDialog.open();

                /* NEW CODE ENDS */

                /*if (this.sResetPwd == "") {
                    this.sResetPwd = "RedCar15!"
                }  */

                /*  $.ajax({
                    url: url,
                    type: "PUT",
                    contentType: "application/json",
                    //dataType: "json",
                    data: JSON.stringify(oPayload),  */
                /* beforeSend: function (xhr) {
                    var param = url;
                    var username = "c48e1ce6-d105-4876-8f57-148100f7f328";
                    var password = "Sty.=]:tfH3j3UIuDtHF@6:=gp_BhF0.c";
                    //var token = that.getCSRFToken(param);
                    //xhr.setRequestHeader("X-CSRF-Token", token);
                    //xhr.setRequestHeader ("Authorization", "Basic Auth " + username + ":" + password);
                    xhr.setRequestHeader("Accept", "application/json");
                }, */
                /*    success: function (oData, response) {
                        BusyIndicator.hide();
                        var sNewPassword = "The user password has been reset successfully and the new password is " + "<strong>" + this.sResetPwd + "</strong>";
                        var formattedText = new sap.m.FormattedText("formattedTxtMsg", {
                            htmlText: sNewPassword
                        });
                        MessageBox.success(formattedText);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        if (jqXHR.getAllResponseHeaders().includes("x-message-code: PASSWORD_IN_HISTORY")) {
                            MessageBox.error("Password could not be changed as the password is already in history, please choose a different password and try again!");
                        } else {
                            MessageBox.error("Password could not be changed " + errorThrown);
                        }
                    }
                }, this); */


            },

            validatePassword: function (oEvent) {
                var oPasswdFld = oEvent.getSource(),
                    oView = this.getView(),
                    that = this;
                var sPassword = oEvent.getSource().getValue();
                this.bValidPassword = false;

                if (sPassword !== "") {

                    // create popover
                    if (!this.oPasswordPopover) {
                        this.oPasswordPopover = Fragment.load({
                            id: oView.getId(),
                            name: "bsx.btpexperiencesuiteui.fragments.PasswordHelpPopover",
                            controller: this
                        }).then(function (oPopover) {
                            oView.addDependent(oPopover);
                            return oPopover;
                        });
                    }
                    this.oPasswordPopover.then(function (oPopover) {
                        oPopover.openBy(oPasswdFld);
                        oPopover.setInitialFocus(oPasswdFld);
                        /*check for following password criteria for creation */
                        /*1. must contain  at least 8 characters long
                          2. must include Uppercase letters
                          3. must inclue Lowercase Letters
                          4. must include Numbers
                          5. must include Symbols*/
    
                        //Char Length >= 8
                        if (sPassword.length >= 8) {
                            oView.byId("pswdCharLen_cBox").setSelected(true);
                        } else {
                            oView.byId("pswdCharLen_cBox").setSelected(false);
                        }
    
                        //uppercase letters
                        if (Boolean(sPassword.match(/[A-Z]/))) {
                            oView.byId("pswdUpperCase_cBox").setSelected(true);
                        } else {
                            oView.byId("pswdUpperCase_cBox").setSelected(false);
                        }
    
                        //lowercase letters
                        if (Boolean(sPassword.match(/[a-z]/))) {
                            oView.byId("pswdLowerCase_cBox").setSelected(true);
                        } else {
                            oView.byId("pswdLowerCase_cBox").setSelected(false);
                        }
    
                        //numbers
                        if (Boolean(sPassword.match(/\d/))) {
                            oView.byId("pswdNumber_cBox").setSelected(true);
                        } else {
                            oView.byId("pswdNumber_cBox").setSelected(false);
                        }
    
                        //symbols
                        if (Boolean(sPassword.match(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/))) {
                            oView.byId("pswdSymbol_cBox").setSelected(true);
                        } else {
                            oView.byId("pswdSymbol_cBox").setSelected(false);
                        }

                        if( oView.byId("pswdCharLen_cBox").getSelected() &&
                            oView.byId("pswdUpperCase_cBox").getSelected() &&
                            oView.byId("pswdLowerCase_cBox").getSelected() &&
                            oView.byId("pswdNumber_cBox").getSelected() &&
                            oView.byId("pswdSymbol_cBox").getSelected()){
                                that.bValidPassword = true;
                        }else{
                            that.bValidPassword = false;
                        }
                    });

                }
            },

            clearPopoverFlds: function(oEvent){
                oEvent.getSource().destroy();
                this.oPasswordPopover = null;
            },

            /*trigger an email to the requestor with the user name and newly set password */
            triggerEmailNotification: function (sUserName, sUserEmailId) {
                var sPassword = this.sResetPwd;
                var sRequestorEmailId = this.loggedinUserEmail;
                var sUserId = sUserName;
                var sDest = "/bsxcpeaexperience";
                var sUrl = this.appModulePath + sDest + "/cpea-experience/NotifyUser(RequesterEmail=\'" + sRequestorEmailId + "\',userID=\'" + sUserId + "\'" + ",Password=\'" + sPassword + "\')";

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

                        BusyIndicator.hide();

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Password reset email could not be sent");
                    }
                }, that);

            },

            onTableUpdateStarted: function (oEvent) {
                var sReason = oEvent.getParameters().reason;
                if (sReason === "Growing") {

                }
            },

            onUserSearch: function (oEvent) {
                /* */

                /*var oLocation = "/bsxorgappsservices";
                switch (this.oLocation) {
                    case "httpsaqcgazolg.accounts.ondemand.com":
                        oLocation = "/cis_bsxtdd";
                        break;
                    case "httpsaqrl92om1.accounts.ondemand.com":
                        oLocation = "/cis_brakesdev";
                        break;
                    default:
                        oLocation = "/cis_bsxtdd";
                }*/
                /* var url = this.appModulePath + oLocation + "/services/services.xsodata";
                var that = this;
                $.ajax({
                    url: url,
                    type: "GET",
                    //contentType: "application/json",
                    data: {
                        $format: 'json'
                    },
                    success: function (oData, response) {

                        BusyIndicator.hide();
                        MessageBox.success("success");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                        BusyIndicator.hide();
                        MessageBox.error("error");
                    }
                }, that); */

                /* */
                this.fetchAllIdpUsers();
                this.setFiltersOnUsers();
            },

            setFiltersOnUsers: function (oEvent) {
                /* var userNameFilter = [], allFilter = [];
                var oUserNameFld = this.getView().byId("userNameInput");
                //    var oLastNameFld = this.getView().byId("lastNameInput");
                var oexpDateFilter = this.getView().byId("expDatePicker");

                if (oUserNameFld.getTokens().length > 0) {
                    for (var i = 0; i < oUserNameFld.getTokens().length; i++) {
                        var sUserName = oUserNameFld.getTokens()[i].getText();
                        userNameFilter.push(new Filter("userFullName", FilterOperator.EQ, sUserName));
                    } 
                } */

                /*if (oFirstNameFld.getTokens().length > 0) {
                    for (var i = 0; i < oFirstNameFld.getTokens().length; i++) {
                        var sGivenName = oFirstNameFld.getTokens()[i].getKey();
                        givenNameFilter = new Filter("name/givenName", FilterOperator.EQ, sGivenName);
                        userNameFilter.push(givenNameFilter);
                    }
                }

                if (oLastNameFld.getTokens().length > 0) {
                    for (var i = 0; i < oLastNameFld.getTokens().length; i++) {
                        var sLastName = oLastNameFld.getTokens()[i].getKey();
                        lastNameFilter = new Filter("name/familyName", FilterOperator.EQ, sLastName);
                        userNameFilter.push(lastNameFilter);
                    }
                } */

                var userTypeFilter = [], userFilter = [], userStatusFilter = [], expDateFilter = [], allFilter = [], sExpDate = "";

                /* */
                var sUserType = this.getView().byId("userTypeInput").getSelectedKey();
                /* var oExpDateValue = this.getView().byId("expDatePicker").getDateValue();
                if (oExpDateValue !== "" && oExpDateValue !== null) {
                    sExpDate = new Date(oExpDateValue).toISOString();
                } */

                var sExpDateFrom = this.getView().byId("expDatePicker").getFrom();
                var sExpDateTo = this.getView().byId("expDatePicker").getTo();
                var sExpDateFromISO = "", sExpDateToISO = "";

                if (sExpDateFrom !== "" && sExpDateFrom !== null && sExpDateTo !== "" && sExpDateTo !== null) {
                    sExpDateFromISO = new Date(sExpDateFrom).toISOString();
                    sExpDateToISO = new Date(sExpDateTo).toISOString();

                    //expDateFilter.push(new Filter("validToIso", FilterOperator.GE, sExpDateFromISO));
                    //expDateFilter.push(new Filter("validToIso", FilterOperator.LE, sExpDateToISO));

                    expDateFilter = new Filter({
                        filters: [
                            new Filter("validToIso", FilterOperator.GE, sExpDateFromISO),
                            new Filter("validToIso", FilterOperator.LE, sExpDateToISO)
                        ],
                        and: true
                    });

                    /* expDateFilter = new Filter({
                        path: "validToIso",
                        operator: FilterOperator.BT,
                        value1: sExpDateFromISO,
                        value2: sExpDateToISO
                      });  */
                }

                if (sUserType !== "") {
                    userTypeFilter.push(new Filter("userCategory", FilterOperator.EQ, sUserType));
                }

                /* if (sExpDate !== "") {
                    expDateFilter.push(new Filter("validToIso", FilterOperator.EQ, sExpDate));
                } */

                var sUserStatus = "";
                if (this.getView().byId("userStatusInput").getValue() === "Active") {
                    sUserStatus = true;
                } else if (this.getView().byId("userStatusInput").getValue() === "Inactive") {
                    sUserStatus = false;
                }
                if (sUserStatus !== "") {
                    userStatusFilter.push(new Filter("active", FilterOperator.EQ, sUserStatus));
                }

                var sUserName = this.getView().byId("userNameInput").getValue();
                if (sUserName !== "") {
                    userFilter.push(new Filter("name/givenName", FilterOperator.Contains, sUserName));
                    userFilter.push(new Filter("name/familyName", FilterOperator.Contains, sUserName));
                }

                if (userFilter.length > 0) {
                    allFilter.push(new Filter(userFilter, false));
                }

                if (userTypeFilter.length > 0) {
                    allFilter.push(new Filter(userTypeFilter, false));
                }

                /*if (expDateFilter.length > 0) {
                    allFilter.push(new Filter(expDateFilter, false));
                } */

                if (expDateFilter.aFilters !== undefined && expDateFilter.aFilters.length > 0) {
                    allFilter.push(new Filter(expDateFilter, false));
                }
                
                if (userStatusFilter.length > 0) {
                    allFilter.push(new Filter(userStatusFilter, false));
                }

                if (allFilter.length > 0) {
                    this.getView().byId("usersTable").getBinding("items").filter(allFilter);
                } else {
                    this.getView().byId("usersTable").getBinding("items").filter();
                }

                var sRowCount = this.getView().byId("usersTable").getBinding("items").getLength();
                this.getView().getModel("oIdpUsersCount").setProperty("/count", sRowCount);
                this.getView().getModel("oIdpUsersCount").refresh(true);
            },

            onSearchUser: function (oEvent) {
                var sValue = oEvent.getSource().getValue();
                if (sValue !== "") {
                    var userFilter = [], allFilter = [];
                    userFilter.push(new Filter("name/givenName", FilterOperator.EQ, sValue));
                    userFilter.push(new Filter("name/familyName", FilterOperator.EQ, sValue));
                    if (userFilter.length > 0) {
                        allFilter.push(new Filter(userFilter, false));
                        this.getView().byId("usersTable").getBinding("items").filter(allFilter);
                    } else {
                        this.getView().byId("usersTable").getBinding("items").filter();
                    }
                } else {
                    this.getView().byId("usersTable").getBinding("items").filter();
                }

            },

            resetControls: function () {
                this.getView().byId("userNameInput").setValue("");
                this.getView().byId("usersTable").getBinding("items").filter();
            },

            /* functions for create user - BEGIN*/
            onCreateUser: function (oEvent) {
                var sFirstName = sap.ui.getCore().byId("sFirstName").getValue();
                var sLastName = sap.ui.getCore().byId("sLastName").getValue();
                var sUserName = sap.ui.getCore().byId("sUserName").getValue();
                var sEmailId = sap.ui.getCore().byId("sEmail").getValue();
                var sInitialPassword = "initial1!";
                /*Temporary = External | Permanent = Employee */
                var sUserType = "External";
                var bActive = false;
                var sValidTo = "2023-02-23T14:37:04.991Z";

                if (sFirstName == "" || sLastName == "" || sUserName == "" || sEmailId == "") {
                    MessageBox.error("Cannot proceed with the creation of user until all the mandatory fields are filled");
                } else {
                    //this.createUserInIdp(sFirstName, sLastName, sUserName, sEmailId, sInitialPassword, sUserType, bActive, sValidTo);
                    var oWorkFlowParameter = {
                        "sFirstName": sFirstName,
                        "sLastName": sLastName,
                        "sUserName": sUserName,
                        "sEmailId": sEmailId,
                        "sUserType": "External",
                        "sApproverId": "soumya.sharma@bluestonex.com"
                    };
                    this.triggerCreateUserWrkFlow(oWorkFlowParameter);
                }
            },

            createUserInIdp: function (sFirstName, sLastName, sUserName, sEmailId, sInitialPassword, sUserType, bActive, sValidTo) {
                var that = this;

                /* var oPayload = {
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
                }; */

                var oPayload = {
                    "userName": sUserName,
                    "password": "initial1!",
                    "active": false,
                    "mailVerified": "TRUE",
                    "userType": "External",
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
                    ]
                };

                var oNewPayload =
                {
                    "schemas": [
                        "urn:ietf:params:scim:schemas:core:2.0:User",
                        "urn:ietf:params:scim:schemas:extension:sap:2.0:User"
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
                    }
                };

                /* var oNewPayload=     {
                    "schemas": [
                       "urn:ietf:params:scim:schemas:core:2.0:User",
                       "urn:ietf:params:scim:schemas:extension:sap:2.0:User"
                    ],
                    "userName": "user17",
                    "password": "initial1!",
                    "name": {
                       "familyName": "example17",
                       "givenName": "user17"
                    },
                    "userType": "External",
                    "active": false,
                    "emails": [
                       {
                          "value": "user17.example1@example.com",
                          "primary": true
                       }
                    ],
                    "urn:ietf:params:scim:schemas:extension:sap:2.0:User": {
                         "mailVerified": true,
                         "validFrom": "2023-02-23T14:37:04.991Z",
                         "validTo": "2024-02-23T14:37:04.991Z"
                     }
                 }; */
                var sLocation = "";
                switch (this.sLocation) {
                    case "httpsaqcgazolg.accounts.ondemand.com":
                        sLocation = "/cis_bsxtdd";
                        break;
                    case "httpsaqrl92om1.accounts.ondemand.com":
                        sLocation = "/cis_brakesdev";
                        break;
                    default:
                        sLocation = "/cis_bsxtdd";
                }
                var url = this.appModulePath + sLocation + "/scim/Users";

                BusyIndicator.show(500);
                var oWorkFlowParameter = {
                    "sFirstName": sFirstName,
                    "sLastName": sLastName,
                    "sUserName": sUserName,
                    "sEmailId": sEmailId,
                    "sUserType": "External",
                    "sApproverId": "soumya.sharma@bluestonex.com"
                };
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
                        MessageBox.success("User has been created successfully in the IDP, proceeding with user creation in subaccount", {
                            onClose: function (sAction) {
                                if (sAction === "OK") {
                                    that.triggerCreateUserWrkFlow(oWorkFlowParameter);
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

            triggerCreateUserWrkFlow: function (oWorkFlowParameter) {
                var that = this;

                /*    var createUserPayload = {
                        "UserName": oWorkFlowParameter.sUserName,
                        "payload": {
                            "userName": oWorkFlowParameter.sUserName,
                            "name": {
                                "familyName": oWorkFlowParameter.sLastName,
                                "givenName": oWorkFlowParameter.sFirstName
                            },
                            "emails": [
                                {
                                    "type": "string",
                                    "value": oWorkFlowParameter.sEmailId,
                                    "primary": true
                                }
                            ],
                            "active": true,
                            "verified": true,
                            "origin": "sap.default",
                            "schemas": [
                                "urn:scim:schemas:core:1.0"
                            ],
                            "userType": oWorkFlowParameter.sUserType
                        },
                        "ApproverMail": oWorkFlowParameter.sApproverId,
                        "UserValidFor": "5",
                        "UserRole": "RF Role",
                        "UserMailId": "user4.example4@example.com",
                        "ApproverId": "ssoumya",
                        "UserLastName": oWorkFlowParameter.sLastName,
                        "UserFirstName": oWorkFlowParameter.sFirstName,
                        "userName": {
                            "userName": oWorkFlowParameter.sEmailId,
                            "name": {
                                "familyName": oWorkFlowParameter.sLastName,
                                "givenName": oWorkFlowParameter.sFirstName
                            },
                            "emails": [
                                {
                                    "value": oWorkFlowParameter.sEmailId,
                                    "primary": true
                                }
                            ],
                            "groups": [],
                            "approvals": [],
                            "active": true,
                            "verified": true,
                            "origin": "sap.default",
                            "schemas": [
                                "urn:scim:schemas:core:1.0"
                            ]
                        },
                        "UserExpiryDate": "20240101",
                        "UserType": "active"
                    }; */

                var createUserPayload =
                {
                    "createnewuserpayload": {
                        "LoggedInUserEmail": this.loggedinUserEmail,
                        "UserName": "user11.example5@example.com",
                        "payload": {
                            "userName": "user11.example5@example.com",
                            "name": {
                                "familyName": "example5",
                                "givenName": "user11"
                            },
                            "emails": [
                                {
                                    "type": "string",
                                    "value": "user11.example5@example.com",
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
                        "ApproverMail": "soumya.sharma@bluestonex.com",
                        "UserValidFor": "5",
                        "UserRole": "RF Role",
                        "UserMailId": "user11.example5@example.com",
                        "ApproverId": "ssoumya",
                        "UserLastName": "example5",
                        "UserFirstName": "user11",
                        "UserExpiryDate": "20240101",
                        "UserType": "active"
                    }
                };

                var workflowStartPayload = {
                    //    definitionId: "bsx.createuserworkflowbtp",
                    "definitionId": "eu10.bsx-tdd-qq8akzjn.itprocurementprocess.createNewUser",
                    context: createUserPayload
                };

                //var sCsrfToken = this.appModulePath + "/bpmworkflowruntime/v1/xsrf-token";
                //var sWorkFlowUrl = this.appModulePath + "/bpmworkflowruntime/v1/workflow-instances";

                //var sCsrfToken = this.appModulePath + "/destinations" + "/sap_process_automation_api/";
                //var sWorkFlowUrl = this.appModulePath + "/sap_process_automation_api/";

                //var sCsrfToken = "https://bsx-tdd-qq8akzjn.preview.eu10.apps.build.cloud.sap/destinations/sap_process_automation_api";
                //var sWorkFlowUrl = "https://bsx-tdd-qq8akzjn.preview.eu10.apps.build.cloud.sap/destinations/sap_process_automation_api";

                var sCsrfToken = this.appModulePath + "/sap_process_automation_api/v1/xsrf-token";
                var sWorkFlowUrl = this.appModulePath + "/sap_process_automation_api";

                var oPayload = {
                    "definitionId": "eu10.bsx-tdd-qq8akzjn.itprocurementprocess.iTProcurementProcess",
                    "context": {
                        "employeeid": "B123",
                        "itequipment": "Macbook Pro",
                        "deliverylocation": "Leeds",
                        "requestnote": "requesting",
                        "requestormailid": "soumya.sharma@bluestonex.com",
                        "approvermailid": "soumya.sharma@bluestonex.com",
                        "approverid": "ssoumya"
                    }
                };

                var oUserPayload =
                {
                    "definitionId": "eu10.bsx-tdd-qq8akzjn.itprocurementprocess.createNewUser",
                    "context": {
                        "createnewuserpayload":
                        {
                            "UserName": "P000291@noemail.co.uk",
                            "payload": {
                                "userName": "TMP000291",
                                "name": {
                                    "familyName": "Litt",
                                    "givenName": "John"
                                },
                                "emails": [
                                    {
                                        "type": "string",
                                        "value": "P000291@noemail.co.uk",
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
                            "ApproverMail": "soumya.sharma@bluestonex.com",
                            "UserValidFor": "4",
                            "UserRole": "RF Role",
                            "UserMailId": "P000291@noemail.co.uk",
                            "ApproverId": "ssoumya",
                            "UserLastName": "Litt",
                            "UserFirstName": "John",
                            "UserExpiryDate": "20250320",
                            "UserType": "Temporary"
                        }
                    }
                };
                BusyIndicator.show(500);
                $.ajax({
                    url: sWorkFlowUrl,
                    type: "POST",
                    contentType: "application/json",
                    //dataType: "json",
                    data: JSON.stringify(workflowStartPayload),
                    /*data: JSON.stringify({
                        definitionId: "bsx.createuserworkflowbtp",
                        context: { 
                            createUserPayload
                        }

                    }), */
                    beforeSend: function (xhr) {
                        var param = sWorkFlowUrl;
                        var token = that.getCSRFToken(sCsrfToken);
                        xhr.setRequestHeader("X-CSRF-Token", token);
                        xhr.setRequestHeader("Accept", "application/json");
                        //xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYnN4LXRkZC1xcThha3pqbi5hdXRoZW50aWNhdGlvbi5ldTEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktLTEyMTM1MTE0MDQiLCJ0eXAiOiJKV1QiLCJqaWQiOiAiWHI2WUMwRHlqV3hPclRQS091ZC9MWDdzZ1VKZEtOUE9keTRWS1FmWHkyZz0ifQ.eyJqdGkiOiJmYzA5YzY5ZDE1ZTY0YWJmOTBkNTY4NDI2YWY2MDk2ZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI3YmMyZTRhMi1iMWZiLTQyMGUtOGZmMy0wYzE5MzhkNDE5YWIiLCJ6ZG4iOiJic3gtdGRkLXFxOGFrempuIiwic2VydmljZWluc3RhbmNlaWQiOiJiNDg3MjM0Mi04ZTlhLTRjNTEtOTU5MC1mZDVmYzgwYWIyMmIifSwic3ViIjoic2ItYjQ4NzIzNDItOGU5YS00YzUxLTk1OTAtZmQ1ZmM4MGFiMjJiIWIxMjQ5Njl8eHN1YWEhYjEyMDI0OSIsImF1dGhvcml0aWVzIjpbInVhYS5yZXNvdXJjZSJdLCJzY29wZSI6WyJ1YWEucmVzb3VyY2UiXSwiY2xpZW50X2lkIjoic2ItYjQ4NzIzNDItOGU5YS00YzUxLTk1OTAtZmQ1ZmM4MGFiMjJiIWIxMjQ5Njl8eHN1YWEhYjEyMDI0OSIsImNpZCI6InNiLWI0ODcyMzQyLThlOWEtNGM1MS05NTkwLWZkNWZjODBhYjIyYiFiMTI0OTY5fHhzdWFhIWIxMjAyNDkiLCJhenAiOiJzYi1iNDg3MjM0Mi04ZTlhLTRjNTEtOTU5MC1mZDVmYzgwYWIyMmIhYjEyNDk2OXx4c3VhYSFiMTIwMjQ5IiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsInJldl9zaWciOiJlZjczMGMyOSIsImlhdCI6MTY3OTA1OTAwMCwiZXhwIjoxNjc5MTAyMjAwLCJpc3MiOiJodHRwczovL2JzeC10ZGQtcXE4YWt6am4uYXV0aGVudGljYXRpb24uZXUxMC5oYW5hLm9uZGVtYW5kLmNvbS9vYXV0aC90b2tlbiIsInppZCI6IjdiYzJlNGEyLWIxZmItNDIwZS04ZmYzLTBjMTkzOGQ0MTlhYiIsImF1ZCI6WyJ1YWEiLCJzYi1iNDg3MjM0Mi04ZTlhLTRjNTEtOTU5MC1mZDVmYzgwYWIyMmIhYjEyNDk2OXx4c3VhYSFiMTIwMjQ5Il19.ZKoHoHqqncxZDnaBRrunERUPAoiTn0wqnBN6fikUZwh0T1qePp8EBUquHOlXxHKnrnli98J6ND7zJM0waFPbcciLiB2EwRwbKUxms5Cq2bzKC5oULInZKZdeFL5xuetvdGDPmWqLLCx-R_tL76ONE3sI-PX5F2ymno-uJw5NLWcDCoHqNvQn44K_bvzelfu7sp6DdZAO0DVK7WKMsAgajHG_wZWjpdQMCgjSAM8-kZ2GgVP2isTbgK4ZtvM_jUastzaEgZ-O3cuX0P3NhgqcyWzsEj0EjbxHgP0g95b3hcRTPYb_3XSV-l2KsQxEIkwqVBWO289xJu7kXBhjBAtpbA");
                    },
                    success: function (oData, response) {
                        BusyIndicator.hide();
                        MessageBox.success("Approval workflow for creating user has been triggered successfully");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("Could not trigger the approval workflow for creating user, please re-try", errorThrown);
                    }
                }, this);
            },

            createUserInSubaccount: function (sFirstName, sLastName, sUserName, sEmailId) {
                var that = this;

                var path = "https://cockpit.eu10.hana.ondemand.com/" + "ajax/";
                var globalAccountGuid = "8dbdeef9-0011-4c0d-86f6-1263455768f9" + "/";
                var sRegion = "cf-eu10" + "/";
                var subAccountId = this.subAccId;
                //    var subAccountId = "7bc2e4a2-b1fb-420e-8ff3-0c1938d419ab";
                var sEntity = "/" + "createShadowUser" + "/";
                var sLocation = "/btp_cockpit";

                //var url = this.appModulePath + oLocation + "/ajax/" + globalAccountGuid + sRegion + subAccountId + sEntity + subAccountId;

                //var url1 = "https://api.authentication.eu10.hana.ondemand.com" + "/Users";

                var sDest = "/scim_shadow_users";
                var url = this.appModulePath + sDest + "/Users";
                //var url = this.appModulePath + sDest;
                //var url = "https://api.authentication.eu10.hana.ondemand.com/Users";
                var oPayload = {
                    "origin": this.sLocation,
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

            },

            /* functions for create user - END */

            /*on cancel create user */
            onCancelCreateUser: function (oEvent) {
                this.oCreateUserDialog.close();
                this.oCreateUserDialog.destroy();
                this.oCreateUserDialog = null;
            },

            /*ui actions */
            onChangeBtpAccess: function (oEvent) {
                var oSwitch = this.getView().byId("btpAccessSwitch");
                var bAccess = oEvent.getSource().getState();
                var sUserId = "";
                var bStatusText = "";
                var sUserName = "";
                var sUserEmail = "";

                var sRowPath = oEvent.getSource().getParent().oBindingContexts.oIdpUsersModel.getPath();
                sUserId = this.getView().getModel("oIdpUsersModel").getProperty(sRowPath).id;
                sUserId = sUserId.toUpperCase();
                sUserName = this.getView().getModel("oIdpUsersModel").getProperty(sRowPath).userName;
                sUserEmail = this.getView().getModel("oIdpUsersModel").getProperty(sRowPath).emails[0].value;

                if (bAccess === true) {
                    bStatusText = "Active";
                } else if (bAccess === false) {
                    bStatusText = "Inactive";
                }

                var sLocation = "/cis_brakesdev";
                /*switch (this.oLocation) {
                    case "httpsaqcgazolg.accounts.ondemand.com":
                        oLocation = "/cis_bsxtdd";
                        break;
                    case "httpsaqrl92om1.accounts.ondemand.com":
                        oLocation = "/cis_brakesdev";
                        break;
                    default:
                        oLocation = "/cis_bsxtdd";
                } */
                var that = this;
                var url = this.appModulePath + sLocation + "/scim/Users/" + sUserId;

                BusyIndicator.show(500);

                var oPayload = {
                    "schemas": [
                        "urn:ietf:params:scim:api:messages:2.0:PatchOp"
                    ],
                    "Operations": [
                        {
                            "op": "replace",
                            "value": {
                                "active": bAccess
                            }
                        }
                    ]
                };

                $.ajax({
                    url: url,
                    type: "PATCH",
                    contentType: "application/scim+json",
                    dataType: "json",
                    data: JSON.stringify(oPayload),
                    beforeSend: function (xhr) {
                        var param = url;
                        var token = that.getCSRFToken(param);
                        xhr.setRequestHeader("X-CSRF-Token", token);
                        xhr.setRequestHeader("Accept", "application/scim+json");
                        xhr.setRequestHeader("Authorization", "Bearer eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYnN4LXRkZC1xcThha3pqbi5hdXRoZW50aWNhdGlvbi5ldTEwLmhhbmEub25kZW1hbmQuY29tL3Rva2VuX2tleXMiLCJraWQiOiJkZWZhdWx0LWp3dC1rZXktLTEyMTM1MTE0MDQiLCJ0eXAiOiJKV1QiLCJqaWQiOiAicnhZTkNZRm1hQWF4QlM0WjZKUDRabGhnc2xHUjRRUXdGT2EwLzZwVXMrOD0ifQ.eyJqdGkiOiJhODhlYjI2ZTliZDE0MDdhYTc4MTUyYWY2ZTI5NjhhZiIsImV4dF9hdHRyIjp7ImVuaGFuY2VyIjoiWFNVQUEiLCJzdWJhY2NvdW50aWQiOiI3YmMyZTRhMi1iMWZiLTQyMGUtOGZmMy0wYzE5MzhkNDE5YWIiLCJ6ZG4iOiJic3gtdGRkLXFxOGFrempuIn0sInN1YiI6InNiLW5hLWZkNjlkNzM5LWRkN2MtNDk5Ni05NzM5LTFhZjU5NGUwOGQwYiFhMTI0OTY5IiwiYXV0aG9yaXRpZXMiOlsieHNfdXNlci53cml0ZSIsInVhYS5yZXNvdXJjZSIsInhzX2F1dGhvcml6YXRpb24ucmVhZCIsInhzX2lkcC53cml0ZSIsInhzX3VzZXIucmVhZCIsInhzX2lkcC5yZWFkIiwieHNfYXV0aG9yaXphdGlvbi53cml0ZSJdLCJzY29wZSI6WyJ4c191c2VyLndyaXRlIiwidWFhLnJlc291cmNlIiwieHNfYXV0aG9yaXphdGlvbi5yZWFkIiwieHNfaWRwLndyaXRlIiwieHNfdXNlci5yZWFkIiwieHNfaWRwLnJlYWQiLCJ4c19hdXRob3JpemF0aW9uLndyaXRlIl0sImNsaWVudF9pZCI6InNiLW5hLWZkNjlkNzM5LWRkN2MtNDk5Ni05NzM5LTFhZjU5NGUwOGQwYiFhMTI0OTY5IiwiY2lkIjoic2ItbmEtZmQ2OWQ3MzktZGQ3Yy00OTk2LTk3MzktMWFmNTk0ZTA4ZDBiIWExMjQ5NjkiLCJhenAiOiJzYi1uYS1mZDY5ZDczOS1kZDdjLTQ5OTYtOTczOS0xYWY1OTRlMDhkMGIhYTEyNDk2OSIsImdyYW50X3R5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJyZXZfc2lnIjoiOTM5YTExMWEiLCJpYXQiOjE2NzY0OTg4MzUsImV4cCI6MTY3NjU0MjAzNSwiaXNzIjoiaHR0cHM6Ly9ic3gtdGRkLXFxOGFrempuLmF1dGhlbnRpY2F0aW9uLmV1MTAuaGFuYS5vbmRlbWFuZC5jb20vb2F1dGgvdG9rZW4iLCJ6aWQiOiI3YmMyZTRhMi1iMWZiLTQyMGUtOGZmMy0wYzE5MzhkNDE5YWIiLCJhdWQiOlsic2ItbmEtZmQ2OWQ3MzktZGQ3Yy00OTk2LTk3MzktMWFmNTk0ZTA4ZDBiIWExMjQ5NjkiLCJ1YWEiLCJ4c191c2VyIiwieHNfaWRwIiwieHNfYXV0aG9yaXphdGlvbiJdfQ.WnnxstYfIPsQLDhJN-_yCgqwyzVppcwiXjLGifeRPfVyHq0GTPhj2PjOaS45fq3uj2gOC5UAfGxwr9xpyUiSk9iVJ8KdDy7yX5kwSAB_sqh2aDDyJb8qccQwiZHAuVZrDBmnGJXGSfNu5IAvwqr3SiXI2MfBI4Ti7SfeDFkxIbtk0N8twySjUWOlDA0_1nNR-IfGqqdxMNVCEeV8ANunQO8W_-2OmajeBqp4KMBdKu18H_4nXM7lQR-SaNgF0GT7rQA7Vfzbo5Yq_x4EIAKgOfosaAiF4uzLx4vMxetU38IMQiGkRHRYceBo01R2BwSyvHWIMgeEFo2NqWLJvSTZ_w");

                    },
                    success: function (oData, response) {
                        BusyIndicator.hide();
                        var sText = "The BTP Status of the user has been successfully set to " + "<strong>" + bStatusText + "</strong>";
                        var formattedText = new sap.m.FormattedText("formattedMsg", {
                            htmlText: sText
                        });
                        MessageBox.success(formattedText, {
                            onClose: function (sAction) {
                                if (sAction === "OK") {
                                    that.fetchAllIdpUsers();
                                }
                            }
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        BusyIndicator.hide();
                        MessageBox.error("The BTP Status of the user could not be changed, please re-try", errorThrown);
                    }
                }, this);

            },

            onSelectUserType: function (oEvent) {
                var sTempEmail = "", sTempUserName = "";
                var sTempEmailDomain = "@noemail.co.uk";
                var sKey = oEvent.getSource().getSelectedKey();
                if (sKey == "Temporary") {
                    BusyIndicator.show(500);
                    this.generateTempUserDetails();
                    /*sTempEmail = this.sLastPUserId + sTempEmailDomain;
                    sap.ui.getCore().byId("sEmail").setValue(sTempEmail); */
                } else {
                    sap.ui.getCore().byId("sEmail").setValue("");
                    sap.ui.getCore().byId("sUserName").setValue("");
                }
            },

            onChangeValidDays: function (oEvent) {
                if (oEvent.getSource().getValue() > 0) {
                    var sFromDate = new Date();
                    var sToDate = new Date();
                    var sValidityDays = parseInt(sap.ui.getCore().byId("sValidDays").getValue());

                    sToDate.setDate(sFromDate.getDate() + sValidityDays);
                    sToDate = sToDate.toDateString();
                    sap.ui.getCore().byId("sValidTo").setValue(sToDate);
                } else {
                    sap.ui.getCore().byId("sValidTo").setValue("");
                }
            },

            onExpDateChange: function (oEvent) {
                var oDatePicker = oEvent.getSource();
                var bValid = oEvent.getParameter("valid");

                if (bValid) {
                    oDatePicker.setValueState("None");
                } else {
                    oDatePicker.setValueState("Error");
                }
            },

            navigateToUserEdit: function(oEvent){
                var sPath = oEvent.getSource().oBindingContexts.oIdpUsersModel.sPath;
                //var oRow = [];
                //oRow.push(this.getView().getModel("oIdpUsersModel").getProperty(sPath));
                
                var oRow = this.getView().getModel("oIdpUsersModel").getProperty(sPath);
                sap.ui.getCore().getModel("oIdpEditUserModel").setData(oRow);
                this.getOwnerComponent().getRouter().navTo("MANAGEEDIT");
            },

            /* supporting functions */
            generateTempUserDetails: function () {
                this.startIndex = "1";
                this.aResources = [];
                //var url = this.appModulePath + sIdpLocation + "/scim/Users";
                this.fetchAllIdpUsers();
            },

            /*formatters */
            identifyMailId: function (aMailIds) {
                for (var i = 0; i < aMailIds.length; i++) {
                    if (aMailIds[i].primary === true) {
                        return aMailIds[i].value;
                    }
                }
            },

            formatValidTo: function (sDate) {
                if (sDate !== undefined && sDate !== "") {
                    var sDate = new Date(sDate);
                    var sNewDate = sDate.toDateString();
                    return sNewDate;
                } else {
                    return "";
                }

            }
        });
    });