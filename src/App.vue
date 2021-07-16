<template>
  <v-app>
    <v-app-bar
        app
        color="black"
        dark
    >
      <div class="d-flex align-center">
        <router-link to="/" class="home-link">
          HyperVideo Visualization
        </router-link>
      </div>

      <v-spacer></v-spacer>

      <v-btn
          to="/about"
          text
      >
        <span class="mr-2">About</span>
<!--        <v-icon>mdi-open-in-new</v-icon>-->
      </v-btn>

    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style>
.home-link {
  text-display: none;
  text-decoration: none;
  /*font-size: 1rem;*/
  color: white !important;
  font-weight: bold;
}
</style>

<script>
import GraphVis from "./components/GraphVis";

export default {
  name: 'App',

  components: {
  },

  data: () => ({
  }),

  methods: {
    loadGraph: () => {

    }
  }
};
</script>

