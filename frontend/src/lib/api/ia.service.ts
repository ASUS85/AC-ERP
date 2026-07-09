import api from "./client";

export const getPrevisionsVentes = (params?: Record<string, unknown>) =>
  api.get("/ia/previsions-ventes", { params });
export const getAlertesRupture = () => api.get("/ia/alertes-rupture");
export const sendChat = (message: string, idConversation?: string) =>
  api.post("/ia/chat", { message, idConversation });
export const getConversations = () => api.get("/ia/conversations");
export const genererRapport = (type: string, periode: string) =>
  api.post("/ia/rapport-auto", { type, periode });
