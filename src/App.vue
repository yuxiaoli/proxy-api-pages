<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { Sun, Moon } from 'lucide-vue-next'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <header class="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
      <div class="container flex h-14 items-center justify-between">
        <div class="flex items-center gap-6">
          <a href="#" class="font-bold tracking-tight">Transformer API</a>
          <nav class="hidden md:flex gap-6 text-sm font-medium">
            <router-link to="/" class="transition-colors hover:text-foreground/80" active-class="text-foreground" :class="$route.path === '/' ? 'text-foreground' : 'text-foreground/60'">Transformer</router-link>
            <router-link to="/cache" class="transition-colors hover:text-foreground/80" active-class="text-foreground" :class="$route.path === '/cache' ? 'text-foreground' : 'text-foreground/60'">Cache</router-link>
            <router-link to="/services" class="transition-colors hover:text-foreground/80" active-class="text-foreground" :class="$route.path === '/services' ? 'text-foreground' : 'text-foreground/60'">Services</router-link>
            <router-link to="/settings" class="transition-colors hover:text-foreground/80" active-class="text-foreground" :class="$route.path === '/settings' ? 'text-foreground' : 'text-foreground/60'">Settings</router-link>
          </nav>
        </div>
        <button @click="toggleDark()" class="p-2 rounded-md hover:bg-accent transition-colors">
          <Sun v-if="isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>
      </div>
    </header>

    <main class="flex-1 container py-6">
      <router-view />
    </main>
  </div>
</template>
