import prisma from "../../config/database.js";

export function createRepository(modelName, defaultInclude = undefined) {
  const model = prisma[modelName];

  return {
    model,
    findMany({ where = {}, skip, take, orderBy = { createdAt: "desc" }, include = defaultInclude } = {}) {
      return model.findMany({ where, skip, take, orderBy, include });
    },
    count(where = {}) {
      return model.count({ where });
    },
    findById(id, include = defaultInclude) {
      return model.findUnique({ where: { id }, include });
    },
    create(data, include = defaultInclude) {
      return model.create({ data, include });
    },
    update(id, data, include = defaultInclude) {
      return model.update({ where: { id }, data, include });
    },
    delete(id) {
      return model.delete({ where: { id } });
    },
  };
}

