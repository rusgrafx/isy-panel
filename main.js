/*
 * ISY Panel - web interface for ISY-99i home automation controller
 * http://code.google.com/p/isy-panel/
 *
 * Copyright 2011, Ruslan Ulanov
 *
 * This file is part of ISY Panel.
 *
 * ISY Panel is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * ISY Panel is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ISY Panel. If not, see <http://www.gnu.org/licenses/>.
 */
var ISYPanel = {
	
	Initialized: false,
	
	PanelId: null,
	
	CONFIG: null,
	
	IsyModules: {}, // will store installed ISY modules
	
	/**
	* Loads panel configuration from the JSON file.
	* If config was successfully loaded (and parsed) then initializes the application.
	*/
	LoadConfig: function()
	{
		jQuery.ajax("./config.js", [ dataType="json" ])
		.error(
			function() {
				ISYPanel.showError('CONFIGNOTLOADED');
			}
		)
		.success(
			function(data) {
				ISYPanel.CONFIG = jQuery.parseJSON(data);
				ISYPanel.Init();
			}
		);
		return false;
	},
	
	/**
	* This is the main entry into the ISY Panel.
	* It prepares the GUI components and loads controls for specific panel.
	*/
	Init: function()
	{
		// Double check that CONFIG is ready
		if (! ISYPanel.CONFIG) {
			ISYPanel.showError('CONFIGISBROKEN');
			return -1;
		}
		
		// Hide status/log area
		if (! ISYPanel.CONFIG.ShowLog) {
			$('#frameStatus').hide();
		}
		
		// Enable logging
		if (ISYPanel.CONFIG.ShowLog && ISYPanel.CONFIG.EnableLog && document.getElementById('chkEnableLog')) {
			ISYPanel.enableLog();
		}
		
		// Auto enable logging in OFFLINE mode
		if (ISYPanel.CONFIG.ShowLog && ISYPanel.CONFIG.IsOffline && document.getElementById('chkEnableLog')) {
			ISYPanel.enableLog();
			ISYPanel.log('Warning: ISYPanel is running in Offline mode! Set CONFIG.IsOffline to false before uploading to ISY.');
		}
		
		// Set caption of the Home button
		if (ISYPanel.CONFIG.Name) {
			$('#btnHome').text(ISYPanel.CONFIG.Name);
		}
		
		// Assign handlers to default menu buttons
		$('#btnHome').bind('click', ISYPanel.loadControls);
		$('#btnWeather').bind('click', ISYPanel.loadWeather);
		$('#btnDevices').bind('click', ISYPanel.loadDevices);
		$('#btnScenes').bind('click', ISYPanel.loadScenes);
		$('#btnPrograms').bind('click', ISYPanel.loadPgms);
		$('#btnClearLog').bind('click', ISYPanel.ClearLog);
		$('#btnExpandLog').bind('click', ISYPanel.ExpandLog);
		$('#chkPollCameras').bind('click', ISYPanel.chkPollCameras_CheckEventHandler);
		
		// Get Id for current panel
		var ip = ISYPanel.getIP();
		ISYPanel.PanelId = ISYPanel.getPanelId(ip);
		
		// Generate controls for current pannel
		ISYPanel.generateControls();
		ISYPanel.generateShortcutButtons();
		
		// Display current temperature
		ISYPanel.showWeather();
		
		ISYPanel.Initialized = true;
		ISYPanel.log('GUI has initialized');
		return 0;
	},
	
	/**
	* Returns IP address of the client's host (or hash tag from the URL)
	* TODO: need to find a reliable way to get client IP
	*/
	getIP: function()
	{
		var ip;
		
		if (location.hash) {
			ip = location.hash;
		} else {
			ip = '*'; // load the default panel
		}
		
		ISYPanel.log('Panel IP: ' + ip);
		return ip;
	},
	
	/**
	* Returns index of the panel for current IP
	* @param {string} ip The IP address (or hash tag) for panel
	*/
	getPanelId: function(ip)
	{
		var panels = ISYPanel.CONFIG.Panels;
		var panelsLength = panels.length;
		
		if (panelsLength <= 0) return -1;
		
		for (var i=0, ii=panelsLength; i<ii; i++)
		{
			var addr = panels[i].addr;
			
			if (addr !== '*' && addr.indexOf(ip) === -1) {
				continue;
			}
			
			return i;
		}
		return -1;
	},
	
	/**
	* Returns formatted time stamp. Used in logs.
	*/
	getTimeString: function()
	{
		var now    = new Date();
		var hour   = now.getHours();
		var minute = now.getMinutes();
		var second = now.getSeconds();
		var ap = "AM";
		if (hour   > 11) { ap = "PM";             }
		if (hour   > 12) { hour = hour - 12;      }
		if (hour   == 0) { hour = 12;             }
		if (hour   < 10) { hour   = "0" + hour;   }
		if (minute < 10) { minute = "0" + minute; }
		if (second < 10) { second = "0" + second; }
		var timeString = hour + ':' + minute + ':' + second + ' ' + ap;
		return timeString;
	},
	
	/**
	* Logs a string to debug pane of the UI
	*/
	log: function(msg)
	{
		if ( $('#chkEnableLog').attr('checked') ) {
			$('#statusContainer').prepend(ISYPanel.getTimeString() +' &rarr; '+ msg + '<br />');
		}
	},

	/**
	* Clears the debug pane
	*/
	ClearLog: function()
	{
		$('#statusContainer').html(ISYPanel.getTimeString() +' &rarr; '+ 'Log has been cleared<br />');
	},
	
	/**
	* Enable logging
	*/
	enableLog: function()
	{
		if (! $('#chkEnableLog').attr('checked') ) {
			$('#chkEnableLog').attr('checked', 'checked');
			ISYPanel.log('Enabling log.');
		}
	},
	
	/**
	* Event handler for Poll Cameras checkbox
	*/
	chkPollCameras_CheckEventHandler: function()
	{
		if ( $('#chkPollCameras').attr('checked') ) {
			ISYPanel.log('Camera polling enabled');
			ISYPanel.getCamImages();
		}
		else 
		{
			ISYPanel.log('Camera polling disabled');
		}
	},

	/**
	* Checks if Poll Cameras is enabled and calls getCamImages()
	*/
	cameraPolling: function()
	{
		var tOut = $('#selPollTimeout').attr('value');
		if ($('#chkPollCameras').attr('checked')) {
			ISYPanel.log('Setting camera polling interval to ' + tOut + ' msec.');
			setTimeout("ISYPanel.getCamImages()", tOut);
		}
	},
	
	/**
	* Create user-defined menu buttons based on Panels[i].shortcuts
	*/
	generateShortcutButtons: function()
	{
		if (ISYPanel.PanelId === null) {
			ISYPanel.showError('MISSINGPANELID');
			return -1;
		}
		
		var cuts = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].shortcuts;
		
		if (cuts.length <= 0) { return -1 }
		
		for (var i in cuts) {
			var cut = cuts[i];
			
			var btn = $('<button id="btnShort'+ i +'" class="shotrcuts">' + cut.name + '</button>');
			
			var url = cut.addr;
			
			$(btn).bind("click", {url: url}, function(event) {
					ISYPanel.frameNavigate(event.data.url);
				}
			);
			
			$('#boxMenuButtons').append(btn);
		}
		
		return 0;
	},
	
	/**
	* Load url in an iframe
	*/
	frameNavigate: function(url)
	{
		if (! $('#ctrlContainer') || !url) { return -1 }

		// set SRC of IFRAME to an url
		ISYPanel.log('Navigating to: ' + url);
		
		// create IFRAME element and set its dimensions
		if ( $('#mainFrame').length === 0 ) {
			// clear contents of ctrlContainer
			//$('#ctrlContainer').html('');

			var frameWidth = ctrlContainer.offsetWidth - 10;
			var frameHeight = ctrlContainer.offsetHeight < 600 ? 600 : ctrlContainer.offsetHeight;
			var ifr = $('<iframe id="mainFrame" width="' +frameWidth+ '" height="' +frameHeight+ '" src="' +url+ '" />');
	
			$('#ctrlContainer').fadeOut('fast').html('');
			$('#ctrlContainer').append(ifr);
			$('#ctrlContainer').fadeIn('slow');
		}
		else
		{
			$('#ctrlContainer').fadeOut('fast');
			$('#mainFrame').attr('src', url);
			$('#ctrlContainer').fadeIn('slow');
		}
		
		/* provide some background for default ISY pages (Devices/Scenes/Programs) */
		//if (url.charAt(0) === '/') {
			$('#ctrlContainer').css('background-color', 'whitesmoke');
		//}
		return 0;	
	},
	
	/**
	* Generates DOM tree for Cameras pane or updates camera images if tree
	* was previously generated.
	*/
	getCamImages: function()
	{
		if (ISYPanel.PanelId === null) {
			ISYPanel.showError('MISSINGPANELID');
			return -1;
		}
		
		if (! $('#chkPollCameras').attr('checked') ) { return -1 }
		
		ISYPanel.log('Updating camera images...');
		
		var webcams = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].webcams;
		
		if (webcams.length <= 0) { return -1 }
		
		for (var i in webcams) {
			
			var cam = webcams[i];
			var camId = 'id_cam' + i;
			
			// create IMG element or update existing
			if (document.getElementById(camId)) {
				var img = document.getElementById(camId);
			} else {
				var box = document.createElement('DIV');
				box.className = 'boxCamImage';
				
				var lbl = document.createElement('DIV');
				lbl.setAttribute('class', 'camLabel');
				
				var txt = document.createTextNode(cam.name);
				
				var img = document.createElement('IMG');
				// set basic params
				img.setAttribute('id', camId);
				img.setAttribute('width', 320);
				img.setAttribute('height', 240);
				
				// add IMG to document
				box.appendChild(img);
				lbl.appendChild(txt);
				box.appendChild(lbl);
				
				$('#camContainer').append(box);
				//document.getElementById('frameCameras').appendChild(img);
			}
			// assign SRC to imgUrl
			if (ISYPanel.CONFIG.IsOffline) {
				var n = parseInt(i)+1;
				var src = './cam'+ n +'.png';
			} else {
				var src = cam.addr + cam.imgUrl + '&NoCache=' + jQuery.now();
			}
			ISYPanel.log('Loading image from: ' + src);
			img.setAttribute('src', src);
		}
		ISYPanel.log('Images updated');
		ISYPanel.cameraPolling();
		
		return 0;
	},
	
	/**
	* Generates DOM tree for all areas/controls defined in CONFIG for current panel.
	*/
	generateControls: function()
	{
		/* Creating the following HTML code for each area in ISYPanel.CONFIG's controls
		**<fieldset>
		**	<legend>Kitchen</legend>
		**	<table>
		**		<tr>
		**			<td class="areaName">Ceiling</td>
		**			<td class="areaCtrl">
		**				<button>ON</button>
		**				<button>OFF</button>
		**			</td>
		**		</tr>
		**		<tr>
		**			<td.../>
		**			<td.../>
		**		</tr>
		**	</table>
		**</fieldset>
		*/
		
		if (ISYPanel.PanelId === null) {
			ISYPanel.showError('MISSINGPANELID');
			return -1;
		}
		
		// check the container
		if ( $('#ctrlContainer').length === 0 ) { return -1 }

		// clear contents of ctrlContainer
		$('#ctrlContainer').fadeOut('fast').html('');
		
		// apply stylesheet
		var css = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].css;
		if (css) {
			$('<link rel="stylesheet" type="text/css" href="' + css + '" id="customStyle" />').insertAfter('head #defaultStyle');
		}
		
		// hide webcams pane if no webcams defined for this panel
		var webcams = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].webcams;
		if (!webcams) {
			$('#frameCameras').hide();
		} else {
			$('#frameControl').css('marginRight', '330px');
			ISYPanel.getCamImages();
		}
		
		// hide admin controls
		var admin = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].admin;
		if (!admin)
		{
			$('#btnDevices').hide();
			$('#btnScenes').hide();
			$('#btnPrograms').hide();
		}
		
		//foreach AREA in the panel generate controls
		var areas = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].areas;
		if (areas.length <= 0) { return -1 }

		var panelName = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].name;
		document.title = 'ISY Panel: ' + panelName;
		ISYPanel.log('Generating controls for panel '+ panelName +'...');
		
		for (var i in areas) {
			var loc = areas[i]; //location
			
			var fld = document.createElement('FIELDSET');
			var leg = document.createElement('LEGEND');
			var txt = document.createTextNode(loc.name);
			leg.appendChild(txt); txt=null;
			fld.appendChild(leg); leg=null;
			
			var tbl = document.createElement('TABLE');
			
			for (var j=0, jj=loc.controls.length; j<jj; j++)
			{
				var c = loc.controls[j];
				var tbr = document.createElement('TR');
				// create control name TD
				var tbd1 = document.createElement('TD');
				tbd1.setAttribute('class', 'areaName');
				var txt = document.createTextNode(c.name);
				tbd1.appendChild(txt); txt=null;
				tbr.appendChild(tbd1); tbd1=null;
				
				// create control buttons TD
				var tbd2 = document.createElement('TD');
				tbd2.setAttribute('class', 'areaCtrl');
				
				// create ON button
				if (c.on !== false )
				{
					var btnOn = document.createElement('BUTTON');
					var btnOnTxt = document.createTextNode("ON");
					btnOn.appendChild(btnOnTxt); btnOnTxt=null;
					
					if (c.type == 'device' || c.type == 'scene')
					{
						btnOn.setAttribute('onclick', "ISYPanel.execDevice('"+c.addr+"', 'ON')");
					}
					if (c.type == 'program')
					{
						btnOn.setAttribute('onclick', "ISYPanel.execProgram('"+c.addr+"', 'ON')");
					}
					tbd2.appendChild(btnOn); btnOn=null;
				}
				
				// create OFF button
				if (c.off !== false )
				{
					var btnOff = document.createElement('BUTTON');
					var btnOffTxt = document.createTextNode("OFF");
					btnOff.appendChild(btnOffTxt); btnOffTxt=null;
					if (c.type == 'device' || c.type == 'scene')
					{
						btnOff.setAttribute('onclick', "ISYPanel.execDevice('"+c.addr+"', 'OFF')");
					}
					if (c.type == 'program')
					{
						btnOff.setAttribute('onclick', "ISYPanel.execProgram('"+c.addr+"', 'OFF')");
					}
					tbd2.appendChild(btnOff); btnOff=null;
				}
				tbr.appendChild(tbd2); tbd2=null;
				tbl.appendChild(tbr);
			}
			
			fld.appendChild(tbl);
			$('#ctrlContainer').append(fld);
		}
		$('#ctrlContainer').fadeIn('slow');
		ISYPanel.log('Controls generated');
		return 0;
	},
	
	/**
	* Execute ON or OFF command on a control or scene
	*/
	execDevice: function(addr, cmd)
	{
		//var cmdString = '/rest/nodes/[addr]/cmd/[command]';
		var action = '/change';
		var command;
		
		switch(cmd)
		{
			case 'ON':
				command = 'On';
				break;
			case 'OFF':
				command = 'Off';
				break;
			default:
				command = '';
				break;
		}
		
		if (addr != '' && command != '')
		{
			addr = addr.replace(/[\.|\s]/g, ' ');
			//cmdString = cmdString.replace('[addr]', addr);
			//cmdString = cmdString.replace('[command]', command);
			ISYPanel.log('Executing cmd: ' + addr + '=' + command);
			
			if (!ISYPanel.CONFIG.IsOffline) {
				var jqxhr = $.post(action, {
					node: addr, 
					submit: command
				})
				.success(function() { ISYPanel.log('Success'); })
				.error(function() { ISYPanel.log('Error returned'); });
				//.complete(function() { ISYPanel.log('Complete'); });
			} else {
				ISYPanel.log('action: ' + action);
			}
		}
	},
	
	/**
	* Executes ISY program
	*/
	execProgram: function(addr, cmd)
	{
		var action = '/rest/programs/[pid]/[command]';
		var command;
		
		switch(cmd)
		{
			case 'ON':
				command = 'runThen';
				break;
			case 'OFF':
				command = 'runElse';
				break;
			default:
				command = 'run';
				break;
		}
		
		if (addr != '' && command != '')
		{
			action = action.replace('[pid]', addr);
			action = action.replace('[command]', command);
			ISYPanel.log('Executing program: ' + addr + '=' + command);
			
			if (!ISYPanel.CONFIG.IsOffline) {
				var jqxhr = $.get(action)
				.success(function() { ISYPanel.log('Program was successfully executed.'); })
				.error(function() { ISYPanel.log('Program execution failed!'); });
				//.complete(function() { ISYPanel.log('Complete'); });
			} else {
				ISYPanel.log('action: ' + action);
			}
		}
	},
	
	/**
	* Display weather forecast in the panel
	* TODO: This function is not implemented yet. It might use either ISY's weather module
	* or some external service like Google, Wunderground, etc.
	*/
	showWeather: function()
	{
		if (undefined == ISYPanel.CONFIG.ZipCode) {
		    ISYPanel.showError('ZIPMISSING');
		    $('#boxClimate').hide();
		    return -1;
		}
		
		//TODO: verify that Climate module is installed and enabled
		//
		var zip = ISYPanel.CONFIG.ZipCode;
		
		var url = (ISYPanel.CONFIG.IsOffline) ? './climate.xml' : '/rest/climate';
		
		ISYPanel.log('Updating current weather info...')
		
		$.ajax({
			type: "GET",
			timeout: 60000,
			url: url,
			dataType: 'xml',
			error: function(XMLHttpRequest, textStatus, errorThrown){
				$("div#boxClimate").hide();
				ISYPanel.log(textStatus + ' loading: ' + url);
				ISYPanel.showError('CLIMATENOTLOADED');
			},
			success: function(data){
				ISYPanel.updateClimateDisplay(data);
				setTimeout("ISYPanel.showWeather()", 90000);
			}
		});
		return 0;
	},
	
	/**
	* Update GUI with weather data
	* @param {Object} data XML document containing weather data
	*/
	updateClimateDisplay: function(data)
	{
	        if (!data){return -1;}
        
		if ($(data).find('climate').size())
		{
			var climate = $(data).find('climate');
		        var tempCurrent = $(climate).find('Temperature').text().replace(' F', '&deg;');
		        var tempHigh = $(climate).find('Temperature_High').text().replace(' ', '&deg;');
		        var tempLow =  $(climate).find('Temperature_Low').text().replace(' ', '&deg;');
			
			var tempCurrentContainer = $('#boxTempCurrent');
			var tempHighContainer = $('#boxTempHigh');
			var tempLowContainer = $('#boxTempLow');
                
			if ( tempCurrentContainer.length === 0 ) {
				// generate container for Climate module
				var climateContainer = $('<div id="boxClimate"></div>');
				tempCurrentContainer = $('<div id="boxTempCurrent"></div>');
				tempHighContainer = $('<div id="boxTempHigh"></div>');
				tempLowContainer = $('<div id="boxTempLow"></div>');
				
				$(climateContainer).append(tempCurrentContainer).append(tempHighContainer).append(tempLowContainer);
				$('#wrapper').append(climateContainer);
			}
			
		        if (tempCurrent) $(tempCurrentContainer).html(tempCurrent);
		        if (tempHigh) $(tempHighContainer).html('High: ' + tempHigh);
		        if (tempLow) $(tempLowContainer).html('Low: ' + tempLow);
			return 0;
		}
		return -1;
	},
	
	/**
	* Load weather forecast from Wunderground into an iframe
	*/
	loadWeather: function()
	{
		if (undefined == ISYPanel.CONFIG.ZipCode) {
		    ISYPanel.showError('ZIPMISSING');
		    $("div#boxClimate").hide();
		    return -1;
		}
		
		var zip = ISYPanel.CONFIG.ZipCode;

		ISYPanel.log('Loading weather map for Zip code: ' + zip);
		//var url = 'http://www.wund.com/cgi-bin/findweather/getForecast?query=' + zip;
		var url = 'http://www.wunderground.com/cgi-bin/findweather/getForecast?brand=wxmap&query=' + zip;
		
		ISYPanel.frameNavigate(url);
		return 0;
	},

	/**
	* Re-generates panel controls after switching from another frame
	*/
	loadControls: function()
	{
		ISYPanel.generateControls();
		$('#ctrlContainer').css('background-color','transparent');
		return 0;
	},
	
	/**
	* Load Devices pane from standard ISY interface into an iframe. This is ADMIN option.
	*/
	loadDevices: function()
	{
		var url = '/devices';
		ISYPanel.log('Loading Devices screen...');
		ISYPanel.frameNavigate(url);
		return 0;
	},
	
	/**
	* Load Scenes pane from standard ISY interface into an iframe. This is ADMIN option.
	*/
	loadScenes: function()
	{
		var url = '/scenes';
		ISYPanel.log('Loading Scenes screen...');
		ISYPanel.frameNavigate(url);
		return 0;
	},
	
	/**
	* Load Programs pane from standard ISY interface into an iframe. This is ADMIN option.
	*/
	loadPgms: function()
	{
		var url = '/pgms';
		ISYPanel.log('Loading Programs screen...');
		ISYPanel.frameNavigate(url);
		return 0;
	},
	
	/**
	* Enlarges debug/logger pane.
	*/
	ExpandLog: function()
	{
		if ($('#btnExpandLog').text() == '+')
		{
			$('#statusContainer').addClass('expanded');
			$('#btnExpandLog').text('-');
		} else {
			$('#statusContainer').removeClass('expanded');
			$('#btnExpandLog').text('+');
		}
	},
	
	/**
	* Show alert box with error message
	*/
	showError: function(err)
	{
		var msg = 'Error: ';
		
		switch(err)
		{
			case 'MISSINGPANELID':
				msg += 'Panel Id cannot be determined. Please check your configuration and try again.';
				break;
			case 'CONFIGNOTLOADED':
				msg += 'Unable to read Config.js! Please check your configuration and try again.';
				break;
			case 'CONFIGISBROKEN':
				msg += 'Config.js is incomplete or contains errors! Please check your configuration and try again.';
				break;
			case 'ZIPMISSING':
				msg += 'Please specify the 5-digit ZIP code in your configuration file.';
				break;
			case 'CLIMATENOTLOADED':
				msg += 'Unable to read Weather data!';
				break;
			default:
				msg += 'Unknown error';
				break;
		}
		
		if ('file:' == window.location.protocol) {
			msg += "\n\nNote: ISY Panel should be served from the web server!\nIt won't work with file:// protocol due to JS security restrictions.";
		}
		
		//alert(msg);
		
		ISYPanel.enableLog();
		ISYPanel.log(msg);
	}
};

$(document).ready(function() {
	ISYPanel.LoadConfig();	
});

