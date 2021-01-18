sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.coil.podium.Notifications.controller.Worklist", {

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
				oTable = this.byId("table"),
				oTable1 = this.byId("table1"),
				oTable2 = this.byId("table2");

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
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable1.attachEventOnce("updateFinished1", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable2.attachEventOnce("updateFinished2", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#Notifications-display"
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
			var sDraft,
				that = this,
				aFilters,
				sQuery = this.getModel("worklistView").getProperty("/sQuery");
			if (sQuery && sQuery.length > 0) {
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('IsSystemGenerated', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('NotificationStatus', sap.ui.model.FilterOperator.EQ, "DRAFT"),
						new sap.ui.model.Filter('tolower(Subject)', sap.ui.model.FilterOperator.Contains, sQuery)
					],
					and: true
				});
			} else {
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('IsSystemGenerated', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('NotificationStatus', sap.ui.model.FilterOperator.EQ, "DRAFT")
					],
					and: true
				});
			}
			this.getModel().read("/NotificationSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					sDraft = that.getResourceBundle().getText("draftCount", [counter]);
					that.getModel("worklistView").setProperty("/draft", sDraft);
				}
			});
		},

		onUpdateFinished1: function (oEvent) {
			// update the worklist's object counter after the table update
			var sScheduled,
				that = this,
				aFilters,
				sQuery = this.getModel("worklistView").getProperty("/sQuery");
			if (sQuery && sQuery.length > 0) {
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('IsSystemGenerated', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('NotificationStatus', sap.ui.model.FilterOperator.EQ, "SCHEDULED"),
						new sap.ui.model.Filter('tolower(Subject)', sap.ui.model.FilterOperator.Contains, sQuery)
					],
					and: true
				});
			} else {
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('IsSystemGenerated', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('NotificationStatus', sap.ui.model.FilterOperator.EQ, "SCHEDULED")
					],
					and: true
				});
			}

			this.getModel().read("/NotificationSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					sScheduled = that.getResourceBundle().getText("scheduledCount", [counter]);
					that.getModel("worklistView").setProperty("/scheduled", sScheduled);
				}
			});
		},

		onUpdateFinished2: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTriggered,
				that = this,
				aFilters,
				sQuery = this.getModel("worklistView").getProperty("/sQuery");
			if (sQuery && sQuery.length > 0) {
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('IsSystemGenerated', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('NotificationStatus', sap.ui.model.FilterOperator.EQ, "TRIGGERED"),
						new sap.ui.model.Filter('tolower(Subject)', sap.ui.model.FilterOperator.Contains, sQuery)
					],
					and: true
				});
			} else {
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('IsSystemGenerated', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('NotificationStatus', sap.ui.model.FilterOperator.EQ, "TRIGGERED")
					],
					and: true
				});
			}
			this.getModel().read("/NotificationSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					sTriggered = that.getResourceBundle().getText("triggeredCount", [counter]);
					that.getModel("worklistView").setProperty("/triggered", sTriggered);
				}
			});
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

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				// var sQuery = oEvent.getParameter("query");
				var sQuery = oEvent.getParameter("query").toLowerCase();
				sQuery = "'" + sQuery + "'";
				if (sQuery && sQuery.length > 0) {
					this.getModel("worklistView").setProperty("/sQuery", sQuery);
					aTableSearchState = [new Filter('tolower(Subject)', FilterOperator.Contains, sQuery),
						new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter('IsSystemGenerated', FilterOperator.EQ, false)
					];
				} else {
					this.getModel("worklistView").setProperty("/sQuery", null);
					aTableSearchState = [new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter('IsSystemGenerated', FilterOperator.EQ, false)
					];
				}
				this._applySearch(aTableSearchState);
			}

		},

		onAdd: function (oEvent) {
			this.getModel("appView").setProperty("/viewFlag", "Y");
			this.getRouter().navTo("createObject");
		},

		onRefreshView: function () {
			var oModel = this.getModel();
			oModel.refresh(true);
		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			var oTable1 = this.byId("table1");
			var oTable2 = this.byId("table2");
			oTable.getBinding("items").refresh();
			oTable1.getBinding("items").refresh();
			oTable2.getBinding("items").refresh();
		},

		// onLink: function (oEvent) {
		// 	window.open(url, '_blank');
		// },

		onEdit: function (oEvent) {
			this.getModel("appView").setProperty("/viewFlag", "Y");
			this._showObject(oEvent.getSource());
		},
		
		onView: function (oEvent) {
			this.getModel("appView").setProperty("/viewFlag", "X");
			this._showObject(oEvent.getSource());
		},

		onDelete: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();

			function onYes() {
				var data = this.getModel().getData(sPath);
				this.getModel().update(sPath, {
					Subject: data.Subject,
					Body: data.Body,
					RedirectionType: data.RedirectionType,
					RedirectionTo: data.RedirectionTo,
					IsGroupNotification: data.IsGroupNotification,
					GroupId: data.GroupId,
					ScheduledDate: data.ScheduledDate,
					ScheduledTime: data.ScheduledTime,
					IsArchived: true
				}, {
					success: this.showToast.bind(this, "MSG_SUCCESS_REMOVE")
				});
			}
			this.showWarning("MSG_CONFIRM_DELETE", onYes);
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
				objectId: oItem.getBindingContext().getProperty("UUID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oTable1 = this.byId("table1"),
				oTable2 = this.byId("table2"),
				oViewModel = this.getModel("worklistView");
			// "Application"
			oTable.getBinding("items").filter(aTableSearchState);
			oTable1.getBinding("items").filter(aTableSearchState);
			oTable2.getBinding("items").filter(aTableSearchState);
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});