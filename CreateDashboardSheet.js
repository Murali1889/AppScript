function main() {
  var sheetUrl = createNewDashboardSheet();
  Logger.log(sheetUrl);
}

function createNewDashboardSheet() {
  var newSheet = SpreadsheetApp.create("TA Dashboard");

  var masterSheet = createNewTab(newSheet, "Master", ["Roles", "Status"]);
  setupMasterSheet(masterSheet);
  
  var dashboardSheet = createNewTab(newSheet, "1.1 Dashboard", []);
  setupDashboardSheet(dashboardSheet);

  var sheet1 = newSheet.getSheetByName('Sheet1');
  if (sheet1) {
    newSheet.deleteSheet(sheet1);
  }

  return newSheet.getUrl();
}

function createNewTab(sheet, name, headers) {
  var newTab = sheet.getSheetByName(name);
  if (!newTab) {
    newTab = sheet.insertSheet(name);
  } else {
    newTab.clear();
  }
  if (headers.length > 0) {
    newTab.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return newTab;
}

function setupMasterSheet(sheet) {
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#fce5cd");
}

function setupDashboardSheet(sheet) {
  sheet.getRange("A1").setValue("Live Dashboard 🧭").setBackground("#ffe599").setFontWeight("bold");
  sheet.getRange("A2:A3").setBackground("#ffe599").setFontWeight("bold");
  sheet.getRange("A3").setValue("Roles"); // Setting "Roles" at A3

  sheet.getRange("B2:D2").merge().setValue("Level 1 (Find Profiles & Shortlist)").setBackground("#ea9999").setFontWeight("bold");
  sheet.getRange("E2:G2").merge().setValue("Level 1.1 (Find Profiles & Shortlist)").setBackground("#ea9999").setFontWeight("bold");
  sheet.getRange("H2:O2").merge().setValue("Level 2 (Reach out shortlisted profile and qualify)").setBackground("#f9cb9c").setFontWeight("bold");
  sheet.getRange("P2:Z2").merge().setValue("Level 3 (Post HM Screen)").setBackground("#a4c2f4").setFontWeight("bold");

  sheet.getRange("B3:D3").setValues([["1. Sourced", "2. DQ'ed", "3. ShortListed"]]).setBackground("#ea9999").setFontWeight("bold");
  sheet.getRange("E3:G3").setValues([["1. Inbound", "2. DQ'ed", "3. ShortListed"]]).setBackground("#ea9999").setFontWeight("bold");
  sheet.getRange("H3:O3").setValues([["Initiated", "Connected", "Scheduled", "Qualified", "DQ'ed", "Not Interested", "Active Pipe", "Total"]]).setBackground("#f9cb9c").setFontWeight("bold");
  sheet.getRange("P3:AB3").setValues([["0. Resume Shared", "1. HM Interview", "2. Assignment Round", "3. Domain Round", "4. WHO Round", "5. LTA Round", "6. Reference Check", "7. Offer Rolled Out", "8. DQ'ed", "9. Dropped Out", "Active Pipe", "Total", "Conv. %"]]).setBackground("#a4c2f4").setFontWeight("bold");

  sheet.insertRowAfter(15);
  var lastColumn = sheet.getLastColumn();
  var totalFunnelRange = sheet.getRange(21, 1, 1, 1);
  totalFunnelRange.setValue("Total Funnel").setFontWeight("bold");

  var rowsBelowTotalFunnelRange = sheet.getRange(21, 2, 1, lastColumn - 1);
  rowsBelowTotalFunnelRange.setBackground("#fff2cc");

  var totalRows = sheet.getMaxRows();
  if (totalRows > 30) {
    sheet.deleteRows(31, totalRows - 30);
  }

  sheet.setFrozenColumns(1);
}
