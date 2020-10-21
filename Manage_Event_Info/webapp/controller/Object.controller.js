sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	
	//---- HERE Maps API , add AMD libraries above------	
	"../libs/mapsjs-core",
	"../libs/mapsjs-service",
	"../libs/mapsjs-ui",
	"../libs/mapsjs-mapevents"
], function (BaseController, JSONModel, formatter, Fragment,Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("com.coil.podium.Manage_Event_Info.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0,
					Highlights: []
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			var myModel = this.getOwnerComponent().getModel();
			myModel.setSizeLimit(999);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("objectView"),
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

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var that = this;
			that.getModel("objectView").setProperty("/sMode", "E");
			that.getModel("objectView").setProperty("/busy", true);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			that.getModel().metadataLoaded().then(function () {
				var sObjectPath = that.getModel().createKey("/EventInfoSet", {
					Id: sObjectId
				});
				that.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Highlights"
					},
					// success: this._setView.bind(this)
					success: function (data) {
						that._setView.call(that, data);
					}
				});
			}.bind(that));
		},

		/** 
		 * Match for create route trigger
		 * @function 
		 */
		_onCreateObjectMatched: function () {
			this.getModel("objectView").setProperty("/sMode", "C");
			this.getModel("objectView").setProperty("/busy", true);
			this._setView();
		},

		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit Event scenerios
		 * @returns to terminate further execution
		 */
		 
		_setView: function (data) {
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			if (data) {

				oViewModel.setProperty("/oDetails", data);
				oViewModel.setProperty("/oDetails/Highlights", data.Highlights.results);

				/*function explicitFireChange() {
					if (this.getView().byId("CountryDropdownId").getSelectedItem() === null) {
						setTimeout(explicitFireChange.bind(this), 2000);
						return;
					}
					this.getView().byId("CountryDropdownId").fireChange({
						selectedItem: this.getView().byId("CountryDropdownId").getSelectedItem()
					});
				};

				explicitFireChange.call(this);*/
			/*	
				this.getView().byId("CountryDropdownId").fireChange({
					//	selectedItem: this.getView().byId("CountryDropdownId").getSelectedItem()
					value : data.CountryId ,         
					itemPressed : false
					
				});*/
		
				//TimeZoneFlow
			
				this.setInitTimeZones(data.CountryId);
				
				

//				oViewModel.setProperty("/oDetails", data);
				return;
			}
			// oViewModel.setProperty("/oHighlights", []);
			oViewModel.setProperty("/oDetails", {
				Name: "",
				StartDate: "",
				EndDate: "",
				StartTime: "",
				EndTime: "",
				Url: "",
				Location: "",
				Latitude: "",
				Longitude: "",
				CountryId: "",
				TimezoneId: "",
				Title: "",
				Description: "",
				Highlights: [],
				IsArchived: false
			});

		},
		
		_fnbusyItems: function (oEvent) {
			var oViewModel = this.getModel("objectView");
			if (oEvent.getId() === "dataRequested") {
				oViewModel.setProperty("/bTimeZonesItemsBusy", true);
			} else {
				oViewModel.setProperty("/bTimeZonesItemsBusy", false);
			}

		},
		
		bindTimeZoneCtrl : function(sIsoCode){
		
		var oCtrl = this.getView().byId("TimezoneDropdownId");
		
		oCtrl.bindItems({
				template: new sap.ui.core.Item({
					key : "{Id}",
					text : "{ZoneName}"
				}),
				path: "/MasterTimezoneSet",
				events: {
					dataRequested: this._fnbusyItems.bind(this),
					dataReceived: this._fnbusyItems.bind(this)
				},
				filters: [ new Filter("IsArchived", FilterOperator.EQ, false), new Filter("CountryCode", FilterOperator.EQ, sIsoCode)	],
				templateShareable: true
			});
			
		},
		
		setInitTimeZones : function(sCountryId){
			this._fnbusyItems({
					getId : function(){return "dataRequested" ;}
				});
			var sKey = this.getModel().createKey("/MasterCountrySet", {
				Id :  sCountryId
			});
			var that = this;
			this.getModel().read(sKey, {
				success : function(data){
					that.bindTimeZoneCtrl(data.IsoCode);
				}
			})
		},
		/** 
		 * Open Map and choose latitude/longitude for a given facility
		 */
		onMap: function () {
			var that = this;
			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "com.coil.podium.Manage_Event_Info.dialog.HEREMaps",
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
			var oViewModel = this.getModel("objectView");
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
					oViewModel.setProperty("/oDetails/Longitude", target.getGeometry().lng.toString());
					oViewModel.setProperty("/oDetails/Latitude", target.getGeometry().lat.toString());
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

		/* 
		 * @function
		 * Save edit or create Event Info details 
		 */
		onSave: function () {
			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");
			var oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}
			oViewModel.setProperty("/busy", true);
			this.CUOperation(oPayload);
		},

		onCountryChange: function (oEvent) {
			
	/*		var oSelectedItem = oEvent.getSource().getSelectedItem();
			var oObject = oSelectedItem.getBindingContext().getObject();
			this.getModel("objectView").setProperty("/oDetails/CountryId", oObject.Id);
			var aTimezones = [];
			var selectedTimezoneId = this.getModel("objectView").getProperty("/oDetails/TimezoneId");
			var isFound = false;

			for (var i = 0; i < oObject.Timezones.__list.length; i++) {
				var sPath = oObject.Timezones.__list[i];
				aTimezones.push(this.getModel().getData("/" + sPath));
				if (selectedTimezoneId == aTimezones[i].Id) {
					isFound = true;
				}
			}
			if (isFound == false && aTimezones.length > 0) {
				// this.getModel("objectView").setProperty("/oDetails/TimezoneId", null);
			// 	this.getModel("objectView").refresh();
				this.getModel("objectView").setProperty("/oDetails/TimezoneId", aTimezones[0].Id);
			}
			this.getModel("objectView").setProperty("/aTimezones", aTimezones);*/
			var oSelectedItem = oEvent.getSource().getSelectedItem();
			var oObject = oSelectedItem.getBindingContext().getObject();
			this.bindTimeZoneCtrl(oObject.IsoCode);
			this.getModel("objectView").setProperty("/oDetails/TimezoneId", null);
		},

		onUrlValidate: function () {
			var url = this.getView().byId("urlInput").getValue();
			var regex =
				/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
			if (url.match(regex)) {} else {
				this.showToast.call(this, "MSG_INVALID_URL");
			}
		},

		addHighligt: function () {
			this.getModel("objectView").getData().oDetails.Highlights.push({
				Highlight: "",
				IsArchived: false
			});
			this.getModel("objectView").refresh();
		},

		handleDelete: function (oEvent) {
			var iIndex = +(oEvent.getParameter("listItem").getBindingContextPath().match(/\d+/g));
			if (this.getModel("objectView").getData().sMode === "C" || !this.getModel("objectView").getData().oDetails.Highlights[iIndex].Id) {
				this.getModel("objectView").getData().oDetails.Highlights.splice(iIndex, 1);
			} else {
				this.getModel("objectView").getData().oDetails.Highlights[iIndex].IsArchived = true;
			}
			this.getModel("objectView").refresh();
		},

		/*
		 * @function
		 * Cancel current object action
		 */
		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},

		/*
		 * To validate values of payload
		 * @constructor  
		 * @param data : data to be tested upon
		 * @returns Object
		 * @param IsNotValid : true for failed validation cases
		 * @param sMsg : Warning message to be shown for validation error
		 * 
		 * 
		 */
		_fnValidation: function (data) {
			var oReturn = {
				IsNotValid: false,
				sMsg: [],
			};

			var url = data.Url,
				regex =
				/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

			if (data.Name === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter Name");
			} else if (data.StartDate === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter Start Date");
			} else if (data.EndDate === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter End Date");
			} else if (data.EndDate !== "" && data.EndDate < data.StartDate) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("End date should be greater than or equal to Start date");
			} else if (data.StartTime === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter Start Time");
			} else if (data.EndTime === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter End Time");
			} else if (data.EndTime !== "" && data.EndDate === data.StartDate) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("End time should be greater than Start time");
			} else if (data.Url !== "" && !url.match(regex)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter valid URL");
			} else if (+data.Latitude < -90 || +data.Latitude > 90) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Latitude must be between -90 and 90 degrees inclusive.");
			} else if (+data.Longitude < -180 || +data.Longitude > 180) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Longitude must be between -180 and 180 degrees inclusive.");
			} else if (data.Longitude === "" || data.Latitude === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Enter a valid Latitude or Longitude!");
			} else if (data.CountryId === "") {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("Please enter Country");
			}
			if (data.Highlights !== null && data.Highlights.length > 0) {
				var error = false;
				for (var i = 0; i < data.Highlights.length; i++) {
					var oHighlight = data.Highlights[i];
					if (oHighlight.Highlight === "" && error === false) {
						oReturn.IsNotValid = true;
						error = true;
						oReturn.sMsg.push("Dont save with empty Highlight");
					}
				}
			}
			return oReturn;
		},

		_fnMsgConcatinator: function (aMsgs) {
			var that = this;
			return aMsgs.map(function (x) {
				return that.getResourceBundle().getText(x);
			}).join("");
		},

		CUOperation: function (oPayload) {
			var oViewModel = this.getModel("objectView");
			delete oPayload.Country;
			delete oPayload.Images;
			delete oPayload.Timezone;
			var oClonePayload = $.extend(true, {}, oPayload),
				that = this;

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sMode") === "E") {
					// oClonePayload.Highlights = oClonePayload.Highlights.results;
					if (oClonePayload.Highlights !== null && oClonePayload.Highlights.length > 0) {
						for (var i = 0; i < oClonePayload.Highlights.length; i++) {
							var oHighlight = oClonePayload.Highlights[i];
							delete oHighlight.__metadata;
							delete oHighlight.EventInfo;
						}
					}
					var sKey = that.getModel().createKey("/EventInfoSet", {
						Id: oClonePayload.Id
					});
					that.getModel().update(sKey, oClonePayload, {
						success: function () {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_UPDATE");
							res(oClonePayload);
							// that.onCancel();
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				} else {
					that.getModel().create("/EventInfoSet", oClonePayload, {
						success: function (data) {
							oViewModel.setProperty("/busy", false);
							that.getRouter().navTo("worklist", true);
							that.showToast.call(that, "MSG_SUCCESS_CREATE");
							res(data);
							// that.onCancel();
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				}

			});
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.Id,
				sObjectName = oObject.Name;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#ManageEventInfo-display&/EventInfoSet/" + sObjectId
			});

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		}

	});

});