sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","./model/models","./controller/ErrorHandler"],function(t,e,i,s){"use strict";return t.extend("com.coil.podium.MAEVAT.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);this._oErrorHandler=new s(this);this.setModel(i.createDeviceModel(),"device");this.setModel(i.createFLPModel(),"FLP");this.getRouter().initialize();this.iEvtType=2;if(window.location.hash.search("Initiative")>=0){this.iEvtType=1}else if(window.location.hash.search("Attraction")>=0){this.iEvtType=2}},destroy:function(){this._oErrorHandler.destroy();t.prototype.destroy.apply(this,arguments)},getContentDensityClass:function(){if(this._sContentDensityClass===undefined){if(document.body.classList.contains("sapUiSizeCozy")||document.body.classList.contains("sapUiSizeCompact")){this._sContentDensityClass=""}else if(!e.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass}})});