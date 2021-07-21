jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-core");jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-service");jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-ui");jQuery.sap.require("com.coil.podway.Manage_Event_Info.libs.mapsjs-mapevents");sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","../model/formatter","sap/ui/core/Fragment","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,s,i,a,o){"use strict";return e.extend("com.coil.podway.Manage_Event_Info.controller.Object",{formatter:s,onInit:function(){var e,s=new t({busy:true,delay:0,Highlights:[]});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched,this);e=this.getView().getBusyIndicatorDelay();this.setModel(s,"objectView");this.getOwnerComponent().getModel().metadataLoaded().then(function(){s.setProperty("/delay",e)});var i=this.getOwnerComponent().getModel();i.setSizeLimit(999)},onAfterRendering:function(){this._initMessage()},_initMessage:function(){var e=this.getModel("objectView");this._oMessageManager=sap.ui.getCore().getMessageManager();this._oMessageManager.registerMessageProcessor(e)},onShareInJamPress:function(){var e=this.getModel("objectView"),t=sap.ui.getCore().createComponent({name:"sap.collaboration.components.fiori.sharing.dialog",settings:{object:{id:location.href,share:e.getProperty("/shareOnJamTitle")}}});t.open()},_onObjectMatched:function(e){var t=this;t.getModel("objectView").setProperty("/sMode","E");t.getModel("objectView").setProperty("/busy",true);var s=e.getParameter("arguments").objectId;t.getModel().metadataLoaded().then(function(){var e=t.getModel().createKey("/EventInfoSet",{Id:s});t.getModel().read(e,{urlParameters:{$expand:"Images,Highlights"},success:function(e){t._setView.call(t,e)}})}.bind(t))},_onCreateObjectMatched:function(){this.getModel("objectView").setProperty("/sMode","C");this.getModel("objectView").setProperty("/busy",true);this._setView()},_setView:function(e){this._oMessageManager.removeAllMessages();this._pendingDelOps=[];var t=this.getModel("objectView");t.setProperty("/busy",false);if(e){t.setProperty("/oImages",e.Images.results);t.setProperty("/oDetails",e);t.setProperty("/oDetails/Highlights",e.Highlights.results);this.setInitTimeZones(e.CountryId);return}t.setProperty("/oDetails",{Name:"",StartDate:"",EndDate:"",StartTime:"",EndTime:"",Url:"",Location:"",Latitude:"",Longitude:"",CountryId:"",TimezoneId:"",Title:"",Description:"",HighlightsTitle:"",Highlights:[],IsArchived:false})},_fnbusyItems:function(e){var t=this.getModel("objectView");if(e.getId()==="dataRequested"){t.setProperty("/bTimeZonesItemsBusy",true)}else{t.setProperty("/bTimeZonesItemsBusy",false)}},bindTimeZoneCtrl:function(e){var t=this.getView().byId("TimezoneDropdownId");t.bindItems({template:new sap.ui.core.Item({key:"{Id}",text:"{ZoneName}"}),path:"/MasterTimezoneSet",events:{dataRequested:this._fnbusyItems.bind(this),dataReceived:this._fnbusyItems.bind(this)},filters:[new a("IsArchived",o.EQ,false),new a("CountryCode",o.EQ,e)],templateShareable:true})},setInitTimeZones:function(e){this._fnbusyItems({getId:function(){return"dataRequested"}});var t=this.getModel().createKey("/MasterCountrySet",{Id:e});var s=this;this.getModel().read(t,{success:function(e){s.bindTimeZoneCtrl(e.IsoCode)}})},onDelete:function(e){var t=this.getModel("objectView"),s=e.getParameter("listItem").getBindingContext("objectView"),i=+s.getPath().match(/(\d+)/)[0];if(t.getProperty("/sMode")==="E"&&s.getProperty("Id")!==undefined){this._pendingDelOps.push(s.getProperty("Id"))}t.getProperty("/oImages").splice(i,1);t.refresh()},onUpload:function(e){var t=e.getSource().FUEl.files[0],s=e.getSource();this.getImageBinary(t).then(this._fnAddFile.bind(this,s))},_fnAddFile:function(e,t){var s=t.Image.search(",")+1;var i={Image:t.Image.slice(s),FileName:t.name,FileType:"image/png",IsArchived:false};this.getModel("objectView").getProperty("/oImages").push(i);e.clear();this.getModel("objectView").refresh()},onMap:function(){var e=this;i.load({id:e.getView().getId(),type:"HTML",name:"com.coil.podway.Manage_Event_Info.dialog.HEREMaps",controller:e}).then(function(t){var s=new H.service.Platform({apikey:"BbN_bDCaLx6-5GZou8CHRvPWpf9CoDtVbMK4w-OTAxM"});var i=s.createDefaultLayers();var a=new H.Map(document.getElementById("map"),i.vector.normal.map,{zoom:15,center:{lng:55.14711,lat:24.962762}});var o=new H.mapevents.Behavior(new H.mapevents.MapEvents(a));var r=H.ui.UI.createDefault(a,i);e.getView().addDependent(t);e.addDraggableMarker(a,o);t.open()}.bind(this))},onCloseMaps:function(){this.getView().byId("MapDialog").close();this.getView().byId("MapDialog").destroy()},addDraggableMarker:function(e,t){var s=this.getModel("objectView");var i=new H.map.Marker({lng:55.14711,lat:24.962762},{volatility:true});i.draggable=true;e.addObject(i);e.addEventListener("dragstart",function(s){var i=s.target,a=s.currentPointer;if(i instanceof H.map.Marker){var o=e.geoToScreen(i.getGeometry());i["offset"]=new H.math.Point(a.viewportX-o.x,a.viewportY-o.y);t.disable()}},false);e.addEventListener("dragend",function(e){var i=e.target;if(i instanceof H.map.Marker){t.enable();s.setProperty("/oDetails/Longitude",i.getGeometry().lng.toString());s.setProperty("/oDetails/Latitude",i.getGeometry().lat.toString())}},false);e.addEventListener("drag",function(t){var s=t.target,i=t.currentPointer;if(s instanceof H.map.Marker){s.setGeometry(e.screenToGeo(i.viewportX-s["offset"].x,i.viewportY-s["offset"].y))}},false)},onSave:function(){this._oMessageManager.removeAllMessages();var e=this.getModel("objectView");var t=e.getProperty("/oDetails");var s=this._fnValidation(t);if(s.IsNotValid){this.showError(this._fnMsgConcatinator(s.sMsg));return}function i(){e.setProperty("/busy",false)}e.setProperty("/busy",true);this.CUOperation(t).then(this._fnUploadFiles.bind(this),i)},onCountryChange:function(e){var t=e.getSource().getSelectedItem();var s=t.getBindingContext().getObject();this.bindTimeZoneCtrl(s.IsoCode);this.getModel("objectView").setProperty("/oDetails/TimezoneId",null)},onChangeTimezone:function(e){if(e.getParameter("itemPressed")===false){e.getSource().setValue("")}},onUrlValidate:function(){var e=this.getView().byId("urlInput").getValue();var t=/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;if(e.match(t)){}else{this.showToast.call(this,"MSG_INVALID_URL")}},addHighligt:function(){this.getModel("objectView").getData().oDetails.Highlights.push({Highlight:"",IsArchived:false});this.getModel("objectView").refresh()},handleDelete:function(e){var t=+e.getParameter("listItem").getBindingContextPath().match(/\d+/g);if(this.getModel("objectView").getData().sMode==="C"||!this.getModel("objectView").getData().oDetails.Highlights[t].Id){this.getModel("objectView").getData().oDetails.Highlights.splice(t,1)}else{this.getModel("objectView").getData().oDetails.Highlights[t].IsArchived=true}this.getModel("objectView").refresh()},onCancel:function(){this.getRouter().navTo("worklist",true)},_fnValidation:function(e){var t={IsNotValid:false,sMsg:[]},s=[],i=e.Url,a=/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;if(!e.Name){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_NAME");s.push({message:"MSG_VALDTN_ERR_NAME",target:"/oDetails/Name"})}else if(!e.StartDate){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_SDATE");s.push({message:"MSG_VALDTN_ERR_SDATE",target:"/oDetails/StartDate"})}else if(!e.EndDate){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_EDATE");s.push({message:"MSG_VALDTN_ERR_EDATE",target:"/oDetails/EndDate"})}else if(e.EndDate!==""&&e.EndDate<e.StartDate){t.IsNotValid=true;t.sMsg.push("MSG_EDATE_GRT_ERR");s.push({message:"MSG_EDATE_GRT_ERR",target:"/oDetails/EndDate"})}else if(!e.StartTime){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_STIME");s.push({message:"MSG_VALDTN_ERR_STIME",target:"/oDetails/StartTime"})}else if(!e.EndTime){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_ETIME");s.push({message:"MSG_VALDTN_ERR_ETIME",target:"/oDetails/EndTime"})}else if(e.EndTime<=e.StartTime&&e.EndDate===e.StartDate){t.IsNotValid=true;t.sMsg.push("MSG_ETIME_GRT_ERR");s.push({message:"MSG_ETIME_GRT_ERR",target:"/oDetails/EndTime"})}else if(e.Url!==""&&!i.match(a)){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_URL");s.push({message:"MSG_VALDTN_ERR_URL",target:"/oDetails/Url"})}else if(+e.Longitude==0||+e.Latitude==0){t.IsNotValid=true;t.sMsg.push("MSG_LAT_LNG");s.push({message:"MSG_LAT_LNG",target:"/oDetails/Latitude"});s.push({message:"MSG_LAT_LNG",target:"/oDetails/Longitude"})}else if(+e.Latitude<-90||+e.Latitude>90){t.IsNotValid=true;t.sMsg.push("MSG_ERR_LAT");s.push({message:"MSG_ERR_LAT",target:"/oDetails/Latitude"})}else if(+e.Longitude<-180||+e.Longitude>180){t.IsNotValid=true;t.sMsg.push("MSG_ERR_LNG");s.push({message:"MSG_ERR_LNG",target:"/oDetails/Longitude"})}else if(!e.CountryId){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_COUNTRY");s.push({message:"MSG_VALDTN_ERR_COUNTRY",target:"/oDetails/CountryId"})}else if(!e.Title){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_TITLE");s.push({message:"MSG_VALDTN_ERR_TITLE",target:"/oDetails/Title"})}else if(!e.HighlightsTitle){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_HIGHLIGHT_TITLE");s.push({message:"MSG_VALDTN_ERR_HIGHLIGHT_TITLE",target:"/oDetails/HighlightsTitle"})}if(e.Highlights!==null&&e.Highlights.length>0){var o=false;for(var r=0;r<e.Highlights.length;r++){var n=e.Highlights[r];if(n.Highlight===""&&o===false){o=true;t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_HIGHLIGHT");s.push({message:"MSG_VALDTN_ERR_HIGHLIGHT",target:"/oDetails/Highlights"})}}}if(s.length)this._genCtrlMessages(s);return t},_genCtrlMessages:function(e){var t=this,s=t.getModel("objectView");e.forEach(function(e){t._oMessageManager.addMessages(new sap.ui.core.message.Message({message:t.getResourceBundle().getText(e.message),type:sap.ui.core.MessageType.Error,target:e.target,processor:s,persistent:true}))})},_fnMsgConcatinator:function(e){var t=this;return e.map(function(e){return t.getResourceBundle().getText(e)}).join("")},CUOperation:function(e){var t=this.getModel("objectView");delete e.Country;delete e.Images;delete e.Timezone;var s=$.extend(true,{},e),i=this;return new Promise(function(e,a){if(t.getProperty("/sMode")==="E"){if(s.Highlights!==null&&s.Highlights.length>0){for(var o=0;o<s.Highlights.length;o++){var r=s.Highlights[o];delete r.__metadata;delete r.EventInfo}}var n=i.getModel().createKey("/EventInfoSet",{Id:s.Id});i.getModel().update(n,s,{success:function(){t.setProperty("/busy",false);i.getRouter().navTo("worklist",true);i.showToast.call(i,"MSG_SUCCESS_UPDATE");e(s)},error:function(){t.setProperty("/busy",false);a()}})}else{i.getModel().create("/EventInfoSet",s,{success:function(s){t.setProperty("/busy",false);i.getRouter().navTo("worklist",true);i.showToast.call(i,"MSG_SUCCESS_CREATE");e(s)},error:function(){t.setProperty("/busy",false);a()}})}})},_fnUploadFiles:function(e){var t=[],s=this,i=this.getModel(),a=this.getModel("objectView");if(this._pendingDelOps.length){this._pendingDelOps.forEach(function(e){t.push(s._fnDelOp(i,"/EventImageSet",e))})}a.getProperty("/oImages").forEach(function(e){if(e.Id===undefined){e.EventId=a.getProperty("/oDetails/Id");t.push(s._fnCrOp.call(s,"/EventImageSet",e))}});Promise.all(t).then(function(){a.setProperty("/busy",false);s.showToast.call(s,"MSG_SUCCESS_UPDATE");s.onCancel.apply(s)},function(){a.setProperty("/busy",false)})},_fnDelOp:function(e,t,s){var i=t,a=s,o=e;return new Promise(function(e,t){var s=o.createKey(i,{Id:a});o.update(s,{IsArchived:true},{success:function(){e()},error:function(){t()}})})},_fnCrOp:function(e,t){var s=this,i=e,a=t;return new Promise(function(e,t){s.getModel().create(i,a,{success:function(t){e()},error:function(){t()}})})},_bindView:function(e){var t=this.getModel("objectView"),s=this.getModel();this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){s.metadataLoaded().then(function(){t.setProperty("/busy",true)})},dataReceived:function(){t.setProperty("/busy",false)}}})},_onBindingChange:function(){var e=this.getView(),t=this.getModel("objectView"),s=e.getElementBinding();if(!s.getBoundContext()){this.getRouter().getTargets().display("objectNotFound");return}var i=this.getResourceBundle(),a=e.getBindingContext().getObject(),o=a.Id,r=a.Name;t.setProperty("/busy",false);this.addHistoryEntry({title:this.getResourceBundle().getText("objectTitle")+" - "+r,icon:"sap-icon://enter-more",intent:"#ManageEventInfo-display&/EventInfoSet/"+o});t.setProperty("/saveAsTileTitle",i.getText("saveAsTileTitle",[r]));t.setProperty("/shareOnJamTitle",r);t.setProperty("/shareSendEmailSubject",i.getText("shareSendEmailObjectSubject",[o]));t.setProperty("/shareSendEmailMessage",i.getText("shareSendEmailObjectMessage",[r,o,location.href]))},getImageBinary:function(e){var t=new FileReader,s=e.name;return new Promise(function(i,a){if(!(e instanceof File)){i(e);return}t.onload=function(){i({Image:t.result,name:s})};t.readAsDataURL(e)})}})});