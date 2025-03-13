<template>
  <div class="todo-box q-pa-md">
    <!-- Panel de control y estadísticas -->
    <q-card class="q-mb-md todo-stats-card card-hover">
      <q-card-section class="bg-primary text-white">
        <div class="row items-center justify-between">
          <div class="text-h6 text-shadow">Mis Tareas</div>
          <q-badge color="accent" class="q-ml-sm" rounded>
            {{ tareas.length }} {{ tareas.length === 1 ? "tarea" : "tareas" }}
          </q-badge>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-6 col-md-3">
            <q-item>
              <q-item-section>
                <q-item-label caption class="text-grey-8">Total</q-item-label>
                <q-item-label class="text-h6 text-weight-bold">{{
                  tareas.length
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-6 col-md-3">
            <q-item>
              <q-item-section>
                <q-item-label caption class="text-grey-8"
                  >Pendientes</q-item-label
                >
                <q-item-label class="text-h6 text-weight-bold text-secondary">{{
                  tareasPendientes
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-6 col-md-3">
            <q-item>
              <q-item-section>
                <q-item-label caption class="text-grey-8"
                  >Completadas</q-item-label
                >
                <q-item-label class="text-h6 text-weight-bold text-positive">{{
                  tareasCompletadas
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div class="col-6 col-md-3">
            <q-item>
              <q-item-section>
                <q-item-label caption class="text-grey-8"
                  >Progreso</q-item-label
                >
                <q-item-label class="text-h6 text-weight-bold text-primary">
                  {{ porcentajeCompletado }}%
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
      </q-card-section>

      <q-card-section v-if="tareasCompletadas > 0">
        <q-linear-progress
          :value="tareasCompletadas / tareas.length"
          color="positive"
          class="q-mt-sm"
          size="10px"
          rounded
        />
      </q-card-section>
    </q-card>

    <!-- Formulario para agregar tareas -->
    <q-card class="q-mb-md add-task-card card-hover">
      <q-card-section>
        <div class="add-task-container">
          <form @submit.prevent="agregarTarea">
            <div class="row items-center">
              <div class="col-12">
                <q-input
                  v-model="nuevaTarea"
                  label="¿Qué necesitas hacer?"
                  class="add-task-input"
                  filled
                  autofocus
                  ref="tareaInput"
                  @keyup.enter.prevent="agregarTarea"
                  hide-bottom-space
                >
                  <template v-slot:prepend>
                    <q-icon name="task_alt" color="primary" />
                  </template>
                  <template v-slot:append>
                    <div class="row items-center">
                      <q-icon
                        v-if="nuevaTarea"
                        name="close"
                        class="cursor-pointer q-mr-sm"
                        @click="nuevaTarea = ''"
                      />
                      <q-btn
                        round
                        dense
                        color="primary"
                        icon="add"
                        :disable="nuevaTarea.trim() === ''"
                        @click.prevent="agregarTarea"
                      />
                    </div>
                  </template>
                </q-input>
              </div>
            </div>
          </form>
        </div>
      </q-card-section>
    </q-card>

    <!-- Opciones de filtrado y ordenación -->
    <q-card class="q-mb-md filter-card card-hover">
      <q-card-section class="q-pa-sm">
        <div class="row items-center justify-between q-gutter-md">
          <q-btn-toggle
            v-model="filtro"
            class="my-custom-toggle"
            toggle-color="primary"
            color="white"
            text-color="primary"
            :options="[
              { label: 'Todas', value: 'todas' },
              { label: 'Pendientes', value: 'pendientes' },
              { label: 'Completadas', value: 'completadas' },
            ]"
          />

          <q-select
            v-model="ordenacion"
            :options="opcionesOrdenacion"
            label="Ordenar por"
            dense
            outlined
            class="filter-select"
            options-dense
            emit-value
            map-options
            style="min-width: 150px"
          />

          <q-btn
            v-if="tareasCompletadas > 0"
            label="Limpiar completadas"
            color="negative"
            outline
            icon="delete_sweep"
            @click="confirmarLimpiarCompletadas"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Lista de tareas -->
    <div class="task-list-container">
      <transition-group tag="div" name="task-list" class="task-list">
        <q-card
          v-for="tarea in tareasFiltradas"
          :key="tarea.id"
          class="q-mb-sm task-item card-hover"
          :class="{ 'task-completed': tarea.hecha }"
        >
          <q-item>
            <q-item-section avatar>
              <q-checkbox
                v-model="tarea.hecha"
                color="positive"
                class="task-checkbox"
                size="md"
                @update:model-value="() => alternarTarea(tarea)"
              />
            </q-item-section>

            <q-item-section
              class="task-content cursor-pointer"
              @click="() => alternarTarea(tarea)"
            >
              <q-item-label
                :class="{ 'task-item-done': tarea.hecha }"
                class="task-title text-subtitle1"
              >
                {{ tarea.titulo }}
              </q-item-label>
              <q-item-label caption class="task-date">
                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                {{ formatFecha(tarea.id) }}
              </q-item-label>
            </q-item-section>

            <q-item-section side class="task-actions">
              <div class="row q-gutter-xs">
                <q-btn
                  @click.stop="editarTareaPrompt(tarea)"
                  flat
                  round
                  color="info"
                  icon="edit"
                  size="sm"
                >
                  <q-tooltip>Editar tarea</q-tooltip>
                </q-btn>
                <q-btn
                  @click.stop="eliminarTareaConfirm(tarea.id)"
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                >
                  <q-tooltip>Eliminar tarea</q-tooltip>
                </q-btn>
              </div>
            </q-item-section>
          </q-item>
        </q-card>
      </transition-group>
    </div>

    <!-- Estado sin tareas -->
    <div v-if="!tareasFiltradas.length" class="no-tasks-container">
      <q-card class="card-hover no-tasks-card">
        <q-card-section class="flex flex-center column">
          <q-icon
            name="done_all"
            size="100px"
            color="primary"
            class="q-mb-md no-tasks-icon"
          />
          <div class="text-h6 text-center">{{ getMensajeVacio() }}</div>
          <div class="text-caption text-grey-8 text-center q-mt-sm">
            {{ getSubtituloVacio() }}
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { format, fromUnixTime } from "date-fns";
import { es } from "date-fns/locale";

// Constante para el tiempo de espera en notificaciones
const NOTIFICACION_TIMEOUT = 3000;

export default {
  name: "ToDoComponente",

  setup() {
    const $q = useQuasar();
    const nuevaTarea = ref("");
    const tareas = ref([]);
    const tareaInput = ref(null);
    const filtro = ref("todas");
    const ordenacion = ref("fecha-desc");

    const opcionesOrdenacion = [
      { label: "Más recientes primero", value: "fecha-desc" },
      { label: "Más antiguas primero", value: "fecha-asc" },
      { label: "Alfabéticamente (A-Z)", value: "alfa-asc" },
      { label: "Alfabéticamente (Z-A)", value: "alfa-desc" },
      { label: "Completadas primero", value: "completadas-primero" },
      { label: "Pendientes primero", value: "pendientes-primero" },
    ];

    // Estadísticas calculadas
    const tareasCompletadas = computed(() => {
      return tareas.value.filter((t) => t.hecha).length;
    });

    const tareasPendientes = computed(() => {
      return tareas.value.filter((t) => !t.hecha).length;
    });

    const porcentajeCompletado = computed(() => {
      if (tareas.value.length === 0) return 0;
      return Math.round((tareasCompletadas.value / tareas.value.length) * 100);
    });

    // Tareas filtradas y ordenadas
    const tareasFiltradas = computed(() => {
      // Primero filtramos
      let resultado = tareas.value;

      if (filtro.value === "pendientes") {
        resultado = resultado.filter((tarea) => !tarea.hecha);
      } else if (filtro.value === "completadas") {
        resultado = resultado.filter((tarea) => tarea.hecha);
      }

      // Luego ordenamos
      return resultado.slice().sort((a, b) => {
        switch (ordenacion.value) {
          case "fecha-desc":
            return b.id - a.id;
          case "fecha-asc":
            return a.id - b.id;
          case "alfa-asc":
            return a.titulo.localeCompare(b.titulo);
          case "alfa-desc":
            return b.titulo.localeCompare(a.titulo);
          case "completadas-primero":
            return b.hecha - a.hecha;
          case "pendientes-primero":
            return a.hecha - b.hecha;
          default:
            return 0;
        }
      });
    });

    // Actualizar datos en localStorage cuando cambian
    watch(
      [tareas, filtro, ordenacion],
      () => {
        guardarTareas();
        guardarPreferencias();
      },
      { deep: true }
    );

    // Verificar almacenamiento disponible
    const isStorageAvailable = () => {
      try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        console.error("LocalStorage no disponible:", e);
        return false;
      }
    };

    // Cargar tareas desde LocalStorage
    const cargarTareas = () => {
      if (!isStorageAvailable()) {
        $q.notify({
          message: "No se puede acceder al almacenamiento local",
          color: "negative",
          icon: "warning",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });
        return;
      }

      try {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
          tareas.value = JSON.parse(savedTasks);
        }

        // Cargar preferencias de usuario
        const savedPrefs = localStorage.getItem("taskPrefs");
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs);
          if (prefs.filtro) filtro.value = prefs.filtro;
          if (prefs.ordenacion) ordenacion.value = prefs.ordenacion;
        }
      } catch (e) {
        console.error("Error al cargar datos:", e);
        // Si hay error, reiniciar tareas
        tareas.value = [];
        localStorage.removeItem("tasks");

        $q.notify({
          message: "Error al cargar tareas",
          caption: "Se han restablecido las tareas",
          color: "negative",
          icon: "error",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });
      }
    };

    // Guardar tareas en LocalStorage
    const guardarTareas = () => {
      if (!isStorageAvailable()) return;

      try {
        localStorage.setItem("tasks", JSON.stringify(tareas.value));
      } catch (e) {
        console.error("Error al guardar tareas:", e);
        $q.notify({
          message: "Error al guardar tareas",
          color: "negative",
          icon: "error",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });
      }
    };

    // Guardar preferencias de usuario
    const guardarPreferencias = () => {
      if (!isStorageAvailable()) return;

      try {
        localStorage.setItem(
          "taskPrefs",
          JSON.stringify({
            filtro: filtro.value,
            ordenacion: ordenacion.value,
          })
        );
      } catch (e) {
        console.error("Error al guardar preferencias:", e);
      }
    };

    // Añadir una nueva tarea
    const agregarTarea = () => {
      if (nuevaTarea.value.trim() === "") return;

      try {
        const nueva = {
          id: Date.now(),
          titulo: nuevaTarea.value.trim(),
          hecha: false,
        };
        tareas.value.unshift(nueva);
        nuevaTarea.value = "";

        // Guardar inmediatamente los cambios
        guardarTareas();

        $q.notify({
          message: "Tarea agregada correctamente",
          caption: "La tarea ha sido añadida a tu lista",
          icon: "check_circle",
          color: "positive",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });

        // Si estaba en filtro de completadas, cambiar a todas
        if (filtro.value === "completadas") {
          filtro.value = "todas";
        }

        // Enfocar nuevamente el campo de entrada
        setTimeout(() => {
          if (tareaInput.value) {
            tareaInput.value.focus();
          }
        }, 100);
      } catch (error) {
        console.error("Error al agregar tarea:", error);
        $q.notify({
          message: "Error al agregar la tarea",
          color: "negative",
          icon: "error",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });
      }
    };

    // Alternar el estado de una tarea
    const alternarTarea = (tarea) => {
      // Ahora el valor ya está cambiado por v-model, así que no necesitamos invertirlo
      // Solo necesitamos guardar y mostrar la notificación si está completada

      // Guardar explícitamente para asegurar que se persisten los cambios
      guardarTareas();

      if (tarea.hecha) {
        $q.notify({
          message: "¡Tarea completada!",
          color: "positive",
          icon: "done",
          position: "bottom-right",
          timeout: 2000,
        });
      }
    };

    // Editar una tarea
    const editarTareaPrompt = (tarea) => {
      const tareaOriginal = { ...tarea };

      $q.dialog({
        title: "Editar tarea",
        message: "Introduce el nuevo título de la tarea:",
        prompt: {
          model: tarea.titulo,
          type: "text",
        },
        cancel: true,
        persistent: true,
        color: "primary",
      }).onOk((data) => {
        if (data.trim() !== "") {
          tarea.titulo = data.trim();
          guardarTareas(); // Guardar explícitamente

          $q.notify({
            message: "Tarea editada correctamente",
            color: "info",
            icon: "edit",
            position: "top",
            timeout: NOTIFICACION_TIMEOUT,
          });
        } else {
          // Si está vacío, restaurar valor original
          tarea.titulo = tareaOriginal.titulo;

          $q.notify({
            message: "La tarea no puede estar vacía",
            color: "negative",
            icon: "warning",
            position: "top",
            timeout: NOTIFICACION_TIMEOUT,
          });
        }
      });
    };

    // Confirmar eliminación de una tarea
    const eliminarTareaConfirm = (tareaId) => {
      $q.dialog({
        title: "Confirmar eliminación",
        message: "¿Estás seguro/a de eliminar esta tarea?",
        cancel: true,
        persistent: true,
        ok: {
          color: "negative",
          label: "Eliminar",
        },
        cancel: {
          flat: true,
          label: "Cancelar",
        },
      }).onOk(() => {
        eliminarTarea(tareaId);
      });
    };

    // Eliminar una tarea
    const eliminarTarea = (tareaId) => {
      try {
        tareas.value = tareas.value.filter((t) => t.id !== tareaId);
        guardarTareas(); // Guardar explícitamente

        $q.notify({
          message: "Tarea eliminada correctamente",
          color: "negative",
          icon: "delete",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });

        // Si no quedan tareas completadas y el filtro es "completadas", cambiar a "todas"
        if (filtro.value === "completadas" && tareasCompletadas.value === 0) {
          filtro.value = "todas";
        }
      } catch (error) {
        console.error("Error al eliminar tarea:", error);
      }
    };

    // Confirmar limpieza de tareas completadas
    const confirmarLimpiarCompletadas = () => {
      if (tareasCompletadas.value === 0) return;

      $q.dialog({
        title: "Confirmar acción",
        message: `¿Estás seguro/a de eliminar ${tareasCompletadas.value} tareas completadas?`,
        cancel: true,
        persistent: true,
        ok: {
          color: "negative",
          label: "Eliminar",
        },
        cancel: {
          flat: true,
          label: "Cancelar",
        },
      }).onOk(() => {
        limpiarTareasCompletadas();
      });
    };

    // Limpiar tareas completadas
    const limpiarTareasCompletadas = () => {
      try {
        const numEliminadas = tareasCompletadas.value;
        tareas.value = tareas.value.filter((tarea) => !tarea.hecha);
        guardarTareas(); // Guardar explícitamente

        $q.notify({
          message: `${numEliminadas} tareas eliminadas`,
          caption: "Se han eliminado todas las tareas completadas",
          color: "negative",
          icon: "delete_sweep",
          position: "top",
          timeout: NOTIFICACION_TIMEOUT,
        });

        // Si el filtro estaba en "completadas", cambiar a "todas"
        if (filtro.value === "completadas") {
          filtro.value = "todas";
        }
      } catch (error) {
        console.error("Error al limpiar tareas completadas:", error);
      }
    };

    // Formatear la fecha usando date-fns
    const formatFecha = (timestamp) => {
      try {
        // Convertir el timestamp a una fecha válida
        const fecha = new Date(timestamp);
        return format(fecha, "d 'de' MMMM, HH:mm", { locale: es });
      } catch (e) {
        console.error("Error al formatear fecha:", e);
        return "Fecha desconocida";
      }
    };

    // Obtener mensaje según filtro actual
    const getMensajeVacio = () => {
      if (filtro.value === "todas") {
        return "¡No hay tareas pendientes!";
      } else if (filtro.value === "pendientes") {
        return "¡No tienes tareas pendientes!";
      } else {
        return "No hay tareas completadas";
      }
    };

    // Obtener subtítulo según filtro actual
    const getSubtituloVacio = () => {
      if (filtro.value === "todas" || filtro.value === "pendientes") {
        return "Añade nuevas tareas usando el formulario de arriba";
      } else {
        return "Completa algunas tareas para verlas aquí";
      }
    };

    // Función para guardar datos antes de cerrar
    const guardarAntesDeSalir = () => {
      guardarTareas();
      guardarPreferencias();
    };

    // Registrar evento para guardar datos cuando la página se cierra
    window.addEventListener("beforeunload", guardarAntesDeSalir);

    // Hook del ciclo de vida
    onMounted(() => {
      // Intentar enfocar el campo de entrada
      setTimeout(() => {
        if (tareaInput.value) {
          tareaInput.value.focus();
        }
      }, 300);

      // Cargar tareas
      cargarTareas();
    });

    // Limpiar eventos antes de desmontar
    onUnmounted(() => {
      window.removeEventListener("beforeunload", guardarAntesDeSalir);
    });

    return {
      nuevaTarea,
      tareas,
      tareasFiltradas,
      filtro,
      ordenacion,
      opcionesOrdenacion,
      tareasCompletadas,
      tareasPendientes,
      porcentajeCompletado,
      tareaInput,
      agregarTarea,
      eliminarTarea,
      eliminarTareaConfirm,
      alternarTarea,
      editarTareaPrompt,
      formatFecha,
      confirmarLimpiarCompletadas,
      getMensajeVacio,
      getSubtituloVacio,
    };
  },
};
</script>

<style lang="scss" scoped>
.todo-box {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
}

.todo-stats-card,
.add-task-card,
.filter-card,
.no-tasks-card,
.task-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.task-list-container {
  height: auto;
  max-height: 55vh;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 5px;
}

.task-list {
  width: 100%;
}

.task-item {
  position: relative;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  overflow: visible;

  &:hover {
    transform: translateX(5px);
  }

  &.task-completed {
    opacity: 0.75;
    &:hover {
      opacity: 1;
    }
  }
}

.task-item-done {
  text-decoration: line-through;
  color: rgba(128, 128, 128, 0.7);
}

.task-checkbox {
  transform: scale(1.2);
}

.task-content {
  transition: all 0.3s ease;
}

.task-title {
  font-weight: 500;
  transition: all 0.3s ease;
}

.task-date {
  font-size: 0.75rem;
  color: #888;
}

.task-actions {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.no-tasks-container {
  padding: 1rem;
  text-align: center;
}

.no-tasks-card {
  padding: 2rem 1rem;
}

.no-tasks-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

// Animaciones para la lista de tareas
.task-list-move,
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.5s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.task-list-leave-active {
  position: absolute;
}

.add-task-container {
  width: 100%;
}

@media (max-width: 768px) {
  .task-list-container {
    max-height: 40vh;
  }

  .task-actions {
    opacity: 1;
  }

  .add-task-container {
    margin-bottom: 10px;
  }

  .task-item:hover {
    transform: none;
  }
}
</style>
