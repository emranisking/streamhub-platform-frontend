<!-- components/VideoPlayer.vue -->
<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Hls from 'hls.js'

const props = defineProps({
  src: { type: String, required: true }
})
const emit = defineEmits(['playing', 'error'])

const videoEl = ref(null)
let hls = null

function attach(src) {
  if (!videoEl.value || !src) {
    console.warn('🎬 VideoPlayer: No video element or src')
    return
  }

  console.log('🎬 VideoPlayer attaching source:', src)
  destroy()

  // Check if it's a native HLS URL (Safari)
  if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
    console.log('🎬 Using native HLS playback (Safari)')
    videoEl.value.src = src
    videoEl.value.play().catch(e => {
      console.warn('🎬 Autoplay prevented:', e.message)
    })
    return
  }

  // Check if HLS.js is supported
  if (Hls.isSupported()) {
    console.log('🎬 Using HLS.js for playback')
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      debug: false
    })
    
    hls.loadSource(src)
    hls.attachMedia(videoEl.value)
    
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('🎬 HLS manifest parsed, attempting to play...')
      videoEl.value.play().catch(e => {
        console.warn('🎬 Autoplay prevented:', e.message)
      })
    })
    
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('🎬 HLS Error:', data)
      if (data.fatal) {
        emit('error', data)
        // Try to recover
        if (hls) {
          hls.destroy()
          hls = null
          // Try to reattach after a delay
          setTimeout(() => {
            if (src) attach(src)
          }, 1000)
        }
      }
    })
  } else if (videoEl.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Fallback for Safari
    console.log('🎬 Using fallback HLS playback (Safari)')
    videoEl.value.src = src
  } else {
    console.error('🎬 HLS not supported in this browser')
    emit('error', new Error('HLS not supported'))
  }
}

function destroy() {
  if (hls) {
    console.log('🎬 Destroying HLS instance')
    hls.destroy()
    hls = null
  }
}

watch(() => props.src, (newSrc, oldSrc) => {
  if (newSrc !== oldSrc && newSrc) {
    console.log('🎬 Source changed, reattaching...')
    attach(newSrc)
  }
})

onMounted(() => {
  console.log('🎬 VideoPlayer mounted with src:', props.src)
  if (props.src) {
    attach(props.src)
  }
})

onBeforeUnmount(() => {
  console.log('🎬 VideoPlayer unmounting, cleaning up...')
  destroy()
})
</script>

<template>
  <video
    ref="videoEl"
    class="player"
    controls
    playsinline
    @play="$emit('playing')"
    @error="(e) => { console.error('🎬 Video element error:', e); emit('error', e) }"
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