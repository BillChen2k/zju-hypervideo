<template>
  <v-container>
    <v-row>
      <v-col cols="6" class="d-flex">
        <div class="pa-2">
          <h3 class="pb-2">Visualization</h3>
          <p>
            You can visualize the graph with the button.
          </p>
        </div>
      </v-col>
      <v-col cols="6" class="d-flex justify-end align-center">
        <v-btn class="mx-1" outlined @click="loadGraph(graphs.cloth)">Cloth</v-btn>
        <v-btn class="mx-1" outlined @click="loadGraph(graphs.importance_human_visual)">Human Visual</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8">
        <v-row>
          <svg width="960" height="600" style="border: black solid 1px;" class="container-border"></svg>
        </v-row>
        <v-row class="align-center">
          <span class="ma-1">Zoom level:</span>
          <v-slider
              class="mt-3"
              hint="Set Zoom"
              max="10"
              min="0.3"
              step="0.05"
              v-model="zoomLevel"
              thumb-label="true"
          ></v-slider>
        </v-row>
      </v-col>
      <v-col cols="4">
        <div class="my-2"> {{selectedVideo.length > 0 ? "Now Playing: " + selectedVideo : "Not Selected."}} </div>
        <video-player class="my-2" :options="playerOptions">
        </video-player>
      </v-col>
    </v-row>
    <v-row>

    </v-row>

    <!--        Graph SVG       -->
  </v-container>
</template>

<script>
import * as d3 from "d3";
const clothJson = require("../assets/graph/cloth_json_99.json");
const humanVisualJson = require("../assets/graph/human_visual_json_92_99.json");
const humanVisualImportanceJson = require("../assets/graph/importance_human_visual_json_92_99.json");
import videoPlayer from "vue-video-player"

export default {
  name: "GraphVis",
  data: () =>({
    graphs: {
      cloth: clothJson,
      human_visual: humanVisualJson,
      importance_human_visual: humanVisualImportanceJson
    },
    zoomLevel: 1,
    selectedVideo: "",
    playerOptions: {
      height: '480',
      width: '360',
      autoplay: true,
      muted: true,
      language: 'en',
      playbackRates: [0.7, 1.0, 1.5, 2.0],
      sources: [{
        type: "video/mp4",
        // mp4
        src: "http://vjs.zencdn.net/v/oceans.mp4",
      }],
      // poster: "https://surmon-china.github.io/vue-quill-editor/static/images/surmon-1.jpg",
    }
  }),

  methods: {

    /**
     * Play a new video.
     * @param event
     * @param d
     */
    onNodeClicked: function (event, d) {

      let videoName = d.id;
      if (videoName.substr(-4) != ".mp4") {
        videoName += ".mp4";
      }
      this.selectedVideo = videoName;
      let videoUrl = `/static/video/${videoName}`;
      this.playerOptions.sources[0].src = videoUrl;
      console.log(d);
    },

   onZoomedSlider: function(event) {
       this.zoomLevel = event.transform.k;
   },

loadGraph: function (data) {
      let drag = simulation => {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }

        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
      };

      // let nodeClicked = () => {
      //   return d3.click();
      // }

      let svg = d3.select('svg');
      let width = svg.attr('width');
      let height = svg.attr('height');
      svg.style("font", "10px Roboto");

      d3.selectAll("svg > *").remove();

      // Main Graphics
      const g = svg.append("g");

      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes.map(d => Object.create(d));

      const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

      const link = g.append("g")
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke", d => `rgba(153,153,153,0.6)`)
          .attr("stroke-opacity", d => {
            if (d.value / 6 < 0.1) return 0.1;
            if (d.value / 6 > 1) return 1;
            return d.value / 6;
          })
          .attr("stroke-width", d => Math.sqrt(d.value));

      const node = g.append("g")
          .attr("fill", "currentColor")
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .selectAll("g")
          .data(nodes)
          .join("g")
          // .attr("transform", d => `translate(${d})`)
          .call(drag(simulation))
          .on("click", this.onNodeClicked);

      const scale = d3.scaleOrdinal(d3.schemeCategory10);

      node.append("circle")
          .attr("stroke", "white")
          .attr("stroke-width", 1.5)
          .attr("fill", d => scale(d.group))
          .attr("r", 5)

      node.append("text")
          .attr("x", 8)
          .attr("y", "0.31em")
          .text(d => d.id)
          .clone(true).lower()
          .attr("fill", "black")
          .attr("stroke", "white")
          .attr("stroke-width", 0.5);

      node.append("title")
          .text(function(d) {
            return "word: " + d.word;
          });

      simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

      let onZoomed =  (event) => {
        console.log(event);
        let transform = event.transform;
        g.attr("transform", d => `${transform}`);
      }

      svg.call(d3.zoom()
              .extent([[width / 2, height / 2], [width, height]])
              .scaleExtent([0.2, 5])
              .on("zoom", onZoomed));
        }
  },

  mounted() {
    this.loadGraph(this.graphs.importance_human_visual);
  }
}
</script>

<style scoped>

</style>
