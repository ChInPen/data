import { createVuetify } from 'vuetify'
import 'vuetify/styles' // Vuetify 樣式
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// icon
import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { mdi } from 'vuetify/iconsets/mdi'
import { fa } from 'vuetify/iconsets/fa'

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          'on-surface': '#000000'
        }
      },
      dark: {
        colors: {
          'on-surface': '#e4e9ed'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
      fa
    }
  }
})
