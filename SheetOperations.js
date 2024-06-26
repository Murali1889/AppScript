

function setValueInSheet(sheet, rowNum, header, value, updateBackground,backgroundColor) {
  Logger.log(sheet.getName())
  var columnIndex = findIndex(sheet, header);
  if (columnIndex === -1) {
    return -1;
  }
  var cell = sheet.getRange(rowNum, columnIndex + 1);
  cell.setValue(value);
  Logger.log(`Setting the value ${value}`)
  if (updateBackground) {
    Logger.log(`Setting the background ${backgroundColor}`)
    cell.setBackground(backgroundColor);
  }
  return 0;
}

// function addColor(row) {
//   var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INBOUND_SHEET_NAME);

//   if (!sheet) {
//     Logger.log("Sheet not found: " + INBOUND_SHEET_NAME);
//     return;
//   }
//   var columnIndex = findIndex(sheet,EMAIL_STATUS_HEADERS.ackEmail);
//   if (columnIndex === -1) {
//     Logger.log("Column not found: " + columnName);
//     return;
//   }
//   var cell = sheet.getRange(row+1, columnIndex + 1);
//   var cellValue = cell.getValue().toLowerCase();

//   if (cellValue === 'done') {
//     cell.setBackground('#00FF00');
//   } else if (cellValue === 'failed' || cellValue=="") {
//     // let emailTypes = getEmailTypes(INBOUND_SHEET_NAME);
//     // sendEmailFromTemplate(INBOUND_SHEET_NAME, emailTypes[0].template, row, emailTypes[0].statusHeader) 
//     cell.setBackground('#FF0000');
//   }
// }
