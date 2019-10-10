'use strict';
var Q = require('q');
var path = require('path');
var fsModule = require('fs');
var plist = require('plist');
var xcode = require('xcode');

module.exports = function (context) {
	var req = context.requireCordovaModule,
		fs = require("./lib/filesystem")(Q, fsModule, path),
		settings = require("./lib/settings")(fs, path),
		platforms = {};

	platforms.android = require("./lib/android")(context);
	platforms.ios = require("./lib/ios")(Q, fs, path, plist, xcode);
	// platforms.browser = require("./lib/browser")(Q, fs, path, req('plist'), req('xcode'));

	return settings.get()
		.then(function (config) {
			var promises = [];
			context.opts.platforms.forEach (function (platformName) {
				if (platforms[platformName] && platforms[platformName].build) {
					promises.push (platforms[platformName].build (config));
				}
			});
			return Q.all(promises);
		})
		.catch(function(err) {
			if (err.code === 'NEXIST') {
				console.log("app-settings.json not found: skipping build");
				return;
			}

			console.log ('unhandled exception', err);

			throw err;
		});
};
