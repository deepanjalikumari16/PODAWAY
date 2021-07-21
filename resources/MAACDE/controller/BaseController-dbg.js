sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, UIComponent, mobileLibrary,MessageToast, MessageBox) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("com.coil.podway.MAACDE.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress : function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		* Adds a history entry in the FLP page history
		* @public
		* @param {object} oEntry An entry object to add to the hierachy array as expected from the ShellUIService.setHierarchy method
		* @param {boolean} bReset If true resets the history before the new entry is added
		*/
		addHistoryEntry: (function() {
			var aHistoryEntries = [];

			return function(oEntry, bReset) {
				if (bReset) {
					aHistoryEntries = [];
				}

				var bInHistory = aHistoryEntries.some(function(oHistoryEntry) {
					return oHistoryEntry.intent === oEntry.intent;
				});

				if (!bInHistory) {
					aHistoryEntries.push(oEntry);
					this.getOwnerComponent().getService("ShellUIService").then(function(oService) {
						oService.setHierarchy(aHistoryEntries);
					});
				}
			};
		})(),
		
		_getAccName : function(iAccType, bMsg){
			var	sAccType;
			switch(iAccType){
				case 1 : sAccType = bMsg ? this.getResourceBundle().getText("Device") : "Device"; break;
				case 2 : sAccType = bMsg ? this.getResourceBundle().getText("Condition") : "Condition"; break;
				case 3 : sAccType = bMsg ? this.getResourceBundle().getText("Place") : "Place";
			}
			return sAccType;
		},
		
		_fnSuccessToast: function(sText){
						MessageToast.show(this.getResourceBundle().getText(sText,[this._getAccName(this.getOwnerComponent().sAccType, true)] ) );
					},
		
		_ErrorBox : function(sMsg){
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.error(sMsg,	{	styleClass: bCompact ? "sapUiSizeCompact" : ""	});
		},
					
		_fnWarningMessageBox : function(sMsg, _fnSuccess, _fnError ){
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.warning(
					this.getResourceBundle().getText(sMsg),
				{
					actions: [sap.m.MessageBox.Action.NO,sap.m.MessageBox.Action.YES],
					styleClass: bCompact ? "sapUiSizeCompact" : "",
					onClose: function(sAction) {
							if(sAction === "YES")
							{
						_fnSuccess &&	_fnSuccess();
							}else
							{
						_fnError &&  _fnError();	
							}
					}.bind(this)
				}
			);
			
		}

	});

});