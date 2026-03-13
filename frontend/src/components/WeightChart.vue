<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import type { WeightEntry } from '../types'

const props = defineProps<{
  entries: WeightEntry[]
  height?: number
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const chartHeight = computed(() => props.height || 200)

function drawChart() {
  const el = canvas.value
  if (!el || props.entries.length === 0) return

  const ctx = el.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = el.getBoundingClientRect()
  el.width = rect.width * dpr
  el.height = chartHeight.value * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = chartHeight.value
  const padding = { top: 20, right: 15, bottom: 30, left: 45 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  // Clear
  ctx.clearRect(0, 0, width, height)

  // Data
  const weights = props.entries.map((e) => e.weight_lbs)
  const dates = props.entries.map((e) => new Date(e.date))

  const minW = Math.floor(Math.min(...weights) - 2)
  const maxW = Math.ceil(Math.max(...weights) + 2)
  const rangeW = maxW - minW || 1

  const minDate = dates[0].getTime()
  const maxDate = dates[dates.length - 1].getTime()
  const rangeDate = maxDate - minDate || 1

  function xPos(date: Date): number {
    return padding.left + ((date.getTime() - minDate) / rangeDate) * chartW
  }

  function yPos(weight: number): number {
    return padding.top + (1 - (weight - minW) / rangeW) * chartH
  }

  const colors = getChartColors()

  // Grid lines
  ctx.strokeStyle = colors.grid
  ctx.lineWidth = 1
  const yTicks = 5
  for (let i = 0; i <= yTicks; i++) {
    const y = padding.top + (i / yTicks) * chartH
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()

    // Y labels
    const val = maxW - (i / yTicks) * rangeW
    ctx.fillStyle = colors.text
    ctx.font = '10px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText(val.toFixed(0), padding.left - 5, y + 3)
  }

  // 7-day rolling average
  if (props.entries.length >= 3) {
    const avgData: { date: Date; avg: number }[] = []
    for (let i = 0; i < props.entries.length; i++) {
      const windowStart = new Date(dates[i])
      windowStart.setDate(windowStart.getDate() - 7)
      const windowEntries = props.entries.filter(
        (e, j) => new Date(e.date) >= windowStart && new Date(e.date) <= dates[i]
      )
      const avg = windowEntries.reduce((s, e) => s + e.weight_lbs, 0) / windowEntries.length
      avgData.push({ date: dates[i], avg })
    }

    ctx.strokeStyle = colors.accent
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath()
    avgData.forEach((d, i) => {
      const x = xPos(d.date)
      const y = yPos(d.avg)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
  }

  // Raw data line
  ctx.strokeStyle = colors.raw
  ctx.lineWidth = 1.5
  ctx.setLineDash([])
  ctx.beginPath()
  dates.forEach((d, i) => {
    const x = xPos(d)
    const y = yPos(weights[i])
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // Data points
  dates.forEach((d, i) => {
    const x = xPos(d)
    const y = yPos(weights[i])
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fillStyle = colors.raw
    ctx.fill()
  })

  // Date labels
  ctx.fillStyle = colors.text
  ctx.font = '10px system-ui'
  ctx.textAlign = 'center'
  const labelCount = Math.min(5, dates.length)
  const step = Math.max(1, Math.floor(dates.length / labelCount))
  for (let i = 0; i < dates.length; i += step) {
    const x = xPos(dates[i])
    ctx.fillText(
      dates[i].toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      x,
      height - 5
    )
  }
}

function getChartColors() {
  const s = getComputedStyle(document.documentElement)
  return {
    grid:    s.getPropertyValue('--chart-grid').trim()    || '#1e1d2d',
    accent:  s.getPropertyValue('--chart-accent').trim()  || '#8b7cf8',
    raw:     s.getPropertyValue('--chart-raw').trim()     || '#34d399',
    text:    s.getPropertyValue('--chart-text').trim()    || '#71717a',
  }
}

watch(() => props.entries, drawChart, { deep: true })
onMounted(() => {
  setTimeout(drawChart, 50)
  window.addEventListener('resize', drawChart)
  // Re-draw when theme class changes
  const observer = new MutationObserver(() => setTimeout(drawChart, 20))
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div class="bg-surface-lighter rounded-xl p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-300">Body Weight</h3>
      <div class="flex items-center gap-3 text-[10px]">
        <span class="flex items-center gap-1">
          <span class="w-3 h-0.5 bg-success inline-block rounded"></span>
          <span class="text-gray-500">Raw</span>
        </span>
        <span class="flex items-center gap-1">
          <span class="w-3 h-0.5 bg-accent inline-block rounded"></span>
          <span class="text-gray-500">7-day avg</span>
        </span>
      </div>
    </div>
    <canvas
      v-if="entries.length > 0"
      ref="canvas"
      class="w-full"
      :style="{ height: `${chartHeight}px` }"
    ></canvas>
    <p v-else class="text-gray-500 text-sm text-center py-8">No weight data yet</p>
  </div>
</template>
