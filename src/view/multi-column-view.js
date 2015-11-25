'use strict';

var $ = require('jquery');
var EventEmitter = require('event-emitter');
var shuffle = require('mout/array/shuffle');
var inheritPrototype = require('mout/lang/inheritPrototype');
var QueueManager = require('../queue');
var SingleCardView = require('./single-card-view');
var InitialAnimationType = require('./../animation-type').InitialAnimationType;
var CardAnimationType = require('./../animation-type').CardAnimationType;
var ContentListView = require('streamhub-sdk/content/views/content-list-view');
var TwitterContentView = require('streamhub-sdk/content/views/twitter-content-view');
var MultiColumnViewTmpl = require('hgn!./templates/multi-column-view');

/**
 * Main View
 * @class
 * @augments {ContentListView}
 */
var MultiColumnView = function (opts) {
    /**
     * @super
     */
    ContentListView.call(this, opts);

    /**
     * Setup card width
     * @type {number}
     */
    this._cardWidth = SingleCardView.cardWidth || 200;

    /**
     * Setup card height
     * @type {number}
     */
    this._cardHeight = SingleCardView.cardHeight || 200;

    /**
     * Column style calculation for this instance of Mosaic
     * @type {HTMLStyleElement}
     */
    this._style = null;

    /**
     * Interval reference for stream checking
     * @type {number}
     */
    this._streamInterval = 0;

    /**
     * Interval reference for queue checking
     * @type {Number}
     */
    this._queueInterval = 0;

    /**
     * Interval checking for when animation is ready
     * @type {Number}
     */
    this._initAnimationReady = 0;

    /**
     * Instance container width
     * @type {number}
     */
    this._containerInnerWidth = null;

    /**
     * Calculated # of columns
     * @type {number}
     */
    this._numberOfColumns = null;

    /**
     * Counter to determine if we have loaded up to the max
     * @type {Number}
     */
    this._initialLoadCounter = 0;

    /**
     * Loaded to capacity or not
     * @type {boolean}
     */
    this._reachedLoadCapacity = false;

    /**
     * Initial animation type
     * @type {string}
     */
    this._initialAnimation = this.opts.initialAnimation;

    /**
     * Single Card hover animation type
     * @type {string}
     */
    this._cardAnimation = this.opts.cardAnimation;

    /**
     * Single Card backgroundColor
     * @type {string}
     */

    this._bgCardColor = this.opts.bgCardColor;

    /**
     * Unique CSS selector for this instance
     * @type {String}
     */
    this._uniqueSelector = '[' + this.opts.prefix + '="' + this.opts.uuid + '"]';

    /**
     * QueueManager
     * @type {QueueManager}
     */
    this._queueManager = new QueueManager();

    /**
     * Show More button removed
     * @type {Element}
     */
    this._$showMore = this.$el.find(MultiColumnView.prototype.showMoreElSelector).remove();
};
inheritPrototype(MultiColumnView, ContentListView);

// instance setup
MultiColumnView.prototype.elClass += ' mosaic-component';
MultiColumnView.prototype.template = MultiColumnViewTmpl;
MultiColumnView.prototype.listElSelector = '.lf-mosaic-wrap';
MultiColumnView.prototype.cardContainerClass = '.card-container';
MultiColumnView.prototype.showMoreElSelector = '.lf-mosaic-show-more';

/**
 * No comparator since Mosaic is random placement
 * @override
 */
MultiColumnView.prototype.comparator = null;

/**
 * we're handling view removal on our own in here.
 * MutliColumnView does its own thing, we dont need you ContentListView.
 * @override
 */
MultiColumnView.prototype.remove = function (view) {};

/**
 * Kick it all off
 * @public
 */
MultiColumnView.prototype.init = function () {
    this.showMore();
    this._addEventListeners();
    this._findNumColumns();
    this._startStreamCheck();
    this._startQueueCheck();
};

/**
 * Check stream every minute for new content
 * @param  {number} time (Optional)
 * @private
 */
MultiColumnView.prototype._startStreamCheck = function (time) {
    var interval = typeof time === 'number' || 60000;
    this._streamInterval = setInterval(function () {
        this.showMore();
    }.bind(this), interval);
};

/**
 * Interval for checking the queue
 * @param  {number} time (Optional)
 * @private
 */
