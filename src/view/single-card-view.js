'use strict';

var $ = require('jquery');
var cardTmpl = require('hgn!./templates/card');
var util = require('streamhub-sdk/util');
var StreamhubShareButton = require('streamhub-share');

// Get user link based on content type
function getUserLink(content) {
    if (content.source === 'instagram') {
        return content.author.profileUrl;
    }

    if (content.source === 'twitter') {
        var base = 'http://twitter.com/intent/user?user_id=';
        var userId = content.author.twitterUserId;
        return base + userId;
    }

    if (content.source === 'facebook') {
        return content.author.profileUrl;
    }
}

// Get source url based on content type
function getSourceUrl(source) {
    var protocol = 'https://';
    if (source === 'instagram') {
        return protocol + 'instagram.com';
    }

    if (source === 'twitter') {
        return protocol + 'twitter.com';
    }

    if (source === 'facebook') {
        return protocol + 'facebook.com';
    }
}

/**
 * SingleCardView
 * @class
 */
var SingleCardView = function (opts) {
    this.content = opts.content;
    this.el = document.createElement('div');
    this.$el = $(this.el);

    var self = this;

    var imageSrc = null;
    if (this.content.attachments.length) {
        if (this.content.attachments[0].url) {
            imageSrc = this.content.attachments[0].url;
        }
        else {
            imageSrc = this.content.attachments[0].thumbnail_url;
        }
    }

    // facebook does not have display user handle, but a profile link
    var userhandle = (this.content.source !== 'facebook') ?
                        '@' + this.content.author.profileUrl.split('.com/')[1] :
                        '';

    var userLink = {
        url: getUserLink(this.content),
        target: '_blank'
    };

    // Ensure that this.content.body has a p tag
    var isHtml = /^\s*<(p|div)/;
    if ( !isHtml.test(this.content.body)) {
        this.content.body = '<p>' + this.content.body + '</p>';
    }

    this.el.innerHTML = cardTmpl({
        imageSrc: imageSrc || 'http://placehold.it/200x200',
        body: this.content.body,
        source: this.content.source,
        sourceHomeUrl: getSourceUrl(this.content.source),
        useravatar: this.content.author.avatar,
        username: this.content.author.displayName,
        userhandle: userhandle,
        userLinkUrl: userLink.url,
        userLinkTarget: userLink.target,
        formattedCreatedAt: util.formatDate(this.content.createdAt)
    });

    this.$contentContainer = this.$el.find('.content-container');
    this.$shareControlsContainer = this.$el.find('.content-share-controls');

    // TODO: this part could probably be a partial
    if (this.content.source !== 'twitter') {
        // @comment disabled for now at the request of @bo
        // var sharebutton = new StreamhubShareButton({
        //     el: this.$shareControlsContainer,
        //     content: this.content
        // });
    }
    else {
        var actionButtons = [
            {
                className: 'content-action content-action-reply',
                buttonUrl: 'https://twitter.com/intent/tweet?in_reply_to=' + this.content.tweetId
            },
            {
                className: 'content-action content-action-retweet',
                buttonUrl: 'https://twitter.com/intent/retweet?tweet_id=' + this.content.tweetId
            },
            {
                className: 'content-action content-action-favorite',
                buttonUrl: 'https://twitter.com/intent/favorite?tweet_id=' + this.content.tweetId
            }
        ];

        actionButtons.forEach(function (elem) {
            var a = document.createElement('a');
            a.href = elem.buttonUrl;
            a.className = elem.className;
            a.target = '_blank';
            self.$shareControlsContainer.append(a);
        });
    }
};

SingleCardView.cardWidth = 200;
SingleCardView.cardHeight = 200;

/**
 * Show
 * @param  {number} delay Delay for animation, if any.
 */
SingleCardView.prototype.show = function (delay) {
    var self = this;
    delay = delay || 0;
    setTimeout( function () {
        self.$el.parents('.card-container').css("background-color","white");
        self.$contentContainer.animate({'opacity': 1}, 100);
    }, delay);
};

/**
 * Destroy
 * @public
 */
SingleCardView.prototype.destroy = function () {
    this.el = null;
    this.$el = null;
    this.fullImage = null;
    this.smallImage = null;
    this.$contentContainer = null;
};

/**
 * Render stub
 * @public
 */
SingleCardView.prototype.render = function () {};

module.exports = SingleCardView;