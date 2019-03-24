function initPage() {
	$('body').fadeIn('slow');
	initMap();
	setupProperties(propertyHtml);
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
        <p>Status: <span>${obj.MoneyRaised > obj.RequestedValue ? 'Funded' : 'Open'}</span></p>
        <div class="progressbar">
            <div class="progress" style="width: ${100 * obj.MoneyRaised / obj.RequestedValue}%"></div>
        </div>
    </div>`;
	return html;
}

function openPanel(index) {
	$('#property-list').fadeOut(400, () => {
		$('#property-info-container').fadeIn();
		loadPanel(data[index]);
	});
}

function loadPanel(obj) {
	console.log(obj);
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
        <p>Invectors: ${obj.PeopleInvested} users</p>
    </div>

    <p>Type: ${MSZoning[obj.MSZoning]}</p>
    <p>Class: ${MSSubClass[obj.MSSubClass]}</p>

    <p>Area: ${obj.LotArea} Sq. ft.</p>
    <p>Utilities: ${Utilities[obj.Utilities]}</p>
    <p>Heating: ${Heating[obj.Heating]}</p>

    <p>Misc: ${MiscFeature[obj.MiscFeature] || 'No extra features'}</p>

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
