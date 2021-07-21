sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","../model/formatter","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment"],function(e,t,i,o,n,a){"use strict";return e.extend("com.coil.podway.MAFA.controller.Worklist",{formatter:i,onInit:function(){var e,i,o=this.byId("table");i=o.getBusyIndicatorDelay();this._aTableSearchState=[];e=new t({worklistTableTitle:this.getResourceBundle().getText("worklistTableTitle"),saveAsTileTitle:this.getResourceBundle().getText("saveAsTileTitle",this.getResourceBundle().getText("worklistTitle")),shareOnJamTitle:this.getResourceBundle().getText("worklistTitle"),shareSendEmailSubject:this.getResourceBundle().getText("shareSendEmailWorklistSubject"),shareSendEmailMessage:this.getResourceBundle().getText("shareSendEmailWorklistMessage",[location.href]),tableNoDataText:this.getResourceBundle().getText("tableNoDataText"),tableBusyDelay:0,bImages:true,bLoadingImages:true});this.setModel(e,"worklistView");o.attachEventOnce("updateFinished",function(){e.setProperty("/tableBusyDelay",i)});this.addHistoryEntry({title:this.getResourceBundle().getText("worklistTitle"),icon:"sap-icon://table-view",intent:"#manage-facilities"},true)},onUpdateFinished:function(e){var t,i=e.getSource(),o=e.getParameter("total");if(o&&i.getBinding("items").isLengthFinal()){t=this.getResourceBundle().getText("worklistTableTitleCount",[o])}else{t=this.getResourceBundle().getText("worklistTableTitle")}this.getModel("worklistView").setProperty("/worklistTableTitle",t)},onEdit:function(e){this._showObject(e.getSource())},onAdd:function(e){this.getRouter().navTo("createObject")},onShareInJamPress:function(){var e=this.getModel("worklistView"),t=sap.ui.getCore().createComponent({name:"sap.collaboration.components.fiori.sharing.dialog",settings:{object:{id:location.href,share:e.getProperty("/shareOnJamTitle")}}});t.open()},onViewImage:function(e){var t=this.getView(),i=this;i.oImageBindingContext=e.getSource().getBindingContext();if(!i._oDlgAddOption){a.load({id:t.getId(),name:"com.coil.podway.MAFA.dialog.Images",controller:i}).then(function(e){i._oDlgAddOption=e;t.addDependent(e);e.open()})}else{i._oDlgAddOption.open()}},bindDialog:function(){var e=this,t=this.getModel("worklistView");this._oDlgAddOption.getContent()[0].bindAggregation("pages",{path:"/FacilityImageSet",filters:[new o("IsArchived",n.EQ,false),new o("FacilityId",n.EQ,e.oImageBindingContext.getProperty("Id"))],template:new sap.m.Image({src:{path:"__metadata",formatter:e.giveImage.bind(e)}}),events:{dataRequested:function(){t.setProperty("/bLoadingImages",true)},dataReceived:function(e){t.setProperty("/bLoadingImages",false);if(e.getParameter("data").results.length){t.setProperty("/bImages",true)}else{t.setProperty("/bImages",false)}}}})},onCancelImage:function(){this._oDlgAddOption.close()},onSearch:function(){var e=this.getFiltersfromFB(),t=this.getView().byId("table");t.getBinding("items").filter(e);if(e.length!==0){this.getModel("worklistView").setProperty("/tableNoDataText",this.getResourceBundle().getText("worklistNoDataWithSearchText"))}},onBasicSearch:function(e){if(e.getParameters().refreshButtonPressed){this.onRefresh()}else{var t=[];var i=e.getParameter("query");if(i&&i.length>0){t=[new o("Description",n.Contains,i)]}this._applySearch(t)}},onRefresh:function(){var e=this.byId("table");e.getBinding("items").refresh()},onDelete:function(e){var t=e.getSource().getBindingContext().getPath();function i(){this.getModel().update(t,{IsArchived:true},{success:this.showToast.bind(this,"MSG_SUCCESS_FAC_REMOVE")})}this.showWarning("MSG_CONFIRM_DELETE",i)},getFiltersfromFB:function(){var e=this.getView().byId("filterbar"),t=[];e.getAllFilterItems().forEach(function(e){if(e.getControl().getSelectedKey()){t.push(new o(e.getName(),n.EQ,e.getControl().getSelectedKey()))}});return t},_showObject:function(e){this.getRouter().navTo("object",{objectId:e.getBindingContext().getProperty("Id")})},_applySearch:function(e){var t=this.byId("table"),i=this.getModel("worklistView");t.getBinding("items").filter(e,"Application");if(e.length!==0){i.setProperty("/tableNoDataText",this.getResourceBundle().getText("worklistNoDataWithSearchText"))}}})});