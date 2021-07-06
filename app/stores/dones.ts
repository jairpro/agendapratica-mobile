import { writable } from "svelte/store"
import { Levels, List } from "~/utils/lists"
import { StorageGetList } from "~/utils/storage"

const valueList = StorageGetList("dones")

export const donesStore = writable(valueList)
export const listDonesStore = writable(valueList)
export const doneIndexStore = writable(-1)
export const doneLevelStore = writable(-1)
export const doneLevelsStore = writable<Levels>([-1])

export const setDones = (value: List) => donesStore.set(value)
export const setListDones = (value: List) => listDonesStore.set(value)
export const setDoneIndex = (value: number) => doneIndexStore.set(value)
export const setDoneLevel = (value: number) => doneLevelStore.set(value)
export const setDoneLevels = (value: Levels) => doneLevelsStore.set(value)
export const popDoneLevels = () => doneLevelsStore.update(value => (value.pop(), value))
export const pushDoneLevels = (item: number) => doneLevelsStore.update(value => (value.push(item), value))
