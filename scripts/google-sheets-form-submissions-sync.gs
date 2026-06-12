var API_URL = "https://dtpoonamsagar.com/api/form-submissions?formId=1";
var SHEET_NAME = "Lead Form 1";

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

function fetchSubmissions() {
	var resp = UrlFetchApp.fetch(API_URL, {
		method: "get",
		muteHttpExceptions: true,
		followRedirects: true,
		headers: {
			"Accept": "application/json",
			"Cache-Control": "no-cache, no-store, must-revalidate",
			"Pragma": "no-cache",
			"Expires": "0"
		}
	});

	var code = resp.getResponseCode();
	var body = resp.getContentText();

	if (code !== 200) {
		throw new Error("API error HTTP " + code + " | " + body.substring(0, 700));
	}

	var json = JSON.parse(body);
	if (!json || json.success !== true || !Array.isArray(json.submissions)) {
		throw new Error("Unexpected API response. Expected { success: true, submissions: [] }");
	}

	return json.submissions;
}

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

function syncLeadFormData() {
	var startTime = new Date();
	var sh = getOrCreateSheet();
	var submissions = fetchSubmissions();

	var rows = submissions.map(submissionToRow);
	var added = appendNewRowsOnly(sh, rows);

	Logger.log(
		"Sync done @ " + formatIST(new Date()) +
		" | fetched=" + submissions.length +
		" | added=" + added +
		" | duration=" + ((new Date() - startTime) / 1000) + "s"
	);
}

function setupAutoRefreshTrigger() {
	deleteAutoRefreshTrigger();

	// Apps Script supports time-driven triggers for auto refresh.
	ScriptApp.newTrigger("syncLeadFormData")
		.timeBased()
		.everyMinutes(5)
		.create();

	Logger.log("Auto-refresh trigger installed: every 5 minutes");
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
		Logger.log("Trigger active for syncLeadFormData. Count=" + active.length);
	} else {
		Logger.log("No active trigger found. Run setupAutoRefreshTrigger()");
	}
}

function testApi() {
	var resp = UrlFetchApp.fetch(API_URL, {
		method: "get",
		muteHttpExceptions: true,
		headers: {
			"Accept": "application/json"
		}
	});
	Logger.log("HTTP " + resp.getResponseCode());
	Logger.log(resp.getContentText());
}
