'use strict';

var packageJson = require('json!../package.json');
var ComponentBase = require('app-base');
var MultiColumnView = require('./view/multi-column-view');
var inheritPrototype = require('mout/lang/inheritPrototype');
var Collection = require('streamhub-sdk/collection');
var ThemeManager = require('./theme-manager');
var StageManager = require('./stage-manager');
var InitialAnimationType = require('./animation-type').InitialAnimationType;
var CardAnimationType = require('./animation-type').CardAnimationType;
var themableCss = require('text!./themes/theme.css.tpl');
var $ = require('jquery');

/**
 * A streamhub-backed Mosaic component.
 * @class
 * @augments {ComponentBase}
 * @param {object} opts Configuration options
 * @param {object} opts.collection Livefyre collection config
 * @param {string} opts.initialAnimation Initial animation type. 'random' | 'linear' Default: 'random'
 * @param {string} opts.cardAniamtion Card animation type.  'fade' | 'flip' Default: 'fade'
 * @param {number} opts.initial The initial number of social cards to display. Default is `25`.
 */
var Mosaic = function (opts) {
    opts = opts || {};

    ComponentBase.call(this, opts);

    this._collection = null;
    this._multiColumnView = null;
    this._theme = new ThemeManager(this._opts);

    this._opts.el = opts.el || this.el;

    if (opts.collection) {
        this.configure(this._opts);
    }
    else {
        console.warn('No collection specified');
    }
};
inheritPrototype(Mosaic, ComponentBase);

/**
 * Configure component
 * @param  {object} opts Configuration options passed from the constructor
 * @override
 */
Mosaic.prototype.configureInternal = function (opts) {
    this._opts = $.extend({}, this._opts, opts);
    
    // Configure defaults
    this._opts.initial = opts.initial || 25;
    this._opts.initialAnimation = opts.initialAnimation || InitialAnimationType.RANDOM;
    this._opts.cardAnimation = opts.cardAnimation || CardAnimationType.FADE;
    this._opts.uuid = this._uuid;
    this._opts.prefix = this.getPrefix();
    this._opts.bgCardColor = opts.bgCardColor || 'gray';
    
    // Merge the theme styles with the component styles.
    if (this._theme.theme != this._opts.theme) {
        this._theme.setTheme(this._opts);
    }
    
    this._opts = $.extend({}, this._opts, this._theme.getTheme());
    this.removeThemes();
    this.applyTheme(this._opts);
    
    /*
     * Safegaurd in the event someone tries to configure the component before
     * a collection/view have been created - only an issue on the first time
     * ever.
     */
    if (!opts.collection && !this._opts.collection) {
        return console.warn("No collection settings found.");
    }

    /*
     * If we get different collection settings, we need to unconfigure
     * the view and collection in order to re-configure.
     */
    if (opts.collection) {
        var oldCollection = this._collection;
        if(this._multiColumnView && oldCollection) {
            this.unconfigure();
        }
        
        this._collection = !this._opts.collection.pipe ? new Collection(this._opts.collection) : this._opts.collection;
        this._multiColumnView = new MultiColumnView(this._opts);
        this._collection.pipe(this._multiColumnView); 
    }

    // Check if element is added to stage. Specific for Designer integration
    StageManager.onStage(this._multiColumnView,
        function () {
            this.init();
        },
        function () {
        }
    );
};

/**
* Removes the dynamic theme that's been applied to
* the head so there aren't a build of of styles.
*/
Mosaic.prototype.removeThemes = function () {
    if (!this._themeStyler || !this._themeStyler.destroy) {
        return;
    }
    this._themeStyler.destroy();
};

/**
 * Return the Themable CSS file
 * @override
 */
Mosaic.prototype.getThemableCss = function () {
    return themableCss;
};

/**
 * Unconfigure the component
 * @override
 */
Mosaic.prototype.unconfigureInternal = function () {
    if (this._multiColumnView) {
        this._multiColumnView.el = null;
        this._multiColumnView = null;
    }

    if (this._collection) {
        this._collection.unpipe();
        this._collection = null;
    }
};

/**
 * Return package.json
 * @override
 * @return {JSON}
 */
Mosaic.prototype.getPackageJson = function () {
    return packageJson;
};

/**
 * Get class prefix
 * @override
 * @return {string}
 */
Mosaic.prototype.getPrefix = function () {
    return 'mosaic-component-uuid';
};

/**
 * Destroy the instance.
 * @override
 */
Mosaic.prototype.destroy = function () {
    this._multiColumnView.destroy();
    ComponentBase.prototype.destroy.call(this);
};

module.exports = Mosaic;