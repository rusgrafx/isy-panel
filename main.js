var ISYPanel = {
	Initialized: false,
	
	Init: function()
	{
		if (!CONFIG) {
			alert("Error: The CONFIG object is not initialized or has some errors!");
			return false;
		}

		// hide status/log area
		if (!CONFIG.showLog) {
			document.getElementById('frameStatus').style.display = 'none';
		}
		
		if (CONFIG.showLog && CONFIG.enableLog && document.getElementById('chkEnableLog')) {
			document.getElementById('chkEnableLog').checked = true;
			ISYPanel.log('Enabling log.');
		}
		// hide camera area
		//if (!CONFIG.webcams || CONFIG.webcams.length <= 0) {
		//	document.getElementById('frameCameras').style.display = 'none';
		//}

		// auto enable logging in OFFLINE mode
		if (CONFIG.showLog && CONFIG.isOffline && document.getElementById('chkEnableLog')) {
			document.getElementById('chkEnableLog').checked = true;
			ISYPanel.log('Warning: ISYPanel is running in Offline mode! Set CONFIG.isOffline to false before uploading to ISY.');
		}
		
		// set title of the Home button
		if (document.getElementById('btnHome')) {
			document.getElementById('btnHome').innerText = CONFIG.name;
		}
		
		// generate controls for current pannel
		ISYPanel.generateControls();
		
		ISYPanel.Initialized = true;
		ISYPanel.log('GUI has initialized');
		return true;
	},
	
	/**
	* Returns IP address of the local host
	* TODO: need to find a reliable way to get IP
	*/
	getIP: function()
	{
		var ip = location.hostname;
		if (!ip) {
			ip = '127.0.0.1';
		}
		ISYPanel.log('Panel IP: ' + ip);
		return ip;
	},
	
	/**
	* Returns panel GUI for current IP
	* @param {string} ip The IP address for panel
	}
	*/
	getPanelId: function(ip)
	{
		var panels = CONFIG.panels;
		if (panels.length <= 0) return;
		
		for (var i=0, ii=panels.length; i<ii; i++)
		{
			var addr = panels[i].addr;

			if (addr != '*' && addr.indexOf(ip) == -1) {
				continue;
			}
			
			return i; 
		}
	},
	
	/**
	* Returns raw timestamp. Used as unique number to prevent caching of camera images.
	*/
	getTimeStamp: function()
	{
		var now    = new Date();
		return now.getTime();
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
		//if (! document.getElementById('chkPollCameras').checked) {
		//	return;
		//}
		ISYPanel.log('Updating camera images...');
		
		var ip = ISYPanel.getIP();
		
		var panelId = ISYPanel.getPanelId(ip);
		
		var webcams = CONFIG.panels[panelId].webcams;
		
		if (webcams.length <= 0) return;
		
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
			if (CONFIG.isOffline) {
				var n = parseInt(i)+1;
				var src = './cam'+ n +'.png';
			} else {
				var src = cam.addr + cam.imgUrl + '&NoCache=' + ISYPanel.getTimeStamp();
			}
			ISYPanel.log('Loading image from: ' + src);
			img.setAttribute('src', src);
		}
		ISYPanel.log('Images updated');
		ISYPanel.cameraPolling();
	},
	
	generateControls: function()
	{
		/* Creating the following code for each area in CONFIG.controls
		**<fieldset>
		**	<legend>Kitchen</legend>
		**	<table>
		**		<tr>
		**			<td class="areaName">Ceiling</td>
		**			<td class="areaCtrl"><button>ON</button><button>OFF</button><button>Status</button></td>
		**		</tr>
		**		<tr>
		**			<td...>
		**			<td...>
		**		</tr>
		**	</table>
		**</fieldset>
		*/
		
		var ip = ISYPanel.getIP();
		
		var panelId = ISYPanel.getPanelId(ip);

		// get the container
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return false;	}
		
		// apply stylesheet
		var css = CONFIG.panels[panelId].css;
		if (css) {
			var cssref=document.createElement('link');
			cssref.setAttribute('rel', 'stylesheet');
			cssref.setAttribute('type', 'text/css');
			cssref.setAttribute('href', css);
			document.getElementsByTagName("head")[0].appendChild(cssref);
		}
		
		// hide webcams pane if no webcams defined for this panel
		var webcams = CONFIG.panels[panelId].webcams;
		if (!webcams) {
			var frameCameras = document.getElementById('frameCameras');
			frameCameras.style.display = 'none';
		} else {
			var frameControl = document.getElementById('frameControl');
			frameControl.style.marginRight = '330px';
			ISYPanel.getCamImages();
		}
		
		// hide admin controls
		var admin = CONFIG.panels[panelId].admin;
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
		var areas = CONFIG.panels[panelId].areas;
		if (areas.length <= 0) { return false; }

		var panelName = CONFIG.panels[panelId].name;
		document.title = 'ISY Panel: ' + panelName;
		ISYPanel.log('Genetaing controls for panel '+ panelName +'...');
		
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
				var btnOn = document.createElement('BUTTON');
				var btnOnTxt = document.createTextNode("ON");
				btnOn.appendChild(btnOnTxt); btnOnTxt=null;
				
				if (c.type = 'device')
				{
					btnOn.setAttribute('onclick', "ISYPanel.execDevice('"+c.addr+"', 'ON')");
				}
				tbd2.appendChild(btnOn); btnOn=null;
				
				// create OFF button
				var btnOff = document.createElement('BUTTON');
				var btnOffTxt = document.createTextNode("OFF");
				btnOff.appendChild(btnOffTxt); btnOffTxt=null;
				if (c.type = 'device')
				{
					btnOff.setAttribute('onclick', "ISYPanel.execDevice('"+c.addr+"', 'OFF')");
				}
				tbd2.appendChild(btnOff); btnOff=null;
				
				tbr.appendChild(tbd2); tbd2=null;
				tbl.appendChild(tbr);
			}
			
			fld.appendChild(tbl);
			ctrlContainer.appendChild(fld);
		}
		ISYPanel.log('Controls generated');
	},
	
	execDevice: function(addr, cmd)
	{
		//var cmdString = '/rest/nodes/%addr%/cmd/%command%';
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
			//cmdString = cmdString.replace('%addr%', addr);
			//cmdString = cmdString.replace('%command%', command);
			ISYPanel.log('Executing cmd: ' + addr + '=' + command);
			
			if (!CONFIG.isOffline) {
				var jqxhr = $.post(action, {
					node: addr, 
					submit: command
				})
				.success(function() { ISYPanel.log('Success'); })
				.error(function() { ISYPanel.log('Error returned'); });
				//.complete(function() { ISYPanel.log('Complete'); });
			}
		}
	},
	
	execProgram: function(addr, cmd)
	{
		
	},
	
	showWeather: function()
	{
		var zip = CONFIG.zipcode;
	},
	
	loadControls: function()
	{
		// Load controls to ctrlContainer
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return false;	}
		// clear contents of ctrlContainer
		ctrlContainer.innerHTML = "";
		// generate controls
		ISYPanel.generateControls();
		ctrlContainer.style.backgroundColor = 'transparent';
	},
	
	loadDevices: function()
	{
		// Load /devices to an iframe
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return false;	}
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
	},
	
	loadScenes: function()
	{
		// Load /scenes to an iframe
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return false;	}
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
	},
	
	loadPgms: function()
	{
		// Load /pgms to an iframe
		var ctrlContainer = document.getElementById('ctrlContainer');
		if (!ctrlContainer) { return false;	}
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

ISYPanel.Init();
