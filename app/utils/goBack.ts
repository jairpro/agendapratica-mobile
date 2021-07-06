import {
  tabIndexStore,
  isEditingStore,
  isMovingStore,
  setIsEditing,
  setIsMoving,
} from '~/stores/global'

import { List, Levels } from './lists'

import {
  todosStore,
  listTodosStore,
  todoLevelStore,
  todoLevelsStore,
  setListTodos,
  setTodoLevel,
  popTodoLevels,
} from '~/stores/todo'

import {
  todayStore,
  listTodayStore,
  todayLevelStore,
  todayLevelsStore,
  setListToday,
  setTodayIndex,
  popTodayLevels,
  setTodayLevel,
} from '~/stores/today'

import {
  donesStore,
  listDonesStore,
  doneLevelStore,
  doneLevelsStore,
  setListDones,
  setDoneLevel,
  popDoneLevels,
} from '~/stores/dones'

let tabIndex: number
let isEditing: boolean
let isMoving: boolean
tabIndexStore.subscribe(value => tabIndex = value)
isEditingStore.subscribe(value => isEditing = value)
isMovingStore.subscribe(value => isMoving = value)

let todos: List
let listTodos: List
let todoLevel: number
let todoLevels: Levels
todosStore.subscribe(value => todos = value)
listTodosStore.subscribe(value => listTodos = value)
todoLevelStore.subscribe(value => todoLevel = value)
todoLevelsStore.subscribe(value => todoLevels = value)

let today: List
let listToday: List
let todayLevel: number
let todayLevels: Levels
todayStore.subscribe(value => today = value)
listTodayStore.subscribe(value => listToday = value)
todayLevelStore.subscribe(value => todayLevel = value)
todayLevelsStore.subscribe(value => todayLevels = value)

let dones: List
donesStore.subscribe(value => dones = value)
let listDones: List
let doneLevel: number
let doneLevels: Levels
listDonesStore.subscribe(value => listDones = value)
doneLevelStore.subscribe(value => doneLevel = value)
doneLevelsStore.subscribe(value => doneLevels = value)

export function goBack() {
  if (tabIndex === 0 && isEditing) {
    setIsEditing(false)
    return true
  }
  else if (tabIndex === 0 && todoLevels.length>1) {
    popTodoLevels()
    setTodoLevel(todoLevels[todoLevels.length-1])
    if (todoLevel > -1) {
      setListTodos(listTodos[todoLevel].subdivisions)
    }
    else {
      setListTodos(todos)
    }
  }
  else if (tabIndex === 1 && todayLevels.length>1) {
    popTodayLevels()
    setTodayLevel(todayLevels[todayLevels.length-1])
    if (todayLevel > -1) {
      setListToday(listToday[todoLevel].subdivisions)
    }
    else {
      setListToday(today)
    }
    setTodayIndex(-1)
  }
  else if (tabIndex === 2 && doneLevels.length>1) {
    popDoneLevels()
    setDoneLevel(doneLevels[doneLevels.length-1])
    if (doneLevel > -1) {
      setListDones(listDones[doneLevel].subdivisions)
    }
    else {
      setListDones(dones)
    }
  }
  else if (tabIndex === 1 && isMoving) {
    setTodayIndex(-1)
    setIsMoving(false)
  }

  else return false

  return true
}
