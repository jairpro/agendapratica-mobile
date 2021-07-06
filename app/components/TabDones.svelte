<script lang="ts">
  import { action } from '@nativescript/core/ui/dialogs'
  import Tasks from '~/components/Tasks.svelte'

  import {
    ACTION_DELETE,
    ACTION_EDIT,
    ACTION_NOTHING,
    ACTION_PENDING,
    ACTION_TODAY,
  } from '~/utils/consts'

  import {
    confirmDeleteTask,
    getItemIndex,
    List,
    ListItem,
    modifyTaskFromList,
    moveTaskToList,
    reactList,
    saveList,
  } from '~/utils/lists'

  import {
    doneIndexStore,
    doneLevelStore,
    donesStore,
    listDonesStore,
    pushDoneLevels,
    setDoneIndex,
    setDoneLevel,
    setDones,
    setListDones,
  } from '~/stores/dones'

  import { MenuArgs } from '~/utils/types'
  import { setToday, todayStore } from '~/stores/today'
  import { goBack } from '~/utils/goBack'
  import { saveTodos, setTodos, todosStore } from '~/stores/todo'
  import { confirmDeleteStore } from '~/stores/options'

  let dones: List
  let listDones: List
  let doneIndex: number
  let doneLevel: number
  donesStore.subscribe(value => dones = value)
  listDonesStore.subscribe(value => listDones = value)
  doneIndexStore.subscribe(value => doneIndex = value)
  doneLevelStore.subscribe(value => doneLevel = value)

  let todos: List
  let today: List
  let confirmDelete: boolean
  todosStore.subscribe(value => todos = value)
  todayStore.subscribe(value => today = value)
  confirmDeleteStore.subscribe(value => confirmDelete = value)

  let salvarDones = false

  $: if (dones) {
    setListDones(reactList(doneLevel > -1
      ? dones[doneLevel].subdivisions
      : dones
    ))
  }

  $: {
    if (dones && salvarDones) saveList(dones, "dones")
    salvarDones = true
  }

  async function menuDone(args: MenuArgs) {
    setDoneIndex(args.index)

    let menu = []
    menu.push(ACTION_TODAY)
    menu.push(ACTION_PENDING)
    menu.push(ACTION_EDIT)
    menu.push(ACTION_DELETE)

    let item = doneLevel > -1 ? dones[doneLevel].subdivisions[doneIndex] : dones[doneIndex]
    let result = await action(item.name, ACTION_NOTHING, menu)

    switch (result) {
      case ACTION_TODAY:
        moveTaskToList({
          from: dones,
          level: doneLevel,
          index: doneIndex,
          to: today,
          append: true,
          onMove: toAfter => setToday(toAfter),
          onRemove: fromAfter => setDones(fromAfter),
          onGoBack: () => goBack(),
        })
        break

      case ACTION_PENDING:
        moveTaskToList({
          from: dones,
          level: doneLevel,
          index: doneIndex,
          to: todos,
          append: false,
          onMove: toAfter => {
            setTodos(toAfter)
            saveTodos()
          },
          onRemove: fromAfter => setDones(fromAfter),
          onGoBack: () => goBack(),
        })
        break

      case ACTION_EDIT:
        modifyTaskFromList({
          list: dones,
          level: doneLevel,
          index: doneIndex,
          name: item.name,
          onModify: after => setDones(after),
        })
        break

      case ACTION_DELETE:
        confirmDeleteTask({
          list: dones,
          level: doneLevel,
          index: doneIndex,
          name: item.name,
          confirmation: confirmDelete,
          onDelete: after => setDones(after),
        })
        break

      case ACTION_NOTHING || undefined: // Dismisses the dialog
        break
    }
  }

  async function onMenuDone(e: CustomEvent) {
    await menuDone(e.detail)
  }

  function openDoneSubdivisions(item?: ListItem) {
    if (item !== undefined) doneIndex = getItemIndex(listDones, item)
    if (doneIndex < 0) return
    setDoneLevel(doneIndex)
    pushDoneLevels(doneLevel)
    setDoneIndex(-1)
  }

  function onOpenDone(e: CustomEvent) {
    openDoneSubdivisions(e.detail)
  }
</script>

<tabContentItem class="tab-dones">
  <Tasks
    list="{listDones}"
    completed={true}
    onMenu="{onMenuDone}"
    onOpen="{onOpenDone}"
    isMoving="{false}"
  />
</tabContentItem>

<style>
  .tab-dones {
    padding-top: 8;
  }
</style>
