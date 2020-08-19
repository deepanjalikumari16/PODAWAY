sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
	"use strict";
	//, test1, test2, test3, test4
	return BaseController.extend("com.coil.podium.MAFA.controller.Worklist", {

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
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0,
				bImages: true,
				bLoadingImages: true
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
				title: this.getResourceBundle().getText("worklistTitle"),
				icon: "sap-icon://table-view",
				intent: "#manage-facilities"
			}, true);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

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
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},
		/**
		 * Event handler when a table edit item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table list item event
		 * @public
		 */
		onEdit: function (oEvent) {
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler when a table toolbar Add item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table list item event
		 * @public
		 */
		onAdd: function (oEvent) {
			this.getRouter().navTo("createObject");
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

		onViewImage: function (oEvent) {

			var oView = this.getView(),
				that = this;
			that.oImageBindingContext = oEvent.getSource().getBindingContext();
			// create dialog lazily
			if (!that._oDlgAddOption) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "com.coil.podium.MAFA.dialog.Images",
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
		bindDialog: function () {
			var that = this,
				oViewModel = this.getModel("worklistView");
			this._oDlgAddOption.getContent()[0].bindAggregation("pages", {
				path: "/FacilityImageSet",
				filters: [
					new Filter("IsArchived", FilterOperator.EQ, false),
					new Filter("FacilityId", FilterOperator.EQ, that.oImageBindingContext.getProperty("Id"))
				],
				template: new sap.m.Image({
					src: {
						path: "__metadata",
						formatter: that.giveImage.bind(that)
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

		onSearch: function () {
			var aFilters = this.getFiltersfromFB(),
				oTable = this.getView().byId("table");

			oTable.getBinding("items").filter(aFilters);

			if (aFilters.length !== 0) {
				this.getModel("worklistView").setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}

		},

		onBasicSearch: function (oEvent) {
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
					aTableSearchState = [new Filter("Description", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/*
		 * @function: To remove facility
		 * @param oEvent : Get Line item context
		 */
		onDelete: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();

			function onYes() {
				this.getModel().update(sPath, {
					IsArchived: true
				}, {
					success: this.showToast.bind(this, "MSG_SUCCESS_FAC_REMOVE")
				});
			}
			this.showWarning("MSG_CONFIRM_DELETE", onYes);

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		getFiltersfromFB: function () {
			var oFBCtrl = this.getView().byId("filterbar"),
				aFilters = [];

			oFBCtrl.getAllFilterItems().forEach(function (ele) {
				if (ele.getControl().getSelectedKey()) {
					aFilters.push(new Filter(ele.getName(), FilterOperator.EQ, ele.getControl().getSelectedKey()));
				}
			});

			return aFilters;

		},

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
		}

	});
});