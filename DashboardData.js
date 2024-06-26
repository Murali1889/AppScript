function onEditTrigger(e) {
  var sheet = e.source.getActiveSheet();
  var editedRange = e.range;

  if (sheet.getName() === "Dashboard" && editedRange.getColumn() === 1) {
    calcProfiles();
  }
}

// function createTrigger() {
//   var script = ScriptApp.newTrigger('onEditTrigger')
//     .forSpreadsheet(SpreadsheetApp.getActive())
//     .onEdit()
//     .create();
// }

function calcProfiles() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var masterSheet = sheet.getSheetByName("Dashboard");

  var columnHeaders = masterSheet.getRange(3, 1, 1, masterSheet.getLastColumn()).getValues()[0];
  var columnIndex = columnHeaders.indexOf("Roles") + 1;

  if (columnIndex > 0) {
    var dataRange = masterSheet.getRange(2, columnIndex, masterSheet.getLastRow() - 1, 1);
    var richTextValues = dataRange.getRichTextValues();

    for (var i = 0; i < richTextValues.length; i++) {
      var richText = richTextValues[i][0];
      if (richText) {
        var runs = richText.getRuns();
        for (var j = 0; j < runs.length; j++) {
          var run = runs[j];
          var url = run.getLinkUrl();

          if (url) {
            var spreadsheetId = extractSpreadsheetId(url);
            var spreadsheetName = run.getText().replace(/"/g, '');

            if (spreadsheetId && spreadsheetId !== "0") {
              Logger.log("Processing " + spreadsheetName);
              logStatusCounts(spreadsheetId, spreadsheetName);
            } else {
              Logger.log("Invalid Spreadsheet ID found in Roles column: " + spreadsheetId);
            }
          }
        }
      }
    }
  }
}

function extractSpreadsheetId(url) {
  var regex = /\/d\/([a-zA-Z0-9-_]+)/;
  var match = url.match(regex);
  return match ? match[1] : null;
}



function logStatusCounts(spreadsheetId, spreadsheetName) {
  var shortlistStatusCounts = {
    '1. Initiated': 0,
    '2. Connected': 0,
    '3. Scheduled': 0,
    '4. Qualified': 0,
    '5. DQ\'ed': 0,
    '6. Not Interested': 0
  };
  var interviewStatusCounts = {
    '0. Resume Shared': 0,
    '1. HM Interview': 0,
    '2. Assignment Round': 0,
    '3. Domain Round': 0,
    '4. WHO Round': 0,
    '5. LTA Round': 0,
    '6. Reference Check': 0,
    '7. Offer Rolled Out': 0,
    '8. DQ\'ed': 0,
    '9. Dropped Out': 0
  };
  var inboundStatusCounts = {
    'Yes/Maybe': 0,
    'No': 0
  };

  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    var shortlistSheetName = spreadsheet.getSheetByName("1.3 - Shortlist") ? "1.3 - Shortlist" : "1.3 Shortlisted";
    var shortlistHeaderName = spreadsheet.getSheetByName("1.3 - Shortlist") ? "Overall Status" : "Status";
    var interviewSheetName = spreadsheet.getSheetByName("1.4 - Interview") ? "1.4 - Interview" : "1.4 Interview Process";
    var profilesSheetName = spreadsheet.getSheetByName("1.2 - Profiles") ? "1.2 - Profiles" : "1.2 Profiles";
    var inboundSheetName = spreadsheet.getSheetByName("1.21 - Inbound") ? "1.21 - Inbound" : null; // Only process if exists

    var processedSheets = {
      shortlist: processSheet(spreadsheet, shortlistSheetName, shortlistHeaderName, shortlistStatusCounts, false),
      interview: processSheet(spreadsheet, interviewSheetName, "Interview Status", interviewStatusCounts, false),
    };

    // Process the inbound sheet only if it exists
    if (inboundSheetName) {
      processedSheets.inbound = processSheet(spreadsheet, inboundSheetName, "Role Relevance", inboundStatusCounts, true);
    }

    // Logs and summary updates are now conditional
    if (processedSheets.shortlist || processedSheets.interview || processedSheets.profiles || processedSheets.inbound) {
      // Calculate the number of candidates if at least one sheet is processed
      var numCandidatesInbound = processedSheets.inbound ? countCandidates(spreadsheet, inboundSheetName, "ID") : -1;
      var numCandidatesProfiles = processedSheets.profiles ? countCandidates(spreadsheet, profilesSheetName, "ID") : -1;

      Logger.log("Counts for Shortlist in: " + spreadsheetName);
      logCounts(shortlistStatusCounts);

      Logger.log("Counts for Interview in: " + spreadsheetName);
      logCounts(interviewStatusCounts);

      Logger.log("Counts for Inbound in: " + spreadsheetName);
      logCounts(inboundStatusCounts);

      updateReviewSummary(spreadsheetName, inboundStatusCounts, shortlistStatusCounts, interviewStatusCounts, numCandidatesProfiles, numCandidatesInbound);
  }else {
    Logger.log("No relevant sheets found for: " + spreadsheetName);
  }
  } catch (e) {
    Logger.log("Skipped " + spreadsheetName +  "due to access permission");
    return;
  }
}

