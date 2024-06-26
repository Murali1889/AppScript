function main() {
  var sheetUrl = createNewSheetWithTabs();
  Logger.log(sheetUrl);
}

function createNewSheetWithTabs() {
  var newSheet = SpreadsheetApp.create("Sheet Name");

  createNewTab(newSheet, "1.0 - Position Creation", []);
  fillPositionCreationSheet(newSheet);
  addDropdownsToSheet(newSheet); 
  createNewTab(newSheet, "1.1 - Process", []);
  fillProcess(newSheet);
  createNewTab(newSheet, "1.2 - Profiles", ["ID", "Name", "Title", "Company", "URL", "Role relevance", "Source"]);
  createNewTab(newSheet, "1.21 - Inbound", ["Role Relevance", "Ack Email Status", "DQ Email Status", "Comments"]);
  createNewTab(newSheet, "1.3 - Shortlist", ["ID", "Name", "Last Name", "LinkedIn Profile", "Overall Status", "DQ reasons", "Role Relevance", "DQ Email Status","Phone Number","Email ID", "LinkedIn(HM)", "LinkedIn(TA)", "WhatsApp", "Call", "SMS", "Channel connect", "Source", "Date of Transfer", "Last Action"]);
  createNewTab(newSheet, "1.4 - Interview", ["ID", "Name", "Last Name", "LinkedIn Profile", "Interview Status", "Notes", "Candidate Priority", "Source", "Date of Transfer", "Last Action" ]);
  createNewTab(newSheet, "1.5 - Logging", []);
  createNewTab(newSheet, "1.6 - Analytics", []);
  createNewTab(newSheet, "Messages",["Type","Email Subject","Template", "Trigger"])
  fillMessagesSheet(newSheet)

  freezeHeaderRow(newSheet.getSheetByName("1.2 - Profiles"));
  freezeHeaderRow(newSheet.getSheetByName("1.21 - Inbound"));
  freezeHeaderRow(newSheet.getSheetByName("1.3 - Shortlist"));
  freezeHeaderRow(newSheet.getSheetByName("1.4 - Interview"));
  freezeHeaderRow(newSheet.getSheetByName("Messages"));

  var sheet1 = newSheet.getSheetByName('Sheet1');
  if (sheet1) {
    newSheet.deleteSheet(sheet1);
  }

  return newSheet.getUrl();
}

function freezeHeaderRow(sheet) {
  if (sheet) {
    sheet.setFrozenRows(1);
  }
}

function createNewTab(sheet, name, headers) {
  var existingTab = sheet.getSheetByName(name);
  
  if (existingTab) {
    var existingHeaders = existingTab.getRange(1, 1, 1, headers.length);
    var headersExist = true;

    for (var i = 0; i < headers.length; i++) {
      if (existingHeaders.getCell(1, i + 1).getValue() !== headers[i]) {
        headersExist = false;
        break;
      }
    }

    if (!headersExist) {
      existingHeaders.setValues([headers]);
      existingHeaders.setFontSize(12).setFontWeight("bold");
    }
  } else {
    var newTab = sheet.insertSheet(name);
    if (headers.length === 0) return;
    newTab.getRange(1, 1, 1, headers.length).setValues([headers]);
    newTab.getRange(1, 1, 1, headers.length).setFontSize(10).setFontWeight("bold");
  }
}



function fillPositionCreationSheet(ss) {
  var data = positionCreationData();
  
  var sheet = ss.getSheetByName("1.0 - Position Creation");

  for (var i = 0; i < data.length; i++) {
    var row = sheet.getRange(i+1, 1);
    
    row.setValue(data[i].value);
    
    row.setFontSize(data[i].fontSize);
    
    row.setFontWeight(data[i].fontWeight);
    
    if (data[i].fontSize === 11) {
      var rowRange = sheet.getRange(i+1, 1, 1, sheet.getMaxColumns());
      rowRange.setBackground("#FEF7E6"); 
    }
  }
}

function fillProcess(ss){
  var data = processData();
  
  var sheet = ss.getSheetByName("1.1 - Process");

  for (var i = 0; i < data.length; i++) {
    var range = sheet.getRange(i + 1, 1, 1, data[i].length);
    
    range.setValues([data[i]]);
    if (i === 0 || i === 11) {
      range.setFontSize(10);
      range.setFontWeight("bold");
      
      var rowRange = sheet.getRange(i+1, 1, 1, sheet.getMaxColumns());
      rowRange.setBackground("#FEF7E6");  
    }

    if (i === 1 || i === 12) {
      range.setFontWeight("bold");
    }
  }
}

