sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createNotificationModel : function () {
			var oModel = new JSONModel({
				bloadingNotifications: true
			});
			return oModel;
		}

	};
});