<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AceEditor from '@/components/AceEditor.vue'
import { Loader2 } from 'lucide-vue-next'

const store = useSettingsStore()

const url = ref('')
const cacheTtl = ref<number | ''>('')
const contentType = ref('')

const rawHtml = ref('')
const cleanedHtml = ref('')
const jsonContent = ref('')
const textContent = ref('')
const markdownContent = ref('')
const digestedContent = ref('{\n  "summary": "",\n  "notes": "",\n  "images": []\n}')

const loading = ref(false)
const result = ref<{ success: boolean; message: string } | null>(null)

async function updateCache() {
  if (!url.value) return
  
  loading.value = true
  result.value = null

  try {
    const payload: any = { url: url.value }
    
    if (cacheTtl.value !== '') payload.cacheTtl = cacheTtl.value
    if (contentType.value) payload.contentType = contentType.value

    if (rawHtml.value || cleanedHtml.value) {
      payload.html = {}
      if (rawHtml.value) payload.html.raw_html = rawHtml.value
      if (cleanedHtml.value) payload.html.cleaned_html = cleanedHtml.value
    }

    if (jsonContent.value || textContent.value || markdownContent.value) {
      payload.extracted = {}
      if (jsonContent.value) {
        try {
          payload.extracted.json = JSON.parse(jsonContent.value)
        } catch {
          throw new Error('Invalid JSON in Extracted JSON field')
        }
      }
      if (textContent.value) payload.extracted.text = textContent.value
      if (markdownContent.value) payload.extracted.markdown = markdownContent.value
    }

    if (digestedContent.value && digestedContent.value.trim() !== '{\n  "summary": "",\n  "notes": "",\n  "images": []\n}') {
      try {
        payload.digested = JSON.parse(digestedContent.value)
      } catch {
        throw new Error('Invalid JSON in Digested Content field')
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (store.token) {
      headers['Authorization'] = `Bearer ${store.token}`
    }

    const reqUrl = `${store.apiUrl.replace(/\/$/, '')}/api/cache/update`
    
    const res = await fetch(reqUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update cache')
    
    result.value = { success: true, message: data.message || 'Cache updated successfully' }
  } catch (err: any) {
    result.value = { success: false, message: err.message || String(err) }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Cache Update</h1>
      <p class="text-muted-foreground">Manually update specific cache entries for a URL.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      <!-- Config -->
      <div class="lg:col-span-4 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Target Configuration</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="url">URL <span class="text-destructive">*</span></Label>
              <Input id="url" v-model="url" placeholder="https://example.com" />
            </div>
            <div class="space-y-2">
              <Label for="contentType">Original Content-Type</Label>
              <Input id="contentType" v-model="contentType" placeholder="e.g. text/html" />
            </div>
            <div class="space-y-2">
              <Label for="cacheTtl">Cache TTL Override (s)</Label>
              <Input id="cacheTtl" v-model.number="cacheTtl" type="number" placeholder="Optional" />
            </div>
            <Button class="w-full" @click="updateCache" :disabled="loading || !url">
              <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
              {{ loading ? 'Updating...' : 'Update Cache' }}
            </Button>

            <div v-if="result" :class="['p-3 rounded-md text-sm', result.success ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-destructive/10 text-destructive']">
              {{ result.message }}
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Editors -->
      <div class="lg:col-span-8 flex flex-col min-h-[500px]">
        <Tabs defaultValue="rawHtml" class="flex-1 flex flex-col min-h-0">
          <TabsList class="w-full justify-start overflow-x-auto flex-nowrap shrink-0">
            <TabsTrigger value="rawHtml">Raw HTML</TabsTrigger>
            <TabsTrigger value="cleanedHtml">Cleaned HTML</TabsTrigger>
            <TabsTrigger value="json">Extracted JSON</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="digested">Digested</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rawHtml" class="flex-1 mt-2 min-h-0">
            <AceEditor v-model="rawHtml" mode="html" />
          </TabsContent>
          <TabsContent value="cleanedHtml" class="flex-1 mt-2 min-h-0">
            <AceEditor v-model="cleanedHtml" mode="html" />
          </TabsContent>
          <TabsContent value="json" class="flex-1 mt-2 min-h-0">
            <AceEditor v-model="jsonContent" mode="json" />
          </TabsContent>
          <TabsContent value="text" class="flex-1 mt-2 min-h-0">
            <AceEditor v-model="textContent" mode="text" />
          </TabsContent>
          <TabsContent value="markdown" class="flex-1 mt-2 min-h-0">
            <AceEditor v-model="markdownContent" mode="markdown" />
          </TabsContent>
          <TabsContent value="digested" class="flex-1 mt-2 min-h-0">
            <AceEditor v-model="digestedContent" mode="json" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>
