var API_URL = "https://dtpoonamsagar.com/api/form-submissions?formId=1";
var SHEET_NAME = "Lead Form 1";

// ── Configuration ──
var MAX_RETRIES = 3;
var RETRY_DELAY_MS = 2000;

var HEADER = [
	"Submission ID",
	"Form ID",
	"Name",
	"City",
	"Contact Number",
	"Email",
	"Age",
	"Gender",
	"Height",
	"Weight",
	"Primary Goal",
	"Medical Conditions",
	"Tried Methods",
	"Daily Routine",
	"Preferred Date",
	"Preferred Call Time",
	"Page",
	"Source",
	"Created At (IST)",
	"Updated At (IST)"
];

function safe(v) {
	return (v === undefined || v === null || String(v).trim() === "") ? "--" : String(v);
}

function formatIST(value) {
	var d = new Date(value);
	if (isNaN(d.getTime())) return "--";
	return Utilities.formatDate(d, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
}

function getOrCreateSheet() {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sh = ss.getSheetByName(SHEET_NAME);
	if (!sh) {
		sh = ss.insertSheet(SHEET_NAME);
	}

	var firstCell = sh.getRange(1, 1).getValue();
	if (!firstCell || firstCell !== HEADER[0]) {
		sh.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
		sh.getRange(1, 1, 1, HEADER.length).setFontWeight("bold");
		sh.setFrozenRows(1);
	}

	return sh;
}

// ── API fetching with retry logic ──

function fetchSubmissions() {
	var lastError = null;

	for (var attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			var resp = UrlFetchApp.fetch(API_URL, {
				method: "get",
				muteHttpExceptions: true,
				followRedirects: true,
				headers: {
					"Accept": "application/json",
					"User-Agent": "Google-Apps-Script LeadSync/1.1",
					"Cache-Control": "no-cache, no-store, must-revalidate",
					"Pragma": "no-cache",
					"Expires": "0"
				}
			});

			var code = resp.getResponseCode();
			var body = resp.getContentText();

			if (code === 429) {
				Logger.log("⚠️  Rate limited (429). Attempt " + attempt + "/" + MAX_RETRIES);
				Utilities.sleep(RETRY_DELAY_MS * 2);
				lastError = new Error("Rate limited (HTTP 429)");
				continue;
			}

			if (code !== 200) {
				var preview = body.length > 500 ? body.substring(0, 500) + "..." : body;
				Logger.log("❌ API error HTTP " + code + " | attempt " + attempt + "/" + MAX_RETRIES + " | " + preview);
				lastError = new Error("API error HTTP " + code + " | " + preview);
				if (attempt < MAX_RETRIES) Utilities.sleep(RETRY_DELAY_MS);
				continue;
			}

			var json = JSON.parse(body);
			if (!json || json.success !== true || !Array.isArray(json.submissions)) {
				Logger.log("❌ Unexpected API response format. attempt " + attempt + "/" + MAX_RETRIES);
				Logger.log("   Received: " + body.substring(0, 300));
				lastError = new Error("Unexpected API response. Expected { success: true, submissions: [] }");
				if (attempt < MAX_RETRIES) Utilities.sleep(RETRY_DELAY_MS);
				continue;
			}

			Logger.log("✅ Fetched " + json.submissions.length + " submissions (attempt " + attempt + ")");
			return json.submissions;
		} catch (e) {
			Logger.log("❌ Fetch error attempt " + attempt + "/" + MAX_RETRIES + ": " + e.toString());
			lastError = e;
			if (attempt < MAX_RETRIES) Utilities.sleep(RETRY_DELAY_MS);
		}
	}

	throw lastError || new Error("Failed to fetch submissions after " + MAX_RETRIES + " attempts");
}

// ── Row mapping ──

function submissionToRow(s) {
	return [
		safe(s._id),
		safe(s.formId),
		safe(s.name),
		safe(s.city),
		safe(s.contactNumber),
		safe(s.email),
		safe(s.age),
		safe(s.gender),
		safe(s.height),
		safe(s.weight),
		safe(s.primaryGoal),
		safe(s.medicalConditions),
		safe(s.triedMethods),
		safe(s.dailyRoutine),
		safe(s.preferredDate),
		safe(s.preferredCallTime),
		safe(s.page),
		safe(s.source),
		formatIST(s.createdAt),
		formatIST(s.updatedAt)
	];
}

