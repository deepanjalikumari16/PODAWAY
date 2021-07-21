sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, syncStyleClass) {
	"use strict";

	return BaseController.extend("com.coil.podway.Groups.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("objectView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			this.getModel("objectView").setProperty("/sMode", "E");
			this.getModel("objectView").setProperty("/busy", true);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("/NotificationGroupSet", {
					Id: sObjectId
				});
				// this._bindView("/" + sObjectPath);
				// this._bindView("/" + sObjectPath, sObjectId);
				this.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Members/Role"
					},
					success: this._setView.bind(this)
				});
			}.bind(this));
		},

		/** 
		 * Match for create route trigger
		 * @function 
		 */
		_onCreateObjectMatched: function () {
			this.getModel("objectView").setProperty("/sMode", "C");
			this.getModel("objectView").setProperty("/busy", true);
			this._setView();
		},

		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit User scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {
			this._oMessageManager.removeAllMessages();
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			if (data) {
				oViewModel.setProperty("/oDetails", data);
				oViewModel.setProperty("/oDetails/Members", data.Members.results);
				return;
			}
			oViewModel.setProperty("/oDetails", {
				GroupName: "",
				Members: [],
				IsArchived: false
			});
		},

		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
		},

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
		},

		onDeleteMember: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				iIndex = +(oEvent.getParameter("listItem").getBindingContext("objectView").sPath.match(/\d+/)[0]);
			oViewModel.getProperty("/oDetails/Members").splice(iIndex, 1);
			oViewModel.refresh();
		},

		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},
		/* 
		 * @function
		 * Save edit or create Group details 
		 */
		onSave: function () {
			this._oMessageManager.removeAllMessages();
			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");
			var oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}
			oViewModel.setProperty("/busy", true);
			this.CUOperation(oPayload);
		},

		_fnValidation: function (data) {
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!data.GroupName) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_GROUP");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_GROUP",
					target: "/oDetails/GroupName"
				});
			} else
			if (data.Members.length === 0) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_MEMBERS");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_MEMBERS",
					target: "/oDetails/Members"
				});
			}
			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
			return oReturn;
		},

		_genCtrlMessages: function (aCtrlMsgs) {
			var that = this,
				oViewModel = that.getModel("objectView");
			aCtrlMsgs.forEach(function (ele) {
				that._oMessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: that.getResourceBundle().getText(ele.message),
						type: sap.ui.core.MessageType.Error,
						target: ele.target,
						processor: oViewModel,
						persistent: true
					}));
			});
		},

		_fnMsgConcatinator: function (aMsgs) {
			var that = this;
			return aMsgs.map(function (x) {
				return that.getResourceBundle().getText(x);
			}).join("");
		},

		CUOperation: function (oPayload) {
			var oViewModel = this.getModel("objectView");
			delete oPayload.__metadata;
			var oClonePayload = $.extend(true, {}, oPayload),
				that = this;

			if (oClonePayload.Members !== null && oClonePayload.Members.length > 0) {
				for (var i = 0; i < oClonePayload.Members.length; i++) {
					var oMembers = oClonePayload.Members[i];
					delete oMembers.__metadata;
					delete oMembers.VolunteerAssignment;
					delete oMembers.UserPreference;
					delete oMembers.UserDevice;
					delete oMembers.Specialities;
					delete oMembers.Manager;
					delete oMembers.EmergencyRelationship;
					delete oMembers.Manager;
				}
			}

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sMode") === "E") {

					var sKey = that.getModel().createKey("/NotificationGroupSet", {
						Id: oClonePayload.Id
					});
					that.getModel().update(sKey, oClonePayload, {
						success: function () {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_UPDATE");
							res(oClonePayload);
							// that.onCancel();
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				} else {
					that.getModel().create("/NotificationGroupSet", oClonePayload, {
						success: function (data) {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_CREATE");
							res(data);
							// that.onCancel();
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				}
			});
		},

		handleConfirm: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				aData = oViewModel.getProperty("/oDetails/Members"),
				aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				for (var i = 0; i < aContexts.length; i++) {
					var userData = aContexts[i].getObject();
					var roleData = this.getModel().getData("/" + userData.Role.__ref);
					userData.Role.Role = roleData.Role;
					aData.push(userData);
				}
			}
			var uniqueArray = this.removeDuplicates(aData, "Id");
			oViewModel.setProperty("/oDetails/Members", uniqueArray);
			oViewModel.refresh(true);

			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
		},

		removeDuplicates: function (originalArray, prop) {
			var newArray = [];
			var lookupObject = {};

			for (var i in originalArray) {
				lookupObject[originalArray[i][prop]] = originalArray[i];
			}

			for (i in lookupObject) {
				newArray.push(lookupObject[i]);
			}
			return newArray;
		},

		handleClose: function (oEvent) {
			// reset the filter
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([]);
		},

		addMember: function (oEvent) {
			if (!this._oDialog) {
				Fragment.load({
					name: "com.coil.podium.Groups.view.SelectMemberDialog",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._configDialog();
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog();
				this._oDialog.open();
			}
		},

		_configDialog: function () {
			var bMultiSelect = true;
			this._oDialog.setMultiSelect(bMultiSelect);

			// Set custom text for the confirmation button
			var sCustomConfirmButtonText = "Confirm";
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// connect dialog to the root view 
			//of this component (models, lifecycle)
			this.getView().addDependent(this._oDialog);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		handleSearch: function (oEvent) {

			var sQuery = oEvent.getParameter("value").toLowerCase();
			sQuery = "'" + sQuery + "'";

			if (sQuery && sQuery.length > 0) {

				// var sPath = "/UserSet";
				// if (sQuery) {
				// 	var oCustomParam = {
				// 		Query: sQuery
				// 	};
				// }
				// var oSorter = {
				// 	Path: "Id",
				// 	Descending: false
				// };
				// var sExpand = "Role";
				// var sSelect = "Id,FirstName,LastName,Email,RoleId,Role/Role";
				// this._Template = this._Template ? this._Template : this.getView("SelectMemberDialogfragment").byId("userDialog");
				// var aFilters = new sap.ui.model.Filter({
				// 	filters: [
				// 		new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
				// 	]
				// });

				// //Call bindTable with function parameters....
				// if (sQuery) {
				// 	this.bindTable("tableDialog", sPath, this._Template, aFilters, sExpand, sSelect, oCustomParam);
				// } else {
				// 	this.bindTable("tableDialog", sPath, this._Template, aFilters, sExpand, sSelect);
				// }

				var InputFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("tolower(FirstName)", sap.ui.model.FilterOperator.Contains, sQuery, false),
						new sap.ui.model.Filter("tolower(LastName)", sap.ui.model.FilterOperator.Contains, sQuery, false),
						new sap.ui.model.Filter("tolower(Email)", sap.ui.model.FilterOperator.Contains, sQuery, false)
					],
					and: false
				});

				var oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter([InputFilter]);
			}
		}

		/** 
		 * 
		 * @param sTableId - Table Id
		 * @param sPath - binding path
		 * @param oTemplate - Item template 
		 * Optional? @param aFilters - filters array
		 * Optional? @param aCustomParam - Custom paramter
		 */
		// bindTable: function (sTableId, sPath, oTemplate, aFilters, sExpand, sSelect, oCustomParam) {
		// 	// debugger;
		// 	var oBindSettings = {
		// 		path: sPath,
		// 		template: oTemplate.clone(),
		// 		parameters: {}
		// 	};

		// 	if (!!aFilters) {
		// 		oBindSettings.filters = aFilters;
		// 	}

		// 	if (!!oCustomParam) {
		// 		oBindSettings.parameters.custom = oCustomParam;
		// 	}

		// 	if (!!sExpand) {
		// 		oBindSettings.parameters.expand = sExpand;
		// 	}

		// 	if (!!sSelect) {
		// 		oBindSettings.parameters.select = sSelect;
		// 	}

		// 	// if (!!oSorter) {
		// 	// 	oBindSettings.sorter = oSorter;
		// 	// }

		// 	this.getView().byId(sTableId).bindItems(oBindSettings);

		// }

	});

});