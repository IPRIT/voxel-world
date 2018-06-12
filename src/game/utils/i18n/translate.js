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
  if (!targetLanguage) {
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
