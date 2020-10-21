sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	//---- HERE Maps API , add AMD libraries above------	
	"../libs/mapsjs-core",
	"../libs/mapsjs-service",
	"../libs/mapsjs-ui",
	"../libs/mapsjs-mapevents"
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
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				smasterServiceTitle = this.getResourceBundle().getText("masterServiceCount", [iTotalItems]);
			} else {
				smasterServiceTitle = this.getResourceBundle().getText("masterService");
			}
			this.getModel("worklistView").setProperty("/masterService", smasterServiceTitle);
		},

		onUpdateFinished1: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterFacilityTitle,
				oTable1 = oEvent.getSource(),
				iTotalItems1 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems1 && oTable1.getBinding("items").isLengthFinal()) {
				smasterFacilityTitle = this.getResourceBundle().getText("masterFacilityCount", [iTotalItems1]);
			} else {
				smasterFacilityTitle = this.getResourceBundle().getText("masterFacility");
			}
			this.getModel("worklistView").setProperty("/masterFacility", smasterFacilityTitle);
		},

		onUpdateFinished2: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterRelationshipTitle,
				oTable2 = oEvent.getSource(),
				iTotalItems2 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems2 && oTable2.getBinding("items").isLengthFinal()) {
				smasterRelationshipTitle = this.getResourceBundle().getText("masterRelationshipCount", [iTotalItems2]);
			} else {
				smasterRelationshipTitle = this.getResourceBundle().getText("masterRelationship");
			}
			this.getModel("worklistView").setProperty("/masterRelationship", smasterRelationshipTitle);
		},

		onUpdateFinished3: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterFaqCategoryTitle,
				oTable3 = oEvent.getSource(),
				iTotalItems3 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems3 && oTable3.getBinding("items").isLengthFinal()) {
				smasterFaqCategoryTitle = this.getResourceBundle().getText("masterFaqCategoryCount", [iTotalItems3]);
			} else {
				smasterFaqCategoryTitle = this.getResourceBundle().getText("masterFaqCategory");
			}
			this.getModel("worklistView").setProperty("/masterFaqCategory", smasterFaqCategoryTitle);
		},

		onUpdateFinished4: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterEventAttractionTitle,
				oTable4 = oEvent.getSource(),
				iTotalItems4 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems4 && oTable4.getBinding("items").isLengthFinal()) {
				smasterEventAttractionTitle = this.getResourceBundle().getText("masterEventAttractionCount", [iTotalItems4]);
			} else {
				smasterEventAttractionTitle = this.getResourceBundle().getText("masterEventAttraction");
			}
			this.getModel("worklistView").setProperty("/masterEventAttraction", smasterEventAttractionTitle);
		},

		onUpdateFinished5: function (oEvent) {
			// update the worklist's object counter after the table update
			var smasterNavigationTitle,
				oTable5 = oEvent.getSource(),
				iTotalItems5 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems5 && oTable5.getBinding("items").isLengthFinal()) {
				smasterNavigationTitle = this.getResourceBundle().getText("masterNavigationCount", [iTotalItems5]);
			} else {
				smasterNavigationTitle = this.getResourceBundle().getText("masterNavigation");
			}
			this.getModel("worklistView").setProperty("/masterNavigation", smasterNavigationTitle);
		},

		onUpdateFinished6: function (oEvent) {
			// update the worklist's object counter after the table update
			var sbuildingTitle,
				oTable6 = oEvent.getSource(),
				iTotalItems6 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems6 && oTable6.getBinding("items").isLengthFinal()) {
				sbuildingTitle = this.getResourceBundle().getText("buildingCount", [iTotalItems6]);
			} else {
				sbuildingTitle = this.getResourceBundle().getText("building");
			}
			this.getModel("worklistView").setProperty("/building", sbuildingTitle);
		},

		onUpdateFinished7: function (oEvent) {
			// update the worklist's object counter after the table update
			var sthemeTitle,
				oTable7 = oEvent.getSource(),
				iTotalItems7 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems7 && oTable7.getBinding("items").isLengthFinal()) {
				sthemeTitle = this.getResourceBundle().getText("themeCount", [iTotalItems7]);
			} else {
				sthemeTitle = this.getResourceBundle().getText("theme");
			}
			this.getModel("worklistView").setProperty("/theme", sthemeTitle);
		},

		onUpdateFinished8: function (oEvent) {
			// update the worklist's object counter after the table update
			var scategoryTitle,
				oTable8 = oEvent.getSource(),
				iTotalItems8 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems8 && oTable8.getBinding("items").isLengthFinal()) {
				scategoryTitle = this.getResourceBundle().getText("categoryCount", [iTotalItems8]);
			} else {
				scategoryTitle = this.getResourceBundle().getText("category");
			}
			this.getModel("worklistView").setProperty("/category", scategoryTitle);
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
			var mobile = this.getView().byId("mobileInput").getValue();
			var mobileregex = /^[0-9,+]{5,15}$/;
			if (!mobileregex.test(mobile)) {
				this.showToast.call(this, "MSG_INVALID_MOBILE");
			}
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
				debugger;
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
				Category: false
			};
			bEditOptions[sSelectedKey] = true;
			oViewModel.setProperty("/bEditOptions", bEditOptions);
			//Set Data to dialog
			var data = oEvent.getSource().getBindingContext().getObject();

			oViewModel.setProperty("/oEditData", data);
			oViewModel.setProperty("/sEditPath", oEvent.getSource().getBindingContext().getPath());

			oViewModel.setProperty("/sDialogTitle", sSelectedKey);

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

		onSave: function (oEvent) {
			var oViewModel = this.getModel("worklistView"),
				data = oViewModel.getProperty("/oEditData"),
				sPath = oViewModel.getProperty("/sEditPath");

			delete data.CreatedBy;
			delete data.UpdatedAt;
			delete data.UpdatedBy;
			delete data.CreatedAt;
			delete data.IncidentType;
			delete data.Navigation;
			delete data.Icon;
			delete data.__metadata;
			delete data.Id;

			if (data.ContactNumber !== "" && typeof data.ContactNumber !== "undefined") {
				var mobile = this.getView().byId("mobileInput").getValue();
				var mobileregex = /^[0-9,+]{5,15}$/;
				if (!mobileregex.test(mobile)) {
					this.showToast.call(this, "MSG_INVALID_MOBILE");
				} else {
					this.getModel().update(sPath, data, {
						success: this._UploadImage(sPath, oViewModel.getProperty("/oImage")).then(this._Success.bind(this, oEvent), this._Error.bind(
							this)),
						error: this._Error.bind(this)
					});
				}
			} else {
				this.getModel().update(sPath, data, {
					success: this._UploadImage(sPath, oViewModel.getProperty("/oImage")).then(this._Success.bind(this, oEvent), this._Error.bind(
						this)),
					error: this._Error.bind(this)
				});
			}
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
					url: "/EXPO_PODIUM_API" + sPath + "/$value",
					//	data : fd,
					data: oImage.Image,
					method: "PUT",
					contentType: "multipart/form-data",
					headers : that.getModel().getHeaders(),
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