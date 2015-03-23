# Revision History #

  * **Apr 20, 2011 (rev cd31cc2645e3)** Mostly a code clean-up (more jQuery stuff) and re-work of the Climate module. Now the HTML code for Weather display will be generated from JS instead of using previously hard-coded one in panel.htm. The corresponding CSS was updated for 'absolute' placement of the Weather info.

  * **Apr 15, 2011 (rev 8d356cc90b80)** The source code was updated with more of the native jQuery code (vs direct DOM manipulations).

  * **Apr 11, 2011 (rev 4b4928a1f1cb)** Introducing a **new feature** - Shortcuts. It allows you to add buttons in the navigation menu (through config file) that will load your favorite sites in a frame within ISY Panel. For example you can load Pandora or your favorite Google service. There's a catch though - some sites (like Twitter and Facebook) will not allow you to load them in the frame. In that case they will open full screen, replacing the ISY Panel GUI.

  * **Apr 6, 2011 (rev 1ee251dcc942)** Since I'm writing the source for ISY Panel on different computers/platforms (both on Mac and in Windows) I use [Komodo editor](http://www.activestate.com/komodo-edit), which is a nice cross-platform editor. This revision adds Komodo project file that simplifies project maintenance.

  * **Apr 6, 2011 (rev 8c4bb769b5da)** Introducing a **new feature** - support for ISY's Climate module. You have to configure Climate module in ISY, before you'll see a weather info in the top right corner (or wherever you'll place it through your panel's CSS)

  * **Apr 1, 2011 (rev 9fa6c3ab89fb)** This revision was no joke! It brings lots of code changes. Improved handling of the webcams (you no longer need to set ID attribute for each camera, they will be auto-generated). Implemented re-usable error handler function (this avoids duplicated code). Added more in-code documentation in main.js. Added support for pretty weather forecast from Wunderground.com. Added ability to control height of the log pane through CSS instead of using hard-coded value in main.js