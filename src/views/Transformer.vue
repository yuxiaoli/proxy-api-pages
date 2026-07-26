<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import AceEditor from '@/components/AceEditor.vue'
import { Copy, Download, Trash2, Code, Loader2 } from 'lucide-vue-next'

const store = useSettingsStore()

const url = ref('')
const format = ref('raw_html')
const noCache = ref(false)
const forceRefresh = ref(false)
const cacheTtl = ref(3600)
const useService = ref('')

const loading = ref(false)
const responseData = ref('')
const responseMode = ref<'html'|'json'|'markdown'|'xml'|'text'>('html')
const responseStatus = ref<number | null>(null)
const responseContentType = ref<string>('')
const responseDuration = ref<number>(0)
const responseCacheStatus = ref<string>('')

async function submitRequest() {
  if (!url.value) return
  
  loading.value = true
  responseData.value = ''
  responseStatus.value = null
  responseContentType.value = ''
  responseCacheStatus.value = ''
  
  const startTime = performance.now()
  
  try {
    const params = new URLSearchParams()
    params.append('url', url.value)
    if (format.value) params.append('format', format.value)
    if (noCache.value) params.append('noCache', 'true')
    if (forceRefresh.value) params.append('forceRefresh', 'true')
    if (cacheTtl.value !== 3600) params.append('cacheTtl', cacheTtl.value.toString())
    if (useService.value) params.append('useService', useService.value)

    const headers: Record<string, string> = {}
    if (store.token) {
      headers['Authorization'] = `Bearer ${store.token}`
    }

    const reqUrl = `${store.apiUrl.replace(/\/$/, '')}/?${params.toString()}`
    
    const res = await fetch(reqUrl, { headers })
    
    responseStatus.value = res.status
    responseContentType.value = res.headers.get('content-type') || 'text/plain'
    responseCacheStatus.value = res.headers.get('x-cache') || 'MISS'
    
    const text = await res.text()
    
    if (responseContentType.value.includes('application/json')) {
      responseMode.value = 'json'
      try {
        responseData.value = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        responseData.value = text
      }
    } else if (responseContentType.value.includes('text/html')) {
      responseMode.value = 'html'
      responseData.value = text
    } else if (responseContentType.value.includes('text/markdown')) {
      responseMode.value = 'markdown'
      responseData.value = text
    } else if (responseContentType.value.includes('xml') || responseContentType.value.includes('rss')) {
      responseMode.value = 'xml'
      responseData.value = text
    } else {
      responseMode.value = 'text'
      responseData.value = text
    }
  } catch (err: any) {
    responseStatus.value = 0
    responseData.value = err.message || String(err)
    responseMode.value = 'text'
  } finally {
    responseDuration.value = Math.round(performance.now() - startTime)
    loading.value = false
  }
}

function copyResponse() {
  navigator.clipboard.writeText(responseData.value)
}

function downloadResponse() {
  const blob = new Blob([responseData.value], { type: responseContentType.value || 'text/plain' })
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  let ext = '.txt'
  if (responseMode.value === 'html') ext = '.html'
  if (responseMode.value === 'json') ext = '.json'
  if (responseMode.value === 'markdown') ext = '.md'
  if (responseMode.value === 'xml') ext = '.xml'
  
  a.download = `response${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

function formatJson() {
  if (responseMode.value === 'json') {
    try {
      responseData.value = JSON.stringify(JSON.parse(responseData.value), null, 2)
    } catch (e) {
      // ignore
    }
  }
}

function clearResponse() {
  responseData.value = ''
  responseStatus.value = null
}
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
    <!-- Request Form -->
    <div class="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
      <Card>
        <CardHeader>
          <CardTitle>Request Config</CardTitle>
          <CardDescription>Set target URL and parameters.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="url">Target URL <span class="text-destructive">*</span></Label>
            <Input id="url" v-model="url" placeholder="https://example.com" @keydown.enter="submitRequest" />
          </div>

          <div class="space-y-2">
            <Label>Output Format</Label>
            <Select v-model="format">
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw_html">raw_html</SelectItem>
                <SelectItem value="cleaned_html">cleaned_html</SelectItem>
                <SelectItem value="json">json</SelectItem>
                <SelectItem value="text">text</SelectItem>
                <SelectItem value="markdown">markdown</SelectItem>
                <SelectItem value="rss">rss</SelectItem>
                <SelectItem value="digested">digested</SelectItem>
                <SelectItem value="extracted">extracted</SelectItem>
                <SelectItem value="all">all</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="cacheTtl">Cache TTL (s)</Label>
              <Input id="cacheTtl" v-model.number="cacheTtl" type="number" />
            </div>
            <div class="space-y-2">
              <Label for="useService">Service ID</Label>
              <Input id="useService" v-model="useService" placeholder="Optional" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between">
              <Label for="noCache" class="cursor-pointer">No Cache</Label>
              <Switch id="noCache" v-model:checked="noCache" />
            </div>
            <div class="flex items-center justify-between">
              <Label for="forceRefresh" class="cursor-pointer">Force Refresh</Label>
              <Switch id="forceRefresh" v-model:checked="forceRefresh" />
            </div>
          </div>

          <Button class="w-full mt-4" @click="submitRequest" :disabled="loading || !url">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ loading ? 'Sending...' : 'Send Request' }}
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- Response Viewer -->
    <div class="lg:col-span-8 flex flex-col min-h-0 border rounded-xl bg-card text-card-foreground shadow-sm overflow-hidden">
      <div class="p-3 border-b flex flex-wrap items-center justify-between gap-2 bg-muted/30">
        <div class="flex items-center gap-2 text-sm">
          <Badge v-if="responseStatus" :variant="responseStatus >= 400 ? 'destructive' : 'default'">
            {{ responseStatus }}
          </Badge>
          <Badge v-if="responseDuration" variant="outline">{{ responseDuration }}ms</Badge>
          <Badge v-if="responseCacheStatus" variant="secondary">{{ responseCacheStatus }}</Badge>
          <span v-if="responseContentType" class="text-muted-foreground ml-2 text-xs truncate max-w-[200px]" :title="responseContentType">
            {{ responseContentType }}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="formatJson" v-if="responseMode === 'json'" title="Format JSON">
            <Code class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" @click="copyResponse" :disabled="!responseData" title="Copy">
            <Copy class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" @click="downloadResponse" :disabled="!responseData" title="Download">
            <Download class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" @click="clearResponse" :disabled="!responseData" title="Clear">
            <Trash2 class="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      <div class="flex-1 min-h-0 relative">
        <div v-if="!responseData && !loading" class="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Enter a URL and send request to view response.
        </div>
        <AceEditor v-else v-model="responseData" :mode="responseMode" :readonly="true" />
      </div>
    </div>
  </div>
</template>
