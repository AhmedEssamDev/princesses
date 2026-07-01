/**
 * Princesses — Utility helpers
 */

var Utils = (function () {
  'use strict';

  function jsonOutput(payload, statusCode) {
    var output = {
      success: payload.success !== false,
      data: payload.data !== undefined ? payload.data : null,
      message: payload.message || null,
      error: payload.error || null,
    };

    if (payload.success === false && !payload.error) {
      output.error = payload.message || 'Unknown error';
    }

    return ContentService
      .createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function success(data, message) {
    return { success: true, data: data, message: message || null, error: null };
  }

  function fail(message, data) {
    return { success: false, data: data || null, message: message, error: message };
  }

  function generateId() {
    return Utilities.getUuid();
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function parseJson(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback !== undefined ? fallback : null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return fallback !== undefined ? fallback : value;
    }
  }

  function stringifyJson(value) {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }

  function parseBoolean(value) {
    if (value === true || value === 'TRUE' || value === 'true' || value === 1 || value === '1') return true;
    if (value === false || value === 'FALSE' || value === 'false' || value === 0 || value === '0') return false;
    return Boolean(value);
  }

  function parseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    var num = Number(value);
    return isNaN(num) ? null : num;
  }

  function sanitizeString(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  function getTokenFromRequest(e, body) {
    if (body && body.token) return body.token;
    if (e && e.parameter && e.parameter.token) return e.parameter.token;
    return null;
  }

  /**
   * Convert a sheet row to an object using header names.
   */
  function rowToObject(headers, row) {
    var obj = {};
    for (var i = 0; i < headers.length; i++) {
      var key = camelCase(headers[i]);
      if (key === 'iD') key = 'id';
      obj[key] = row[i] !== undefined ? row[i] : '';
    }
    return obj;
  }

  function camelCase(str) {
    return String(str)
      .trim()
      .replace(/\s+(.)/g, function (_, c) { return c.toUpperCase(); })
      .replace(/\s/g, '')
      .replace(/^(.)/, function (c) { return c.toLowerCase(); });
  }

  /**
   * Map camelCase API payload to sheet column names.
   */
  function dressPayloadToRow(payload, isUpdate) {
    var now = nowIso();
    return {
      'ID': payload.id || generateId(),
      'Name': sanitizeString(payload.name),
      'Category': sanitizeString(payload.category),
      'Color': sanitizeString(payload.color),
      'Price': parseNumber(payload.price),
      'Fabric Type': sanitizeString(payload.fabricType),
      'Estimated Fabric': sanitizeString(payload.estimatedFabric),
      'Estimated Duration': sanitizeString(payload.estimatedDuration),
      'Sizes': stringifyJson(payload.sizes),
      'Notes': sanitizeString(payload.notes),
      'Images': stringifyJson(payload.images),
      'Featured': parseBoolean(payload.featured),
      'Hidden': parseBoolean(payload.hidden),
      'Created At': isUpdate ? (payload.createdAt || now) : now,
      'Updated At': now,
    };
  }

  function dressRowToApi(rowObj) {
    return {
      id: rowObj.id || rowObj.ID,
      name: rowObj.name || rowObj.Name || '',
      category: rowObj.category || rowObj.Category || '',
      color: rowObj.color || rowObj.Color || '',
      price: parseNumber(rowObj.price !== undefined ? rowObj.price : rowObj.Price),
      fabricType: rowObj.fabricType || rowObj['Fabric Type'] || '',
      estimatedFabric: rowObj.estimatedFabric || rowObj['Estimated Fabric'] || '',
      estimatedDuration: rowObj.estimatedDuration || rowObj['Estimated Duration'] || '',
      sizes: parseJson(rowObj.sizes || rowObj.Sizes, []),
      notes: rowObj.notes || rowObj.Notes || '',
      images: parseJson(rowObj.images || rowObj.Images, []),
      featured: parseBoolean(rowObj.featured !== undefined ? rowObj.featured : rowObj.Featured),
      hidden: parseBoolean(rowObj.hidden !== undefined ? rowObj.hidden : rowObj.Hidden),
      createdAt: rowObj.createdAt || rowObj['Created At'] || '',
      updatedAt: rowObj.updatedAt || rowObj['Updated At'] || '',
    };
  }

  function categoryRowToApi(rowObj) {
    return {
      id: rowObj.id || rowObj.ID,
      name: rowObj.name || rowObj.Name || '',
      slug: rowObj.slug || rowObj.Slug || '',
      icon: rowObj.icon || rowObj.Icon || '',
      description: rowObj.description || rowObj.Description || '',
      order: parseNumber(rowObj.order !== undefined ? rowObj.order : rowObj.Order) || 0,
      hidden: parseBoolean(rowObj.hidden !== undefined ? rowObj.hidden : rowObj.Hidden),
    };
  }

  function galleryRowToApi(rowObj) {
    return {
      id: rowObj.id || rowObj.ID,
      title: rowObj.title || rowObj.Title || '',
      imageUrl: rowObj.imageUrl || rowObj['Image URL'] || '',
      order: parseNumber(rowObj.order !== undefined ? rowObj.order : rowObj.Order) || 0,
      hidden: parseBoolean(rowObj.hidden !== undefined ? rowObj.hidden : rowObj.Hidden),
      createdAt: rowObj.createdAt || rowObj['Created At'] || '',
    };
  }

  function testimonialRowToApi(rowObj) {
    return {
      id: rowObj.id || rowObj.ID,
      name: rowObj.name || rowObj.Name || '',
      text: rowObj.text || rowObj.Text || '',
      rating: parseNumber(rowObj.rating !== undefined ? rowObj.rating : rowObj.Rating),
      avatar: rowObj.avatar || rowObj.Avatar || '',
      order: parseNumber(rowObj.order !== undefined ? rowObj.order : rowObj.Order) || 0,
      hidden: parseBoolean(rowObj.hidden !== undefined ? rowObj.hidden : rowObj.Hidden),
    };
  }

  function slugify(text) {
    return sanitizeString(text)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]+/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  return {
    jsonOutput: jsonOutput,
    success: success,
    fail: fail,
    generateId: generateId,
    nowIso: nowIso,
    parseJson: parseJson,
    stringifyJson: stringifyJson,
    parseBoolean: parseBoolean,
    parseNumber: parseNumber,
    sanitizeString: sanitizeString,
    getTokenFromRequest: getTokenFromRequest,
    rowToObject: rowToObject,
    camelCase: camelCase,
    dressPayloadToRow: dressPayloadToRow,
    dressRowToApi: dressRowToApi,
    categoryRowToApi: categoryRowToApi,
    galleryRowToApi: galleryRowToApi,
    testimonialRowToApi: testimonialRowToApi,
    slugify: slugify,
  };
})();
