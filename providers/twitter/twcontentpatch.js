window.log = function log(msg) {
  dump(new Date().toISOString() + " [patch]: " + msg + "\n");
}

window.log("Starting up " + window.location);

// tell the worker that this port is for the arbiter.
navigator.mozSocial.getWorker().port.postMessage(
  {topic: "initialize"}
);

{
  window.addEventListener("load", function(e) {
    window.bust = function(){}

    // Do whatever you need to do

    window.document.getElementById("page-container").style.padding="2px 0px 0px";
    window.document.getElementById("global-actions").style.display="none";
    window.document.getElementsByClassName("topbar").item(0).style.display = "none";
    window.document.getElementsByClassName("larry-topbar").item(0).style.display = "none";
    //window.document.getElementsByClassName("nav-me").item(0).style.display = "none";
    
    window.document.getElementsByClassName("dashboard").item(0).style.display = "none";
    window.document.getElementsByClassName("content-main").item(0).setAttribute("style", "float:left;font-size:8pt;width:238px;line-height:125%");
    window.document.getElementsByClassName("header-inner").item(0).style.display = "none";

    var avatar = window.document.getElementsByClassName("avatar").item(0);
    // send the worker the currentUser data
    dump("setting twitter current user portrait to " + avatar.src  +"\n");

    navigator.mozSocial.getWorker().port.postMessage(
      {topic: "twitter.currentUser", data: {portrait_url: avatar.src}}
    );

    /*try {
      window.document.getElementById("header").style.display ="none";
    } catch (e) {
      logExternal("Can't hide header: " +e);
    }
    var profile = typeof window.FbdGraphService != "undefined" ?
                  window.FbdGraphService.profileInfo : null;
    if (profile) {
      port.postMessage(
        {topic: "updateAmbientNotificationArea",
         data: profile
        }
      );
    }*/
  }, false);
}
