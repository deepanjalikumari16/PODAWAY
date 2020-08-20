sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		/*
		 * 
		 * @constructor 
		 * @param Country code
		 * @param mobile number
		 * @returns concat string
		 */
		EmergencyNumber : function(code, num){
			if(!num || num.length == 0){
				return "";
			}
			return code.concat(num); 
	}
	};

});