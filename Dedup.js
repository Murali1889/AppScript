function combinedDuplicateHandler(sheetName, linkedinHeader) {
  var sheet = getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var idIndex = findIndex(sheet, ID_COLUMN_NAME);
  Logger.log(`duplicates removing from ${sheetName} of header ${linkedinHeader}`)
  if(idIndex<0){
    Logger.log(`didnt' find the index of header ${linkedinHeader}`)
    return;
  }
  var linkedinIndex = findIndex(sheet, linkedinHeader);
  if(!linkedinIndex){
    Logger.log(`didn't find the index of header ${linkedinHeader}`)
  }
  var seenUrls = new Set();
  var seenIds = new Set();
  var rowsToDelete = [];

  data.slice(1).forEach((row, rowIndex) => {
    processIds(row[idIndex], seenIds, rowIndex, sheet, sheetName);
    processLinkedInUrls(row[linkedinIndex], seenUrls, rowIndex, rowsToDelete);
  });
  Logger.log(`Rows to delete ${JSON.stringify(rowsToDelete)}`)
  deleteRows(sheet, rowsToDelete);
}


function extractUsernameFromLinkedInUrl(url) {
  try{
var match = url.match(/linkedin\.com\/in\/([^\/]+)/i);
  return match && match[1] ? { isName: true, data: match[1] } : { isName: false, data: 'No Username' };
  }
  catch(e){
    return {isName:false, data:'No Username'}
  }
  
}

function processLinkedInUrls(linkedInUrl, seenUrls, rowIndex, rowsToDelete) {
  var usernameObj = extractUsernameFromLinkedInUrl(linkedInUrl);
  if (usernameObj.isName && seenUrls.has(usernameObj.data)) {
    rowsToDelete.push(rowIndex + 2); // +2 to adjust for zero-based index and header row
  } else if (usernameObj.isName) {
    seenUrls.add(usernameObj.data);
  }
}

function processIds(id, seenIds, rowIndex, sheet, sheetName) {
  if (seenIds.has(id)) {
    var newRowId = generateUniqueID(sheetName, SPREADSHEET_NAME);
    sheet.getRange(rowIndex + 2, findIndex(sheet, ID_COLUMN_NAME) + 1).setValue(newRowId);
  } else {
    seenIds.add(id);
  }
}

function deleteRows(sheet, rowsToDelete) {
  rowsToDelete.reverse().forEach(rowNum => sheet.deleteRow(rowNum));
}

function getSheetByName(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    throw new Error("Sheet not found: " + sheetName);
  }
  return sheet;
}

