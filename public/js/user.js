portfolio = true;

investments = {};
balance = 1000000;

var pieChart;
var linegraph;

function toggleScreen() {
	if (portfolio) {
		$('#portfolio').fadeOut(400, () => {
			$('#available').fadeIn();
			$('#toggle').html('Go to Portfolio');
			loadAvailable();
			portfolio = false;
		});
	} else {
		$('#available').fadeOut(400, () => {
			$('#portfolio').fadeIn();
			$('#toggle').html('See Available Properties');
			loadPortfolio();
			portfolio = true;
		});
	}
}

// Portfolio

function loadPortfolio() {
	$('#balance').text(balance);
	if (Object.keys(investments).length > 0) {
		setupProperties(propertyHtml2, 'owned-list', {
			_id: { $in: Object.keys(investments) }
		});
		loadCharts();
	} else {
		$('#owned-list').empty();
	}
}

function loadCharts() {
	var order = Object.values(MSZoning);
	var investmentCategories = {};
	var projected = balance;
	for (key in investments) {
		console.log(investments[key]);
		let zone = MSZoning[investments[key].zone];
		if (!(zone in investmentCategories)) investmentCategories[zone] = 0;
		investmentCategories[zone] += investments[key].value;
		projected += investments[key].est * investments[key].value / investments[key].req;
	}
	console.log(investmentCategories);
	var newData = [];
	order.forEach((zone) => {
		if (zone in investmentCategories) {
			newData.push(investmentCategories[zone]);
		} else {
			newData.push(0);
		}
	});
	pieChart.data.datasets[0].data = newData;
	pieChart.update();

	linegraph.data.datasets[0].data = [ linegraph.data.datasets[0].data[0], projected ];
	linegraph.update();
}

async function makeInvestment(index) {
	var obj = data[index];
	var add = parseFloat($(`#invest-input`).val());
	await updateProperty(obj._id, obj.MoneyRaised + add, obj.PeopleInvested + 1);

	investments[obj._id] = {};
	investments[obj._id].value = add;
	investments[obj._id].zone = obj.MSZoning;
	investments[obj._id].class = obj.MSSubClass;
	investments[obj._id].est = obj.EstSalePrice;
	investments[obj._id].req = obj.RequestedValue;
	balance -= add;

	closePanel();
	loadAvailable();
}

async function changeInvestment(index) {
	var obj = data[index];
	var change = parseFloat($(`#change-input`).val());

	await updateProperty(obj._id, obj.MoneyRaised + change, obj.PeopleInvested);

	investments[obj._id].value += change;
	balance -= change;

	closeOwnedPanel();
	loadPortfolio();
}

async function removeInvestment(index) {
	var obj = data[index];
	var subtract = investments[obj._id].value;

	await updateProperty(obj._id, obj.MoneyRaised - subtract, obj.PeopleInvested - 1);
	delete investments[obj._id];

	balance += subtract;

	closeOwnedPanel();
	loadPortfolio();
}

async function updateProperty(id, money, number) {
	const rawResponse = await fetch('/api/properties/update', {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: id,
			money: money,
			number: number
		})
	});
	const res = await rawResponse.json();
	return res;
}

// Available

function loadAvailable() {
	setupProperties(propertyHtml, 'property-list', {
		_id: { $nin: Object.keys(investments) },
		$expr: { $gt: [ '$RequestedValue', '$MoneyRaised' ] }
	});
}

function initPage() {
	$('body').fadeIn('slow');
	initMap();
	// loadAvailable();
	loadPortfolio();
	loadPie();
	loadLine();
}

function propertyHtml2(obj, index) {
	var address = `${obj.StreetAddress}, ${obj.City}, ${obj.State}`;
	var current = investments[obj._id].value;
	var html = `
    <div class="property ${obj.MoneyRaised > obj.RequestedValue ? 'funded' : 'open'}">
        <div class="img-container">
        <img src="${obj.Image}" />
        </div>
        <label>#${obj._id}</label>
        <h3 onclick='openOwnedPanel(${index})'>${address}</h3>
        <p>Type: ${MSZoning[obj.MSZoning]}</p>
        <p>Class: ${MSSubClass[obj.MSSubClass]}</p>
        <p>Amount Invested: $${current}</p>
		<p>Percent Invested: ${(100 * current / obj.RequestedValue).toFixed(2)}%</p>
        <div class="progressbar">
            <div class="progress" style="width: ${100 * obj.MoneyRaised / obj.RequestedValue}%"></div>
        </div>
    </div>`;
	return html;
}

