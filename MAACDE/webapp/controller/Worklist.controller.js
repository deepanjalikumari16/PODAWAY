sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
	"use strict";

	return BaseController.extend("com.coil.podium.MAACDE.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel, that = this;
			//	,iOriginalBusyDelay,
			//	oPage = this.byId("page");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			//	iOriginalBusyDelay = oPage.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			var sTypeString;
			switch (this.getOwnerComponent().sAccType) {
			case 1:
				sTypeString = this.getResourceBundle().getText("Device");
				break;
			case 2:
				sTypeString = this.getResourceBundle().getText("Condition");
				break;
			case 3:
				sTypeString = this.getResourceBundle().getText("Place");

			}

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				//	worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				bDeviceItemsBusy: false,
				bEditQuestion: false,
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				//	tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0,
				appType: sTypeString
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			// oPage.attachEventOnce("updateFinished", function(){
			// 	// Restore original busy indicator delay for worklist's table
			// 	oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			// });
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://wrench",
				intent: this.getIntent(this.getOwnerComponent().sAccType)
			}, true);

			this.getOwnerComponent().getModel().metadataLoaded().then(that._fnInitialBindings.bind(that));

		},

		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
		},

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("worklistView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
		},

		getIntent: function (iAccType) {
			var sAccType;
			switch (iAccType) {
			case 1:
				sAccType = "#Manage-Device";
				break;
			case 2:
				sAccType = "#Manage-Condition";
				break;
			case 3:
				sAccType = "#Manage-Place";
			}
			return sAccType;

		},

		//Binding based with dynamic parameters 
		_fnInitialBindings: function () {
			var oDynPgTitleCtrl = this.getView().getContent()[0].getTitle(),
				oGridCtrl = this.getView().byId("gdAccItems"),
				oDataModel = this.getOwnerComponent().getModel();

			oDataModel.read("/AccessibilitySet", {
				filters: [new Filter("Type", FilterOperator.EQ, this._getAccName(this.getOwnerComponent().sAccType))],
				success: function (data) {
					var sKey = oDataModel.createKey("/AccessibilitySet", {
						Id: data.results[0].Id
					});
					oDynPgTitleCtrl.bindElement(sKey);
					//	this.getModel().refresh(true);		
				}
			});

			var oTemplate = oGridCtrl.getContent()[0].clone();

			oGridCtrl.bindAggregation("content", {
				template: oTemplate,
				path: "/AccessibilityItemSet",
				events: {
					dataRequested: this._fnbusyItems.bind(this),
					dataReceived: this._fnbusyItems.bind(this)
				},
				filters: [new Filter("AccessibilityId", FilterOperator.EQ, this.getOwnerComponent().sAccType),
					new Filter("IsArchived", FilterOperator.EQ, false)
				],
				templateShareable: true
			});

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onEditQuestion: function () {
			var bValue = this.getModel("worklistView").getProperty("/bEditQuestion");
			this.getModel("worklistView").setProperty("/bEditQuestion", !bValue);
		},

		onSaveQuestion: function () {
			var sValue = this.getView().byId("ipTitle").getValue(),
				sHeading = this.getView().byId("ipHeading").getValue(),
				that = this;

			var sPath = this.getView().byId("ipTitle").getBindingContext().getPath();

			this.getModel().update(sPath, {
				Question: sValue,
				Heading: sHeading
			}, {
				success: function () {
					this.onEditQuestion();
					this._fnSuccessToast("MSG_SUCCESS_TITLE_UPDATE");
				}.bind(that)

			});

		},

		onAddOption: function () {
			var that = this;

			that.getModel("worklistView").setProperty("/oAddOption", {
				Title: "",
				AccessibilityId: this.getOwnerComponent().sAccType,
				Icon: null,
				TextAllowed: false,
				IsEnabled: false
			});

			that.getModel("worklistView").setProperty("/sDialogMode", "C");

			that._DeviceAccessibilityDialog();

		},

		onCancelAddOption: function () {
			this.byId("updAddOptn").setValue(null);
			this._oDlgAddOption.close();
			//	this._oDlgAddOption.destroy();
		},
		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("worklistView"),
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

		onSaveAddOption: function () {
			var oImageEditorCtrl = this._oDlgAddOption.getContent()[1].getImageEditor();

			//Validations
			if (this._bNotValid(oImageEditorCtrl)) {
				return;
			}

			oImageEditorCtrl.getImageAsBlob()
				.then(this._imageBlob.bind(this));

		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("Question", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		onFileChange: function (oEvent) {
			var oFile = oEvent.getParameter("files")[0];

			//	,oImageEditor = this.getImageEditorControl(oEvent.getSource());

			if (!oFile) {
				return;
			}

			this.getModel("worklistView").setProperty("/oAddOption/Icon", oFile);
			//	oImageEditor.setSrc(oFile);

			//that._oDlgAddOption

		},
		onImageLoaded: function (oEvent) {
			var oCtrl = oEvent.getSource();
			if (this.getModel("worklistView").getProperty("/oAddOption/Icon")) {
				//using timeout as bug with zoom level of image editor
				setTimeout(function () {
					oCtrl.zoomToFit();
				}, 2000); // oEvent.getSource().zoomToFit();
			}
		},

		//Common method for device interaction
		onDevice: function (oEvent) {
			var sBtnType = oEvent.getSource().getType(),
				sPath = oEvent.getSource().getBindingContext().getPath(),
				that = this;

			//pressed "Delete"
			if (sBtnType === "Reject") {
				//	that.getModel().remove(sPath,  {  success : that._fnSuccessToast.bind(that , "MSG_SUCCESS_DEVICE_REMOVE")  }       );
				var sMsg = {};
				switch (that.getOwnerComponent().sAccType) {
				case 1:
					sMsg.warn = "MSG_CONFIRM_REMOVE_DEVICEITEM";
					sMsg.succ = "MSG_SUCCESS_DEVICE_REMOVE";
					break;
				case 2:
					sMsg.warn = "MSG_CONFIRM_REMOVE_CONDITION";
					sMsg.succ = "MSG_SUCCESS_CONDITION_REMOVE";
					break;
				case 3:
					sMsg.warn = "MSG_CONFIRM_REMOVE_PLACE";
					sMsg.succ = "MSG_SUCCESS_PLACE_REMOVE";
				}

				this._fnWarningMessageBox(sMsg.warn,

					function () {
						that.getModel().update(sPath, {
							IsArchived: true
						}, {
							success: that._fnSuccessToast.bind(that, sMsg.succ)
						});
					}

				);

			} else {
				//Pressed Edit
				var oClone = $.extend(true, {}, oEvent.getSource().getBindingContext().getObject()),
					oUrl = new URL(oClone.__metadata.media_src);
				oClone.Icon = "/EXPO_PODIUM_API" + oUrl.pathname;
				that.getModel("worklistView").setProperty("/oAddOption", oClone);
				that.getModel("worklistView").setProperty("/sDialogMode", "E");
				that._DeviceAccessibilityDialog();
			}

		},
		_fnbusyItems: function (oEvent) {
			var oViewModel = this.getModel("worklistView");
			if (oEvent.getId() === "dataRequested") {
				oViewModel.setProperty("/bDeviceItemsBusy", true);
			} else {
				oViewModel.setProperty("/bDeviceItemsBusy", false);
			}

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_DeviceAccessibilityDialog: function () {
			var oView = this.getView(),
				that = this;
			// create dialog lazily
			if (!that._oDlgAddOption) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "com.coil.podium.MAACDE.dialog.AddOption",
					controller: that
				}).then(function (oDialog) {
					that._oDlgAddOption = oDialog;
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.open();
				});
			} else {
				that._oDlgAddOption.open();
			}
		},

		_bNotValid: function (oImageEditorCtrl) {
			var breturn = false;
			this._oMessageManager.removeAllMessages();
			var aCtrlMessage = [];

			if (this.getModel("worklistView").getProperty("/oAddOption/Title").length === 0) {
				aCtrlMessage.push({   message : "MSG_ERR_TITLE" , target :  "/oAddOption/Title" });
				this._fnSuccessToast("MSG_ERR_TITLE");
				 breturn = true;
			}

			if (!oImageEditorCtrl.getLoaded() &&  !breturn ) {
				this._fnSuccessToast("MSG_ERR_IMAGE");
				 breturn = true;
			}

			this._GenCtrlMessages(aCtrlMessage);
			if (this._oMessageManager.getMessageModel().getData().length > 0) {
				 breturn = true;
			}
		
			 return breturn;
		},

		_GenCtrlMessages : function(aCtrlMsgs){
			var that = this;
			if(aCtrlMsgs.length === 0) return;
			
			aCtrlMsgs.forEach(function(ele){
					that._oMessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: that.getResourceBundle().getText(ele.message),
						type: sap.ui.core.MessageType.Error,
						target: ele.target,
						processor: that.getModel("worklistView"),
						persistent: true
					}));
			});
		
			
		},

		//Get image editor control from Button
		getImageEditorControl: function (oCtrl) {
			return oCtrl.getParent().getImageEditor();
		},
		
		_imageBlob: function (imageData) {

			this._fnCreateOption().then(this._uplaodImage.bind(this, imageData));

		},
		_uplaodImage: function (imageData, data) {
			var oUrl = new URL(data.__metadata.media_src),
				oViewModel = this.getModel("worklistView"),
				that = this,
				settings = {
					url: "/EXPO_PODIUM_API" + oUrl.pathname,
					data: imageData,
					method: "PUT",
					headers: this.getModel().getHeaders(),
					contentType: "multipart/form-data",
					processData: false,
					success: function () {
						var sMsg = oViewModel.getProperty("/sDialogMode") === "C" ? "MSG_SUCCESS_OPTION_CREATE" : "MSG_SUCCESS_EDIT";
						that._fnCreateOptionSuccess.call(that, sMsg);
						that.getModel().refresh(true);
					},
					error: function () {
						that._fnSuccessToast.call(that, "MSG_ERR_IMAGE_UPLOAD");
					}
				};

			$.ajax(settings).always(function () {
				oViewModel.setProperty("/bBusyDialog", false);
			});
		},

		getImageBinary: function () {
			var oFile = this.getModel("worklistView").getProperty("/oAddOption/Icon"),
				oFileReader = new FileReader();

			return new Promise(function (res, rej) {

				if (!(oFile instanceof File)) {
					res(oFile);
					return;
				}

				oFileReader.onload = function () {
					res(oFileReader.result);
				};
				oFileReader.readAsDataURL(oFile);
			});

		},
		_fnCreateOption: function (oImagedata) {
			var oViewModel = this.getModel("worklistView"),
				that = this,
				oPayload = oViewModel.getProperty("/oAddOption");

			oViewModel.setProperty("/bBusyDialog", true);

			delete oPayload.Icon;

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sDialogMode") === "C") {
					that.getModel().create("/AccessibilityItemSet", oPayload, {
						success: function (data) {
							res(data);
						},
						error: function () {
							rej.call(that);
						}
					});
				} else {

					var sKey = that.getModel().createKey("/AccessibilityItemSet", {
						Id: oPayload.Id
					});
					that.getModel().update(sKey, oPayload, {
						success: function (data) {
							res(oPayload);
						},
						error: function () {
							rej();
						}
					});

				}
			});

		},
		_fnCreateOptionSuccess: function (sMsg) {
			this.onCancelAddOption();
			this._fnSuccessToast(sMsg);
		}

	});
});