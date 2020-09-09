sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	//---- HERE Maps API , add AMD libraries above------	
	"../libs/mapsjs-core",
	"../libs/mapsjs-service",
	"../libs/mapsjs-ui",
	"../libs/mapsjs-mapevents"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment) {
	"use strict";

	return BaseController.extend("Assignment_List.Assignment_List.controller.Worklist", {

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
				assigneeId: 0,
				comments: "",
				Latitude: 0,
				Longitude: 0,
				POD_Longitude: "",
				POD_Latitude: "",
				EXPO_Longitude: "",
				EXPO_Latitude: ""
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
				intent: "#Manage-Assignment"
			}, true);

			/*var sPendingTitle = this.getResourceBundle().getText("pending");
			this.getModel("worklistView").setProperty("/pending", sPendingTitle);

			var sOngoingTitle = this.getResourceBundle().getText("ongoing");
			this.getModel("worklistView").setProperty("/ongoing", sOngoingTitle);

			var sCompletedTitle = this.getResourceBundle().getText("completed");
			this.getModel("worklistView").setProperty("/completed", sCompletedTitle);

			var sCancelledTitle = this.getResourceBundle().getText("cancelled");
			this.getModel("worklistView").setProperty("/cancelled", sCancelledTitle);*/

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
			var sPendingTitle,
				// sTitle, 
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");

			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sPendingTitle = this.getResourceBundle().getText("pendingCount", [iTotalItems]);
			} else {
				sPendingTitle = this.getResourceBundle().getText("pending");
			}
			this.getModel("worklistView").setProperty("/pending", sPendingTitle);
		},

		onUpdateFinished1: function (oEvent) {
			// update the worklist's object counter after the table update
			var sOngoingTitle,
				oTable1 = oEvent.getSource(),
				iTotalItems1 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems1 && oTable1.getBinding("items").isLengthFinal()) {
				sOngoingTitle = this.getResourceBundle().getText("ongoingCount", [iTotalItems1]);
			} else {
				sOngoingTitle = this.getResourceBundle().getText("ongoing");
			}
			this.getModel("worklistView").setProperty("/ongoing", sOngoingTitle);
		},

		onUpdateFinished2: function (oEvent) {
			// update the worklist's object counter after the table update
			var sCompletedTitle,
				oTable2 = oEvent.getSource(),
				iTotalItems2 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems2 && oTable2.getBinding("items").isLengthFinal()) {
				sCompletedTitle = this.getResourceBundle().getText("completedCount", [iTotalItems2]);
			} else {
				sCompletedTitle = this.getResourceBundle().getText("completed");
			}
			this.getModel("worklistView").setProperty("/completed", sCompletedTitle);
		},

		onUpdateFinished3: function (oEvent) {
			// update the worklist's object counter after the table update
			var sCancelledTitle,
				oTable3 = oEvent.getSource(),
				iTotalItems3 = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems3 && oTable3.getBinding("items").isLengthFinal()) {
				sCancelledTitle = this.getResourceBundle().getText("cancelledCount", [iTotalItems3]);
			} else {
				sCancelledTitle = this.getResourceBundle().getText("cancelled");
			}
			this.getModel("worklistView").setProperty("/cancelled", sCancelledTitle);
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

		onAssignNow: function (oEvent) {
			var bText = oEvent.getSource().getText();
			if (bText === "Assign Now" || bText === "Reassign") {
				var oView = this.getView();
				var oObject = oEvent.getSource().getBindingContext().getObject();
				this.getModel("worklistView").setProperty("/assigneeId", oObject.AssigneeId);
				var sPath = oEvent.getSource().getBindingContext().getPath();
				var data = this.getModel().getData(sPath);
				this.getModel("worklistView").setProperty("/assignmentId", data.Id);
				// create dialog lazily
				if (!this.byId("openDialog")) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "Assignment_List.Assignment_List.view.Dialog",
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
					this.byId("openDialog").open();
				}
			} else {
				var startPath = oEvent.getSource().getBindingContext().getPath();
				var sData = this.getModel().getData(startPath);
				this.getModel("worklistView").setProperty("/assignmentId", sData.Id);
				var dat = this;
				var oModel = dat.getModel();
				oModel.callFunction("/StartAssignment", {
					method: "GET",
					urlParameters: {
						AssignmentId: this.getModel("worklistView").getProperty("/assignmentId")
					},
					success: function (edata) {
						dat.showToast.call(dat, "MSG_SUCCESS_START_ASSIGNMENT");
						oModel.refresh(true);
					}
				});
			}
		},

		closeDialog: function () {
			this.byId("openDialog").close();
		},

		assignNow: function () {
			if (this.getModel("worklistView").getProperty("/assigneeId") === null) {
				this.showToast.call(this, "MSG_ENTER_ASSIGNEE");
			} else {
				var dat = this;
				var oModel = dat.getModel();
				oModel.callFunction("/AssignNow", {
					method: "GET",
					urlParameters: {
						AssignmentId: this.getModel("worklistView").getProperty("/assignmentId"),
						AssigneeId: this.getModel("worklistView").getProperty("/assigneeId")
					},
					success: function (data) {
						dat.showToast.call(dat, "MSG_SUCCESS_ASSIGNEE");
						dat.byId("openDialog").close();
						oModel.refresh(true);
					}
				});
			}
		},

		onMarkasComplete: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var data = this.getModel().getData(sPath);
			var dat = this;
			var oModel = dat.getModel();
			oModel.callFunction("/CompleteAssignment", {
				method: "GET",
				urlParameters: {
					AssignmentId: data.Id
				},
				success: function (adata) {
					dat.showToast.call(dat, "MSG_SUCCESS_MARKED_COMPLETED");
					oModel.refresh(true);
				}
			});
		},

		onComment: function (oEvent) {
			var oView = this.getView();
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var data = this.getModel().getData(sPath);
			this.getModel("worklistView").setProperty("/assignmentId", data.Id);
			var oObject = oEvent.getSource().getBindingContext().getObject();
			this.getModel("worklistView").setProperty("/comments", oObject.Comments);
			if (!this.byId("commentDialog")) {
				// load asynchronous XML fragment
				Fragment.load({
					id: oView.getId(),
					name: "Assignment_List.Assignment_List.view.CommentDialog",
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
					oModel.callFunction("/CommentAssignment", {
						method: "GET",
						urlParameters: {
							AssignmentId: this.getModel("worklistView").getProperty("/assignmentId"),
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

		// onValidCommentLength: function () {
		// 	var Maxlength = this.getView().byId("mycommentarea").getMaxLength();
		// 	var Text_lenght = this.getView().byId("mycommentarea").getValue().length;
		// 	if (Maxlength === Text_lenght) {
		// 		this.showToast.call(this, "MSG_COMMENT_MAXIMUM_LENGTH_REACHED");
		// 	}
		// },

		/** 
		 * Open Map and choose latitude/longitude for a given facility
		 */
		onNavigate: function (oEvent) {

			// To get POD Latitude and Longitude
			var sPath = oEvent.getSource().getBindingContext().getObject().PODVisitor.__ref;
			var pData = this.getModel().getData("/" + sPath);
			this.getModel("worklistView").setProperty("/POD_Latitude", pData.Latitude);
			this.getModel("worklistView").setProperty("/POD_Longitude", pData.Longitude);

			// To get EXPO Latitude and Longitude
			var that = this;
			this.getView().getModel().read("/EventInfoSet", {
				filters: [new Filter("Id", FilterOperator.EQ, 'bfed13c1-6cfd-4c77-9a62-cdbf500d0800')],
				success: function (response) {
					that.getModel("worklistView").setProperty("/EXPO_Latitude", response.results[0].Latitude);
					that.getModel("worklistView").setProperty("/EXPO_Longitude", response.results[0].Longitude);
				}
			});

			var oData = oEvent.getSource().getBindingContext().getObject();
			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "Assignment_List.Assignment_List.dialog.HEREMaps",
				controller: that
			}).then(function (oDialog) {
				//that._oDlgAddOption = oDialog;
				// connect dialog to the root view of this component (models, lifecycle)
				var platform = new H.service.Platform({
					'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
				});
				var defaultLayers = platform.createDefaultLayers();
				var map = new H.Map(
					document.getElementById('map'),
					defaultLayers.vector.normal.map, {
						zoom: 15,
						center: {
							// lng: 55.147110,
							lng: that.getModel("worklistView").getProperty("/EXPO_Longitude"),
							lat: that.getModel("worklistView").getProperty("/EXPO_Latitude")
								// lat: 24.962762
						}
					});

				// Obtain the default map types from the platform object
				var maptypes = platform.createDefaultLayers();
				//24.962762, 55.147110
				// Instantiate (and display) a map object:
				var map = new H.Map(
					document.getElementById("map"),
					maptypes.vector.normal.map, {
						zoom: 15,
						center: {
							// lng: 55.147110,
							lng: that.getModel("worklistView").getProperty("/EXPO_Longitude"),
							// lat: 24.962762
							lat: that.getModel("worklistView").getProperty("/EXPO_Latitude")
						}
					});

				var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

				var ui = H.ui.UI.createDefault(map, defaultLayers);

				that.calcRoute(platform, map, oData);

				//		that.addDraggableMarker(map, behavior);

				that.getView().addDependent(oDialog);
				oDialog.open();
			}.bind(this));
		},

		onCloseMaps: function () {
			this.getView().byId("MapDialog").close();
			this.getView().byId("MapDialog").destroy();
		},

		/**
		 * Creates a H.map.Polyline from the shape of the route and adds it to the map.
		 * @param {Object} route A route as received from the H.service.RoutingService
		 */
		addRouteShapeToMap: function (route, map) {
			var lineString = new H.geo.LineString();
			var routeShape = route.shape;
			var polyline;
			routeShape.forEach(function (point) {
				var parts = point.split(',');
				lineString.pushLatLngAlt(parts[0], parts[1]);
			});

			polyline = new H.map.Polyline(lineString, {
				style: {
					lineWidth: 4,
					strokeColor: 'rgba(0, 128, 255, 0.7)'
				}
			});
			// Add the polyline to the map
			map.addObject(polyline);
			// And zoom to its bounding rectangle
			map.getViewModel().setLookAtData({
				bounds: polyline.getBoundingBox()
			});
		},
		//
		/** 
		 *  @param platform , {H.service.Platform} platform A stub class to access HERE services
		 *	@param oRowData , Binding data object 
		 */
		calcRoute: function (platform, map, oData) {
			var that = this;
			var POD_LatLong = that.getModel("worklistView").getProperty("/POD_Latitude") + "," + that.getModel("worklistView").getProperty(
				"/POD_Longitude");
			var EXPO_LatLong = that.getModel("worklistView").getProperty("/EXPO_Latitude") + "," + that.getModel("worklistView").getProperty(
				"/EXPO_Longitude");
			// TODO: Get from location from ODATA entity call, using test location for now lng: 55.147110, lat: 24.962762
			//	debugger;
			var router = platform.getRoutingService();
			var routeRequestParams = {
				mode: 'shortest;pedestrian',
				representation: 'display',
				routeattributes: 'waypoints,summary,shape,legs',
				maneuverattributes: 'direction,action',
				waypoint0: EXPO_LatLong,
				waypoint1: POD_LatLong
			};

			function onSuccess(result) {
				// ensure that at least one route was found
				var route = result.response.route[0];
				/*
				 * The styling of the route response on the map is entirely under the developer's control.
				 * A representitive styling can be found the full JS + HTML code of this example
				 * in the functions below:
				 */
				that.addRouteShapeToMap(route, map);
				that.addManueversToMap(route, map);

				//	that.addWaypointsToPanel(route.waypoint,map);
				//	that.addManueversToPanel(route,map);
				//	that.addSummaryToPanel(route.summary,map);
			};

			router.calculateRoute(routeRequestParams, onSuccess.bind(that), onSuccess);

		},

		/**
		 * Creates a series of H.map.Marker points from the route and adds them to the map.
		 * @param {Object} route  A route as received from the H.service.RoutingService
		 */
		addManueversToMap: function (route, map) {
			var svgMarkup = '<svg width="18" height="18" ' +
				'xmlns="http://www.w3.org/2000/svg">' +
				'<circle cx="8" cy="8" r="8" ' +
				'fill="#1b468d" stroke="white" stroke-width="1"  />' +
				'</svg>',
				dotIcon = new H.map.Icon(svgMarkup, {
					anchor: {
						x: 8,
						y: 8
					}
				}),
				group = new H.map.Group(),
				i,
				j;
			var maneuver;
			// Add a marker for each maneuver
			for (i = 0; i < route.leg.length; i += 1) {
				for (j = 0; j < route.leg[i].maneuver.length; j += 1) {
					// Get the next maneuver.
					maneuver = route.leg[i].maneuver[j];
					// Add a marker to the maneuvers group
					var marker = new H.map.Marker({
						lat: maneuver.position.latitude,
						lng: maneuver.position.longitude
					}, {
						icon: dotIcon
					});
					marker.instruction = maneuver.instruction;
					group.addObject(marker);
				}
			}

			group.addEventListener('tap', function (evt) {
				map.setCenter(evt.target.getGeometry());
				openBubble(
					evt.target.getGeometry(), evt.target.instruction);
			}, false);

			// Add the maneuvers group to the map
			map.addObject(group);
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
					oViewModel.setProperty("/Longitude", target.getGeometry().lng.toString());
					oViewModel.setProperty("/Latitude", target.getGeometry().lat.toString());
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

		onPodCategory: function (oEvent) {
			var	sPath = oEvent.getSource().getBindingContext().getPath(),
				 oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "Assignment_List.Assignment_List.view.PODCategoryDialog",
					controller: this
				}).then(function(pPopover) {
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
		onSearch: function () {
			var aFilters = this.getFiltersfromFB(),
				oTable = this.getView().byId("table"),
				oTable1 = this.getView().byId("table1"),
				oTable2 = this.getView().byId("table2"),
				oTable3 = this.getView().byId("table3");

			oTable.getBinding("items").filter(aFilters);
			oTable1.getBinding("items").filter(aFilters);
			oTable2.getBinding("items").filter(aFilters);
			oTable3.getBinding("items").filter(aFilters);
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
				oTable3 = this.byId("table3");
			oTable.getBinding("items").refresh();
			oTable1.getBinding("items").refresh();
			oTable2.getBinding("items").refresh();
			oTable3.getBinding("items").refresh();
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
				oTable1 = this.byId("table1"),
				oTable2 = this.byId("table2"),
				oTable3 = this.byId("table3"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			oTable1.getBinding("items").filter(aTableSearchState, "Application");
			oTable2.getBinding("items").filter(aTableSearchState, "Application");
			oTable3.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});