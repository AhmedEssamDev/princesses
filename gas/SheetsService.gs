/**
 * Princesses — Google Sheets Service
 */

var SheetsService = (function () {
  'use strict';

  function getSpreadsheetId() {
    var cfg = getScriptConfig_();
    if (cfg.spreadsheetId) return cfg.spreadsheetId;

    var files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
    if (files.hasNext()) {
      var id = files.next().getId();
      saveScriptConfig_('SPREADSHEET_ID', id);
      return id;
    }
    return null;
  }

  function getSpreadsheet() {
    var id = getSpreadsheetId();
    if (!id) throw new Error('Spreadsheet not initialized. Run setup() first.');
    return SpreadsheetApp.openById(id);
  }

  function getSheet(name) {
    return getSpreadsheet().getSheetByName(name);
  }

  function initialize() {
    var ss;

    if (getSpreadsheetId()) {
      ss = getSpreadsheet();
    } else {
      ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
      saveScriptConfig_('SPREADSHEET_ID', ss.getId());
    }

    ensureSheet_(ss, CONFIG.SHEETS.DRESSES, CONFIG.DRESS_COLUMNS);
    ensureSheet_(ss, CONFIG.SHEETS.CATEGORIES, CONFIG.CATEGORY_COLUMNS);
    ensureSheet_(ss, CONFIG.SHEETS.GALLERY, CONFIG.GALLERY_COLUMNS);
    ensureSheet_(ss, CONFIG.SHEETS.TESTIMONIALS, CONFIG.TESTIMONIAL_COLUMNS);
    ensureSheet_(ss, CONFIG.SHEETS.ABOUT, CONFIG.ABOUT_COLUMNS);
    ensureSheet_(ss, CONFIG.SHEETS.SETTINGS, CONFIG.SETTINGS_COLUMNS);

    seedAboutDefaults_();
    seedCategoriesDefaults_();

    return ss.getId();
  }

  function ensureSheet_(ss, name, headers) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#F8E8EE');
      sheet.setFrozenRows(1);
    }

    return sheet;
  }

  function seedAboutDefaults_() {
    var defaults = {
      heroTitle: 'قصة Princesses',
      heroSubtitle: 'أناقة مُفصّلة منذ 2008',
      story: 'بدأت Princesses رحلتها في 2008 برؤية واضحة: صناعة فساتين تعكس شخصية كل امرأة.',
      vision: 'أن نكون الوجهة الأولى للفساتين الفاخرة المُفصّلة في المنطقة.',
      mission: 'تقديم تجربة خياطة استثنائية تجمع بين الإبداع والجودة والاهتمام بكل تفصيلة.',
      values: JSON.stringify([
        { title: 'الجودة', description: 'لا نتنازل عن أجود الأقمشة والخياطة.' },
        { title: 'الأناقة', description: 'تصاميم عصرية بلمسة فاخرة.' },
        { title: 'الثقة', description: ' علاقة طويلة الأمد مع كل عميلة.' },
      ]),
      experience: 'أكثر من 15 عاماً من الخبرة في تصميم وتفصيل الفساتين.',
      quality: 'كل فستان يمر بمراحل رقابة جودة دقيقة قبل التسليم.',
      customerSatisfaction: 'رضاكِ هو مقياس نجاحنا — نعمل حتى تحصلين على ما تحلمين به.',
    };

    Object.keys(defaults).forEach(function (key) {
      if (!getAboutValue(key)) {
        setAboutValue(key, defaults[key]);
      }
    });
  }

  function seedCategoriesDefaults_() {
    var sheet = getSheet(CONFIG.SHEETS.CATEGORIES);
    if (sheet.getLastRow() > 1) return;

    var categories = [
      { name: 'سهرة', icon: '✦' },
      { name: 'زفاف', icon: '♡' },
      { name: 'خطوبة', icon: '◆' },
      { name: 'كاجوال فاخر', icon: '◇' },
    ];

    categories.forEach(function (cat, index) {
      appendRow(CONFIG.SHEETS.CATEGORIES, CONFIG.CATEGORY_COLUMNS, {
        'ID': Utils.generateId(),
        'Name': cat.name,
        'Slug': Utils.slugify(cat.name),
        'Icon': cat.icon,
        'Description': '',
        'Order': index + 1,
        'Hidden': false,
      });
    });
  }

  function getHeaders(sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  }

  function getAllRows(sheetName) {
    var sheet = getSheet(sheetName);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    var headers = getHeaders(sheet);
    var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
    return values.map(function (row) {
      return Utils.rowToObject(headers, row);
    });
  }

  function findRowIndex(sheetName, idColumn, id) {
    var sheet = getSheet(sheetName);
    var headers = getHeaders(sheet);
    var idColIndex = headers.indexOf(idColumn);
    if (idColIndex === -1) throw new Error('ID column not found');

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return -1;

    var ids = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) return i + 2;
    }
    return -1;
  }

  function appendRow(sheetName, columns, rowData) {
    var sheet = getSheet(sheetName);
    var row = columns.map(function (col) {
      return rowData[col] !== undefined ? rowData[col] : '';
    });
    sheet.appendRow(row);
    return rowData;
  }

  function updateRow(sheetName, columns, id, rowData) {
    var rowIndex = findRowIndex(sheetName, 'ID', id);
    if (rowIndex === -1) throw new Error('Record not found');

    var sheet = getSheet(sheetName);
    var row = columns.map(function (col) {
      return rowData[col] !== undefined ? rowData[col] : '';
    });
    sheet.getRange(rowIndex, 1, rowIndex, columns.length).setValues([row]);
    return rowData;
  }

  function deleteRow(sheetName, id) {
    var rowIndex = findRowIndex(sheetName, 'ID', id);
    if (rowIndex === -1) throw new Error('Record not found');
    getSheet(sheetName).deleteRow(rowIndex);
    return true;
  }

  function getSetting(key) {
    var sheet = getSheet(CONFIG.SHEETS.SETTINGS);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;

    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === key) return data[i][1];
    }
    return null;
  }

  function setSetting(key, value) {
    var sheet = getSheet(CONFIG.SHEETS.SETTINGS);
    var lastRow = sheet.getLastRow();

    if (lastRow >= 2) {
      var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 2, 2).setValue(value);
          return;
        }
      }
    }

    sheet.appendRow([key, value]);
  }

  function getAboutValue(key) {
    var sheet = getSheet(CONFIG.SHEETS.ABOUT);
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return null;

    var data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === key) return data[i][1];
    }
    return null;
  }

  function setAboutValue(key, value) {
    var sheet = getSheet(CONFIG.SHEETS.ABOUT);
    var now = Utils.nowIso();
    var lastRow = sheet.getLastRow();

    if (lastRow >= 2) {
      var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
      for (var i = 0; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 2, 2, i + 2, 3).setValues([[value, now]]);
          return;
        }
      }
    }

    sheet.appendRow([key, value, now]);
  }

  function getAboutContent() {
    var sheet = getSheet(CONFIG.SHEETS.ABOUT);
    var lastRow = sheet.getLastRow();
    var content = { updatedAt: '' };

    if (lastRow < 2) return content;

    var data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    data.forEach(function (row) {
      content[row[0]] = row[1];
      if (row[2]) content.updatedAt = row[2];
    });

    return content;
  }

  function updateAboutContent(payload) {
    var keys = [
      'heroTitle', 'heroSubtitle', 'story', 'vision', 'mission',
      'values', 'experience', 'quality', 'customerSatisfaction',
    ];

    keys.forEach(function (key) {
      if (payload[key] !== undefined) {
        var value = typeof payload[key] === 'object'
          ? JSON.stringify(payload[key])
          : String(payload[key]);
        setAboutValue(key, value);
      }
    });

    return getAboutContent();
  }

  function invalidateCache(prefix) {
    var cache = CacheService.getScriptCache();
    cache.remove(prefix + '_all');
  }

  return {
    initialize: initialize,
    getSpreadsheetId: getSpreadsheetId,
    getSpreadsheet: getSpreadsheet,
    getSheet: getSheet,
    getAllRows: getAllRows,
    findRowIndex: findRowIndex,
    appendRow: appendRow,
    updateRow: updateRow,
    deleteRow: deleteRow,
    getSetting: getSetting,
    setSetting: setSetting,
    getAboutContent: getAboutContent,
    updateAboutContent: updateAboutContent,
    invalidateCache: invalidateCache,
  };
})();
