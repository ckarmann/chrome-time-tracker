
(function() {
	function bootstrap() {
		console.log("bootstrap");
		document.getElementById('status').textContent = new Date().toString();
	}

	function formatPercent(number) {
		return (number * 100).toFixed(1) + "%";
	}

	function showTable() {
		var back = chrome.extension.getBackgroundPage();
		var countMap = back.countMap;
		var sortedKeys = Object.keys(countMap).sort(function(a,b) { 
			return countMap[b] - countMap[a]; 
		});

		var total = 0;
		sortedKeys.forEach(function(key){
			total += countMap[key];
		});

		var table = "";
		sortedKeys.forEach(function(key){
			table += "<tr><td>" + key + "</td><td>" 
			+ back.formatCount(countMap[key]) + "</td><td>"
			+ formatPercent(countMap[key]/total) + "</td></tr>";
		});
		document.getElementById('timeTable').innerHTML = table;
		document.getElementById('total').textContent = back.formatCount(total);
	}

	document.addEventListener('DOMContentLoaded', function() {
	  bootstrap();

	  showTable();
	});
})();
