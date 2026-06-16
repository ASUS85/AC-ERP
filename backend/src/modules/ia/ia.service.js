import Anthropic from "@anthropic-ai/sdk";
import { iaRepository } from "./ia.repository.js";

export const iaService = {
  previsionsVentes: (query) => iaRepository.previsions({ orderBy: { periode: "desc" } }),
  alertesRupture: () => iaRepository.alertesRupture(),
  async chat(message, idConversation, ctx) {
    let answer = "Assistant IA indisponible en developpement.";
    if (process.env.ANTHROPIC_API_KEY) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: process.env.LLM_MODEL || "claude-sonnet-4-20250514",
        max_tokens: Number(process.env.LLM_MAX_TOKENS || 2000),
        messages: [{ role: "user", content: message }],
      });
      answer = response.content?.[0]?.text || answer;
    }
    return iaRepository.createConversationMessage(ctx.user.userId, message, answer, idConversation);
  },
  conversations: (ctx) => iaRepository.conversations(ctx.user.userId),
  rapports: (ctx) => iaRepository.rapports(ctx.user.userId),
  rapportAuto: (data, ctx) => iaRepository.createRapportJob(ctx.user.userId, data.type, data.periode),
};

