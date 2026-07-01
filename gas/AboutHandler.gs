/**
 * Princesses — About Page Handler
 */

var AboutHandler = (function () {
  'use strict';

  function getPublic() {
    var content = SheetsService.getAboutContent();
    var parsed = parseAboutContent_(content);
    return Utils.success(parsed);
  }

  function update(body) {
    var updated = SheetsService.updateAboutContent(body);
    return Utils.success(parseAboutContent_(updated), 'About page updated');
  }

  function parseAboutContent_(content) {
    return {
      heroTitle: content.heroTitle || '',
      heroSubtitle: content.heroSubtitle || '',
      story: content.story || '',
      vision: content.vision || '',
      mission: content.mission || '',
      values: Utils.parseJson(content.values, []),
      experience: content.experience || '',
      quality: content.quality || '',
      customerSatisfaction: content.customerSatisfaction || '',
      updatedAt: content.updatedAt || '',
    };
  }

  return {
    getPublic: getPublic,
    update: update,
  };
})();