function processSheet(spreadsheet, sheetName, headerName, statusCounts, isProfileOrInbound) {
  var alternativeInterviewStatusNames = {
    '1. HM Screen': '1. HM Interview',
    '2. Assignment': '2. Assignment Round',
    '5. LTA': '5. LTA Round'
  };
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log("Sheet '" + sheetName + "' not found in spreadsheet with ID: " + spreadsheet.getId());
    return false;
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  var statusColumnIndex = values[0].indexOf(headerName) + 1;
  if (statusColumnIndex <= 0) {
    Logger.log("Column '" + headerName + "' not found in spreadsheet with ID: " + spreadsheet.getId());
    return false;
  }

  values.forEach(function(row, index) {
    if (index === 0) return; // Skip header row
    var status = row[statusColumnIndex - 1].toString().trim();

    // Check for alternative status names and map them to original names
    status = alternativeInterviewStatusNames[status] || status;

    if (isProfileOrInbound) {
      if (status === 'Yes' || status === 'Maybe') {
        statusCounts['Yes/Maybe']++;
      } else if (status === 'No') {
        statusCounts['No']++;
      }
    } else {
      // Check if the status is one of the recognized values
      var statusKey = Object.keys(statusCounts).find(key => key.endsWith(status) || key === status);
        if (statusKey && status) {
          statusCounts[statusKey]++;
        }
    }
  });

  return true;
}



function logCounts(statusCounts) {
  for (var status in statusCounts) {
    Logger.log(status + ": " + statusCounts[status]);
  }
}


function updateReviewSummary(spreadsheetName, inboundStatusCounts, shortlistStatusCounts, interviewStatusCounts, numCandidatesProfiles, numCandidatesInbound) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Dashboard");

  if (!sheet) {
    Logger.log("1.0 Review Summary sheet not found.");
    return;
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var nameRow = -1;
  for (var i = 0; i < values.length; i++) {
    if (values[i].includes(spreadsheetName)) {
      nameRow = i;
      break;
    }
  }

  if (nameRow === -1) {
    Logger.log("Spreadsheet Name " + spreadsheetName + " not found in Review Summary.");
    return;
  }

  if (numCandidatesInbound !== -1) {
    sheet.getRange(nameRow + 1, 2).setValue(numCandidatesInbound);
    sheet.getRange(nameRow + 1, 3).setValue(inboundStatusCounts['No']);
    sheet.getRange(nameRow + 1, 4).setValue(inboundStatusCounts['Yes/Maybe']);
  }

  // Update data for 1.3 - Shortlist
  var shortlistStatusColumns = {
    '1. Initiated': 5,
    '2. Connected': 6,
    '3. Scheduled': 7,
    '4. Qualified': 8,
    '5. DQ\'ed': 9,
    '6. Not Interested': 10
  };

  for (var status in shortlistStatusCounts) {
    sheet.getRange(nameRow + 1, shortlistStatusColumns[status]).setValue(shortlistStatusCounts[status] || 0);
  }

  // Update data for 1.4 - Interview
  var interviewStatusColumns = {
    '0. Resume Shared': 13,
    '1. HM Interview': 14,
    '2. Assignment Round': 15,
    '3. Domain Round': 16,
    '4. WHO Round': 17,
    '5. LTA Round': 18,
    '6. Reference Check': 19,
    '7. Offer Rolled Out': 20,
    '8. DQ\'ed': 21,
    '9. Dropped Out': 22
  };

  for (var status in interviewStatusCounts) {
    sheet.getRange(nameRow + 1, interviewStatusColumns[status]).setValue(interviewStatusCounts[status] || 0);
  }
}

function countCandidates(spreadsheet, sheetName, idHeader) {

  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    Logger.log(sheetName + " sheet not found.");
    return 0;
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var idColumnIndex = values[0].indexOf(idHeader) + 1;

  if (idColumnIndex <= 0) {
    Logger.log(idHeader + " column not found in " + sheetName);
    return 0;
  }

  var count = 0;

  values.forEach(function(row, index) {
    if (index === 0) return; // Skip header row
    if (row[idColumnIndex - 1]) count++;
  });
  
  return count;
}