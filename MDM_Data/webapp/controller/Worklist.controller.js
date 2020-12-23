jQuery.sap.require("com.coil.podium.MDM_Data.libs.mapsjs-core");
jQuery.sap.require("com.coil.podium.MDM_Data.libs.mapsjs-service");
jQuery.sap.require("com.coil.podium.MDM_Data.libs.mapsjs-ui");
jQuery.sap.require("com.coil.podium.MDM_Data.libs.mapsjs-mapevents");

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

	return BaseController.extend("com.coil.podium.MDM_Data.controller.Worklist", {

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
				oTable3 = this.byId("table3"),
				oTable4 = this.byId("table4"),
				oTable5 = this.byId("table5"),
				oTable6 = this.byId("table6"),
				oTable7 = this.byId("table7"),
				oTable8 = this.byId("table8");

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

			//Event name is same for every table,  "updateFinished"
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
			oTable4.attachEventOnce("updateFinished4", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable5.attachEventOnce("updateFinished5", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable6.attachEventOnce("updateFinished6", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable7.attachEventOnce("updateFinished7", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			oTable8.attachEventOnce("updateFinished8", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#MasterDataManagement-display"
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
			var smasterServiceTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false),
						new sap.ui.model.Filter('IsChild', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/MasterServiceTypeSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					smasterServiceTitle = that.getResourceBundle().getText("masterServiceCount", [counter]);
					that.getModel("worklistView").setProperty("/masterService", smasterServiceTitle);
				}
			});
		},

		onUpdateFinished1: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterFacilityTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/MasterFacilityTypeSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					smasterFacilityTitle = that.getResourceBundle().getText("masterFacilityCount", [counter]);
					that.getModel("worklistView").setProperty("/masterFacility", smasterFacilityTitle);
				}
			});
		},

		onUpdateFinished2: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterRelationshipTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/MasterRelationshipSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					smasterRelationshipTitle = that.getResourceBundle().getText("masterRelationshipCount", [counter]);
					that.getModel("worklistView").setProperty("/masterRelationship", smasterRelationshipTitle);
				}
			});
		},

		onUpdateFinished3: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterFaqCategoryTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/MasterFaqCategorySet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					smasterFaqCategoryTitle = that.getResourceBundle().getText("masterFaqCategoryCount", [counter]);
					that.getModel("worklistView").setProperty("/masterFaqCategory", smasterFaqCategoryTitle);
				}
			});
		},

		onUpdateFinished4: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterEventAttractionTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/MasterEventAttractionTypeSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					smasterEventAttractionTitle = that.getResourceBundle().getText("masterEventAttractionCount", [counter]);
					that.getModel("worklistView").setProperty("/masterEventAttraction", smasterEventAttractionTitle);
				}
			});
		},

		onUpdateFinished5: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterNavigationTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/MasterNavigationTypeSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					smasterNavigationTitle = that.getResourceBundle().getText("masterNavigationCount", [counter]);
					that.getModel("worklistView").setProperty("/masterNavigation", smasterNavigationTitle);
				}
			});
		},

		onUpdateFinished6: function (oEvent) {
			// update the worklist's object counter after the table update
			var sbuildingTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/BuildingSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					sbuildingTitle = that.getResourceBundle().getText("buildingCount", [counter]);
					that.getModel("worklistView").setProperty("/building", sbuildingTitle);
				}
			});
		},

		onUpdateFinished7: function (oEvent) {
			// update the worklist's object counter after the table update
			var sthemeTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/ThemeSet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					sthemeTitle = that.getResourceBundle().getText("themeCount", [counter]);
					that.getModel("worklistView").setProperty("/theme", sthemeTitle);
				}
			});
		},

		onUpdateFinished8: function (oEvent) {
			// update the worklist's object counter after the table update
			var scategoryTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/CategorySet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					scategoryTitle = that.getResourceBundle().getText("categoryCount", [counter]);
					that.getModel("worklistView").setProperty("/category", scategoryTitle);
				}
			});
		},

		onUpdateFinished9: function (oEvent) {
			// update the worklist's object counter after the table update
			var sspecialityTitle,
				that = this,
				aFilters = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter('IsArchived', sap.ui.model.FilterOperator.EQ, false)
					],
					and: true
				});
			this.getModel().read("/MasterSpecialitySet/$count", {
				filters: [aFilters],
				async: true,
				success: function (counter) {
					sspecialityTitle = that.getResourceBundle().getText("specialityCount", [counter]);
					that.getModel("worklistView").setProperty("/speciality", sspecialityTitle);
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
		onChangeNavType: function (oEvent) {
			//	var oSelectedItem = oEvent.getSource().getSelectecdItem();
			this.getModel("worklistView").setProperty("/oEditData/NavigationTypeName", oEvent.getParameter("newValue"));
		},

		// Below function triggers when user enter any value in Contact field
		onMobileValidate: function () {
			// var mobile = this.getView().byId("mobileInput").getValue();
			// var mobileregex = /^[+][0-9,+]{5,15}$/;
			// // var mobileregex = /^([0|\+[0-9]{1,5})?([7-9][0-9]{9})$/;
			// if (!mobileregex.test(mobile)) {
			// 	this.showToast.call(this, "MSG_INVALID_MOBILE");
			// }
		},

		/**
		 * @param oMetadata : Image metadata
		 * @param ImageData : base64 data
		 * @returns Image based
		 */

		onViewImage: function (oEvent, sDialogType) {

			var oView = this.getView(),
				that = this;
			that.oImageBindingContext = oEvent.getSource().getBindingContext();
			// create dialog lazily
			if (!that._oDlgAddOption) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "com.coil.podium.MDM_Data.dialog.Images",
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
				oViewModel = this.getModel("worklistView");
			this._oDlgAddOption.getContent()[0].bindAggregation("pages", {
				path: "/MasterEventAttractionTypeSet",
				filters: [
					new Filter("IsArchived", FilterOperator.EQ, false),
					new Filter("Id", FilterOperator.EQ, that.oImageBindingContext.getProperty("Id"))
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

		/** 
		 * Open Map and choose latitude/longitude for a given facility
		 */
		onMap: function () {
			var that = this;
			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "com.coil.podium.MDM_Data.dialog.HEREMaps",
				controller: that
			}).then(function (oDialog) {
				//that._oDlgAddOption = oDialog;
				// connect dialog to the root view of this component (models, lifecycle)
				var platform = new H.service.Platform({
					'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
				});

				// Obtain the default map types from the platform object
				var maptypes = platform.createDefaultLayers();
				//24.962762, 55.147110
				// Instantiate (and display) a map object:
				this.getView().byId("map");
				var map = new H.Map(
					document.getElementById("map"),
					maptypes.vector.normal.map, {
						zoom: 15,
						center: {
							lng: 55.147110,
							lat: 24.962762
						}
					});
				var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

				var ui = H.ui.UI.createDefault(map, maptypes);

				that.getView().addDependent(oDialog);
				that.addDraggableMarker(map, behavior);
				oDialog.open();
			}.bind(this));
		},

		onCloseMaps: function () {
			this.getView().byId("MapDialog").close();
			this.getView().byId("MapDialog").destroy();
		},

		/** 
		 * 
		 * @param map , Here API map Object	
		 * @param behavior,   HERE  map interaction Object API 
		 */
		addDraggableMarker: function (map, behavior) {
			var oViewModel = this.getModel("worklistView");
			var marker = new H.map.Marker({
				lng: 55.147110,
				lat: 24.962762
			}, {
				// mark the object as volatile for the smooth dragging
				volatility: true
			});
			// Ensure that the marker can receive drag events
			marker.draggable = true;
			map.addObject(marker);

			// disable the default draggability of the underlying map
			// and calculate the offset between mouse and target's position
			// when starting to drag a marker object:
			map.addEventListener('dragstart', function (ev) {
				var target = ev.target,
					pointer = ev.currentPointer;
				if (target instanceof H.map.Marker) {
					var targetPosition = map.geoToScreen(target.getGeometry());
					target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
					behavior.disable();
				}
			}, false);

			// re-enable the default draggability of the underlying map
			// when dragging has completed
			map.addEventListener('dragend', function (ev) {
				var target = ev.target;

				if (target instanceof H.map.Marker) {
					behavior.enable();
					oViewModel.setProperty("/oEditData/Longitude", target.getGeometry().lng.toString());
					oViewModel.setProperty("/oEditData/Latitude", target.getGeometry().lat.toString());
				}
			}, false);

			// Listen to the drag event and move the position of the marker
			// as necessary
			map.addEventListener('drag', function (ev) {
				var target = ev.target,
					pointer = ev.currentPointer;
				if (target instanceof H.map.Marker) {
					target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
				}
			}, false);
		},

		onEdit: function (oEvent) {
			//Determine selected Tab
			var sSelectedKey = this.getView().byId("idIconTabBar3").getSelectedKey(),
				oViewModel = this.getModel("worklistView");

			var opMode = this.getResourceBundle().getText("colEdit");
			oViewModel.setProperty("/opMode", opMode);
			oViewModel.setProperty("/operation", "E");
			//Set Visible flag 
			var bEditOptions = {
				Service: false,
				Facility: false,
				Relationship: false,
				FAQ: false,
				Event: false,
				Navigation: false,
				Building: false,
				Theme: false,
				Category: false,
				Speciality: false
			};
			if (sSelectedKey === "Service") {
				this._showObject(oEvent.getSource());
			} else {
				bEditOptions[sSelectedKey] = true;
				oViewModel.setProperty("/bEditOptions", bEditOptions);
				//Set Data to dialog
				var data = oEvent.getSource().getBindingContext().getObject();
				oViewModel.setProperty("/oEditData", data);
				oViewModel.setProperty("/sEditPath", oEvent.getSource().getBindingContext().getPath());

				// oViewModel.setProperty("/sDialogTitle", sSelectedKey);
				if (sSelectedKey === "Event") {
					var sDialogTitle = "Event Attraction"
					oViewModel.setProperty("/sDialogTitle", sDialogTitle);
				} else {
					oViewModel.setProperty("/sDialogTitle", sSelectedKey);
				}

				var oView = this.getView();

				if (!this.byId("detailsDialog")) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "com.coil.podium.MDM_Data.dialog.details",
						controller: this
					}).then(function (oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("detailsDialog").open();
				}
			}
		},

		onAdd: function (oEvent) {
			//Determine selected Tab
			var sSelectedKey = this.getView().byId("idIconTabBar3").getSelectedKey(),
				oViewModel = this.getModel("worklistView");

			var opMode = this.getResourceBundle().getText("colAdd");
			oViewModel.setProperty("/opMode", opMode);
			oViewModel.setProperty("/operation", "C");
			//Set Visible flag 
			var bEditOptions = {
				Service: false,
				Facility: false,
				Relationship: false,
				FAQ: false,
				Event: false,
				Navigation: false,
				Building: false,
				Theme: false,
				Category: false,
				Speciality: false
			};
			if (sSelectedKey === "Service") {
				this.getRouter().navTo("createObject");
			} else {
				bEditOptions[sSelectedKey] = true;
				oViewModel.setProperty("/bEditOptions", bEditOptions);
				// Set Data to dialog
				oViewModel.setProperty("/oEditData", {
					EventAttractionType: "",
					Description: "",
					IsBuilding: false,
					IsCategory: false,
					IsTheme: false,
					FacilityType: "",
					NavigationGroupId: 0,
					NavigationTypeName: "",
					// ServiceType: "",
					// ServiceMessage: "",
					// IncidentTypeId: 0,
					// NavigationId: 0,
					// ContactNumber: "",
					// IsCancelable: false,
					FaqCategory: "",
					BuildingName: "",
					Theme: "",
					Category: "",
					Speciality: "",
					Relationship: "",
					IsArchived: false
				});

				if (sSelectedKey === "Event") {
					oViewModel.setProperty("/sEditPath", "/MasterEventAttractionTypeSet");
					oViewModel.setProperty("/oEditData", {
						EventAttractionType: "",
						Description: "",
						IsBuilding: false,
						IsCategory: false,
						IsTheme: false,
						IsArchived: false
					});
				} else if (sSelectedKey === "Facility") {
					oViewModel.setProperty("/sEditPath", "/MasterFacilityTypeSet");
					oViewModel.setProperty("/oEditData", {
						FacilityType: "",
						IsArchived: false
					});
				} else if (sSelectedKey === "Navigation") {
					oViewModel.setProperty("/sEditPath", "/MasterNavigationTypeSet");
					oViewModel.setProperty("/oEditData", {
						NavigationGroupId: 0,
						NavigationTypeName: "",
						IsArchived: false
					});
				} else if (sSelectedKey === "FAQ") {
					oViewModel.setProperty("/sEditPath", "/MasterFaqCategorySet");
					oViewModel.setProperty("/oEditData", {
						FaqCategory: "",
						IsArchived: false
					});
				} else if (sSelectedKey === "Building") {
					oViewModel.setProperty("/sEditPath", "/BuildingSet");
					oViewModel.setProperty("/oEditData", {
						BuildingName: "",
						IsArchived: false
					});
				} else if (sSelectedKey === "Theme") {
					oViewModel.setProperty("/sEditPath", "/ThemeSet");
					oViewModel.setProperty("/oEditData", {
						Theme: "",
						IsArchived: false
					});
				} else if (sSelectedKey === "Category") {
					oViewModel.setProperty("/sEditPath", "/CategorySet");
					oViewModel.setProperty("/oEditData", {
						Category: "",
						IsArchived: false
					});
				} else if (sSelectedKey === "Speciality") {
					oViewModel.setProperty("/sEditPath", "/MasterSpecialitySet");
					oViewModel.setProperty("/oEditData", {
						Speciality: "",
						IsArchived: false
					});
				} else if (sSelectedKey === "Relationship") {
					oViewModel.setProperty("/sEditPath", "/MasterRelationshipSet");
					oViewModel.setProperty("/oEditData", {
						Relationship: "",
						IsArchived: false
					});
				}

				if (sSelectedKey === "Event") {
					var sDialogTitle = "Event Attraction"
					oViewModel.setProperty("/sDialogTitle", sDialogTitle);
				} else {
					oViewModel.setProperty("/sDialogTitle", sSelectedKey);
				}

				var oView = this.getView();

				if (!this.byId("detailsDialog")) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "com.coil.podium.MDM_Data.dialog.details",
						controller: this
					}).then(function (oDialog) {
						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("detailsDialog").open();
				}
			}
		},

		/*
		 * @function: To remove Admin
		 * @param oEvent : Get Line item context
		 */

		onDelete: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var data = this.getModel().getData(sPath);
			var oValid = this._fnValidationCantDelete(data);
			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}

			function onYes() {
				var data = this.getModel().getData(sPath);
				this.getModel().update(sPath, {
					IsArchived: true
				}, {
					success: this.showToast.bind(this, "MSG_SUCCESS_REMOVE")
				});
			}
			this.showWarning("MSG_CONFIRM_MDM_DELETE", onYes);
		},

		_fnValidationCantDelete: function (data) {
			var oReturn = {
				IsNotValid: false,
				sMsg: []
			};
			if (data.CreatedBy === null) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_CANNOT_DELETE_SYSTEM_DATA");
			}
			return oReturn;
		},

		onRefreshView: function () {
			var oModel = this.getModel();
			oModel.refresh(true);
		},
		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onClose: function (oEvent) {
			this.byId("detailsDialog").close();
			this.getModel().refresh(true);
			this.getModel("worklistView").setProperty("/oImage", null);
		},

		/** 
		 * 
		 * @param oEvent: having source and file info 
		 */
		onUpload: function (oEvent) {
			var oFile = oEvent.getSource().FUEl.files[0];
			this.getImageBinary(oFile).then(this._fnAddFile.bind(this));
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

		onSave: function (oEvent) {

			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("worklistView"),
				data = oViewModel.getProperty("/oEditData"),
				sPath = oViewModel.getProperty("/sEditPath");

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
			delete data.Id;

			var operation = oViewModel.getProperty("/operation");
			if (operation === "E") {
				this.getModel().update(sPath, data, {
					success: function () {
						this._UploadImage(sPath, oViewModel.getProperty("/oImage")).then(this._Success.bind(this, oEvent), this._Error.bind(
							this))
					}.bind(this),
					error: this._Error.bind(this)
				});
			} else if (operation === "C") {
				var that = this;
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
			var oViewModel = this.getModel("worklistView");
			if (oViewModel.getProperty("/bEditOptions").Facility === true) {
				if (!data.FacilityType) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_FTYPE");
					aCtrlMessage.push({
						message: "MSG_VALDTN_FTYPE",
						target: "/oEditData/FacilityType"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").Relationship === true) {
				if (!data.Relationship) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_RELATION");
					aCtrlMessage.push({
						message: "MSG_VALDTN_RELATION",
						target: "/oEditData/Relationship"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").FAQ === true) {
				if (!data.FaqCategory) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_FAQCAT");
					aCtrlMessage.push({
						message: "MSG_VALDTN_FAQCAT",
						target: "/oEditData/FaqCategory"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").Event === true) {
				if (!data.EventAttractionType) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_EAT");
					aCtrlMessage.push({
						message: "MSG_VALDTN_EAT",
						target: "/oEditData/EventAttractionType"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").Navigation === true) {
				if (!data.NavigationTypeName) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_NTN");
					aCtrlMessage.push({
						message: "MSG_VALDTN_NTN",
						target: "/oEditData/NavigationTypeName"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").Building === true) {
				if (!data.BuildingName) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_BUILDING");
					aCtrlMessage.push({
						message: "MSG_VALDTN_BUILDING",
						target: "/oEditData/BuildingName"
					});
				}
				if (+data.Longitude == 0 || +data.Latitude == 0) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_LAT_LNG");
					aCtrlMessage.push({
						message: "MSG_LAT_LNG",
						target: "/oEditData/Latitude"
					});
					aCtrlMessage.push({
						message: "MSG_LAT_LNG",
						target: "/oEditData/Longitude"
					});
				} else if (+data.Latitude < -90 || +data.Latitude > 90) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_ERR_LAT");
					aCtrlMessage.push({
						message: "MSG_ERR_LAT",
						target: "/oEditData/Latitude"
					});
				} else if (+data.Longitude < -180 || +data.Longitude > 180) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_ERR_LNG");
					aCtrlMessage.push({
						message: "MSG_ERR_LNG",
						target: "/oEditData/Longitude"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").Theme === true) {
				if (!data.Theme) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_THEME");
					aCtrlMessage.push({
						message: "MSG_VALDTN_THEME",
						target: "/oEditData/Theme"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").Category === true) {
				if (!data.Category) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_CATEGORY");
					aCtrlMessage.push({
						message: "MSG_VALDTN_CATEGORY",
						target: "/oEditData/Category"
					});
				}
			}
			if (oViewModel.getProperty("/bEditOptions").Speciality === true) {
				if (!data.Speciality) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_SPECIALITY");
					aCtrlMessage.push({
						message: "MSG_VALDTN_SPECIALITY",
						target: "/oEditData/Speciality"
					});
				}
			}

			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);
			return oReturn;
		},

		_genCtrlMessages: function (aCtrlMsgs) {
			var that = this,
				oViewModel = that.getModel("worklistView");
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

				/*	that.getModel().update(sPath + "/$value",  oImage.Image, {
					success : function(){
						res.apply(that);
					},
					error: function(){
						rej.apply(that);
					}
					
				});*/

				/*	 var fd = new FormData();
					 	fd.append("file", oImage.Image );*/

				var settings = {
					url: "/EXPO_PODIUM_API/api/v2/odata.svc" + sPath + "/$value",
					//	data : fd,
					data: oImage.Image,
					method: "PUT",
					headers: that.getModel().getHeaders(),
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

		onSearch: function () {
			var aFilters = this.getFiltersfromFB(),
				oTable = this.getView().byId("table"),
				oTable1 = this.getView().byId("table1"),
				oTable2 = this.getView().byId("table2"),
				oTable3 = this.getView().byId("table3"),
				oTable4 = this.getView().byId("table4"),
				oTable5 = this.getView().byId("table5");

			oTable.getBinding("items").filter(aFilters);
			oTable1.getBinding("items").filter(aFilters);
			oTable2.getBinding("items").filter(aFilters);
			oTable3.getBinding("items").filter(aFilters);
			oTable4.getBinding("items").filter(aFilters);
			oTable5.getBinding("items").filter(aFilters);
			if (aFilters.length !== 0) {
				this.getModel("worklistView").setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table"),
				oTable1 = this.byId("table1"),
				oTable2 = this.byId("table2"),
				oTable3 = this.byId("table3"),
				oTable4 = this.byId("table4"),
				oTable5 = this.byId("table5");
			oTable.getBinding("items").refresh();
			oTable1.getBinding("items").refresh();
			oTable2.getBinding("items").refresh();
			oTable3.getBinding("items").refresh();
			oTable4.getBinding("items").refresh();
			oTable5.getBinding("items").refresh();
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

		_Success: function (oEvent) {
			MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS"));
			this.onClose(oEvent);
		},

		_SuccessAdd: function (oEvent) {
			MessageToast.show(this.getResourceBundle().getText("MSG_SUCCESS_ADD"));
			this.onClose(oEvent);
		},

		_Error: function (error) {
			MessageToast.show(error.toString());
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
				oTable4 = this.byId("table4"),
				oTable5 = this.byId("table5"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			oTable1.getBinding("items").filter(aTableSearchState, "Application");
			oTable2.getBinding("items").filter(aTableSearchState, "Application");
			oTable3.getBinding("items").filter(aTableSearchState, "Application");
			oTable4.getBinding("items").filter(aTableSearchState, "Application");
			oTable5.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
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
				/*
						oFileReader.onload = function () {
							res({
								Image: oFileReader.result,
								name: sFileName
							});
						};
						//	oFileReader.readAsDataURL(oFile);
						//	oFileReader.readAsBinaryString(oFile)
						//	oFileReader.readAsArrayBuffer(oFile);
						res({
							Image: oFile,
							name: sFileName
						});

					});*/

				//	var reader = new FileReader();

				oFileReader.onloadend = function (e) {
					res({
						Image: new Blob([this.result], {
							type: "image/jpeg"
						}),
						name: sFileName
					});
				};

				oFileReader.readAsArrayBuffer(oFile);

			});

		},

		_fnAddFile: function (oItem) {
			//	var iIndex = oItem.Image.search(",") + 1;

			this.getModel("worklistView").setProperty("/oImage", {
				Image: oItem.Image, //.slice(iIndex),
				FileName: oItem.name,
				IsArchived: false
			});

			this.getModel("worklistView").refresh();
		}

	});
});