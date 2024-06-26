function onOpen() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu('TAAutomation')
    .addItem('Create New Role', 'createSpreadsheetCopy')
    .addItem('Populate Profiles', 'populateProfiles')
    .addItem('Refresh', 'refresh')
    .addItem('Send Mails','sendEmailsAcrossSheets')
    .addItem('move','moveProfileToShortlist')
    .addItem('movesi','moveShortlistToInterview')
    .addItem('show dialoge','showDialog')
  var interviewTemplateMenu = ui.createMenu('Interview Template')
    .addItem('Shortlist', 'shortlistTemplate')
    .addItem('Interview', 'interviewTemplate')
  var sidebar = ui.createMenu('Sidebar')
    .addItem('Start', 'showPicker');
  menu.addSubMenu(interviewTemplateMenu);
  menu.addSubMenu(sidebar);
  menu.addToUi();
}




function editTriggerFunction(e) {
  var sheet = e.source.getActiveSheet();
  var editedRange = e.range;
  var editedRow = editedRange.getRow();
  var editedColumn = editedRange.getColumn();
  var newValue = e.value || "";
  var oldValue = e.oldValue;
  var columnHeader = sheet.getRange(1, editedColumn).getValue();
  var sheetName = sheet.getName();
  if (editedRow > 1) {
    Logger.log(`The onEdit on ${sheetName}`)
    switch(sheetName.trim()) {
      case INBOUND_SHEET_NAME:
        handleInboundSheet(editedRow, columnHeader, newValue);
        break;
      case PROFILE_SHEET_NAME:
        moveProfile(PROFILE_SHEET_NAME, SHORTLIST_SHEET_NAME, editedRow, newValue);
        break;
      case SHORTLIST_SHEET_NAME:
        handleShortlistSheet(editedRow, columnHeader, newValue, oldValue);
        break;
      case INTERVIEW_SHEET_NAME:
        handleInterviewSheet(editedRow,columnHeader,newValue,oldValue)
        break;
      case "Feedback":
        handleFeedback(editedRow,columnHeader);
      default:
        Logger.log(`${sheetName} edited`);
    }
  }
}
function refresh(){
  updateIds();
  removeAllDuplicates();
  applyDropdownsToSheets();
}

function showDialog(id,name,rowNum) {
  var template = HtmlService.createTemplateFromFile('record');
  template.id = id;
  template.name = name;
  template.row = rowNum;
  var html = template.evaluate()
      .setWidth(400)
      .setHeight(300)
      .setTitle("Record Feedback"); 
  SpreadsheetApp.getUi() 
      .showSidebar(html); 
}

function removeAllDuplicates(){
  combinedDuplicateHandler(PROFILE_SHEET_NAME,PROFILE_LINKEDIN_COLUMN_NAME);
  combinedDuplicateHandler(INBOUND_SHEET_NAME,INBOUND_LINKEDIN_COLUMN_NAME);
  combinedDuplicateHandler(SHORTLIST_SHEET_NAME,SHORTLIST_LINKEDIN_COLUMN_NAME);
  combinedDuplicateHandler(INTERVIEW_SHEET_NAME,SHORTLIST_LINKEDIN_COLUMN_NAME);
}

function moveProfileToShortlist(){
moveProfiles(PROFILE_SHEET_NAME,SHORTLIST_SHEET_NAME,ROLE_RELEVANCE_COLUMN_NAME);
}
function moveInboundToShortlist(){
moveProfiles(INBOUND_SHEET_NAME, SHORTLIST_SHEET_NAME, ROLE_RELEVANCE_COLUMN_NAME);
}
function moveShortlistToInterview(){
  moveProfiles(SHORTLIST_SHEET_NAME, INTERVIEW_SHEET_NAME, OVERALL_STATUS_COLUMN_NAME);
}

function shortlistTemplate(){
createInterviewTemplates(SHORTLIST_SHEET_NAME)
}
function interviewTemplate(){
  createInterviewTemplates(INTERVIEW_SHEET_NAME)
}
function updateIds(){
  updateEmptyIds(PROFILE_SHEET_NAME);
  updateEmptyIds(SHORTLIST_SHEET_NAME);
  updateEmptyIds(INTERVIEW_SHEET_NAME);
  updateEmptyIds(INBOUND_SHEET_NAME);
}



function protectAndFreezeFirstRowInAllSheetsForOwnerOnly() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  var ownerEmail = spreadsheet.getOwner().getEmail();
  sheets.forEach(function(sheet) {
    sheet.setFrozenRows(1);
    var firstRowRange = sheet.getRange(1, 1, 1, sheet.getMaxColumns());
    var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    var firstRowProtected = protections.some(function(protection) {
      return protection.getRange().getRow() === 1 && protection.getRange().getNumRows() === 1 && protection.getRange().getNumColumns() === sheet.getMaxColumns();
    });
    if (!firstRowProtected) {
      var protection = firstRowRange.protect().setDescription('Protected first row');
      var editors = protection.getEditors();
      editors.forEach(function(editor) {
        if (editor.getEmail() !== ownerEmail) {
          protection.removeEditor(editor);
        }
      });
      if (protection.canDomainEdit()) {
        protection.setDomainEdit(false);
      }
      Logger.log("First row in " + sheet.getName() + " has been protected and frozen for the owner only.");
    } else {
      Logger.log("First row in " + sheet.getName() + " is already protected.");
    }
  });
}

