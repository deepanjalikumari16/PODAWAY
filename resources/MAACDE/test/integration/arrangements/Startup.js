sap.ui.define(["sap/ui/test/Opa5","com/coil/podium/MAACDE/localService/mockserver","sap/ui/model/odata/v2/ODataModel","sap/ui/core/routing/HashChanger","com/coil/podium/MAACDE/test/flpSandbox","sap/ui/fl/FakeLrepConnectorLocalStorage"],function(t,e,a,i,o,s){"use strict";return t.extend("com.coil.podium.MAACDE.test.integration.arrangements.Startup",{iStartMyFLPApp:function(t){var a=t||{};this._clearSharedData();a.delay=a.delay||1;var r=[];r.push(e.init(a));r.push(o.init());this.iWaitForPromise(Promise.all(r));s.enableFakeConnector();this.waitFor({autoWait:a?a.autoWait:true,success:function(){(new i).setHash(a.intent+(a.hash?"&/"+a.hash:""))}})},iRestartTheAppWithTheRememberedItem:function(t){var e;this.waitFor({success:function(){e=this.getContext().currentItem.id}});this.waitFor({success:function(){t.hash="AccessibilitySet/"+encodeURIComponent(e);this.iStartMyFLPApp(t)}})},_clearSharedData:function(){a.mSharedData={server:{},service:{},meta:{}}}})});