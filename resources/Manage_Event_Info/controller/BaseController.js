sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/UIComponent","sap/m/library","sap/m/MessageToast","sap/m/MessageBox"],function(e,t,n,o,r){"use strict";var i=n.URLHelper;return e.extend("com.coil.podway.Manage_Event_Info.controller.BaseController",{getRouter:function(){return t.getRouterFor(this)},getModel:function(e){return this.getView().getModel(e)},setModel:function(e,t){return this.getView().setModel(e,t)},getResourceBundle:function(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},onShareEmailPress:function(){var e=this.getModel("objectView")||this.getModel("worklistView");i.triggerEmail(null,e.getProperty("/shareSendEmailSubject"),e.getProperty("/shareSendEmailMessage"))},addHistoryEntry:function(){var e=[];return function(t,n){if(n){e=[]}var o=e.some(function(e){return e.intent===t.intent});if(!o){e.push(t);this.getOwnerComponent().getService("ShellUIService").then(function(t){t.setHierarchy(e)})}}}(),showWarning:function(e,t){var n=this;r.warning(this.getResourceBundle().getText(e),{actions:[sap.m.MessageBox.Action.NO,sap.m.MessageBox.Action.YES],onClose:function(e){if(e==="YES"){t&&t.apply(n)}}})},showError:function(e){var t=this;r.error(e,{title:t.getResourceBundle().getText("TtlError")})},showToast:function(e){o.show(this.getResourceBundle().getText(e))}})});