var EventEmitter = require('event-emitter');
var inheritPrototype = require('mout/lang/inheritPrototype');

/**
 * QueueManager
 * @class
 * @augments {EventEmitter}
 */
var QueueManager = function () {
    /**
     * @super
     */
    EventEmitter.call(this);

    /**
     * Setup empty queue
     * @type {Array}
     */
    this.queue = [];
};
inheritPrototype(QueueManager, EventEmitter);

/**
 * Max views contained in queue array
 * @type {number}
 * @const
 */
QueueManager.MAX_VIEWS = 50;

/**
 * Add view to queue
 * @param {SingleCardView} view A single view
 * @public
 */
QueueManager.prototype.add = function (view) {
    /*
     * If the queue has more than our set MAX_VIEW, then
     * we should remove first item in the queue.
     */
    if (this.queue.length >= QueueManager.MAX_VIEWS) {
        this.queue.shift();
    }

    // If the view does not already exist in the view, lets add it
    if (this.queue.indexOf(view) === -1) {
        this.queue.push(view);
    }
};

/**
 * Get the view that was most recently added into the queue. Since we're
 * implementing a LIFO stack, we are calling pop() rather than shift()
 * @return {SingleCardView}
 * @public
 */
QueueManager.prototype.getView = function () {
    var view = this.queue.pop();
    return view;
};

/**
 * Get the length of the queue
 * @return {number} Length of queue
 * @public
 */
QueueManager.prototype.length = function () {
    return this.queue.length;
};

/**
 * Destroy
 * @public
 */
QueueManager.prototype.destroy = function () {
    this.queue = [];
    this.queue = null;
};

module.exports = QueueManager;