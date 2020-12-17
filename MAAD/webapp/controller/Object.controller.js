sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter"
], function (BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("com.coil.podium.MAAD.controller.Object", {

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
					busy: true
						// oFiles: []
				});
			this.setModel(oViewModel, "objectView");

			debugger;
			var sCurrentLocale = sap.ui.getCore().getConfiguration().getLanguage();
			this.getModel("objectView").setProperty("/loggedInLanguage", sCurrentLocale);
			this.getModel("objectView").setProperty("/languageEn", "en-US");
			this.getModel("objectView").setProperty("/languageAr", "ar-AE");

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);
			/*
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
		*/
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");

			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// oViewModel.setProperty("/busy", false);
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
			this._pendingDelOps = [];

			var myModel = this.getOwnerComponent().getModel();
			myModel.setSizeLimit(999);

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

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

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

		/* 
		 * @function
		 * Save edit or create Event details 
		 */
		onSave: function () {

			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");
			// var oPayload = $.extend(true, {}, oViewModel.getProperty("/oDetails"));
			var oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}

			oPayload.Specialities = oPayload.Specialities.map(function (ele) {
				return {
					Id: ele
				};
			});

			oViewModel.setProperty("/busy", true);
			this.CUOperation(oPayload);
		},

		/*
		 * @function
		 * Cancel current object action
		 */
		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},

		// Below Function triggers when user click on Country dropdown
		onCountryChange: function (oEvent) {
			var oSelectedItem = oEvent.getSource().getSelectedItem();
			var oObject = oSelectedItem.getBindingContext().getObject();
			this.getModel("objectView").setProperty("/oDetails/DialCode", oObject.DialCode);

			if (oEvent.getParameter("itemPressed") === false) {
				oEvent.getSource().setValue("");
			}

		},

		onChangeManagerId: function (oEvent) {
			if (oEvent.getParameter("itemPressed") === false) {
				oEvent.getSource().setValue("");
			}
		},

		onChangeSpeciality: function (oEvent) {
			if (oEvent.getParameter("itemPressed") === false) {
				oEvent.getSource().setValue("");
			}
		},

		onRoleChange: function (oEvent) {
			var oSelectedItem = oEvent.getSource().getSelectedItem();
			var oObject = oSelectedItem.getBindingContext().getObject();
			if (oObject.Id === 4) {
				var setflag = true;
				this.getModel("objectView").setProperty("/oDetails/splflg", setflag);
			}
			if (oObject.Id !== 4) {
				setflag = false;
				this.getModel("objectView").setProperty("/oDetails/splflg", setflag);
			}
		},

		// Below function triggers when user enter any value in Email input field
		onEmailValidate: function () {
			var email = this.getView().byId("emailInput").getValue();
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (!mailregex.test(email)) {
				this.showToast.call(this, "MSG_INVALID_EMAIL");
			}
		},

		// Below function triggers when user enter any value in Mobile input field
		onMobileValidate: function () {
			var mobile = this.getView().byId("mobileInputEn").getValue();
			if (!mobile) {
				mobile = this.getView().byId("mobileInputAr").getValue();
			}
			var mobileregex = /^[0-9]{5,15}$/;
			if (!mobileregex.test(mobile)) {
				this.showToast.call(this, "MSG_INVALID_MOBILE");
			}
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
				var sObjectPath = this.getModel().createKey("/UserSet", {
					Id: sObjectId
				});
				this.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Specialities"
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
			var loggedRoleId = this.getModel("appView").getProperty("/loggedRoleId");
			var ManagerId = null;
			this._oMessageManager.removeAllMessages();
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			if (data) {
				if (data.Specialities) {
					data.Specialities = data.Specialities.results.map(function (ele) {
						return ele.Id;
					});
				}
				oViewModel.setProperty("/oDetails", data);
				return;
			}
			var selectedRole = this.getModel("appView").getProperty("/selectedRoleId");
			selectedRole = parseInt(selectedRole);
			if (selectedRole === null || selectedRole === 0) {
				selectedRole = 1;
			}
			if (loggedRoleId === 2) {
				ManagerId = this.getModel("appView").getProperty("/loggedUserId");
			}
			oViewModel.setProperty("/oDetails", {
				// RoleId: selectedRole.toString(),
				RoleId: selectedRole,
				FirstName: "",
				LastName: "",
				Email: "",
				Address: "",
				City: "",
				State: "",
				Country: "",
				Zip: "",
				DialCode: "",
				Mobile: "",
				EmergencyDialCode: "",
				EmergencyMobile: "",
				Specialities: [],
				ManagerId: ManagerId,
				IsArchived: false
			});
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.Id,
				sObjectName = oObject.Description;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#ManageAdmin-display&/UserSet/" + sObjectId
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		/*
		 * To validate values of payload
		 * @constructor  
		 * @param data : data to be tested upon
		 * @returns Object
		 * @param IsNotValid : true for failed validation cases
		 * @param sMsg : Warning message to be shown for validation error
		 * 
		 * 
		 */
		_fnValidation: function (data) {
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];

			var email = this.getView().byId("emailInput").getValue();
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

			var mobile = this.getView().byId("mobileInputEn").getValue();
			if (!mobile) {
				mobile = this.getView().byId("mobileInputAr").getValue();
			}
			var mobileregex = /^[0-9]{5,15}$/;

			if (!data.RoleId) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_ROLE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_ROLE",
					target: "/oDetails/RoleId"
				});
			} else if (!data.FirstName) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_FNAME");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_FNAME",
					target: "/oDetails/FirstName"
				});
			} else if (!data.LastName) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_LNAME");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_LNAME",
					target: "/oDetails/LastName"
				});
			} else if (!data.Email) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_EMAIL");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_EMAIL",
					target: "/oDetails/Email"
				});
			} else if (data.Email && !mailregex.test(email)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_INVALID_EMAIL");
				aCtrlMessage.push({
					message: "MSG_INVALID_EMAIL",
					target: "/oDetails/Email"
				});
			} else if (data.Mobile && !mobileregex.test(mobile)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_INVALID_MOBILE");
				aCtrlMessage.push({
					message: "MSG_INVALID_MOBILE",
					target: "/oDetails/Mobile"
				});
			} else if (!data.ManagerId && data.RoleId === 4) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_INVALID_TEAM_MANAGER");
				aCtrlMessage.push({
					message: "MSG_INVALID_TEAM_MANAGER",
					target: "/oDetails/ManagerId"
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
			delete oPayload.Role;
			delete oPayload.EmergencyRelationship;
			delete oPayload.UserPreference;
			delete oPayload.VolunteerAssignment;
			delete oPayload.UserDevice;
			if (oPayload.RoleId !== 4) {
				delete oPayload.Specialities;
			}
			var oClonePayload = $.extend(true, {}, oPayload),
				that = this;

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sMode") === "E") {
					var sKey = that.getModel().createKey("/UserSet", {
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
					that.getModel().create("/UserSet", oClonePayload, {
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

		_fnUpdt: function (oViewModel, data) {
			var aProms = [],
				that = this;
			oViewModel.setProperty("/busy", true);
			Promise.all(aProms).then(
				function () {
					oViewModel.setProperty("/busy", false);
					that.showToast.bind(that, "MSG_SUCCESS_CREATE");
				}
			);
		}
	});

});