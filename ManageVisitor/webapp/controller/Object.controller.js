sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.coil.podium.ManageVisitor.controller.Object", {

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
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

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
		
		
		onEmail : function(oEvent){
		sap.m.URLHelper.triggerEmail(oEvent.getSource().getText());
		},
		onTel : function(oEvent){
		sap.m.URLHelper.triggerTel(oEvent.getSource().getText());
		},
		
		onCall : function(){
			var oContext = this.getView().getBindingContext();
			sap.m.URLHelper.triggerTel( oContext.getProperty("DialCode").concat(oContext.getProperty("Mobile")));
		},
		
		onSMS: function(){
			var oContext = this.getView().getBindingContext();
			sap.m.URLHelper.triggerSms( oContext.getProperty("DialCode").concat(oContext.getProperty("Mobile")));
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
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("UserSet", {
					Id: sObjectId
				});
				this._bindView("/" + sObjectPath, sObjectId);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath, sObjectId) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				parameters: {
					filters: [new Filter("IsArchived", FilterOperator.EQ, false), new Filter("RoleId", FilterOperator.EQ, "3")],
					expand: "UserPreference/UserAccessibilityList/AccessiblityItem"
				},
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

			this._bindTabs(sObjectId);

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
			var oODataModel = this.getModel();
			return aItems.filter(
				function (ele) {
					return oODataModel.getProperty("/" + ele + "/" + "AccessiblityItem/AccessibilityId") === +sType;
				}).map(function (ele) {
				return oODataModel.getProperty("/" + ele + "/AccessiblityItem/Title");
			}).join(",");
		},

		_bindTabs: function (sPODId) {
			var oNewReqTable = this.getView().byId("newReqs"),
				oOngReqs = this.getView().byId("OngReqs"),
				oCompReqs = this.getView().byId("CompReqs")	;
				oCanclReqs = this.getView().byId("CanclReqs")	;

			this._bindTables(oNewReqTable, +sPODId,1);
			this._bindTables(oOngReqs, +sPODId,2);
			this._bindTables(oCompReqs, +sPODId,3);
			this._bindTables(oCanclReqs, +sPODId,4);

		},

		_bindTables: function (oTable, iPODId, iStatus) {
			oTable.bindItems({
				path: "/AssignmentSet",
				filters: [new Filter("PODVisitorId", FilterOperator.EQ, iPODId),
					new Filter("AssignmentStatusId", FilterOperator.EQ, iStatus),
					new Filter("IsArchived", FilterOperator.EQ, false)
				],
				parameters: {
					expand: "ServiceType,ServiceType/IncidentType"

				},
				template: this._getColumnListTemplae()

			});

		},

		_getColumnListTemplae: function () {
			var oColumnListTemplate = new sap.m.ColumnListItem();

			oColumnListTemplate.addCell(new sap.m.Text({
				text:  "{ServiceType/ServiceType}" 
			}));
			
			oColumnListTemplate.addCell(new sap.m.Text({
				text: "{ServiceType/IncidentType/ServiceMessage}"
			}));
			
			oColumnListTemplate.addCell(new sap.m.Text({
				text: "{ServiceType/IncidentType/IncidentType}"
			}));

			oColumnListTemplate.addCell(new sap.m.Text({
				text: "{Comments}"
			}));

			oColumnListTemplate.addCell(new sap.m.Button({
				type: "Transparent",
				icon: "sap-icon://locate-me"
			}));

			return oColumnListTemplate;

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
				sObjectName = oObject.FirstName;

			oViewModel.setProperty("/busy", false);
			// Add the object page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("objectTitle") + " - " + sObjectName,
				icon: "sap-icon://enter-more",
				intent: "#PODiumVisitorManagement-display&/UserSet/" + sObjectId
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