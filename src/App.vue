<script setup lang="ts">
import { nextTick } from 'vue';
import { Engine } from '@babylonjs/core';
import { createScene } from './scene';

nextTick(() => {
  const engine = new Engine(document.getElementById('gameCanvas') as HTMLCanvasElement, true);
  const scene = createScene(engine);
  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener('resize', () => {
    engine.resize();
  });
});
</script>

<template>
  <canvas class="game-canvas" id="gameCanvas"></canvas>
</template>

<style>
html,
body {
  margin: 0;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.game-canvas {
  width: 100%;
  height: 100%;
}
</style>
