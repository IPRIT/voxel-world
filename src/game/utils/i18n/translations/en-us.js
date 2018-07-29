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
    return `Ping: ${ms} ms`;
  },
};
