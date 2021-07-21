sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("Assignment_List.Assignment_List.controller.App", {

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
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
				//load Event info data
				that.getModel().read("/EventInfoSet('bfed13c1-6cfd-4c77-9a62-cdbf500d0800')", {
				success: function (response) {
					oViewModel.setProperty("/EXPO_Latitude", response.Latitude);
					oViewModel.setProperty("/EXPO_Longitude", response.Longitude);
				}
			});
				
			};

			// disable busy indication when the metadata is loaded and in case of errors
			this.getOwnerComponent().getModel().metadataLoaded().
				then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}
	});

});