<template>
  <v-container>
    <v-row>
      <v-col cols="9" class="d-flex">
        <div class="pa-2">
          <h3 class="pb-2">Visualization</h3>
          <p>
            You can visualize the graph below.
          </p>
          <p>Use mouse scroll to zoom.</p>
        </div>
      </v-col>
      <v-col cols="3" id="reload-buttons" class="d-flex justify-end align-center">
        <!--        <v-btn class="mx-1" outlined @click="loadGraph(graphs.cloth)">Cloth</v-btn>-->
        <!--        <v-btn class="mx-1" outlined @click="loadGraph(graphs.importance_human_visual)">Human Visual</v-btn>-->
        <v-file-input
            accept=".json"
            label="Load Graph"
            v-model="graphs.chosenGraph"
            @change="onGraphSelected"
            :disabled="graphSelectorDisabled"
        ></v-file-input>

      </v-col>
    </v-row>
    <v-row>
      <v-col cols="8"  id="svg-container">
        <v-row class="mt-2">
          <!--        Graph SVG       -->
          <div style="overflow: hidden; border: black solid 1px; ">
            <svg height="600" style="border: black solid 1px; font: 10px Roboto" class="container-border"></svg>
          </div>
        </v-row>
        <v-row class="align-center">
          <span class="ma-0">Zoom level:</span>
          <v-slider
              class="mt-3"
              hint="Set Zoom"
              max="10"
              min="0.3"
              step="0.05"
              v-model="zoomLevel"
              thumb-label="true"
              @input="updateZoomLevel"
          ></v-slider>
        </v-row>
      </v-col>
      <v-col cols="4">
        <v-card
            class="mx-auto mt-0"
            max-width="400"
            id="video-player-container"
        >
          <video-player class="my-2" :options="playerOptions">
          </video-player>

          <v-card-title> {{selectedVideo.length > 0 ?selectedVideo : "Not Selected."}}</v-card-title>
          <v-card-subtitle class="pb-0">
            Now Playing
          </v-card-subtitle>

          <v-card-text class="text--primary">

          </v-card-text>

          <!--          <v-card-actions>-->
          <!--            <v-btn-->
          <!--                color="orange"-->
          <!--                text-->
          <!--            >-->
          <!--              Share-->
          <!--            </v-btn>-->

          <!--            <v-btn-->
          <!--                color="orange"-->
          <!--                text-->
          <!--            >-->
          <!--              Explore-->
          <!--            </v-btn>-->
          <!--          </v-card-actions>-->
        </v-card>

      </v-col>
    </v-row>
    <v-row>

    </v-row>

  </v-container>
</template>

<script>
import * as d3 from "d3";
const clothJson = require("../assets/graph/cloth_json_99.json");
const humanVisualJson = require("../assets/graph/human_visual_json_92_99.json");
const humanVisualImportanceJson = require("../assets/graph/importance_human_visual_json_92_99.json");
import { EventBus } from "../plugins/bus";

export default {
  name: "GraphVis",
  data: () =>({
    graphs: {
      cloth: clothJson,
      human_visual: humanVisualJson,
      importance_human_visual: humanVisualImportanceJson,
      chosenGraph: null
    },
    zoomLevel: 1,
    selectedVideo: "",
    selectedVideoNode : "",
    isFirstLoad: true,
    graphSelectorDisabled: false,
    playerOptions: {
      height: '420',
      width: '370',
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


    calcDegree: function(id, data) {

    },
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
      this.selectedVideoNode = d;
      console.log(d);
      let videoUrl = `/video/${videoName}`;
      this.playerOptions.sources[0].src = videoUrl;
      this.playerOptions.autoplay = true;
      console.log(d);
    },

    clearVideoPlayer: function() {
      this.playerOptions.sources[0].src = "";
      this.playerOptions.autoplay = false;
    },

    publishZoomLevel: function(transform) {
      this.zoomLevel = transform.k;
    },

    /**
     * Update zoom level.
     * @param level
     */
    updateZoomLevel: function(level) {
      let svg = d3.select("svg");
      let g = svg.select("g");
      let transform = g.attr("transform");
      transform = transform.replace(/scale\(.*\)/gm, `scale(${level})`);
      g.attr("transform", `${transform}`);
    },

    initGraph: function() {
      let container = d3.select('#svg-container');
      let svg = d3.select('svg');
      d3.selectAll("svg > *").remove();
      svg.attr("width", container.node().getBoundingClientRect().width);
      svg.attr("height", 600);
      svg.attr("style", "font: 10px Roboto");
      let width = svg.attr('width');
      let height = svg.attr('height');
      return { width, height };

    },

    loadGraph: function (data) {
      let drag = function (simulation) {
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

      let { width, height } = this.initGraph();
      let svg = d3.select('svg');
      // Main Graphics
      const g = svg.append("g");

      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes.map(d => Object.create(d));

      let now = Date.now();

      const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => `${d.id}`))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

      simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

      this.isFirstLoad = false;

      const link = g.append("g")
          .selectAll("line")
          .data(links)
          .join("line")
          .attr("stroke", d => `rgba(144,144,144,0.87)`)
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

      let onZoomed =  (event) => {
        console.log(event);
        let transform = event.transform;
        g.attr("transform", d => `${transform}`);
        EventBus.$emit("zoomFromSvg", transform);
      }

      svg.call(d3.zoom()
          .extent([[width / 2, height / 2], [width, height]])
          .scaleExtent([0.2, 5])
          .on("zoom", onZoomed));
    },

    onGraphSelected: function(graph) {
      let validateGraph = function(graph) {
        if (!graph.nodes || ! graph.links) {
          return false;
        }
        return true;
      }
      console.log(graph);
      if (graph.name.slice(graph.name.length - 5) != ".json") {
        alert("Please select a valid json file.")
        return;
      }
      let reader = new FileReader();
      // Use the javascript reader object to load the contents
      // of the file in the v-model prop
      reader.readAsText(this.graphs.chosenGraph);
      reader.onload = () => {
        let loadedJson = reader.result;
        console.log(loadedJson);
        this.loadGraph(JSON.parse(loadedJson));
      }
    }
  },

  mounted() {
    // this.loadGraph(this.graphs.cloth);
    let videoContainer = d3.select("#video-player-container");
    this.initGraph();
    this.playerOptions.width = videoContainer.node().getBoundingClientRect().width;
    EventBus.$on("zoomFromSvg", this.publishZoomLevel);
  }
}
</script>

<style scoped>

</style>
