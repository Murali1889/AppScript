
function proxyCurl() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('1.2 - Profiles');
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  var headers = data[0];
  var profileUrlIndex = headers.indexOf('URL');

  for (var i = 0; i < data.length; i++) {
    var profileUrl = data[i][profileUrlIndex];
    var username = getLinkedinUsername(profileUrl);

    if (username) {
      var existingData = getData(username);
      var profileData;
      if (existingData) {
        profileData = existingData;
      } else {
        profileData = fetchLinkedInProfile(profileUrl);
        if (profileData) {
          saveFile(profileData, username);
        } else {
          Logger.log("Error while fetching or we couldn't find the URL: " + profileUrl);
          continue;  // Skip this profile if fetching data failed
        }
      }

      let extractedData = profileData
      extractedData = extractProfileData(profileData);
      extractedData.location = extractLocation(profileData); 
      // if (extractedData.location && extractedData.location.toLowerCase().includes('mumbai')) {
        updateSheetWithExtractedData(sheet, i, extractedData);
      // }
    }
  }
}

function extractLocation(profileData) {
  if (profileData.city && profileData.state && profileData.country_full_name) {
    return profileData.city + ', ' + profileData.state + ', ' + profileData.country_full_name;
  } else if (profileData.city && profileData.country_full_name) {
    return profileData.city + ', ' + profileData.country_full_name;
  } else if (profileData.country_full_name) {
    return profileData.country_full_name;
  } else {
    return null;
  }
}

function saveFile(data, fileName) {
  var folderName = 'Linkedin Data';
  var folders = DriveApp.getFoldersByName(folderName);
  var folder;
  
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }

  // Check if file with the same name already exists
  var files = folder.getFilesByName(fileName + '.json');
  if (files.hasNext()) {
    var existingFile = files.next();
    Logger.log('File already exists: ' + existingFile.getName());
  }
  
  // Create the new file
  var newFile = folder.createFile(fileName + '.json', JSON.stringify(data));
  Logger.log('File saved as ' + newFile.getName());
}

function getLinkedinUsername(url) {
  var regex = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/|linkedin\.com\/profile\/view\?id=)([a-zA-Z0-9\-]+)/;
  var match = url.match(regex);
  return match ? match[1] : null;
}

function getData(username) {
  var folderName = 'Linkedin Data';
  var folders = DriveApp.getFoldersByName(folderName);
  var folder;
  
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    return null;
  }
  
  var files = folder.getFilesByName(username + '.json');
  if (files.hasNext()) {
    var file = files.next();
    var content = file.getBlob().getDataAsString();
    
    try {
      return JSON.parse(content);
    } catch (e) {
      Logger.log('Error parsing JSON for username: ' + username + ', error: ' + e);
      return null;
    }
  } else {
    return null;
  }
}



function fetchLinkedInProfile(linkedInProfileUrl) {
  const apiEndpoint = 'https://nubela.co/proxycurl/api/v2/linkedin';
  const apiKey = 'jH_1u66PA3GX4pFy44XcVQ';
  const headers = {
    'Authorization': 'Bearer ' + apiKey
  };
  const queryParams = '?url=' + encodeURIComponent(linkedInProfileUrl) + '&use_cache=if-recent';
  const options = {
    'method': 'get',
    'headers': headers,
    'muteHttpExceptions': true
  };

  try {
    const response = UrlFetchApp.fetch(apiEndpoint + queryParams, options);

    const data = JSON.parse(response.getContentText());
    return data
  } catch (error) {
    Logger.log('Failed to fetch LinkedIn profile: ' + error.toString());
    return null;
  }
}

