/**
 * Princesses — Categories Handler
 */

var CategoriesHandler = (function () {
  'use strict';

  function listPublic() {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.CATEGORIES);
    var categories = rows
      .map(Utils.categoryRowToApi)
      .filter(function (c) { return !c.hidden; })
      .sort(function (a, b) { return a.order - b.order; });
    return Utils.success(categories);
  }

  function listAdmin() {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.CATEGORIES);
    var categories = rows
      .map(Utils.categoryRowToApi)
      .sort(function (a, b) { return a.order - b.order; });
    return Utils.success(categories);
  }

  function getById(id) {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.CATEGORIES);
    var found = null;
    rows.forEach(function (row) {
      var item = Utils.categoryRowToApi(row);
      if (String(item.id) === String(id)) found = item;
    });
    if (!found) return Utils.fail('Category not found');
    return Utils.success(found);
  }

  function create(body) {
    var name = Utils.sanitizeString(body.name);
    if (!name) return Utils.fail('Category name is required');

    var rowData = {
      'ID': Utils.generateId(),
      'Name': name,
      'Slug': body.slug ? Utils.sanitizeString(body.slug) : Utils.slugify(name),
      'Icon': Utils.sanitizeString(body.icon),
      'Description': Utils.sanitizeString(body.description),
      'Order': Utils.parseNumber(body.order) || 0,
      'Hidden': Utils.parseBoolean(body.hidden),
    };

    SheetsService.appendRow(CONFIG.SHEETS.CATEGORIES, CONFIG.CATEGORY_COLUMNS, rowData);
    return Utils.success(Utils.categoryRowToApi(rowData), 'Category created');
  }

  function update(id, body) {
    var existing = getById(id);
    if (!existing.success) return existing;
    var current = existing.data;

    var rowData = {
      'ID': id,
      'Name': body.name !== undefined ? Utils.sanitizeString(body.name) : current.name,
      'Slug': body.slug !== undefined ? Utils.sanitizeString(body.slug) : current.slug,
      'Icon': body.icon !== undefined ? Utils.sanitizeString(body.icon) : current.icon,
      'Description': body.description !== undefined ? Utils.sanitizeString(body.description) : current.description,
      'Order': body.order !== undefined ? Utils.parseNumber(body.order) : current.order,
      'Hidden': body.hidden !== undefined ? Utils.parseBoolean(body.hidden) : current.hidden,
    };

    SheetsService.updateRow(CONFIG.SHEETS.CATEGORIES, CONFIG.CATEGORY_COLUMNS, id, rowData);
    return Utils.success(Utils.categoryRowToApi(rowData), 'Category updated');
  }

  function remove(id) {
    var existing = getById(id);
    if (!existing.success) return existing;
    SheetsService.deleteRow(CONFIG.SHEETS.CATEGORIES, id);
    return Utils.success({ id: id }, 'Category deleted');
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
