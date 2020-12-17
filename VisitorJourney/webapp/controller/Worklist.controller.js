 sap.ui.define([
 	"./BaseController",
 	"sap/ui/model/json/JSONModel",
 	"../model/formatter",
 	"sap/ui/model/Filter",
 	"sap/ui/model/FilterOperator",
 	"sap/ui/core/Fragment",
 	"sap/m/MessageToast",
 	"sap/m/MessageBox"
 ], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, MessageToast, MessageBox) {
 	"use strict";

 	return BaseController.extend("com.coil.podium.VisitorJourney.controller.Worklist", {

 		formatter: formatter,

 		/* =========================================================== */
 		/* lifecycle methods                                           */
 		/* =========================================================== */

 		/**
 		 * Called when the worklist controller is instantiated.
 		 * @public
 		 */
 		onInit: function () {
 			var oViewModel,
 				iOriginalBusyDelay, oTable = this.getView().byId("table");
 			// Put down worklist table's original value for busy indicator delay,
 			// so it can be restored later on. Busy handling on the table is
 			// taken care of by the table itself.
 			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
 			// keeps the search state
 			this._aTableSearchState = [];

 			// Model used to manipulate control states
 			oViewModel = new JSONModel({
 				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
 				worklistListTitle: this.getResourceBundle().getText("worklistListTitle"),
 				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
 				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
 				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
 				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
 				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
 				tableBusyDelay: 0,
 				aRestEvents: [],
 				aJourneys: [],
 				bSave: false

 			});
 			this.setModel(oViewModel, "worklistView");

 			// Make sure, busy indication is showing immediately so there is no
 			// break after the busy indication for loading the view's meta data is
 			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
 			oTable.attachEventOnce("updateFinished", function () {
 				// Restore original busy indicator delay for worklist's table
 				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
 			});
 			// Add the worklist page to the flp routing history
 			this.addHistoryEntry({
 				title: this.getResourceBundle().getText("worklistViewTitle"),
 				intent: "#Manage-Journey"
 			}, true);

 		},

 		onAfterRendering: function () {

 			if (!(this.getModel("device").getProperty("/system/desktop"))) {

 				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
 				sap.m.MessageBox.error(this.getResourceBundle().getText("ERR_DEVICE"), {
 					styleClass: bCompact ? "sapUiSizeCompact" : "",
 					onClose: function () {
 						this.getView().setBlocked(true);
 					}.bind(this)
 				});

 				return;
 			}

 			this.getModel().metadataLoaded().then(this._loadConfigData.bind(this));
 		},

 		/* =========================================================== */
 		/* event handlers                                              */
 		/* =========================================================== */
 		_loadConfigData: function () {
 			var that = this,
 				aPromises = [];

 			//Load appConfig only for first time
 			if (!(this.getModel("worklistView").getProperty("/appConfig")))
 				aPromises.push(
 					new Promise(function (res, rej) {
 						that.getModel().read("/MasterApplicationConfigSet(1)", {
 							success: function (data) {
 								res(data);
 							},
 							error: function (err) {
 								rej(err);
 							}
 						});
 					}));

 			aPromises.push(
 				new Promise(function (res, rej) {
 					that.getModel().read("/EventAttractionSet", {
 						filters: [new Filter("EventAttractionTypeId", FilterOperator.EQ, 1), new Filter("IsArchived", FilterOperator.EQ, false)],
 						sorters: [new sap.ui.model.Sorter("Index"), new sap.ui.model.Sorter("Name")],
 						urlParameters: {
 							"$expand": "Building"
 						},
 						success: function (data) {
 							res(data);
 						},
 						error: function (err) {
 							rej(err);
 						}
 					});
 				}));

 			Promise.all(aPromises).then(that._configLoaded.bind(that));

 		},

 		_configLoaded: function (data) {

 			if (this.getModel("worklistView").getProperty("/appConfig")) {
 				this._setData(data[0]);
 				return;
 			}

 			this.getModel("worklistView").setProperty("/appConfig", data[0]);
 			this._setData(data[1]);

 		},

 		_setData: function (data) {
 			var oWorklistViewModel = this.getModel("worklistView");

 			var iPodTopInitiative = oWorklistViewModel.getProperty("/appConfig/Value");

 			var jouneys = [],
 				restEvents = [];

 			data.results.forEach(function (element) {

 				if (element.Index && element.Index <= iPodTopInitiative) {
 					jouneys.push(element);
 				} else {
 					restEvents.push(element);
 				}

 			});
 			oWorklistViewModel.setProperty("/aJourneys", jouneys);
 			oWorklistViewModel.setProperty("/aRestEvents", restEvents);

 		},

 		//START: Image and Plan Life cycle
 		onViewImage: function (oEvent, sDialogType) {

 			var oView = this.getView(),
 				that = this;
 			that.oImageBindingContext = oEvent.getSource().getBindingContext("worklistView");
 			// create dialog lazily
 			if (!that._oDlgAddOption) {
 				// load asynchronous XML fragment
 				Fragment.load({
 					id: oView.getId(),
 					name: "com.coil.podium.VisitorJourney.dialog.Images",
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
 			//Experimental merger of Images and Plans
 			this.getModel("worklistView").setProperty("/sDialog", sDialogType);

 		},
 		bindDialog: function () {
 			var that = this,
 				oViewModel = this.getModel("worklistView"),
 				sType = oViewModel.getProperty("/sDialog");
 			this._oDlgAddOption.getContent()[0].bindAggregation("pages", {
 				path: sType === "I" ? "/EventAttractionImageSet" : "/EventAttractionPlanSet",
 				filters: [
 					new Filter("IsArchived", FilterOperator.EQ, false),
 					new Filter("EventAttractionId", FilterOperator.EQ, that.oImageBindingContext.getProperty("Id"))
 				],
 				template: new sap.m.Image({
 					src: {
 						path: "__metadata",
 						formatter: that.formatter.giveImage
 					}
 				}),
 				events: {
 					dataRequested: function () {
 						oViewModel.setProperty("/bLoadingImages", true);
 					},
 					dataReceived: function (oEvt) {
 						oViewModel.setProperty("/bLoadingImages", false);
 						if (oEvt.getParameter("data").results.length) {
 							oViewModel.setProperty("/bImages", true);
 						} else {
 							oViewModel.setProperty("/bImages", false);
 						}
 					}

 				}
 			});
 		},
 		onCancelImage: function () {
 			this._oDlgAddOption.close();
 		},
 		//END: Image and Plan Life cycle

 		onSelectionChange: function () {
 			var oBindingContext = this._getListObject(),
 				oModel = this.getModel("worklistView");

 			if (oBindingContext.getProperty("Index") === 1) {
 				oModel.setProperty("/bTopDisabled", false);
 			} else {
 				oModel.setProperty("/bTopDisabled", true);
 			}

 			if (oBindingContext.getProperty("Index") === +(oModel.getProperty("/aJourneys/length"))) {
 				oModel.setProperty("/bBottomDisabled", false);
 			} else {
 				oModel.setProperty("/bBottomDisabled", true);
 			}

 		},

 		onMoveJourney: function (oEvent) {
 			var oBindingContext = this._getListObject();
 			//Validation from null/empty selection
 			if (!(oBindingContext)) {
 				MessageToast.show(this.getResourceBundle().getText("MSG_SELECTITEM_FIRST"));
 				return;
 			}

 			var oModel = this.getModel("worklistView"),
 				Journeydata = oModel.getProperty("/aJourneys");

 			//Save button active
 			oModel.setProperty("/bSave", true);

 			var sIcon = oEvent.getSource().getIcon(),
 				prevIndex = +(oBindingContext.getProperty("Index")),
 				replaceIndex = sIcon.includes("top") ? prevIndex - 1 : prevIndex + 1;

 			Journeydata = Journeydata.map(function (ele) {
 				switch (ele.Index) {
 				case prevIndex:
 					ele.Index = replaceIndex;
 					break;
 				case replaceIndex:
 					ele.Index = prevIndex;
 					break;
 				}
 				return ele;
 			});

 			oModel.setProperty("/aJourneys", Journeydata);

 			this.onSelectionChange();

 			oModel.refresh(true);

 		},

 		onRemoveEvent: function () {

 			var oBindingContext = this._getListObject();
 			//Validation from null/empty selection
 			if (!(oBindingContext)) {
 				MessageToast.show(this.getResourceBundle().getText("MSG_SELECTITEM_FIRST"));
 				return;
 			}

 			var oModel = this.getModel("worklistView"),
 				Journeydata = oModel.getProperty("/aJourneys"),
 				delObj = oBindingContext.getObject(),
 				finJourney = [],
 				counter = 1;

 			//Save button active
 			oModel.setProperty("/bSave", true);

 			//reformatting Journey array while deleting the current index			
 			Journeydata.forEach(function (ele) {
 				if (ele.Index !== delObj.Index) {
 					ele.Index = counter;
 					finJourney.push(ele);
 					++counter;
 				}
 			});

 			//adding removed event back to central table
 			var finEvent = oModel.getProperty("/aRestEvents");

 			delObj.Index = null;

 			finEvent.push(delObj);

 			oModel.setProperty("/aJourneys", finJourney);
 			oModel.setProperty("/aRestEvents", finEvent);

 			oModel.refresh(true);
 		},

 		onAddToJourney: function (oEvent) {
 			var oModel = this.getModel("worklistView"),
 				Journeydata = oModel.getProperty("/aJourneys"),
 				EventData = oModel.getProperty("/aRestEvents"),
 				movObj = oEvent.getSource().getBindingContext("worklistView").getObject();

 			//Save button active
 			oModel.setProperty("/bSave", true);

 			//Validation
 			if (Journeydata.length >= oModel.getProperty("/appConfig/Value")) {
 				MessageToast.show(this.getResourceBundle().getText("MSG_JLIMIT", [oModel.getProperty("/appConfig/Value")]));
 				return;
 			}

 			//Preparing final arrays
 			EventData = EventData.filter(function (ele) {
 				return ele.Id !== movObj.Id;
 			});

 			movObj.Index = Journeydata.length + 1;

 			Journeydata.push(movObj);

 			oModel.setProperty("/aJourneys", Journeydata);
 			oModel.setProperty("/aRestEvents", EventData);

 			oModel.refresh(true);

 		},

 		/**
 		 * Triggered by the table's 'updateFinished' event: after new table
 		 * data is available, this handler method updates the table counter.
 		 * This should only happen if the update was successful, which is
 		 * why this handler is attached to 'updateFinished' and not to the
 		 * table's list binding's 'dataReceived' method.
 		 * @param {sap.ui.base.Event} oEvent the update finished event
 		 * @public
 		 */
 		onUpdateFinished: function (oEvent) {
 			// update the worklist's object counter after the table update
 			var sTitle,
 				oTable = oEvent.getSource(),
 				iTotalItems = oEvent.getParameter("total");
 			//Determine to update list or table
 			var Title = oTable instanceof sap.m.Table ? "Table" : "List";
 			// only update the counter if the length is final and
 			// the table is not empty
 			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {

 				sTitle = this.getResourceBundle().getText("worklist" + Title + "TitleCount", [iTotalItems]);
 			} else {
 				sTitle = this.getResourceBundle().getText("worklist" + Title + "Title");
 			}
 			this.getModel("worklistView").setProperty("/worklist" + Title + "Title", sTitle);
 		},

 		onShowConfirmation: function () {
 			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
 			MessageBox.warning(
 				this.getResourceBundle().getText("MSG_SUCCESS_CONFRM"), {
 					actions: [MessageBox.Action.NO, MessageBox.Action.YES],
 					styleClass: bCompact ? "sapUiSizeCompact" : "",
 					onClose: function (sAction) {
 						if (sAction === "YES")
 							this.onSave();
 					}.bind(this)
 				}
 			);
 		},

 		onSave: function () {

 			var sJourneys = this.getModel("worklistView")
 				.getProperty("/aJourneys")
 				.sort(function (a, b) {
 					return a.Index - b.Index;
 				})
 				.map(function (ele) {
 					return ele.Id;
 				}).join();

 			this.getModel().callFunction("/SortPODInitiative", {
 				urlParameters: {
 					Ids: sJourneys

 				},
 				success: this._onSaveSuccess.bind(this),
 				error: this._fnError.bind(this)
 			});

 		},

 		/* =========================================================== */
 		/* internal methods                                            */
 		/* =========================================================== */

 		/**
 		 * Shows the selected item on the object page
 		 * On phones a additional history entry is created
 		 * @param {sap.m.ObjectListItem} oItem selected Item
 		 * @private
 		 */
 		_showObject: function (oItem) {
 			this.getRouter().navTo("object", {
 				objectId: oItem.getBindingContext().getProperty("Id")
 			});
 		},

 		_getListObject: function () {
 			var aSelectedContexts = this.byId("list").getSelectedContexts();
 			return aSelectedContexts.length === 0 ? false : aSelectedContexts[0];
 		},

 		/**
 		 * Internal helper method to apply both filter and search state together on the list binding
 		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
 		 * @private
 		 */
 		_applySearch: function (aTableSearchState) {
 			var oTable = this.byId("table"),
 				oViewModel = this.getModel("worklistView");
 			oTable.getBinding("items").filter(aTableSearchState, "Application");
 			// changes the noDataText of the list in case there are no filter results
 			if (aTableSearchState.length !== 0) {
 				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
 			}
 		},

 		_fnError: function (Error) {
 			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
 			MessageBox.error(
 				Error.toString(), {
 					styleClass: bCompact ? "sapUiSizeCompact" : ""
 				}
 			);
 		},
 		_onSaveSuccess: function () {
			this.getModel("worklistView").setProperty("/bSave", false);
 			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
 			MessageBox.success(
 				this.getResourceBundle().getText("MSG_SAVE_SUCCESS"), {
 					styleClass: bCompact ? "sapUiSizeCompact" : ""
 				}
 			);

 		}

 	});
 });