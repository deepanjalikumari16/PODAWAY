sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.coil.podium.MAEVAT.controller.App", {

		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay(),
				that = this,
				oModel = this.getOwnerComponent().getModel()	;

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");
		
			
			fnSetAppNotBusy = function () {
				
				that.setAppTitle.apply(that);
				//Load Event Type Config from Master Set
				var sKey = oModel.createKey("/MasterEventAttractionTypeSet", {
					"Id" : that.getOwnerComponent().iEvtType
				});
				oModel.read(sKey, {
					success : function(data){
					oViewModel.setProperty("/EvtTypeConfig", data);	
					oViewModel.setProperty("/busy", false);
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				
					
					}.bind(that)
				});
				
				var sAppName =  that.getOwnerComponent().iEvtType == 1 ?
				that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("POD Initiative") :
				that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("Attraction");
				
				oViewModel.setProperty("/sAppName", sAppName );
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		/** 
		 * Set App title based on the Launchpad Application
		 */
		setAppTitle: function () {
			//Change title of app based on semantic object
			this.getOwnerComponent().getService("ShellUIService").then(function (oService) {
				oService.setTitle(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("appTitle" + this.getOwnerComponent().iEvtType));
			}.bind(this));
		}
	});

});