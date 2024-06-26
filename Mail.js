function sendEmailFromTemplate(sheetName, templateType, rowNumber, statusHeader) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var recipientDetails = extractNameAndEmail(sheet, EMAIL_HEADER_MAPPINGS[sheetName], rowNumber);
  var emailContent = fetchEmailSubjectAndBody(TEMPLATE_SHEET_NAME, templateType);
  if (!emailContent.isTemplate) {
    Logger.log('No template found for type: ' + templateType);
    return;
  }
  var formattedBody = createFormattedEmailBody(emailContent.template, recipientDetails.name, SPREADSHEET_NAME);
  var isSuccess = sendEmail(recipientDetails.email, emailContent.subject, formattedBody);
  Logger.log(`The sending email is Success ${isSuccess}`);
  if (isSuccess) {
    setValueInSheet(sheet,rowNumber, statusHeader, "Done",true,"#00FF00");
  } else {
    setValueInSheet(sheet,rowNumber, statusHeader, "Failed",true,"#FF0000");
  }
}

function sendEmail(recipient, subject, htmlBody) {
  var options = {
    htmlBody: htmlBody,
    cc: '',             
    bcc: ''        
  };

  try{
     MailApp.sendEmail(recipient, subject, '', options);
  }catch(e){
    Logger.log(e);
    return false;
  }
  return true;
}


function createFormattedEmailBody(paragraphs, name, roleName) {
  var body = paragraphs.map(p => `<p>${p.replace(/\n/g, ' ')}</p>`).join('');
  body = body.replace(/<<Name>>/g, name);
  // body = body.replace("<<Name>>",name);
  return body.includes("<<Role Name>>") ? body.replace(/<<Role Name>>/g, roleName) : body;
}

function extractNameAndEmail(sheet, headerMappings, rowNumber) {
  var rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  var extractedData = {};
  for (var key in headerMappings) {
    var columnIndex = findIndex(sheet, headerMappings[key]);
    extractedData[key] = columnIndex !== -1 ? rowData[columnIndex] : null;
  }
  return extractedData;
}

function fetchEmailSubjectAndBody(sheetName, type, sheetId) {
  var sheet;
  if(sheetId) sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName)
  else sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var typeIndex = findIndex(sheet, "Type");

  for (var i = 0; i < data.length; i++) {
    if (data[i][typeIndex] === type) {
      return { isTemplate: true, subject: data[i][1], template: data[i][2].split('\n\n') };
    }
  }
  return { isTemplate: false, subject: "", template: "" };
}


function sendEmailsAcrossSheets() {
  var sheetsToCheck = ["1.21 - Inbound", "1.3 - Shortlist", "1.4 - Interview"];

  sheetsToCheck.forEach(sheetName => {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      Logger.log("Sheet not found: " + sheetName);
      return;
    }
    var data = sheet.getDataRange().getValues();
    var emailTypes = getEmailTypes(sheetName); 

    emailTypes.forEach(emailType => {
      var emailStatusColIndex = findIndex(sheet, emailType.statusHeader);
      for (var i = 1; i < data.length; i++) { 
        var emailStatus = data[i][emailStatusColIndex];
        if (isSendOrSent(emailStatus)) {
          sendEmailFromTemplate(sheetName, emailType.template, i + 1, emailType.statusHeader);
        }
      }
    });
  });
}
function getEmailTypes(sheetName) {
  if (sheetName === "1.21 - Inbound") {
    return [
      { template: EMAIL_TEMPLATES.ackEmail, statusHeader: EMAIL_STATUS_HEADERS.ackEmail },
      { template: EMAIL_TEMPLATES.dqEmail, statusHeader: EMAIL_STATUS_HEADERS.dqEmail }
    ];
  } else if (sheetName === "1.3 - Shortlist") {
    return [
      { template: EMAIL_TEMPLATES.dqEmail, statusHeader: EMAIL_STATUS_HEADERS.dqEmail }
    ];
  } else if (sheetName === "1.4 - Interview") {
    return [
      { template: EMAIL_TEMPLATES.fbEmail, statusHeader: EMAIL_STATUS_HEADERS.fbEmail }
    ];
  } else {
    return [];
  }
}



