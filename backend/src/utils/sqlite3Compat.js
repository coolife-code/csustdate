import BetterSqlite3 from 'better-sqlite3'

const OPEN_READONLY = 1
const OPEN_READWRITE = 2
const OPEN_CREATE = 4
const OPEN_FULLMUTEX = 65536
const OPEN_URI = 64

const normalizeBindValue = (value) => {
  if (value === undefined) {
    return null
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  return value
}

const normalizeParams = (input) => {
  if (input === undefined || input === null) {
    return []
  }
  if (Array.isArray(input)) {
    const normalized = {}
    input.forEach((value, index) => {
      normalized[String(index + 1)] = normalizeBindValue(value)
    })
    return normalized
  }
  if (typeof input === 'object') {
    const normalized = {}
    for (const [key, value] of Object.entries(input)) {
      const normalizedKey = key.replace(/^[@:$]/, '')
      normalized[normalizedKey] = normalizeBindValue(value)
    }
    return normalized
  }
  return [normalizeBindValue(input)]
}

const parseArgs = (args) => {
  if (typeof args[0] === 'function') {
    return {
      params: [],
      callback: args[0]
    }
  }
  return {
    params: normalizeParams(args[0]),
    callback: args[1]
  }
}

const isNonResultStatementError = (error) => {
  return typeof error?.message === 'string' && error.message.includes('does not return data')
}

class Database {
  constructor(filename, mode = OPEN_READWRITE | OPEN_CREATE, callback) {
    const readonly = (mode & OPEN_READONLY) === OPEN_READONLY && (mode & OPEN_READWRITE) !== OPEN_READWRITE
    const fileMustExist = (mode & OPEN_CREATE) !== OPEN_CREATE
    this.filename = filename
    this.open = true
    this.db = new BetterSqlite3(filename, {
      readonly,
      fileMustExist,
      timeout: 10000
    })
    if (typeof callback === 'function') {
      queueMicrotask(() => callback(null))
    }
  }

  run(sql, ...args) {
    const { params, callback } = parseArgs(args)
    try {
      const stmt = this.db.prepare(sql)
      const info = stmt.run(params)
      if (typeof callback === 'function') {
        queueMicrotask(() => callback.call({
          lastID: Number(info.lastInsertRowid),
          changes: info.changes
        }, null))
      }
    } catch (error) {
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(error))
      } else {
        throw error
      }
    }
    return this
  }

  get(sql, ...args) {
    const { params, callback } = parseArgs(args)
    try {
      const stmt = this.db.prepare(sql)
      const row = stmt.get(params)
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(null, row))
      }
      return row
    } catch (error) {
      if (isNonResultStatementError(error)) {
        this.run(sql, params)
        if (typeof callback === 'function') {
          queueMicrotask(() => callback(null, undefined))
        }
        return undefined
      }
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(error))
        return undefined
      }
      throw error
    }
  }

  all(sql, ...args) {
    const { params, callback } = parseArgs(args)
    try {
      const stmt = this.db.prepare(sql)
      const rows = stmt.all(params)
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(null, rows))
      }
      return rows
    } catch (error) {
      if (isNonResultStatementError(error)) {
        this.run(sql, params)
        if (typeof callback === 'function') {
          queueMicrotask(() => callback(null, []))
        }
        return []
      }
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(error))
        return []
      }
      throw error
    }
  }

  each(sql, ...args) {
    const callback = args.find(item => typeof item === 'function')
    const paramsInput = typeof args[0] === 'function' ? [] : args[0]
    const params = normalizeParams(paramsInput)
    const rows = this.all(sql, params)
    if (typeof callback === 'function') {
      rows.forEach(row => callback(null, row))
      callback(null, rows.length)
    }
    return this
  }

  exec(sql, callback) {
    try {
      this.db.exec(sql)
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(null))
      }
    } catch (error) {
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(error))
      } else {
        throw error
      }
    }
    return this
  }

  close(callback) {
    try {
      this.db.close()
      this.open = false
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(null))
      }
    } catch (error) {
      if (typeof callback === 'function') {
        queueMicrotask(() => callback(error))
      } else {
        throw error
      }
    }
  }

  serialize(callback) {
    if (typeof callback === 'function') {
      callback()
    }
    return this
  }

  parallelize(callback) {
    if (typeof callback === 'function') {
      callback()
    }
    return this
  }

  configure() {
    return this
  }
}

const sqlite3Compat = {
  Database,
  OPEN_READONLY,
  OPEN_READWRITE,
  OPEN_CREATE,
  OPEN_FULLMUTEX,
  OPEN_URI,
  verbose() {
    return sqlite3Compat
  }
}

export default sqlite3Compat
