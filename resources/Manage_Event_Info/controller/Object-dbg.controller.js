jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-core");
jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-service");
jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-ui");
jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-mapevents");

sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

	//---- HERE Maps API , add AMD libraries above------	
	// "../libs/mapsjs-core",
	// "../libs/mapsjs-service",
	// "../libs/mapsjs-ui",
	// "../libs/mapsjs-mapevents"
], function (BaseController, JSONModel, formatter, Fragment, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.coil.podway.Manage_Event_Info.controller.Object", {

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

		onAfterRendering: function () {
			//Init Validation framework
			this._initMessage();
		},

		_initMessage: function () {
			//MessageProcessor could be of two type, Model binding based and Control based
			//we are using Model-binding based here
			var oMessageProcessor = this.getModel("objectView");
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(oMessageProcessor);
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
						"$expand": "Images,Highlights"
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
			//Remove older UI control messages
			this._oMessageManager.removeAllMessages();
			//Reset del array 
			this._pendingDelOps = [];
			
			var oViewModel = this.getModel("objectView");
			oViewModel.setProperty("/busy", false);
			if (data) {
				oViewModel.setProperty("/oImages", data.Images.results);
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
				HighlightsTitle: "",
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

		bindTimeZoneCtrl: function (sIsoCode) {

			var oCtrl = this.getView().byId("TimezoneDropdownId");

			oCtrl.bindItems({
				template: new sap.ui.core.Item({
					key: "{Id}",
					text: "{ZoneName}"
				}),
				path: "/MasterTimezoneSet",
				events: {
					dataRequested: this._fnbusyItems.bind(this),
					dataReceived: this._fnbusyItems.bind(this)
				},
				filters: [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("CountryCode", FilterOperator.EQ, sIsoCode)],
				templateShareable: true
			});

		},

		setInitTimeZones: function (sCountryId) {
			this._fnbusyItems({
				getId: function () {
					return "dataRequested";
				}
			});
			var sKey = this.getModel().createKey("/MasterCountrySet", {
				Id: sCountryId
			});
			var that = this;
			this.getModel().read(sKey, {
				success: function (data) {
					that.bindTimeZoneCtrl(data.IsoCode);
				}
			})
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
		 * 
		 * @param oEvent: having source and file info 
		 */
		onUpload: function (oEvent) {
			var oFile = oEvent.getSource().FUEl.files[0],
				oCtrl = oEvent.getSource();
			this.getImageBinary(oFile).then(this._fnAddFile.bind(this, oCtrl));
		},
		
		_fnAddFile: function (oCtrl, oItem) {
			var iIndex = oItem.Image.search(",") + 1;
			var oImageData = {
					Image: oItem.Image.slice(iIndex),
					FileName: oItem.name,
					FileType: "image/png",
					IsArchived: false
				};
				this.getModel("objectView").getProperty("/oImages").push(oImageData);
		

			oCtrl.clear();
			this.getModel("objectView").refresh();
		},
		
		/** 
		 * Open Map and choose latitude/longitude for a given facility
		 */
		onMap: function () {
			var that = this;
			Fragment.load({
				id: that.getView().getId(),
				type: "HTML",
				name: "com.coil.podway.Manage_Event_Info.dialog.HEREMaps",
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

			this._oMessageManager.removeAllMessages();

			var oViewModel = this.getModel("objectView");
			var oPayload = oViewModel.getProperty("/oDetails");
			var oValid = this._fnValidation(oPayload);

			if (oValid.IsNotValid) {
				this.showError(this._fnMsgConcatinator(oValid.sMsg));
				return;
			}
			
			function _fnError() {
				oViewModel.setProperty("/busy", false);
			}
			
			oViewModel.setProperty("/busy", true);
			this.CUOperation(oPayload).then(this._fnUploadFiles.bind(this), _fnError);
		},

		onCountryChange: function (oEvent) {
			var oSelectedItem = oEvent.getSource().getSelectedItem();
			var oObject = oSelectedItem.getBindingContext().getObject();
			this.bindTimeZoneCtrl(oObject.IsoCode);
			this.getModel("objectView").setProperty("/oDetails/TimezoneId", null);
		},

		onChangeTimezone: function (oEvent) {
			if (oEvent.getParameter("itemPressed") === false) {
				oEvent.getSource().setValue("");
			}
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
				},
				aCtrlMessage = [],

				url = data.Url,
				regex =
				/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

			if (!data.Name) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_NAME");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_NAME",
					target: "/oDetails/Name"
				});
			} else
			if (!data.StartDate) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_SDATE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_SDATE",
					target: "/oDetails/StartDate"
				});
			} else
			if (!data.EndDate) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_EDATE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_EDATE",
					target: "/oDetails/EndDate"
				});
			} else
			if (data.EndDate !== "" && data.EndDate < data.StartDate) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_EDATE_GRT_ERR");
				aCtrlMessage.push({
					message: "MSG_EDATE_GRT_ERR",
					target: "/oDetails/EndDate"
				});
			} else
			if (!data.StartTime) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_STIME");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_STIME",
					target: "/oDetails/StartTime"
				});
			} else
			if (!data.EndTime) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_ETIME");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_ETIME",
					target: "/oDetails/EndTime"
				});
			} else
			if (data.EndTime <= data.StartTime && data.EndDate === data.StartDate) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_ETIME_GRT_ERR");
				aCtrlMessage.push({
					message: "MSG_ETIME_GRT_ERR",
					target: "/oDetails/EndTime"
				});
			} else
			if (data.Url !== "" && !url.match(regex)) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_URL");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_URL",
					target: "/oDetails/Url"
				});
			} else
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
			} else
			if (!data.CountryId) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_COUNTRY");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_COUNTRY",
					target: "/oDetails/CountryId"
				});
			} else 
			if (!data.Title) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_TITLE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_TITLE",
					target: "/oDetails/Title"
				});
			} else 
			if (!data.HighlightsTitle) {
				oReturn.IsNotValid = true;
				oReturn.sMsg.push("MSG_VALDTN_ERR_HIGHLIGHT_TITLE");
				aCtrlMessage.push({
					message: "MSG_VALDTN_ERR_HIGHLIGHT_TITLE",
					target: "/oDetails/HighlightsTitle"
				});
			} 
			if (data.Highlights !== null && data.Highlights.length > 0) {
				var error = false;
				for (var i = 0; i < data.Highlights.length; i++) {
					var oHighlight = data.Highlights[i];
					if (oHighlight.Highlight === "" && error === false) {
						error = true;
						oReturn.IsNotValid = true;
						oReturn.sMsg.push("MSG_VALDTN_ERR_HIGHLIGHT");
						aCtrlMessage.push({
							message: "MSG_VALDTN_ERR_HIGHLIGHT",
							target: "/oDetails/Highlights"
						});
					}
				}
			}
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
		
		_fnUploadFiles: function (data) {
			var aProms = [],
				that = this,
				oDataModel = this.getModel(),
				oViewModel = this.getModel("objectView");

			//Deletion Operation : if Any
			if (this._pendingDelOps.length) {
				this._pendingDelOps.forEach(function (ele) {
					aProms.push(that._fnDelOp(oDataModel, "/EventImageSet", ele));
				});
			}

			//Upload Files check if Id is present
			oViewModel.getProperty("/oImages").forEach(function (ele) {
			
				if (ele.Id === undefined) {
					ele.EventId = oViewModel.getProperty("/oDetails/Id");
					aProms.push(that._fnCrOp.call(that, "/EventImageSet", ele));
				}
			});


			//Collect all request and show success/failure
			Promise.all(aProms)
	   			   .then(function () {
						oViewModel.setProperty("/busy", false);
						that.showToast.call(that, "MSG_SUCCESS_UPDATE");
						that.onCancel.apply(that);
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
					success: function (data1) {
			
						res();
					},
					error: function () {
						rej();
					}
				});
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
		},
		/** 
		 * 
		 * @param oFile
		 * @returns  Image Binary from file 
		 */
		getImageBinary: function (oFile) {
		var	oFileReader = new FileReader() , 
			sFileName = oFile.name;
			return new Promise(function (res, rej) {

				if (!(oFile instanceof File)) {
					res(oFile);
					return;
				}

				oFileReader.onload = function () {
					res( { Image : oFileReader.result, name:  sFileName} );
				};
				oFileReader.readAsDataURL(oFile);
			});
		}

	});

});