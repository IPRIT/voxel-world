<script>
  import RoyalButton from "./RoyalButton";

  import { GameConnection } from "../game/network/game-connection";
  import { PlayerEvents } from "../game/network/events";
  import { CharactersMapReverted } from "../game/dictionary";
  import { capitalizeFirstLetter } from "../util/common-utils";

  import { createNamespacedHelpers } from 'vuex';
  import { ensureNumber } from "../game/utils";
  import { translate } from "../util/i18n";

  const uiStore = createNamespacedHelpers( 'ui' );

  export default {
    name: 'royal-character-selector',

    components: {
      RoyalButton
    },

    data () {
      return {
        heroes: this.getHeroes()
      };
    },

    methods: {
      getHeroes () {
        return Object.keys( CharactersMapReverted ).map(id => {
          return {
            id: ensureNumber( id ),
            type: CharactersMapReverted[ id ],
            name: translate( CharactersMapReverted[ id ] )
          };
        });
      },

      select (hero) {
        const gameConnection = GameConnection.getConnection();
        const { dispatch } = this.$store;
        const { socket } = gameConnection;

        socket && socket.emit( PlayerEvents.CHARACTER_SELECTED, hero.id );
        dispatch( 'ui/setCharacterSelectorState', false );
      }
    },

    computed: {
      ...uiStore.mapState({
        characterSelectorActive: state => state.characterSelectorActive
      }),

      classes () {
        return {
          'character-selector': true
        };
      }
    },

    mounted () {
      const gameConnection = GameConnection.getConnection();
      const { dispatch } = this.$store;

      gameConnection.on(PlayerEvents.SELECT_CHARACTER, _ => {
        dispatch( 'ui/setCharacterSelectorState', true );
      });
    }
  };
</script>

<template>
  <transition name="fade-transition">
    <div :class="classes" v-if="characterSelectorActive" key="active">
      <div class="character-selector__inner">
        <h2>Character Selector</h2>
        <RoyalButton v-for="hero in heroes" @click="select( hero )" :key="hero.id">{{ hero.name }}</RoyalButton>
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
  @import "../styles/components/character-selector";
</style>
