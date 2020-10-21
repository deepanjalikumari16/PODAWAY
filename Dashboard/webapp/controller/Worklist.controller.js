sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	//---- HERE Maps API , add AMD libraries above------	
	"../libs/mapsjs-service",
	"../libs/mapsjs-ui",
	"../libs/mapsjs-mapevents",
	"../libs/mapsjs-data"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, ChartFormatter, Format) {
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
		},
		onAfterRendering: function () {
			this.getModel().metadataLoaded().then(this._getUsers.bind(this));

			//Add event handling
			$(".sapUiBlockCellTitle ").click(function () {
				debugger;
			});

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
		/* =========================================================== */
		/* Internal function                                           */
		/* =========================================================== */
		setLocalModel: function () {

			var oDashboardModel = new JSONModel({
				bMapBusy: true,
				bViewBusy: false,
				logo: sap.ui.require.toUrl("com/coil/podium/Dashboard/css/wheelchair.svg"),
				EmergencyLogo: sap.ui.require.toUrl("com/coil/podium/Dashboard/css/wheelchair_1.svg"),
				bHeapMap : false
			});

			this.setModel(oDashboardModel, "dashboard");

		},

		toAssignments: function () {
			this.Navigate({
				obj: "Manage",
				action: "Assignment"
			});
		},

		toPODVisitors: function () {
			this.Navigate({
				obj: "Manage",
				action: "Visitor"
			});
		},

		Navigate: function (oSemObj, sParams) {
			var oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");

			oCrossAppNav.isNavigationSupported([{
				target: {
					shellHash: oSemObj.obj.concat("-", oSemObj.action)
				}
			}]).done(function (aResponse) {
				if (!(aResponse[0].supported)) return;

				if (sParams) {
					var appHash = oCrossAppNav.hrefForAppSpecificHash("UserSet/" + sParams);
					appHash = appHref.replace("Dashboard", "Manage");
					appHash = appHref.replace("Display", "Visitor");
					oCrossAppNav.toExternal({
						target: {
							shellHash: appHash
						}
					});
					return;
				}

				oCrossAppNav.toExternal({
					target: {
						semanticObject: oSemObj.obj,
						action: oSemObj.action
					}
				});

			});

		},
		
		changeMap : function(){
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
						$expand: "TotalVisitorsByCategory,TotalAssignmentsByIncidentType,TotalAssignmentsByStatus"
					},
					success: function (data) {
						res(data);
					},
					error: function (err) {
							rej(err);
						} //this.loadMap.bind(this)
				});

			}));

			Promise.all(aPromises)
				.then(that._setView.bind(that));

		},
		_setCharts: function (data) {
			//~~~~~	Work in progress ~~~~
			var oViewModel = this.getModel("dashboard");

			oViewModel.setProperty("/iTotalPOD", data.TotalVisitors);
			oViewModel.setProperty("/EmergecnyIncidents", data.TotalAssignmentsByIncidentType.results[0].Total);

			var TotalIncidents = 0;

			data.TotalAssignmentsByIncidentType.results.forEach(function (ele) {
				TotalIncidents += ele.Total;
			})
			oViewModel.setProperty("/TotalIncidents", TotalIncidents);
			oViewModel.setProperty("/TotalAssignments", data.TotalAssignments);
			oViewModel.setProperty("/PODByCatrgory", data.TotalVisitorsByCategory.results);
			oViewModel.setProperty("/AssignmentStatues", {
				pending: data.TotalAssignmentsByStatus.results[0].Total,
				inprogress: data.TotalAssignmentsByStatus.results[1].Total,
				completed: data.TotalAssignmentsByStatus.results[2].Total,
				cancelled: data.TotalAssignmentsByStatus.results[3].Total
			});

		},
		_setD3Chart: function (data) {
/*
			var domRef = this.getView().byId("d3chart").getDomRef()
			dataset = data.TotalVisitorsByCategory.results;

			var width = 200;

			var dimensions = {
				width: width,
				height: width * 0.6,
				margin: {
					left: 50,
					right: 10,
					top: 30,
					bottom: 50
				}
			};

			dimensions.boundedWidth = width - dimensions.margin.left - dimensions.margin.right;
			dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

			var metricAccessor = function (d) {
					return d.Name;
				},
				yAccessor = function (d) {
					return d.Total
				};

			var svg = d3.select("#" + domRef.id).append("svg")
				.attr("height", dimensions.height)
				.attr("width", dimensions.width);;

			var bounds = svg.append("g")
				.style("transform", `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);

			var xScale = d3.scaleLinear()
				.domain(d3.extent(dataset, metricAccessor))
				.range([0, dimensions.boundedWidth])
				.nice();

			var yScale = d3.scaleLinear()
				.domain(d3.extent(dataset, yAccessor));

			bounds.append("g").data(dataset)
				.enter()
				.append("rect")
				.attr("x", function (d, i) {
					debugger;
				})*/

		},

		_setView: function (aResults) {
			this.getModel("dashboard").setProperty("/bViewBusy", false);

			var that = this,
				aUsers = aResults[0].results,
				aEmUsers = aResults[1].results.map(function (ele) {
					return ele.PODVisitor;
				});

			//set HERE Map and Add user markers
			//TODO:  Marker interation pending
			that._setMap(aUsers, aEmUsers);

			//set DashBoard KPIs
			that._setCharts(aResults[2].results[0]);

		},

		_setMap: function (aUsers, aEmUsers) {
			var oViewModel = this.getModel("dashboard");
			//Set to store unique values 
			var oUserSet = new Set(),
				that = this;

			aEmUsers.forEach(function (ele) {
				oUserSet.add(ele);
			});
			/*	var platform = new H.service.Platform({
					'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
				});
				var maptypes = platform.createDefaultLayers();
				var map = new H.Map(
					this.getView().byId("map").getDomRef(),
					maptypes.vector.normal.map, {
						zoom: 15,
						center: {
							lng: 55.147110,
							lat: 24.962762
						}
					});
				var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

				var ui = H.ui.UI.createDefault(map, maptypes);*/
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
			var html, oCrossAppNav;

			try {
				oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
				window.toApp = function (oUserId) {
					that.Navigate.call(that);
				}
			} catch (err) {
				console.log(err);
			}
			aEmUsers.forEach(function (oUser) {
				if (!!oUser) {
					html = that.getHTMLPart(oCrossAppNav, oUser);
					that.addDraggableMarker(group, html, oUser.Latitude, oUser.Longitude, true);
				}

			});

			aUsers.forEach(function (oUser) {

				if (!(oUserSet.has(oUser))) {
					html = that.getHTMLPart(oCrossAppNav, oUser);
					that.addDraggableMarker(group, html, oUser.Latitude, oUser.Longitude, false);
				}

			});
			
		//	this.bindMapProperties();
			
			oViewModel.setProperty("/bMapBusy", false);
		},
		
		bindMapProperties : function(){
		
		var oView = this.getView();
		
		oView.byId("map").bindProperty("visible", {
		path : "/bHeapMap",
		model : "dashboard",
		formatter : function(bValue) { return !bValue}
		});
		
		oView.byId("heatMap").bindProperty("visible", {
		path : "/bHeapMap",
		model : "dashboard"
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
					if(+(oUser.Latitude) && +(oUser.Longitude))
					{
						heatData.push({lat: +(oUser.Latitude),	lng: +(oUser.Longitude),	value: 0.5});
					}
				}
			});
			
			aEmUsers.forEach(function (oUser) {
				if (!!oUser && +(oUser.Latitude) && +(oUser.Longitude)) {
					heatData.push({lat: +(oUser.Latitude),	lng: +(oUser.Longitude),	value: 1});
				}

			});
			
			heatmapProvider.addData(heatData);
			// Add a layer for the heatmap provider to the map:
			map[0].addLayer(new H.map.layer.TileLayer(heatmapProvider));

		},

		getHTMLPart: function (oCrossAppNav, oUser) {
				if (oCrossAppNav) {
					/*var appHref = oCrossAppNav.hrefForExternal({
						target: {
							semanticObject: "Manage",
							action: "Visitor"
						}

					});*/
					window.toExtFrmdashBoard = function (userid) {
							oCrossAppNav.toExternal({
								target: { shellHash : "Manage-Visitor&/UserSet/" + userid }
							});
						};
						// /, context  : "&/UserSet/" + oUser.Id	
						//{ shellHash : "Manage-Visitor&/UserSet/" + oUser.Id }
						//	appHref = (" href='").concat(appHref, "&/UserSet/", oUser.Id, "'");
				var	appHref = "href='#'  onclick='toExtFrmdashBoard( " + oUser.Id + ")'"
			}
				return "<div style='white-space: nowrap;'  > " + oUser.FirstName + " " +
				oUser.LastName + "<br><a target='_self' " + appHref + ">More details</a> </div>";
		},

		_initMap: function (id) {
			var platform = new H.service.Platform({
				'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
			});
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
		}

	});
});