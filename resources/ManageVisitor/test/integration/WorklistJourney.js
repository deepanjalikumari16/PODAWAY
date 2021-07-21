sap.ui.define(["sap/ui/test/opaQunit","./pages/Worklist","./pages/App"],function(e){"use strict";QUnit.module("Worklist");e("Should see the table with all entries",function(e,t,i){e.iStartMyFLPApp({intent:"PODiumVisitorManagement-display"});i.onTheWorklistPage.theTableShouldHaveAllEntries().and.theTitleShouldDisplayTheTotalAmountOfItems()});e("Search for the First object should deliver results that contain the firstObject in the name",function(e,t,i){t.onTheWorklistPage.iSearchForTheFirstObject();i.onTheWorklistPage.theTableShowsOnlyObjectsWithTheSearchStringInTheirTitle()});e("Entering something that cannot be found into search field and pressing search field's refresh should leave the list as it was",function(e,t,i){t.onTheWorklistPage.iSearchForSomethingWithNoResults().and.iClearTheSearch();i.onTheWorklistPage.theTableHasEntries()});e("Should open the share menu and display the share buttons",function(e,t,i){t.onTheWorklistPage.iPressOnTheShareButton();i.onTheWorklistPage.iShouldSeeTheShareEmailButton();i.iLeaveMyFLPApp()})});