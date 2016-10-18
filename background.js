

var count = 0;
var countMap = { };
countMap[""] = 0;
var currentDomain = null;
var currentTabId = -1;
var currentDay = getToday();
var categoryMap =  { "reddit.com": "bad", "stackoverflow.com": "good" };
var titleCache = {};

// get domain for URL.
function extractDomain(url) {

	if (!url.startsWith("http")) {
		console.log("Ignore: " + url);
		return null;
	}

    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    if (domain.startsWith("www.")) {
    	domain = domain.substring(4);
    }

    return domain;
}


// called every second to update the time and the icon.
function update() {
	var day = getToday();
	if (day != currentDay) {
		countMap = {};
		if (currentDomain != null) {
			countMap[currentDomain] = 0;
		}
		currentDay = day;
	}
	chrome.windows.getLastFocused(function(window) {
		if (window.focused && currentDomain != null) {
			countMap[currentDomain] ++;
			updateIcon();
			saveUpdate();
		}
	});
}

// save the updated time in local storage.
function saveUpdate() {
	if (currentDomain != null) {
		var key = "count#" + currentDomain;
		var value = {val: countMap[currentDomain], day : getToday()};
		var update = {};
		update[key] = value;
		chrome.storage.local.set(update);
	}
}

// get current date as an integer of the form 20161016 (for 2016, october 16).
function getToday() {
	var date = new Date();
	return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

// load current statistics at startup.
function loadData() {
	var today = getToday();
	chrome.storage.local.get(null, function(items){
		Object.keys(items).forEach(function(key) {
			if (key.startsWith("count#")) {
				var value = items[key];
				if (today == value.day) {
					countMap[key.substring(6)] = value.val;
				}
			}
			else if (key.startsWith("category#")) {
				categoryMap[key.substring(9)] = items[key];
			}
		});
	});
}

loadData();


// format number of seconds into a minutes:seconds string.
function formatCount(seconds) {

	//var hours = Math.floor(seconds / 3600);
	var minutes = Math.floor(seconds / 60);
	var sec = seconds % 60;
	if (sec < 10) {
		sec = "0" + sec;
	}

	return minutes + ":" + sec;
}


// display the icon (acutally its badge)
function updateIcon() {
	if (currentDomain == null) {
		chrome.browserAction.setBadgeBackgroundColor({color:[127, 127, 127, 230]});
		chrome.browserAction.setBadgeText({text:""});
	}
	else {
		var category = categoryMap[currentDomain];
		var color = [63, 63, 127, 230];
		if (category === "good") {
			color = "green";
		}
		else if (category === "bad") {
			color = "red";
		}
		chrome.browserAction.setBadgeBackgroundColor({color: color});
		chrome.browserAction.setBadgeText({text:formatCount(countMap[currentDomain])});
	}
}


// save category of the domain in local storage.
function saveCategory(domain) {
	var key = "category#" + domain;
	var update = {};
	update[key] = categoryMap[domain];
	chrome.storage.local.set(update);
}


// change category of a domain.
function advanceCategory(domain) {
	var currentCategory = categoryMap[domain];
	if (currentCategory == "good") {
		categoryMap[domain] = "bad";
	}
	else if (currentCategory == "bad") {
		categoryMap[domain] = "";
	}
	else {
		categoryMap[domain] = "good";
	}
	saveCategory(domain);
}

// call update every second.
setInterval(update, 1000);

// called when the displayed URL has changed.
function setCurrentUrl(url) {
	var domain = extractDomain(url);
	currentDomain = domain;
	if (domain != null && !(domain in countMap)) {
		countMap[domain] = 0;
	}	
}

// Listener to when a new tab is selected.
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab){
		setCurrentUrl(tab.url);
		currentTabId = activeInfo.tabId;
	});
	updateIcon();
});

// Listener to when the website has changed on the current tab.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if (changeInfo.url != null) {
		if (currentTabId == tabId) {
			setCurrentUrl(changeInfo.url)
			updateIcon();
		}
	}
});

// Listener to when a window has gained focus.
chrome.windows.onFocusChanged.addListener(function(windowId) {
	if (windowId > 0) {
		chrome.tabs.query({windowId: windowId, active:true}, function(tabs) {
			var currentTab = tabs[0];
			setCurrentUrl(currentTab.url);
			currentTabId = currentTab.id;
			updateIcon();
		});
	}
});

console.log("goodie.");