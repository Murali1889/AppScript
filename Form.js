// const FORM_ID = "1434PdcbYO_auatCgV4uyFQIVsKFqUN0GBd3xpVVSvtQ"
const FORM_ID = '1R5JIJAF6_sdu8d7x5levZgQYJNW0qoGkbc-9AuvQ7Tk';
function updateDropdownAndDescriptionSections() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('1.0 - Position Creation');
  var form = FormApp.openById(FORM_ID);
  Logger.log(form.getTitle());
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();

  var formItems = form.getItems();
  var listItem = null;
  var existingQuestionsMap = {};
  var existingSectionsMap = {};
  var existingGoToSectionValues = [];

  formItems.forEach(function (item) {
    switch (item.getType()) {
      case FormApp.ItemType.LIST:
        if (item.getTitle() === "What role are you applying for?") {
          listItem = item.asListItem();
          existingGoToSectionValues = listItem.getChoices().map(function (choice) {
            return choice.getPageNavigationType() === FormApp.PageNavigationType.SUBMIT ? choice.getValue() : null;
          });
        }
        break;
      case FormApp.ItemType.TEXT:
        existingQuestionsMap[item.getTitle()] = item.asTextItem();
        break;
      case FormApp.ItemType.PAGE_BREAK:
        existingSectionsMap[item.getTitle()] = {
          item: item.asPageBreakItem(),
          description: item.asPageBreakItem().getHelpText()
        };
        break;
    }
  });

  if (!listItem) {
    listItem = form.addListItem().setTitle("What role are you applying for?");
    Logger.log("Created dropdown section: " + listItem.getTitle());
  }

  var currentChoices = listItem.getChoices().map(function (choice) {
    return choice.getValue();
  }).filter(function (choice) {
    return choice && choice.trim() !== '';
  });

  var newChoices = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];

    if (row[0] === "Inbound Form" && i < data.length - 1) {
      var description = data[i + 2][1];
      var sectionChoice = data[i + 1][1];
      var goToSection = data[i][2]; // Assuming the "Go to section" information is in the third column

      newChoices.push(sectionChoice);

      var section;
      if (existingSectionsMap[sectionChoice]) {
        if (existingSectionsMap[sectionChoice].description !== description) {
          existingSectionsMap[sectionChoice].item.setHelpText(description);
        }
        section = existingSectionsMap[sectionChoice].item;
      } else {
        section = form.addPageBreakItem().setTitle(sectionChoice).setHelpText(description);
        existingSectionsMap[sectionChoice] = {
          item: section,
          description: description
        };
      }

      var nextPosition = section.getIndex() + 1;
      var questionIndex = i + 3;
      while (data[questionIndex] && data[questionIndex][1]) {
        var questionTitle = data[questionIndex][1];
        if (!existingQuestionsMap[questionTitle]) {
          var question = form.addTextItem().setTitle(questionTitle);

          // Set the "Go to section based on answer" if needed
          if (goToSection && existingSectionsMap[goToSection]) {
            var pageNavigationItem = section.asPageBreakItem().createResponse(goToSection);
            question.setChoiceValues([pageNavigationItem]);
          }

          existingQuestionsMap[questionTitle] = question;
          form.moveItem(question.getIndex(), nextPosition);
          nextPosition++;
          Logger.log("Added question: " + questionTitle);
        } else {
          nextPosition = existingQuestionsMap[questionTitle].getIndex() + 1;
        }
        questionIndex++;
      }
    }
  }

  if (listItem) {
    Logger.log("Dropdown Title: " + listItem.getTitle());
  } else {
    Logger.log("Dropdown not found.");
  }

  var listItemValues = listItem.getChoices().map(function (choice) {
    return choice.getValue();
  });

  Logger.log("Dropdown Values: " + listItemValues.join(', '));

  if (newChoices.length > 0) {
  newChoices.forEach(function (choice) {
    if (!currentChoices.includes(choice)) {
      currentChoices.push(choice);
    }
  });

  // Create an array to store the new choices
  var newChoicesArray = currentChoices.map(function (choice) {
    var existingChoice = listItem.getChoices().find(function (existingChoice) {
      return existingChoice.getValue() === choice;
    });

    if (existingChoice) {
      return existingChoice;
    } else if (existingSectionsMap[choice]) {
      Logger.log("choice: " + choice)
      return listItem.createChoice(choice, existingSectionsMap[choice].item);
    } else {
      return listItem.createChoice(choice);
    }
  });

  listItem.setChoices(newChoicesArray);
  }
}



function updateInboundHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var chosenRoleName = ss.getName().trim();
  if (!chosenRoleName) {
    Logger.log("What role are you applying for?");
    return;
  }

  var form = FormApp.openById(FORM_ID);
  var formItems = form.getItems();

  // Define headers
  var baseHeaders = ["Timestamp", "ID", "Email", "Name"];
  var commonHeaders = ["First Name", "Last Name", "Please share the link to your LinkedIn profile", "What phone number can we reach out to you on?", "Current Compensation (Fixed (X) + Variable (Y))", "Expected Compensation (Fixed (X) + Variable (Y))", "Notice Period (in days)", "Please share your resume"];
  var newHeaders = [];
  var inRoleSection = false;

  // Process form items to find role-specific headers
  for (var i = 0; i < formItems.length; i++) {
    var item = formItems[i];
    if (item.getType() === FormApp.ItemType.PAGE_BREAK && item.getTitle().includes(chosenRoleName)) {
        inRoleSection = true;
        continue; // Skip to next item if we're entering or leaving a role section
    } else if (item.getType() === FormApp.ItemType.PAGE_BREAK) {
        inRoleSection = false;
        continue;
    }
    
    if (inRoleSection) {
      newHeaders.push(item.getTitle().trim());
    }
  }

  var inboundSheet = ss.getSheetByName('1.21 - Inbound');
  var existingHeaders = inboundSheet.getRange(1, 1, 1, inboundSheet.getLastColumn()).getValues()[0];
  var initialColumnCount = existingHeaders.length;

  // Insert Base Headers at the Beginning if they don't exist
  baseHeaders.slice().reverse().forEach(function(header, index) {
    if (!existingHeaders.includes(header)) {
      inboundSheet.insertColumnBefore(1); // Always insert at the beginning
      inboundSheet.getRange(1, 1).setValue(header);
      existingHeaders.splice(0, 0, header); // Add header at the beginning of the array
    }
  });
  Logger.log("Base headers checked");

  // Append Common Headers after Existing Headers
  commonHeaders.forEach(function(header) {
    if (!existingHeaders.includes(header)) {
      var insertAt = existingHeaders.length + 1; // Insert after all existing headers
      inboundSheet.insertColumnAfter(existingHeaders.length); // Insert at the end of the current headers
      inboundSheet.getRange(1, insertAt).setValue(header);
      existingHeaders.push(header); // Add to the tracking array
    }
  });
  Logger.log("Common headers added");

  // Append Role-Specific Headers Last
  newHeaders.forEach(function(header) {
    if (!existingHeaders.includes(header)) {
      inboundSheet.insertColumnAfter(existingHeaders.length); // Append at the end
      inboundSheet.getRange(1, existingHeaders.length + 1).setValue(header);
      existingHeaders.push(header); // Ensure we track this addition
    }
  });
  Logger.log("Role-specific headers added");
}





