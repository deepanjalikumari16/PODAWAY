sap.ui.define(["sap/ui/test/Opa5","../../../localService/mockserver"],function(e,t){"use strict";return e.extend("com.coil.podium.Manage_Event_Info.test.integration.pages.Common",{getEntitySet:function(e){return t.getMockServer().getEntitySetData(e)}})});