#!/usr/bin/env node
// Pulls translations from Tolgee into src/i18n/locales/<lang>.json.
// The dictionaries stay bundled in the app; Tolgee is only the editing tool.
//
// Env:
//   TOLGEE_URL               e.g. http://10.10.0.6:8088
//   TOLGEE_MOBILE_PROJECT_ID Tolgee project id (smile-health-mobile = 41)
//   TOLGEE_MOBILE_API_KEY    project API key
//   TOLGEE_LANGUAGES         comma separated, default "ar"
//
// Keys in Tolgee are flat ("common.smile", "list[0]"). The output follows
// the key order of en.json so diffs stay readable; keys missing in Tolgee
// are left out and fall back to English at runtime. Non-string values in
// en.json (ids inside arrays) are not translatable and are copied as is.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = path.join(root, 'src/i18n/locales')

export const parseKey = (key) =>
  key
    .split('.')
    .flatMap((part) =>
      [...part.matchAll(/([^[\]]+)|\[(\d+)\]/g)].map((m) =>
        m[2] === undefined ? m[1] : Number(m[2])
      )
    )

export const flatten = (value, prefix = '', out = {}) => {
  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out))
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out)
    }
  } else {
    out[prefix] = value
  }
  return out
}

export const unflatten = (flat, orderedKeys) => {
  const result = {}
  const keys = [
    ...orderedKeys.filter((k) => k in flat),
    ...Object.keys(flat).filter((k) => !orderedKeys.includes(k)),
  ]
  for (const key of keys) {
    const path = parseKey(key)
    let node = result
    path.forEach((part, i) => {
      if (i === path.length - 1) {
        node[part] = flat[key]
        return
      }
      if (node[part] === undefined) {
        node[part] = typeof path[i + 1] === 'number' ? [] : {}
      }
      node = node[part]
    })
  }
  return result
}

const fetchLanguage = async ({ url, projectId, apiKey }, lang) => {
  const query = new URLSearchParams({
    languages: lang,
    format: 'JSON',
    zip: 'false',
    structureDelimiter: '',
    filterState: 'TRANSLATED,REVIEWED',
  })
  const res = await fetch(
    `${url.replace(/\/$/, '')}/v2/projects/${projectId}/export?${query}`,
    { headers: { 'X-API-Key': apiKey } }
  )
  if (!res.ok) {
    throw new Error(`Tolgee export ${lang} failed: HTTP ${res.status}`)
  }
  const data = await res.json()
  return Object.fromEntries(
    Object.entries(flatten(data)).filter(([, v]) => v !== null && v !== '')
  )
}

const main = async () => {
  const config = {
    url: process.env.TOLGEE_URL,
    projectId: process.env.TOLGEE_MOBILE_PROJECT_ID,
    apiKey: process.env.TOLGEE_MOBILE_API_KEY,
  }
  const missing = Object.entries({
    TOLGEE_URL: config.url,
    TOLGEE_MOBILE_PROJECT_ID: config.projectId,
    TOLGEE_MOBILE_API_KEY: config.apiKey,
  })
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length > 0) {
    console.error(`Missing env: ${missing.join(', ')}`)
    process.exit(1)
  }

  const en = JSON.parse(
    await readFile(path.join(localesDir, 'en.json'), 'utf8')
  )
  const enFlat = flatten(en)
  const order = Object.keys(enFlat)
  const languages = (process.env.TOLGEE_LANGUAGES ?? 'ar').split(',')

  for (const lang of languages.map((l) => l.trim()).filter(Boolean)) {
    const flat = await fetchLanguage(config, lang)
    for (const [key, value] of Object.entries(enFlat)) {
      if (typeof value !== 'string') flat[key] = value
    }
    const file = path.join(localesDir, `${lang}.json`)
    await writeFile(
      file,
      `${JSON.stringify(unflatten(flat, order), null, 2)}\n`
    )
    const total = order.length
    const covered = order.filter((k) => k in flat).length
    const absent = order.filter((k) => !(k in flat))
    if (absent.length > 0) console.warn(`${lang}: missing ${absent.join(', ')}`)
    console.log(
      `${lang}: ${covered}/${total} keys from en.json -> ${path.relative(root, file)}`
    )
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
}
