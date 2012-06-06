/* -*- Mode: JavaScript; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is SocialFox.
 *
 * The Initial Developer of the Original Code is The Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2012
 * the Initial Developer. All Rights Reserved.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var apiPort;

function log(msg) {
  dump(msg  +"\n");
}

function postAPIMessage(topic, data) {
  try {
    apiPort.postMessage({topic: topic, data: data});
  } catch (ex) {
    log("failed to post api message: " + ex);
  }
}

var count = 0;
onconnect = function(e) {
  var port = e.ports[0];

  port.onmessage = function(e) {
    if (e.data && e.data.data)
      log("onmessage details - topic is " + e.data.topic +
          "; data is " + e.data.data.type);

    var msg = e.data;
    if (!msg) {
      log("onmessage called with no data")
      return;
    }
    if (msg.topic == "social.port-closing") {
      if (port == apiPort) {
        apiPort.close();
        apiPort = null;
      }
      return;
    }
    if (msg.topic == "social.initialize") {
      // this is the port used by the API exposed to us by the social extension.
      apiPort = port;
      initializeAmbientNotifications();
    }

    if (msg.topic && handlers[msg.topic])
      handlers[msg.topic](port, msg.data);
    else
      log("message topic not handled: "+msg.topic)
  }
dump("TW Cookies: "+cookie+"\n");
}


var TWEET_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACa0lEQVQ4jcWTXUhTYRzGn/c9Zx9n0zMUnbqVdZgSzMIlqbUyN7FiwSIob4JoSER3Ud5FlBdG4IXQZUEJERjsyiDoItIohaCj9uFHJ1tbJp6ldM7ya9+ni9hcSdBF0HP5vu/ze5////++wP8W+duD/lOdAWN5hQAAwZs3ruXWKQAIgrANgOVP5o7Lvf0TjSf6Pzj2XyozsanCPQYA3F5vy1qg580ht7u+xm7jpLfjE/mbT3cGROfhbh1fioTBrH/PVbY5U/Lwl1AokgekE4nERV9L6ZBJOPbJ5uyo9vgvtNbVmqZevhi2nr36aJWvKKYcB41lAQB1FVbb5JOH9/MAVVVjmeT6Uryh/UyS49mUsYib4+2tTW2+4xF+Sy3hTCCUASEUhDJYJvoqIbEwsnuvx8vkooZmZ2Nd7c38R7O9Pmkws9DpoZhKK6meA2UYgPzsNyEEccLoYkJDwJVVxvMAAImv83OhPe6DR1RqLE6yBpawLAjdMOck0JTi1Kdl/dr3xUIAotHoSmM5F+WrdzTNU64EhG4yZ7Us/KvTg8zrp3c/vxt7zpzs6u5blyMzqqrGAGREUZw82t66b8pYuZNQ+us8NQ1CelmZud1zLhgMPpYkKcJas8uztvPXn9Wk44ohk1QnzDbPA7YErKZteg+WTDzuWXx158roaH7MzKK8MNfRUJvWWe01I0XbDzBFPFijCYRhN+JrGnZpK7Lv29i9W329vaqqruQAuQINgUDA52pu8S5Zqlxhym8FoYCWhU1bj5bFlYgijQ8NDAwMhsNhuTDV73/B4vf7XQ6HQyhorCxJUlgUxZlNNf0L/QAzY+AJyWBqdwAAAABJRU5ErkJggg==";

var handlers = {
  connect: function(port, data) {
  },
  reconnect: function(port, data) {
  },
  shownotification: function(port, data) {
    Notification(data.icon, data.title, data.text).show();
  },
  updateAmbientNotificationArea: function(port, data) {
    updateAmbientNotificationArea(profile, msgCount);
  },
  // These are the messages from the social extension which forms part of
  // its API.
  'social.user-recommend-prompt': function(port, data) {
    port.postMessage({topic: 'social.user-recommend-prompt-response',
                      data: {
                        message: "Tweet",
                        img: TWEET_IMG
                      }
                     });
  },
  'social.user-recommend': function(port, data) {
    log("Twitter got tweet request for " + data.url);
    // and for now we just assume we did something.
  },
  'social.notification-click': function(port, data) {
    dump("Hey - the user clicked on " + data.id);
  },
  'twitter.currentUser': function(port, data) {
    // bounce the user data into the socialAPI
    dump("setting twitter current user portrait to " + data.portrait_url + "\n");
    postAPIMessage('social.ambient-notification-area', { portrait: data.portrait_url });
  }
}

function initializeAmbientNotifications() {
  // Always set the background color:
  // postAPIMessage('social.ambient-notification-area', {background: 'rgb(59,59,59)'});
}
