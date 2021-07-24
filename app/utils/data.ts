import { donesStore, setDones } from '~/stores/dones';
import { confirmDeleteStore, setConfirmDelete } from '~/stores/options';
import { setToday, todayStore } from '~/stores/today';
import { setTodos, todosStore } from '~/stores/todo';
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

export function setData(content: string) {
  const data = JSON.parse(content)
  setTodos(data.todo)
  setToday(data.today)
  setDones(data.dones)
  setConfirmDelete(data.confirmDelete)
}
