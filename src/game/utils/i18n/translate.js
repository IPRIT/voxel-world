import { detectLanguage } from "./detect-language";
import ru from './translations/ru-ru';
import en from './translations/en-us';
import { storage } from "../storage";

const STORAGE_KEY = 'settings:language';

let targetLanguage = null;

/**
 * @param {string} appTextId
 * @returns {string}
 */
export function translate (appTextId) {
  if (!targetLanguage && typeof window !== 'undefined') {
    targetLanguage = extractSetupLanguage() || detectLanguage();
    console.log( `[Language Detector] Target language is "${targetLanguage}".` );
  }
  let translation = getTranslation( targetLanguage );
  return translation[ appTextId ] || appTextId;
}

/**
 * @param {string} language
 * @returns {*}
 */
export function getTranslation (language) {
  // storage.setItem( STORAGE_KEY, 'ru' );
  const translations = { en, ru };
  return translations[ language ] || en;
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
