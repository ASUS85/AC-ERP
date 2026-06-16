import { ApiError } from "../../utils/response.util.js";
import { buildMeta, getPagination } from "../../utils/pagination.util.js";

export function createCrudService(repository, options = {}) {
  const {
    buildWhere = () => ({}),
    beforeCreate = async (data) => data,
    beforeUpdate = async (_id, data) => data,
    beforeDelete = null,
    softDeleteData = null,
  } = options;

  return {
    async list(query = {}) {
      const { page, limit, offset } = getPagination(query);
      const where = buildWhere(query);
      const [items, total] = await Promise.all([
        repository.findMany({ where, skip: offset, take: limit }),
        repository.count(where),
      ]);
      return { data: items, meta: buildMeta(total, page, limit) };
    },
    async getById(id) {
      const entity = await repository.findById(id);
      if (!entity) throw new ApiError(404, "NOT_FOUND", "Ressource introuvable");
      return entity;
    },
    async create(data, context = {}) {
      const payload = await beforeCreate(data, context);
      return repository.create(payload);
    },
    async update(id, data, context = {}) {
      await this.getById(id);
      const payload = await beforeUpdate(id, data, context);
      return repository.update(id, payload);
    },
    async remove(id, context = {}) {
      const entity = await this.getById(id);
      if (beforeDelete) await beforeDelete(entity, context);
      if (softDeleteData) return repository.update(id, softDeleteData);
      return repository.delete(id);
    },
  };
}

