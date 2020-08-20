sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/Fragment",
	//---- HERE Maps API , add AMD libraries above------	
	"../libs/mapsjs-core",
	"../libs/mapsjs-service",
	"../libs/mapsjs-ui",
	"../libs/mapsjs-mapevents"
], function (BaseController, JSONModel, formatter, Fragment) {
	"use strict";

	return BaseController.extend("com.coil.podium.MAEVAT.controller.Object", {

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
					sMode: "C"
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

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/** 
		 * 
		 * @param oEvent: having source and file info 
		 */
		onUpload: function (oEvent) {
			var oFile = oEvent.getSource().FUEl.files[0],
				oCtrl = oEvent.getSource();
			this.getImageBinary(oFile).then(this._fnAddFile.bind(this, oCtrl));
		},
		/* 
		 * Called on delete of file from list
		 * @param oEvent: to retrieve listitem info
		 */
		onDelete: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				oItemBindingContext = oEvent.getParameter("listItem").getBindingContext("objectView"),
				iIndex = +(oItemBindingContext.getPath().match(/(\d+)/)[0]);
			if (oViewModel.getProperty("/sMode") === "E" && oItemBindingContext.getProperty("Id") !== undefined) {
				this._pendingDelOps.push(oItemBindingContext.getProperty("Id"));
			}

			oViewModel.getProperty("/oImages").splice(iIndex, 1);
			oViewModel.refresh();

		},
		/** 
		 * Open Map and choose latitude/longitude for a given facility
		 */
		onMap: function () {
			var that = this,
				oViewModel = this.getModel("objectView");
			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "com.coil.podium.MAEVAT.dialog.HEREMaps",
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
							lng: oViewModel.getProperty("/oDetails/Longitude") ? +oViewModel.getProperty("/oDetails/Longitude") : 55.147110,
							lat: oViewModel.getProperty("/oDetails/Latitude") ? +oViewModel.getProperty("/oDetails/Latitude") : 24.962762
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
		onSave: function () {
			var oViewModel = this.getModel("objectView"),
				oData = $.extend(true, {}, oViewModel.getProperty("/oDetails"));

			var oValidate = this._fnValidate(oData);

			if (!(oValidate.status)) {
				this.showWarning(oValidate.sMsg, null, "error");
				return;
			}

			function _fnError() {
				oViewModel.setProperty("/busy", false);
			}

			oData.AccessibilityDevices = oData.AccessibilityDevices.map(function (ele) {
				return {
					Id: ele
				};
			});

			oData.Categories = oData.Categories.map(function (ele) {
				return {
					Id: ele
				};
			});

			oViewModel.setProperty("/busy", true);
			this._fnCallMainSet(oData, oViewModel.getProperty("/sMode") === "C").then(this._fnUploadFiles.bind(this), _fnError);
		},

		/*
		 * @function
		 * Cancel current object action
		 */
		onCancel: function () {
			this.getRouter().navTo("worklist", true);
		},

		onDeletePlan: function () {
			var oViewModel = this.getModel("objectView");
			if (oViewModel.getProperty("/oPlan") && oViewModel.getProperty("/oPlan/Id") !== undefined) {
				this._delPlanId = oViewModel.getProperty("/oPlan/Id");
			}
			oViewModel.setProperty("/oPlan", null);
		},

		onLnkPlan: function () {
			// TODO: Show plan image in dialog

		},
		onAddHighlight: function () {
			var oViewModel = this.getModel("objectView");
			if (!(oViewModel.getProperty("/oDetails/Highlights"))) oViewModel.setProperty("/oDetails/Highlights", []);
			oViewModel.getProperty("/oDetails/Highlights").push({
				Highlight: "",
				EventAttractionId : oViewModel.getProperty("/oDetails/Id")
			});
			oViewModel.refresh();
		},
		onDelHighlight: function (oEvent) {
			var oViewModel = this.getModel("objectView"),
				iIndex = +(oEvent.getParameter("listItem").getBindingContext("objectView").sPath.match(/\d+/)[0]);
			oViewModel.getProperty("/oDetails/Highlights").splice(iIndex, 1);
			oViewModel.refresh();
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
				var sObjectPath = this.getModel().createKey("/EventAttractionSet", {
					Id: sObjectId
				});
				this.getModel().read(sObjectPath, {
					urlParameters: {
						"$expand": "Images,Categories,Plans,AccessibilityDevices"
					},
					success: this._setView.bind(this)
				});

			}.bind(this));
		},
		/** 
		 * 
		 * @param map , Here API map Object	
		 * @param behavior,   HERE map interaction Object API 
		 */
		addDraggableMarker: function (map, behavior) {
			var oViewModel = this.getModel("objectView");

			//restore marker from model
			var marker = new H.map.Marker({
				lng: oViewModel.getProperty("/oDetails/Longitude") ? +oViewModel.getProperty("/oDetails/Longitude") : 55.147110,
				lat: oViewModel.getProperty("/oDetails/Latitude") ? +oViewModel.getProperty("/oDetails/Latitude") : 24.962762
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
		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit facility scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {
			//Reset del array 
			this._pendingDelOps = [];
			this._delPlanId = "";

			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			if (data) {
				oViewModel.setProperty("/oImages", data.Images.results);
				oViewModel.setProperty("/oPlan", data.Plans.results[0] === undefined ? null : data.Plans.results[0]);
				data.AccessibilityDevices = data.AccessibilityDevices.results.map(function (ele) {
					return ele.Id;
				});
				//Categories
				data.Categories = data.Categories.results.map(function (ele) {
					return ele.Id;
				});

				data.Highlights = data.Highlights.results;

				oViewModel.setProperty("/oDetails", data);
				return;
			}
			oViewModel.setProperty("/oImages", []);
			oViewModel.setProperty("/oPlan", null);
			oViewModel.setProperty("/oDetails", {
				BuildingId: "",
				EventAttractionTypeId: this.getOwnerComponent().iEvtType,
				Latitude: "",
				Longitude: "",
				IsArchived: false,
				Description: "",
				AccessibilityDevices: [],
				Categories: [],
				Title: "",
				ThemeId: -1,
				//Issue #18, Manage Event Attraction: Add and edit there is no option to add highlights
				Highlights: []

			});

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

		_fnAddFile: function (oCtrl, oItem) {
			var iIndex = oItem.Image.search(",") + 1;
			//EventAttractionId, IsCoverImage
			if (oCtrl.getButtonOnly()) {
				var oImageData = {
					Image: oItem.Image.slice(iIndex),
					FileName: oItem.name,
					FileType: "image/png",
					IsArchived: false,
					IsCoverImage: false
				};
				this.getModel("objectView").getProperty("/oImages").push(oImageData);
			} else {
				this.getModel("objectView").setProperty("/oPlan", {
					Plan: oItem.Image.slice(iIndex),
					FileName: oItem.name,
					IsArchived: false
				});
			}

			oCtrl.clear();
			this.getModel("objectView").refresh();
		},

		_fnCallMainSet: function (data, bIsCreate) {
			var bCreate = bIsCreate,
				oData = data;
			var that = this;
			return new Promise(function (res, rej) {
				if (bCreate) {
					that.getModel().create("/EventAttractionSet", oData, {
						success: function (data1) {
							res(data1);
						},
						error: function () {
							rej();
						}
					});
				} else {
					delete oData.Plans;
					delete oData.Images;
					delete oData.EventAttractionType;
					//	delete oData.Building;
					//	delete oData.Highlights;
					delete oData.HighlightsTitle;
					delete oData.__metadata;
					delete oData.UpdatedAt;
					delete oData.CreatedAt;

					var sKey = that.getModel().createKey("/EventAttractionSet", {
						"Id": oData.Id
					});
					that.getModel().update(sKey, oData, {
						success: function () {
							res(oData);
						},
						error: function () {
							rej();
						}
					});
				}
			});
		},
		_fnUploadFiles: function (data) {
			var aProms = [],
				that = this,
				oDataModel = this.getModel(),
				oViewModel = this.getModel("objectView");

			//Deletion Operation : if Any
			if (this._pendingDelOps.length) {
				this._pendingDelOps.forEach(function (ele) {
					aProms.push(that._fnDelOp(oDataModel, "/EventAttractionImageSet", ele));
				});

			}
			if (this._delPlanId.length) {
				aProms.push(that._fnDelOp(oDataModel, "/EventAttractionPlanSet", this._delPlanId));
			}

			//Upload Files check if Id is present
			oViewModel.getProperty("/oImages").forEach(function (ele) {
				ele.EventAttractionId = data.Id;
				if (ele.Id === undefined) {
					aProms.push(that._fnCrOp.call(that, "/EventAttractionImageSet", ele));
				}

			});

			if (oViewModel.getProperty("/oPlan") && oViewModel.getProperty("/oPlan/Id") === undefined) {
				var oPlanData = oViewModel.getProperty("/oPlan");
				oPlanData.EventAttractionId = data.Id;
				aProms.push(that._fnCrOp.call(that, "/EventAttractionPlanSet", oPlanData));
			}

			//collect all request and show success/failure
			Promise.all(aProms).then(
				function () {
					oViewModel.setProperty("/busy", false);
					that.onCancel.apply(that);
					that._fnSuccessToast.call(that, "MSG_SUCCESS_EVENTDETAILS");
				},
				function () {
					oViewModel.setProperty("/busy", false);
				}
			);

		},
		/** 
		 * 
		 * @constructor 
		 * @param oDataModel ODATAMODEL instance
		 * @param sEntitySet Entityset path
		 * @param sId Id to be removed/archived
		 * @returns Promise to be resolved/rejected
		 */
		_fnDelOp: function (oDataModel, sEntitySet, sId) {
			var ssEntitySet = sEntitySet,
				ssId = sId,
				oODataModel = oDataModel;

			return new Promise(function (res, rej) {
				var sKey = oODataModel.createKey(ssEntitySet, {
					Id: ssId
				});
				oODataModel.update(sKey, {
					"IsArchived": true
				}, {
					success: function () {
						res();
					},
					error: function () {
						rej();
					}
				});
			});

		},
		/** 
		 * 
		 * @constructor 
		 * @param sEntitySet Entityset path
		 * @param data to be created against path
		 * @returns Promise to be resolved/rejected
		 */
		_fnCrOp: function (sEntitySet, data) {
			var that = this,
				ssEntitySet = sEntitySet,
				oData = data;
			return new Promise(function (res, rej) {
				that.getModel().create(ssEntitySet, oData, {
					success: function () {
						res();
					},
					error: function () {
						rej();
					}
				});
			});

		},

		_fnValidate: function (data) {
			//	var oValidate = { status : true , sMsg : "" }
			if (!(data.Highlights.every(function (ele) {
					return !!(ele.Highlight);
				}))) {
				return {
					status: false,
					sMsg: "ERR_HIGHLIGHTS"
				};
			}
			if (!(data.Title.length)) {
				return {
					status: false,
					sMsg: "MSG_ERR_TITLE"
				};
			}
			//add Validations here
			return {
				status: true,
				sMsg: ""
			};

		}

	});

});