export default {
  'test': 'Привет, мир!',

  // game
  'critical_hit': 'Крит. уд.',
  'immunity': 'Иммун.',
  'miss': 'Промах',

  // characters
  'mystic': 'Мистик',
  'warrior': 'Воин',
  'archer': 'Лучник',

  // living objects
  'player': 'Игрок',
  'animal': 'Дружелюбный',
  'offensive': 'Недружелюбный',

  // animals
  'animal_deer': 'Олень',

  // ui
  'network_disconnected': 'Ожидание подключения...',
  'network_connecting': 'Соединение с сервером...',
  'network_connected': 'Подключено',
  'network_reconnecting': attempts => {
    return `Переподключение... (${attempts} попытка)`;
  },
  'network_latency': ms => {
    return `Пинг: ${ms} мс`;
  },
  'loading': 'Загрузка...',
  'cancel': 'Отмена',
  'resource_loading': 'Загрузка...',

  // menu
  'signed_in_as': 'Вы вошли как',
  'nickname_input_placeholder': 'Введите никнейм',
  'quick_play': 'Быстрая игра',
  'queue_searching': 'Поиск игроков...',

  // social buttons
  'social_sign_in_google': 'Привязать аккаунт к Google',
  'social_sign_in_facebook': 'Привязать аккаунт к Facebook',
  'social_sign_in_another': 'Войти под другим аккаунтом',
  'social_signing_in': 'Вход...',
  'social_continue_as': 'Продолжить как'
};