MultiColumnView.prototype._startQueueCheck = function (time) {
    var interval = typeof time === 'number' || 4000;
    this._queueInterval = setInterval(function () {
        this._checkQueue();
    }.bind(this), interval);
};

/**
 * Check queue to see if we have items to place
 * @private
 */
MultiColumnView.prototype._checkQueue = function () {
    if (this._queueManager.length() <= 0) {
        return;
    }
    this._insertAtRandom(this._queueManager.getView());
};

/**
 * Intro Animation
 * @private
 */
MultiColumnView.prototype._introAnimation = function () {
    /*
     * We'll keep clearing the timeout as long as we are still adding new cards
     * to the stage. Once the last card is added, the time out will finally go
     * through and trigger the animation start.
     */
    if (this._initAnimationReady) {
        clearTimeout(this._initAnimationReady);
    }
    this._initAnimationReady = setTimeout( function () {
        var animationArray = (this._initialAnimation === InitialAnimationType.RANDOM) ?
                                shuffle(this.views) :
                                this.views;

        this._findOutliers();

        for (var i = 0; i < animationArray.length; i++) {
            var delay = i * InitialAnimationType.BASE_TIME;
            var view = animationArray[i];
            view.show(delay);
        }
    }.bind(this), 3000);
};

/**
 * Insert a card at a random position in the Mosaic grid
 * @param  {SingleCardView} newView
 * @private
 */
MultiColumnView.prototype._insertAtRandom = function (newView) {
    var self = this;
    var randomIndex = getRandomIndex();
    var oldView = getViewToReplace();

    // Get random index from the list of views
    function getRandomIndex() {
        randomIndex = Math.floor(Math.random() * self.views.length);
        return randomIndex;
    }

    // Get the random view
    function getViewToReplace() {
        return self.views[getRandomIndex()];
    }

    // remove oldView from the views array
    this.views.splice(randomIndex, 1);

    // add the new view into the views array at the
    // same index as OldView
    this.views.splice(randomIndex, 0, newView);

    // insert on top of existing view
    oldView.$el.parent().append(newView.el);

    setTimeout(function() {
        // show the view
        newView.show();
        setTimeout(function () {
            // remove the oldView and cleanup
            oldView.$el.remove();
            oldView.destroy();
            oldView = null;
        }, 500);
    }, 1000);

    this._findOutliers();
};

/**
 * Only add content that has image attachments.
 * Doesn't make since for an image Mosaic to have non-image content
 * @override
 */
MultiColumnView.prototype.add = function(content, forcedIndex, opts) {
    // if we have attachments, lets call super and be awesome
    if (content.attachments.length > 0) {
        // image is success
        var success = function(e) {
            // increment load counter
            this._initialLoadCounter++;
            ContentListView.prototype.add.call(this, content, forcedIndex, opts);
        };
        // image can't be loaded
        var error = function (e) {};

        /*
         * I am expecting images to loaded correctly, so we'll test to see
         * if the image can be loaded successful. Doing this because for some
         * reason instagram cdn returns 400 bad request. So we should be smart
         * and check all images.
         */
        var img = document.createElement('img');
        img.onload = success.bind(this);
        img.onerror = error.bind(this);
        img.src = content.attachments[0].url;
    }
};

/**
 * Insert into DOM
 * @override
 */
MultiColumnView.prototype._insert = function (view, forcedIndex) {
    // view list should only contain the max # of items.
    this.views = this.views.slice(0, this._maxVisibleItems);

    /*
     * We are only adding up to the defined number of items allowed. After we
     * have reached loaded capacity, lets move the extra, including new items
     * from the stream into the queue.
     */
    if (this._reachedLoadCapacity) {
        this._initialLoadCounter = null;
        this._queueManager.add(view);
        return;
    }

    /*
     * If we are under the defined initial amount, lets keep adding it to the
     * stage.
     */
    if (this._initialLoadCounter <= this._maxVisibleItems) {
        var cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.setAttribute("style","background-color:"+this._bgCardColor +"; border:solid 1px white;");

        var div = document.createElement('div');
        cardContainer.appendChild(div);
        div.appendChild(view.el);

        this._findOutliers();
        this._introAnimation();

        return this.$listEl.append(cardContainer);
    }
    // We have reached loaded capacity
    else {
        this._reachedLoadCapacity = true;
    }
};

