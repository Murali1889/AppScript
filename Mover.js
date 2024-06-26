function moveProfile(sourceSheetName,destinationSheetName, sourceRow, value) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(100)) {
    return;
  }
 var mainSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = mainSheet.getSheetByName(sourceSheetName);
  var destinationSheet = mainSheet.getSheetByName(destinationSheetName);
  var destinationHeaders = destinationSheet.getRange(1, 1, 1, destinationSheet.getLastColumn()).getValues()[0];
  var sourceHeaders = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
  var destinationSheetIndices = getHeaderIndices(destinationHeaders, destinationSheet);
  var sourceSheetIndices = getHeaderIndices(sourceHeaders,sourceSheet);
  let destinationRow = destinationSheet.getLastRow()+1;
  let dup = checkValueExistsInColumnAndReturnRow(sourceSheet, destinationSheet, sourceRow, sourceSheetIndices[ID_COLUMN_NAME],destinationSheetIndices[ID_COLUMN_NAME]);
  let rowData = [];
  destinationHeaders.forEach(header => rowData.push(""));
  Logger.log(sourceSheetIndices)
  let dropdownRows = findDropdownHeaderRows(POSITION_CREATION_SHEET_NAME, DROPDOWN_MAPPINGS[destinationSheetName]);
  Logger.log(SHEET_MAPPINGS[sourceSheetName])
  if(dup==-1){
    if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'maybe' || value.toLowerCase().includes("qualified")) {
      fillTheValues(SHEET_MAPPINGS[sourceSheetName], sourceSheet, sourceRow, destinationSheet, destinationRow, rowData, destinationSheetIndices, sourceSheetIndices);
      lock.releaseLock();
      lock.releaseLock();
      applyDropdowns(DROPDOWN_MAPPINGS[destinationSheetName],destinationSheetIndices,destinationSheet, destinationRow,dropdownRows)
    }
  }
  else{
    if(value.toLowerCase() === "no" || !value.toLowerCase().includes("qualified")){
      destinationSheet.deleteRow(dup)
    }
  }
  lock.releaseLock();
  return;
}






function moveProfiles(sourceSheetName, destinationSheetName, headerToCheck) {
  console.time("started")
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(100)) {
    return;
  }
  var mainSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = mainSheet.getSheetByName(sourceSheetName);
  var destinationSheet = mainSheet.getSheetByName(destinationSheetName);
  var destinationHeaders = destinationSheet.getRange(1, 1, 1, destinationSheet.getLastColumn()).getValues()[0];
  var sourceHeaders = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
  var destinationSheetIndices = getHeaderIndices(destinationHeaders, destinationSheet);
  var sourceSheetIndices = getHeaderIndices(sourceHeaders,sourceSheet);
  var headerIndex = sourceSheetIndices[headerToCheck]
  if (headerIndex === -1) {
    Logger.log("Header not found: " + headerToCheck);
    lock.releaseLock();
    return;
  }
  let rowData = [];
  destinationHeaders.forEach(header => rowData.push(""));
  const rowsData = compareSheetValues(sourceSheet, destinationSheet,sourceSheetIndices[ID_COLUMN_NAME], destinationSheetIndices[ID_COLUMN_NAME]);
  handleUniqueRows(sourceSheet, destinationSheet, rowsData.uniqueRows, headerIndex, destinationSheetIndices, sourceSheetIndices,rowData);
  handleDuplicateRows(sourceSheet,destinationSheet, rowsData.duplicateRows, headerIndex);
  console.timeEnd("ended")
  lock.releaseLock();
}

function handleUniqueRows(sourceSheet, destinationSheet, uniqueRows, headerIndex, destinationSheetIndices, sourceSheetIndices,rowData) {
  Logger.log(rowData)
  let sourceSheetName = sourceSheet.getName();
  let destinationSheetName = destinationSheet.getName();
  let destinationRow = destinationSheet.getLastRow()+1;
  let dropdownRows = findDropdownHeaderRows(POSITION_CREATION_SHEET_NAME, DROPDOWN_MAPPINGS[destinationSheetName]);
  uniqueRows.forEach(rowNumber => {
    let rowValue = sourceSheet.getRange(rowNumber, headerIndex).getValue().toString().toLowerCase();
    if (["yes", "maybe"].includes(rowValue) || rowValue.includes("qualified")) {
      fillTheValues(SHEET_MAPPINGS[sourceSheetName], sourceSheet, rowNumber, destinationSheet, destinationRow,rowData,destinationSheetIndices, sourceSheetIndices);
      applyDropdowns(DROPDOWN_MAPPINGS[destinationSheetName],destinationSheetIndices,destinationSheet, destinationRow,dropdownRows)
      destinationRow++;
    }
  });
}


