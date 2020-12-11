sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, MessageToast) {
	"use strict";

	return BaseController.extend("com.coil.podium.MDM_Data.controller.Object", {

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

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
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

			this.getModel("objectView").setProperty("/parentId", sObjectId);

			//Begin of To do dynamic fetch for child list
			var parentId = parseInt(sObjectId);
			var oChildTable = this.getView().byId("table");
			var afilter1 = [new Filter("ParentId", FilterOperator.EQ, parentId),
				new Filter("IsArchived", FilterOperator.EQ, false),
				new Filter("IsChild", FilterOperator.EQ, true)
			];

			var oItemTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Image({
						width: "2rem",
						class: "sapUiTinyMargin",
						height: "2rem",
						src: {
							path: "__metadata",
							formatter: this.formatter.giveImage
						}
					}),
					new sap.m.Label({
						text: "{ServiceType}"
					}),
					new sap.m.Label({
						text: "{ServiceMessage}"
					}),
					new sap.m.Label({
						text: "{ContactNumber}"
					}),
					new sap.m.CheckBox({
						selected: "{IsCancelable}",
						editable: false
					}),
					new sap.m.ObjectStatus({
						text: "{IncidentType/IncidentType}",
						state: "{= ${IncidentType/IncidentType} === 'Emergency' ? 'Error' : 'Success' }"
					}),
					new sap.m.Label({
						text: "{Navigation/NavigationTypeName}"
					}),
					new sap.m.Button({
						icon: "sap-icon://edit",
						type: "Transparent",
						press: this.onEdit.bind(this)
					}),
					new sap.m.Button({
						icon: "sap-icon://delete",
						type: "Transparent",
						press: this.onDeleteChild.bind(this)
					})
				]
			});

			oChildTable.bindAggregation("items", {
				path: "/MasterServiceTypeSet",
				parameters: {
					expand: "Navigation,IncidentType"
				},
				filters: afilter1,
				template: oItemTemplate,
				templateShareable: true
			});
			//End of To do dynamic fetch for child list

			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("/MasterServiceTypeSet", {
					Id: sObjectId
				});
				this.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Navigation,IncidentType"
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
		 * @param data: will only be there for edit Event scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {

			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			this._pendingDelOps = [];
			if (data) {
				oViewModel.setProperty("/oDetails", data);
				return;
			}
			oViewModel.setProperty("/oDetails", {
				ServiceType: "",
				ServiceMessage: "",
				IncidentTypeId: 0,
				NavigationId: 0,
				ContactNumber: "",
				IsCancelable: false,
				IsArchived: false
			});
		},

		/*
		 * @param oEvent: having source and file info 
		 */
		onUpload: function (oEvent) {
			var oFile = oEvent.getSource().FUEl.files[0];
			this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
		},

		_fnAddFile: function (oItem) {
			//	var iIndex = oItem.Image.search(",") + 1;

			this.getModel("objectView").setProperty("/oImage", {
				Image: oItem.Image, //.slice(iIndex),
				FileName: oItem.name,
				IsArchived: false
			});

			this.getModel("objectView").refresh();
		},

		/** 
		 * 
		 * @param oFile
		 * @returns  Image Binary from file 
		 */
		getImageBinary: function (oFile) {
			var oFileReader = new FileReader();
			var sFileName = oFile.name;
			return new Promise(function (res, rej) {

				if (!(oFile instanceof File)) {
					res(oFile);
					return;
				}

				oFileReader.onload = function () {
					res({
						Image: oFileReader.result,
						name: sFileName
					});
				};
				res({
					Image: oFile,
					name: sFileName
				});
			});
		},

		onEdit: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				data = oEvent.getSource().getBindingContext().getObject();

			oViewModel.setProperty("/sChildMode", "E");
			oViewModel.setProperty("/oServiceData", data);
			oViewModel.setProperty("/sServicePath", oEvent.getSource().getBindingContext().getPath());

			var oView = this.getView();

			if (!this.byId("detailsChildDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "com.coil.podium.MDM_Data.dialog.Service",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("detailsChildDialog").open();
			}
		},

		addChild: function () {
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/oServiceData", {
				ServiceType: "",
				ServiceMessage: "",
				ContactNumber: "",
				IsCancelable: false,
				IncidentTypeId: null,
				NavigationId: null,
				ParentId: oViewModel.getProperty("/parentId"),
				IsChild: true
			});
			oViewModel.setProperty("/sChildMode", "C");
			var oView = this.getView();
			if (!this.byId("detailsChildDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "com.coil.podium.MDM_Data.dialog.Service",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				this.byId("detailsChildDialog").open();
			}
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onClose: function (oEvent) {
			this.byId("detailsChildDialog").close();
			this.getModel().refresh(true);
			this.getModel("objectView").setProperty("/oImage", null);
		},

		onDeleteChild: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();

			function onYes() {
				var data = this.getModel().getData(sPath);
				this.getModel().update(sPath, {
					ServiceType: data.ServiceType,
					ServiceMessage: data.ServiceMessage,
					ContactNumber: data.ContactNumber,
					IsCancelable: data.IsCancelable,
					IncidentTypeId: data.IncidentTypeId,
					NavigationId: data.NavigationId,
					IsArchived: true
				}, {
					success: this.showToast.bind(this, "MSG_SUCCESS_SERVICE_REMOVE")
				});
			}
			this.showWarning("MSG_CONFIRM_DELETE", onYes);
		},

		onSaveChild: function (oEvent) {

			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView"),
				data = oViewModel.getProperty("/oServiceData"),
				sPath = oViewModel.getProperty("/sServicePath");

			var oValid = this._fnValidationChild(data);
			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}
			var ParentId = parseInt(data.ParentId);
			if (data.IncidentTypeId === NaN) {
				data.IncidentTypeId = 1;
			}
			data.IncidentTypeId = parseInt(data.IncidentTypeId);
			data.NavigationId = parseInt(data.NavigationId);
			data.ParentId = ParentId;

			delete data.CreatedBy;
			delete data.UpdatedAt;
			delete data.UpdatedBy;
			delete data.CreatedAt;
			delete data.IncidentType;
			delete data.Navigation;
			delete data.__metadata;

			if (oViewModel.getProperty("/sChildMode") === "E") {
				this.getModel().update(sPath, data, {
					success: this._UploadImage(sPath, oViewModel.getProperty("/oImage")).then(this._SuccessChildEdit.bind(this, oEvent), this._Error
						.bind(
							this)),
					error: this._Error.bind(this)
				});
			} else {
				var that = this;
				sPath = "/MasterServiceTypeSet";
				this.getModel().create(sPath, data, {
					success: function (createddata) {
						var newSpath = sPath + "(" + createddata.Id + ")";
						that._UploadImage(newSpath, oViewModel.getProperty("/oImage")).then(that._SuccessChildAdd.bind(that, oEvent), that._Error
							.bind(
								that))
					},
					error: this._Error.bind(this)
				});
			}
		},

		_fnValidationChild: function (data) {
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!data.ServiceType) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_SERVTYPE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_SERVTYPE",
					target: "/oServiceData/ServiceType"
				});
			} else if (!data.ServiceMessage) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_SERVMSG");
				aCtrlMessage.push({
					message: "MSG_VALDTN_SERVMSG",
					target: "/oServiceData/ServiceMessage"
				});
			} else if (data.ContactNumber) {
				var mobileregex = /^[0-9]{5,15}$/;
				if (!mobileregex.test(data.ContactNumber)) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_INVALID_MOBILE");
					aCtrlMessage.push({
						message: "MSG_INVALID_MOBILE",
						target: "/oServiceData/ContactNumber"
					});
				}
			}

			if (aCtrlMessage.length) {
				this._genCtrlMessages(aCtrlMessage);
			}
			return oReturn;
		},

		/*
		 * @function
		 * Cancel current object action
		 */
		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},

		onSave: function (oEvent) {
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView"),
				data = oViewModel.getProperty("/oDetails");
			var oValid = this._fnValidation(data);
			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}

			delete data.CreatedBy;
			delete data.UpdatedAt;
			delete data.UpdatedBy;
			delete data.CreatedAt;
			delete data.IncidentType;
			delete data.Navigation;
			delete data.Icon;
			delete data.__metadata;

			if (oViewModel.getProperty("/sMode") === "E") {
				var that = this;
				var sPath = that.getModel().createKey("/MasterServiceTypeSet", {
					Id: data.Id
				});
				that.getModel().update(sPath, data, {
					success: that._UploadImage(sPath, oViewModel.getProperty("/oImage")).then(that._Success.bind(that, oEvent), that._Error.bind(
						that)),
					error: that._Error.bind(that)
				});
			}
			if (oViewModel.getProperty("/sMode") === "C") {
				var that = this;
				sPath = "/MasterServiceTypeSet";
				this.getModel().create(sPath, data, {
					success: function (createddata) {
						var newSpath = sPath + "(" + createddata.Id + ")";
						that._UploadImage(newSpath, oViewModel.getProperty("/oImage")).then(that._SuccessAdd.bind(that, oEvent), that._Error
							.bind(
								that))
					},
					error: this._Error.bind(this)
				});
			}
		},

		_fnValidation: function (data) {
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!data.ServiceType) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_SERVTYPE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_SERVTYPE",
					target: "/oDetails/ServiceType"
				});
			} else if (!data.ServiceMessage) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_SERVMSG");
				aCtrlMessage.push({
					message: "MSG_VALDTN_SERVMSG",
					target: "/oDetails/ServiceMessage"
				});
			} else if (data.ContactNumber) {
				var mobileregex = /^[0-9]{5,15}$/;
				if (!mobileregex.test(data.ContactNumber)) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_INVALID_MOBILE");
					aCtrlMessage.push({
						message: "MSG_INVALID_MOBILE",
						target: "/oDetails/ContactNumber"
					});
				}
			}

			if (aCtrlMessage.length) {
				this._genCtrlMessages(aCtrlMessage);
			}
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

		_UploadImage: function (sPath, oImage) {
			var that = this;

			return new Promise(function (res, rej) {
				if (!oImage) {
					res();
					return;
				}

				var settings = {
					url: "/EXPO_PODIUM_API" + sPath + "/$value",
					//	data : fd,
					data: oImage.Image,
					method: "PUT",
					contentType: "multipart/form-data",
					processData: false,
					success: function () {
						res.apply(that);
					},
					error: function () {
						rej.apply(that);
					}
				};

				$.ajax(settings);
			});
		},

		_Success: function () {
			this.getRouter().navTo("worklist", true);
			MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS"));
			var oModel = this.getModel();
			oModel.refresh(true);
		},

		_SuccessAdd: function () {
			this.getRouter().navTo("worklist", true);
			MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_ADD"));
		},

		_SuccessChildEdit: function (oEvent) {
			MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_SERVICE_CHILD_EDIT"));
			this.onClose(oEvent);
		},

		_SuccessChildAdd: function (oEvent) {
			MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_SERVICE_CHILD_ADD"));
			this.onClose(oEvent);
		},

		_Error: function (error) {
			MessageToast.show(error.toString());
		}

	});

});