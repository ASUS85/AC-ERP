import api from "./client";

export const getCategories = (params?: Record<string, unknown>) =>
  api.get("/categories", { params });

