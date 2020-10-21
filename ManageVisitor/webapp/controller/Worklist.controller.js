sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.coil.podium.ManageVisitor.controller.Worklist", {

		formatter: formatter,
 
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay : 0
			});
			this.setModel(oViewModel, "worklistView");
			
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function(){
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#PODiumVisitorManagement-display"
			}, true);
			
			this.getRouter().getRoute("worklist").attachPatternMatched(this._onHomeMatched, this);
			
			this._setSearchField();
			
		},
		
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		
		_onHomeMatched : function(){
				this.getModel().metadataLoaded().then(this._getViewData.bind(this, false, false));
		},
		
		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress : function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},


		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress : function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object:{
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},
		
		onSearch : function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getSource().getBasicSearchValue();	
				var aCustomQuery = {};
				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("FirstName", FilterOperator.Contains, sQuery)];
				}
				
				
				
				if(oEvent.getParameter("selectionSet"))
				{
				
					this._addFilterBarItems(aTableSearchState, aCustomQuery );
				}
		
				this._getViewData(aTableSearchState, aCustomQuery	);
		
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh : function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		_addFilterBarItems: function(aFilters,aCustomQuery){
			var oFilterBar = this.getView().byId("filterbar");
				
			oFilterBar.getFilterGroupItems().forEach(function(ele){
				if(ele.getControl().getSelectedKey())
				switch(ele.getName()){
					
					case "Country" : 
						 aFilters.push(new Filter( "Country" , FilterOperator.EQ, ele.getControl().getSelectedItem().getText()    ));	
						break;
					case "Category" :
					 aCustomQuery["ConditionId"]	= 	ele.getControl().getSelectedKey();		
						break;
					case "Things" :
					aCustomQuery["PlaceId"]	= 	ele.getControl().getSelectedKey();		
						break;
					
				};
			});	
		
		
			
			
		},
		_setSearchField: function (oEvent) {
			var oSearchField = this.getView().byId("filterbar").getBasicSearch();
			var oBasicSearch;
			if (!oSearchField) {
				oBasicSearch = new sap.m.SearchField({
					showSearchButton: false
				});
			} else {
				oSearchField = null;
			}

			this.getView().byId("filterbar").setBasicSearch(oBasicSearch);

			oBasicSearch.attachBrowserEvent("keyup", function (e) {
					if (e.which === 13) {
					this.getView().byId("filterbar").fireSearch();
					}
				}.bind(this)
			);
		},
			
		_getViewData : function(filters, customQuery){
			this.getModel("worklistView").setProperty("/btableBusy", true);
			
			//Combining filtering and read, because of custom query
			var defaultFilters = [  new Filter("IsArchived" ,FilterOperator.EQ , false), new Filter("RoleId" , FilterOperator.EQ , "3")   ],
				urlParameters =  {	$expand : "UserPreference/UserAccessibilityList/AccessiblityItem" 	};
		
			if(filters)
			{
			 defaultFilters = defaultFilters.concat(filters);
			}
			
			if(customQuery && Object.keys(customQuery).length )
			{
				Object.assign(urlParameters, customQuery );
			}
			
			this.getModel().read("/UserSet", {
				filters : defaultFilters,
				urlParameters : urlParameters,
				success : this._setView.bind(this)
			});
			
		},
		
		_setView : function(data){
			this.getModel("worklistView").setProperty("/btableBusy", false);
			this.getModel("worklistView").setProperty("/aUserSet", data.results);
			this.oColumnListTemplate =   this.oColumnListTemplate ? this.oColumnListTemplate.clone() : this.getView().byId("table").getItems()[0]    ;    
			//UserPreference.UserAccessibilityList.results[].AccessiblityItem (Title,Id,AccessibilityId )
			this.getView().byId("table").bindItems(
				{
					templateShareable : false,
					path : "worklistView>/aUserSet",
					model : "worklistView",
					template:  this._getTableTemplate()  //	this.oColumnListTemplate.clone()
				}
				);
		},		
		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject : function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext("worklistView").getProperty("Id")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");//Control
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
			
			
		},
		
		_getTableTemplate : function(){
			var oColumnTemplate = new sap.m.ColumnListItem({   type:"Navigation" , press:this["onPress"].bind(this) });
			oColumnTemplate.addCell( new sap.m.Text({text: "{worklistView>FirstName} {worklistView>LastName}" } )   );
			oColumnTemplate.addCell( 
				new sap.m.Text({text: 
				{  parts : [ { path : 'worklistView>UserPreference/UserAccessibilityList/results' },{  path : 'i18n>Two'} ], formatter : this.AccessibiltyItems } } )   );	
			oColumnTemplate.addCell( 
				new sap.m.Text({text: {  parts : [ { path : 'worklistView>UserPreference/UserAccessibilityList/results' },{  path : 'i18n>One'} ], formatter : this.AccessibiltyItems } } )   );
			oColumnTemplate.addCell( 
				new sap.m.Text({text: {parts : [ {path : 'worklistView>EmergencyDialCode' } , {path : 'worklistView>EmergencyMobile' }   ] , formatter : formatter.EmergencyNumber  } } )   );
			oColumnTemplate.addCell( new sap.m.Text({text: "{worklistView>Country}" } )   );
			oColumnTemplate.addCell( 
				new sap.m.Text({text: {  parts : [ { path : 'worklistView>UserPreference/UserAccessibilityList/results' },{  path : 'i18n>Three'} ], formatter : this.AccessibiltyItems } } )   );
			oColumnTemplate.addCell( new sap.m.Button({type:"Transparent" ,icon:"sap-icon://locate-me" , press : this.onNavigate.bind(this)} )   );

			return oColumnTemplate;
			
		}

	});
});