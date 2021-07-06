import { writable } from "svelte/store"

export const defaultTitle = "Minhas Tarefas"
export const titleStore = writable(defaultTitle)
export const setTitle = (value: string) => titleStore.set(value)

export const tabIndexStore = writable(0)
export const setTabIndex = (value: number) => tabIndexStore.set(value)

export const isEditingStore = writable(false)
export const setIsEditing = (value: boolean) => isEditingStore.set(value)

export const isMovingStore = writable(false)
export const setIsMoving = (value: boolean) => isMovingStore.set(value)
