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
			if(!code || !num || num.length == 0){
				return "";
			}
			return code.concat(num); 
	},
		/** 
		 * 
		 * @param oMetadata
		 * @param ImageData
		 * @return parsed image url to avoid CORS
		 */
		giveImage : function(oMetadata, ImageData){
			if(oMetadata)
			{   
				var sPathname = new URL(oMetadata.media_src).pathname
				return ("/EXPO_PODIUM_API").concat(sPathname) ;
			}
			return ("data:image/png;base64,").concat(ImageData);
		},
	};

});