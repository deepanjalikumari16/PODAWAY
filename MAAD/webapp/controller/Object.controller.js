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
			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails"),
				oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}
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
			var mobile = this.getView().byId("mobileInput").getValue();
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
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			if (data) {
				oViewModel.setProperty("/oDetails", data);
				return;
			}
			oViewModel.setProperty("/oDetails", {
				RoleId: null,
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
			};

			if (data.RoleId === null) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please select Role");
			} else
			if (data.FirstName === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter First Name");
			} else
			if (data.LastName === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter Last Name");
			} else
			if (data.Email === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter Email");
			} else
			if (data.EMail !== "") {
				var email = this.getView().byId("emailInput").getValue();
				var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!mailregex.test(email)) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("Please enter a valid email address");
				}
			}
			if (data.Mobile !== "") {
				var mobile = this.getView().byId("mobileInput").getValue();
				var mobileregex = /^[0-9]{5,15}$/;
				if (!mobileregex.test(mobile)) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_INVALID_MOBILE");
				}
			}
			return oReturn;
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