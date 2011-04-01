var ISYPanel = {
	
	Initialized: false,
	
	PanelId: null,
	
	CONFIG: null,
	
	/**
	* Loads panel configuration from the JSON file.
	* If config was successfully loaded (and parsed) then initializes the application.
	*/
	LoadConfig: function()
	{
		jQuery.ajax("./config.js", [ dataType="json" ])
		.error(
			function() {
				var msg;
				
				if ('file:' == window.location.protocol) {
					msg = "\n\nISY Panel should be served from the web server!\nIt won't work with file:// protocol due to JS security restrictions.";
				}
				
				alert('Error: Unable to read Config.js!' + msg);
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
		if (!ISYPanel.CONFIG) {
			alert("Error: The configuration file has not initialized or contains errors!");
			return -1;
		}
		
		// Hide status/log area
		if (!ISYPanel.CONFIG.ShowLog) {
			document.getElementById('frameStatus').style.display = 'none';
		}
		
		// Enable logging
		if (ISYPanel.CONFIG.ShowLog && ISYPanel.CONFIG.EnableLog && document.getElementById('chkEnableLog')) {
			document.getElementById('chkEnableLog').checked = true;
			ISYPanel.log('Enabling log.');
		}
		
		// Auto enable logging in OFFLINE mode
		if (ISYPanel.CONFIG.ShowLog && ISYPanel.CONFIG.IsOffline && document.getElementById('chkEnableLog')) {
			document.getElementById('chkEnableLog').checked = true;
			ISYPanel.log('Warning: ISYPanel is running in Offline mode! Set CONFIG.IsOffline to false before uploading to ISY.');
		}
		
		// Set title of the Home button
		if (document.getElementById('btnHome')) {
			document.getElementById('btnHome').innerText = ISYPanel.CONFIG.Name;
		}
		
		var ip = ISYPanel.getIP();
		ISYPanel.PanelId = ISYPanel.getPanelId(ip);

		// Generate controls for current pannel
		ISYPanel.generateControls();
		
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
		
		if (panels.length <= 0) return -1;
		
		for (var i=0, ii=panels.length; i<ii; i++)
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
		var timeString = hour + ':' + minute + ':' + second + " " + ap;
		return timeString;
	},
	
	/**
	* Logs a string to debug pane of the UI
	*/
	log: function(msg)
	{
		var logChk = document.getElementById('chkEnableLog');
		if (logChk.checked)
		{
			var log = document.getElementById('statusContainer');
			log.innerHTML = ISYPanel.getTimeString() +' : '+ msg + '<br />' + log.innerHTML;
		}
	},

	/*
	* Clears the debug pane
	*/
	ClearLog: function()
	{
		var log = document.getElementById('statusContainer');
		log.innerHTML = ISYPanel.getTimeString() +' : '+ 'Log cleared <br />';
	},
	
	chkPollCameras_CheckEventHandler: function()
	{
		var cBox = document.getElementById('chkPollCameras');
		if(cBox.checked) {
			ISYPanel.log('Camera polling enabled');
			ISYPanel.getCamImages();
		}
		else 
		{
			ISYPanel.log('Camera polling disabled');
		}
	},

	cameraPolling: function()
	{
		var cBox = document.getElementById('chkPollCameras');
		var tOut = document.getElementById('selPollTimeout');
		if(cBox.checked) {
			ISYPanel.log('Setting camera polling interval to ' + tOut.value + ' msec');
			setTimeout("ISYPanel.getCamImages()", tOut.value);
		}
	},
	
	getCamImages: function()
	{
		if (! ISYPanel.PanelId ) { return -1 }
		if (! document.getElementById('chkPollCameras').checked) { return -1 }
		
		ISYPanel.log('Updating camera images...');
		
		var webcams = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].webcams;
		
		if (webcams.length <= 0) { return -1 }
		
		for (var i in webcams) {
		
			var cam = webcams[i];
			
			// create IMG element or update existing
			if (document.getElementById(cam.id)) {
				var img = document.getElementById(cam.id);
			} else {
				var box = document.createElement('DIV');
				box.className = 'boxCamImage';

				var lbl = document.createElement('DIV');
				lbl.setAttribute('class', 'camLabel');
				
				var txt = document.createTextNode(cam.name);
				
				var img = document.createElement('IMG');
				// set basic params
				img.setAttribute('id', cam.id);
				img.setAttribute('width', 320);
				img.setAttribute('height', 240);
				
				// add IMG to document
				box.appendChild(img);
				lbl.appendChild(txt);
				box.appendChild(lbl);
				
				document.getElementById('camContainer').appendChild(box);
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
	
	generateControls: function()
	{
		/* Creating the following code for each area in ISYPanel.CONFIG's controls
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
		
		if (! ISYPanel.PanelId ) { return -1 }

		// get the container
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return -1 }
		
		// apply stylesheet
		var css = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].css;
		if (css) {
			var cssref=document.createElement('link');
			cssref.setAttribute('rel', 'stylesheet');
			cssref.setAttribute('type', 'text/css');
			cssref.setAttribute('href', css);
			document.getElementsByTagName("head")[0].appendChild(cssref);
		}
		
		// hide webcams pane if no webcams defined for this panel
		var webcams = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].webcams;
		if (!webcams) {
			var frameCameras = document.getElementById('frameCameras');
			frameCameras.style.display = 'none';
		} else {
			var frameControl = document.getElementById('frameControl');
			frameControl.style.marginRight = '330px';
			ISYPanel.getCamImages();
		}
		
		// hide admin controls
		var admin = ISYPanel.CONFIG.Panels[ISYPanel.PanelId].admin;
		if (!admin)
		{
			var btnDevices = document.getElementById('btnDevices');
			btnDevices.style.display = 'none';
			
			var btnScenes = document.getElementById('btnScenes');
			btnScenes.style.display = 'none';
			
			var btnPrograms = document.getElementById('btnPrograms');
			btnPrograms.style.display = 'none';
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
			ctrlContainer.appendChild(fld);
		}
		ISYPanel.log('Controls generated');
		return 0;
	},
	
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
				.success(function() { ISYPanel.log('Success'); })
				.error(function() { ISYPanel.log('Error returned'); });
				//.complete(function() { ISYPanel.log('Complete'); });
			} else {
				ISYPanel.log('action: ' + action);
			}
		}
	},
	
	showWeather: function()
	{
		var zip = ISYPanel.CONFIG.ZipCode;
		alert("This function is not implemented yet.");
	},
	
	loadControls: function()
	{
		// Load controls to ctrlContainer
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return -1	}
		// clear contents of ctrlContainer
		ctrlContainer.innerHTML = "";
		// generate controls
		ISYPanel.generateControls();
		ctrlContainer.style.backgroundColor = 'transparent';
		return 0;
	},
	
	loadDevices: function()
	{
		// Load /devices to an iframe
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return -1 }
		// clear contents of ctrlContainer
		ctrlContainer.innerHTML = "";
		// create IFRAME element
		var ifr = document.createElement('IFRAME');
		ifr.setAttribute('width', ctrlContainer.offsetWidth - 2);
		var ifrHeight = ctrlContainer.offsetHeight < 400 ? 400 : ctrlContainer.offsetHeight;
		ifr.setAttribute('height', ifrHeight);
		// set SRC of IFRAME to /devices
		ifr.setAttribute('src', '/devices');
		ctrlContainer.appendChild(ifr); ifr = null;
		ctrlContainer.style.backgroundColor = 'white';
		return 0;
	},
	
	loadScenes: function()
	{
		// Load /scenes to an iframe
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return -1 }
		// clear contents of ctrlContainer
		ctrlContainer.innerHTML = "";
		// create IFRAME element
		var ifr = document.createElement('IFRAME');
		ifr.setAttribute('width', ctrlContainer.offsetWidth - 2);
		var ifrHeight = ctrlContainer.offsetHeight < 400 ? 400 : ctrlContainer.offsetHeight;
		ifr.setAttribute('height', ifrHeight);
		// set SRC of IFRAME to /scenes
		ifr.setAttribute('src', '/scenes');
		ctrlContainer.appendChild(ifr); ifr = null;
		ctrlContainer.style.backgroundColor = 'white';
		return 0;
	},
	
	loadPgms: function()
	{
		// Load /pgms to an iframe
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return -1	}
		// clear contents of ctrlContainer
		ctrlContainer.innerHTML = "";
		// create IFRAME element
		var ifr = document.createElement('IFRAME');
		ifr.setAttribute('width', ctrlContainer.offsetWidth - 2);
		var ifrHeight = ctrlContainer.offsetHeight < 400 ? 400 : ctrlContainer.offsetHeight;
		ifr.setAttribute('height', ifrHeight);
		// set SRC of IFRAME to /pgms
		ifr.setAttribute('src', '/pgms');
		ctrlContainer.appendChild(ifr); ifr = null;
		ctrlContainer.style.backgroundColor = 'white';
		return 0;
	},
	
	ExpandLog: function()
	{
		if ($('#btnExpandLog').text() == '+')
		{
			document.getElementById('statusContainer').style.height = '200px';
			document.getElementById('btnExpandLog').innerText = '-';
		} else {
			document.getElementById('statusContainer').style.height = '50px';
			document.getElementById('btnExpandLog').innerText = '+';
		}
	}
};

ISYPanel.LoadConfig();
