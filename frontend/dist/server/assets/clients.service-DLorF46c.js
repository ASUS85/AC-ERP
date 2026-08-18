import { i as api } from "./router-CpiKU9_2.js";
const getClients = (params) => api.get("/clients", { params });
const createClient = (data) => api.post("/clients", data);
const updateClient = (id, data) => api.put(`/clients/${id}`, data);
const deleteClient = (id) => api.delete(`/clients/${id}`);
const getClientsPdf = (params) => api.get("/clients/export.pdf", { params, responseType: "blob" });
export {
  getClientsPdf as a,
  createClient as c,
  deleteClient as d,
  getClients as g,
  updateClient as u
};