function handleDuplicateRows(sourceSheet, destinationSheet, duplicateRows, sourceHeaderIndex) {
 
  duplicateRows.sort((a, b) => b[1] - a[1]);
   Logger.log(duplicateRows)
  duplicateRows.forEach(rowPair => {
    let sourceRowNumber = rowPair[0];
    let destinationRowNumber = rowPair[1];
    let rowValue = sourceSheet.getRange(sourceRowNumber, sourceHeaderIndex ).getValue().toString().toLowerCase();
    let shouldDelete = false;
    Logger.log(`Source row ${sourceRowNumber} and value ${rowValue}`)
    if ((sourceSheet.getName() == PROFILE_SHEET_NAME || sourceSheet.getName() == INBOUND_SHEET_NAME) && rowValue == "no") {
      shouldDelete = true;
    } else if (sourceSheet.getName() == SHORTLIST_SHEET_NAME && !rowValue.includes("qualified")) {
      shouldDelete = true;
    }
    if (shouldDelete) {
      destinationSheet.deleteRow(destinationRowNumber);
    }
  });
}




function findDropdownHeaderRows(sourceSheetName, dropdowns) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sourceSheetName);
  if (!sheet) {
    Logger.log("Sheet not found: " + sourceSheetName);
    return;
  }
  var firstColumnValues = sheet.getRange("A1:A" + sheet.getLastRow()).getValues().flat(); // Flatten to simplify the array structure
  var dropdownHeaderRows = {};
  Object.keys(dropdowns).forEach(dropdownKey => {
    var lowerCaseDropdownKey = dropdownKey.toLowerCase();
    var foundRow = firstColumnValues.findIndex(value => value.toLowerCase().includes(lowerCaseDropdownKey));
    if (foundRow !== -1) {
      dropdownHeaderRows[dropdownKey] = foundRow + 1;
    } else {
      Logger.log("Dropdown key not found in the first column: " + dropdownKey);
    }
  });
  return dropdownHeaderRows;
}



function applyDropdowns(dropdowns, headers, sheet, sheetRow, dropdownRows) {
  Logger.log(`Adding in the row ${sheetRow}`)
  Logger.log(dropdowns,headers,dropdownRows)
  Object.keys(dropdowns).forEach(dropdownKey => {
    let headerNames = dropdowns[dropdownKey]; 
    let validationRules = DROPDOWNS[headerNames[0]];
    headerNames.forEach(headerName => {
      let columnIndex = headers[headerName];
      if (columnIndex >0) {
        if(dropdownRows[dropdownKey]>0){
          setDropDownValues(POSITION_CREATION_SHEET_NAME, dropdownRows[dropdownKey], sheet, sheetRow, columnIndex)
        }
        else{
          let cell = sheet.getRange(sheetRow, columnIndex);
          let rule = SpreadsheetApp.newDataValidation().requireValueInList(validationRules, true).build();
          cell.setDataValidation(rule);
        }
      } else {
        Logger.log("Header not found: " + headerName);
      }
    });
  });
}


function checkValueExistsInColumnAndReturnRow(sourceSheet, destinationSheet, rowNumber, sourceColIndex, destinationColIndex) {
  var sourceValue = sourceSheet.getRange(rowNumber, sourceColIndex).getValue();
  var destinationRange = destinationSheet.getRange(1, destinationColIndex, destinationSheet.getLastRow(), 1);
  var destinationValues = destinationRange.getValues();
  for (var i = 0; i < destinationValues.length; i++) {
    if (destinationValues[i][0] === sourceValue) {
      return i + 1;
    }
  }
  return -1;
}



function fillTheValues(mapHeaders, sourceSheet, sourceRow, destinationSheet, destinationRow, rowData, destinationSheetIndices, sourceSheetIndices) {
  for (let key in mapHeaders) {
    let value = sourceSheetIndices[key]?getValueFromSheet(sourceSheet, sourceRow, sourceSheetIndices[key]):" ";
      let type = typeof value;
      Logger.log(value)
    if (key === "Name" && (sourceSheet.getName()==PROFILE_SHEET_NAME || sourceSheet.getName()==INBOUND_SHEET_NAME)) {
      value = type=="string"? value.split(" ")[0]:value;
    } else if (key === "Last Name" && sourceSheet.getName()==PROFILE_SHEET_NAME) {
      value = getValueFromSheet(sourceSheet, sourceRow, sourceSheetIndices[NAME]);
      type = typeof value;
      value = type=="string"?value.split(" ")[1]:value;
    } else if (key === "Date of Transfer") {
      value = getCurrentDateTime();
    } else if (key === "Source" && sourceSheet.getName()==INBOUND_SHEET_NAME) {
      value = "Inbound";
    }
    let destColumnIndex = destinationSheetIndices[mapHeaders[key]];
    if (destColumnIndex !== -1) {
      rowData[destColumnIndex-1] = value;
    } else {
      Logger.log(`${mapHeaders[key]} header not found in ${destinationSheet.getName()} Sheet`);
    }
    }
  destinationSheet.getRange(destinationRow, 1, 1, rowData.length).setValues([rowData]);
}