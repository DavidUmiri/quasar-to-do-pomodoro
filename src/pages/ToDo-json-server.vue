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
// Importando funciones necesarias desde módulos externos
import { useQuasar } from "quasar";
import { ref, onMounted } from "vue";
import {
  getTareas,
  postTarea,
  deleteTarea,
  updateTarea,
} from "../db/jsonServer";

// Constante para el tiempo de espera en notificaciones
const TIMEOUT = 100;

// Exportando el componente Vue
export default {
  // Nombre del componente
  name: "ToDoComponente",

  // Función de configuración de Vue 3
  setup() {
    // Utilizando funciones de Quasar y datos reactivos de Vue
    const $q = useQuasar();
    const nuevaTarea = ref("");
    const tareas = ref([]);
    const tareaInput = ref(null);

    // Gancho del ciclo de vida: se ejecuta después de montar el componente
    onMounted(() => {
      // Enfocar en el campo de entrada si existe
      tareaInput.value && tareaInput.value.focus();
    });

    // Obtener tareas desde el servidor cuando el componente está montado
    getTareas()
      .then((response) => {
        tareas.value = response.data;
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });

    // Función para agregar una tarea
    const agregarTarea = () => {
      agregarNuevaTarea();
    };

    // Función para agregar una nueva tarea
    const agregarNuevaTarea = () => {
      // Verificar si la tarea no está vacía
      if (nuevaTarea.value.trim() !== "") {
        // Enviar una solicitud POST para agregar la tarea
        postTarea({
          titulo: nuevaTarea.value,
          hecha: false,
        })
          .then((response) => {
            // Actualizar el array de tareas con la nueva tarea
            tareas.value.push(response.data);
            nuevaTarea.value = "";
            // Notificar al usuario sobre la adición exitosa
            $q.notify({
              message: "Tarea agregada correctamente",
              color: "positive",
              timeout: TIMEOUT,
            });
          })
          .catch((error) => {
            // Manejar errores y notificar al usuario
            console.error(error);
            $q.notify({
              message: "Error al agregar la tarea",
              color: "negative",
              timeout: TIMEOUT,
            });
          });
      } else {
        // Notificar al usuario si la tarea está vacía
        console.log("La tarea está vacía");
        $q.notify({
          message: "La tarea está vacía",
          color: "negative",
          timeout: TIMEOUT,
        });
      }
    };

    // Función para alternar el estado de completado de una tarea
    const alternarTarea = (tarea) => {
      // Crear un nuevo objeto de tarea con el estado de completado opuesto
      const nuevaTarea = { ...tarea, hecha: !tarea.hecha };
      // Enviar una solicitud PUT para actualizar el estado de completado de la tarea
      updateTarea(nuevaTarea)
        .then(() => {
          console.log(tarea.hecha);
          tarea.hecha = !tarea.hecha;
        })
        .catch((error) => {
          // Manejar errores y notificar al usuario
          console.error(error);
          $q.notify({
            message: "Error al actualizar el estado de la tarea",
            color: "negative",
            timeout: TIMEOUT,
          });
        });
    };

    // Función para editar una tarea mediante un cuadro de diálogo de entrada
    const editarTareaPrompt = (tarea) => {
      $q.dialog({
        title: "Editar tarea",
        message: "Introduce el nuevo título de la tarea:",
        prompt: {
          model: tarea.titulo,
          type: "text",
        },
        cancel: true,
        persistent: true,
      })
        .onOk((data) => {
          if (data.trim() !== "") {
            // Enviar una solicitud PUT para actualizar la tarea
            updateTarea({
              id: tarea.id,
              titulo: data.trim(),
              hecha: tarea.hecha,
            })
              .then(() => {
                tarea.titulo = data.trim();
                $q.notify({
                  message: "Tarea editada correctamente",
                  color: "positive",
                  timeout: TIMEOUT,
                });
              })
              .catch((error) => {
                // Manejar errores y notificar al usuario
                console.error(error);
                $q.notify({
                  message: "Error al editar la tarea",
                  color: "negative",
                  timeout: TIMEOUT,
                });
              });
          } else {
            // Notificar al usuario si la tarea está vacía
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

    // Función para eliminar una tarea mediante un cuadro de diálogo de confirmación
    const eliminarTarea = (tareaId) => {
      $q.dialog({
        title: "Confirmar",
        message: "¿Estás seguro/a de eliminar esta tarea?",
        cancel: true,
        persistent: true,
      })
        .onOk(() => {
          // Enviar una solicitud DELETE para eliminar la tarea
          deleteTarea(tareaId)
            .then(() => {
              // Filtrar las tareas para excluir la tarea eliminada
              tareas.value = tareas.value.filter((t) => t.id !== tareaId);
              // Notificar al usuario sobre la eliminación exitosa
              $q.notify({
                message: "Tarea eliminada correctamente",
                color: "positive",
                timeout: TIMEOUT,
              });
              console.log("Tarea eliminada");
            })
            .catch((error) => {
              // Manejar errores y notificar al usuario
              console.error(error);
              $q.notify({
                message: "Error al eliminar la tarea",
                color: "negative",
                timeout: TIMEOUT,
              });
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

    // Devolver las variables y funciones necesarias para el componente
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
