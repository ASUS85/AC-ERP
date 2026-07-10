import { dashboardRepository } from "./dashboard.repository.js";
import { parametresRepository } from "../parametres/parametres.repository.js";
import { buildDashboardPdf } from "../../services/dashboard-document.service.js";

export const dashboardService = {
  overview: () => dashboardRepository.overview(),
  kpis: () => dashboardRepository.kpis(),
  evolutionVentes: (annee) => dashboardRepository.evolutionVentes(annee),
  topProduits: () => dashboardRepository.topProduits(),
  topClients: () => dashboardRepository.topClients(),
  repartitionCategories: () => dashboardRepository.repartitionCategories(),
  statistiquesGlobales: () => dashboardRepository.statistiquesGlobales(),
  async exportPdf() {
    const [overview, entreprise] = await Promise.all([
      dashboardRepository.overview(),
      parametresRepository.entreprise(),
    ]);
    return {
      filename: `dashboard-${new Date().toISOString().slice(0, 10)}.pdf`,
      buffer: await buildDashboardPdf(overview, entreprise),
    };
  },
};
