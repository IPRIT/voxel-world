import { pluralize } from "../pluralize";

export default {
  'test': 'Hello world',

  'critical_hit': 'Critical',
  'immunity': 'Resist',
  'miss': 'Miss',

  'mystic': 'Mystic',

  'player': 'Player',
  'animal': 'Animal',
  'animal_deer': 'Deer',

  'network_disconnected': 'Waiting for connection...',
  'network_connecting': 'Connecting...',
  'network_connected': 'Connected',
  'network_reconnecting': attempts => {
    return `Reconnecting... (${attempts} attempt${attempts > 1 ? 's' : ''})`;
  },
  'network_latency': ms => {
    return `Latency: ${ms} ms`;
  },

  'quick_play': 'Quick play',
  'resource_loading': 'Loading...',

  'social_sign_in_google': 'Continue with Google',
  'social_sign_in_facebook': 'Continue with Facebook',
  'social_sign_in_another': 'Sign in with another account',
  'social_signing_in': 'Signing in...',
  'social_continue_as': displayName => {
    return `Continue as ${displayName}`;
  }
};
