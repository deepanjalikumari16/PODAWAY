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
		
		giveOnlyBoolean : function(sValue){
			return !!sValue;
		},
		
		giveImage : function(oMetadata, ImageData){
            if(oMetadata && oMetadata.media_src && !ImageData  )
            {  
                var sPathname = new URL(oMetadata.media_src).pathname;
                return ("/EXPO_PODIUM_API").concat(sPathname) ;
            }
            
            if (ImageData)
		 	return URL.createObjectURL(ImageData.Image);

     
			
		}

	};

});