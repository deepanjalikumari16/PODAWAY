sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.coil.podium.MAACDE.controller.App", {

		onInit: function () {
			var oViewModel,
				fnSetAppNotBusy,
				that = this,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
		
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function () {
				
				that.setAppTitle.call(that);
				
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		setAppTitle: function(){
				//Change title of app based on semantic object
			this.getOwnerComponent().getService("ShellUIService").then(function(oService){
				
				oService.setTitle( this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("appTitle" + this.getOwnerComponent().sAccType )   );
			
			}.bind(this));
		}
	});

});