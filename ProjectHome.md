# ISY Panel #

ISY Panel is a location-driven AJAX GUI system for ISY-99i home automation controller

The idea behind this project is to create a fairly flexible and expandable, location-based GUI system for ISY-99i home automation controller to drive LCD touch panels, iOS / Android devices, etc., throughout the house.


## HARDWARE REQUIREMENTS ##

  * ISY-99i controller.
  * Some INSTEON modules to control lights and devices.
  * Networking module for ISY-99i (ISY Panel is hosted **inside** ISY-99i)
  * Google Chrome browser support on your touch panels. ISY Panel may work just fine on other browsers, but Chrome provides ability to save web page as an Application (see menu Tools/Create application shortcuts...), which comes in handy.
  * Each device/panel on a local network should have static (reserved) IP address, either configured manually or assigned by DHCP.


## A BIT OF THE BACKGROUND ##

A company named [Universal Devices](http://universal-devices.com) manufacturers tiny, but smart, home automation controller called ISY-99i. The "i" in its name stands for [INSTEON](http://smarthome.com) which is a dual-mesh (Power line + RF) home automation protocol which allows to remotely control devices and lights either plugged or wired in to control modules, switches, dimmers, etc.

ISY-99i (later we will just call it "ISY") allows you to monitor status (ON/OFF state, brightness, etc.) of all devices in the home, as well as create advanced algorithms based on events, time of day, sensors, etc., to automatically control INSTEON modules. For example, ISY can automatically turn on the lamp when you enter a dark room, or it could turn off the porch lights at dawn, saving you money. The actual scenarios could be much more elaborate, though.

ISY controller provides advanced Java-based administrative interface for configuring your home automation network and programming the algorithms.

It also has a basic web interface to control all configured (in ISY) devices from any computer or mobile device with a web browser. The key word in the previous sentence is "basic". The basic HTML user interface (UI) gets the job done just fine, but it's just a few white pages with tables and plain-looking buttons in them. Not so pretty. Fortunately, ISY provides a few technical pieces that allow third-party developers to create a nicer looking interfaces. There are a few very nice looking ones already on the market. Some of them target mobile devices (like iPhone or Android), some target large HDTV screens. But none of them provide the interface that is customized to a particular location (like Kitchen or Bedroom). This is where this project - ISY Panel - comes in.


## THE DESIGN IDEA ##

Here's a quick quiz for you: Does it make much sense to you to show Master Bedroom controls in the Kitchen? Or showing webcam images of the room you are in right now? How about showing all the gazillion controls you might have in your home on your kid bedroom's touch panel?

If you answered "No" to at least one of the above questions then ISY Panel might be right for you.


See [Screenshots](http://code.google.com/p/isy-panel/wiki/Screenshots) and [Wiki](https://code.google.com/p/isy-panel/w/list) for more information.