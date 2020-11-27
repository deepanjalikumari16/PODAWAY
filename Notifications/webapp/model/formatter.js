// jQuery.sap.require("com.coil.podium.Notifications.libs.moment");

sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		formatDate: function (dValue,tValue) {
			if (!dValue) {
				return "";
			}
			var sValue = dValue;
			var pattern = "dd MMM yyyy, hh:mm a";
			if (tValue) {
				sValue = sValue + " " + tValue;
			}
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: pattern
			});

			var oNow = new Date(sValue);
			return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"
			
		}
	};

});