/**
 * Princesses — API Entry Point
 *
 * Deploy as Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 */

function doGet(e) {
  try {
    e = e || { parameter: {} };
    var action = (e.parameter && e.parameter.action) || 'health';
    var result = Router.handleGet(action, e);
    return Utils.jsonOutput(result);
  } catch (err) {
    Logger.log('doGet error: ' + err.message);
    return Utils.jsonOutput(Utils.fail(err.message));
  }
}

function doPost(e) {
  try {
    e = e || { parameter: {}, postData: { contents: '{}' } };

    var action = (e.parameter && e.parameter.action) || '';
    var body = {};

    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }

    var method = body._method || (e.parameter && e.parameter.method) || 'POST';
    var result = Router.handlePost(action, method, e, body);
    return Utils.jsonOutput(result);
  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return Utils.jsonOutput(Utils.fail(err.message));
  }
}

/**
 * Test all endpoints from Apps Script editor (after setup).
 */
function testApi() {
  setup();

  Logger.log('--- GET dresses ---');
  Logger.log(JSON.stringify(DressesHandler.listPublic()));

  Logger.log('--- GET categories ---');
  Logger.log(JSON.stringify(CategoriesHandler.listPublic()));

  Logger.log('--- GET about ---');
  Logger.log(JSON.stringify(AboutHandler.getPublic()));

  Logger.log('--- Login ---');
  var login = Auth.login({ password: CONFIG.DEFAULT_ADMIN_PASSWORD });
  Logger.log(JSON.stringify(login));

  if (login.success) {
    Logger.log('--- Create dress ---');
    var dress = DressesHandler.create({
      name: 'فستان سهرة وردي',
      category: 'سهرة',
      color: 'وردي',
      price: 2500,
      featured: true,
      hidden: false,
      images: [],
    });
    Logger.log(JSON.stringify(dress));
  }

  Logger.log('API tests complete.');
}
