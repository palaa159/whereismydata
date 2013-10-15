var myIp = {};
// get IP address
$.ajax({
	url: 'http://api.hostip.info/get_json.php',
	type: 'GET',
	dataType: 'json',
	success: function(data) {
		myIp = data;
		$.ajax({
			url: 'http://freegeoip.net/json/' + myIp.ip,
			dataType: 'jsonp',
			type: 'GET',
			success: function(data) {
				console.log(data);
				L.marker([data.latitude, data.longitude]).addTo(map)
					.bindPopup('YOU');
			}
		});
		$('#debug').html(data.ip);
	}
});

//map
var map = L.map('map').setView([51.505, -0.09], 3);
L.tileLayer('http://a.tiles.mapbox.com/v3/michaelisanerd.map-6rzcc6ny/{z}/{x}/{y}.png', {
	attribution: '',
	minZoom: 3,
	maxZoom: 3
}).addTo(map);

// received data
var dataArray = [],
	uniqueDataArray = [],
	locationArray = [],
	uniqueLocationArray = [];
var socket = io.connect('http://localhost:9001'); // connect client to the server
socket.on('data', function(data) {
	dataArray = data.replace('/?/g', '').split('\n');
	dataArray.shift();
	dataArray.pop();
	// console.log(dataArray); // works
	$.each(dataArray, function(i, el) {
		if ($.inArray(el, uniqueDataArray) === -1)
			uniqueDataArray.push(el);
	});
	// console.log(uniqueDataArray);
	extractIp(uniqueDataArray);
	// check and delete duplicated array
	uniqueDataArray = [];
});

function extractIp(a) {
	$.each(a, function(k, v) {
		var TempLeftRight = {};
		var sender = v.substring(v.indexOf('?') + 1, v.indexOf('>'));
		var receiver = v.substring(v.indexOf('>') + 1, v.indexOf('&'));
		// console.log(sender + ', ' + receiver);

		if (sender == myIp.ip) {
			// sender is host
			TempLeftRight.sender = [myIp.latitude, myIp.longitude];
			processToLocation('receiver', receiver);
		} else if (receiver == myIp.ip) {
			// receiver is host
			TempLeftRight.receiver = [myIp.latitude, myIp.longitude];
			processToLocation('sender', sender);
		}
	});
}

function processToLocation(need, kind) {
	if(need == 'receiver') {
		$.ajax({
		url: 'http://freegeoip.net/json/' + kind,
		dataType: 'jsonp',
		type: 'GET',
		success: function(data) {
			TempLeftRight.receiver = [data.latitude, data.longitude];
			// console.log(TempLeftRight.sender);
		},
		error: function(request, status, error) {
			console.log(request.responseText);
		}
		});
	} else {
		$.ajax({
		url: 'http://freegeoip.net/json/' + kind,
		dataType: 'jsonp',
		type: 'GET',
		success: function(data) {
			TempLeftRight.sender = [data.latitude, data.longitude];
			// console.log(TempLeftRight.sender);
		},
		error: function(request, status, error) {
			console.log(request.responseText);
		}
		});
	}
	
	locationArray.push(TempLeftRight);

	// keep same location (saving memory)
	$.each(locationArray, function(i, el) {

		// if new, push
		if ($.inArray(el, uniqueLocationArray) === -1) {
			uniqueLocationArray.push(el);
		} else {
			// update
			uniqueLocationArray[i][1]++;
		}
	});

	$.each(uniqueLocationArray, function(k, v) {
		// draw 
	});

	locationArray = [];
}