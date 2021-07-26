import { donesStore, setDones } from '~/stores/dones';
import { confirmDeleteStore, setConfirmDelete } from '~/stores/options';
import { setToday, todayStore } from '~/stores/today';
import { saveTodos, setTodos, todosStore } from '~/stores/todo';
import { List } from './lists';

let todo: List
let today: List
let dones: List
let confirmDelete: boolean
todosStore.subscribe(value => todo = value)
todayStore.subscribe(value => today = value)
donesStore.subscribe(value => dones = value)
confirmDeleteStore.subscribe(value => confirmDelete = value)

export const DATA_FILENAME = "exports/db.json"

export function getData() {
  return {
    todo,
    today,
    dones,
    options: {
      confirmDelete
    }
  }
}

export function getContent() {
  return JSON.stringify(getData())
}

export function isValidContent(content: string) {
  try {
    const data = JSON.parse(content)
    if (typeof data !== "object") return false

    if (typeof data.todo !== "object" || !(data.todo instanceof Array)) return false
    if (typeof data.today !== "object" || !(data.today instanceof Array)) return false
    if (typeof data.dones !== "object" || !(data.dones instanceof Array)) return false
    if (typeof data.options !== "object") return false

    return true
  }
  catch (error) {
    console.log('setData error:', error.message)
    return false
  }
}

export function setData(content: string) {
  try {
    // console.log("JSON.parse...")
    const data = JSON.parse(content)

    // console.log("todoStore.set...")
    //setTodos(data.todo as List)
    todosStore.set(data.todo)

    // console.log("saveTodos...")
    saveTodos()

    // console.log('setToday...')
    setToday(data.today)

    // console.log('setDones...')
    setDones(data.dones)

    //console.log('setConfirmDelete...')
    //setConfirmDelete(data.confirmDelete)

    // console.log('setData ok!')
  }
  catch (error) {
    console.log('setData error:', error.message)
  }
}
