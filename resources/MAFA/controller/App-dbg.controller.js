sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("com.coil.podway.MAFA.controller.App", {

		onInit : function () {
			var oViewModel,
				fnSetAppNotBusy,
				that = this,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy : true,
				delay : 0
			});
			this.setModel(oViewModel, "appView");
			

			fnSetAppNotBusy = function() {
				var EventId = "bfed13c1-6cfd-4c77-9a62-cdbf500d0800" ;
				
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
				//Load Event Location
				that.getView().getModel().read("/EventInfoSet('" +  EventId + "')", {
					success: function (response) {
						oViewModel.setProperty("/EventLocation", {
							lat: response.Latitude,
							lng: response.Longitude
						});
					}
				});
				
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
				then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		getEventInfo : function(){
			
		}
	});

});