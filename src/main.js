import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueVideoPlayer from 'vue-video-player'
// require videojs style
import 'video.js/dist/video-js.css'

import router from './router'
// import 'vue-video-player/src/custom-theme.css'

Vue.use(VueVideoPlayer, /* {
  options: global default options,
  events: global videojs events
} */)

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
