function createInterviewTemplates(sheetName) {
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadSheet.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var nameIndex = findIndex(sheet,NAME);
  var lastNameIndex = findIndex(sheet,LAST_NAME);
  for (var i = 1; i < data.length; i++) {
    var cell = sheet.getRange(i+1 , nameIndex + 1);
    var cellValue = cell.getValue();
    var cellFormula = cell.getFormula();
    if(cellValue=="")
    continue;
    if (typeof cellValue === 'string' && !cellFormula.includes('=HYPERLINK')) {
      var candidateName = cellValue;
      var roleName = spreadSheet.getName(); 
      if(!candidateName)return;
      var docId = copyAndReplace(candidateName, roleName);
      var docUrl = DocumentApp.openById(docId).getUrl();
      if(lastNameIndex)
      cell.setFormula('=HYPERLINK("' + docUrl + '", "' + candidateName + '")');
    }
  }
}

function copyAndReplace(candidateName, roleName) {
  var docId = "1Kkzsua2Zf2U2e8EsHNtnRlzm1WmoxR-g990czbgEuP8";
  var originalDoc = DriveApp.getFileById(docId);
  var newDocName = candidateName + " / " + roleName;
  var copiedFile = originalDoc.makeCopy(newDocName);
  var copiedDocId = copiedFile.getId();
  var copiedDoc = DocumentApp.openById(copiedDocId);
  var copiedBody = copiedDoc.getBody();
  copiedBody.replaceText('<Candidate Name>', candidateName);
  copiedBody.replaceText('<Role>', roleName);
  // setPermissions(copiedDocId, ['muralivvrsn75683@gmail.com']);
  copiedDoc.saveAndClose();
  Logger.log(copiedDoc.getUrl());
  return copiedDocId;
}

function setPermissions(docId, userEmails) {
  var doc = DriveApp.getFileById(docId);
  userEmails.forEach(function(email) {
    doc.addViewer(email);
  });
}




