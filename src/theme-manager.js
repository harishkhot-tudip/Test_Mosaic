'use strict';

/* Themes
 *
 * Sadly - we can't do dynamic require statments since we're doing this in the browser
 * and requirejs needs to know things before hand, so we have to do it statically
 * (which kinda makes sense). To do that, we've got to include all the files before-hand.
 */
var dark = require('json!./themes/dark.json');
var light = require('json!./themes/light.json');

/**
 * Simple class to manage the mess of the themes
 * @param {object} opts Options passed in from the initial constructor
 */
function ThemeManager(opts) {
    opts = opts || {};
    this.theme = opts.theme = opts.theme || 'light';
}

/**
 * Mapping of theme names to their them object.
 * @type {Object}
 */
ThemeManager.prototype.themeDirectory = {
    'dark': dark,
    'light': light
};

/**
 * Returns the appropriate theme object given the supplied theme option.
 *
 * @return {Object}
 */
ThemeManager.prototype.getTheme = function () {
    if (!this.themeDirectory[this.theme]) {
        console.warn("The value '" + this.theme + "' is not a valid theme.");
        return {};
    }

    return this.themeDirectory[this.theme];
};

/**
 * Sets the current theme. Call this before you "get theme".
 *
 * @param {object || string} opts an options object that has opts.theme or the theme name.
 */
ThemeManager.prototype.setTheme = function (opts) {
    if (typeof(opts) != 'string' && typeof(opts) != 'object') {
        console.warn("Options expects an object or a string, you gave me a " + typeof(opts));
        return false;
    }

    var theme = typeof(opts) === 'object' ? opts.theme : opts;
    this.theme = theme;
    return true;
};

module.exports = ThemeManager;