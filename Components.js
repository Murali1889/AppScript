function handleInboundSheet(row, header, value) {
  // addColor(row);
  // if(header.trim() === EMAIL_STATUS_HEADERS.ackEmail && isSendOrSent(value) && value!=="Done" ) {
  //   // sendEmailFromTemplate(INBOUND_SHEET_NAME, EMAIL_TEMPLATES.ackEmail, row, EMAIL_STATUS_HEADERS.ackEmail);
  // }
  // if (header.trim() === EMAIL_STATUS_HEADERS.dqEmail && isSendOrSent(value)) {
  //   Logger.log(`The value of issend is ${isSendOrSent(value)}`)
  //   // sendEmailFromTemplate(INBOUND_SHEET_NAME, EMAIL_TEMPLATES.dqEmail, row, header);
  // }
  moveProfile(INBOUND_SHEET_NAME, SHORTLIST_SHEET_NAME, row, value);
}

function handleFeedback(rowNum, header){
  if(header=="Trigger"){
    let data = retrieveIdAndNameFromRow(rowNum);
    showDialog(data.id, data.name,rowNum)
  }
}

function handleShortlistSheet(row, header, newValue, oldValue) {
  // if (header.trim() === EMAIL_STATUS_HEADERS.dqEmail && isSendOrSent(newValue)) {
  //   // sendEmailFromTemplate(SHORTLIST_SHEET_NAME, EMAIL_TEMPLATES.dqEmail, row, header);
  // }
  Logger.log(Session.getActiveUser().getEmail());
  let email = Session.getActiveUser().getEmail()
  if(newValue.includes('Qualified') || newValue.includes("DQ'ed")){
    try{
      sendEmailForFeedback(email,row);
    }
    catch(e){
      Logger.log(e)
    }
  }
  moveProfile(SHORTLIST_SHEET_NAME, INTERVIEW_SHEET_NAME, row, newValue);
  lastActivity(row, header, oldValue, newValue, SHORTLIST_SHEET_NAME);
}

function sendEmailForFeedback(email,row){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getSheetByName('1.3 - Shortlist')
  var sourceHeaders = sourceSheet.getRange(1, 1, 1, sourceSheet.getLastColumn()).getValues()[0];
  var cellNumber = getValueFromSheet(sourceSheet, row, sourceHeaders.indexOf('Phone Number')+1);
  var name = getValueFromSheet(sourceSheet, row, sourceHeaders.indexOf('Name')+1);
  var interviewerName = email.split('@')[0];
   var subject = "REMINDER TO CLOSE LOOPS";
    var body = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
            }
            .container {
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
              max-width: 600px;
              margin: auto;
              background-color: #f9f9f9;
            }
            .header {
              font-size: 24px;
              color: #333;
            }
            .content {
              margin-top: 20px;
            }
            .clock {
              font-size: 24px;
              color: #e67e22;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Hey ${interviewerName},</div>
            <div class="content">
              <p>This is your reminder to provide feedback for ${name} / ${cellNumber}.</p>
              <p>Tick Tock 24 hours start now <span class="clock">⏰</span>.</p>
            </div>
          </div>
        </body>
      </html>`;
    
    // Send an email reminder for feedback
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: body
    });
}



function handleInterviewSheet(row,header,newValue,oldValue){
  
  lastActivity(row, header, oldValue, newValue, INTERVIEW_SHEET_NAME);
}



function createSpreadsheetCopy() {
  var originalSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var originalSpreadsheetId = '1vb2bKdCxDSEXW7jfwKj21NFdfFTnfPJBdkN-oGYBTWA';
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
    if(status.trim() === "" && role.trim() !== "") {
      var file = DriveApp.getFileById(originalSpreadsheetId);
      var newFile = file.makeCopy(role);
      var emailAddresses = ["muralivvrsn75683@gmail.com","satishsunny1550@gmail.com","thanigaivelen2002@gmail.com"];  // Add email addresses as needed
      for(var j = 0; j < emailAddresses.length; j++) {
          newFile.addEditor(emailAddresses[j]);  
      }

      var newSpreadsheet = SpreadsheetApp.openById(newFile.getId());
      roleSpreadSheet = SpreadsheetApp.openById(originalSpreadsheetId);

      var newSpreadsheetUrl = newSpreadsheet.getUrl();
      Logger.log("Created new spreadsheet: " + newSpreadsheetUrl);
      masterSheet.getRange(i + 1, statusColumnIndex + 1).setValue('Created');
      masterSheet.getRange(i + 1, statusColumnIndex + 1).setBackground('#90ee90'); // Light green color
      masterSheet.getRange(i + 1, roleColumnIndex + 1).setFormula('=HYPERLINK("' + newSpreadsheetUrl + '","' + role + '")');
    }
  }
}



