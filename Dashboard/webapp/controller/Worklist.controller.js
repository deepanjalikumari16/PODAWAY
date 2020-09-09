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
				intent: "#Dashboard-Display"
			}, true);
			},
			onAfterRendering : function(){
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
				bMapBusy : true,
				PODCatergory: [{
					name: "Mobility Impairment",
					value: 1119
				}, {
					name: "Visual Impairment",
					value: 1220
				}, {
					name: "Cognitive Impairment",
					value: 1120
				}, {
					name: "Autism",
					value: 1001
				}, {
					name: "Hearing Impairment",
					value: 1220
				}, {
					name: "Others",
					value: 1120
				}],
				Top5Ratings: [{
					pav: "UAE",
					value: 5,
					votes: 1120
				}, {
					pav: "Belgium",
					value: 5,
					votes: 1120
				}, {
					pav: "Australia",
					value: 5,
					votes: 1120
				}, {
					pav: "India",
					value: 5,
					votes: 1120
				}, {
					pav: "Japan",
					value: 4,
					votes: 1120
				}]

			});

			this.setModel(oDashboardModel, "dashboard");

		},
		_getUsers : function(){
			this.getModel().read("/UserSet", {
				filters: [  new Filter("IsArchived" ,FilterOperator.EQ , false), new Filter("RoleId" , FilterOperator.EQ , "3")   ],
				success : this.loadMap.bind(this)
			});
		},
		loadMap: function (data) {
			var that = this,
			aUsers = data.results;
			
			var oViewModel = this.getModel("dashboard");
			
			var platform = new H.service.Platform({
				'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
			});
			
			
			
			var maptypes = platform.createDefaultLayers();
			var map = new H.Map(
				this.getView().byId("map").getDomRef(),
				maptypes.vector.normal.map, {
					zoom: 15,
					center: {
						lng:  55.147110,
						lat:  24.962762
					}
				});
			var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

			var ui = H.ui.UI.createDefault(map, maptypes);
			
			aUsers.forEach(function(oUser){
					that.addDraggableMarker(map, behavior, oUser.Latitude, oUser.Longitude );
			})
			
			oViewModel.setProperty("/bMapBusy", false);
		

		},
			/** 
		 * 
		 * @param map , Here API map Object	
		 * @param behavior,   HERE map interaction Object API 
		 */
		addDraggableMarker: function (map, behavior, lat, lng) {
			var oViewModel = this.getModel("objectView");

			//restore marker from model
			var marker = new H.map.Marker({
				lng: lng ? +lng : 55.147110,
				lat: lat ? +lat: 24.962762
			}, {
				// mark the object as volatile for the smooth dragging
				volatility: false
			});
			marker.draggable = false;
			map.addObject(marker);
		}

	});
});