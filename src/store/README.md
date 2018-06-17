# Vuex Store

Эта директория содержит файлы Vuex Store.
Vuex Store вшит в Nuxt.js и ждет активации
([Activate Vuex Store](https://nuxtjs.org/guide/vuex-store#activate-the-store)).
Создание index.js в этой папке автоматически активирует Vuex Store.

## 1. Ресурсы

1. Nuxt Vuex https://nuxtjs.org/guide/vuex-store
2. Vuex official docs https://vuex.vuejs.org/en/intro.html

## 2. Структура директории

Префикс у глобальных файлов добавлен, чтобы в IDE они были всегда
отделены сверху и сгруппированы.

```
└── store
    ├── index.js          # содержит глобальный store.
    ├── _actions.js        # actions (глобальные)
    ├── _mutations.js      # mutations (глобальные)
    ├── _getters.js        # getters (глобальные)
    │
    ├── users.js          # экспорт модуля users (обязательно для Nuxt Vuex)
    ├── users
    │   ├── index.js      # state модуля users
    │   ├── actions.js    # actions модуля users
    │   ├── mutations.js  # mutations модуля users
    │   └── getters.js    # getters модуля users
    │
    ├── vacancies.js      # экспорт модуля vacancies (обязательно для Nuxt Vuex)
    ├── vacancies
    │   ├── index.js      # state модуля vacancies
    │   ├── actions.js    # actions модуля vacancies
    │   ├── mutations.js  # mutations модуля vacancies
    │   └── getters.js    # getters модуля vacancies
    │
    ├── companies.js      # экспорт модуля companies (обязательно для Nuxt Vuex)
    ├── companies
    │   ├── index.js      # state модуля companies
    │   └── ...
    ...
```

## 3. Правила наименования

1. Именования mutations и actions по примеру: https://vuejs.org/v2/style-guide/#Non-flux-state-management-use-with-caution.
В компонентах используем по возможности mapState, mapActions, mapMutations.

... todo

***More information about the usage of this
directory in the documentation: https://nuxtjs.org/guide/vuex-store***
