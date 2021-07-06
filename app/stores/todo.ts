import { writable } from "svelte/store"
import { Levels, List, ListItem, saveList } from "~/utils/lists"
import { StorageGetList } from "~/utils/storage"

const valueList = StorageGetList("todos")

export const todosStore = writable(valueList)

interface SetTodosItemArgs {
  index: number
  item: ListItem
}

type SetTodosArgs = List | SetTodosItemArgs

export const setTodos = (args: SetTodosArgs) => {
  if (args instanceof Array) {
    const value: List = args as List
    todosStore.set(value)
    return
  }
  const item = (args as SetTodosItemArgs).item
  const index = (args as SetTodosItemArgs).index
  todosStore.update(value => (value[index] = item, value))
}

export const removeSubdivisionsFromTodos = (index: number) => {
  todosStore.update(value => {
    value[index].subdivisions = undefined
    return value
  })
}

export const listTodosStore = writable(valueList)
export const setListTodos = (value: List) => listTodosStore.set(value)

export const todoIndexStore = writable(-1)
export const setTodoIndex = (value: number) => todoIndexStore.set(value)

export const todoLevelStore = writable(-1)
export const setTodoLevel = (value: number) => todoLevelStore.set(value)
export const incrementTodoLevel = () => todoLevelStore.update(value => (value + 1))

export const todoLevelsStore = writable<Levels>([-1])
export const setTodoLevels = (value: Levels) => todoLevelsStore.set(value)
export const popTodoLevels = () => todoLevelsStore.update(value => (value.pop(), value))
export const pushTodoLevels = (item: number) => todoLevelsStore.update(value => (value.push(item), value))
export const incrementTodoLevelsItem = (index: number) => todoLevelsStore.update(value => (value[index]++, value))

let todos: List
todosStore.subscribe(value => todos = value)

export function saveTodos() {
  saveList(todos, "todos")
}