function updateSheetWithExtractedData(sheet, rowIndex, extractedData) {
  var headers = sheet.getDataRange().getValues()[0];
  var columns = {
    title: headers.indexOf('Title') + 1,
    location: headers.indexOf('location') + 1,
    totalYearsExperience: headers.indexOf('Total Years of Exp') + 1,
    currentCompany: headers.indexOf('Company') + 1,
    level: headers.indexOf('Title/Level') + 1,
    role: headers.indexOf('Role') + 1,
    yearsInCurrentCompany: headers.indexOf('Years in this company') + 1,
    lastCompany: headers.indexOf('Last Company') + 1,
    lastTitleLevel: headers.indexOf('Last Title/Level') + 1,
    lastRole: headers.indexOf('Last Role') + 1,
    yearsInLastCompany: headers.indexOf('Years in last company') + 1,
    // otherNotes: headers.indexOf('Other notes') + 1
  };

  sheet.getRange(rowIndex + 1, columns.title).setValue(extractedData.currentCompanyTitle);
  sheet.getRange(rowIndex + 1, columns.location).setValue(extractedData.location);
  sheet.getRange(rowIndex + 1, columns.totalYearsExperience).setValue(extractedData.totalExperience);
  sheet.getRange(rowIndex + 1, columns.currentCompany).setValue(extractedData.currentCompany);
  sheet.getRange(rowIndex + 1, columns.level).setValue(extractedData.currentCompanyLevel);
  sheet.getRange(rowIndex + 1, columns.role).setValue(extractedData.currentCompanyRole);
  sheet.getRange(rowIndex + 1, columns.yearsInCurrentCompany).setValue(extractedData.currentExperience);
  sheet.getRange(rowIndex + 1, columns.lastCompany).setValue(extractedData.lastCompany);
  sheet.getRange(rowIndex + 1, columns.lastTitleLevel).setValue(extractedData.lastCompanyTitle);
  sheet.getRange(rowIndex + 1, columns.lastRole).setValue(extractedData.lastCompanyRole);
  sheet.getRange(rowIndex + 1, columns.yearsInLastCompany).setValue(extractedData.lastCompanyExperience);
  // sheet.getRange(rowIndex + 1, columns.otherNotes).setValue(extractedData.otherNotes);
}

