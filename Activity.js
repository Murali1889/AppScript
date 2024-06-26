function lastActivity(row, columnHeader, oldValue, newValue, sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log("Sheet not found: " + sheetName);
    return;
  }
  var lastActionColIndex = findIndex(sheet, "Last Action");
  if(!getIdFromSheet(sheet,row)){
    return;
  }
  if (lastActionColIndex === -1) {
    Logger.log("Last Action column not found.");
    return;
  }
  var actionDetail = getCurrentDateTimeWithLastAction(columnHeader, oldValue, newValue);
  try {
    sheet.getRange(row, lastActionColIndex + 1).setValue(actionDetail);
  } catch (e) {
    Logger.log("Error updating Last Action: " + e.toString());
  }
}


function getCurrentDateTime() {
  return(new Date().toLocaleString('en-US', {
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true
  }))
}


function makeHeadersBold() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetNames = [PROFILE_SHEET_NAME, INBOUND_SHEET_NAME, SHORTLIST_SHEET_NAME, INTERVIEW_SHEET_NAME];
  sheetNames.forEach(sheetName => {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log("Sheet not found: " + sheetName);
      return;
    }
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight("bold");
  });
}


function findIdAndName(sheetName, row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log("Sheet not found: " + sheetName);
    return {id: null, name: null};
  }
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIndex = headers.indexOf("ID") + 1; 
  var nameIndex = headers.indexOf("Name") + 1; 
  
  if (idIndex <= 0 || nameIndex <= 0) {
    Logger.log("ID or Name column not found");
    return {id: null, name: null};
  }
  var rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idValue = rowData[idIndex - 1]; 
  var nameValue = rowData[nameIndex - 1];
  return {id: idValue, name: nameValue};
}

function getCurrentDateTimeWithLastAction(headername, oldValue, newValue) {
  var formattedDate = getCurrentDateTime();
  var formattedLastAction = headername + ": " + oldValue + " --> " + newValue;
  return formattedDate + "\n" + formattedLastAction;
}