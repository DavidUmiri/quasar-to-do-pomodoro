<script>
import PomodoroComponente from "./Pomodoro.vue";
import ToDoComponente from "./ToDo.vue";

export default {
  components: {
    PomodoroComponente,
    ToDoComponente,
  },
};
</script>
<template>
  <div class="app-container">
    <PomodoroComponente />
    <ToDoComponente />
  </div>
</template>

<style lang="scss">
body {
  font-family: "Arial", sans-serif;
  // background-color: #f4f4f4;
  box-sizing: border-box;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.app-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  max-height: 90vh;
  width: 100%;
}

.todo-box {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto; 
  max-height: 90vh;
}

.task-item-done {
    text-decoration: line-through; 
    color: rgba(128, 128, 128, 0.7); 
  }

.add-task-container {
  margin-bottom: 20px;
}

.q-field--square .q-field__control {
  width: 100vh;
}

.q-field {
  width: 100%;
  max-width: 400px;
}

.task-list {
  width: 100%;
  max-width: 400px;
}

.no-tasks {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 10px;
  color: #777;
}

.pomodoro-box {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  // background-color: #f8f8f8;
}

.info-container {
  // margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
}

.info-item {
  margin-bottom: 10px;
  color: #555;
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  width: 100%;
}

.pomodoro-info {
  background-color: $primary;
  color: #fff;
}

.descanso-corto-info {
  background-color: $primary;
  color: #fff;
}

.descanso-largo-info {
  background-color: $primary;
  color: #fff;
}

.circle-label {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #fff;
  background-color: $primary;
  border-radius: 50%;
}


.button-container {
  display: flex;
  gap: 10px;
}

.action-button {
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

@media screen and (max-width: 768px) {
  .todo-box {
  max-height: 40vh;
  }
}

</style>
