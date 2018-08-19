import { pluralize } from "../pluralize";

export default {
  'test': 'Привет, мир!',

  'critical_hit': 'Крит. уд.',
  'immunity': 'Иммун.',
  'miss': 'Промах',

  'mystic': 'Мистик',

  'player': 'Игроки',
  'animal': 'Мирные животные',
  'animal_deer': 'Олень',

  'network_disconnected': 'Ожидание подключения...',
  'network_connecting': 'Соединение с сервером...',
  'network_connected': 'Подключено',
  'network_reconnecting': attempts => {
    return `Переподключение... (${attempts} попытка)`;
  },
  'network_latency': ms => {
    return `Пинг: ${ms} мс`;
  },

  'quick_play': 'Быстрая игра',
  'resource_loading': 'Загрузка...',

  'social_sign_in_google': 'Войти через Google',
  'social_sign_in_facebook': 'Войти через Facebook',
  'social_sign_in_another': 'Войти под другим аккаунтом',
  'social_signing_in': 'Вход...',
  'social_continue_as': displayName => {
    return `Войти как ${displayName}`;
  }
};