function appendNewRowsOnly(sh, rows) {
	if (!rows.length) return 0;

	var existingMap = {};
	var lastRow = sh.getLastRow();

	if (lastRow >= 2) {
		var existingIds = sh.getRange(2, 1, lastRow - 1, 1).getValues();
		existingIds.forEach(function(r) {
			var id = String(r[0] || "").trim();
			if (id) existingMap[id] = true;
		});
	}

	var toAppend = [];
	rows.forEach(function(row) {
		var submissionId = String(row[0] || "").trim();
		if (submissionId && !existingMap[submissionId]) {
			toAppend.push(row);
			existingMap[submissionId] = true;
		}
	});

	if (!toAppend.length) return 0;

	var startRow = sh.getLastRow() + 1;
	sh.getRange(startRow, 1, toAppend.length, HEADER.length).setValues(toAppend);
	sh.getRange(startRow, 1, toAppend.length, 1).setNumberFormat("@STRING@");
	sh.autoResizeColumns(1, HEADER.length);
	return toAppend.length;
}

// ── Main sync ──

function syncLeadFormData() {
	var startTime = new Date();
	var sh = getOrCreateSheet();

	try {
		var submissions = fetchSubmissions();
		var rows = submissions.map(submissionToRow);
		var added = appendNewRowsOnly(sh, rows);

		var duration = ((new Date() - startTime) / 1000).toFixed(1);
		Logger.log(
			"✅ Sync done @ " + formatIST(new Date()) +
			" (" + duration + "s)" +
			" | fetched=" + submissions.length +
			" | added=" + added
		);
	} catch (err) {
		Logger.log("❌ Sync FAILED @ " + formatIST(new Date()) + " | " + err.toString());
		throw err;
	}
}

// ── Trigger management ──

function setupAutoRefreshTrigger() {
	deleteAutoRefreshTrigger();
	ScriptApp.newTrigger("syncLeadFormData")
		.timeBased()
		.everyMinutes(5)
		.create();
	Logger.log("✅ Trigger installed: every 5 minutes for syncLeadFormData");
}

function deleteAutoRefreshTrigger() {
	var triggers = ScriptApp.getProjectTriggers();
	triggers.forEach(function(t) {
		if (t.getHandlerFunction() === "syncLeadFormData") {
			ScriptApp.deleteTrigger(t);
		}
	});
}

function checkAutoRefreshTrigger() {
	var triggers = ScriptApp.getProjectTriggers();
	var active = triggers.filter(function(t) {
		return t.getHandlerFunction() === "syncLeadFormData";
	});

	if (active.length > 0) {
		Logger.log("✅ Trigger active for syncLeadFormData. Count=" + active.length);
	} else {
		Logger.log("❌ No active trigger found. Run setupAutoRefreshTrigger()");
	}
}

// ── Diagnostics ──

function testApi() {
	Logger.log("🔍 Testing API: " + API_URL);
	try {
		var resp = UrlFetchApp.fetch(API_URL, {
			method: "get",
			muteHttpExceptions: true,
			followRedirects: true,
			headers: {
				"Accept": "application/json",
				"User-Agent": "Google-Apps-Script LeadSync/1.1"
			}
		});
		var code = resp.getResponseCode();
		var body = resp.getContentText();
		Logger.log("HTTP " + code);
		Logger.log("Response length: " + body.length + " chars");
		if (code === 200) {
			var json = JSON.parse(body);
			Logger.log("success: " + json.success);
			Logger.log("submissions count: " + (json.submissions ? json.submissions.length : "N/A"));
			if (json.submissions && json.submissions.length > 0) {
				Logger.log("First submission: " + JSON.stringify(json.submissions[0]).substring(0, 400));
			}
		} else {
			Logger.log("Response preview: " + body.substring(0, 500));
		}
	} catch (e) {
		Logger.log("❌ Test failed: " + e.toString());
	}
}
