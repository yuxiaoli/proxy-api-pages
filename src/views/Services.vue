<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AceEditor from '@/components/AceEditor.vue'
import { Loader2, Plus, Trash2, Edit } from 'lucide-vue-next'

const store = useSettingsStore()

interface Service {
  id: string
  name: string
  type: 'http' | 'webhook'
  url: string
  method: string
  headers?: Record<string, string>
  payloadTemplate?: any
}

const services = ref<Service[]>([])
const loading = ref(false)
const error = ref('')

const dialogOpen = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const formId = ref('')
const formName = ref('')
const formType = ref<'http'|'webhook'>('http')
const formUrl = ref('')
const formMethod = ref('POST')
const formHeaders = ref('{}')
const formPayload = ref('{}')

async function loadServices() {
  loading.value = true
  error.value = ''
  try {
    const headers: Record<string, string> = {}
    if (store.token) headers['Authorization'] = `Bearer ${store.token}`
    
    const res = await fetch(`${store.apiUrl.replace(/\/$/, '')}/api/services`, { headers })
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized. Check your token in Settings.')
      throw new Error('Failed to load services')
    }
    const data = await res.json()
    services.value = data.services || []
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  isEditing.value = false
  formId.value = ''
  formName.value = ''
  formType.value = 'http'
  formUrl.value = ''
  formMethod.value = 'POST'
  formHeaders.value = '{\n  "Content-Type": "application/json"\n}'
  formPayload.value = '{\n  "url": "{{url}}"\n}'
  dialogOpen.value = true
}

function openEditDialog(s: Service) {
  isEditing.value = true
  formId.value = s.id
  formName.value = s.name || ''
  formType.value = s.type
  formUrl.value = s.url
  formMethod.value = s.method || 'POST'
  formHeaders.value = s.headers ? JSON.stringify(s.headers, null, 2) : '{}'
  formPayload.value = s.payloadTemplate ? JSON.stringify(s.payloadTemplate, null, 2) : '{}'
  dialogOpen.value = true
}

async function saveService() {
  if (!formId.value || !formUrl.value || !formType.value) return
  
  saving.value = true
  error.value = ''
  
  try {
    const payload: any = {
      id: formId.value,
      name: formName.value,
      type: formType.value,
      url: formUrl.value,
      method: formMethod.value
    }
    
    try {
      payload.headers = JSON.parse(formHeaders.value)
    } catch {
      throw new Error('Invalid JSON in Headers')
    }
    
    try {
      payload.payloadTemplate = JSON.parse(formPayload.value)
    } catch {
      throw new Error('Invalid JSON in Payload Template')
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (store.token) headers['Authorization'] = `Bearer ${store.token}`

    const res = await fetch(`${store.apiUrl.replace(/\/$/, '')}/api/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) throw new Error('Failed to save service')
    
    dialogOpen.value = false
    loadServices()
  } catch (err: any) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function deleteService(id: string) {
  if (!confirm('Are you sure you want to delete this service?')) return
  
  try {
    const headers: Record<string, string> = {}
    if (store.token) headers['Authorization'] = `Bearer ${store.token}`

    const res = await fetch(`${store.apiUrl.replace(/\/$/, '')}/api/services?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers
    })
    
    if (!res.ok) throw new Error('Failed to delete service')
    loadServices()
  } catch (err: any) {
    alert(err.message)
  }
}

onMounted(() => {
  loadServices()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">Services</h1>
        <p class="text-muted-foreground">Manage registered browser services.</p>
      </div>
      <Button @click="openAddDialog">
        <Plus class="w-4 h-4 mr-2" />
        Add Service
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="p-8 flex justify-center text-muted-foreground">
          <Loader2 class="w-6 h-6 animate-spin" />
        </div>
        <div v-else-if="error" class="p-8 text-center text-destructive">
          {{ error }}
        </div>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>URL</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="service in services" :key="service.id">
              <TableCell class="font-medium">{{ service.id }}</TableCell>
              <TableCell>{{ service.name }}</TableCell>
              <TableCell>{{ service.type }}</TableCell>
              <TableCell class="max-w-[200px] truncate" :title="service.url">{{ service.url }}</TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="icon" @click="openEditDialog(service)">
                  <Edit class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" class="text-destructive" @click="deleteService(service.id)">
                  <Trash2 class="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="services.length === 0">
              <TableCell colspan="5" class="text-center h-24 text-muted-foreground">
                No services registered.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ isEditing ? 'Edit Service' : 'Add Service' }}</DialogTitle>
          <DialogDescription>Configure webhook or HTTP browser services.</DialogDescription>
        </DialogHeader>

        <div class="grid grid-cols-2 gap-4 py-4">
          <div class="space-y-2">
            <Label for="id">Service ID <span class="text-destructive">*</span></Label>
            <Input id="id" v-model="formId" :disabled="isEditing" />
          </div>
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="formName" />
          </div>
          <div class="space-y-2">
            <Label for="type">Type <span class="text-destructive">*</span></Label>
            <Select v-model="formType">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="http">http (Sync)</SelectItem>
                <SelectItem value="webhook">webhook (Async)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="method">HTTP Method</Label>
            <Input id="method" v-model="formMethod" />
          </div>
          <div class="col-span-2 space-y-2">
            <Label for="url">Endpoint URL <span class="text-destructive">*</span></Label>
            <Input id="url" v-model="formUrl" />
          </div>
          
          <div class="col-span-2 space-y-2">
            <Label>Headers (JSON)</Label>
            <div class="h-32 border rounded-md">
              <AceEditor v-model="formHeaders" mode="json" />
            </div>
          </div>
          
          <div class="col-span-2 space-y-2">
            <Label>Payload Template (JSON)</Label>
            <div class="h-48 border rounded-md">
              <AceEditor v-model="formPayload" mode="json" />
            </div>
            <p class="text-xs text-muted-foreground">Variables available: &#123;&#123;url&#125;&#125;, &#123;&#123;urls&#125;&#125;, &#123;&#123;apiEndpoint&#125;&#125;, &#123;&#123;token&#125;&#125;</p>
          </div>
        </div>
        
        <div v-if="error" class="text-sm text-destructive">{{ error }}</div>

        <DialogFooter>
          <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
          <Button @click="saveService" :disabled="saving || !formId || !formUrl">
            <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
