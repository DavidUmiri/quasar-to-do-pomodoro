<template>
  <!-- Contenedor principal -->
  <div class="pomodoro-box">
    <!-- Contenedor de información -->
    <div class="info-container">
      <div
        :class="{ 'pomodoro-info': faseActual === 'pomodoro' }"
        class="info-item"
      >
        Pomodoro: {{ pomodoros }}
      </div>
      <div
        :class="{ 'descanso-corto-info': faseActual === 'descansoCorto' }"
        class="info-item"
      >
        Descansos cortos: {{ descansosCortos }}
      </div>
      <div
        :class="{ 'descanso-largo-info': faseActual === 'descansoLargo' }"
        class="info-item"
      >
        Descansos largos: {{ descansosLargos }}
      </div>
    </div>

    <!-- Contenedor del temporizador -->
    <div class="circle-container">
      <h1 class="circle-label">{{ formatoTiempo(temporizador) }}</h1>
    </div>

    <!-- Contenedor de botones -->
    <div class="button-container">
      <!-- Botón para iniciar/detener el temporizador -->
      <q-btn
        @click="alternarTemporizador"
        color="primary"
        :icon="intervaloTemporizador ? 'pause' : 'play_arrow'"
        class="action-button"
        rounded
      />

      <!-- Botón para reiniciar el temporizador -->
      <q-btn
        @click="resetearTemporizador"
        color="primary"
        icon="replay"
        class="action-button"
        rounded
      />

      <!-- Botón para borrar los datos -->
      <q-btn
        @click="borrarDatos"
        color="negative"
        icon="delete"
        class="action-button"
        rounded
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

const TIEMPO_POMODORO = 20 * 60; // 20 minutos
const TIEMPO_DESCANSO_CORTO = 5 * 60; // 5 minutos
const TIEMPO_DESCANSO_LARGO = 10 * 60; // 10 minutos
const TIMEOUT = 100;

export default defineComponent({
  name: "PomodoroComponente",

  data() {
    return {
      temporizador: TIEMPO_POMODORO, // Establecer tiempo inicial de Pomodoro
      intervaloTemporizador: null,
      pomodoros: 0,
      descansosCortos: 0,
      descansosLargos: 0,
      faseActual: "pomodoro",
      tiemposOriginales: {
        tiempoPomodoro: TIEMPO_POMODORO,
        tiempoDescansoCorto: TIEMPO_DESCANSO_CORTO,
        tiempoDescansoLargo: TIEMPO_DESCANSO_LARGO,
      },
    };
  },

  methods: {
    alternarTemporizador() {
      if (this.intervaloTemporizador) {
        clearInterval(this.intervaloTemporizador);
        this.intervaloTemporizador = null;
      } else {
        this.intervaloTemporizador = setInterval(() => {
          if (this.temporizador > 0) {
            this.temporizador--;
          } else {
            clearInterval(this.intervaloTemporizador);
            this.intervaloTemporizador = null;
            this.$q.notify({
              message: "¡Tiempo terminado!",
              color: "positive",
              timeout: TIMEOUT,
            });
            this.cambiarFase();
          }
          this.guardarDatos();
        }, 1000);
      }
    },

    resetearTemporizador() {
      clearInterval(this.intervaloTemporizador);
      this.intervaloTemporizador = null;

      // Reiniciar el temporizador según la fase actual
      if (this.faseActual === "pomodoro") {
        this.temporizador = TIEMPO_POMODORO;
      } else if (this.faseActual === "descansoCorto") {
        this.temporizador = TIEMPO_DESCANSO_CORTO;
      } else if (this.faseActual === "descansoLargo") {
        this.temporizador = TIEMPO_DESCANSO_LARGO;
      }

      this.guardarDatos();
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
            this.temporizador = TIEMPO_DESCANSO_LARGO;
          } else {
            this.faseActual = "descansoCorto";
            this.temporizador = TIEMPO_DESCANSO_CORTO;
          }
          break;
        case "descansoCorto":
          this.descansosCortos++;
          this.faseActual = "pomodoro";
          this.temporizador = TIEMPO_POMODORO;
          break;
        case "descansoLargo":
          this.descansosLargos++;
          this.faseActual = "pomodoro";
          this.temporizador = TIEMPO_POMODORO;
          break;
        default:
          break;
      }
      this.guardarDatos();
    },

    guardarDatos() {
      const datos = {
        pomodoros: this.pomodoros,
        descansosCortos: this.descansosCortos,
        descansosLargos: this.descansosLargos,
        faseActual: this.faseActual,
        temporizador: this.temporizador,
      };
      localStorage.setItem("pomodoroDatos", JSON.stringify(datos));
    },

    cargarDatos() {
      const datos = JSON.parse(localStorage.getItem("pomodoroDatos"));
      if (datos) {
        this.pomodoros = datos.pomodoros;
        this.descansosCortos = datos.descansosCortos;
        this.descansosLargos = datos.descansosLargos;
        this.faseActual = datos.faseActual;
        this.temporizador = datos.temporizador;
      }
    },

    // Método para borrar los datos guardados en localStorage
    borrarDatos() {
      localStorage.removeItem("pomodoroDatos");
      this.pomodoros = 0;
      this.descansosCortos = 0;
      this.descansosLargos = 0;
      this.faseActual = "pomodoro";
      this.temporizador = TIEMPO_POMODORO;
      this.guardarDatos(); // Guardar los datos vacíos después de borrar
    },
  },

  mounted() {
    this.cargarDatos();
  },
});
</script>
