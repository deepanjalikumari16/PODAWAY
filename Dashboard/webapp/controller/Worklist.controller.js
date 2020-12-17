	sap.ui.define([
		"./BaseController",
		"sap/ui/model/json/JSONModel",
		"../model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/viz/ui5/format/ChartFormatter",
		"sap/viz/ui5/api/env/Format",
		"sap/ui/core/Fragment"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, ChartFormatter, Format, Fragment) {
		"use strict";

		return BaseController.extend("com.coil.podium.Dashboard.controller.Worklist", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit: function () {
				try {
					jQuery.sap.require("com.coil.podium.Dashboard.libs.mapsjs-core");
					jQuery.sap.require("com.coil.podium.Dashboard.libs.mapsjs-service");
					jQuery.sap.require("com.coil.podium.Dashboard.libs.mapsjs-ui");
					jQuery.sap.require("com.coil.podium.Dashboard.libs.mapsjs-mapevents");
					jQuery.sap.require("com.coil.podium.Dashboard.libs.mapsjs-data");
					jQuery.sap.require("com.coil.podium.Dashboard.libs.mapsjs-clustering");
				} catch (err) {
					console.log(err);
				}

				//set icon of first card
				//	this.getView().byId("card1Image").setSrc($.sap.getModulePath("com/coil/podium/Dashboard", "/css/wheelchair@3x.png"));

				this.setLocalModel();
				//	this.loadMap();
				// Add the worklist page to the flp routing history
				this.addHistoryEntry({
					title: this.getResourceBundle().getText("worklistViewTitle"),
					icon: "sap-icon://table-view",
					intent: "#Dashboard-Display"
				}, true);
				
				
				this._enableDesktopNotification();
			},
			
			
			onAfterRendering: function () {
				this.getModel().metadataLoaded().then(this._getUsers.bind(this));
				//Auto refresh in every 30 secs
				setInterval(this._getUsers.bind(this), 30000)

			},
			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */
			refresh: function (oEvent) {
				var refershVar;
				if (oEvent) {
					clearInterval(refersh);
					return;
				}

				refershVar = setInterval(this._getUsers.bind(this), 30000);

			},

			onObject: function () {
				this.getRouter().navTo("object");
			},

			handleNotificationPopoverPress: function (oEvent) {
				var oView = this.getView();
				var oButton = oEvent.getSource();
				if (!this._oPopover) {
					Fragment.load({
						name: "com.coil.podium.Dashboard.dialog.Notifications",
						controller: this
					}).then(function (oPopover) {
						oView.addDependent(oPopover);
						this._oPopover = oPopover;
						this._oPopover.openBy(oButton);
					}.bind(this));
				} else {
					this._oPopover.openBy(oButton);
				}
			},
			onItemClose: function (oEvent) {
			var oItem = oEvent.getSource(),
				oList = oItem.getParent();

			oList.removeItem(oItem);

		//	MessageToast.show('Item Closed: ' + oEvent.getSource().getTitle());
			},
			/* =========================================================== */
			/* Internal function                                           */
			/* =========================================================== */
			loadNotifications: function(oEvent){
			var oViewModel = this.getView().getModel("dashboard");
			//debugger;
			oViewModel.setProperty("/bNotificationBusy", true);
		//	var oList = oEvent.getSource().getContent()[0];
			function onSuccess(data){
					oViewModel.setProperty("/bNotificationBusy", false);
					oViewModel.setProperty("/aNotifications", data.results);
					oViewModel.refresh(true);
				//	oList.refreshAggregation("items");
			}
			
			this.getModel().read("/GetNotifications", {
				urlParameters: {
							"$expand": "Notification,Notification/Redirection"
						},	
				success : onSuccess.bind(this)
			});
			
				
			},		
				
			setLocalModel: function () {

				var oDashboardModel = new JSONModel({
					bMapBusy: true,
					aNotifications : [],
					bViewBusy: false,
					logo: sap.ui.require.toUrl("com/coil/podium/Dashboard/css/wheelchair.svg"),
					EmergencyLogo: sap.ui.require.toUrl("com/coil/podium/Dashboard/css/wheelchair_1.svg"),
					bHeapMap: false
				});

				this.setModel(oDashboardModel, "dashboard");

			},

			toAssignments: function (bisEmergency) {

				var oNavObject = {
					target: {
						semanticObject: "Manage",
						action: "Assignment"
					}
				};

				if (bisEmergency) {
					oNavObject.params = {
						isEmergency: true
					};
				}

				this.Navigate(oNavObject);
			},

			toPODVisitors: function () {
				this.Navigate({
					target: {
						semanticObject: "Manage",
						action: "Visitor"
					}
				});
			},

			Navigate: function (oSemAct) {
				var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");

				oCrossAppNav.isNavigationSupported([{
					target: {
						shellHash: oSemAct.target.semanticObject.concat("-", oSemAct.target.action)
					}
				}]).done(function (aResponse) {
					if (!(aResponse[0].supported)) return;

					oCrossAppNav.toExternal(oSemAct);

				});

			},

			changeMap: function () {
				this.getModel("dashboard").setProperty("/bHeapMap", !(this.getModel("dashboard").getProperty("/bHeapMap")));
			},

			
			_getUsers: function () {
				var aPromises = [],
					that = this;

				this.getModel("dashboard").setProperty("/bViewBusy", true);

				aPromises.push(new Promise(function (res, rej) {
					that.getModel().read("/UserSet", {
						filters: [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("RoleId", FilterOperator.EQ, 3)],
						urlParameters: {
							$expand: "UserPreference/UserAccessibilityList/AccessiblityItem,UserDevice"
						},
						success: function (data) {
							res(data);
						},
						error: function (err) {
								rej(err);
							} //this.loadMap.bind(this)
					});

				}));

				aPromises.push(new Promise(function (res, rej) {
					that.getModel().read("/AssignmentSet", {
						filters: that._getFiltersForAssigment(),
						urlParameters: {
							$expand: "ServiceType/IncidentType,PODVisitor"
						},
						success: function (data) {
							res(data);
						},
						error: function (err) {
								rej(err);
							} //this.loadMap.bind(this)
					});

				}));

				aPromises.push(new Promise(function (res, rej) {
					that.getModel().read("/GetDashboardKPI", {
						urlParameters: {
							$expand: "TotalVisitorsByCategory,TotalOnsiteVisitorsByCategory,TotalAssignmentsByIncidentType,TotalAssignmentsByStatus"
						},
						success: function (data) {
							res(data);
						},
						error: function (err) {
								rej(err);
							} //this.loadMap.bind(this)
					});

				}));

				aPromises.push(new Promise(function (res, rej) {
					that.getModel().read("/GetNotifications", {
						urlParameters: {
							"$select": "UUID",
								"Top" : 100,
								"Skip" : 0
							
						},	
						success: function (data) {
							res(data);
						},
						error: function (err) {
							rej(err);
						}
					});

				}));

				Promise.all(aPromises)
					.then(that._setView.bind(that));

			},

		_setView: function (aResults) {
			var oViewModel = this.getModel("dashboard");
				oViewModel.setProperty("/bViewBusy", false);

				var that = this,
					aUsers = aResults[0].results,
					aEmUsers = aResults[1].results.map(function (ele) {
						return ele.PODVisitor;
					});

				//set HERE Map and Add user markers
				that._setMap(aUsers, aEmUsers);

				//set DashBoard KPIs
				that._setCharts(aResults[2].results[0]);

				//set Notifications count
				//Get Property getINotifications check for mismatch
				//if mismatch, turn green
				
				if(oViewModel.getProperty("/iNotificationCount") && oViewModel.getProperty("/sLastUUID") !==  aResults[3].results[0].UUID )
				{
					
					this.getView().byId("BadgedButton").setType(sap.m.ButtonType.Accept);
				if(	Notification.permission === "granted")
				{
					new Notification('Expo 2021 Incidents', { body: "You have new notifications" });
				}
				
				}
				
				this.getModel("dashboard").setProperty("/sLastUUID", aResults[3].results[0].UUID );
				this.getModel("dashboard").setProperty("/iNotificationCount", aResults[3].results.length);

			},
			_setCharts: function (data) {
				//~~~~~	Work in progress ~~~~
				var oViewModel = this.getModel("dashboard");

				oViewModel.setProperty("/iTotalPOD", data.TotalVisitors);
				oViewModel.setProperty("/iTotalPODActive", data.TotalOnsiteVisitors);
				oViewModel.setProperty("/EmergecnyIncidents", data.TotalAssignmentsByIncidentType.results[0].Total);

				var TotalIncidents = 0;

				data.TotalAssignmentsByIncidentType.results.forEach(function (ele) {
					TotalIncidents += ele.Total;
				});

				oViewModel.setProperty("/TotalIncidents", TotalIncidents);
				oViewModel.setProperty("/TotalAssignments", data.TotalAssignments);
				oViewModel.setProperty("/PODByCategory", data.TotalVisitorsByCategory.results);
				// Request backed for wraggled total and Onsite data
				oViewModel.setProperty("/PODByOnsiteCategory", data.TotalOnsiteVisitorsByCategory.results);

				oViewModel.setProperty("/AssignmentStatues", {
					pending: data.TotalAssignmentsByStatus.results[0].Total,
					inprogress: data.TotalAssignmentsByStatus.results[1].Total,
					completed: data.TotalAssignmentsByStatus.results[2].Total,
					cancelled: data.TotalAssignmentsByStatus.results[3].Total
				});

			},

			onOpenPODCategoriesDialog: function () {
				var oView = this.getView(),
					that = this;
				// create dialog lazily
				if (!that._oDlgChartOption) {
					// load asynchronous XML fragment
					Fragment.load({
						id: oView.getId(),
						name: "com.coil.podium.Dashboard.dialog.CategoryChart",
						controller: that
					}).then(function (oDialog) {
						that._oDlgChartOption = oDialog;

						Format.numericFormatter(ChartFormatter.getInstance());
						var formatPattern = ChartFormatter.DefaultPattern;

						var oVizFrame = oDialog.getContent()[0].getItems()[0];
						oVizFrame.setVizProperties({
							plotArea: {
								dataLabel: {
									formatString: formatPattern.SHORTFLOAT_MFD2,
									visible: true
								}
							},
							valueAxis: {
								label: {
									formatString: formatPattern.SHORTFLOAT
								},
								title: {
									visible: true
								}
							},
							categoryAxis: {
								title: {
									visible: true
								}
							},
							title: {
								visible: false
							}
						});

						// connect dialog to the root view of this component (models, lifecycle)
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					that._oDlgChartOption.open();
				}
			},

			onCloseCategoryDlg: function () {
				this._oDlgChartOption.close();
			},

		

			_setMap: function (aUsers, aEmUsers) {
				var oViewModel = this.getModel("dashboard");
				//Set to store unique values 
				var oUserSet = new Set(),
					that = this;

				aEmUsers.forEach(function (ele) {
					oUserSet.add(ele);
				});

				this._setHeatMap(aUsers, aEmUsers, oUserSet);

				var map = this._initMap("map");

				var group = new H.map.Group();

				map[0].addObject(group);

				// add 'tap' event listener, that opens info bubble, to the group
				group.addEventListener('tap', function (evt) {
					// event target is the marker itself, group is a parent event target
					// for all objects that it contains
					var bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
						// read custom data
						content: evt.target.getData()
					});
					// show info bubble
					map[1].addBubble(bubble);
				}, false);
				var html,
					oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");

				var dataPoints = [];

				aEmUsers.forEach(function (oUser) {
					if (!!oUser) {
						html = that.getHTMLPart(oCrossAppNav, oUser);
						dataPoints.push(new H.clustering.DataPoint(oUser.Latitude, oUser.Longitude));
						that.addDraggableMarker(group, html, oUser.Latitude, oUser.Longitude, true);
					}

				});

				aUsers.forEach(function (oUser) {

					if (!(oUserSet.has(oUser))) {
						dataPoints.push(new H.clustering.DataPoint(oUser.Latitude, oUser.Longitude));

						html = that.getHTMLPart(oCrossAppNav, oUser);
						that.addDraggableMarker(group, html, oUser.Latitude, oUser.Longitude, false);
					}

				});
				/*	dataPoints = [];
					dataPoints.push(new H.clustering.DataPoint(25.076540697942015, 55.177528976648695));
					dataPoints.push(new H.clustering.DataPoint(25.0610172, 55.1003971));
					dataPoints.push(new H.clustering.DataPoint(25.078436462619532, 55.2008414095388));*/
				var clusteredDataProvider = new H.clustering.Provider(dataPoints);

				// Create a layer that includes the data provider and its data points: 
				var layer = new H.map.layer.ObjectLayer(clusteredDataProvider);

				// Add the layer to the map:
				map[0].addLayer(layer);

				// Add an event listener to the Provider - this listener is called when a maker// has been tapped:
				clusteredDataProvider.addEventListener('tap', function (event) {
					// Log data bound to the marker that has been tapped:
					alert(event.target.getData());
					console.log(event.target.getData());
				});

				//	this.bindMapProperties();

				oViewModel.setProperty("/bMapBusy", false);
			},

			bindMapProperties: function () {

				var oView = this.getView();

				oView.byId("map").bindProperty("visible", {
					path: "/bHeapMap",
					model: "dashboard",
					formatter: function (bValue) {
						return !bValue
					}
				});

				oView.byId("heatMap").bindProperty("visible", {
					path: "/bHeapMap",
					model: "dashboard"
				});

			},

			_setHeatMap: function (aUsers, aEmUsers, oUserSet) {
				var map = this._initMap("heatMap");

				var heatmapProvider = new H.data.heatmap.Provider({
					colors: new H.data.heatmap.Colors({
						'0': 'blue',
						'0.5': 'yellow',
						'1': 'red'
					}, true),
					opacity: 0.6,
					// Paint assumed values in regions where no data is available
					assumeValues: false
				});

				// Add the data:
				var heatData = []
				aUsers.forEach(function (oUser) {
					if (!(oUserSet.has(oUser))) {
						if (+(oUser.Latitude) && +(oUser.Longitude)) {
							heatData.push({
								lat: +(oUser.Latitude),
								lng: +(oUser.Longitude),
								value: 0.5
							});
						}
					}
				});

				aEmUsers.forEach(function (oUser) {
					if (!!oUser && +(oUser.Latitude) && +(oUser.Longitude)) {
						heatData.push({
							lat: +(oUser.Latitude),
							lng: +(oUser.Longitude),
							value: 1
						});
					}

				});

				heatmapProvider.addData(heatData);
				// Add a layer for the heatmap provider to the map:
				map[0].addLayer(new H.map.layer.TileLayer(heatmapProvider));

			},

			getHTMLPart: function (oCrossAppNav, oUser) {
				var appHref = "";
				if (oCrossAppNav) {
					window.toExtFrmdashBoard = function (userid) {
						oCrossAppNav.toExternal({
							target: {
								shellHash: "Manage-Visitor&/UserSet/" + userid
							}
						});
					};
					appHref = "href='#'  onclick='toExtFrmdashBoard( " + oUser.Id + ")'";
				}
				return "<div style='white-space: nowrap;'  > " + oUser.FirstName + " " +
					oUser.LastName + "<br><a target='_self' " + appHref + ">More details</a> </div>";
			},

			_initMap: function (id) {
				var platform = new H.service.Platform({
					'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
				});

				if (id === "map" && this.map) {
					return [this.map, this.mapUi];
				}
				if (id === "heatMap" && this.heatMap) {
					return [this.heatMap, this.heatMapUi];
				}

				var maptypes = platform.createDefaultLayers();
				var map = new H.Map(
					this.getView().byId(id).getDomRef(),
					maptypes.vector.normal.map, {
						zoom: 15,
						center: {
							lng: 55.147110,
							lat: 24.962762
						}
					});
				var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

				var ui = H.ui.UI.createDefault(map, maptypes);

				switch (id) {
				case "map":
					this.map = map;
					this.mapUi = ui;
					break;
				case "heatMap":
					this.heatMap = map;
					this.heatMapUi = ui;
				}

				return [map, ui];
			},

			/** 
			 * 
			 * @param map , Here API map Object	
			 * @param behavior,   HERE map interaction Object API 
			 */
			addDraggableMarker: function (group, html, lat, lng, isEmergency) {
				var oOptions = {
					volatility: false
				};
				if (+lat && +lng) {
					var location = {
						lng: +lng,
						lat: +lat
					};

					var svgMarkup;
					if (isEmergency) {
						svgMarkup =
							'<svg xmlns="http://www.w3.org/2000/svg" fill="red"  width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>';

					} else {
						svgMarkup =
							'<svg xmlns="http://www.w3.org/2000/svg" fill="green"  width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>';

					}
					oOptions.icon = new H.map.Icon(svgMarkup);
					//TODO: instert MAP Interaction 
					//restore marker from model
					var marker = new H.map.Marker(location, oOptions);
					marker.draggable = false;
					//	map.addObject(marker);
					marker.setData(html);
					group.addObject(marker);

				}
			},

			_getFiltersForAssigment: function () {
				//, new Filter("ServiceType/IncidentType/IncidentType", FilterOperator.EQ, "Emergency")
				var oAndFilter = new Filter({
					filters: [new Filter("AssignmentStatusId", FilterOperator.EQ, 1),
						new Filter("AssignmentStatusId", FilterOperator.EQ, 2)
					],
					bAnd: false,
					and: false
				});

				return [oAndFilter, new Filter("IsArchived",
					FilterOperator.EQ, false), new Filter("ServiceType/IncidentType/IncidentType", FilterOperator.EQ, "Emergency")];
			},
			
			_enableDesktopNotification: function(){
			if(	Notification.permission === "default")
			{
				Notification.requestPermission();
			}
			}

		});
	});