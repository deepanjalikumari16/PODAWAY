sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Fragment, Filter, FilterOperator) {
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
		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
			var that = this;
			debugger;
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				//03-DEC-2020 added additional field for attractions
				that._setAttarctionTypeCtrl.call(that);
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
		onDelTheme: function () {
			this.getModel("objectView").setProperty("/oDetails/ThemeId", null);
		},
		/** 
		 * Open Map and choose latitude/longitude for a given facility
		 */
		onMap: function () {

			if (!(this.getModel("appView").getProperty("/bHEREMapsLibLoaded"))) this.loadHERELibs();

			var that = this,
				oViewModel = this.getModel("objectView");

			//Open dialog, if already open once open before
			if (that._oDlgAddOption) {
				//remove all the previous Markers
				if (that.marker) that.map.removeObject(that.marker);
				that.map.setCenter(that._getLocation(), true);
				that.addDraggableMarker(that.map, that.behavior, that._getLocation());
				that._oDlgAddOption.open();
				return;
			}

			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "com.coil.podium.MAEVAT.dialog.HEREMaps",
				controller: that
			}).then(function (oDialog) {

				that._oDlgAddOption = oDialog;
				var oCurrentLocation = this._getLocation(),
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
			//this.getView().byId("MapDialog").destroy();
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

			if (oValidate.IsNotValid) {
				this.showErrorMessageBox(this._fnMsgConcatinator(oValidate.sMsg));
				return;
			}

			function _fnError() {
				oViewModel.setProperty("/busy", false);
			}

			oData.AvoidablePlaces = oData.AvoidablePlaces.map(function (ele) {
				return {
					Id: ele
				};
			});

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
				EventAttractionId: oViewModel.getProperty("/oDetails/Id"),
				IsArchived: false
			});
			oViewModel.refresh();
		},

		onComboBoxChange: function (oEvent) {
			if (oEvent.getParameter("itemPressed") === false) {
				oEvent.getSource().setValue("");
			}
		},

		onDelHighlight: function (oEvent) {
			var oViewModel = this.getModel("objectView");

			oViewModel.setProperty("IsArchived", true, oEvent.getParameter("listItem").getBindingContext("objectView"));

			oViewModel.refresh(true);
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
						"$expand": "Images,Categories,AvoidablePlaces,Plans,AccessibilityDevices,Highlights"
					},
					success: this._setView.bind(this)
				});

			}.bind(this));
		},

		/** 
		 * 
		 * @param map , Here API map Object	
		 * @param behavior,   HERE map interaction Object API 
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
		/** 
		 * 
		 * @constructor set view with data
		 * @param data: will only be there for edit facility scenerios
		 * @returns to terminate further execution
		 */
		_setView: function (data) {
			this._oMessageManager.removeAllMessages();
			//Reset del array 
			this._pendingDelOps = [];
			this._delPlanId = "";
			this.coverImageId = null;
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			if (data) {
				oViewModel.setProperty("/oImages", data.Images.results);
				oViewModel.setProperty("/oPlan", data.Plans.results[0] === undefined ? null : data.Plans.results[0]);

				if (data.AccessibilityDevices.hasOwnProperty("results"))
					data.AccessibilityDevices = data.AccessibilityDevices.results.map(function (ele) {
						return ele.Id;
					});
				else
					data.AccessibilityDevices = [];

				if (data.AvoidablePlaces.hasOwnProperty("results"))
					data.AvoidablePlaces = data.AvoidablePlaces.results.map(function (ele) {
						return ele.Id;
					});
				else
					data.AvoidablePlaces = [];

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
				BuildingId: null,
				EventAttractionTypeId: this.getModel("appView").getProperty("/prefilledType"),
				Latitude: "",
				Longitude: "",
				IsArchived: false,
				Description: "",
				AccessibilityDevices: [],
				AssistiveDevices: [],
				AvoidablePlaces: [],
				Categories: [],
				Title: "",
				Name: "",
				ReferenceLink: "",
				ThemeId: null,
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
				oViewModel = this.getModel("objectView"),
				sCoverImageId = null;
			//	bHasCoverImage = false;

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
				//	if (bHasCoverImage === false) bHasCoverImage = ele.IsCoverImage;
				if (ele.Id === undefined) {
					aProms.push(that._fnCrOp.call(that, "/EventAttractionImageSet", ele));
				} else {
					sCoverImageId = ele.IsCoverImage && !ele.IsArchived ? ele.Id : sCoverImageId;
				}
			});

			if (oViewModel.getProperty("/oPlan") && oViewModel.getProperty("/oPlan/Id") === undefined) {
				var oPlanData = oViewModel.getProperty("/oPlan");
				oPlanData.EventAttractionId = data.Id;
				aProms.push(that._fnCrOp.call(that, "/EventAttractionPlanSet", oPlanData));
			}

			//Collect all request and show success/failure
			Promise.all(aProms)
				//.then(that._fetchCoverImages.bind(that, data.Id))
				.then(function (data1) {

						return new Promise(function (res, rej) {

							/*if(sCoverImageId === undefined)
							{
							var oCoverImage = data1.Images.results.find(function (ele) {
								return  ele.IsArchived === false && ele.IsCoverImage;
							});

							if (data1.Images.results.length > 0)
								oCoverImage = oCoverImage ? oCoverImage.Id : data1.Images.results[0].Id;
							}*/

							if (sCoverImageId) {
								oDataModel.callFunction("/UpdateEventAttractionCoverImage", {
									urlParameters: {
										ImageId: +sCoverImageId,
										EventAttactionId: +data.Id
									},
									success: function () {
										res();
									},
									error: function () {
										rej();
									}
								});
							} else {
								res();
							}
						});
					}

				)
				.then(function () {
						oViewModel.setProperty("/busy", false);
						that._fnSuccessToast.call(that, "MSG_SUCCESS_EVENTDETAILS");
						that.onCancel.apply(that);
					},
					function () {
						oViewModel.setProperty("/busy", false);
					}
				);

		},
		_fetchCoverImages: function (iEventAttractionId) {

			var that = this;
			return new Promise(function (res, rej) {
				var sKey = that.getModel().createKey("/EventAttractionSet", {
					"Id": iEventAttractionId
				});

				that.getModel().read(sKey, {
					urlParameters: {
						"$expand": "Images",
						"$select": "Images"
					},
					success: function (data) {
						res(data);
					}

				});

			});

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
					success: function (data1) {
						that.coverImageId = data1.IsCoverImage ? data1.Id : that.coverImageId;
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
		 * @returns location object
		 */
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
		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
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

		_fnValidate: function (data) {
			this._oMessageManager.removeAllMessages();
			var oReturn = {
					IsNotValid: false,
					sMsg: []
				},
				aCtrlMessage = [];

			if (!(data.EventAttractionTypeId)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("ERR_TYPE_ERROR");
				aCtrlMessage.push({
					message: "ERR_TYPE_ERROR",
					target: "/oDetails/EventAttractionTypeId"
				});
			}

			if (!(data.Title.length)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ERR_TITLE");
				aCtrlMessage.push({
					message: "MSG_ERR_TITLE",
					target: "/oDetails/Title"
				});

			}

			if (!(data.Name.length)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ERR_NAME");
				aCtrlMessage.push({
					message: "MSG_ERR_NAME",
					target: "/oDetails/Name"
				});

			}

			if (!(data.Description.length)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ERR_DSC");
				aCtrlMessage.push({
					message: "MSG_ERR_DSC",
					target: "/oDetails/Description"
				});
			}

			//Lat Lng optional for offers
			if (data.EventAttractionTypeId !== 2) {
				if (+data.Longitude == 0 || +data.Latitude == 0) {
					oReturn.IsNotValid = true;
					oReturn.sMsg.push("MSG_LAT_LNG");
					aCtrlMessage.push({
						message: "MSG_LAT_LNG",
						target: "/oDetails/Longitude"
					});
					aCtrlMessage.push({
						message: "MSG_LAT_LNG",
						target: "/oDetails/Latitude"
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
			}

			if (data.EventAttractionTypeId === 2 && (+data.Latitude < -90 || +data.Latitude > 90)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ERR_LAT");

				aCtrlMessage.push({
					message: "MSG_ERR_LAT",
					target: "/oDetails/Latitude"
				});
			} else if (data.EventAttractionTypeId === 2 && (+data.Longitude < -180 || +data.Longitude > 180)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ERR_LNG");
				aCtrlMessage.push({
					message: "MSG_ERR_LNG",
					target: "/oDetails/Longitude"
				});
			}

			//Redirection link for Offers
			var regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
			var url = data.ReferenceLink;
			if (data.EventAttractionTypeId === 2 && ( !!(data.ReferenceLink) && data.ReferenceLink.length > 0 && !(url.match(regex)))) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("ERR_Invalid_link");
				aCtrlMessage.push({
					message: "ERR_Invalid_link",
					target: "/oDetails/ReferenceLink"
				});
			}

			if (aCtrlMessage.length) this._genCtrlMessages(aCtrlMessage);

			return oReturn;

		},

		_fnMsgConcatinator: function (aMsgs) {
			//	var sFnMsg = "";
			var that = this;
			return aMsgs.map(function (x) {
				return that.getResourceBundle().getText(x);
			}).join("\n");

		},
		_setAttarctionTypeCtrl: function () {
			//this.getOwnerComponent().iEvtType
			var oTypeCtrl = this.getView().byId("dpAttarctiontype");

			oTypeCtrl.bindItems({
				path: "/MasterEventAttractionTypeSet",
				filters: [
					new Filter("IsArchived", FilterOperator.EQ, false),
					new Filter("Id", this.getOwnerComponent().iEvtType === 1 ? FilterOperator.EQ : FilterOperator.NE, 1)
				],
				template: new sap.ui.core.Item({
					key: "{Id}",
					text: "{EventAttractionType}"
				})
			});

		},
		//load HERE Maps Libs in sync
		loadHERELibs: function () {

			this.getModel("appView").setProperty("/bHEREMapsLibLoaded", true);

			jQuery.sap.require("com.coil.podium.MAEVAT.libs.mapsjs-core");
			jQuery.sap.require("com.coil.podium.MAEVAT.libs.mapsjs-service");
			jQuery.sap.require("com.coil.podium.MAEVAT.libs.mapsjs-ui");
			jQuery.sap.require("com.coil.podium.MAEVAT.libs.mapsjs-mapevents");

		}

	});

});