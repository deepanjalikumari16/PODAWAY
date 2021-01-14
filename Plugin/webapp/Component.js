sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"./model/models"
], function (Component, Button, Bar, MessageToast, Fragment, models) {
	"use strict";

	return Component.extend("com.coil.podium.Plugin.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			var rendererPromise = this._getRenderer();

			//set Notifications Model
			this.setModel(models.createNotificationModel(), "Notifications");
			/**
			 * Add item to the header
			 */
			var that = this;
			rendererPromise.then(function (oRenderer) {
				// oRenderer.addHeaderEndItem({
				// 	icon: "sap-icon://bell",
				// 	tooltip: "Notifications",
				// 	press: that._openPopOver.bind(that)
				// }, true, true);

				oRenderer.addHeaderEndItem(
					"sap.ushell.ui.shell.ShellHeadItem", {
						id: "notificationBellItem",
						icon: "sap-icon://bell",
						tooltip: "Notifications",
						press: that._openPopOver.bind(that)
					}, true, true);
			});
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		},

		_openPopOver: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oPopover) {
				Fragment.load({
					name: "com.coil.podium.Plugin.Notifications",
					controller: this
				}).then(function (oPopover) {
					this._oPopover = oPopover;
					//	this.getView().addDependent(this._oPopover);
					//	this._oPopover.bindElement("/ProductCollection/0");
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}

			this._fetchNotifications().then(function (data) {
				//	debugger;
				this.getModel("Notifications").setProperty("/aNotifications", data.results);
				this.getModel("Notifications").refresh(true);
			}.bind(this));
		},

		_fetchNotifications: function () {
			var that = this;

			return new Promise(function (res, rej) {

				that.getModel().callFunction("/GetNotifications", {
					urlParameters: {
						"$expand": "Notification,Notification/Redirection"
					},
					success: function (data) {
						res(data);
					},
					error: function (err) {
						rej(err);
					}
				});
			});
		},
		onItemClose: function (oEvent) {
			var oItem = oEvent.getSource(),
				oList = oItem.getParent();

			oList.removeItem(oItem);

			MessageToast.show('Item Closed: ' + oEvent.getSource().getTitle());
		}

	});
});