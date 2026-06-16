import { dashboardRepository } from "./dashboard.repository.js";

export const dashboardService = {
  kpis: () => dashboardRepository.kpis(),
  evolutionVentes: () => dashboardRepository.evolutionVentes(),
  topProduits: () => dashboardRepository.topProduits(),
  topClients: () => dashboardRepository.topClients(),
  repartitionCategories: () => dashboardRepository.repartitionCategories(),
};

