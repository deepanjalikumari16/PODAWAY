sap.ui.define(["sap/ui/test/opaQunit","./pages/Worklist","./pages/Browser","./pages/NotFound","./pages/App"],function(e){"use strict";QUnit.module("NotFound");e("Should see the resource not found page when changing to an invalid hash",function(e,o,t){e.iStartMyFLPApp({intent:"ManageAccessibilityDevices-display"});o.onTheBrowser.iChangeTheHashToSomethingInvalid();t.onTheNotFoundPage.iShouldSeeResourceNotFound()});e("Clicking the 'Show my worklist' link on the 'Resource not found' page should bring me back to the worklist",function(e,o,t){o.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();o.onTheNotFoundPage.iPressTheNotFoundShowWorklistLink();t.onTheWorklistPage.iShouldSeeTheTable()});e("Should see the not found text for no search results",function(e,o,t){o.onTheWorklistPage.iSearchForSomethingWithNoResults();t.onTheWorklistPage.iShouldSeeTheNoDataTextForNoSearchResults()});e("Clicking the back button should take me back to the not found page",function(e,o,t){o.onTheBrowser.iPressOnTheBackwardsButton();t.onTheNotFoundPage.iShouldSeeResourceNotFound();t.iLeaveMyFLPApp()});e("Should see the 'Object not found' page if an invalid object id has been called",function(e,o,t){e.iStartMyFLPApp({intent:"ManageAccessibilityDevices-display",hash:"AccessibilitySet/SomeInvalidObjectId"});t.onTheNotFoundPage.iShouldSeeObjectNotFound()});e("Clicking the 'Show my worklist' link on the 'Object not found' page should bring me back to the worklist",function(e,o,t){o.onTheAppPage.iWaitUntilTheAppBusyIndicatorIsGone();o.onTheNotFoundPage.iPressTheObjectNotFoundShowWorklistLink();t.onTheWorklistPage.iShouldSeeTheTable();t.iLeaveMyFLPApp()})});