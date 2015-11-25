requirejs.config({
    baseUrl: '/',
    paths: {
        'app-base': 'lib/app-base/main',
        base64: 'lib/base64/base64',
        chai: 'lib/chai/chai',
        'chai-jquery': 'lib/chai-jquery/chai-jquery',
        debug: 'lib/debug/debug',
        'event-emitter': 'lib/event-emitter/src/event-emitter',
        hgn: 'lib/requirejs-hogan-plugin/hgn',
        hogan: 'lib/hogan/web/builds/2.0.0/hogan-2.0.0.amd',
        inherits: 'lib/inherits/inherits',
        jquery: 'lib/jquery/jquery',
        json: 'lib/requirejs-plugins/src/json',
        'livefyre-package-attribute': 'lib/livefyre-package-attribute/src/main',
        mout: 'lib/mout/src',
        'node-uuid': 'lib/node-tiny-uuid/index',
        text: 'lib/requirejs-text/text',
        tinycolor: 'lib/tinycolor/tinycolor'
    },
    packages: [{
        name: "streamhub-sdk",
        location: "lib/streamhub-sdk/src"
    }, {
        name: "streamhub-sdk/auth",
        location: "lib/streamhub-sdk/src/auth"
    }, {
        name: "streamhub-sdk/collection",
        location: "lib/streamhub-sdk/src/collection"
    }, {
        name: "streamhub-sdk/content",
        location: "lib/streamhub-sdk/src/content"
    }, {
        name: "streamhub-sdk/modal",
        location: "lib/streamhub-sdk/src/modal"
    }, {
        name: "streamhub-sdk-tests",
        location: "lib/streamhub-sdk/tests"
    }, {
        name: "streamhub-ui",
        location: "lib/streamhub-ui/src"
    }, {
        name: "stream",
        location: "lib/stream/src"
    }, {
        name: 'streamhub-share',
        location: 'lib/streamhub-share/src',
        main: 'share-button.js'
    }, {
        name: "livefyre-bootstrap",
        location: "lib/livefyre-bootstrap/src"
    }, {
        name: 'livefyre-theme-styler',
        location: 'lib/livefyre-theme-styler/src'
    }, {
        name: "auth",
        location: "lib/auth/src"
    }, {
        name: "view",
        location: "lib/view/src",
        main: "view"
    }, {
        name: "css",
        location: "lib/require-css",
        main: "css"
    }, {
        name: "mosaic-component",
        location: "src"
    }],
    shim: {
        jquery: {
            exports: '$'
        }
    },
    urlArgs: "_=" + (new Date()).getTime()
});
