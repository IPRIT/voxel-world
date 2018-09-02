import { pluralize } from "../pluralize";

export default {
  'test': 'Hello world',

  // game
  'critical_hit': 'Critical',
  'immunity': 'Resist',
  'miss': 'Miss',

  'mystic': 'Mystic',

  'player': 'Player',
  'animal': 'Animal',
  'animal_deer': 'Deer',

  // ui
  'network_disconnected': 'Waiting for connection...',
  'network_connecting': 'Connecting...',
  'network_connected': 'Connected',
  'network_reconnecting': attempts => {
    return `Reconnecting... (${attempts} attempt${attempts > 1 ? 's' : ''})`;
  },
  'network_latency': ms => {
    return `Latency: ${ms} ms`;
  },
  'loading': 'Loading...',
  'cancel': 'Cancel',
  'resource_loading': 'Loading...',

  // menu
  'signed_in_as': 'Signed in as',
  'nickname_input_placeholder': 'Enter a nickname',
  'quick_play': 'Quick play',
  'queue_searching': 'Searching for players...',

  // social buttons
  'social_sign_in_google': 'Save your progress with Google',
  'social_sign_in_facebook': 'Save your progress with Facebook',
  'social_sign_in_another': 'Sign in with another account',
  'social_signing_in': 'Signing in...',
  'social_continue_as': 'Continue as'
};
