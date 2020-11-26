sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
	"use strict";

	/* =========================================================== */
	/* Global variable                                          */
	/* =========================================================== */

	return BaseController.extend("com.coil.podium.MAAD.controller.Worklist", {

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
				oTable2 = this.byId("table2"),
				oTable3 = this.byId("table3");

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
				bShowVolunteer: false
			});
			this.setModel(oViewModel, "worklistView");
			var dat = this;
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				//Fetch loggedIn User ID to disable delete button for loggedIn user
				var oModel = dat.getModel();
				oModel.callFunction("/GetLoggedInUser", {
					method: "GET",
					success: function (data) {
						oViewModel.setProperty("/loggedUserId", data.results[0].Id);
						oViewModel.setProperty("/loggedRoleId", data.results[0].RoleId);
						
						dat.getModel("appView").setProperty("/loggedRoleId", data.results[0].RoleId);
					}
				});
			});

			oTable1.attachEventOnce("updateFinished1", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable2.attachEventOnce("updateFinished2", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable3.attachEventOnce("updateFinished3", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});

			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#ManageAdmin-display"
			}, true);

			// this.getModel("worklistView").setProperty("/selectId", "1");

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
				noDetailsFound,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistAdminTabTitleCount", [iTotalItems]);
				if (this.getModel("worklistView").getProperty("/selectId") === "1") {
					sTitle = this.getResourceBundle().getText("worklistAdminTabTitleCount", [iTotalItems]);
				}
				if (this.getModel("worklistView").getProperty("/selectId") === "2") {
					sTitle = this.getResourceBundle().getText("worklistManagerTabTitleCount", [iTotalItems]);
				}
				if (this.getModel("worklistView").getProperty("/selectId") === "3") {
					sTitle = this.getResourceBundle().getText("worklistPodTabTitleCount", [iTotalItems]);
				}
				if (this.getModel("worklistView").getProperty("/selectId") === "4") {
					sTitle = null;
					// 	sTitle = this.getResourceBundle().getText("worklistVolManTabTitleCount", [iTotalItems]);
				}
			} else {
				if (this.getModel("worklistView").getProperty("/selectId") === "1") {
					noDetailsFound = this.getResourceBundle().getText("tableNoDataText");
					sTitle = this.getResourceBundle().getText("worklistTableTitleAdmin");
				}
				if (this.getModel("worklistView").getProperty("/selectId") === "2") {
					noDetailsFound = this.getResourceBundle().getText("tableNoManagerText");
					sTitle = this.getResourceBundle().getText("worklistTableTitleManager");
				}
				if (this.getModel("worklistView").getProperty("/selectId") === "3") {
					noDetailsFound = this.getResourceBundle().getText("tableNoPodText");
					sTitle = this.getResourceBundle().getText("worklistTableTitlePod");
				}
				if (this.getModel("worklistView").getProperty("/selectId") === "4") {
					// noDetailsFound = null;
					noDetailsFound = this.getResourceBundle().getText("tableNoVolText");
					// 	sTitle = this.getResourceBundle().getText("worklistTableTitleVolMan");
				}
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("worklistView").setProperty("/tableNoDataText", noDetailsFound);
		},

		onUpdateFinished1: function (oEvent) {
			// update the worklist's object counter after the table update
			var sAllTitle,
				oTable1 = oEvent.getSource(),
				iTotalItems1 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems1 && oTable1.getBinding("items").isLengthFinal()) {
				sAllTitle = this.getResourceBundle().getText("allCount", [iTotalItems1]);
			} else {
				sAllTitle = this.getResourceBundle().getText("all");
			}
			this.getModel("worklistView").setProperty("/all", sAllTitle);
		},

		onUpdateFinished2: function (oEvent) {
			// update the worklist's object counter after the table update
			var sAvailableTitle,
				oTable2 = oEvent.getSource(),
				iTotalItems2 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems2 && oTable2.getBinding("items").isLengthFinal()) {
				sAvailableTitle = this.getResourceBundle().getText("availableCount", [iTotalItems2]);
			} else {
				sAvailableTitle = this.getResourceBundle().getText("available");
			}
			this.getModel("worklistView").setProperty("/available", sAvailableTitle);
		},

		onUpdateFinished3: function (oEvent) {
			// update the worklist's object counter after the table update
			var sunavailableTitle,
				oTable3 = oEvent.getSource(),
				iTotalItems3 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems3 && oTable3.getBinding("items").isLengthFinal()) {
				sunavailableTitle = this.getResourceBundle().getText("unavailableCount", [iTotalItems3]);
			} else {
				sunavailableTitle = this.getResourceBundle().getText("unavailable");
			}
			this.getModel("worklistView").setProperty("/unavailable", sunavailableTitle);
		},

		onEdit: function (oEvent) {
			this._showObject(oEvent.getSource());
		},

		onChange: function (oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedKey();

			this.getModel("appView").setProperty("/selectedRoleId", sSelectedKey);
			this.getModel("worklistView").setProperty("/selectId", sSelectedKey);

			if (+sSelectedKey !== 4) { //
				this.getModel("worklistView").setProperty("/bShowVolunteer", false);

				var oTable = this.getView().byId("table");
				var itemBinding = oTable.getBinding("items");
				var afilter = [new Filter("RoleId", FilterOperator.EQ, sSelectedKey),
					new Filter("IsArchived", FilterOperator.EQ, false)
				];
				if (itemBinding) itemBinding.filter(afilter, "Application");
			} else {
				this.getModel("worklistView").setProperty("/bShowVolunteer", true);

				var oViewModel = this.getModel("worklistView");
				var loggedUserId = oViewModel.getProperty("/loggedUserId");
				var loggedRoleId = oViewModel.getProperty("/loggedRoleId");
				if (loggedRoleId == 2) {
					var managerFilter = new Filter("ManagerId", FilterOperator.EQ, loggedUserId);
					var oTable1 = this.getView().byId("table1");
					var itemBinding1 = oTable1.getBinding("items");
					var afilter1 = [new Filter("RoleId", FilterOperator.EQ, 4),
						new Filter("IsArchived", FilterOperator.EQ, false),
						managerFilter
					];
					if (itemBinding1) itemBinding1.filter(afilter1, "Application");

					var oTable2 = this.getView().byId("table2");
					var itemBinding2 = oTable2.getBinding("items");
					var afilter2 = [new Filter("RoleId", FilterOperator.EQ, 4),
						new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter("IsAvailable", FilterOperator.EQ, true),
						managerFilter
					];
					if (itemBinding2) itemBinding2.filter(afilter2, "Application");

					var oTable3 = this.getView().byId("table3");
					var itemBinding3 = oTable3.getBinding("items");
					var afilter3 = [new Filter("RoleId", FilterOperator.EQ, 4),
						new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter("IsAvailable", FilterOperator.EQ, false),
						managerFilter
					];
					if (itemBinding3) itemBinding3.filter(afilter3, "Application");

				}
			}
		},

		onMessage: function (oEvent) {
			var oView = this.getView();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var data = this.getModel().getData(sPath);
			this.getModel("worklistView").setProperty("/userId", data.Id);
			// var oObject = oEvent.getSource().getBindingContext().getObject();
			this.getModel("worklistView").setProperty("/message", null);
			if (!this.byId("messageDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "com.coil.podium.MAAD.view.MessageDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view 
					//of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.bindElement({
						path: sPath,
						model: "worklistView"
					});
					oDialog.open();
				});
			} else {
				this.byId("messageDialog").open();
			}
		},

		send: function () {
			var enteredMessage = this.getModel("worklistView").getProperty("/message");
			if (enteredMessage === null || enteredMessage === "") {
				this.showToast.call(this, "MSG_ENTER_MESSAGE");
			} else {
				var enteredMessageLength = enteredMessage.length;
				if (enteredMessageLength > 500) {
					this.showToast.call(this, "MSG_EXCEEDED_LENGTH");
				} else {
					var dat = this;
					var oModel = dat.getModel();
					oModel.create("/UserMessageSet", {
						ReceiverId: this.getModel("worklistView").getProperty("/userId"),
						Message: this.getModel("worklistView").getProperty("/message")
					}, {
						success: function (data) {
							dat.showToast.call(dat, "MSG_SUCCESS_MESSAGE");
							dat.byId("messageDialog").close();
							oModel.refresh(true);
						}
					});
				}
			}
		},

		closeMessageDialog: function () {
			this.byId("messageDialog").close();
		},

		onComment: function (oEvent) {
			var oView = this.getView();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var data = this.getModel().getData(sPath);
			this.getModel("worklistView").setProperty("/userId", data.Id);
			var oObject = oEvent.getSource().getBindingContext().getObject();
			this.getModel("worklistView").setProperty("/comments", oObject.Comments);
			if (!this.byId("commentDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "com.coil.podium.MAAD.view.CommentDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view 
					//of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.bindElement({
						path: sPath,
						model: "worklistView"
					});
					oDialog.open();
				});
			} else {
				this.byId("commentDialog").open();
			}
		},

		closeCommentDialog: function () {
			this.byId("commentDialog").close();
		},
		comment: function () {
			var enteredComment = this.getModel("worklistView").getProperty("/comments");
			if (enteredComment === null || enteredComment === "") {
				this.showToast.call(this, "MSG_ENTER_COMMENT");
			} else {
				var enteredCommentLength = enteredComment.length;
				if (enteredCommentLength > 500) {
					this.showToast.call(this, "MSG_EXCEEDED_LENGTH");
				} else {
					var dat = this;
					var oModel = dat.getModel();
					oModel.callFunction("/CommentUser", {
						method: "GET",
						urlParameters: {
							UserId: this.getModel("worklistView").getProperty("/userId"),
							Comments: this.getModel("worklistView").getProperty("/comments")
						},
						success: function (data) {
							dat.showToast.call(dat, "MSG_SUCCESS_COMMENT");
							dat.byId("commentDialog").close();
							oModel.refresh(true);
						}
					});
				}
			}
		},

		onPodCategory: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath(),
				oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "com.coil.podium.MAAD.view.PODCategoryDialog",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.bindElement(sPath);
					this._oPopover.openBy(oButton);

				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
				this._oPopover.bindElement(sPath);
			}
		},

		onSpeciality: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath(),
				oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "com.coil.podium.MAAD.view.SpecialityDialog",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.bindElement(sPath);
					this._oPopover.openBy(oButton);

				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
				this._oPopover.bindElement(sPath);
			}
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

		onAdd: function (oEvent) {
			this.getRouter().navTo("createObject");
		},
		
		onRefreshView: function () {
			var oModel = this.getModel();
			oModel.refresh(true);
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
				// var tQuery = oEvent.getParameter("query");
				var sQuery = oEvent.getParameter("query").toLowerCase();
				sQuery = "'" + sQuery + "'";
				if (sQuery && sQuery.length > 0) {

					aTableSearchState = [new Filter('tolower(FirstName)', FilterOperator.Contains, sQuery),
						// aTableSearchState = [new Filter( {
						// 		path: 'FirstName',
						// 		caseSensitive: false,
						// 		operator: FilterOperator.Contains,
						// 		value1: sQuery
						// 	} ),
						new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter("RoleId", FilterOperator.EQ, this.getModel("appView").getProperty("/selectedRoleId"))
						// selectId
					];
				} else {
					aTableSearchState = [new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter("RoleId", FilterOperator.EQ, this.getModel("appView").getProperty("/selectedRoleId"))
					];
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
			var oTable1 = this.byId("table1");
			var oTable2 = this.byId("table2");
			var oTable3 = this.byId("table3");
			if (this.getModel("appView").getProperty("/selectedRoleId") === "4") {
				oTable1.getBinding("items").refresh();
				oTable2.getBinding("items").refresh();
				oTable3.getBinding("items").refresh();
			}
			oTable.getBinding("items").refresh();
		},

		/*
		 * @function: To remove Admin
		 * @param oEvent : Get Line item context
		 */

		onDelete: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();

			function onYes() {
				var data = this.getModel().getData(sPath);
				this.getModel().update(sPath, {
					FirstName: data.FirstName,
					LastName: data.LastName,
					Email: data.Email,
					Username: data.Username,
					PhotoURL: data.PhotoURL,
					Address: data.Address,
					City: data.City,
					State: data.State,
					Zip: data.Zip,
					Country: data.Country,
					DialCode: data.DialCode,
					Mobile: data.Mobile,
					EmergencyDialCode: data.EmergencyDialCode,
					EmergencyMobile: data.EmergencyMobile,
					RoleId: data.RoleId,
					IsArchived: true
				}, {
					success: this.showToast.bind(this, "MSG_SUCCESS_ADM_REMOVE")
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
				oTable1 = this.byId("table1"),
				oTable2 = this.byId("table2"),
				oTable3 = this.byId("table3"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			if (this.getModel("appView").getProperty("/selectedRoleId") === "4") {
				oTable1.getBinding("items").filter(aTableSearchState);
				oTable2.getBinding("items").filter(aTableSearchState);
				oTable3.getBinding("items").filter(aTableSearchState);
			}
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});