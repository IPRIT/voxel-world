<script>
  import RoyalButton from "./RoyalButton";
  import RoyalSocialAuth from "./RoyalSocialAuth";

  import { translate } from "../util/i18n";
  import { createNamespacedHelpers } from 'vuex';
  import { QueueManager } from "../game/network/queue-manager";

  const userStore = createNamespacedHelpers( 'user' );

  export default {
    name: 'royal-start-menu',

    components: {
      RoyalButton,
      RoyalSocialAuth
    },

    data: () => ({
      isQueueStarted: false
    }),

    methods: {
      async startQuickPlay () {
        const { dispatch } = this.$store;
        if (!this.token) {
          await dispatch( 'user/authenticate', {
            provider: 'guest',
            params: {
              userNickname: this.nickname
            }
          });
        }
        console.log( 'Start quick play with:', this.token );

        this.isQueueStarted = true;

        const queue = new QueueManager();
        return queue.joinQueue({
          authToken: this.token,
          gameType: 'quick',
          nickname: this.nickname
        }).then(_ => {
          console.log('connected to queue');
        }).catch(_ => {
          this.isQueueStarted = false;
        });
      },

      signOut () {
        const { dispatch } = this.$store;
        dispatch( 'user/resetSession' );
      }
    },

    computed: {
      ...userStore.mapState({
        token: state => state.token,
        me: state => state.me
      }),

      nickname: {
        get () {
          return this.$store.state.user.nickname;
        },
        set (value) {
          const { dispatch } = this.$store;
          dispatch( 'user/setNickname', value );
        }
      },

      quickPlayText () {
        return translate( 'quick_play' );
      },

      queueText () {
        return translate( 'queue_searching' );
      },

      nicknameInputPlaceholder () {
        return translate( 'nickname_input_placeholder' );
      },

      signedInText () {
        return translate( 'signed_in_as' );
      }
    }
  };
</script>

<template>
  <div class="start-menu">

    <div class="start-menu__logo">
      <div style="font-size: 125px;">Voxel</div>
      <div>Royal</div>
    </div>

    <div class="start-menu__menu">

      <div class="start-menu__queue-status" v-show="isQueueStarted">
        {{ queueText }}
      </div>

      <div class="start-menu__account" v-if="me && !me.isGuest">
        {{ signedInText }} {{ me.displayName }}
        <div>
          <a @click="signOut">Выйти</a>
        </div>
      </div>

      <div class="start-menu__auth">
        <div class="start-menu__nickname">
          <input type="text"
                 class="start-menu__nickname-input"
                 v-model="nickname"
                 :placeholder="nicknameInputPlaceholder"
                 :disabled="isQueueStarted">
        </div>
      </div>

      <div class="start-menu__divider"></div>

      <div class="start-menu__menu-buttons">
        <RoyalButton class="start-menu__menu-button start-menu__menu-button_quick"
                     @click="startQuickPlay"
                     :disabled="isQueueStarted">{{ quickPlayText }}</RoyalButton>
      </div>

      <transition name="fade-transition" mode="out-in">
        <div v-if="!me || me.isGuest" key="has-me">
          <div class="start-menu__divider"></div>
          <RoyalSocialAuth class="start-menu__social-auth"/>
        </div>
      </transition>

    </div>

  </div>
</template>

<style lang="scss">
  @import "../styles/components/start-menu";
</style>