function fillMessagesSheet(ss) {

  var template1 = "Hi <<Name>>,\n\nThank you for applying to HyperVerge! We are thrilled that you want us to be the next step in your career. \n\nOur Talent team will review your application, and if found a match to our current opening, will reach out to you soon with the next steps. \n\nFollow us on LinkedIn, to stay updated about the happenings and job openings at HyperVerge. \n\nSincerely";

  var template2 = "Hi <<Name>>,\n\nThank you for considering us for your next career move. We are really honoured and would have loved to have you onboard. Unfortunately, at this moment either your experience (skills) or compensation is not a match for our opening of <<Role Name>>.\n\nWe know job hunting is hard, we've all been there. Don't give up and keep exploring because something good is surely coming your way.\nDo follow our Careers and LinkedIn page, we are always updating our current openings. Your skills and experience could be a perfect match for another role with us!\n\nWe wish you all the best for all the amazing things you will do in the future!\n\nStay Connected";

  var template3 = "Hi <<Name>>,\n\nWe appreciate you taking the time out to interview with us. We enjoyed getting to know you better and understanding your experience, however at this moment we will not be able to proceed with you further in the process.\n\nWe know you put a lot of thought and effort into applying for this role, and for that, we're truly grateful. If you have any questions, reach out to me.\nWe are continuously striving to improve and make our process better and candidate friendly. It would really help us if you could take 10 minutes out of your schedule to fill out this Candidate Feedback Form to help us understand what we could do better!\n\nThank you again for interviewing with us & wish you all the best for all your future endeavors.\n\nRegards";

  var data = [
    ["Acknowledgment of Inbound Application", "We've received your Application!", template1, "1.21 - Inbound ; Every Row (Automatically)"],
    ["", "", "", ""],
    ["DQ'ed Email @ Application", "Thank you for Applying to HyperVerge!", template2, "1.21 - Inbound ; DQ Email Status"],
    ["", "", "", ""],
    ["DQ'ed Email Post Interview", "Thank you for Interviewing at HyperVerge!", template3, "1.3 - Shortlist ; DQ Email Status"],
    ["", "", "", ""],
    ["", "", "", ""],
    ["Position Closed - Before Recruiter Screen", "", "", ""],
    ["Position on Hold", "", "", ""],

  ];

  // Get the "Messages" sheet from the spreadsheet
  var sheet = ss.getSheetByName("Messages");

  // Assuming headers are already set, start inserting data from the second row
  var range = sheet.getRange(2, 1, data.length, data[0].length);

  
  
  // Set the values of the range to the data array
  range.setValues(data);

  var typeAndSubjectRange = sheet.getRange(2, 1, data.length, 2); // Adjust 2 to match the number of rows dynamically if needed
  typeAndSubjectRange.setFontWeight("bold");
}

