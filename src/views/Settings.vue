<script setup lang="ts">
import { useSettingsStore } from '@/store/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ref } from 'vue'

const store = useSettingsStore()

const apiUrl = ref(store.apiUrl)
const token = ref(store.token)

const saved = ref(false)

function saveSettings() {
  store.setApiUrl(apiUrl.value)
  store.setToken(token.value)
  saved.value = true
  setTimeout(() => {
    saved.value = false
  }, 2000)
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
      <p class="text-muted-foreground">Configure your connection to the Cloudflare Worker HTML Transformer API.</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>
          These settings are stored locally in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="apiUrl">Backend API URL</Label>
          <Input id="apiUrl" v-model="apiUrl" placeholder="https://proxy.cf-io.workers.dev" />
          <p class="text-[0.8rem] text-muted-foreground">
            The base URL of your Cloudflare Worker.
          </p>
        </div>
        
        <div class="space-y-2">
          <Label for="token">Bearer Token (Optional)</Label>
          <Input id="token" v-model="token" type="password" placeholder="Enter API token" />
          <p class="text-[0.8rem] text-muted-foreground">
            Stored securely in sessionStorage. Required for protected endpoints like /api/services and /api/cache/update.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button @click="saveSettings">
          {{ saved ? 'Saved!' : 'Save Settings' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
