/**
 * Princesses — Google Apps Script Configuration
 *
 * SETUP:
 * 1. Run setup() once from the Apps Script editor.
 * 2. Change DEFAULT_ADMIN_PASSWORD before first login.
 * 3. Deploy as Web App → Execute as: Me → Who has access: Anyone
 */

var CONFIG = {
  SPREADSHEET_NAME: 'Princesses DB',
  DRIVE_ROOT_FOLDER: 'Princesses',

  /** Change this before running setup() */
  DEFAULT_ADMIN_PASSWORD: 'Princesses@2008',

  TOKEN_EXPIRY_HOURS: 1,
  CACHE_TTL_SECONDS: 300,
  LOGIN_RATE_LIMIT: 5,
  LOGIN_RATE_WINDOW_SECONDS: 900,

  SHEETS: {
    DRESSES: 'Dresses',
    CATEGORIES: 'Categories',
    GALLERY: 'Gallery',
    TESTIMONIALS: 'Testimonials',
    ABOUT: 'About',
    SETTINGS: 'Settings',
  },

  DRESS_COLUMNS: [
    'ID', 'Name', 'Category', 'Color', 'Price',
    'Fabric Type', 'Estimated Fabric', 'Estimated Duration',
    'Sizes', 'Notes', 'Images', 'Featured', 'Hidden',
    'Created At', 'Updated At',
  ],

  CATEGORY_COLUMNS: ['ID', 'Name', 'Slug', 'Icon', 'Description', 'Order', 'Hidden'],
  GALLERY_COLUMNS: ['ID', 'Title', 'Image URL', 'Order', 'Hidden', 'Created At'],
  TESTIMONIAL_COLUMNS: ['ID', 'Name', 'Text', 'Rating', 'Avatar', 'Order', 'Hidden'],
  ABOUT_COLUMNS: ['Key', 'Value', 'Updated At'],
  SETTINGS_COLUMNS: ['Key', 'Value'],
};

/**
 * Run once to initialize spreadsheet, Drive folders, and admin password.
 */
function setup() {
  SheetsService.initialize();
  DriveService.initialize();
  Auth.initializeAdminPassword(CONFIG.DEFAULT_ADMIN_PASSWORD);

  Logger.log('Princesses setup complete.');
  Logger.log('Spreadsheet ID: ' + SheetsService.getSpreadsheetId());
  Logger.log('Drive folder ID: ' + DriveService.getRootFolderId());
  Logger.log('Default admin password: ' + CONFIG.DEFAULT_ADMIN_PASSWORD);
}

/**
 * Returns stored config from Script Properties.
 */
function getScriptConfig_() {
  var props = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: props.getProperty('SPREADSHEET_ID'),
    driveRootId: props.getProperty('DRIVE_ROOT_ID'),
  };
}

function saveScriptConfig_(key, value) {
  PropertiesService.getScriptProperties().setProperty(key, value);
}
