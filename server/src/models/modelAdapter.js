const { v4: uuidv4 } = require('uuid');
const { isUsingFallback, memoryStore } = require('../config/db');

/**
 * Creates a hybrid model that delegates to Mongoose when connected to real MongoDB,
 * or delegates to the in-memory memoryStore when in fallback mode.
 */
function createHybridModel(modelName, collectionKey, mongooseModel) {
  const getCollection = () => {
    if (!memoryStore[collectionKey]) {
      memoryStore[collectionKey] = new Map();
    }
    return memoryStore[collectionKey];
  };

  class InMemoDoc {
    constructor(data = {}) {
      this._id = data._id ? String(data._id) : uuidv4();
      this.id = this._id;
      Object.assign(this, data);
      if (!this.createdAt) this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    async save() {
      this.updatedAt = new Date();
      const col = getCollection();
      col.set(this._id, JSON.parse(JSON.stringify(this)));
      return this;
    }

    toObject() {
      return { ...this };
    }

    toJSON() {
      return { ...this };
    }
  }

  function matchesQuery(doc, query = {}) {
    for (const [key, val] of Object.entries(query)) {
      if (key === '_id' || key === 'id') {
        const docId = String(doc._id || doc.id);
        if (val && val.$in) {
          const inList = val.$in.map(String);
          if (!inList.includes(docId)) return false;
        } else {
          const queryId = String(val && val._id ? val._id : val);
          if (docId !== queryId) return false;
        }
      } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        if (val.$ne !== undefined && doc[key] === val.$ne) return false;
        if (val.$in !== undefined && !val.$in.includes(doc[key])) return false;
        if (val.$nin !== undefined && val.$nin.includes(doc[key])) return false;
        if (val.$exists !== undefined && (doc[key] !== undefined) !== val.$exists) return false;
        if (val.$or !== undefined && Array.isArray(val.$or)) {
          const matchAny = val.$or.some(subQuery => matchesQuery(doc, subQuery));
          if (!matchAny) return false;
        }
        if (val.$regex !== undefined) {
          const flags = val.$options || '';
          const regex = new RegExp(val.$regex, flags);
          if (!regex.test(doc[key] || '')) return false;
        }
      } else {
        if (String(doc[key]) !== String(val)) return false;
      }
    }
    return true;
  }

  class QueryChain {
    constructor(results) {
      this.results = results.map(r => new InMemoDoc(r));
    }

    sort(sortObj = {}) {
      const keys = Object.keys(sortObj);
      if (keys.length > 0) {
        this.results.sort((a, b) => {
          for (const key of keys) {
            const dir = sortObj[key] === -1 || sortObj[key] === 'desc' ? -1 : 1;
            const aVal = a[key] instanceof Date ? a[key].getTime() : (a[key] ?? 0);
            const bVal = b[key] instanceof Date ? b[key].getTime() : (b[key] ?? 0);
            if (aVal < bVal) return -1 * dir;
            if (aVal > bVal) return 1 * dir;
          }
          return 0;
        });
      }
      return this;
    }

    skip(num = 0) {
      this.results = this.results.slice(num);
      return this;
    }

    limit(num = 0) {
      if (num > 0) {
        this.results = this.results.slice(0, num);
      }
      return this;
    }

    select(fields) {
      return this;
    }

    populate(path) {
      return this;
    }

    lean() {
      return this.results.map(r => r.toObject());
    }

    then(resolve, reject) {
      return Promise.resolve(this.results).then(resolve, reject);
    }

    catch(reject) {
      return Promise.resolve(this.results).catch(reject);
    }
  }

  return {
    find(query = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.find(query);
      }
      const col = getCollection();
      const matched = Array.from(col.values()).filter(doc => matchesQuery(doc, query));
      return new QueryChain(matched);
    },

    async findOne(query = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.findOne(query);
      }
      const col = getCollection();
      const item = Array.from(col.values()).find(doc => matchesQuery(doc, query));
      return item ? new InMemoDoc(item) : null;
    },

    async findById(id) {
      if (!id) return null;
      if (!isUsingFallback()) {
        return mongooseModel.findById(id);
      }
      const col = getCollection();
      const item = col.get(String(id));
      return item ? new InMemoDoc(item) : null;
    },

    async create(data) {
      if (!isUsingFallback()) {
        return mongooseModel.create(data);
      }
      const col = getCollection();
      const doc = new InMemoDoc(data);
      col.set(doc._id, JSON.parse(JSON.stringify(doc)));
      return doc;
    },

    async findByIdAndUpdate(id, update = {}, options = {}) {
      if (!id) return null;
      if (!isUsingFallback()) {
        return mongooseModel.findByIdAndUpdate(id, update, options);
      }
      const col = getCollection();
      const existing = col.get(String(id));
      if (!existing) return null;
      
      const payload = update.$set ? { ...existing, ...update.$set } : { ...existing, ...update };
      payload.updatedAt = new Date();
      col.set(String(id), payload);
      return new InMemoDoc(payload);
    },

    async findOneAndUpdate(query = {}, update = {}, options = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.findOneAndUpdate(query, update, options);
      }
      const doc = await this.findOne(query);
      if (!doc) return null;
      return this.findByIdAndUpdate(doc._id, update, options);
    },

    async updateOne(query = {}, update = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.updateOne(query, update);
      }
      const doc = await this.findOne(query);
      if (!doc) return { modifiedCount: 0 };
      await this.findByIdAndUpdate(doc._id, update);
      return { modifiedCount: 1 };
    },

    async updateMany(query = {}, update = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.updateMany(query, update);
      }
      const col = getCollection();
      let count = 0;
      for (const [id, doc] of col.entries()) {
        if (matchesQuery(doc, query)) {
          const payload = update.$set ? { ...doc, ...update.$set } : { ...doc, ...update };
          payload.updatedAt = new Date();
          col.set(id, payload);
          count++;
        }
      }
      return { modifiedCount: count };
    },

    async findByIdAndDelete(id) {
      if (!id) return null;
      if (!isUsingFallback()) {
        return mongooseModel.findByIdAndDelete(id);
      }
      const col = getCollection();
      const existing = col.get(String(id));
      if (existing) {
        col.delete(String(id));
        return new InMemoDoc(existing);
      }
      return null;
    },

    async deleteOne(query = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.deleteOne(query);
      }
      const col = getCollection();
      for (const [id, doc] of col.entries()) {
        if (matchesQuery(doc, query)) {
          col.delete(id);
          return { deletedCount: 1 };
        }
      }
      return { deletedCount: 0 };
    },

    async deleteMany(query = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.deleteMany(query);
      }
      const col = getCollection();
      let count = 0;
      for (const [id, doc] of col.entries()) {
        if (matchesQuery(doc, query)) {
          col.delete(id);
          count++;
        }
      }
      return { deletedCount: count };
    },

    async countDocuments(query = {}) {
      if (!isUsingFallback()) {
        return mongooseModel.countDocuments(query);
      }
      const col = getCollection();
      return Array.from(col.values()).filter(doc => matchesQuery(doc, query)).length;
    },

    mongooseModel,
  };
}

module.exports = {
  createHybridModel,
};
