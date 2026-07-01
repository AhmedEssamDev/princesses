/**
 * Princesses — Testimonials Handler
 */

var TestimonialsHandler = (function () {
  'use strict';

  function listPublic() {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.TESTIMONIALS);
    var items = rows
      .map(Utils.testimonialRowToApi)
      .filter(function (t) { return !t.hidden && t.name && t.text; })
      .sort(function (a, b) { return a.order - b.order; });
    return Utils.success(items);
  }

  function listAdmin() {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.TESTIMONIALS);
    var items = rows
      .map(Utils.testimonialRowToApi)
      .sort(function (a, b) { return a.order - b.order; });
    return Utils.success(items);
  }

  function getById(id) {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.TESTIMONIALS);
    var found = null;
    rows.forEach(function (row) {
      var item = Utils.testimonialRowToApi(row);
      if (String(item.id) === String(id)) found = item;
    });
    if (!found) return Utils.fail('Testimonial not found');
    return Utils.success(found);
  }

  function create(body) {
    if (!Utils.sanitizeString(body.name) || !Utils.sanitizeString(body.text)) {
      return Utils.fail('Name and text are required');
    }

    var rowData = {
      'ID': Utils.generateId(),
      'Name': Utils.sanitizeString(body.name),
      'Text': Utils.sanitizeString(body.text),
      'Rating': Utils.parseNumber(body.rating) || 5,
      'Avatar': Utils.sanitizeString(body.avatar),
      'Order': Utils.parseNumber(body.order) || 0,
      'Hidden': Utils.parseBoolean(body.hidden),
    };

    SheetsService.appendRow(CONFIG.SHEETS.TESTIMONIALS, CONFIG.TESTIMONIAL_COLUMNS, rowData);
    return Utils.success(Utils.testimonialRowToApi(rowData), 'Testimonial created');
  }

  function update(id, body) {
    var existing = getById(id);
    if (!existing.success) return existing;
    var current = existing.data;

    var rowData = {
      'ID': id,
      'Name': body.name !== undefined ? Utils.sanitizeString(body.name) : current.name,
      'Text': body.text !== undefined ? Utils.sanitizeString(body.text) : current.text,
      'Rating': body.rating !== undefined ? Utils.parseNumber(body.rating) : current.rating,
      'Avatar': body.avatar !== undefined ? Utils.sanitizeString(body.avatar) : current.avatar,
      'Order': body.order !== undefined ? Utils.parseNumber(body.order) : current.order,
      'Hidden': body.hidden !== undefined ? Utils.parseBoolean(body.hidden) : current.hidden,
    };

    SheetsService.updateRow(CONFIG.SHEETS.TESTIMONIALS, CONFIG.TESTIMONIAL_COLUMNS, id, rowData);
    return Utils.success(Utils.testimonialRowToApi(rowData), 'Testimonial updated');
  }

  function remove(id) {
    getById(id);
    SheetsService.deleteRow(CONFIG.SHEETS.TESTIMONIALS, id);
    return Utils.success({ id: id }, 'Testimonial deleted');
  }

  return {
    listPublic: listPublic,
    listAdmin: listAdmin,
    getById: getById,
    create: create,
    update: update,
    remove: remove,
  };
})();
