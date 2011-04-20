{
	"IsOffline": false,

	"ShowLog": false,

	"EnableLog": false,

	"Name": "My Home", 

	"ZipCode": "94588",
	
	"Panels": 
	[
		{ 
			"addr":  "#kitchen",
			"admin": false,
			"name":  "Kitchen",
			"css": "./style02.css",
			"webcams":		
			[
				{ "name": "Family Room", "addr": "http://192.168.20.4", "imgUrl": "/SnapshotJPEG?Resolution=320x240&Quality=Clarity" },
				{ "name": "Guest Room", "addr": "http://192.168.20.2:8002", "imgUrl": "/SnapshotJPEG?Resolution=320x240&Quality=Clarity" }
			],
			"shortcuts":
			[
				{ "name": "Pandora", "addr": "http://pandora.com" },
				{ "name": "AllRecipes", "addr": "http://mobile.allrecipes.com/Search/Recipes.aspx" },
				{ "name": "WholeFoods", "addr": "http://m.wholefoodsmarket.com/recipes/"}
			],
			"areas":
			[
				{
					"name": "Kitchen / Dining",
					"controls":
					[
						{ "name": "Overhead", "addr": "10024", "type": "scene" }
					]
				},
				{
					"name": "Living room",
					"controls":
					[
						{ "name": "Stairs", "addr": "10008", "type": "scene" },
						{ "name": "Track lights", "addr": "10007", "type": "scene" },
						{ "name": "Bar", "addr": "32988", "type": "scene" },
						{ "name": "Foyer", "addr": "10011", "type": "scene" }
					]
				},
				{
					"name": "Scenes",
					"controls": [
						{ "name": "Party Mode", "addr": "5.14.82 1", "type": "device" },
						{ "name": "Good Morning", "addr": "00.00.00 1", "type": "scene", "off": false },
						{ "name": "Good Night", "addr": "10020", "type": "scene", "off": false },
						{ "name": "All Off", "addr": "00:21:b9:01:02:92", "type": "scene", "on": false }
					]
				}
			]
		},
		{
			"addr": "*",
			"admin": true,
			"name": "Mi Casa",
			"css": "./style01.css",
			"shortcuts":
			[
				{ "name": "PicasaWeb", "addr": "https://picasaweb.google.com/lh/featured?feat=featured_all#slideshow" },
				{ "name": "GReader", "addr": "http://www.google.com/reader/play/?hl=en#item/new/0" },
				{ "name": "Pandora", "addr": "http://pandora.com" }
			],
			"areas":
			[
				{
					"name": "Living room",
					"controls": 
					[
						{ "name": "Stairs", "addr": "10008", "type": "scene" },
						{ "name": "Track lights", "addr": "10007", "type": "scene" },
						{ "name": "Bar", "addr": "32988", "type": "scene" },
						{ "name": "Foyer", "addr": "10011", "type": "scene" }
					]
				},
				{
					"name": "Master Bedroom",
					"controls": 
					[
						{ "name": "Her lights", "addr": "A.DF.C8 1", "type": "device" },
						{ "name": "His lights", "addr": "A.DF.C8 3", "type": "device" },
						{ "name": "Floor lamp", "addr": "34649", "type": "scene" },
						{ "name": "Watch TV", "addr": "19921", "type": "scene" }
					]
				},
				{
					"name": "Scenes",
					"controls": 
					[
						{ "name": "Party Mode", "addr": "34649", "type": "scene" },
						{ "name": "Good Morning", "addr": "0030", "type": "program" },
						{ "name": "Good Night", "addr": "10020", "type": "scene", "off": false },
						{ "name": "All Off", "addr": "00:21:b9:01:02:92", "type": "scene", "on": false }
					]
				},
				{ 
					"name": "Kitchen",
					"controls":
					[
						{ "name": "Overhead", "addr": "10024", "type": "scene" },
						{ "name": "Entertain", "addr": "0010", "type": "program" }
					]
				}
			]
		}
	]
}
