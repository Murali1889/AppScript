const SPREADSHEET_NAME = SpreadsheetApp.getActiveSpreadsheet().getName();
const SEARCH_ENGINE_ID = '85e5ec624d9964e2e';
const API_KEY = 'AIzaSyBYtxmka_LUSzBdFOaPUhJy0AuAjxbFw3k';
const PROFILE_SHEET_NAME = "1.2 - Profiles";
const INBOUND_SHEET_NAME = "1.21 - Inbound";
const SHORTLIST_SHEET_NAME = "1.3 - Shortlist";
const INTERVIEW_SHEET_NAME = "1.4 - Interview";
const POSITION_CREATION_SHEET_NAME = "1.0 - Position Creation";
const PROCESS_SHEET_NAME = '1.1 - Process';
const ID_COLUMN_NAME = "ID";
const ROLE_RELEVANCE_COLUMN_NAME = "Role Relevance";
const OVERALL_STATUS_COLUMN_NAME = "Overall Status";
const PROFILE_LINKEDIN_COLUMN_NAME = "URL";
const NAME = "Name";
const TEMPLATE_SHEET_NAME = "Messages";
const LAST_NAME = "Last Name";
const DATE_OF_TRANSFER = "Date of Transfer"
const INBOUND_LINKEDIN_COLUMN_NAME = "Please share the link to your LinkedIn profile";
const SHORTLIST_LINKEDIN_COLUMN_NAME = "LinkedIn Profile"
const ROLE_RELEVANCE_OPTIONS = ['Yes', 'No', 'Maybe'];
const DQ_REASONS_OPTIONS = ['High Compensation',"Functional Skill mismatch","Communication/Energy","Relocation","ICP Changed","Resume DQ'ed","Senior","Junior"];
const SHORTLIST_REACHOUT_OPTIONS = ['1. Reached Out', '2. Follow Up 1', '3. Follow Up 2', '4. Follow Up 3'];
const OVERALL_STATUS_OPTIONS = ['1. Initiated', '2. Connected', '3. Scheduled', '4. Qualified', "5. DQ'ed", '6. Not Interested'];
const INTERVIEW_STATUS_OPTIONS = ['0. Resume Shared', '1. HM Interview', '2. Assignment Round', '3. Domain Round', '4. WHO Round', '5. LTA Round', '6. Reference Check', '7. Offer Rolled Out', "8. DQ'ed", '9. Dropped Out'];
const CANDIDATE_PRIORITY_OPTIONS = ['P0','P1'];
const DQ_STAGE_OPTIONS = ['0. Puzzle Round', '1. HM Interview', '2. Assignment Round', '3. Domain Round', '4. WHO Round', '5. LTA Round', '6. Reference Check', '7. Offer Rolled Out', "8. DQ'ed", '9. Dropped Out'];
const EMAIL_TEMPLATES = {
  ackEmail: "Acknowledgment of Inbound Application",
  dqEmail: "DQ'ed Email @ Application",
  dqEmailInterview: "DQ'ed Email Post Interview",
  fbEmail: "Feedback Email Post Interview",
};

const EMAIL_STATUS_HEADERS = {
  ackEmail: "Ack Email Status",
  dqEmail: "DQ Email Status",
  fbEmail: "Feedback Form",
};


const DROPDOWNS = {
  "Role Relevance": ROLE_RELEVANCE_OPTIONS,
  "Overall Status": OVERALL_STATUS_OPTIONS,
  "LinkedIn(HM)": SHORTLIST_REACHOUT_OPTIONS,
  "LinkedIn(TA)": SHORTLIST_REACHOUT_OPTIONS,
  "WhatsApp": SHORTLIST_REACHOUT_OPTIONS,
  "Call": SHORTLIST_REACHOUT_OPTIONS,
  "SMS": SHORTLIST_REACHOUT_OPTIONS,
  "Interview Status": INTERVIEW_STATUS_OPTIONS,
  "Candidate Priority": CANDIDATE_PRIORITY_OPTIONS,
  "DQ stage": DQ_STAGE_OPTIONS,
  "DQ reasons":DQ_REASONS_OPTIONS,
}


const DROPDOWN_MAPPINGS = {
  "1.2 - Profiles": {
    "Role Relevance":["Role Relevance"],
  },
  "1.21 - Inbound": {
    "Role Relevance":["Role Relevance"],
  },
  "1.3 - Shortlist": {
    "Overall Status": ["Overall Status"],
    "DQ reasons":["DQ reasons"],
    "Reach Out":["LinkedIn(HM)", "LinkedIn(TA)", "WhatsApp","Call","SMS",]
  },
  "1.4 - Interview": {
    "Interview Status":["Interview Status"],
    "Candidate Priority": ["Candidate Priority"],
    "DQ stage": ["DQ stage"],
  }
};

const EMAIL_HEADER_MAPPINGS = {
  "1.21 - Inbound": {
    name: "Name",
    email: "Email",
  },
  "1.3 - Shortlist": {
    name: "Name",
    email: "Email ID"
  },
  "1.4 - Interview": {
    name: "Name",
    email: "Email ID"
  }
};

const HEADERS = {
  "1.2 - Profiles":["ID","Name","URL","Role Relevance","Source","Date of Transfer"],
  "1.21 - Inbound":["ID","Name","Last Name","Role Relevance","Please share the link to your LinkedIn profile","Email","What phone number can we reach out to you on?","Source","Date of Transfer"],
  "1.3 - Shortlist":["ID","Name","Last Name","LinkedIn Profile","Source","Date of Transfer","Last Action"],
  "1.4 - Interview":["ID","Name","Last Name", "Email ID", "LinkedIn Profile","Source","Date of Transfer","Last Action","Email ID"]
}
const SHEET_MAPPINGS = {
  "1.2 - Profiles": {
    "ID": "ID",
    "Name": "Name",
    "Last Name": "Last Name",
    "URL": "LinkedIn Profile",
    "Role Relevance": "Role Relevance",
    "Source": "Source",
    "Date of Transfer": "Date of Transfer",
  },
  "1.21 - Inbound": {
    "ID": "ID",
    "First Name": "Name",
    "Last Name": "Last Name",
    "Role Relevance": "Role Relevance",
    "Please share the link to your LinkedIn profile": "LinkedIn Profile",
    "Email": "Email ID",
    "What phone number can we reach out to you on?": "Phone Number",
    "Source": "Source",
    "Date of Transfer": "Date of Transfer",
  },
  "1.3 - Shortlist": {
    "ID": "ID",
    "Name": "Name",
    "Last Name": "Last Name",
    "LinkedIn Profile": "LinkedIn Profile",
    "Source": "Source",
    "Date of Transfer": "Date of Transfer",
    "Email ID":"Email ID"
  }
};
