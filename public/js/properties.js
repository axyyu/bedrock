markers = [];
data = {};

async function setupProperties(propertyHtml, propertyList = 'property-list', filter = {}) {
	data = await getProperties(filter);
	showProperties(propertyHtml, propertyList);
}

async function getProperties(filter) {
	const data = await $.get('/api/properties', {
		query: filter
	});
	return data.data;
}

function showProperties(propertyHtml, propertyList) {
	$(`#${propertyList}`).empty();

	markers.forEach((obj) => {
		obj.setMap(null);
	});

	data.forEach((obj, index) => {
		var html = propertyHtml(obj, index);
		$(`#${propertyList}`).append($(html));

		var coords = {
			lat: obj.Latitude,
			lng: obj.Longitude
		};

		var marker = new google.maps.Marker({ position: coords, map: map });
		markers.push(marker);
	});
}

function initMap() {
	var center = { lat: 37.2719616, lng: -76.71726079999999 };
	map = new google.maps.Map(document.getElementById('map'), { zoom: 7, center: center });
}

MSSubClass = {
	20: '1-STORY 1946 & NEWER ALL STYLES',
	30: '1-STORY 1945 & OLDER',
	40: '1-STORY W/FINISHED ATTIC ALL AGES',
	45: '1-1/2 STORY - UNFINISHED ALL AGES',
	50: '1-1/2 STORY FINISHED ALL AGES',
	60: '2-STORY 1946 & NEWER',
	70: '2-STORY 1945 & OLDER',
	75: '2-1/2 STORY ALL AGES',
	80: 'SPLIT OR MULTI-LEVEL',
	85: 'SPLIT FOYER',
	90: 'DUPLEX - ALL STYLES AND AGES',
	120: '1-STORY PUD (Planned Unit Development) - 1946 & NEWER',
	150: '1-1/2 STORY PUD - ALL AGES',
	160: '2-STORY PUD - 1946 & NEWER',
	180: 'PUD - MULTILEVEL - INCL SPLIT LEV/FOYER',
	190: '2 FAMILY CONVERSION - ALL STYLES AND AGES'
};

MSZoning = {
	A: 'Agriculture',
	'C (all)': 'Commercial',
	FV: 'Floating Village Residential',
	I: 'Industrial',
	RH: 'Residential High Density',
	RL: 'Residential Low Density',
	RP: 'Residential Low Density Park',
	RM: 'Residential Medium Density'
};

Utilities = {
	AllPub: 'All public Utilities (E,G,W,& S)',
	NoSewr: 'Electricity, Gas, and Water (Septic Tank)',
	NoSeWa: 'Electricity and Gas Only',
	ELO: 'Electricity only'
};

Heating = {
	Floor: 'Floor Furnace',
	GasA: 'Gas forced warm air furnace',
	GasW: 'Gas hot water or steam heat',
	Grav: 'Gravity furnace',
	OthW: 'Hot water or steam heat other than gas',
	Wall: 'Wall furnace'
};

MiscFeature = {
	Elev: 'Elevator',
	Gar2: '2nd Garage',
	Othr: 'Other',
	Shed: 'Shed (over 100 SF)',
	TenC: 'Tennis Court',
	NA: 'None'
};

Electrical = {
	SBrkr: 'Standard Circuit Breakers & Romex',
	FuseA: 'Fuse Box over 60 AMP and all Romex wiring (Average)',
	FuseF: '60 AMP Fuse Box and mostly Romex wiring (Fair)',
	FuseP: '60 AMP Fuse Box and mostly knob & tube wiring (poor)',
	Mix: 'Mixed'
};

GarageType = {
	'2Types': 'More than one type of garage',
	Attchd: 'Attached to home',
	Basment: 'Basement Garage',
	BuiltIn: 'Built-In (Garage part of house - typically has room above garage)',
	CarPort: 'Car Port',
	Detchd: 'Detached from home',
	NA: 'No Garage'
};

PavedDrive = {
	Y: 'Paved ',
	P: 'Partial Pavement',
	N: 'Dirt/Gravel'
};
