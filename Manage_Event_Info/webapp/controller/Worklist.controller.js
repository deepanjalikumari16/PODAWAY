sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.coil.podium.Manage_Event_Info.controller.Worklist", {

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
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0,
				Country: "",
				Timezone: "",
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
				icon: "sap-icon://table-view",
				intent: "#Manage-Info"
			}, true);

			var myModel = this.getOwnerComponent().getModel();
			myModel.setSizeLimit(999);

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
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * When Click on Add button
		 */
		onAdd: function (oEvent) {
			this.getRouter().navTo("createObject");
		},

		onDelete: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();

			function onYes() {
				var data = this.getModel().getData(sPath);
				this.getModel().update(sPath, {
					Name: data.Name,
					Title: data.Title,
					Description: data.Description,
					HighlightsTitle: data.HighlightsTitle,
					Url: data.Url,
					Location: data.Location,
					Latitude: data.Latitude,
					Longitude: data.Longitude,
					City: data.City,
					CountryId: data.CountryId,
					TimezoneId: data.TimezoneId,
					StartDate: data.StartDate,
					StartTime: data.StartTime,
					EndDate: data.EndDate,
					EndTime: data.EndTime,
					DaysLeftForEvent: data.DaysLeftForEvent,
					AboutPageUrl: data.AboutPageUrl,
					CreatedAt: data.CreatedAt,
					CreatedBy: data.CreatedBy,
					UpdatedAt: data.UpdatedAt,
					UpdatedBy: data.UpdatedBy,
					IsSelected: data.IsSelected,
					Highlights: data.Highlights.results,
					IsArchived: true
				}, {
					success: this.showToast.bind(this, "MSG_SUCCESS_EVENT_REMOVE")
				});
			}
			this.showWarning("MSG_CONFIRM_DELETE", onYes);
		},

		onEdit: function (oEvent) {
			this._showObject(oEvent.getSource());
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

		// onSearch : function (oEvent) {
		// 	var aFilters = this.getFiltersfromFB();
		// 	if (oEvent.getParameters().refreshButtonPressed) {
		// 		// Search field's 'refresh' button has been pressed.
		// 		// This is visible if you select any master list item.
		// 		// In this case no new search is triggered, we only
		// 		// refresh the list binding.
		// 		this.onRefresh();
		// 	} else {
		// 		var aTableSearchState = [];
		// 		var sQuery = oEvent.getParameter("query");

		// 		if (sQuery && sQuery.length > 0) {
		// 			aTableSearchState = [new Filter("Name", FilterOperator.Contains, sQuery)];
		// 		}
		// 		this._applySearch(aTableSearchState);
		// 	}

		// },

		onSearch: function () {
			var aFilters = this.getFiltersfromFB(),
				oTable = this.getView().byId("table");
			oTable.getBinding("items").filter(aFilters);
			if (aFilters.length !== 0) {
				this.getModel("worklistView").setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
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
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
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