function getAllResponses() {
  updateInboundHeaders();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var chosenRoleName = ss.getName().trim();
  if (!chosenRoleName) {
    Logger.log("What role are you applying for?");
    return;
  }
  var form = FormApp.openById(FORM_ID);
  var formItems = form.getItems();
  var questionsForRole = ["Timestamp", "ID", "Email", "Name"];
  var inRoleSection = false;
  var sheet = ss.getSheetByName('1.21 - Inbound');
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < formItems.length; i++) {
    var item = formItems[i];
    if (item.getType() === FormApp.ItemType.PAGE_BREAK && item.getTitle() === chosenRoleName) {
      inRoleSection = !inRoleSection;
    }
    if (inRoleSection) {
      questionsForRole.push(item.getTitle());
    }
  }

  var emailColumnIndex = headers.indexOf('Email') + 1;
  var existingData = sheet.getDataRange().getValues();

  var formResponses = form.getResponses();
  var roleRelevanceColumnIndex = headers.indexOf('Role Relevance') + 1;
  var firstNameColIndex = headers.indexOf('First Name') + 1;
  var lastNameColIndex = headers.indexOf('Last Name') + 1;
  var nameColIndex = headers.indexOf('Name') + 1;
  var timestampColIndex = headers.indexOf('Timestamp') + 1;
   var idColIndex = headers.indexOf('ID') + 1;

  formResponses.forEach(formResponse => {
    var itemResponses = formResponse.getItemResponses();
    var isForChosenRole = itemResponses.some(itemResponse => itemResponse.getResponse() === chosenRoleName);
    if (isForChosenRole) {
      var email = formResponse.getRespondentEmail();
      var existingRowIndex = existingData.findIndex(row => row[emailColumnIndex - 1] === email);
      var rowToUpdate = existingRowIndex >= 0 ? existingData[existingRowIndex] : new Array(headers.length).fill("");
      
      var timestamp = formResponse.getTimestamp();
      var formattedTimestamp = Utilities.formatDate(timestamp, "GMT+0530", "M/d/yyyy HH:mm:ss");
      rowToUpdate[timestampColIndex - 1] = formattedTimestamp;
      
      if (existingRowIndex === -1) {
        rowToUpdate[idColIndex - 1] = generateUniqueID(INBOUND_SHEET_NAME, chosenRoleName);
      }

      var fullName = '';
      itemResponses.forEach(itemResponse => {
        var questionTitle = itemResponse.getItem().getTitle().trim(); // Trim spaces from question title
        var colIndex = headers.indexOf(questionTitle) + 1;
        var response = itemResponse.getResponse();
        if (colIndex > 0) {
          if (itemResponse.getItem().getType() === FormApp.ItemType.FILE_UPLOAD) {
            response = (Array.isArray(response) ? response : [response])
              .map(fileId => "https://drive.google.com/open?id=" + fileId)
              .join(", ");
          } else if (Array.isArray(response)) {
            response = response.join(", ");
          }
          if (questionTitle === 'First Name') {
            fullName += response + ' ';
            if (firstNameColIndex > 0) {
              rowToUpdate[firstNameColIndex - 1] = response;
            }
          } else if (questionTitle === 'Last Name') {
            fullName += response;
            if (lastNameColIndex > 0) {
              rowToUpdate[lastNameColIndex - 1] = response;
            }
          } else {
            rowToUpdate[colIndex - 1] = response;
          }
        }
      });
      if (nameColIndex > 0) {
        rowToUpdate[nameColIndex - 1] = fullName.trim();
      }
      if (emailColumnIndex > 0) {
        rowToUpdate[emailColumnIndex - 1] = email;
      }

      if (existingRowIndex === -1) {
        Logger.log("Appending new row for email: " + email + " Name: " + fullName.trim());
        sheet.appendRow(rowToUpdate);
        if (roleRelevanceColumnIndex > 0) {
          var rowIndex = sheet.getLastRow();
          let sourceRow = findByRow(ROLE_RELEVANCE_COLUMN_NAME)
          addDropDown(rowIndex,roleRelevanceColumnIndex ,sheet,  ss, sourceRow)
        }
      } else {
        Logger.log("already existing email: " + email + " Name: " + fullName.trim());
        // sheet.getRange(existingRowIndex + 1, 1, 1, headers.length).setValues([rowToUpdate]);
        // Check if existing row has data validation, if not, apply it
        // var existingValidation = sheet.getRange(existingRowIndex + 1, roleRelevanceColumnIndex).getDataValidation();
        // if (!existingValidation) {
        //   sheet.getRange(existingRowIndex + 1, roleRelevanceColumnIndex).setDataValidation(rule);
        // }
      }
    }
  });
}



function addDropDown(destinationRow, destinationColumn, destinationSheet, spreadSheet,sourceRow){
  try{
    setDropDownValues(POSITION_CREATION_SHEET_NAME,sourceRow,destinationSheet,destinationRow, destinationColumn);
  }
  catch(e){
  var dropdownValues = DROPDOWNS[ROLE_RELEVANCE_COLUMN_NAME];
    var validationRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(dropdownValues, true)
      .build();
    sheet.getRange(destinationRow, destinationColumn + 1, 1, 1).setDataValidation(validationRule);
    Logger.log("adding droupdown hard coded")
  }
}

