import { i as api } from "./router-CU8xXL5-.js";
const getDashboardOverview = () => api.get("/dashboard/overview");
const getDashboardPdf = () => api.get("/dashboard/export.pdf", { responseType: "blob" });
export {
  getDashboardPdf as a,
  getDashboardOverview as g
};
