import { i as api } from "./router-B5GAJ1jr.js";
const getPaiements = (params) => api.get("/paiements", { params });
const createPaiement = (data) => api.post("/paiements", data);
export {
  createPaiement as c,
  getPaiements as g
};
