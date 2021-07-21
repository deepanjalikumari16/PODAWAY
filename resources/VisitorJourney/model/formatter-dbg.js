sap.ui.define([], function () {
	"use strict";

	return {

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
		}

	};

});