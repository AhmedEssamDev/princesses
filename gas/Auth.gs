/**
 * Princesses — Authentication
 */

var Auth = (function () {
  'use strict';

  var SETTINGS_KEYS = {
    PASSWORD_HASH: 'admin_password_hash',
    PASSWORD_SALT: 'admin_password_salt',
    SESSION_SECRET: 'session_secret',
  };

  function initializeAdminPassword(plainPassword) {
    var sheet = SheetsService.getSheet(CONFIG.SHEETS.SETTINGS);
    var existing = SheetsService.getSetting(SETTINGS_KEYS.PASSWORD_HASH);
    if (existing) return;

    var salt = Utilities.getUuid();
    var hash = hashPassword(plainPassword, salt);

    SheetsService.setSetting(SETTINGS_KEYS.PASSWORD_SALT, salt);
    SheetsService.setSetting(SETTINGS_KEYS.PASSWORD_HASH, hash);
    SheetsService.setSetting(SETTINGS_KEYS.SESSION_SECRET, Utilities.getUuid());
  }

  function hashPassword(password, salt) {
    var raw = salt + '::' + password;
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
    return Utilities.base64Encode(digest);
  }

  function verifyPassword(password) {
    var salt = SheetsService.getSetting(SETTINGS_KEYS.PASSWORD_SALT);
    var storedHash = SheetsService.getSetting(SETTINGS_KEYS.PASSWORD_HASH);
    if (!salt || !storedHash) return false;
    return hashPassword(password, salt) === storedHash;
  }

  function getSessionSecret() {
    var secret = SheetsService.getSetting(SETTINGS_KEYS.SESSION_SECRET);
    if (!secret) {
      secret = Utilities.getUuid();
      SheetsService.setSetting(SETTINGS_KEYS.SESSION_SECRET, secret);
    }
    return secret;
  }

  function createToken() {
    var expiresAt = Date.now() + CONFIG.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;
    var payload = expiresAt + '.' + Utilities.getUuid();
    var signature = sign(payload);
    return {
      token: payload + '.' + signature,
      expires: new Date(expiresAt).toISOString(),
    };
  }

  function sign(payload) {
    var raw = payload + '.' + getSessionSecret();
    var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
    return Utilities.base64EncodeWebSafe(digest);
  }

  function validateToken(token) {
    if (!token || typeof token !== 'string') return false;

    var parts = token.split('.');
    if (parts.length !== 3) return false;

    var expiresAt = Number(parts[0]);
    var payload = parts[0] + '.' + parts[1];
    var signature = parts[2];

    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;
    return sign(payload) === signature;
  }

  function requireAuth(e, body) {
    var token = Utils.getTokenFromRequest(e, body);
    if (!validateToken(token)) {
      throw new Error('Unauthorized — invalid or expired token');
    }
    return true;
  }

  function checkRateLimit(identifier) {
    var cache = CacheService.getScriptCache();
    var key = 'login_attempts_' + identifier;
    var attempts = Number(cache.get(key) || 0);

    if (attempts >= CONFIG.LOGIN_RATE_LIMIT) {
      throw new Error('Too many login attempts. Try again later.');
    }

    cache.put(key, String(attempts + 1), CONFIG.LOGIN_RATE_WINDOW_SECONDS);
  }

  function clearRateLimit(identifier) {
    CacheService.getScriptCache().remove('login_attempts_' + identifier);
  }

  function login(body) {
    var password = body && body.password;
    if (!password) return Utils.fail('Password is required');

    checkRateLimit('admin');

    if (!verifyPassword(password)) {
      return Utils.fail('Invalid password');
    }

    clearRateLimit('admin');
    var session = createToken();
    return Utils.success(session, 'Login successful');
  }

  function changePassword(body) {
    requireAuth({}, body);
    var newPassword = body && body.newPassword;
    if (!newPassword || newPassword.length < 8) {
      return Utils.fail('New password must be at least 8 characters');
    }

    var salt = Utilities.getUuid();
    var hash = hashPassword(newPassword, salt);
    SheetsService.setSetting(SETTINGS_KEYS.PASSWORD_SALT, salt);
    SheetsService.setSetting(SETTINGS_KEYS.PASSWORD_HASH, hash);

    return Utils.success(null, 'Password updated');
  }

  return {
    initializeAdminPassword: initializeAdminPassword,
    login: login,
    changePassword: changePassword,
    requireAuth: requireAuth,
    validateToken: validateToken,
    createToken: createToken,
  };
})();
