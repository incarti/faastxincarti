import i18n from 'i18next'
import LngDetector from 'i18next-browser-languagedetector'
import Cache from 'i18next-localstorage-cache'
import XHR from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'

import * as en from '../locales/en/translations.app.json'
import * as es from '../locales/es/translations.app.json'
import * as ja from '../locales/ja/translations.app.json'
import * as ru from '../locales/ru/translations.app.json'
import * as zh from '../locales/zh/translations.app.json'
import * as pt from '../locales/pt/translations.app.json'
import * as de from '../locales/de/translations.app.json'
import * as fr from '../locales/fr/translations.app.json'

const options = {
  ns: ['translations'],
  defaultNS: 'translations',

  resources: {
    en: { translations: en },
    es: { translations: es },
    ja: { translations: ja },
    ru: { translations: ru },
    zh: { translations: zh },
    pt: { translations: pt },
    de: { translations: de },
    fr: { translations: fr }
  },

  saveMissing: false,

  detection: {
    order: ['querystring', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
    lookupQuerystring: 'lng',
    lookupLocalStorage: 'i18nextLng',
  },

  react: {
    wait: true,
    bindI18n: 'languageChanged loaded',
    bindStore: true,
    nsMode: 'default',
    hashTransKey: function(defaultValue) {
      throw new Error(`Missing i18nKey prop on Trans component surrounding "${defaultValue}"`)
    }
  },

  interpolation: {
    escapeValue: false // not needed for react!!
  },

  cache: {
    // turn on in production
    enabled: false, // !config.isDev,

    // prefix for stored languages
    prefix: 'i18next_res_',

    // Contrary to cookies behavior, the cache will respect updates to expirationTime.
    // If you set 7 days and later update to 10 days, the cache will persist for 10 days
    expirationTime: (1 * 24 * 60 * 60 * 1000), // 1 day

    // Passing in a versions object (ex.: versions: { en: 'v1.2', fr: 'v1.1' }) will give
    // you control over the cache based on translations version. This setting works along
    // expirationTime, so a cached translation will still expire even though the version
    // did not change. You can still set expirationTime far into the future to avoid this.
    versions: {}
  },
}

// if (process.env.NODE_ENV === 'development') {  
//   i18n.use(require('locize-editor'))
// }

i18n
  .use(initReactI18next)
  .use(Cache)
  .use(XHR)
  .use(LngDetector)
  .init(options)

export default i18n