/**
 * Find all outliers
 * @private
 */
MultiColumnView.prototype._findOutliers = function () {
    // Reset everything first
    for (var i = 0; i < this.views.length; i++) {
        var card = this.views[i];
        card.$el.parents('.card-container').removeClass('outlier');
    }

    // if we dont have enough for one row, lets display what we have
    if (this.views.length <= this._numberOfColumns) {
        return;
    }

    // if we dont have any outliers, lets not do anything.
    // we have a perfect grid
    if ((this.views.length % this._numberOfColumns) <= 0) {
        return;
    }

    // how many outliers do we have
    var outliers = this.views.length % this._numberOfColumns;

    // Grab the views that are outliers
    var cardViewsCopy = this.views.slice(this.views.length - outliers);

    // set the outliers
    for (var j = 0; j < cardViewsCopy.length; j++) {
        var outlierCard = cardViewsCopy[j];
        outlierCard.$el.parents('.card-container').addClass('outlier');
    }
};

/**
 * Create an instance of SingleCardView
 * @override
 */
MultiColumnView.prototype.createContentView = function (content) {
    var view = new SingleCardView({content: content});
    return view;
};

/**
 * Find number of columns
 * @private
 */
MultiColumnView.prototype._findNumColumns = function () {
    if (this._containerInnerWidth === this.$el.innerWidth()) {
        return;
    }
    this._containerInnerWidth = this.$el.innerWidth();
    var numColumns = parseInt(this._containerInnerWidth / this._cardWidth, 10);

    // Always set to at least one column
    this._setColumns(numColumns || 1);
};

/**
 * Set the number of columns for css
 * @param {number} numCols number of columns to set
 * @private
 */
MultiColumnView.prototype._setColumns = function (numCols) {
    if (numCols === this._numberOfColumns) {
        return;
    }
    this._numberOfColumns = numCols;
    this._setColumnStyle({
        width: 'calc(100% / ' + this._numberOfColumns +')'
    });
};

/**
 * Sets CSS for column width
 * @private
 */
MultiColumnView.prototype._setColumnStyle = function (styles) {
    if (!this._style) {
        this._style = document.createElement('style');
        this._style.type = 'text/css';
    }

    var css = '';
    for (var prop in styles) {
        if (styles.hasOwnProperty(prop)) {
            css += prop + ': ' + styles[prop] + ';';
        }
    }
    css = '{' + css + '}';
    var colCss = this._uniqueSelector + ' ' + MultiColumnView.prototype.listElSelector + ' ' + MultiColumnView.prototype.cardContainerClass + ' ' + css;

    this._style.textContent = document.createTextNode(colCss).textContent;
    document.head.appendChild(this._style);
};

/**
 * Handle debounced resize event
 * @private
 */
MultiColumnView.prototype._resize = function (e) {
    debounce(this._debounceResize.bind(this, e), 100);
};

/**
 * Resize Event
 * @private
 */
MultiColumnView.prototype._debounceResize = function (e) {
    this._findNumColumns();
    this._findOutliers();
};

/**
 * Setup required event listeners
 * @private
 */
MultiColumnView.prototype._addEventListeners = function () {
    window.addEventListener('resize', this._resize.bind(this));
};

/**
 * Event cleanup
 * @private
 */
MultiColumnView.prototype._removeEventListeners = function () {
    window.removeEventListener('resize', this._resize.bind(this));
};

/**
 * Destroy
 * @override
 */
MultiColumnView.prototype.destroy = function () {
    ContentListView.prototype.destroy.call(this);
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not be triggered.
 * The function will be called after it stops being called for N milliseconds.
 * Copied from Underscore.js (MIT License) http://underscorejs.org/docs/underscore.html#section-65
 * @param func {function} The function to debounce
 * @param wait {number} The number of milliseconds to wait for execution of func
 * @param immediate {boolean} trigger the function on the leading edge, instead of the trailing.
 * @return {function} A debounced version of the passed `func`
 */
function debounce (func, wait, immediate) {
    var timeout, result;
    var context = this,
        args = arguments;
    var later = function() {
        timeout = null;
        if (!immediate) {
            result = func.apply(context, args);
        }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
        result = func.apply(context, args);
    }
    return result;
}

module.exports = MultiColumnView;