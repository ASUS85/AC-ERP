import { i as api } from "./router-Ccz3J_v4.js";
const getFactures = (params) => api.get("/factures", { params });
const getFactureById = (id) => api.get(`/factures/${id}`);
const getFacturePdf = (id) => api.get(`/factures/${id}/pdf`, {
  responseType: "blob"
});
const envoyerFacture = (id) => api.post(`/factures/${id}/envoyer`);
export {
  getFactureById as a,
  getFacturePdf as b,
  envoyerFacture as e,
  getFactures as g
};
