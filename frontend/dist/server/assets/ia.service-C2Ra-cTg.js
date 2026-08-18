import { i as api } from "./router-CpiKU9_2.js";
const getPrevisions = () => api.get("/ia/previsions");
const sendChat = (message, idConversation) => api.post("/ia/chat", { message, idConversation });
const getConversations = () => api.get("/ia/conversations");
const getConversationMessages = (idConversation) => api.get(`/ia/conversations/${idConversation}/messages`);
const renameConversation = (idConversation, titre) => api.patch(`/ia/conversations/${idConversation}`, {
  titre
});
const deleteConversation = (idConversation) => api.delete(`/ia/conversations/${idConversation}`);
const genererRapport = (type, periode) => api.post("/ia/rapport", { type, periode });
const telechargerRapportPdf = (idRapport) => api.get(`/ia/rapports/${idRapport}/pdf`, {
  responseType: "blob"
});
export {
  getConversations as a,
  getConversationMessages as b,
  getPrevisions as c,
  deleteConversation as d,
  genererRapport as g,
  renameConversation as r,
  sendChat as s,
  telechargerRapportPdf as t
};
