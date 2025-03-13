<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <q-header elevated class="bg-primary app-header">
      <q-toolbar>
        <q-toolbar-title class="text-center">
          <span class="text-shadow">Time To Do</span>
          <q-badge color="accent" class="q-ml-sm app-version">v1.0</q-badge>
        </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="brightness_medium"
          aria-label="Toggle Dark Mode"
          @click="toggleDarkMode"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.main-layout {
  .app-header {
    backdrop-filter: blur(10px);
  }

  .app-version {
    font-size: 0.7rem;
    vertical-align: top;
  }
}

.body--dark {
  .app-header {
    background: rgba(30, 30, 30, 0.8) !important;
  }
}
</style>

<script>
import { defineComponent, ref, watch } from "vue";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const $q = useQuasar();
    const isDark = ref($q.dark.isActive);

    watch(isDark, (val) => {
      $q.dark.set(val);
      localStorage.setItem("darkMode", val ? "1" : "0");
    });

    // Cargar preferencia de modo oscuro
    const loadDarkModePreference = () => {
      const darkPref = localStorage.getItem("darkMode");
      if (darkPref !== null) {
        isDark.value = darkPref === "1";
        $q.dark.set(isDark.value);
      }
    };

    // Cargar preferencias al inicio
    loadDarkModePreference();

    return {
      isDark,
      toggleDarkMode() {
        isDark.value = !isDark.value;
      },
    };
  },
});
</script>
