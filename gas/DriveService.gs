/**
 * Princesses — Google Drive Service (Image uploads)
 */

var DriveService = (function () {
  'use strict';

  function getRootFolderId() {
    var cfg = getScriptConfig_();
    if (cfg.driveRootId) return cfg.driveRootId;

    var folders = DriveApp.getFoldersByName(CONFIG.DRIVE_ROOT_FOLDER);
    if (folders.hasNext()) {
      var id = folders.next().getId();
      saveScriptConfig_('DRIVE_ROOT_ID', id);
      return id;
    }
    return null;
  }

  function getRootFolder() {
    var id = getRootFolderId();
    if (!id) throw new Error('Drive folder not initialized. Run setup() first.');
    return DriveApp.getFolderById(id);
  }

  function initialize() {
    if (getRootFolderId()) {
      ensureSubfolders_();
      return getRootFolderId();
    }

    var root = DriveApp.createFolder(CONFIG.DRIVE_ROOT_FOLDER);
    saveScriptConfig_('DRIVE_ROOT_ID', root.getId());
    ensureSubfolders_();
    return root.getId();
  }

  function ensureSubfolders_() {
    var root = getRootFolder();
    ['dresses', 'gallery', 'testimonials'].forEach(function (name) {
      getOrCreateSubfolder_(root, name);
    });
  }

  function getOrCreateSubfolder_(parent, name) {
    var folders = parent.getFoldersByName(name);
    if (folders.hasNext()) return folders.next();
    return parent.createFolder(name);
  }

  function getSubfolder(path) {
    var parts = path.split('/').filter(Boolean);
    var folder = getRootFolder();

    parts.forEach(function (part) {
      folder = getOrCreateSubfolder_(folder, part);
    });

    return folder;
  }

  /**
   * Upload a base64-encoded image to Drive.
   * @param {Object} body — { fileName, mimeType, data, folder }
   */
  function uploadImage(body) {
    if (!body || !body.data) throw new Error('Image data is required');

    var fileName = body.fileName || ('image-' + Date.now() + '.jpg');
    var mimeType = body.mimeType || 'image/jpeg';
    var folderPath = body.folder || 'gallery';
    var folder = getSubfolder(folderPath);

    var base64Data = body.data;
    if (base64Data.indexOf(',') !== -1) {
      base64Data = base64Data.split(',')[1];
    }

    var bytes = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(bytes, mimeType, fileName);
    var file = folder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      id: file.getId(),
      name: file.getName(),
      url: getPublicUrl_(file),
      thumbnailUrl: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1000',
    };
  }

  function getPublicUrl_(file) {
    return 'https://drive.google.com/uc?export=view&id=' + file.getId();
  }

  function deleteFile(fileId) {
    if (!fileId) return false;
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
      return true;
    } catch (e) {
      return false;
    }
  }

  function deleteFiles(fileIds) {
    if (!fileIds || !fileIds.length) return;
    fileIds.forEach(function (id) {
      deleteFile(id);
    });
  }

  return {
    initialize: initialize,
    getRootFolderId: getRootFolderId,
    uploadImage: uploadImage,
    deleteFile: deleteFile,
    deleteFiles: deleteFiles,
    getSubfolder: getSubfolder,
  };
})();
