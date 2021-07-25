import { writable } from "svelte/store"
import { DEFAULT_CONFIRM_DELETE, OPTION_CONFIRM_DELETE } from "~/config/options"
import { StorageGetBoolean, StorageSetBoolean } from "~/utils/storage"

export const confirmDeleteStore = writable(false)

export const setConfirmDelete = (value: boolean) => {
  confirmDeleteStore.set(value)
  StorageSetBoolean(OPTION_CONFIRM_DELETE, value)
}

export function loadOptions() {
  setConfirmDelete(StorageGetBoolean(OPTION_CONFIRM_DELETE, DEFAULT_CONFIRM_DELETE))
}

