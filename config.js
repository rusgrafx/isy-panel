var CONFIG = {
	
	isOffline: true, 
		/*
		// Set to 'false' before uploading to ISY.
		// Set to 'true' for development. 
		// When set to 'true':
		// -logging window will be enabled automatically
		// -placeholder images will be used instead of actual camera JPEGs
		// -no commands will be sent to ISY, but will be logged
		*/
	showLog: true,
	enableLog: true,
		/*
		// Show debug/log area
		*/
	name: "My Home", 
		/*
		// Name for your set-up. It will appear on the first button in the GUI
		*/
	zipcode: '94588',
		/*
		// Five digit US zipcode for weather forecast
		*/
	
	panels: 
	[
		{ 
			addr:  '192.168.20.27', 	// a list of ip addresses to which this panel will be shown
			admin: true,				// allow to show advanced controls?
			name:  'Kitchen',			// name of the panel
			css: './style02.css',		// CSS file for this panel
			webcams:					// an array of web/ip camera configurations
			[
				{ id: "cam_fr", name: "Family Room", addr: "http://192.168.20.4", imgUrl: "/SnapshotJPEG?Resolution=320x240&Quality=Clarity" },
				{ id: "cam_gr", name: "Guest Room", addr: "http://192.168.20.2:8002", imgUrl: "/SnapshotJPEG?Resolution=320x240&Quality=Clarity" }
			],
			areas: 					// locations (rooms or other logical groups of controls)
			[
				{ 
					name: 'Kitchen / Dining',
					controls: 
					[
						{ name: "Overhead", addr: '10024', type: 'scene' }
						//{ name: "Fan", addr: '00.00.00 1', type: 'device' }
					]
				},
				{
					name: "Living room",
					controls: 
					[
						{ name: "Stairs", addr: '10008', type: 'scene' },
						{ name: "Track lights", addr: '10007', type: 'scene' },
						{ name: "Bar", addr: '32988', type: 'scene' },
						{ name: "Foyer", addr: '10011', type: 'scene' }
					]
				},
				{
					name: "Scenes",
					controls: [
						{ name: "Party Mode", addr: '5.14.82 1', type: 'device' },
						{ name: "Good Morning", addr: '00.00.00 1', type: 'scene' },
						{ name: "Good Night", addr: '10020', type: 'scene' },
						{ name: "All Off", addr: '00:21:b9:01:02:92', type: 'global' }
					]
				} //end of area
			] // end of areas
		},
		{
			addr: '*',
			admin: false,
			name: "Mi Casa",
			css: './style01.css',
			areas: 
			[
				{
					name: "Living room",
					controls: [
						{ name: "Stairs", addr: '10008', type: 'scene' },
						{ name: "Track lights", addr: '10007', type: 'scene' },
						{ name: "Bar", addr: '32988', type: 'scene' },
						{ name: "Foyer", addr: '10011', type: 'scene' }
					]
				},
				{
					name: "Master Bedroom",
					controls: [
						{ name: "Her lights", addr: 'A.DF.C8 1', type: 'device' },
						{ name: "His lights", addr: 'A.DF.C8 3', type: 'device' },
						{ name: "Floor lamp", addr: 'A.DF.C8 2', type: 'device' },
						{ name: "TV", addr: 'A.DF.C8 4', type: 'device' }
					]
				},
				{
					name: "Scenes",
					controls: [
						{ name: "Party Mode", addr: '5.14.82 1', type: 'device' },
						{ name: "Good Morning", addr: '00.00.00 1', type: 'scene' },
						{ name: "Good Night", addr: '10020', type: 'scene' },
						{ name: "All Off", addr: '00:21:b9:01:02:92', type: 'global' }
					]
				},
				{ 
					name: "Kitchen",
					controls: [
						{ name: "Overhead", addr: '10024', type: 'scene' }
						//{ name: "Music", addr: '00.00.00 1', type: 'device' }
					]
				} //end of area
			] // end of areas
		} // end of panel
	] // end of panels
}; // end of CONFIG
