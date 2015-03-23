# Config.js #

Config.js is a [JSON](http://json.org/) object that holds configuration for all your panels. It allows to create as many panels as you need and define unique style for each one (or share same style between two or more panels, if you choose).

Maybe sometime in the future there will be a tool that will help you to create and save configuration data for ISY Panel, but for now, to successfully edit this file you have to be somewhat familiar with JavaScript language.

After editing Config.js in your favorite text editor I would strongly recommend to use [JSONLint](http://www.jsonlint.com/) and/or [JSON Viewer](http://jsonviewer.stack.hu/) to validate and visualize your configuration BEFORE uploading it to ISY.


## STRUCTURE OF CONFIG.JS ##

There are two types of variables in config.js - _global_ and _panel-specific_. The former applies to the entire configuration and should be set only once. The latter are setting properties of each particular panel and therefore will appear as many times as many panels you want to define. Global variables start with an UPPERCASE letter, where panel-specific start with lowercase.

All fields are **required**, unless specifically mentioned otherwise.


### GLOBAL VARIABLES ###

  * `IsOffline (bool)`
> > Set to `false` before uploading config.js to ISY.
> > Set to `true` for development. When `IsOffline` is set to `true`:
  1. logging window will be enabled automatically
  1. placeholder images will be used instead of actual camera JPEGs
  1. no commands will be sent to ISY, but will be logged

  * `ShowLog (bool)`
> > Set to `true` to show debug/logging area

  * `EnableLog (bool)`
> > Set to `true` to automatically enable log at start up.

  * `Name (string)`
> > What ever name you want to give to your config. It will appear on the first button in the GUI that allows to refresh (re-display) all controls.

  * `ZipCode (string)`
> > 5-digit US zip code. It will be used to display weather forecast (currently in the works).

  * `Panels (array)`
> > This array holds configuration for each and every panel.


### PANEL-SPECIFIC VARIABLES ###

  * `addr (string)`
> > A list of ip addresses or hash markers to which this panel will be shown

  * `admin (bool)`
> > Allow to show advanced controls (Devices, Scenes and Programs)?

  * `name (string)`
> > Name of the panel

  * `css (string)`
> > CSS file for this panel

  * `webcams (array) optional`
> > An array of web/ip camera configurations ([see below for details](configjs#WEBCAMS_CONFIGURATION.md))

  * `shortcuts (array) optional`
> > An array of values that will create buttons in the menu to navigate to your favorite websites ([see below for details](configjs#SHORTCUTS_CONFIGURATION.md))

  * `areas (array)`
> > An array of locations such as rooms or other logical groups of controls  ([see below for details](configjs#AREAS_CONFIGURATION.md)).


#### AREAS CONFIGURATION ####

The following values define parameters of the `areas` array element.

  * `name (string)`
> > Label for the group of controls.

  * `controls (array)`
> > An array of actual controls (lights, devices). The **ON** and **OFF** buttons will be generated for each element of this array.


##### CONTROLS CONFIGURATION #####

The following values define parameters of the `controls` element of the `areas` array.

  * `name (string)`
> > Label for the control (ex. `name: "Bar"`).

  * `addr (string)`
> > ISY address for this control. It could be INSTEON ID, scene ID or program ID.


#### WEBCAMS CONFIGURATION ####

The following values define parameters of the `webcams` array element.

  * `name (string)`
> > Name of the camera. Ex: `"name": "Living Room"`

  * `addr (string)`
> > IP address or DDNS domain name of the camera, including the protocol. If you want to be able to access your camera images from outside network do not use local IP address, use DDNS instead. Ex: `"addr": "http://192.168.1.10"`. You can also specify port number here if needed. Ex: `"addr": "http://192.168.1.10:82"`.

  * `imgUrl (string)`
> > URL to static JPEG image. Complete path to the image


#### SHORTCUTS CONFIGURATION ####

The following values define parameters of the `shortcuts` array element.

  * `name (string)`
> > Name of the website as appears on the button. Ex: `"name": "Pandora"`

  * `addr (string)`
> > URL of the page. Ex: `"addr": "http://pandora.com"`.


