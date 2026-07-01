/**
 * Princesses — API Router
 */

var Router = (function () {
  'use strict';

  function handleGet(action, e) {
    var params = e.parameter || {};

    switch (action) {
      case 'dresses':
        return DressesHandler.listPublic();

      case 'dress':
        if (!params.id) return Utils.fail('Dress ID is required');
        return DressesHandler.getById(params.id, false);

      case 'admin/dresses':
        Auth.requireAuth(e, null);
        return DressesHandler.listAdmin();

      case 'categories':
        return CategoriesHandler.listPublic();

      case 'gallery':
        return GalleryHandler.listPublic();

      case 'testimonials':
        return TestimonialsHandler.listPublic();

      case 'about':
        return AboutHandler.getPublic();

      case 'health':
        return Utils.success({
          status: 'ok',
          timestamp: Utils.nowIso(),
          spreadsheetId: SheetsService.getSpreadsheetId(),
        });

      default:
        return Utils.fail('Unknown action: ' + action);
    }
  }

  function handlePost(action, method, e, body) {
    body = body || {};
    method = (method || 'POST').toUpperCase();
    var params = e.parameter || {};
    var id = params.id || body.id;

    /* Public: login */
    if (action === 'login') {
      return Auth.login(body);
    }

    /* Public health check via POST */
    if (action === 'health') {
      return Utils.success({ status: 'ok', timestamp: Utils.nowIso() });
    }

    /* All other POST actions require auth */
    Auth.requireAuth(e, body);

    switch (action) {
      case 'upload':
        return Utils.success(DriveService.uploadImage(body), 'Image uploaded');

      case 'dress':
        if (method === 'DELETE') return DressesHandler.remove(id);
        if (method === 'PUT') return DressesHandler.update(id, body);
        return DressesHandler.create(body);

      case 'category':
        if (method === 'DELETE') return CategoriesHandler.remove(id);
        if (method === 'PUT') return CategoriesHandler.update(id, body);
        return CategoriesHandler.create(body);

      case 'gallery':
        if (method === 'DELETE') return GalleryHandler.remove(id);
        if (method === 'PUT') return GalleryHandler.update(id, body);
        return GalleryHandler.create(body);

      case 'testimonial':
        if (method === 'DELETE') return TestimonialsHandler.remove(id);
        if (method === 'PUT') return TestimonialsHandler.update(id, body);
        return TestimonialsHandler.create(body);

      case 'about':
        if (method === 'PUT' || method === 'POST') return AboutHandler.update(body);
        return Utils.fail('Method not allowed for about');

      case 'change-password':
        return Auth.changePassword(body);

      default:
        return Utils.fail('Unknown action: ' + action);
    }
  }

  return {
    handleGet: handleGet,
    handlePost: handlePost,
  };
})();
