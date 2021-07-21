sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/ui/core/Fragment"

], function (Controller, UIComponent, mobileLibrary, Fragment) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("com.coil.podway.ManageVisitor.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/*
		 * 
		 * @constructor 
		 * @param aItems, all Accessiblity items Array
		 * @param sType, Accessiblity to be filters for
		 * @returns commma (,) sperated string Accessiblity items text
		 */
		AccessibiltyItems: function (aItems, sType) {
			if (!aItems || !aItems.length) {
				return "";
			}
			return aItems.filter(
				function (ele) {
					if (ele.AccessiblityItem == null) {
						return false;
					}
					return ele.AccessiblityItem.AccessibilityId === +sType;
				}).map(function (ele) {
				return ele.AccessiblityItem.Title;
			}).join(",");
		},

		getPodLocation: function (oCtrl) {
			//get the correct model name
			var sModel = this.getModel("worklistView") ? "worklistView" : "objectView",
				oBindingContext = oCtrl.getBindingContext(sModel)

			return {
				lat: oBindingContext.getProperty("Latitude") ? oBindingContext.getProperty("Latitude") : "24.962762",
				lng: oBindingContext.getProperty("Longitude") ? oBindingContext.getProperty("Longitude") : "55.147110"
			};
		},

		onNavigate: function (oEvent) {
			
			if(!(this.getModel("appView").getProperty("/bHEREMapsLibLoaded") )) this.loadHERELibs();
			
			var that = this,
				oLatLong = this.getPodLocation(oEvent.getSource());
			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "com.coil.podway.ManageVisitor.dialog.HEREMaps",
				controller: that
			}).then(function (oDialog) {
				// connect dialog to the root view of this component (models, lifecycle)
				var platform = new H.service.Platform({
					'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
				});
				// Obtain the default map types from the platform object
				var maptypes = platform.createDefaultLayers();
			//IMP: FIX to be use for normal.map error ...
			/*	maptypes.vector.normal.map.getProvider().setStyle(
					new H.map.Style('https://js.api.here.com/v3/3.1/styles/omv/normal.day.yaml')
				);*/
			// Instantiate (and display) a map object:
				var map = new H.Map(
					document.getElementById("map"),
					maptypes.vector.normal.map, {
						zoom: 15,
						center: {
							lng: +(that.getModel("appView").getProperty("/EventLocation/lng")),
							lat: +(that.getModel("appView").getProperty("/EventLocation/lat"))
						}
					});

				var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

				var ui = H.ui.UI.createDefault(map, maptypes);

				var oCordinates = {
					Expo: that.getModel("appView").getProperty("/EventLocation/lat").concat(",", that.getModel("appView").getProperty(
						"/EventLocation/lng")),
					Pod: oLatLong.lat.toString().concat(",", oLatLong.lng)
				}

				that.calcRoute(platform, map, oCordinates);

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
		calcRoute: function (platform, map, oCordinates) {
			var that = this;
			var router = platform.getRoutingService();
			var routeRequestParams = {
				mode: 'shortest;pedestrian',
				representation: 'display',
				routeattributes: 'waypoints,summary,shape,legs',
				maneuverattributes: 'direction,action',
				waypoint0: oCordinates.Expo,
				waypoint1: oCordinates.Pod
			};

			function onSuccess(result) {
				// ensure that at least one route was found
				try {
					var route = result.response.route[0];
					/*
					 * The styling of the route response on the map is entirely under the developer's control.
					 * A representitive styling can be found the full JS + HTML code of this example
					 * in the functions below:
					 */
					that.addRouteShapeToMap(route, map);
					that.addManueversToMap(route, map);
				} catch (err) {
					sap.m.MessageToast.show("Could not found route.");
					console.log(err);
				}
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
		addDraggableMarker: function (map, behavior, oLatlong) {
			var marker = new H.map.Marker({
				lng: +oLatlong.lng,
				lat: +oLatlong.lat
			}, {
				// mark the object as volatile for the smooth dragging
				volatility: false
			});
			map.addObject(marker);
		},
		
		//load HERE Maps Libs in sync
		loadHERELibs: function () {
			
			this.getModel("appView").setProperty("/bHEREMapsLibLoaded" ,  true);
			
			jQuery.sap.require("com.coil.podway.ManageVisitor.libs.mapsjs-core");
			jQuery.sap.require("com.coil.podway.ManageVisitor.libs.mapsjs-service");
			jQuery.sap.require("com.coil.podway.ManageVisitor.libs.mapsjs-ui");
			jQuery.sap.require("com.coil.podway.ManageVisitor.libs.mapsjs-mapevents");
		
		},

		/**
		 * Adds a history entry in the FLP page history
		 * @public
		 * @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		 * @param {boolean} bReset If true resets the history before the new entry is added
		 */
		addHistoryEntry: (function () {
			var aHistoryEntries = [];

			return function (oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function (oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})()

	});

});