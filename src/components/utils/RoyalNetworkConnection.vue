<script>
  import { translate } from "../../util/i18n";
  import { SocketManager } from "../../game/network/socket-manager";

  import MdCloudDone from 'md-svg-vue/dist/file/MdCloudDone.vue';
  import MdCloudOff from 'md-svg-vue/dist/file/MdCloudOff.vue';
  import MdCloudQueue from 'md-svg-vue/dist/file/MdCloudQueue.vue';
  import MdCloudDownload from 'md-svg-vue/dist/file/MdCloudDownload.vue';

  const connectionStates = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    RECONNECTING: 3
  };

  export default {
    name: 'royal-network-connection',

    components: {
      MdCloudDone,
      MdCloudOff,
      MdCloudQueue,
      MdCloudDownload
    },

    data: () => ({
      nonreactive: new Map(),
      connectState: connectionStates.DISCONNECTED,
      reconnectingAttempts: 0,

      showing: true,
      showingTimeout: null,
      transition: 'slide-y-transition',

      latency: 5,
      avgLatenciesNumber: 5,

      connectionStates
    }),

    methods: {
      clearAnimationTimeout () {
        if (this.showingTimeout) {
          clearTimeout( this.showingTimeout );
        }
      },

      setAnimationTimeout (timeoutDelay = 2000) {
        this.clearAnimationTimeout();
        this.showing = true;
        this.showingTimeout = setTimeout(_ => {
          this.showing = false;
        }, timeoutDelay);
      },

      onConnecting () {
        this.connectState = connectionStates.CONNECTING;
      },

      onConnection () {
        this.connectState = connectionStates.CONNECTED;
        this.setAnimationTimeout();
      },

      onReconnectAttempt (attempts) {
        this.connectState = connectionStates.RECONNECTING;
        this.reconnectingAttempts = attempts;
      },

      onDisconnect () {
        this.connectState = connectionStates.DISCONNECTED;
        this.reconnectingAttempts = 0;
        this.latency = 0;
      },

      updateLatency (ms) {
        if (!this.nonreactive.has( 'lastLatencies' )) {
          this.nonreactive.set( 'lastLatencies', [] );
        }
        const lastLatencies = this.nonreactive.get( 'lastLatencies' );
        lastLatencies.push( ms );
        if (lastLatencies.length > this.avgLatenciesNumber) {
          lastLatencies.splice( 0, lastLatencies.length - this.avgLatenciesNumber );
        }
        this.latency = Math.ceil(
          lastLatencies.reduce((sum, value) => sum + value, 0) / lastLatencies.length
        );
      }
    },

    computed: {
      classes () {
        return {
          'network-connection': true,
          'network-connection_ping': this.connectState === connectionStates.CONNECTED && !this.showing
        };
      },

      disconnectedText () {
        return translate( 'network_disconnected' );
      },

      connectingText () {
        return translate( 'network_connecting' );
      },

      connectedText () {
        return translate( 'network_connected' );
      },

      reconnectingText () {
        return translate( 'network_reconnecting', this.reconnectingAttempts );
      },

      latencyText () {
        return translate( 'network_latency', this.latency );
      }
    },

    watch: {
      connectState (newVal, oldVal) {
        this.transition = newVal > oldVal
          ? 'slide-y-reverse-transition'
          : 'slide-y-transition';
      }
    },

    mounted () {
      let io = SocketManager.getManager();

      io.on('connect', _ => this.onConnection());
      io.on('reconnect', _ => this.onConnection());
      io.on('disconnect', _ => this.onDisconnect());

      io.on('connecting', _ => this.onConnecting());
      io.on('reconnecting', attempts => this.onReconnectAttempt( attempts ));

      io.on('pong', ms => this.updateLatency( ms ));
    }
  };
</script>

<template>
  <div :class="classes">
    <div class="network-connection__inner">

      <transition name="slide-x-reverse-transition" mode="out-in">
        <div class="network-connection__states">
          <transition :name="transition" mode="out-in">
            <div class="network-connection__state" v-if="connectState === connectionStates.DISCONNECTED" key="disconnected">
              <md-cloud-off></md-cloud-off>
              <span class="network-connection__text">{{ disconnectedText }}</span>
            </div>

            <div class="network-connection__state" v-else-if="connectState === connectionStates.CONNECTING" key="connecting">
              <md-cloud-download></md-cloud-download>
              <span class="network-connection__text">{{ connectingText }}</span>
            </div>

            <div class="network-connection__state" v-else-if="connectState === connectionStates.CONNECTED && showing" key="connected">
              <md-cloud-done></md-cloud-done>
              <span class="network-connection__text">{{ connectedText }}</span>
            </div>

            <div class="network-connection__state" v-else-if="connectState === connectionStates.RECONNECTING" key="reconnecting">
              <md-cloud-queue></md-cloud-queue>
              <span class="network-connection__text">{{ reconnectingText }}</span>
            </div>

            <div class="network-connection__state" v-else key="latency">
              <span class="network-connection__text">{{ latencyText }}</span>
            </div>
          </transition>
        </div>
      </transition>

    </div>
  </div>
</template>

<style lang="scss">
  @import "../../styles/components/_network-connection";
</style>
