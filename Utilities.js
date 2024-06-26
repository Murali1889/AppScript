function handleNameField(value, sheetName, sourceRow, sourceSheet, columnIndex) {
  if (sheetName === SHORTLIST_SHEET_NAME) {
    return `${getValueFromSheet(sourceSheet, sourceRow, columnIndex)}`;
  } else if (sheetName === PROFILE_SHEET_NAME) {
    return value.split(" ")[0];
  }
  return value;
}

function getValueFromSheet(sheet, rowNum, columnIndex) {
  if (columnIndex === -1) {
    return null; 
  }
  var cell = sheet.getRange(rowNum, columnIndex);
  var cellFormula = cell.getFormula();
  if (cellFormula.startsWith('=HYPERLINK')) {
    var matches = cellFormula.match(/"([^"]+)"/g);
    if (matches && matches.length == 2) {
      var url = matches[0].replace(/"/g, '');
      var text = matches[1].replace(/"/g, '');
      Logger.log(url);
      Logger.log(text);
      return `=HYPERLINK("${url}", "${text}")`;
    }
  }
  return cell.getValue(); 
}

function getHeaderIndices(headersArray, sourceSheet) {
  let headersIndices = {};
  let sheetHeaders = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
  headersArray.forEach(header => {
    let columnIndex = sheetHeaders.indexOf(header) + 1;
    if (columnIndex > 0) {
      headersIndices[header] = columnIndex;
    } else {
      Logger.log(`Header "${header}" not found in the source sheet.`);
    }
  });
  return headersIndices;
}

function checkDuplicate(sourceId, destinationIds) {
  const foundIndex = destinationIds.findIndex(id => id[0] === sourceId);
  return {
    duplicate: foundIndex !== -1,
    row: foundIndex !== -1 ? foundIndex + 2 : -1
  };
}


function isSendOrSent(value=undefined) {
  if(value){
return ["send", "sent"].includes(value.trim().toLowerCase());
  }
  else{
    return false;
  }
  
}
function findIndex(sheet,indexElement){
  Logger.log(`Getting index of header ${indexElement} from sheet ${sheet.getName()}`)
  var sheetData = sheet.getDataRange().getValues();
  var indexOfId = sheetData[0].indexOf(indexElement);
  return indexOfId;
}

function getIdFromSheet(sheet, row) {
  const idColumnIndex = findIndex(sheet, ID_COLUMN_NAME);
  var value = -1
  try{
    value = sheet.getRange(row, idColumnIndex+1).getValue();
  }catch(e){
    Logger.log(`${sheet.getName()} doesn't have ID column`)
    value = -1;
  }
  return value;
}

function getIdsFromSheet(sheet) {
  if (sheet.getLastRow() <= 1) return [];
  const idColumnIndex = findIndex(sheet, ID_COLUMN_NAME);
  const value = sheet.getRange(2, idColumnIndex + 1, sheet.getLastRow() - 1).getValues()
  return value;
}

function saveAudio(base64Data, title="Recording") {
  const decodedData = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedData, 'audio/wav', `${title}.wav`);
  const folder = DriveApp.getFolderById('1C09YnTo0n8KZyQKPutAF7jZ7dju6uKKV');
  const file = folder.createFile(blob);
  const fileUrl = file.getUrl();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Feedback");
  sheet.appendRow([new Date(), fileUrl]);
}


function compareSheetValues(sourceSheet, destinationSheet, sourceHeaderIndex, destinationHeaderIndex) {
  let comparisonResult = {
    uniqueRows: [],
    duplicateRows: []
  };
  let sourceLastRow = Math.max(2, sourceSheet.getLastRow());
  let destinationLastRow = Math.max(2, destinationSheet.getLastRow());
  let sourceData = sourceSheet.getRange(2, sourceHeaderIndex, sourceLastRow - 1, 1).getValues();
  let destinationData = destinationSheet.getRange(2, destinationHeaderIndex, destinationLastRow - 1, 1).getValues();
  let destinationIdToRowMap = new Map();
  destinationData.forEach((row, index) => {
    let rowNumber = index + 2;
    destinationIdToRowMap.set(row[0], rowNumber);
  });
  sourceData.forEach((row, index) => {
    let sourceRowNumber = index + 2; 
    if (destinationIdToRowMap.has(row[0])) {
      comparisonResult.duplicateRows.push([sourceRowNumber, destinationIdToRowMap.get(row[0])]);
    } else {
      comparisonResult.uniqueRows.push(sourceRowNumber);
    }
  });
  return comparisonResult;
}





