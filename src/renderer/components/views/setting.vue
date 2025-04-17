<template>
  <div class="space-y-6">
    <h2 class="text-lg font-bold text-white">音声設定</h2>

    <!-- 音量スライダー -->
    <div>
      <label class="block text-sm text-gray-400 mb-1">音量</label>
      <input type="range" min="0" max="100" v-model="volume" class="w-full accent-green-400" />
      <p class="text-xs text-gray-400 mt-1">現在の音量: {{ volume }}</p>
    </div>

    <!-- 音声生成方式ラジオ -->
    <div>
      <label class="block text-sm text-gray-400 mb-1">音声生成方式</label>
      <div class="flex gap-4 text-sm">
        <label class="flex items-center gap-2">
          <input type="radio" value="default" v-model="ttsEngine" />
          デフォルト（サーバー）
        </label>
        <label class="flex items-center gap-2">
          <input type="radio" value="coeiroink" v-model="ttsEngine" />
          COEIROINK（クライアント）
        </label>
        <label class="flex items-center gap-2">
          <input type="radio" value="aivoice" v-model="ttsEngine" />
          A.I.Voice（クライアント）
        </label>
      </div>
    </div>

    <!-- キャラ選択 -->
    <SelectListbox
      v-model:selected-value="selectedSpeakerId"
      :options="speakerOptions"
      label="話者"
      placeholder="キャラを選択してください"
      noOptionsText="選択可能な話者が見つかりません"
    />

    <!-- スタイル選択 -->
    <SelectListbox
      v-model:selected-value="selectedStyleId"
      :options="styleOptions"
      label="スタイル"
      placeholder="スタイルを選択してください"
      noOptionsText="スタイルがありません"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import SelectListbox from '../partials/common/select-listbox.vue'

const volume = ref(80)
const ttsEngine = ref<'default' | 'coeiroink' | 'aivoice'>('default')
const selectedSpeakerId = ref('')
const selectedStyleId = ref('')

// speakerOptions / styleOptions は API or キャッシュから取得
const speakerOptions = ref([
  { value: '1', label: '四国めたん' },
  { value: '2', label: 'ずんだもん' },
])
const styleOptions = ref([
  { value: '0', label: 'ノーマル' },
  { value: '1', label: 'あまあま' },
])

watch([volume, ttsEngine, selectedSpeakerId, selectedStyleId], () => {
  window.electron.invoke('update-settings', {
    volume: volume.value,
    ttsEngine: ttsEngine.value,
    speakerId: selectedSpeakerId.value,
    styleId: selectedStyleId.value,
  })
})

onMounted(async () => {
  const savedSettings = await window.electron.invoke('get-settings')

  volume.value = savedSettings.volume ?? 80
  ttsEngine.value = savedSettings.ttsEngine ?? 'default'
  selectedSpeakerId.value = savedSettings.speakerId ?? ''
  selectedStyleId.value = savedSettings.styleId ?? ''
})
</script>
