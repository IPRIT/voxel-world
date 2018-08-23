import { detectLanguage } from "./detect-language";
import en from './translations/en-us';
import ru from './translations/ru-ru';
import { storage } from "../storage";

const STORAGE_KEY = 'settings:language';

const availableTranslations = { en, ru };

let targetLanguage = null;

// debug
if (typeof window !== 'undefined') {
  window.toLang = (lang = 'ru') => {
    storage.setItem( STORAGE_KEY, lang );
  };
}

/**
 * @param {string} appTextId
 * @param {Object|any} params
 * @returns {string}
 */
export function translate (appTextId, params = null) {
  if (!targetLanguage && typeof window !== 'undefined') {
    targetLanguage = extractSetupLanguage() || detectLanguage();
    console.log( `[Language Detector] Target language is "${targetLanguage}".` );
  }
  const dictionary = getLanguageDictionary( targetLanguage );
  const translation = dictionary[ appTextId ] || appTextId;

  if (typeof translation === 'function') {
    return translation( params );
  }

  return translation;
}

/**
 * @param {string} language
 * @returns {*}
 */
export function getLanguageDictionary (language) {
  return availableTranslations[ language ] || en;
}

/**
 * @returns {string|null}
 */
export function extractSetupLanguage () {
  return storage.getItem( STORAGE_KEY );
}

/**
 * Updates cached language
 */
export function updateTargetLanguage () {
  targetLanguage = extractSetupLanguage() || detectLanguage();
}
