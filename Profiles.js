
function populateProfiles() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROCESS_SHEET_NAME);
  const searchData = getSearchString(sheet);
  if(searchData.length<=0){
    Logger.log(`The Search Data is not found! Maybe you have already completed the search..`);
  }
  searchData.forEach(data => {
    const results = googleSearch(data.searchString, data.actualNumber);
    if (results) {
      const success = pushResults(results, data.source);
      const statusCell = sheet.getRange(data.rowIndex + 1, data.addColumn + 1);
      statusCell.setValue(success ? 'Done' : 'Failed');
    }
    else{
      Logger.log("There are no results");
    }
  });
}

function pushResults(results, source) {
  try{
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PROFILE_SHEET_NAME);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var idIndex = findIndex(sheet, ID_COLUMN_NAME);
  var nameIndex = findIndex(sheet, NAME);
  var titleIndex = findIndex(sheet, "Title");
  var companyIndex = findIndex(sheet,"Company");
  var urlIndex = findIndex(sheet, "URL");
  var sourceIndex = findIndex(sheet, "Source");
  var roleIndex = findIndex(sheet, "Role Relevance");
  var dropdowns = DROPDOWN_MAPPINGS[PROFILE_SHEET_NAME];
  var dataToPush = extractDataFromSearch(results);

  dataToPush.forEach(function(rowData) {
    var newRow = sheet.appendRow([
      idIndex !== -1 ? generateUniqueID(PROFILE_SHEET_NAME, SPREADSHEET_NAME) : "",
      nameIndex !== -1 ? rowData[0] : "",
      titleIndex !== -1 ? rowData[3] : "",
      companyIndex !== -1 ? rowData[2] : "",
      urlIndex !== -1 ? rowData[1] : "",
      roleIndex !== -1 ? "" : "",
      sourceIndex !== -1 ? source : "",
    ]);

    var lastRowIndex = sheet.getLastRow();
    try{
      fillDropdowns(dropdowns, headers, PROFILE_SHEET_NAME, lastRowIndex);
    }
    catch(e){
      Logger.log("Error while adding dropdown")
    }
  });
  }
  catch(e){
    Logger.log('Error while pushing the data');
    return false;
  }
  return true;
}



function findByRow(valueToFind){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(POSITION_CREATION_SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  for(let i=0;i<data.length;i++){
    if(data[i][0].trim()==valueToFind)
    return i+1;
  }
  return -1;
}


function extractDataFromSearch(results) {
  var extractedData = [];
  results.forEach(function(data) {
    var url = data.link;
    var [name, title, company] = data.title.split(/ - | \|\| /);
    extractedData.push([name, url, company, title]);
  });
  return extractedData;
}

function triggerAllScopesAuthorization() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var drafts = GmailApp.getDrafts();
  MailApp.sendEmail('example@example.com', 'Test Subject', 'Test Body');
  var files = DriveApp.getFiles();
  var calendars = CalendarApp.getAllCalendars();
  var response = UrlFetchApp.fetch('https://www.example.com');
  var form = FormApp.create('New Form');
  var email = Session.getActiveUser().getEmail();
  var driveFiles = DriveApp.getFiles();
  var driveMetadataFiles = Drive.Files.list();
  var doc = DocumentApp.create('New Document');
  Logger.log('Triggered services for authorization.');
}


function getSearchString(sheet) {
  var range = sheet.getDataRange(); 
  var values = range.getValues(); 

  var addColumn = -1, sourceColumn = -1, searchStringColumn = -1, actualNumberColumn = -1;
  var searchData = [];

  for (var i = 0; i < values.length; i++) {
    if (values[i][0] == 'Top of the Funnel (Finding Profiles)') {
      for (var j = 0; j < values[i].length; j++) {
        if (values[i+1][j] == 'Add to Profiles') {
          addColumn = j; 
        } else if (values[i+1][j] == 'Source') {
          sourceColumn = j; 
        } else if (values[i+1][j] == 'Search String') {
          searchStringColumn = j; 
        } else if(values[i+1][j] == 'Actual #') {
          actualNumberColumn = j; 
        }
      }
    }

    if(values[i][addColumn] && addColumn !== -1 && values[i][addColumn].trim() == 'Add') {
      searchData.push({
        searchString: values[i][searchStringColumn],
        source: values[i][sourceColumn],
        addColumn:addColumn,
        actualNumber: values[i][actualNumberColumn],
        rowIndex: i
      });
    }
  }
  console.log(searchData)
  return searchData;
}




