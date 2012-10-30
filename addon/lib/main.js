/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";
const {Ci,Cu,Cc} = require("chrome");
const {AppViewer} = require("AppViewer");
const {Demographer} = require("Demographer");
const {setTimeout} = require("timers");
const {WindowTracker} = require("window-utils");
const request = require("request");

Cu.import("resource://gre/modules/Services.jsm", this);

// list of hosts granted access permission to apps installation list
const MOZAPP_PAGES_WHITE_LIST = [
  "https://newnewtab.mozillalabs.com/",
  "https://newnewtab-dev.mozillalabs.com/",
  "https://newnewtab-stage.mozillalabs.com/"
];

/**
 * User profile object
*/
function UserProfile() {
  this.demographer = new Demographer("Sites2Odp.txt");
}

const gUserProfile = new UserProfile();

function addApplicationFrame(document) {
try {
  let tabGrid = document.getElementById("newtab-grid");
  let lastRowDiv = tabGrid.querySelector(".newtab-row:last_child");
  let tabCell = tabGrid.querySelector(".newtab-cell:last_child");

  console.log( tabGrid );
  console.log( lastRowDiv );

  // Add a row and cell for the showing the app frame
  gUserProfile.demographer.pickRandomBest(function(cat) {
     console.log(cat);
     let req = request.Request({
          url: "https://sitesuggest.mozillalabs.com/" ,
          headers: { "Category": cat },
          onComplete: function(response) {
            console.log( "response" , response.status );
            if( response.status == 200 ) {
              console.log(JSON.stringify(response.json));
            }
          }
        });
       req.get();
  });
} catch ( ex ) {
  console.log( "Error " + ex );

}
}

exports.main = function(options) {
  // grant permissions to manage installed apps
  // and access AppCache
  MOZAPP_PAGES_WHITE_LIST.forEach(function(host) {
    let hostUri = Services.io.newURI(host, null, null);
    Services.perms.add(hostUri, "webapps-manage", Ci.nsIPermissionManager.ALLOW_ACTION);
    Services.perms.add(hostUri, "pin-app", Ci.nsIPermissionManager.ALLOW_ACTION);
    Services.perms.add(hostUri, "offline-app", Ci.nsIPermissionManager.ALLOW_ACTION);
  });

  // per-window initialization
  function onContentLoaded(event) {
    if (event.target.location == "about:newtab") {
      addApplicationFrame(event.target);
    }
  }

  // set up the window tracker
  let tracker = new WindowTracker({
    onTrack: function(window) {
      window.addEventListener("DOMContentLoaded", onContentLoaded);
    }, // end of onTrack

    onUntrack: function(window) {
      window.removeEventListener("DOMContentLoaded", onContentLoaded);
    } // end of onUntrack
  }); // end of wondow tracker
}