function positionCreationData(){
  return [
  {"value": "1. Basics", "fontSize": 11, "fontWeight": "bold"},
  {"value": "Team", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Role", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Level", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Title", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What is the Location?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value": "2. Role Specific", "fontSize": 11, "fontWeight": "bold"},
  {"value": "What is the JD?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Scorecard & evaluation Criteria", "fontSize": 10, "fontWeight": "normal"},
  {"value": "- Outcomes expected/success metrics for the role", "fontSize": 10, "fontWeight": "normal"},
  {"value": "- Compentencies: Must-have and Good-to-have", "fontSize": 10, "fontWeight": "normal"},
  {"value": "- What is the role progression?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "- Why should someone join this role? ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value": "3. Org Level Questions", "fontSize": 11, "fontWeight": "bold"},
  {"value": "Why this role? ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Why now? ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What is the ROI for this role?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Is this a replacement or fresh hire?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Timeline for having this person? (X Days)", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What is the org level priority of this role?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value": "4. TA Specific clarity", "fontSize": 11, "fontWeight": "bold"},
  {"value": "Years of experience ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What is the compensation range ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What are the typical designations for these folks?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What is the search term on LinkedIN\n(Coestablished between HM and TA)", "fontSize": 10, "fontWeight": "normal"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value": "5. Hiring Process", "fontSize": 11, "fontWeight": "bold"},
  {"value": "Who is the Hiring manager? ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Who is the reporting manager? ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What is the interview process ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Who are the interviewers", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Sample profiles ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Target organizations?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Hands-off Organization (Mentor's companies, etc)", "fontSize": 10, "fontWeight": "normal"},
  {"value": "What is the assignment?", "fontSize": 10, "fontWeight": "normal"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Role Opening Check List", "fontSize": 11, "fontWeight": "bold"},
  {"value": "Who is the TA reponsible ", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Who is the TA Manager responsible", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Official Role opening date", "fontSize": 10, "fontWeight": "normal"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Modification to the Role (Along with Dates)", "fontSize": 11, "fontWeight": "bold"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value":"Infound Form", "fontSize":11, "fontWeight":"bold"},
  {"value": "Role Name", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Description", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Questions", "fontSize": 10, "fontWeight": "normal"},
  {"value": "", "fontSize": 10, "fontWeight": "normal"},
  {"value":"Style", "fontSize":11, "fontWeight":"bold"},
  {"value": "Role Relevance", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Overall Status", "fontSize": 10, "fontWeight": "normal"},
  {"value": "Interview Status", "fontSize": 10, "fontWeight": "normal"},
  {"value": "DQ Stage", "fontSize": 10, "fontWeight": "normal"},
  {"value": "DQ Reasons", "fontSize": 10, "fontWeight": "normal"},
];
}

function processData(){
  return [
    ["Persona Definition"],
    ["Non Negotiable"],
    ["Persona 1"],
    ["Persona 2"],
    ["Persona 3"],
    ["Persona 4"],
    ["Persona 5"],
    ["Persona 6"],
    ["Persona 7"],
    ["Persona 8"],
    [""],
    ["Top of the Funnel (Finding Profiles)"],
    ["Search Type", "Source", "Add to Profiles", "Search String", "Results"],
  ];
}

function addDropdownsToSheet(ss) {
  var sheet = ss.getSheetByName("1.0 - Position Creation");
  var dropdownRoleRelevance = sheet.getRange(53, 2, 1);
  var ruleRoleRelevance = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Yes', 'No', 'Maybe'], true)
    .setAllowInvalid(false)
    .build();
  dropdownRoleRelevance.setDataValidation(ruleRoleRelevance);
  var dropdownOverallStatus = sheet.getRange(54, 2, 1);
  var ruleOverallStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(['1. Initiated', '2. Connected', '3. Scheduled', '4. Qualified', "5. DQ'ed", '6. Not Interested'], true)
    .setAllowInvalid(false)
    .build();
  dropdownOverallStatus.setDataValidation(ruleOverallStatus);
  var dropdownInterviewStatus = sheet.getRange(55, 2, 1);
  var ruleInterviewStatus = SpreadsheetApp.newDataValidation()
    .requireValueInList(['0. Resume Shared', '1. HM Screen', '2. Assignment', '3. Domain Round', '4. WHO Round', '5. LTA', '6. Reference Check', '7. Offer Rolled Out', "8. DQ'ed", '9. Dropped Out',], true)
    .setAllowInvalid(false)
    .build();
  dropdownInterviewStatus.setDataValidation(ruleInterviewStatus);
  var dropdownDQStage = sheet.getRange(56, 2, 1);
  var ruleDQStage = SpreadsheetApp.newDataValidation()
    .requireValueInList(['0. Resume Shared', '1. HM Screen', '2. Assignment', '3. Domain Round', '4. WHO Round', '5. LTA','6. Reference Check', '7. Offer Rolled Out', "8. DQ'ed", '9. Dropped Out',], true)
    .setAllowInvalid(false)
    .build();
  dropdownDQStage.setDataValidation(ruleDQStage);
  var dropdownDQReasons = sheet.getRange(57, 2, 1);
  var ruleDQReasons = SpreadsheetApp.newDataValidation()
    .requireValueInList(['High Compensation', 'Functional Skill mismatch', 'Communication/Energy','Relocation', 'ICP Changed', "Resume DQ'ed", 'Senior', 'Junior'], true)
    .setAllowInvalid(false)
    .build();
  dropdownDQReasons.setDataValidation(ruleDQReasons);
}