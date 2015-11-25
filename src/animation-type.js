/**
 * Initial animation type and speed
 * @enum
 */
var InitialAnimationType = {
    LINEAR: 'linear',
    RANDOM: 'random',
    BASE_TIME: 100
};

/**
 * Card hover animation type
 * @enum
 */
var CardAnimationType = {
    FADE: 'fade',
    FLIP: 'flip'
};

module.exports = {
    InitialAnimationType: InitialAnimationType,
    CardAnimationType: CardAnimationType
};