function openOwnedPanel(index) {
	$('#owned-list').fadeOut(400, () => {
		$('#owned-info-container').fadeIn();
		loadOwnedPanel(data[index], index);
	});
}

function loadOwnedPanel(obj, index) {
	var current = investments[obj._id].value;
	var html = `
    <div class="head">
        <div class="img-container">
            <img src="${obj.Image}" />
        </div>
        <div class="head-info">
            <label>#${obj._id}</label>
            <h3>${obj.StreetAddress}</h3>
            <p>${obj.City}, ${obj.State}</p>
            <p>Longitude: ${obj.Longitude}</p>
            <p>Latitude: ${obj.Latitude}</p>
            <p>Status: <span>${obj.MoneyRaised > obj.RequestedValue ? 'Funded' : 'Open'}</span></p>
        </div>
    </div>

    <div class="progressbar">
        <div class="progress" style="width: ${100 * obj.MoneyRaised / obj.RequestedValue}%"></div>
    </div>

    <div class="progress-info">
        <p>Target: $${obj.RequestedValue.toFixed(2)}</p>
        <p>Raised: $${obj.MoneyRaised.toFixed(2)}</p>
        <p>Estimated Value: $${obj.EstSalePrice.toFixed(2)}</p>
    </div>

    <div class="invest-money">
        <input id="change-input" type='number' min=0 max=${balance} placeholder='Change Investment'/>
        <button onclick="changeInvestment(${index})">Update</button>
        <p>Currently Invested: $${current}</p>
    </div>

    <p>Type: ${MSZoning[obj.MSZoning]}</p>
    <p>Class: ${MSSubClass[obj.MSSubClass]}</p>

    <p>Area: ${obj.LotArea} Sq. ft.</p>
    <p>Above. Ground Living Area: ${obj.GrLivArea} Sq. ft.</p>
    <p>Utilities: ${Utilities[obj.Utilities]}</p>
    <p>Heating: ${Heating[obj.Heating]}</p>
    <p>Electrical: ${Electrical[obj.Electrical]}</p>
    <p>Garage: ${GarageType[obj.GarageType]}</p>
    <p>Driveway: ${PavedDrive[obj.PavedDrive]}</p>
    <p>Misc: ${MiscFeature[obj.MiscFeature] || 'No extra features'}</p>

    <div class="keywords">
    `;

	if ('Keywords' in obj && obj.Keywords)
		obj.Keywords.forEach((word) => {
			html += `<span class="keyword">${word.name} <span class="type">${word.type}</span></span>`;
		});

	html += `</div>

    <button onclick="closePanel()">Back</button>
    <button class="refund" onclick="removeInvestment(${index})">Refund Investment</button>
    `;
	$('#owned-info').html(html);
	$('#owned-info').removeClass('funded');
	$('#owned-info').removeClass('open');
	$('#owned-info').addClass(obj.MoneyRaised > obj.RequestedValue ? 'funded' : 'open');
}

function closeOwnedPanel() {
	$('#owned-info-container').fadeOut(400, () => {
		$('#owned-list').fadeIn();
	});
}

function propertyHtml(obj, index) {
	var address = `${obj.StreetAddress}, ${obj.City}, ${obj.State}`;
	var html = `
    <div class="property ${obj.MoneyRaised > obj.RequestedValue ? 'funded' : 'open'}">
        <div class="img-container">
        <img src="${obj.Image}" />
        </div>
        <label>#${obj._id}</label>
        <h3 onclick='openPanel(${index})'>${address}</h3>
        <p>Type: ${MSZoning[obj.MSZoning]}</p>
        <p>Class: ${MSSubClass[obj.MSSubClass]}</p>
        <p>Requested Value: $${obj.RequestedValue.toFixed(2)}</p>
		<p>Estimated Value: $${obj.EstSalePrice.toFixed(2)}</p>
        <div class="progressbar">
            <div class="progress" style="width: ${100 * obj.MoneyRaised / obj.RequestedValue}%"></div>
        </div>
    </div>`;
	return html;
}

function openPanel(index) {
	$('#property-list').fadeOut(400, () => {
		$('#property-info-container').fadeIn();
		loadPanel(data[index], index);
	});
}

