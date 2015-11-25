# Mosaic Component
Mosaic componenet is a beautiful [streamhub app](http://apps.livefyre.com) powered by Livefyre content.

## Example
[Codepen example](http://codepen.io/anon/pen/xGmKmQ?editors=100)

## Usage
The quickest way to use the mosaic component is to use the built version hosted on Livefyre's CDN.

1. Add Livefyre.js to your page

    ```javascript
    <script src="//cdn.livefyre.com/Livefyre.js">
    ```
2. Place an HTML container on the page with a unique ID so that you can target it. Example:

    ```javascript
    <div id="mosaic"></div>
    ```

3. Require the app onto using Livefyre.require method and start your mosaic experience.

    ```javascript
    <script>
      var Mosaic = Livefyre.require(['mosaic-component#0'], function (Mosaic) {
        var mosaic = window.lfMosaic = new Mosaic({
          el: document.getElementById('mosaic'),
          collection: {
            network: 'client-solutions.fyre.co',
            siteId: '376431',
            articleId: 'custom-1437089633525'
          }
        });
      });
    </script>
    ```

## Configuration Options
* `el` - **Required** The element for the component to render in.
* `collection` - **Required** The Livefyre collection object denoting which collection to use.
  * `network` - **Required** Your Livefyre network name (e.g. exmaple.fyre.co).
  * `siteId` - **Required** Your Livefyre site id (e.g. 1234567890).
  * `articleId` - **Required** The unique identifier for the Livefyre collection.
* `initialAnimation` - Animation type to use when the application first boots up. Options are `random` and `linear`. Default is `random`.
* `cardAnimation` - Card animation type to use when hovering over a social card. Options are `fade` and `flip` Default is `fade`.
* `fontFamily` - Which web font you'd like to use for the text. This must be a browser acceptable font-family.
* `initial` - The initial number of pieces of content to display. Default is `25`.
* `theme` - Which, if any, theme you'd like to use. Options are `light` and `dark`. Default is `light`/
* `bgCardColor` - Card's background color which is displayed before image gets loaded. Defalt is 'gray'.


## Development

### Local Dev:
* Install stuff - `make install`
* Runs a server and watcher for changed files - `make`

### Building
To package everything up for the deployment, run `make build`.