function extractProfileData(profileData) {
  const experiences = profileData.experiences || [];
  Logger.log(experiences);

  const getTotalExperience = (experiences) => {
    const calculateMonths = (exp) => {
      if (!exp.starts_at || !exp.starts_at.year || !exp.starts_at.month) {
        return 0; // Skip if the start date is not defined
      }
      const start = new Date(exp.starts_at.year, exp.starts_at.month - 1);
      const end = exp.ends_at && exp.ends_at.year && exp.ends_at.month ? new Date(exp.ends_at.year, exp.ends_at.month - 1) : new Date();
      return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    };
    const totalMonths = experiences.reduce((sum, exp) => sum + calculateMonths(exp), 0);
    return (totalMonths / 12).toFixed(2);
  };

  const getCurrentCompany = (experiences) => experiences.find((exp) => !exp.ends_at);

  const getLastCompany = (experiences, currentCompany) => {
    const pastExperiences = experiences.filter((exp) => exp.ends_at && exp.company !== (currentCompany ? currentCompany.company : null));
    return pastExperiences.length > 0
      ? pastExperiences.reduce((prev, curr) =>
          new Date(curr.ends_at.year, curr.ends_at.month - 1) > new Date(prev.ends_at.year, prev.ends_at.month - 1) ? curr : prev)
      : null;
  };

  const calculateExperience = (exp) => {
    if (!exp.starts_at || !exp.starts_at.year || !exp.starts_at.month) {
      return 0; // Skip if the start date is not defined
    }
    const start = new Date(exp.starts_at.year, exp.starts_at.month - 1);
    const end = exp.ends_at && exp.ends_at.year && exp.ends_at.month ? new Date(exp.ends_at.year, exp.ends_at.month - 1) : new Date();
    const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return (months / 12).toFixed(2);
  };

 const extractRoleFromTitle = (title) => {
  const roles = [
    { keyword: "Engineer", role: "Engineer" },
    { keyword: "Consultant", role: "Consultant" },
    { keyword: "Developer", role: "Developer" },
    { keyword: "Sales", role: "Sales" },
    { keyword: "Marketing", role: "Marketing" },
    { keyword: "Analyst", role: "Analyst" },
    { keyword: "Manager", role: "Manager" },
    { keyword: "Executive", role: "Executive" },
    { keyword: "Director", role: "Director" },
    { keyword: "Account", role: "Sales" },
    { keyword: "Business Development", role: "Sales" },
    { keyword: "Client", role: "Sales" },
    { keyword: "Customer", role: "Sales" },
    { keyword: "Sales", role: "Sales" },
    { keyword: "Associate", role: "Associate" },
    { keyword: "Assistant", role: "Assistant" },
    { keyword: "Administrator", role: "Administrator" },
    { keyword: "Coordinator", role: "Coordinator" },
    { keyword: "Specialist", role: "Specialist" },
    { keyword: "Advisor", role: "Advisor" },
    { keyword: "Supervisor", role: "Supervisor" },
    { keyword: "Leader", role: "Leader" },
    { keyword: "Architect", role: "Architect" },
    { keyword: "Technician", role: "Technician" },
    { keyword: "Designer", role: "Designer" },
    { keyword: "Producer", role: "Producer" },
    { keyword: "Planner", role: "Planner" },
    { keyword: "Auditor", role: "Auditor" },
    { keyword: "Controller", role: "Controller" },
    { keyword: "Scientist", role: "Scientist" },
    { keyword: "Researcher", role: "Researcher" },
    { keyword: "Instructor", role: "Instructor" },
    { keyword: "Trainer", role: "Trainer" },
    { keyword: "Coach", role: "Coach" },
    { keyword: "Operator", role: "Operator" },
    { keyword: "Inspector", role: "Inspector" },
    { keyword: "Agent", role: "Agent" },
    { keyword: "Representative", role: "Representative" },
    { keyword: "Strategist", role: "Strategist" },
    { keyword: "Officer", role: "Officer" },
    { keyword: "Attorney", role: "Attorney" },
    { keyword: "Paralegal", role: "Paralegal" },
    { keyword: "Physician", role: "Physician" },
    { keyword: "Nurse", role: "Nurse" },
    { keyword: "Therapist", role: "Therapist" },
    { keyword: "Pharmacist", role: "Pharmacist" },
    { keyword: "Technologist", role: "Technologist" },
    { keyword: "Worker", role: "Worker" },
    { keyword: "Employee", role: "Employee" },
    { keyword: "Staff", role: "Staff" },
    { keyword: "Crew", role: "Crew" },
    { keyword: "Laborer", role: "Laborer" },
    { keyword: "Intern", role: "Intern" },
    { keyword: "Volunteer", role: "Volunteer" },
    { keyword: "Owner", role: "Owner" },
    { keyword: "Founder", role: "Founder" },
    { keyword: "Co-Founder", role: "Founder" },
    { keyword: "Entrepreneur", role: "Entrepreneur" },
    { keyword: "Investor", role: "Investor" },
    { keyword: "Partner", role: "Partner" },
    { keyword: "Shareholder", role: "Shareholder" },
    { keyword: "Chairman", role: "Chairman" },
    { keyword: "President", role: "President" },
    { keyword: "Chief", role: "Chief" },
    { keyword: "Principal", role: "Principal" },
    { keyword: "Head", role: "Head" },
    { keyword: "Dean", role: "Dean" },
    { keyword: "Provost", role: "Provost" },
    { keyword: "Professor", role: "Professor" },
    { keyword: "Lecturer", role: "Lecturer" },
    { keyword: "Tutor", role: "Tutor" },
    { keyword: "Counselor", role: "Counselor" },
    { keyword: "Mentor", role: "Mentor" },
    { keyword: "Guide", role: "Guide" },
    { keyword: "Reviewer", role: "Reviewer" },
    { keyword: "Critic", role: "Critic" },
    { keyword: "Editor", role: "Editor" },
    { keyword: "Writer", role: "Writer" },
    { keyword: "Author", role: "Author" },
    { keyword: "Blogger", role: "Blogger" },
    { keyword: "Journalist", role: "Journalist" },
    { keyword: "Reporter", role: "Reporter" },
    { keyword: "Broadcaster", role: "Broadcaster" },
    { keyword: "Host", role: "Host" },
    { keyword: "Filmmaker", role: "Filmmaker" },
    { keyword: "Photographer", role: "Photographer" },
    { keyword: "Artist", role: "Artist" },
    { keyword: "Illustrator", role: "Illustrator" },
    { keyword: "Animator", role: "Animator" },
    { keyword: "Musician", role: "Musician" },
    { keyword: "Composer", role: "Composer" },
    { keyword: "Singer", role: "Singer" },
    { keyword: "Dancer", role: "Dancer" },
    { keyword: "Actor", role: "Actor" },
    { keyword: "Performer", role: "Performer" },
    { keyword: "Entertainer", role: "Entertainer" },
    { keyword: "Athlete", role: "Athlete" },
    { keyword: "Referee", role: "Referee" },
    { keyword: "Umpire", role: "Umpire" },
    { keyword: "Scout", role: "Scout" },
    { keyword: "Promoter", role: "Promoter" },
    { keyword: "Finance", role: "Finance" },
    { keyword: "Financial", role: "Finance" },
    { keyword: "Accountant", role: "Accountant" },
    { keyword: "CPA", role: "Accountant" },
    { keyword: "CFO", role: "Finance" },
    { keyword: "Treasurer", role: "Finance" },
    { keyword: "Controller", role: "Controller" },
    { keyword: "Investment", role: "Finance" },
    { keyword: "Banker", role: "Banker" },
    { keyword: "Actuary", role: "Actuary" },
    { keyword: "Economist", role: "Economist" },
    { keyword: "Auditor", role: "Auditor" },
    { keyword: "Budget", role: "Finance" },
    { keyword: "Tax", role: "Finance" },
    { keyword: "Wealth", role: "Finance" },
    { keyword: "Insurance", role: "Insurance" },
    { keyword: "Risk", role: "Risk" },
    { keyword: "Credit", role: "Credit" },
    { keyword: "Loan", role: "Loan" },
    { keyword: "Underwriter", role: "Underwriter" },
    { keyword: "Equity", role: "Finance" },
    { keyword: "Debt", role: "Finance" },
    { keyword: "Fund", role: "Finance" },
    { keyword: "Portfolio", role: "Finance" },
    { keyword: "Analyst", role: "Analyst" },
    { keyword: "Trader", role: "Trader" },
    { keyword: "Broker", role: "Broker" },
    { keyword: "Advisor", role: "Advisor" },
    { keyword: "Planner", role: "Planner" },
    { keyword: "Consultant", role: "Consultant" },
    { keyword: "Compliance", role: "Compliance" },
    { keyword: "Treasury", role: "Finance" },
    { keyword: "Operations", role: "Operations" },
    { keyword: "Strategy", role: "Strategy" },
    { keyword: "Innovation", role: "Innovation" },
    { keyword: "Transformation", role: "Transformation" },
    { keyword: "Audit", role: "Audit" },
    { keyword: "Controls", role: "Controls" },
    { keyword: "Legal Counsel", role: "Legal Counsel" },
    { keyword: "Legal", role: "Legal Counsel" },
    { keyword: "General Counsel", role: "Legal Counsel" },
    { keyword: "Corporate Counsel", role: "Legal Counsel" },
    { keyword: "In-House Counsel", role: "Legal Counsel" },
    { keyword: "Associate Counsel", role: "Legal Counsel" },
    { keyword: "Senior Counsel", role: "Legal Counsel" },
    { keyword: "Litigation Counsel", role: "Legal Counsel" },
    { keyword: "Regulatory Counsel", role: "Legal Counsel" },
    { keyword: "Compliance Counsel", role: "Legal Counsel" },
    { keyword: "Transactional Counsel", role: "Legal Counsel" },
    { keyword: "Intellectual Property Counsel", role: "Legal Counsel" },
    { keyword: "IP Counsel", role: "Legal Counsel" },
    { keyword: "Employment Counsel", role: "Legal Counsel" },
    { keyword: "Labor Counsel", role: "Legal Counsel" },
    { keyword: "Contract Counsel", role: "Legal Counsel" },
    { keyword: "Commercial Counsel", role: "Legal Counsel" },
    { keyword: "Product Counsel", role: "Legal Counsel" },
    { keyword: "Privacy Counsel", role: "Legal Counsel" },
    { keyword: "Data Protection Counsel", role: "Legal Counsel" },
    { keyword: "Technology Counsel", role: "Legal Counsel" }
];


  for (const { keyword, role } of roles) {
    if (title && title.toLowerCase().includes(keyword.toLowerCase())) {
      return role;
    }
  }

  return "Unknown";
};


  const currentCompany = getCurrentCompany(experiences);
  const lastCompany = getLastCompany(experiences, currentCompany);

  const result = {
    currentCompany: currentCompany ? currentCompany.company : "Not working",
    currentCompanyTitle: profileData.headline,
    currentCompanyLevel: currentCompany ? currentCompany.title : "Not found",
    currentCompanyRole: currentCompany ? extractRoleFromTitle(currentCompany.title) : "Not working",
    currentExperience: currentCompany ? calculateExperience(currentCompany) : "0",
    lastCompany: lastCompany ? lastCompany.company : "No previous company",
    lastCompanyTitle: lastCompany ? lastCompany.title : "No previous company",
    lastCompanyRole: lastCompany ? extractRoleFromTitle(lastCompany.title) : "No previous company",
    lastCompanyExperience: lastCompany ? calculateExperience(lastCompany) : "0",
    totalExperience: getTotalExperience(experiences),
  };

  return result;
}