function loadPanel(obj, index) {
	var html = `
    <div class="head">
        <div class="img-container">
            <img src="${obj.Image}" />
        </div>
        <div class="head-info">
            <label>#${obj._id}</label>
            <h3>${obj.StreetAddress}</h3>
            <p>${obj.City}, ${obj.State}</p>
            <p>Longitude: ${obj.Longitude}</p>
            <p>Latitude: ${obj.Latitude}</p>
            <p>Status: <span>${obj.MoneyRaised > obj.RequestedValue ? 'Funded' : 'Open'}</span></p>
        </div>
    </div>

    <div class="progressbar">
        <div class="progress" style="width: ${100 * obj.MoneyRaised / obj.RequestedValue}%"></div>
    </div>

    <div class="progress-info">
        <p>Target: $${obj.RequestedValue.toFixed(2)}</p>
        <p>Raised: $${obj.MoneyRaised.toFixed(2)}</p>
        <p>Estimated Value: $${obj.EstSalePrice.toFixed(2)}</p>
    </div>

    <div class="invest-money">
        <input id="invest-input" type='number' min=0 max=${balance} placeholder='Invest'/>
        <button onclick="makeInvestment(${index})">Invest</button>
    </div>

    <p>Type: ${MSZoning[obj.MSZoning]}</p>
    <p>Class: ${MSSubClass[obj.MSSubClass]}</p>

    <p>Area: ${obj.LotArea} Sq. ft.</p>
    <p>Above. Ground Living Area: ${obj.GrLivArea} Sq. ft.</p>
    <p>Utilities: ${Utilities[obj.Utilities]}</p>
    <p>Heating: ${Heating[obj.Heating]}</p>
    <p>Electrical: ${Electrical[obj.Electrical]}</p>
    <p>Garage: ${GarageType[obj.GarageType]}</p>
    <p>Driveway: ${PavedDrive[obj.PavedDrive]}</p>
    <p>Misc: ${MiscFeature[obj.MiscFeature] || 'No extra features'}</p>
    
    <div class="keywords">
    `;

	if ('Keywords' in obj && obj.Keywords)
		obj.Keywords.forEach((word) => {
			html += `<span class="keyword">${word.name} <span class="type">${word.type}</span></span>`;
		});

	html += `</div>

    <button onclick="closePanel()">Back</button>
    `;
	$('#property-info').html(html);
	$('#property-info').removeClass('funded');
	$('#property-info').removeClass('open');
	$('#property-info').addClass(obj.MoneyRaised > obj.RequestedValue ? 'funded' : 'open');
}

function closePanel() {
	$('#property-info-container').fadeOut(400, () => {
		$('#property-list').fadeIn();
	});
}

function loadPie() {
	var ctx = document.getElementById('myChart').getContext('2d');
	pieChart = new Chart(ctx, {
		// The type of chart we want to create
		type: 'pie',

		// The data for our dataset
		data: {
			labels: Object.values(MSZoning),
			datasets: [
				{
					label: 'Commercial Real Estate',
					backgroundColor: [
						'rgba(255, 99, 132, 1)',
						'pink',
						'rgba(255, 206, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(153, 102, 255, 1)',
						'gray',
						'white',
						'black'
					],
					borderColor: 'royalblue',
					data: [ 0, 0, 0, 0, 0, 0, 0, 0 ]
				}
			]
		},

		// Configuration options go here
		options: {
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				display: true,
				labels: {
					fontColor: '#000000'
				}
			}
		}
	});
}

function loadLine() {
	var ctx = document.getElementById('linegraph').getContext('2d');
	linegraph = new Chart(ctx, {
		type: 'line',
		data: {
			labels: [ 'Current', 'Future' ],
			datasets: [
				{
					data: [ balance, balance ],
					borderColor: '#000000',
					backgroundColor: 'royalblue'
				}
			]
		},
		options: {
			title: {
				display: true,
				text: 'Value Projection',
				fontColor: '#000000'
			},
			legend: {
				display: false
			},
			scales: {
				yAxes: [
					{
						ticks: {
							fontColor: 'black',
							min: 0,
							max: balance * 1.5
						}
					}
				],
				xAxes: [
					{
						ticks: {
							fontColor: 'black'
						}
					}
				]
			}
		}
	});
}
