
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
			var rowClass = [];
			if (key == back.currentDomain) {
				rowClass.push("currentDomain");
			}
			var category = back.categoryMap[key];
			if (category === "good") {
				rowClass.push("good");
			}
			else if (category === "bad") {
				rowClass.push("bad");
			}

			table += "<tr class='" + rowClass.join(" ") + "'>";
			table += "<td>" + key + "</td><td class='numeric'>" 
				+ back.formatCount(countMap[key]) + "</td><td class='numeric'>"
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
