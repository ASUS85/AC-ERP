import { i as api } from "./router-CU8xXL5-.js";
const getPaiements = (params) => api.get("/paiements", { params });
const createPaiement = (data) => api.post("/paiements", data);
export {
  createPaiement as c,
  getPaiements as g
};
