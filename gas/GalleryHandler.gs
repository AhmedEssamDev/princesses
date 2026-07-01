/**
 * Princesses — Gallery Handler
 */

var GalleryHandler = (function () {
  'use strict';

  function listPublic() {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.GALLERY);
    var items = rows
      .map(Utils.galleryRowToApi)
      .filter(function (g) { return !g.hidden && g.imageUrl; })
      .sort(function (a, b) { return a.order - b.order; });
    return Utils.success(items);
  }

  function listAdmin() {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.GALLERY);
    var items = rows
      .map(Utils.galleryRowToApi)
      .sort(function (a, b) { return a.order - b.order; });
    return Utils.success(items);
  }

  function getById(id) {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.GALLERY);
    var found = null;
    rows.forEach(function (row) {
      var item = Utils.galleryRowToApi(row);
      if (String(item.id) === String(id)) found = item;
    });
    if (!found) return Utils.fail('Gallery item not found');
    return Utils.success(found);
  }

  function create(body) {
    if (!body.imageUrl && !body.image) {
      return Utils.fail('Image URL is required');
    }

    var rowData = {
      'ID': Utils.generateId(),
      'Title': Utils.sanitizeString(body.title),
      'Image URL': body.imageUrl || body.image || '',
      'Order': Utils.parseNumber(body.order) || 0,
      'Hidden': Utils.parseBoolean(body.hidden),
      'Created At': Utils.nowIso(),
    };

    SheetsService.appendRow(CONFIG.SHEETS.GALLERY, CONFIG.GALLERY_COLUMNS, rowData);
    return Utils.success(Utils.galleryRowToApi(rowData), 'Gallery item created');
  }

  function update(id, body) {
    var existing = getById(id);
    if (!existing.success) return existing;
    var current = existing.data;

    var rowData = {
      'ID': id,
      'Title': body.title !== undefined ? Utils.sanitizeString(body.title) : current.title,
      'Image URL': body.imageUrl !== undefined ? body.imageUrl : current.imageUrl,
      'Order': body.order !== undefined ? Utils.parseNumber(body.order) : current.order,
      'Hidden': body.hidden !== undefined ? Utils.parseBoolean(body.hidden) : current.hidden,
      'Created At': current.createdAt,
    };

    SheetsService.updateRow(CONFIG.SHEETS.GALLERY, CONFIG.GALLERY_COLUMNS, id, rowData);
    return Utils.success(Utils.galleryRowToApi(rowData), 'Gallery item updated');
  }

  function remove(id) {
    getById(id);
    SheetsService.deleteRow(CONFIG.SHEETS.GALLERY, id);
    return Utils.success({ id: id }, 'Gallery item deleted');
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
