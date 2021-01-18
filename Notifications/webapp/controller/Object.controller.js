sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/SeparatorItem"
], function (BaseController, JSONModel, formatter, SeparatorItem) {
	"use strict";

	return BaseController.extend("com.coil.podium.Notifications.controller.Object", {

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
					IsLater: true,
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

		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
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
			var that = this;
			var TtlNotification;
			var viewchar = this.getModel("appView").getProperty("/viewFlag");
			if (viewchar === "X") {
				that.getModel("objectView").setProperty("/sMode", "X");
				TtlNotification = this.getView().getModel("i18n").getResourceBundle().getText("TtlViewNotification");
				this.getModel("objectView").setProperty("/TtlNotification", TtlNotification);
			} else {
				that.getModel("objectView").setProperty("/sMode", "E");
				TtlNotification = this.getView().getModel("i18n").getResourceBundle().getText("TtlEditNotification");
				this.getModel("objectView").setProperty("/TtlNotification", TtlNotification);
			}
			that.getModel("objectView").setProperty("/busy", true);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = that.getModel().createKey("/NotificationSet", {
					UUID: sObjectId
				});
				// this._bindView("/" + sObjectPath); Redirection
				that.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Redirection,Receivers/Role"
					},
					// success: this._setView.bind(this)
					success: function (data) {
						that._setView.call(that, data);
					}
				});
			}.bind(that));
		},

		/** 
		 * Match for create route trigger
		 * @function 
		 */
		_onCreateObjectMatched: function () {
			this.getModel("objectView").setProperty("/sMode", "C");
			// this.getModel("objectView").setProperty("/TtlNotification", "Add Notification");
			var TtlNotification = this.getView().getModel("i18n").getResourceBundle().getText("TtlAddNotification");
			this.getModel("objectView").setProperty("/TtlNotification", TtlNotification);
			this.getModel("objectView").setProperty("/busy", true);
			this._setView();
		},

		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit Event scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);

			if (data) {
				if (data.Receivers) {
					data.Receivers = data.Receivers.results.map(function (ele) {
						return ele.Id;
					});
				}
				oViewModel.setProperty("/oDetails", data);
				if (data.ScheduledDate === null) {
					oViewModel.setProperty("/oDetails/IsLater", false);
				} else {
					oViewModel.setProperty("/oDetails/IsLater", true);
				}
				return;
			}
			oViewModel.setProperty("/oDetails", {
				Subject: "",
				Body: "",
				RedirectionType: "",
				RedirectionTo: "",
				IsGroupNotification: false,
				GroupId: null,
				Receivers: [],
				ScheduledDate: null,
				ScheduledTime: null,
				IsLater: false
			});
		},

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
		},

		getGroupHeader: function (oGroup) {
			return new SeparatorItem({
				text: oGroup.key
			});
		},

		/*
		 * @function
		 * Cancel current object action
		 */
		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},

		/* 
		 * @function
		 * Save edit or create FAQ details 
		 */
		onDraft: function () {
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");

			if (oPayload.IsGroupNotification === false) {
				oPayload.GroupId = null;
			}

			if (oPayload.IsGroupNotification === true) {
				oPayload.Receivers = [];
				if (oPayload.GroupId !== null) {
					oPayload.GroupId = parseInt(oPayload.GroupId);
				}
			}

			if (oPayload.IsLater === false) {
				oPayload.ScheduledDate = null;
				oPayload.ScheduledTime = null;
			}

			oPayload.NotificationStatus = "DRAFT";

			if (oPayload.GroupId !== null) {
				oPayload.GroupId = parseInt(oPayload.GroupId);
			}

			var oValid = this._fnValidationView(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}

			oPayload.Receivers = oPayload.Receivers.map(function (ele) {
				return {
					Id: ele
				};
			});

			oViewModel.setProperty("/busy", true);
			this.CUOperation(oPayload);
		},

		onPublish: function () {
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");

			if (oPayload.IsGroupNotification === false) {
				oPayload.GroupId = null;
			}

			if (oPayload.IsGroupNotification === true) {
				oPayload.Receivers = [];
				if (oPayload.GroupId !== null) {
					oPayload.GroupId = parseInt(oPayload.GroupId);
				}
			}

			if (oPayload.IsLater === false) {
				oPayload.ScheduledDate = null;
				oPayload.ScheduledTime = null;
			}

			oPayload.NotificationStatus = "SCHEDULED";

			if (oPayload.GroupId !== null) {
				oPayload.GroupId = parseInt(oPayload.GroupId);
			}

			var oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}

			oPayload.Receivers = oPayload.Receivers.map(function (ele) {
				return {
					Id: ele
				};
			});

			oViewModel.setProperty("/busy", true);
			this.CUOperation(oPayload);
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
				aCtrlMessage = [],
				url = data.RedirectionTo,
				regex =
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

			if (!data.Subject) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SUBJECT");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SUBJECT",
					target: "/oDetails/Subject"
				});
			} else
			if (!data.Body) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_BODY");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_BODY",
					target: "/oDetails/Body"
				});
			} else
			if (!data.RedirectionTo && data.RedirectionType) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_RTO");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_RTO",
					target: "/oDetails/RedirectionTo"
				});
			} else
			if (data.RedirectionTo && data.RedirectionType === 'LINK' && !url.match(regex)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_URL");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_URL",
					target: "/oDetails/RedirectionTo"
				});
			} else
			if (!data.GroupId && data.IsGroupNotification === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_GROUPID");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_GROUPID",
					target: "/oDetails/GroupId"
				});
			} else
			if (data.Receivers.length === 0 && data.IsGroupNotification === false) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_RECEIVERS");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_RECEIVERS",
					target: "/oDetails/Receivers"
				});
			} else
			if (!data.ScheduledDate && data.IsLater === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SDATE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SDATE",
					target: "/oDetails/ScheduledDate"
				});
			} else
			if (!data.ScheduledTime && data.IsLater === true) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_STIME");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_STIME",
					target: "/oDetails/ScheduledTime"
				});
			}

			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
			return oReturn;
		},

		_fnValidationView: function (data) {
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!data.Subject) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SUBJECT");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SUBJECT",
					target: "/oDetails/Subject"
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
			delete oPayload.__metadata;
			if (oPayload.IsGroupNotification === true) {
				delete oPayload.Receivers;
			}
			if (oPayload.IsGroupNotification === false) {
				delete oPayload.Group;
			}
			var oViewModel = this.getModel("objectView");
			var oClonePayload = $.extend(true, {}, oPayload),
				that = this;

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sMode") === "E") {
					var sKey = that.getModel().createKey("/NotificationSet", {
						UUID: oClonePayload.UUID
					});
					that.getModel().update(sKey, oClonePayload, {
						success: function () {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_UPDATE");
							res(oClonePayload);
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				} else {
					that.getModel().create("/NotificationSet", oClonePayload, {
						success: function (data) {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_CREATE");
							res(data);
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				}
			});
		}

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		// _bindView : function (sObjectPath) {
		// 	var oViewModel = this.getModel("objectView"),
		// 		oDataModel = this.getModel();

		// 	this.getView().bindElement({
		// 		path: sObjectPath,
		// 		events: {
		// 			change: this._onBindingChange.bind(this),
		// 			dataRequested: function () {
		// 				oDataModel.metadataLoaded().then(function () {
		// 					// Busy indicator on view should only be set if metadata is loaded,
		// 					// otherwise there may be two busy indications next to each other on the
		// 					// screen. This happens because route matched handler already calls '_bindView'
		// 					// while metadata is loaded.
		// 					oViewModel.setProperty("/busy", true);
		// 				});
		// 			},
		// 			dataReceived: function () {
		// 				oViewModel.setProperty("/busy", false);
		// 			}
		// 		}
		// 	});
		// },

		// _onBindingChange : function () {
		// 	var oView = this.getView(),
		// 		oViewModel = this.getModel("objectView"),
		// 		oElementBinding = oView.getElementBinding();

		// 	// No data for the binding
		// 	if (!oElementBinding.getBoundContext()) {
		// 		this.getRouter().getTargets().display("objectNotFound");
		// 		return;
		// 	}

		// 	var oResourceBundle = this.getResourceBundle(),
		// 		oObject = oView.getBindingContext().getObject(),
		// 		sObjectId = oObject.UUID,
		// 		sObjectName = oObject.Subject;

		// 	oViewModel.setProperty("/busy", false);
		// 	// Add the object page to the flp routing history
		// 	this.addHistoryEntry({
		// 		title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
		// 		icon: "sap-icon://enter-more",
		// 		intent: "#Notifications-display&/NotificationSet/" + sObjectId
		// 	});

		// 	oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
		// 	oViewModel.setProperty("/shareOnJamTitle", sObjectName);
		// 	oViewModel.setProperty("/shareSendEmailSubject",
		// 	oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
		// 	oViewModel.setProperty("/shareSendEmailMessage",
		// 	oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		// }

	});

});