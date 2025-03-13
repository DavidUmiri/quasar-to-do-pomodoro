<template>
  <div class="pomodoro-box q-pa-md">
    <!-- Panel de fase actual -->
    <q-card class="phase-card q-mb-md card-hover">
      <q-card-section class="phase-header" :class="`bg-${getFaseColor()}`">
        <div class="text-h6 text-white text-center text-shadow">
          {{ getFaseLabel() }}
        </div>
      </q-card-section>

      <q-card-section class="phase-stats">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="timer" color="primary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Pomodoros</q-item-label>
                <q-item-label class="text-h6 text-weight-bold">{{
                  pomodoros
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-sm-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="coffee" color="secondary" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Descansos cortos</q-item-label>
                <q-item-label class="text-h6 text-weight-bold">{{
                  descansosCortos
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-12 col-sm-4">
            <q-item>
              <q-item-section avatar>
                <q-icon name="weekend" color="accent" size="md" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Descansos largos</q-item-label>
                <q-item-label class="text-h6 text-weight-bold">{{
                  descansosLargos
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Temporizador -->
    <div class="timer-container q-my-lg flex flex-center">
      <q-circular-progress
        show-value
        class="timer-progress q-ma-md"
        :value="porcentajeRestante"
        size="260px"
        :thickness="0.15"
        :color="getFaseColor()"
        track-color="grey-3"
      >
        <div class="timer-label text-center">
          <div class="text-h3 text-weight-bold">
            {{ formatoTiempo(temporizador) }}
          </div>
          <div class="text-caption">{{ getFaseLabel() }}</div>
        </div>
      </q-circular-progress>
    </div>

    <!-- Botones de control -->
    <div class="button-container flex flex-center q-gutter-md q-py-md">
      <q-btn
        @click="alternarTemporizador"
        :color="getFaseColor()"
        :icon="intervaloTemporizador ? 'pause' : 'play_arrow'"
        :label="intervaloTemporizador ? 'Pausar' : 'Iniciar'"
        class="action-button"
        rounded
        size="lg"
        unelevated
      />

      <q-btn
        @click="resetearTemporizador"
        color="info"
        icon="replay"
        label="Reiniciar"
        class="action-button"
        rounded
        size="lg"
        unelevated
      />

      <q-btn
        @click="confirmarBorrarDatos"
        color="negative"
        icon="delete"
        label="Borrar"
        class="action-button"
        rounded
        size="lg"
        unelevated
      />
    </div>

    <!-- Configuración -->
    <q-expansion-item
      icon="settings"
      label="Configuración"
      class="settings-section q-mt-md"
      header-class="text-primary"
      expand-separator
    >
      <q-card>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <q-input
                v-model.number="tiemposConfig.tiempoPomodoro"
                label="Duración Pomodoro (min)"
                type="number"
                filled
                min="1"
                max="60"
                @change="guardarConfiguracion"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model.number="tiemposConfig.tiempoDescansoCorto"
                label="Duración descanso corto (min)"
                type="number"
                filled
                min="1"
                max="30"
                @change="guardarConfiguracion"
              />
            </div>
            <div class="col-12 col-sm-4">
              <q-input
                v-model.number="tiemposConfig.tiempoDescansoLargo"
                label="Duración descanso largo (min)"
                type="number"
                filled
                min="1"
                max="60"
                @change="guardarConfiguracion"
              />
            </div>
          </div>
          <div class="row q-mt-md">
            <div class="col-12">
              <q-toggle
                v-model="tiemposConfig.notificaciones"
                label="Notificaciones sonoras"
                color="primary"
                @change="guardarConfiguracion"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script>
import { defineComponent, onUnmounted } from "vue";
import { useQuasar } from "quasar";

// Constantes predeterminadas
const MINUTO = 60; // 60 segundos
const TIEMPO_POMODORO_DEFAULT = 25 * MINUTO; // 25 minutos
const TIEMPO_DESCANSO_CORTO_DEFAULT = 5 * MINUTO; // 5 minutos
const TIEMPO_DESCANSO_LARGO_DEFAULT = 15 * MINUTO; // 15 minutos
const NOTIFICACION_TIMEOUT = 5000; // 5 segundos

export default defineComponent({
  name: "PomodoroComponente",

  setup() {
    const $q = useQuasar();
    return { $q };
  },

  data() {
    return {
      temporizador: TIEMPO_POMODORO_DEFAULT,
      tiempoTotal: TIEMPO_POMODORO_DEFAULT,
      intervaloTemporizador: null,
      ultimaActualizacion: null,
      pomodoros: 0,
      descansosCortos: 0,
      descansosLargos: 0,
      faseActual: "pomodoro",
      tiemposConfig: {
        tiempoPomodoro: 25,
        tiempoDescansoCorto: 5,
        tiempoDescansoLargo: 15,
        notificaciones: true,
      },
    };
  },

  computed: {
    porcentajeRestante() {
      return Math.round((this.temporizador / this.tiempoTotal) * 100);
    },
  },

  methods: {
    // Verificar disponibilidad de localStorage
    isStorageAvailable() {
      try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        console.error("LocalStorage no disponible:", e);
        return false;
      }
    },

    alternarTemporizador() {
      if (this.intervaloTemporizador) {
        // Detener temporizador
        clearInterval(this.intervaloTemporizador);
        this.intervaloTemporizador = null;
        this.ultimaActualizacion = null;

        this.$q.notify({
          message: "¡Temporizador pausado!",
          icon: "pause",
          color: "warning",
          position: "top",
          timeout: 2000,
        });
      } else {
        // Iniciar temporizador con compensación de tiempo
        this.ultimaActualizacion = Date.now();

        this.intervaloTemporizador = setInterval(() => {
          const ahora = Date.now();
          const tiempoPasado = Math.floor(
            (ahora - this.ultimaActualizacion) / 1000
          );
          this.ultimaActualizacion = ahora;

          // Restar el tiempo real pasado (puede ser más de 1 segundo si hay retrasos)
          if (tiempoPasado > 0) {
            // Asegurarse de que no restamos más del tiempo restante
            this.temporizador = Math.max(0, this.temporizador - tiempoPasado);
          } else {
            // En caso de problemas, restar al menos 1 segundo
            this.temporizador = Math.max(0, this.temporizador - 1);
          }

          if (this.temporizador <= 0) {
            clearInterval(this.intervaloTemporizador);
            this.intervaloTemporizador = null;
            this.ultimaActualizacion = null;

            // Notificaciones
            this.$q.notify({
              message: `¡${this.getFaseLabel()} completado!`,
              caption: "Es hora de cambiar de actividad",
              icon: "check_circle",
              color: "positive",
              position: "top",
              timeout: NOTIFICACION_TIMEOUT,
              actions: [
                {
                  label: "Cerrar",
                  color: "white",
                  handler: () => {
                    /* ... */
                  },
                },
              ],
            });

            // Reproducir sonido si está habilitado
            if (this.tiemposConfig.notificaciones) {
              this.reproducirAlarma();
            }

            this.cambiarFase();
          }

          this.guardarDatos();
        }, 1000);

        this.$q.notify({
          message: "¡Temporizador iniciado!",
          icon: "play_arrow",
          color: "positive",
          position: "top",
          timeout: 2000,
        });
      }
    },

    reproducirAlarma() {
      try {
        const audio = new Audio();
        audio.src =
          "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg";

        // Intentar reproducir varias veces si falla
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error al reproducir alarma:", error);

            // Si hay error por interacción, mostrar un mensaje
            if (error.name === "NotAllowedError") {
              this.$q.notify({
                message:
                  "No se pudo reproducir la alarma. Prueba a interactuar primero con la página.",
                color: "warning",
                position: "top",
                timeout: 3000,
              });
            }
          });
        }
      } catch (e) {
        console.error("Error al reproducir notificación", e);
      }
    },

    resetearTemporizador() {
      clearInterval(this.intervaloTemporizador);
      this.intervaloTemporizador = null;
      this.ultimaActualizacion = null;

      // Reiniciar el temporizador según la fase actual
      if (this.faseActual === "pomodoro") {
        this.temporizador = this.tiemposConfig.tiempoPomodoro * MINUTO;
      } else if (this.faseActual === "descansoCorto") {
        this.temporizador = this.tiemposConfig.tiempoDescansoCorto * MINUTO;
      } else if (this.faseActual === "descansoLargo") {
        this.temporizador = this.tiemposConfig.tiempoDescansoLargo * MINUTO;
      }
      this.tiempoTotal = this.temporizador;
      this.guardarDatos();

      this.$q.notify({
        message: "Temporizador reiniciado",
        icon: "replay",
        color: "info",
        position: "top",
        timeout: 2000,
      });
    },

    formatoTiempo(tiempo) {
      const minutos = Math.floor(tiempo / 60);
      const segundos = tiempo % 60;
      return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(
        2,
        "0"
      )}`;
    },

    cambiarFase() {
      switch (this.faseActual) {
        case "pomodoro":
          this.pomodoros++;
          if (this.pomodoros % 4 === 0) {
            this.faseActual = "descansoLargo";
            this.temporizador = this.tiemposConfig.tiempoDescansoLargo * MINUTO;
          } else {
            this.faseActual = "descansoCorto";
            this.temporizador = this.tiemposConfig.tiempoDescansoCorto * MINUTO;
          }
          break;
        case "descansoCorto":
          this.descansosCortos++;
          this.faseActual = "pomodoro";
          this.temporizador = this.tiemposConfig.tiempoPomodoro * MINUTO;
          break;
        case "descansoLargo":
          this.descansosLargos++;
          this.faseActual = "pomodoro";
          this.temporizador = this.tiemposConfig.tiempoPomodoro * MINUTO;
          break;
        default:
          break;
      }
      this.tiempoTotal = this.temporizador;
      this.guardarDatos();
    },

    guardarDatos() {
      if (!this.isStorageAvailable()) return;

      try {
        const datos = {
          pomodoros: this.pomodoros,
          descansosCortos: this.descansosCortos,
          descansosLargos: this.descansosLargos,
          faseActual: this.faseActual,
          temporizador: this.temporizador,
          tiempoTotal: this.tiempoTotal,
          tiemposConfig: this.tiemposConfig,
        };
        localStorage.setItem("pomodoroDatos", JSON.stringify(datos));
      } catch (error) {
        console.error("Error al guardar datos del Pomodoro:", error);
      }
    },

    cargarDatos() {
      if (!this.isStorageAvailable()) {
        this.$q.notify({
          message: "No se puede acceder al almacenamiento local",
          color: "negative",
          icon: "warning",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });
        return;
      }

      try {
        const datos = JSON.parse(localStorage.getItem("pomodoroDatos"));
        if (datos) {
          this.pomodoros = datos.pomodoros || 0;
          this.descansosCortos = datos.descansosCortos || 0;
          this.descansosLargos = datos.descansosLargos || 0;
          this.faseActual = datos.faseActual || "pomodoro";
          this.temporizador =
            datos.temporizador || this.tiemposConfig.tiempoPomodoro * MINUTO;
          this.tiempoTotal = datos.tiempoTotal || this.temporizador;

          // Cargar configuración si existe
          if (datos.tiemposConfig) {
            this.tiemposConfig = datos.tiemposConfig;
          }
        }
      } catch (e) {
        console.error("Error al cargar datos del Pomodoro", e);
        // Restablecer a valores predeterminados si hay un error
        this.borrarDatos();

        this.$q.notify({
          message: "Error al cargar datos del Pomodoro",
          caption: "Se han restablecido los valores predeterminados",
          color: "negative",
          icon: "error",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });
      }
    },

    confirmarBorrarDatos() {
      this.$q
        .dialog({
          title: "Confirmar",
          message:
            "¿Estás seguro de que quieres borrar todos los datos del Pomodoro?",
          cancel: true,
          persistent: true,
          ok: {
            color: "negative",
            label: "Borrar",
          },
          cancel: {
            flat: true,
            label: "Cancelar",
          },
        })
        .onOk(() => {
          this.borrarDatos();
        });
    },

    borrarDatos() {
      clearInterval(this.intervaloTemporizador);
      this.intervaloTemporizador = null;
      this.ultimaActualizacion = null;

      if (this.isStorageAvailable()) {
        localStorage.removeItem("pomodoroDatos");
      }

      this.pomodoros = 0;
      this.descansosCortos = 0;
      this.descansosLargos = 0;
      this.faseActual = "pomodoro";
      this.temporizador = this.tiemposConfig.tiempoPomodoro * MINUTO;
      this.tiempoTotal = this.temporizador;

      this.guardarDatos();

      this.$q.notify({
        message: "Datos borrados correctamente",
        icon: "delete",
        color: "negative",
        position: "top",
        timeout: 2000,
      });
    },

    getFaseLabel() {
      switch (this.faseActual) {
        case "pomodoro":
          return "Tiempo de trabajo";
        case "descansoCorto":
          return "Descanso corto";
        case "descansoLargo":
          return "Descanso largo";
        default:
          return "Pomodoro";
      }
    },

    getFaseColor() {
      switch (this.faseActual) {
        case "pomodoro":
          return "primary";
        case "descansoCorto":
          return "secondary";
        case "descansoLargo":
          return "accent";
        default:
          return "primary";
      }
    },

    guardarConfiguracion() {
      // Validar los valores
      this.tiemposConfig.tiempoPomodoro = Math.max(
        1,
        Math.min(60, this.tiemposConfig.tiempoPomodoro)
      );
      this.tiemposConfig.tiempoDescansoCorto = Math.max(
        1,
        Math.min(30, this.tiemposConfig.tiempoDescansoCorto)
      );
      this.tiemposConfig.tiempoDescansoLargo = Math.max(
        1,
        Math.min(60, this.tiemposConfig.tiempoDescansoLargo)
      );

      // Actualizar el temporizador actual si es necesario
      this.resetearTemporizador();

      this.$q.notify({
        message: "Configuración guardada",
        icon: "save",
        color: "positive",
        position: "top",
        timeout: 2000,
      });
    },

    solicitarPermisoNotificaciones() {
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            this.$q.notify({
              message: "Notificaciones habilitadas",
              color: "positive",
              position: "top",
              timeout: 2000,
            });
          } else if (permission === "denied") {
            this.tiemposConfig.notificaciones = false;
            this.$q.notify({
              message: "Permiso de notificaciones denegado",
              caption: "No se mostrarán notificaciones de escritorio",
              color: "warning",
              position: "top",
              timeout: 3000,
            });
          }
        });
      } else {
        console.log("Este navegador no soporta notificaciones de escritorio");
      }
    },

    // Función para guardar antes de cerrar
    guardarAntesDeSalir() {
      this.guardarDatos();
    },
  },

  mounted() {
    this.cargarDatos();

    // Asegurarse que tiempoTotal está configurado
    if (!this.tiempoTotal) {
      this.tiempoTotal = this.temporizador;
    }

    // Registrar evento para guardar datos cuando la página se cierra
    window.addEventListener("beforeunload", this.guardarAntesDeSalir);

    // Habilitar notificaciones si están disponibles
    if (this.tiemposConfig.notificaciones) {
      this.solicitarPermisoNotificaciones();
    }
  },

  beforeUnmount() {
    // Limpieza
    if (this.intervaloTemporizador) {
      clearInterval(this.intervaloTemporizador);
    }

    // Eliminar el listener de eventos
    window.removeEventListener("beforeunload", this.guardarAntesDeSalir);
  },
});
</script>

<style lang="scss" scoped>
.pomodoro-box {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.phase-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.phase-header {
  padding: 12px;
  transition: background-color 0.3s ease;
}

.phase-stats {
  padding: 12px;
}

.timer-container {
  position: relative;
  margin: 2rem auto;
  transition: all 0.3s ease;
}

.timer-progress {
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.timer-label {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.button-container {
  flex-wrap: wrap;
}

.action-button {
  min-width: 150px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
}

.settings-section {
  max-width: 800px;
  margin: 1rem auto;
}

@media (max-width: 768px) {
  .timer-progress {
    size: 200px !important;
  }

  .action-button {
    min-width: 120px;
  }
}
</style>
