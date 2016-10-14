
(function() {

	function getRowClass(category, isCurrentDomain) {
		var rowClass = [];
		if (isCurrentDomain) {
			rowClass.push("currentDomain");
		}
		if (category === "good") {
			rowClass.push("good");
		}
		else if (category === "bad") {
			rowClass.push("bad");
		}
		return rowClass.join(" ");
	}

	function categorizeClick(button) {
		var back = chrome.extension.getBackgroundPage();
		var domain = button.dataset.domain;
		back.advanceCategory(domain);
		var newClass = getRowClass(back.categoryMap[domain], domain == back.currentDomain);
		button.closest("tr").className = newClass;
		updateSummary();
	}

	function bootstrap() {
		console.log("bootstrap");
		// document.getElementById('status').textContent = new Date().toString();

		document.getElementById('timeTable').addEventListener("click", function(event){
			var target = event.target;
			if (target.className == 'categorizeButton') {
				categorizeClick(target);
			}
		});
	}

	function updateSummary() {
		var back = chrome.extension.getBackgroundPage();
		var countMap = back.countMap;
		var categoryMap = back.categoryMap;

		var goodTotal = 0;
		var badTotal = 0;
		var grandTotal = 0;
		Object.keys(countMap).forEach(function(key){
			if (categoryMap[key] == "good") {
				goodTotal += countMap[key];
			}
			else if (categoryMap[key] == "bad") {
				badTotal += countMap[key];
			}
			grandTotal += countMap[key];
		});

		document.getElementById("goodTotal").textContent = back.formatCount(goodTotal) + " (" + formatPercent(goodTotal/grandTotal) + ")";
		document.getElementById("badTotal").textContent = back.formatCount(badTotal) + " (" + formatPercent(badTotal/grandTotal) + ")";
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
			var rowClass = getRowClass(back.categoryMap[key], key == back.currentDomain);

			table += "<tr class='" + rowClass + "'>" 
				+ "<td>" + key + "</td>" 
				+ "<td class='numeric'>" + back.formatCount(countMap[key]) + "</td>" 
				+ "<td class='numeric'>" + formatPercent(countMap[key]/total) + "</td>"
				+ "<td class='categorize'><button class='categorizeButton' data-domain='" + key + "'></button></td>" 
				+ "</tr>";
		});
		document.getElementById('timeTable').innerHTML = table;
		//document.getElementById('total').textContent = back.formatCount(total);

		updateSummary();
	}

	document.addEventListener('DOMContentLoaded', function() {
	  bootstrap();

	  showTable();
	});
})();
