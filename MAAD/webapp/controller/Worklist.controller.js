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
				tableBusyDelay: 0
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
					}
				});
			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#ManageAdmin-display"
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
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("worklistView").setProperty("/tableNoDataText", noDetailsFound);
		},

		onEdit: function (oEvent) {
			this._showObject(oEvent.getSource());
		},

		onChange: function (oEvent) {
			var selectId = this.getView().byId("Id").getSelectedKey();
			this.getModel("worklistView").setProperty("/selectId", selectId);

			var oTable = this.getView().byId("table");
			var itemBinding = oTable.getBinding("items");
			var afilter = [new Filter("RoleId", FilterOperator.EQ, selectId),
				new Filter("IsArchived", FilterOperator.EQ, false)
			];
			itemBinding.filter(afilter, "Application");
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
			var enteredCommentLength = enteredComment.length;
			if (enteredComment === null || enteredComment === "") {
				this.showToast.call(this, "MSG_ENTER_COMMENT");
			} else {
				if (enteredCommentLength > 500) {
					this.showToast.call(this, "MSG_EXCEEDED_COMMENT_LENGTH");
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
						new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter("RoleId", FilterOperator.EQ, this.getModel("worklistView").getProperty("/selectId"))
					];
				} else {
					aTableSearchState = [new Filter("IsArchived", FilterOperator.EQ, false),
						new Filter("RoleId", FilterOperator.EQ, this.getModel("worklistView").getProperty("/selectId"))
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
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});