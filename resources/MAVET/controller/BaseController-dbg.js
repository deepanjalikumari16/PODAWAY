sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, UIComponent, mobileLibrary,MessageToast,MessageBox) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return Controller.extend("com.coil.podway.MAEVAT.controller.BaseController", {
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
		
		showErrorMessageBox : function(sMsgTxt){
			var that = this;
			
			MessageBox.error(sMsgTxt) ;
			
		},
		
		/*
		 * Common function for showing warning dialogs
		 * @param sMsgTxt : i18n Key string
		 * @param _fnYes : Optional: function to be called for Yes response
		 */
		showWarning : function(sMsgTxt, _fnYes, sType){
		var that = this;
		//Polyfill for previous calls
		sType = sType === undefined ? "warning" : sType;
		var	aActions = sType === "warning" ? 
			[sap.m.MessageBox.Action.NO , sap.m.MessageBox.Action.YES] : [sap.m.MessageBox.Action.OK];
		
		MessageBox[sType].call(MessageBox,this.getResourceBundle().getText(sMsgTxt, [this.getModel("appView").getProperty("/sAppName")]) , 
		{
			actions : aActions,
			onClose : function(sAction){
				if(sAction === "YES")
				{
					_fnYes && _fnYes.apply(that);
				}
			}
		} );

	/*
		MessageBox.warning(this.getResourceBundle().getText(sMsgTxt) , 
		{
			actions : [sap.m.MessageBox.Action.NO , sap.m.MessageBox.Action.YES],
			onClose : function(sAction){
				if(sAction === "YES")
				{
					_fnYes && _fnYes.apply(that);
				}
			}
		}
		);	
		*/
		
			
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
		},
		
		_fnSuccessToast: function(sMsg){
			MessageToast.show( this.getResourceBundle().getText(sMsg, [this.getModel("appView").getProperty("/sAppName")] ) );
		}

	});

});