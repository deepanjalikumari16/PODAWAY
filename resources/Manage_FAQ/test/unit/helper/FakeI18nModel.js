sap.ui.define(["sap/ui/model/Model"],function(e){"use strict";return e.extend("com.coil.podium.Manage_FAQ.test.unit.helper.FakeI18nModel",{constructor:function(t){e.call(this);this.mTexts=t||{}},getResourceBundle:function(){return{getText:function(e){return this.mTexts[e]}.bind(this)}}})});