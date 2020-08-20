/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"Assignment_List/Assignment_List/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});