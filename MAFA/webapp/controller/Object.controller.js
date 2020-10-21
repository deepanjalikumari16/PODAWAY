sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/Fragment"

], function (BaseController, JSONModel, formatter, Fragment) {
	"use strict";

	return BaseController.extend("com.coil.podium.MAFA.controller.Object", {

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

			var oViewModel = new JSONModel({
				busy: true,
				oFiles: []
			});
			this.setModel(oViewModel, "objectView");

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched, this);

			/*
			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
		*/
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				oViewModel.setProperty("/busy", false);
			});

		},
		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/* 
		 * Called on delete of file from list
		 * @param oEvent: to retrieve listitem info
		 */
		onDelete: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				oItemBindingContext = oEvent.getParameter("listItem").getBindingContext("objectView"),
				iIndex = +(oItemBindingContext.getPath().match(/(\d+)/)[0]);
			if (oViewModel.getProperty("/sMode") === "E" && oItemBindingContext.getProperty("Id")) {
				this._pendingDelOps.push(oItemBindingContext.getProperty("Id"));
			}

			oViewModel.getProperty("/oFiles").splice(iIndex, 1);
			oViewModel.refresh();

		},
		/* 
		 * 
		 * @param oEvent: having source and file info 
		 */

		onUpload: function (oEvent) {
			var oFile = oEvent.getSource().FUEl.files[0],
				oCtrl = oEvent.getSource();
			// this.getModel("objectView").getProperty("/oFiles").push(oFile);
			this.getImageBinary(oFile).then(this._fnAddFile.bind(this, oCtrl));
		},

		/** 
		 * Open Map and choose latitude/longitude for a given facility
		 */
		onMap: function () {
			var that = this;
			if (!(this.getModel("appView").getProperty("/bHEREMapsLibLoaded"))) this.loadHERELibs();

			//Open dialog, if already open once open before
			if (that._oDlgAddOption) {
				//remove previous Markers
				that.map.removeObject(that.marker);
				//set the center of map
				that.map.setCenter( that._getLocation(), true);
				that.addDraggableMarker(that.map, that.behavior, that._getLocation());
				that._oDlgAddOption.open();
				return;
			}

			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "com.coil.podium.MAFA.dialog.HEREMaps",
				controller: that
			}).then(function (oDialog) {
				that._oDlgAddOption = oDialog;

				var oViewModel = this.getModel("objectView"),
					oCurrentLocation = this._getLocation(),
					platform = new H.service.Platform({
						'apikey': 'BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM'
					});

				// Obtain the default map types from the platform object
				var maptypes = platform.createDefaultLayers();

				// Instantiate (and display) a map object:
				var map = new H.Map(
					document.getElementById("map"),
					maptypes.vector.normal.map, {
						zoom: 15,
						center: {
							lng: oCurrentLocation.lng,
							lat: oCurrentLocation.lat
						}
					});

				that.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

				var ui = H.ui.UI.createDefault(map, maptypes);

				that.map = map;

				// connect dialog to the root view of this component (models, lifecycle)
				that.getView().addDependent(oDialog);
				that.addDraggableMarker(map, that.behavior, oCurrentLocation);
				oDialog.open();
			}.bind(this));

		},

		onCloseMaps: function () {
			this._oDlgAddOption.close();
			//	this.getView().byId("MapDialog").destroy();
		},

		_getLocation: function () {
			var oViewModel = this.getModel("objectView");
			if (+(oViewModel.getProperty("/oDetails/Latitude")) && +(oViewModel.getProperty("/oDetails/Longitude"))) {
				return {
					lat: +(oViewModel.getProperty("/oDetails/Latitude")),
					lng: +(oViewModel.getProperty("/oDetails/Longitude"))
				};
			}

			return {
				lat: +(this.getModel("appView").getProperty("/EventLocation/lat")),
				lng: +(this.getModel("appView").getProperty("/EventLocation/lng"))
			};
		},

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

		/* 
		 * @function
		 * Save edit or create facility details 
		 */
		onSave: function () {
			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails"),
				oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}
			oViewModel.setProperty("/busy", true);

			this.CUOperation(oPayload).then(this._fnUploadImages.bind(this, oViewModel));

		},

		/*
		 * @function
		 * Cancel current object action
		 */
		onCancel: function () {
			this.getRouter().navTo("worklist", true);
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
			this.getModel("objectView").setProperty("/sMode", "E");
			this.getModel("objectView").setProperty("/busy", true);
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("/FacilitySet", {
					Id: sObjectId
				});
				this.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Images"
					},
					success: this._setView.bind(this)
				});

			}.bind(this));
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
		 * @param data: will only be there for edit facility scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {
			//Remove older UI control messages
			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			this._pendingDelOps = [];
			if (data) {
				oViewModel.setProperty("/oFiles", data.Images.results);
				oViewModel.setProperty("/oDetails", data);
				return;
			}
			oViewModel.setProperty("/oFiles", []);
			oViewModel.setProperty("/oDetails", {
				BuildingId: null,
				FacilityTypeId: "",
				Latitude: "",
				Longitude: "",
				IsArchived: false,
				Description: ""
			});

		},

		_fnAddFile: function (oCtrl, oItem) {
			//var base64result = reader.result.split(',')[1];
			var iIndex = oItem.Image.search(",") + 1;
			//	__metadata: {					media_src: oItem.Image				},
			var oImageData = {
				Image: oItem.Image.slice(iIndex),
				FileName: oItem.name,
				FileType: "image/png",
				IsArchived: false
			};
			this.getModel("objectView").getProperty("/oFiles").push(oImageData);
			oCtrl.clear();
			this.getModel("objectView").refresh();
		},

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
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
			this._oMessageManager.removeAllMessages();

			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];
			if (!(data.FacilityTypeId)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_FAC");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_FAC",
					target: "/oDetails/FacilityTypeId"
				});
			}

			if (!data.Description) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_DES");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_DES",
					target: "/oDetails/Description"
				});
			}

			if (+data.Longitude == 0 || +data.Latitude == 0) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_LAT_LNG");
				aCtrlMessage.push({
					message: "MSG_LAT_LNG",
					target: "/oDetails/Latitude"
				});
				aCtrlMessage.push({
					message: "MSG_LAT_LNG",
					target: "/oDetails/Longitude"
				});
			} else if (+data.Latitude < -90 || +data.Latitude > 90) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ERR_LAT");
				aCtrlMessage.push({
					message: "MSG_ERR_LAT",
					target: "/oDetails/Latitude"
				});

			} else if (+data.Longitude < -180 || +data.Longitude > 180) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ERR_LNG");
				aCtrlMessage.push({
					message: "MSG_ERR_LNG",
					target: "/oDetails/Longitude"
				});
			}

			//Removed after feedback from Ankit 23/06/2020	
			/*	if (!data.BuildingId) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDTN_ERR_BUIDLING_ID");
				}*/
			/*	if(this.getModel("objectView").getProperty("/oFiles").length === 0)
				{
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_VALDN_NO_IMGS");
				}*/

			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);

			return oReturn;
		},

		_genCtrlMessages: function (aCtrlMsgs) {
			var that = this,
				oViewModel = that.getModel("objectView");
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
			//	var sFnMsg = "";
			var that = this;
			return aMsgs.map(function (x) {
				return that.getResourceBundle().getText(x);
			}).join("\n");

		},

		/** 
		 * 
		 * @param map , Here API map Object	
		 * @param behavior,   HERE  map interaction Object API 
		 * @param oCurrentLocation, marker latitude/longitude
		 */
		addDraggableMarker: function (map, behavior, oCurrentLocation) {
			var oViewModel = this.getModel("objectView");
			var marker = new H.map.Marker({
				lng: oCurrentLocation.lng,
				lat: oCurrentLocation.lat
			}, {
				// mark the object as volatile for the smooth dragging
				volatility: true
			});
			// Ensure that the marker can receive drag events
			marker.draggable = true;

			this.marker = marker;

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

		CUOperation: function (oPayload) {
			var oViewModel = this.getModel("objectView");
			delete oPayload.FacilityType;
			delete oPayload.Images;
			var oClonePayload = $.extend(true, {}, oPayload),
				that = this;

			oClonePayload.BuildingId = +oClonePayload.BuildingId;

			return new Promise(function (res, rej) {
				if (oViewModel.getProperty("/sMode") === "E") {
					var sKey = that.getModel().createKey("/FacilitySet", {
						Id: oClonePayload.Id
					});
					that.getModel().update(sKey, oClonePayload, {
						success: function () {
							oViewModel.setProperty("/busy", false);
							that.showToast.call(that, "MSG_SUCCESS_UPDATE");
							res(oClonePayload);
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}
					});
				} else {
					oClonePayload.FacilityTypeId = +oClonePayload.FacilityTypeId;

					that.getModel().create("/FacilitySet", oClonePayload, {
						success: function (data) {
							oViewModel.setProperty("/busy", false);
							that.showToast.bind(that, "MSG_SUCCESS_CREATE");
							res(data);
						},
						error: function () {
							oViewModel.setProperty("/busy", false);
							rej();
						}

					});
				}

			});
		},
		_fnUploadImages: function (oViewModel, data) {
			//	debugger;

			var aFiles = oViewModel.getProperty("/oFiles"),
				aProms = [],
				that = this,
				FacilityId = oViewModel.getProperty("/sModel") === "C" ? data.Id : oViewModel.getProperty("/oDetails/Id");
			aFiles.forEach(function (ele) {
				if (ele.Id === undefined) {
					ele.FacilityId = FacilityId;
					aProms.push(that._fnUploadFile(ele));
				}
			});

			if (this._pendingDelOps.length) {
				this._pendingDelOps.forEach(
					function (ele) {
						aProms.push(that._fnDeleteFile.call(that, ele));
					});
			}

			oViewModel.setProperty("/busy", true);
			Promise.all(aProms).then(
				function () {
					oViewModel.setProperty("/busy", false);
					that.showToast("MSG_SUCCESS_IMG_UPLAOD");
					that.onCancel();
				}
			);

		},

		_fnDeleteFile: function (iId) {
			var that = this;

			return new Promise(function (res, rej) {
				var sKey = that.getModel().createKey("/FacilityImageSet", {
					Id: iId
				});
				that.getModel().update(sKey, {
					IsArchived: true
				}, {
					success: function () {
						res();
					}
				});

			});
		},

		_fnUploadFile: function (data) {
			var that = this;
			return new Promise(function (res, rej) {
				that.getModel().create("/FacilityImageSet", data, {
					success: function () {
						res();
					}

				});

			});

		},
		//load HERE Maps Libs in sync
		loadHERELibs: function () {

			this.getModel("appView").setProperty("/bHEREMapsLibLoaded", true);

			jQuery.sap.require("com.coil.podium.MAFA.libs.mapsjs-core");
			jQuery.sap.require("com.coil.podium.MAFA.libs.mapsjs-service");
			jQuery.sap.require("com.coil.podium.MAFA.libs.mapsjs-ui");
			jQuery.sap.require("com.coil.podium.MAFA.libs.mapsjs-mapevents");

		}

	});

});