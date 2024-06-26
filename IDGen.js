function updateEmptyIds(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }
  var idColumnIndex = findIndex(sheet, "ID");
  if (idColumnIndex === -1) {
    Logger.log("ID column not found");
    return;
  }
  var data = sheet.getDataRange().getValues();
  var emptyRows = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][idColumnIndex] && isRowFilled(data[i])) {
      emptyRows.push(i + 1);
    }
  }
  var prefix = getPrefixFromName(SPREADSHEET_NAME) + '-' + getPrefixFromName(sheetName) + '-';
  var nextID = getNextID(sheetName, prefix);
  var newIds = [];
  for (var j = 0; j < emptyRows.length; j++) {
    var newId = prefix + String(nextID++).padStart(4, '0');
    newIds.push([newId]);
  }
  var ranges = emptyRows.map(function(row, index) {
    return sheet.getRange(row, idColumnIndex + 1);
  });
  for (var k = 0; k < ranges.length; k++) {
    ranges[k].setValue(newIds[k][0]);
  }
}


function generateUniqueID(sheetName, roleName, sheetId) {
  var prefix = getPrefixFromName(roleName) + '-' + getPrefixFromName(sheetName) + '-' ;
  var nextID = getNextID(sheetName, prefix, sheetId);
  return prefix + String(nextID).padStart(4, '0');
}

function getPrefixFromName(name) {
  if (name === INBOUND_SHEET_NAME) {
    return "IB";
  } else if (name === INTERVIEW_SHEET_NAME) {
    return "IT";
  }
  else if(name===SHORTLIST_SHEET_NAME){
    return "ST"
  }
  else if(name===PROFILE_SHEET_NAME){
    return "PF"
  }
   else {
    return name.split(' ')
               .filter(word => /^[A-Za-z]/.test(word))
               .map(word => word[0].toUpperCase())
               .join('');
  }
}


function isAlphabet(char) {
  return /^[A-Za-z]$/.test(char);
}


function getNextID(sheetName, prefix,sheetId) {
  var sheet;
  if(sheetId) sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName)
  else sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var idColumnIndex = findIndex(sheet, "ID");
  if (idColumnIndex === -1) {
    throw new Error("ID column not found");
  }

  var maxID = 0;
  for (var i = 1; i < data.length; i++) {
    var currentID = data[i][idColumnIndex];
    if (currentID.startsWith(prefix)) {
      var numericPart = parseInt(currentID.replace(prefix, "")) || 0;
      if (numericPart > maxID) {
        maxID = numericPart;
      }
    }
  }
  return maxID + 1;
}



function isRowFilled(rowData) {
  return rowData.some(cell => cell !== null && cell !== '');
}
