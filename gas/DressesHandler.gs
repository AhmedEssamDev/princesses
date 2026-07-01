/**
 * Princesses — Dresses Handler
 */

var DressesHandler = (function () {
  'use strict';

  var CACHE_KEY = 'dresses';

  function listPublic() {
    return listAll(false);
  }

  function listAdmin() {
    return listAll(true);
  }

  function listAll(includeHidden) {
    var cache = CacheService.getScriptCache();
    var cacheKey = CACHE_KEY + (includeHidden ? '_admin' : '_public');
    var cached = cache.get(cacheKey);

    if (cached) {
      return Utils.success(JSON.parse(cached));
    }

    var rows = SheetsService.getAllRows(CONFIG.SHEETS.DRESSES);
    var dresses = rows
      .map(Utils.dressRowToApi)
      .filter(function (d) {
        return includeHidden || !d.hidden;
      })
      .sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    cache.put(cacheKey, JSON.stringify(dresses), CONFIG.CACHE_TTL_SECONDS);
    return Utils.success(dresses);
  }

  function getById(id, includeHidden) {
    var rows = SheetsService.getAllRows(CONFIG.SHEETS.DRESSES);
    var dress = null;

    rows.forEach(function (row) {
      var item = Utils.dressRowToApi(row);
      if (String(item.id) === String(id)) dress = item;
    });

    if (!dress) return Utils.fail('Dress not found', null);
    if (!includeHidden && dress.hidden) return Utils.fail('Dress not found', null);

    return Utils.success(dress);
  }

  function create(body) {
    var rowData = Utils.dressPayloadToRow(body, false);
    SheetsService.appendRow(CONFIG.SHEETS.DRESSES, CONFIG.DRESS_COLUMNS, rowData);
    invalidateCache_();
    return Utils.success(Utils.dressRowToApi(rowData), 'Dress created');
  }

  function update(id, body) {
    var existing = getById(id, true);
    if (!existing.success) return existing;

    var current = existing.data;
    var merged = {
      id: id,
      name: body.name !== undefined ? body.name : current.name,
      category: body.category !== undefined ? body.category : current.category,
      color: body.color !== undefined ? body.color : current.color,
      price: body.price !== undefined ? body.price : current.price,
      fabricType: body.fabricType !== undefined ? body.fabricType : current.fabricType,
      estimatedFabric: body.estimatedFabric !== undefined ? body.estimatedFabric : current.estimatedFabric,
      estimatedDuration: body.estimatedDuration !== undefined ? body.estimatedDuration : current.estimatedDuration,
      sizes: body.sizes !== undefined ? body.sizes : current.sizes,
      notes: body.notes !== undefined ? body.notes : current.notes,
      images: body.images !== undefined ? body.images : current.images,
      featured: body.featured !== undefined ? body.featured : current.featured,
      hidden: body.hidden !== undefined ? body.hidden : current.hidden,
      createdAt: current.createdAt,
    };

    var rowData = Utils.dressPayloadToRow(merged, true);
    SheetsService.updateRow(CONFIG.SHEETS.DRESSES, CONFIG.DRESS_COLUMNS, id, rowData);
    invalidateCache_();
    return Utils.success(Utils.dressRowToApi(rowData), 'Dress updated');
  }

  function remove(id) {
    var existing = getById(id, true);
    if (!existing.success) return existing;

    var images = existing.data.images || [];
    SheetsService.deleteRow(CONFIG.SHEETS.DRESSES, id);
    invalidateCache_();

    return Utils.success({ id: id, deletedImages: images.length }, 'Dress deleted');
  }

  function invalidateCache_() {
    var cache = CacheService.getScriptCache();
    cache.remove(CACHE_KEY + '_public');
    cache.remove(CACHE_KEY + '_admin');
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
