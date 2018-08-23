export const LanguageType = {
  EN: [ 'en', 'us', 'en-us', 'en-uk' ],
  RU: [ 'ru', 'ru-ru' ]
};

export const defaultLanguage = 'en';

/**
 * @returns {string}
 */
export function detectLanguage () {
  if (!window || !window.navigator) {
    return defaultLanguage;
  }

  let navigator = window.navigator;
  let priorityUserLanguages = navigator.languages;
  let browserLanguage = navigator.language;
  let languageString = Array.isArray( priorityUserLanguages ) && priorityUserLanguages.length > 0
    ? priorityUserLanguages[0]
    : browserLanguage;

  let languageType = getLanguageType( languageString );
  return languageType && languageType[0] || defaultLanguage;
}

/**
 * @param {string} languageString
 * @returns {*}
 */
function getLanguageType (languageString) {
  for (let languageTypeString of Object.keys( LanguageType )) {
    if (isLanguageTypesEqual( LanguageType[ languageTypeString ], languageString )) {
      return LanguageType[ languageTypeString ];
    }
  }
}

/**
 * @param {Array<string>|string} languageType1
 * @param {Array<string>|string} languageType2
 * @returns {boolean}
 */
function isLanguageTypesEqual(languageType1, languageType2) {
  languageType1 = [].concat( languageType1 );
  languageType2 = [].concat( languageType2 );
  return languageType1.some(language1 => {
    return languageType2.map(language2 => language2.toLowerCase())
      .indexOf( language1.toLowerCase() ) >= 0;
  });
}
