sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	//---- HERE Maps API , add AMD libraries above------	
	"../libs/mapsjs-core",
	"../libs/mapsjs-service",
	"../libs/mapsjs-ui",
	"../libs/mapsjs-mapevents"
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
				intent: "#Dashboard-display"
			}, true);
		},
		onAfterRendering: function () {
			this.getModel().metadataLoaded().then(this._getUsers.bind(this));
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onObject: function () {
			this.getRouter().navTo("object");
		},
		/* =========================================================== */
		/* Internal function                                           */
		/* =========================================================== */
		setLocalModel: function () {

			var oDashboardModel = new JSONModel({
				bMapBusy: true
			});

			this.setModel(oDashboardModel, "dashboard");

		},
		
		Navigate: function(oEvent){
			var oNavigationHandler = new sap.ui.generic.app.navigation.service.NavigationHandler(BaseController);
			var sSemanticObject = "Manage";
			var sActionName = "Assignment";
				
			var fnOnError = function(a){
				console.log(a);
			}
			
				
			oNavigationHandler.navigate(sSemanticObject, sActionName, {}, {} , fnOnError);
		},
		
		_getUsers: function () {
			var aPromises = [],
				that = this;
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
			oViewModel.setProperty("/EmergecnyIncidents", data.TotalAssignmentsByIncidentType.results[0].Total );
			
			var TotalIncidents = 0;
			
			data.TotalAssignmentsByIncidentType.results.forEach(function(ele){
				TotalIncidents += ele.Total;
			})
			oViewModel.setProperty("/TotalIncidents", TotalIncidents);
			oViewModel.setProperty("/TotalAssignments", data.TotalAssignments);
			oViewModel.setProperty("/PODByCatrgory", data.TotalVisitorsByCategory.results);
			oViewModel.setProperty("/AssignmentStatues", {
				pending : data.TotalAssignmentsByStatus.results[0].Total ,
				inprogress: data.TotalAssignmentsByStatus.results[1].Total  ,
				completed: data.TotalAssignmentsByStatus.results[2].Total ,
				cancelled : data.TotalAssignmentsByStatus.results[3].Total 
			});
			
		
		},
		_setD3Chart: function (data) {
			debugger;
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


			var metricAccessor = function(d){ return d.Name; },
				yAccessor = function(d){return d.Total};
				
			var svg = d3.select("#" + domRef.id).append("svg")
												.attr("height", dimensions.height)
                                				.attr("width", dimensions.width);;
			
			var bounds = svg.append("g")
							.style("transform" ,`translate(${dimensions.margin.left}px,${dimensions.margin.top}px)` );
				
			var xScale = d3.scaleLinear()
                      .domain(d3.extent(dataset, metricAccessor))
                      .range([0, dimensions.boundedWidth])
                      .nice();
            
            var yScale = d3.scaleLinear()
            			   .domain(d3.extent(dataset, yAccessor));
           
        	bounds.append("g").data(dataset)
        					  .enter()
        					  .append("rect")
        					  .attr("x", function(d,i){debugger;}  )
			
		},

		_setView: function (aResults) {
			
			//Insert MockData ~~~ Removal after service restore
			
			//End 
			
			var that = this,
				aUsers = aResults[0].results,
				aEmUsers = aResults[1].results.map(function (ele) {
					return ele.PODVisitor;
				});

			//set HERE Map and Add user markers
			//TODO:  Marker interation pending
			this._setMap(aUsers, aEmUsers);

			//set DashBoard KPIs
			this._setCharts(aResults[2].results[0]);

		},

		_setMap: function (aUsers, aEmUsers) {
			var oViewModel = this.getModel("dashboard");
			//Set to store unique values 
			var oUserSet = new Set(),
				that = this;

			aEmUsers.forEach(function (ele) {
				oUserSet.add(ele);
			});
			var platform = new H.service.Platform({
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

			var ui = H.ui.UI.createDefault(map, maptypes);

			aEmUsers.forEach(function (oUser) {
				if (!!oUser)
					that.addDraggableMarker(map, behavior, oUser.Latitude, oUser.Longitude, true);
			});

			aUsers.forEach(function (oUser) {
				if (!(oUserSet.has(oUser)))
					that.addDraggableMarker(map, behavior, oUser.Latitude, oUser.Longitude, false);
			});

			oViewModel.setProperty("/bMapBusy", false);
		},

		/** 
		 * 
		 * @param map , Here API map Object	
		 * @param behavior,   HERE map interaction Object API 
		 */
		addDraggableMarker: function (map, behavior, lat, lng, isEmergency) {
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
				map.addObject(marker);
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
				FilterOperator.EQ, false) , new Filter("ServiceType/IncidentType/IncidentType", FilterOperator.EQ, "Emergency") ];
		}

	});
});