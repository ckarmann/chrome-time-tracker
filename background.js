

var count = 0;
var countMap = { };
countMap[""] = 0;
var currentDomain = null;
var currentTabId = -1;
var currentDay = getToday();

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

function saveUpdate() {
	if (currentDomain != null) {
		var key = "count#" + currentDomain;
		var value = {val: countMap[currentDomain], day : getToday()};
		var update = {};
		update[key] = value;
		chrome.storage.local.set(update);
	}
}

function getToday() {
	var date = new Date();

	return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

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
		});
	});
}

loadData();

// TODO: 
// - handle subdomain?

function formatCount(seconds) {

	//var hours = Math.floor(seconds / 3600);
	var minutes = Math.floor(seconds / 60);
	var sec = seconds % 60;
	if (sec < 10) {
		sec = "0" + sec;
	}

	return minutes + ":" + sec;
}

function updateIcon() {
	if (currentDomain == null) {
		chrome.browserAction.setBadgeBackgroundColor({color:[127, 127, 127, 230]});
		chrome.browserAction.setBadgeText({text:""});
	}
	else {
		chrome.browserAction.setBadgeBackgroundColor({color:[63, 63, 127, 230]});
		chrome.browserAction.setBadgeText({text:formatCount(countMap[currentDomain])});
	}
}

setInterval(update, 1000);

console.log("let's go");

function setCurrentUrl(url) {
	var domain = extractDomain(url);
	currentDomain = domain;
	if (domain != null && !(domain in countMap)) {
		countMap[domain] = 0;
	}	
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab){
		setCurrentUrl(tab.url);
		currentTabId = activeInfo.tabId;
	});
	updateIcon();
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if (changeInfo.url != null) {
		if (currentTabId == tabId) {
			setCurrentUrl(changeInfo.url)
			updateIcon();
		}
	}
});

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