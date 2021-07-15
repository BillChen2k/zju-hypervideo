<template>
  <v-app>
    <v-app-bar
      app
      color="black"
      dark
    >
      <div class="d-flex align-center">
       HyperVideo Visualization
      </div>

      <v-spacer></v-spacer>

<!--      <v-btn-->
<!--        href="https://github.com/vuetifyjs/vuetify/releases/latest"-->
<!--        target="_blank"-->
<!--        text-->
<!--      >-->
<!--        <span class="mr-2">Latest Release</span>-->
<!--        <v-icon>mdi-open-in-new</v-icon>-->
<!--      </v-btn>-->
    </v-app-bar>

    <v-main>
      <GraphVis />
    </v-main>
  </v-app>
</template>

<script>
import GraphVis from "./components/GraphVis";

export default {
  name: 'App',

  components: {
    GraphVis
  },

  data: () => ({
  }),

  methods: {
    loadGraph: () => {

    }
  }
};
</script>
