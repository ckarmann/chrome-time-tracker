
(function() {

	// commpute the class of the row element.
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

	// handle click on category button.
	function categorizeClick(button) {
		var back = chrome.extension.getBackgroundPage();
		var domain = button.dataset.domain;
		back.advanceCategory(domain);
		var newClass = getRowClass(back.categoryMap[domain], domain == back.currentDomain);
		button.closest("tr").className = newClass;
		updateSummary();
	}

	// bootstrap page.
	function bootstrap() {
		console.log("bootstrap");

		// listener for categorizing buttons
		document.getElementById('timeTable').addEventListener("click", function(event){
			var target = event.target;
			if (target.className == 'categorizeButton') {
				categorizeClick(target);
			}
		});
	}

	// update the summary of categories.
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

	// handy tool to format a number into a percentage
	function formatPercent(number) {
		return (number * 100).toFixed(1) + "%";
	}

	// Display table and any other output.
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
				+ "<td id='domain_" + key + "'>" + key + "</td>" 
				+ "<td class='numeric'>" + back.formatCount(countMap[key]) + "</td>" 
				+ "<td class='numeric'>" + formatPercent(countMap[key]/total) + "</td>"
				+ "<td class='categorize'><button class='categorizeButton' data-domain='" + key + "'></button></td>" 
				+ "</tr>";

		});
		document.getElementById('timeTable').innerHTML = table;

		sortedKeys.forEach(function(key) {
			chrome.history.search({text:key, maxResults:3}, function(results){
				var history = [];
				for (i = 0; i<results.length;i++) {
					var title = results[i].title;
					if (title) {
						history.push(results[i].title);
					}
					else {
						history.push(results[i].url);
					}
				}
				document.getElementById("domain_" + key).setAttribute('title', history.join("\n"));
			});
		});

		updateSummary();
	}

	// startup code.
	document.addEventListener('DOMContentLoaded', function() {
	  bootstrap();
	  showTable();
	});
})();
