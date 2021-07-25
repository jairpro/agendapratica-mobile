import { writable } from "svelte/store"
import { StorageGetBoolean, StorageSetBoolean } from "~/utils/storage"

export const STORE_MIGRATED = 'migrated'

export function getMigrated() {
  return StorageGetBoolean(STORE_MIGRATED, false)
}

export const migratedStore = writable(getMigrated())

export const setMigrated = (value = true) => {
  migratedStore.set(value)
  console.log("marcando como migrado...")
  StorageSetBoolean(STORE_MIGRATED, value)
  console.log("migração confirmada!")
}
