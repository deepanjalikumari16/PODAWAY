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
		/**
		 * @param oMetadata : Image metadata
		 * @param ImageData : base64 data
		 * @returns Image based
		 */
		giveImage : function(oMetadata, ImageData){
			if(oMetadata)
			{   
				var sPathname = new URL(oMetadata.media_src).pathname
				return ("/EXPO_PODIUM_API").concat(sPathname) ;
			}
			return ("data:image/png;base64,").concat(ImageData);
		}

	};

});