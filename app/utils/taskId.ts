import { v4 as uuid } from 'node-uuid'
import { modifyListItem, ModifyTaskFromListData } from "./lists"

type UpdateListItemWithIdData = ModifyTaskFromListData

export const updateListItemWithId = (data: UpdateListItemWithIdData) => {
  const { list, index, name, level, onModify } = data

  const id = uuid()

  const after = modifyListItem({
    list,
    level,
    index,
    name,
    id,
  })
  if (onModify) onModify(after)

  return id
}
