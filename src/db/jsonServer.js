import axios from "axios";

// Para Android Studio
const apiUrl = "http://192.168.1.155:3000";

// Para web
// const apiUrl = "http://localhost:3000";

export const getTareas = () => {
  return axios.get(`${apiUrl}/tareas`);
};

export const postTarea = (nuevaTarea) => {
  return axios.post(`${apiUrl}/tareas`, nuevaTarea);
};

export const deleteTarea = (tareaId) => {
  return axios.delete(`${apiUrl}/tareas/${tareaId}`);
};

export const updateTarea = (tarea) => {
  return axios.put(`${apiUrl}/tareas/${tarea.id}`, tarea);
};
