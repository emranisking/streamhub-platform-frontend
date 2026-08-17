<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Hls from 'hls.js'

const props = defineProps({
  src: { type: String, required: true }
})
defineEmits(['playing'])

const videoEl = ref(null)
let hls = null

function attach(src) {
  if (!videoEl.value || !src) return
  destroy()

  if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari plays HLS natively.
    videoEl.value.src = src
  } else if (Hls.isSupported()) {
    hls = new Hls()
    hls.loadSource(src)
    hls.attachMedia(videoEl.value)
  } else {
    videoEl.value.src = src
  }
}

function destroy() {
  if (hls) {
    hls.destroy()
    hls = null
  }
}

watch(() => props.src, (src) => attach(src))

onMounted(() => attach(props.src))
onBeforeUnmount(destroy)
</script>

<template>
  <video
    ref="videoEl"
    class="player"
    controls
    playsinline
    @play="$emit('playing')"
  />
</template>

<style scoped>
.player {
  width: 100%;
  height: 100%;
  background: #000;
  display: block;
}
</style>
