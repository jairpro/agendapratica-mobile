import { prompt, confirm } from '@nativescript/core/ui/dialogs'
import { array_move } from "./arrays"
import { StorageSetList } from './storage'

export type ListItem = {
  name: string
  subdivisions?: List
}

export type List = ListItem[]

export type Levels = number[]

type AddToListData = {
  list: List
  item: ListItem
  level?: number
}

type AppendToListData = {
  list: List
  item?: ListItem
  index?: number
  level?: number
}

type ModifyListItemData = {
  list: List
  index: number
  name: string
  level?: number
}

type RemoveFromListData = {
  list: List
  index?: number
  item?: ListItem
  level?: number
}

type NewTopItemData = {
  from: List
  to: List
  level: number
  index: number
}

type MoveTaskToListData = {
  from: List
  to: List
  level: number
  index: number
  append: boolean
  onMove: (toAfter: List) => void
  onRemove: (fromAfter: List) => void
  onGoBack: () => void
}

type ModifyTaskFromListData = {
  list: List
  level: number
  index: number
  name: string
  onModify: (after: List) => void
}

export function addToList(data: AddToListData): List {
  const { item, level, list } = data

  if (level > -1) {
    list[level].subdivisions = [item, ...list[level].subdivisions]
    return JSON.parse(JSON.stringify(list))
  }

  return [item, ...list]
}

function appendToList(data: AppendToListData): List {
  const { list, index, level } = data
  let { item } = data

  if (level > -1) {
    if (!item) {
      item = list[level].subdivisions[index]
    }

    if (item) {
      list[level].subdivisions = [...list[level].subdivisions, item]
      return JSON.parse(JSON.stringify(list))
    }
  }
  else {
    if (!item) item = list[index]
    if (item) return [...list, item]
  }
  return list
}

export const modifyListItem = (data: ModifyListItemData) => {
  const { list, index, name, level } = data

  if (level > -1) {
    list[level].subdivisions[index].name = name
  }
  else {
    list[index].name = name
  }

  return JSON.parse(JSON.stringify(list))
}

export function removeFromList(data: RemoveFromListData): List {
  const {list, index, level, item} = data

  if (level > -1) {
    list[level].subdivisions = removeFromList({
      list: list[level].subdivisions,
      index,
      item,
    })
    return reactList(list)
  }

  return list.filter((element, ind) =>
    item!==undefined && element !== item
    || index!==undefined && index !== ind
  )
}

export function saveList(list: List, key: string) {
  StorageSetList(key, list)
  //console.log(`Salvou ${key}`)
}

export function reactList(list: List): List {
  return JSON.parse(JSON.stringify(list))
}

export function moveList(list: List, indexSource: number, indexDestiny: number, level: number): List {
  const temp = level > -1 ? list[level].subdivisions : list
  if (
    indexDestiny<0 || indexDestiny>temp.length-1
    || indexSource<0 || indexSource>temp.length-1
  ) return list

  const result = array_move(temp, indexSource, indexDestiny)

  if (level > -1) {
    list[level].subdivisions = result
    return reactList(list)
  }
  return result
}

export function moveTaskToList(data: MoveTaskToListData) {
  const { from, level, to, index, append, onMove, onRemove, onGoBack } = data

  let toAfter: List
  let item: any

  if (level > -1) {
    item = from[level].subdivisions[index]
    const topName = from[level].name
    const found = to.find(element => element.name === topName)

    if (found) {
      found.subdivisions = append
        ? [...found.subdivisions, item]
        : [item, ...found.subdivisions]
      toAfter = reactList(to)
      item = false
    }
    else {
      item = newTopItem({
        from,
        to,
        level,
        index,
      })
    }
  }
  else {
    item = from[index]
    const topName = from[index].name
    const found = to.find(element => element.name === topName)

    if (found && item.subdivisions) {
      found.subdivisions = append
        ? [...found.subdivisions, ...from[index].subdivisions]
        : [...from[index].subdivisions, ...found.subdivisions]
      toAfter = reactList(to)
      item = false
    }
  }
  if (item) {
    toAfter = append
      ? appendToList({ list: to, item })
      : addToList({ list: to, item })
  }

  if (onMove && toAfter.length>0) {
    onMove(toAfter)

    if (onRemove) {
      let fromAfter = removeFromList({
        list: from,
        index,
        level,
      })

      if (level > -1 && from[level].subdivisions.length === 0) {
        fromAfter = removeFromList({
          list: from,
          index: level,
        })
        if (onGoBack) onGoBack()
      }

      onRemove(fromAfter)
    }
  }
}

export function getItemIndex(list: List, item: ListItem): number {
  let index = -1
  for (let element of list) {
    index++
    if (item.name === element.name) {
      break
    }
  }
  return index
}

function newTopItem(data: NewTopItemData): ListItem {
  const { from, to, level, index } = data

  if (level > -1) {
    const name = from[level].name
    const subdivision = from[level].subdivisions[index]

    const found = to.find(element => element.name === name)
    if (!found) {
      return {
        name,
        subdivisions: [subdivision]
      }
    }
  }
  return null
}

export async function modifyTaskFromList(data: ModifyTaskFromListData): Promise<boolean> {
  const { list, level, index, name, onModify } = data

  const edition = await prompt({
    defaultText: name,
    cancelButtonText: 'Cancelar',
    cancelable: true,
    okButtonText: 'Ok',
    title: 'Edição de tarefa'
  })

  if (edition.result) {
    const after = modifyListItem({
      list,
      level,
      index,
      name: edition.text,
    })
    if (onModify) onModify(after)
  }
  return edition.result
}

type ConfirmDeleteTaskData = {
  list: List,
  level: number,
  index: number,
  name: string,
  confirmation: boolean,
  onDelete: (after: List) => void,
}

export async function confirmDeleteTask(data: ConfirmDeleteTaskData): Promise<boolean> {
  const { list, level, index, name, confirmation, onDelete } = data

  if (!confirmation || await confirm({
    title: 'Apagar tarefa?',
    message: name,
    okButtonText: 'Sim',
    cancelable: true,
    cancelButtonText: 'Não',
  })) {
    const after = removeFromList({
      list,
      index,
      level,
    }) // Removes the tapped active task.
    if (onDelete) onDelete(after)
    return true
  }
  return false
}
