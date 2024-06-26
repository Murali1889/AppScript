function setDropDownValues(sourceSheetName, sourceRow, destinationSheet, destinationRow, destinationColumn) {
  var sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sourceSheetName);
  var sourceRange = sourceSheet.getRange(sourceRow, 2);
  var destinationCell = destinationSheet.getRange(destinationRow, destinationColumn);
  sourceRange.copyTo(destinationCell, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
}


function applyDropdownsToSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
 
  Object.keys(DROPDOWN_MAPPINGS).forEach(sheetName => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      Logger.log("Sheet not found: " + sheetName);
      return;
    }
    const dropdownMapping = DROPDOWN_MAPPINGS[sheetName];
    Object.keys(dropdownMapping).forEach(header => {
      const colIndex = findIndex(sheet, header);
      const sourceRow = findByRow(header);
      Logger.log(sourceRow)
      if (colIndex === -1) {
        Logger.log("Column not found: " + header + " in sheet " + sheetName);
        return;
      }
      const lastRow = sheet.getLastRow();
      for (let rowIndex = 2; rowIndex <= lastRow; rowIndex++) {
        try {
          setDropDownValues(POSITION_CREATION_SHEET_NAME,sourceRow, sheet, rowIndex, colIndex + 1);
        } catch (e) {
          Logger.log(e)
          var rule = SpreadsheetApp.newDataValidation().requireValueInList(DROPDOWNS[header], true).build();
        sheet.getRange(rowIndex, colIndex+1).setDataValidation(rule)
        }
      }
    });
  });
}





