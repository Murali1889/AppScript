function createRoleTemplateSpreadsheet() {
  var ss = SpreadsheetApp.create("Role Template");
  var sheetsWithHeaders = {
    "1.2 - Profiles": ["ID", "Name","Title", "Company", "URL", "Role Relevance","Source"],
    "1.21 - Inbound": ["ID", "Name", "Please provide your Linkedin url", "Last Name", "Role Relevance","Ack Email Status","DQ Email Status"],
    "1.3 - Shortlist": ["ID", "Name", "LinkedIn Profile", "Last Name", "Overall Status","DQ reasons","Role Relevance","DQ Email Status","Phone Number","Email ID","LinkedIn(HM)","LinkedIn(TA)","WhatsApp","Call","SMS", "Channel Connect", "Source", "Date of Transfer", "Last Action"],
    "1.4 - Interview": ["ID", "Name", "LinkedIn Profile", "Last Name", "Interview Status","Notes","Candidate Priority","Source", "Date of Transfer", "Last Action"],
    "Messages": ["Type", "Email Subject", "Template"]
  };
  Object.keys(sheetsWithHeaders).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    var headers = sheetsWithHeaders[sheetName];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#dddddd");
  });

  // Remove the default sheet created with the new spreadsheet
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) ss.deleteSheet(defaultSheet);
}
