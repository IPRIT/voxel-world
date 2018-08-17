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

  'resource_loading': 'Идет загрузка...'
};
