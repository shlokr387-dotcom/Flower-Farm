import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Flower-Farm/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        welcome: 'welcome.html',
        inside: 'inside.html',
        together: 'together.html'
      }
    }
  }
})
