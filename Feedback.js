function retrieveIdAndNameFromRow(rowNumber) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Feedback");
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idColumnIndex = headers.indexOf("ID") + 1;
  var nameColumnIndex = headers.indexOf("Name") + 1;
  if(idColumnIndex <= 0 || nameColumnIndex <= 0) {
    Logger.log("ID or Name column not found.");
    return { id: null, name: null };
  }
  var id = sheet.getRange(rowNumber, idColumnIndex).getValue();
  var name = sheet.getRange(rowNumber, nameColumnIndex).getValue();
  Logger.log("ID: " + id + ", Name: " + name);
  return { id: id, name: name };
}

function appendDataToCell(id, rowNumber, base64Message, textContent,rating) {
  Logger.log("Appending started")
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Feedback");
  var audioUrl = saveAudio(base64Message)
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var columnIndex = headers.indexOf("Feedback") + 1; 
  if (columnIndex < 1) {
    Logger.log("Header not found: " + header);
    return;
  }
  var cell = sheet.getRange(rowNumber, columnIndex);
  var existingContent = cell.getValue();
  var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yy HH:mm:ss");
  var newData =  currentDate + "\n";
  if (audioUrl) {
    newData += "    audio: " + audioUrl + "\n";
  }
  if (textContent) {
    newData += "    text: " + textContent + "\n";
  }
  if(rating){
    newData += "    rating: " + rating;
  }
  var updatedContent = existingContent ? existingContent + "\n\n" + newData : newData;
  Logger.log("Row number" + rowNumber)
  Logger.log(updatedContent);
  cell.setValue(updatedContent);
}


function saveAudio(base64Message) {
  const decodedData = Utilities.base64Decode(base64Message);
  const blob = Utilities.newBlob(decodedData, 'audio/wav', 'Recording.wav');
  const folderId = '1C09YnTo0n8KZyQKPutAF7jZ7dju6uKKV';
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(blob);
  const fileUrl = file.getUrl();
  return fileUrl;
}
