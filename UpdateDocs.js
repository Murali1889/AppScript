var TEMPLATE_ID = '1lpG5yUxBel7_OXY10_gIquCSdedROJerMy4-mLM_QTQ';


function getSheetID() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var masterSheet = sheet.getSheetByName("Testing Docs");

  var columnHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];
  var columnIndex = columnHeaders.indexOf("Roles") + 1;

  if (columnIndex > 0) {
    var dataRange = masterSheet.getRange(2, columnIndex, masterSheet.getLastRow() - 1, 1);
    var richTextValues = dataRange.getRichTextValues();

    for (var i = 0; i < richTextValues.length; i++) {
      var richText = richTextValues[i][0];
      if (richText) {
        var runs = richText.getRuns();
        for (var j = 0; j < runs.length; j++) {
          var run = runs[j];
          var url = run.getLinkUrl();

          if (url) {
            var spreadsheetId = extractId(url);
            var spreadsheetName = run.getText().replace(/"/g, '');

            if (spreadsheetId && spreadsheetId !== "0") {
              Logger.log("spreadsheetId: " + spreadsheetId);
              updateDocs(spreadsheetId, spreadsheetName);
            } else {
              Logger.log("Invalid Spreadsheet ID found in Roles column: " + spreadsheetId);
            }
          }
        }
      }
    }
  }
}

function extractId(url) {
  var sheetRegex = /\/d\/([a-zA-Z0-9-_]+)/;
  var docRegex = /id=([a-zA-Z0-9-_]+)/;
  var sheetMatch = url.match(sheetRegex);
  var docMatch = url.match(docRegex);
  return sheetMatch ? sheetMatch[1] : (docMatch ? docMatch[1] : null);
}

function updateDocs(spreadsheetId, spreadsheetName) {
  try {
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var interviewSheet = spreadsheet.getSheetByName("1.4 - Interview");

    if (!interviewSheet) {
      Logger.log("Sheet '1.4 - Interview' not found");
      return;
    }

    var headers = interviewSheet.getRange(1, 1, 1, interviewSheet.getLastColumn()).getValues()[0];
    var nameColIndex = headers.indexOf("Name") + 1;

    // Check if the "Name" column exists
    if (nameColIndex <= 0) {
      Logger.log("Column 'Name' not found");
      return;
    }

    if (nameColIndex > 0) {
    var dataRange = interviewSheet.getRange(2, nameColIndex, interviewSheet.getLastRow() - 1, 1);
    var richTextValues = dataRange.getRichTextValues();

    for (var i = 0; i < richTextValues.length; i++) {
      var richText = richTextValues[i][0];
      if (richText) {
        var runs = richText.getRuns();
        for (var j = 0; j < runs.length; j++) {
          var run = runs[j];
          var docUrl = run.getLinkUrl();

          if (docUrl) {
            var docsID = extractId(docUrl);
            var name = run.getText().replace(/"/g, '');

            if (docsID && docsID !== "0") {
              Logger.log("docsID: " + docsID);
                  updateDocsIfNeeded(docsID);
            } else {
              Logger.log("Invalid Name column: " + docsID);
            }
          }
        }
      }
    }
  }

  } catch (e) {
    Logger.log(e);
  }
}

function getTemplateSections(templateDoc) {
  var body = templateDoc.getBody();
  var sections = [];
  var paragraphs = body.getParagraphs();
  for (var i = 0; i < paragraphs.length; i++) {
    // Assuming each section starts with a heading
    if (paragraphs[i].getHeading() !== DocumentApp.ParagraphHeading.NORMAL) {
      var section = {
        heading: paragraphs[i].getText(),
        content: ''
      };
      // Add all subsequent normal paragraphs to the section content
      while (i + 1 < paragraphs.length && paragraphs[i + 1].getHeading() === DocumentApp.ParagraphHeading.NORMAL) {
        section.content += paragraphs[i + 1].getText() + '\n';
        i++;
      }
      sections.push(section);
    }
  }
  return sections;
}



function updateDocsIfNeeded(docsID) {
  var doc = DocumentApp.openById(docsID);
  var templateDoc = DocumentApp.openById(TEMPLATE_ID);
  var templateSections = getTemplateSections(templateDoc);
  updateDocument(doc, templateSections);
}

function updateDocument(doc, templateSections) {
  var body = doc.getBody();

  templateSections.forEach(function(section) {
    if (section.heading && section.heading.trim() !== '') {
      var searchResult = body.findText(escapeRegex(section.heading));
      if (searchResult) {
        var headingElement = searchResult.getElement().getParent();
        var contentElement = getNextParagraphElement(headingElement);

        // Ensure content is not empty before setting the text
        if (contentElement && contentElement.getType() === DocumentApp.ElementType.PARAGRAPH && section.content.trim() !== '') {
          contentElement.setText(section.content);
        }
      } else {
        // Append new section, ensuring both heading and content are not empty
        if (section.content && section.content.trim() !== '') {
          body.appendParagraph(section.heading).setHeading(DocumentApp.ParagraphHeading.HEADING1);
          body.appendParagraph(section.content);
        }
      }
    }
  });
}
function getNextParagraphElement(element) {
  while (element.getNextSibling()) {
    element = element.getNextSibling();
    if (element.getType() === DocumentApp.ElementType.PARAGRAPH) {
      return element;
    }
  }
  return null;
}

function escapeRegex(text) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

