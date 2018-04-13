import VueRouter from 'vue-router';
import Game from './Game';

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Welcome to THREE.js',
      component: Game
    },
    { path: '*', redirect: '/' }
  ]
});

export default router;
