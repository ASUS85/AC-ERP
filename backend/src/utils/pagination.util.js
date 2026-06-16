import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "../config/constants.js";

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getPagination(query = {}) {
  const page = toPositiveInt(query.page, 1);
  const requestedLimit = toPositiveInt(query.limit, DEFAULT_PAGE_SIZE);
  const limit = Math.min(requestedLimit, MAX_PAGE_SIZE);
  return { page, limit, offset: (page - 1) * limit };
}

export function buildMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

