<script setup lang="ts">
import { VAceEditor } from 'vue3-ace-editor'
import { computed } from 'vue'
import { useDark } from '@vueuse/core'

import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-markdown'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/mode-text'

import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/theme-twilight'

const props = defineProps<{
  modelValue: string
  mode: 'html' | 'json' | 'markdown' | 'xml' | 'text'
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isDark = useDark()

const theme = computed(() => isDark.value ? 'twilight' : 'github')

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

</script>

<template>
  <VAceEditor
    v-model:value="value"
    :lang="mode"
    :theme="theme"
    :readonly="readonly"
    :options="{
      useWorker: false,
      showPrintMargin: false,
      wrap: true,
      fontSize: 14
    }"
    class="w-full h-full border rounded-md overflow-hidden"
  />
</template>
