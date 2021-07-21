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
		
		getURL : function(oObj){
			return	oObj.media_src;
		},
		
		getImage : function(data){
				return ("data:image/png;base64,").concat(data);
		},
		/**
		 * @param oMetadata : Image metadata
		 * @param ImageData : base64 data
		 * @returns Image based
		 */
		giveImage : function(oMetadata, ImageData){
			if(oMetadata)
			{  
				var sPathname = new URL(oMetadata.media_src).pathname;
				return ("/EXPO_PODWAY_API").concat(sPathname) ;
			}
			return ("data:image/png;base64,").concat(ImageData);
		},
		
		getDialogTitle : function(cDialog, sApp)
		{
			return cDialog === "C" ? ("Add").concat(" ", sApp) : ("Edit").concat(" ",sApp);
		}
	};

});