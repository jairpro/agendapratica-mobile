  import { writable } from "svelte/store"
  import { StorageGetList } from "~/utils/storage"
  import { List, Levels, saveList } from '~/utils/lists'

  const valueList = StorageGetList("today")
  export const todayStore = writable(valueList)
  export const listTodayStore = writable(valueList)
  export const setToday = (value: List) => todayStore.set(value)
  export const setListToday = (value: List) => listTodayStore.set(value)

  export const todayIndexStore = writable(-1)
  export const setTodayIndex = (value: number) => todayIndexStore.set(value)

  export const todayLevelStore = writable(-1)
  export const todayLevelsStore = writable<Levels>([-1])
  export const setTodayLevel = (value: number) => todayLevelStore.set(value)
  export const setTodayLevels = (value: number[]) => todayLevelsStore.set(value)
  export const popTodayLevels = () => todayLevelsStore.update(value => (value.pop(), value))
  export const pushTodayLevels = (item: number) => todayLevelsStore.update(value => (value.push(item), value))

  export const salvarTodayStore = writable(false)
  export const setSalvarToday = (value: boolean) => salvarTodayStore.set(value)
  let salvarToday: boolean
  salvarTodayStore.subscribe(value => salvarToday = value)

  let today: List
  todayStore.subscribe(value => today = value)

  export function saveToday() {
    if (salvarToday) saveList(today, "today")
    setSalvarToday(true)
  }
