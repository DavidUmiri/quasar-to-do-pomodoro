<template>
  <div class="todo-box">
    <div class="add-task-container">
      <q-input
        v-model="nuevaTarea"
        @keyup.enter="agregarTarea"
        class="add-task-input"
        square
        filled
        placeholder="Añadir tarea"
        dense
        ref="tareaInput"
      >
        <template v-slot:append>
          <q-btn @click="agregarTarea" round dense flat icon="add" />
        </template>
      </q-input>
    </div>

    <div class="task-list">
      <q-list separator bordered>
        <q-item v-for="(tarea, indice) in tareas" :key="indice" v-ripple>
          <q-item-section avatar @click="alternarTarea(tarea)">
            <q-checkbox v-model="tarea.hecha" color="primary" />
          </q-item-section>
          <q-item-section @click="alternarTarea(tarea)">
            <q-item-label :class="{ 'task-item-done': tarea.hecha }">{{
              tarea.titulo
            }}</q-item-label>
          </q-item-section>
          <q-item-section v-if="tarea.hecha" side>
            <q-btn
              @click.stop="eliminarTarea(tarea.id)"
              flat
              round
              dense
              color="negative"
              icon="delete"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn
              @click.stop="editarTareaPrompt(tarea)"
              flat
              round
              dense
              color="primary"
              icon="edit"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div v-if="!tareas.length" class="no-tasks">
      <q-icon name="check" size="100px" class="no-tasks-icon" color="primary" />
      <div class="no-tasks-message">No hay tareas</div>
    </div>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { ref, onMounted } from "vue";

// Constante para el tiempo de espera en notificaciones
const TIMEOUT = 100;

export default {
  name: "ToDoComponente",

  setup() {
    const $q = useQuasar();
    const nuevaTarea = ref("");
    const tareas = ref([]);
    const tareaInput = ref(null);

    // Cargar tareas desde LocalStorage al montar el componente
    onMounted(() => {
      tareaInput.value && tareaInput.value.focus();
      cargarTareas(); // Cargar tareas guardadas en LocalStorage
    });

    // Función para cargar tareas desde LocalStorage
    const cargarTareas = () => {
      const savedTasks = JSON.parse(localStorage.getItem("tasks"));
      if (savedTasks) {
        tareas.value = savedTasks;
      }
    };

    // Función para guardar tareas en LocalStorage
    const guardarTareas = () => {
      localStorage.setItem("tasks", JSON.stringify(tareas.value));
    };

    // Función para agregar una tarea
    const agregarTarea = () => {
      if (nuevaTarea.value.trim() !== "") {
        const nueva = {
          id: Date.now(), // Genera un ID único con timestamp
          titulo: nuevaTarea.value,
          hecha: false,
        };
        tareas.value.push(nueva);
        nuevaTarea.value = "";
        guardarTareas();
        $q.notify({
          message: "Tarea agregada correctamente",
          color: "positive",
          timeout: TIMEOUT,
        });
      } else {
        $q.notify({
          message: "La tarea está vacía",
          color: "negative",
          timeout: TIMEOUT,
        });
      }
    };

    // Función para alternar el estado de completado de una tarea
    const alternarTarea = (tarea) => {
      tarea.hecha = !tarea.hecha;
      guardarTareas();
    };

    // Función para editar una tarea
    const editarTareaPrompt = (tarea) => {
      $q.dialog({
        title: "Editar tarea",
        message: "Introduce el nuevo título de la tarea:",
        prompt: { model: tarea.titulo, type: "text" },
        cancel: true,
        persistent: true,
      })
        .onOk((data) => {
          if (data.trim() !== "") {
            tarea.titulo = data.trim();
            guardarTareas();
            $q.notify({
              message: "Tarea editada correctamente",
              color: "positive",
              timeout: TIMEOUT,
            });
          } else {
            $q.notify({
              message: "La tarea está vacía",
              color: "negative",
              timeout: TIMEOUT,
            });
          }
        })
        .onCancel(() => {
          $q.notify({
            message: "Operación cancelada",
            color: "negative",
            timeout: TIMEOUT,
          });
        });
    };

    // Función para eliminar una tarea
    const eliminarTarea = (tareaId) => {
      $q.dialog({
        title: "Confirmar",
        message: "¿Estás seguro/a de eliminar esta tarea?",
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          tareas.value = tareas.value.filter((t) => t.id !== tareaId);
          guardarTareas();
          $q.notify({
            message: "Tarea eliminada correctamente",
            color: "positive",
            timeout: TIMEOUT,
          });
        })
        .onCancel(() => {
          $q.notify({
            message: "Operación cancelada",
            color: "negative",
            timeout: TIMEOUT,
          });
        });
    };

    return {
      nuevaTarea,
      tareas,
      agregarTarea,
      eliminarTarea,
      alternarTarea,
      tareaInput,
      editarTareaPrompt,
    };
  },
};
</script>
