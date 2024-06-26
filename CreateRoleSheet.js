function createSpreadsheet() {
  var originalSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  var originalSpreadsheetId = '1vb2bKdCxDSEXW7jfwKj21NFdfFTnfPJBdkN-oGYBTWA';
  
  // Get the name for the new spreadsheet from a specific sheet
  var masterSheet = originalSpreadsheet.getSheetByName('Master');

  var range = masterSheet.getDataRange();
  var values = range.getValues();

  var roleColumnIndex = values[0].map(function(value) { return value.toLowerCase(); }).indexOf("roles");
  var statusColumnIndex = values[0].map(function(value) { return value.toLowerCase(); }).indexOf("status");

  if(roleColumnIndex === -1 || statusColumnIndex === -1) {
    Logger.log("Cannot find 'Role' and/or 'Status' columns. Please check your spreadsheet.");
    return;
  }

  for(var i = 1; i < values.length; i++) {
    var role = values[i][roleColumnIndex];
    var status = values[i][statusColumnIndex];

    // If status is empty and role is not empty
    if(status.trim() === "" && role.trim() !== "") {
      // Use DriveApp to copy the original spreadsheet
      var file = DriveApp.getFileById(originalSpreadsheetId);
      var newFile = file.makeCopy(role);
      var emailAddresses = ["gunjan.agarwal@hyperverge.co", "kishore@hyperverge.co","gayathri@hyperverge.co","murali.g@hyperverge.co","satish.d@hyperverge.co"];
      for(var j = 0; j < emailAddresses.length; j++) {
          newFile.addEditor(emailAddresses[j]);
      }
      // Open the new spreadsheet
      var newSpreadsheet = SpreadsheetApp.openById(newFile.getId());
      roleSpreadSheet = SpreadsheetApp.openById(originalSpreadsheetId);
      var sheet = newSpreadsheet.getSheetByName("1.0 - Position Creation");
      var spreadsheetName = newSpreadsheet.getName();
      var dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);
      var data = dataRange.getValues();

      for(let i=0;i<data.length;i++){
        Logger.log(data[i][0]);
        if(data[i][0].trim()=="Role Name"){
          data[i][1] = spreadsheetName;
        }
      }
      dataRange.setValues(data);
      var newSpreadsheetUrl = newSpreadsheet.getUrl();

      // Log the URL of the new Spreadsheet
      Logger.log("Created new spreadsheet: " + newSpreadsheetUrl);
      
      // Update the 'Status' to 'Sent' and color it light green
      masterSheet.getRange(i + 1, statusColumnIndex + 1).setValue('Created');
      masterSheet.getRange(i + 1, statusColumnIndex + 1).setBackground('#90ee90');
      
      // Set a hyperlink to the new spreadsheet on the 'Role' cell
      masterSheet.getRange(i + 1, roleColumnIndex + 1).setFormula('=HYPERLINK("' + newSpreadsheetUrl + '","' + role + '")');
    }
  }
}