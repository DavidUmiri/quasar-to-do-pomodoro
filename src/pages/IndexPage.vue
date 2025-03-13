<template>
  <q-page padding class="app-page">
    <div class="container-fluid">
      <div class="row q-col-gutter-lg">
        <!-- Columna del Pomodoro -->
        <div class="col-12 col-lg-5 order-2 order-lg-1">
          <transition appear enter-active-class="animated fadeInUp">
            <div class="pomodoro-container q-mt-md q-mt-lg-none">
              <PomodoroComponente />
            </div>
          </transition>
        </div>

        <!-- Columna de Tareas -->
        <div class="col-12 col-lg-7 order-1 order-lg-2">
          <transition appear enter-active-class="animated fadeInDown">
            <div class="todo-container">
              <ToDoComponente />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import PomodoroComponente from "./Pomodoro.vue";
import ToDoComponente from "./ToDo.vue";

export default defineComponent({
  name: "IndexPage",

  components: {
    PomodoroComponente,
    ToDoComponente,
  },

  head() {
    return {
      title: "Time To Do - Mejora tu productividad",
    };
  },
});
</script>

<style lang="scss">
.app-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0));
}

.container-fluid {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
}

.pomodoro-container,
.todo-container {
  height: 100%;
}

/* Animaciones de entrada */
.animated {
  animation-duration: 0.6s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate3d(0, -30px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.fadeInUp {
  animation-name: fadeInUp;
}

.fadeInDown {
  animation-name: fadeInDown;
}

/* Media queries para mejorar responsive */
@media (max-width: 1199px) {
  .pomodoro-container {
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .container-fluid {
    padding: 0.5rem;
  }
}
</style>
