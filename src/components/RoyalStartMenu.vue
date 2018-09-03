<script>
  import RoyalButton from "./RoyalButton";
  import RoyalSocialAuth from "./RoyalSocialAuth";

  import { createNamespacedHelpers } from 'vuex';
  import { translate } from "../util/i18n";

  const userStore = createNamespacedHelpers( 'user' );
  const queueStore = createNamespacedHelpers( 'queue' );

  export default {
    name: 'royal-start-menu',

    components: {
      RoyalButton,
      RoyalSocialAuth
    },

    data: () => ({
      gameType: 'quick',
      region: 'eu'
    }),

    methods: {
      async fetchMe () {
        if (!this.token) {
          return;
        }
        const { dispatch } = this.$store;
        return dispatch( 'user/fetchMe' );
      },

      async issueGuestToken () {
        const { dispatch } = this.$store;
        if (this.token) {
          return;
        }

        return dispatch( 'user/authenticate', {
          provider: 'guest',
          params: {
            userNickname: this.nickname
          }
        });
      },

      prepareQueueOptions (gameType = 'quick', region = 'eu') {
        return {
          authToken: this.token,
          gameType,
          region,
          nickname: this.nickname
        };
      },

      async startQueue (gameType = 'quick') {
        this.gameType = gameType;

        if (!this.token) {
          await this.issueGuestToken();
          await this.fetchMe();
        }
        console.log( 'Start quick play with token:', this.token );

        const { dispatch } = this.$store;

        const queueOptions = this.prepareQueueOptions( this.gameType, this.region );
        return dispatch( 'queue/findServer', queueOptions ).then(server => {
          this.cancelQueue();
        });
      },

      cancelQueue () {
        const { dispatch } = this.$store;
        dispatch( 'queue/stop' );
      },

      signOut () {
        if (this.queueActive) {
          this.cancelQueue();
        }

        const { dispatch } = this.$store;
        dispatch( 'user/resetSession' );
      }
    },

    computed: {
      ...userStore.mapState({
        token: state => state.token,
        me: state => state.me
      }),

      ...queueStore.mapState({
        queueActive: state => state.queueActive,
        queueParams: state => state.queueParams
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

      cancelText () {
        return translate( 'cancel' );
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

      <div class="start-menu__account" v-if="me && !me.isGuest">
        {{ signedInText }} {{ me.displayName }}
        <div>
          <a @click="signOut">Выйти</a>
        </div>
      </div>

      <div class="start-menu__queue-status" v-show="queueActive">
        {{ queueText }}
        <a @click="cancelQueue">{{ cancelText }}</a>
      </div>

      <div class="start-menu__auth" v-if="!queueActive">
        <div class="start-menu__nickname">
          <input type="text"
                 class="start-menu__nickname-input"
                 v-model="nickname"
                 :placeholder="nicknameInputPlaceholder"
                 :disabled="queueActive">
        </div>
        <div class="start-menu__divider"></div>
      </div>

      <div class="start-menu__menu-buttons">
        <RoyalButton class="start-menu__menu-button start-menu__menu-button_quick"
                     @click="startQueue('quick')"
                     :disabled="queueActive">{{ queueActive ? queueText : quickPlayText }}</RoyalButton>
      </div>

      <div v-if="( !me || me.isGuest ) && !queueActive">
        <div class="start-menu__divider"></div>
        <RoyalSocialAuth class="start-menu__social-auth"/>
      </div>

    </div>

  </div>
</template>

<style lang="scss">
  @import "../styles/components/start-menu";
</style>
