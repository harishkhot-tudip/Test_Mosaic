/**
 * StageManager
 */
var StageManager = Object.create({});

/**
 * Check to see if view has been added to the DOM
 * @param  {View} view View class that contains an el property
 * @param  {function} success Sucess callback
 * @param  {function} fail Fail callback
 * @public
 */
StageManager.onStage = function (view, success, fail) {
    var MAX_CHECK = 99;
    var CHECK_TIMER = 100;
    var counter = 0;
    var _el = view.el;
    var intervalId = setInterval(function () {
        if (!(_el instanceof HTMLElement)) {
            _el = document.querySelector(_el);
        }
        if (_el && _el.parentNode) {
            clearInterval(intervalId);
            if (typeof success === 'function') {
                success.call(this);
            }
        } else {
            counter++;
            if (counter >= MAX_CHECK) {
                clearInterval(intervalId);
                if (typeof fail === 'function') {
                    fail.call(this);
                }
            }
        }
    }.bind(view), CHECK_TIMER);
};

module.exports = StageManager;