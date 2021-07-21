sap.ui.define([], function () {
	"use strict";

	return {

		givePercentValue: function (iValue, iTotal) {

			return (iValue / iTotal) * 100;

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
			
		},

		TimeAgo: function (date) {
			var seconds = Math.floor((new Date() - date) / 1000);
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd MMM yyyy"
			});
			// var interval = seconds / 31536000;

			// if (interval > 1) {
			// 	return Math.floor(interval) + " years";
			// }
			// interval = seconds / 2592000;
			// if (interval > 1) {
			// 	return Math.floor(interval) + " months";
			// }
			var interval = seconds / 86400;

			if (interval > 5) {
				return oDateFormat.format(date);
			}
			
			if (interval > 1) {
				
				if(Math.floor(interval) == 1)
					return "1 day ago";
				
				return Math.floor(interval) + " days";
			}

			interval = seconds / 3600;
			if (interval > 1) {
				
				if(Math.floor(interval) == 1)
					return "1 hour ago";
				
				return Math.floor(interval) + " hours";
			}
			interval = seconds / 60;
			if (interval > 1) {
				if(Math.floor(interval) == 1)
					return "1 minute ago";
				
				return Math.floor(interval) + " minutes";
			}
			return Math.floor(seconds) + " seconds";
		}
	};

});