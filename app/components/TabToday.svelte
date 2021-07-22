<script lang="ts">
  import { action } from '@nativescript/core/ui/dialogs'

  import {
    ACTION_CONCLUDE,
    ACTION_DELETE,
    ACTION_EDIT,
    ACTION_NOTHING,
    ACTION_ORDER,
    ACTION_PENDING,
  } from '~/utils/consts'

  import {
    isMovingStore,
    setIsMoving,
  } from '~/stores/global'

  import {
    listTodayStore,
    pushTodayLevels,
    saveToday,
    setListToday,
    setSalvarToday,
    setToday,
    setTodayIndex,
    setTodayLevel,
    todayIndexStore,
    todayLevelStore,
    todayStore,
  } from '~/stores/today'

  import {
    getItemIndex,
    List,
    ListItem,
    reactList,
    moveTaskToList,
    modifyTaskFromList,
    confirmDeleteTask,
    moveList,
  } from '../utils/lists'

  import Tasks from '~/components/Tasks.svelte'
  import { MenuArgs } from '~/utils/types'

  import { donesStore, setDones } from '~/stores/dones'
  import { goBack } from '~/utils/goBack'
  import { saveTodos, setTodos, todosStore } from '~/stores/todo'
  import { confirmDeleteStore } from '~/stores/options'

  import AddTextButton from '~/components/AddTextButton.svelte'

  let isMoving: boolean
  isMovingStore.subscribe(value => isMoving = value)

  let today: List
  let listToday: List
  let todayLevel: number
  let todayIndex: number
  todayStore.subscribe(value => today = value)
  listTodayStore.subscribe(value => listToday = value)
  todayLevelStore.subscribe(value => todayLevel = value)
  todayIndexStore.subscribe(value => todayIndex = value)

  let todos: List
  let dones: List
  todosStore.subscribe(value => todos = value)
  donesStore.subscribe(value => dones = value)

  let confirmDelete: boolean
  confirmDeleteStore.subscribe(value => confirmDelete = value)

  $: if (today) {
    setListToday(reactList(todayLevel > -1
      ? today[todayLevel].subdivisions
      : today
    ))
  }

  $: if (today) saveToday()

  function done() {
    moveTaskToList({
      from: today,
      level: todayLevel,
      index: todayIndex,
      to: dones,
      append: false,
      onMove: toAfter => setDones(toAfter),
      onRemove: fromAfter => setToday(fromAfter),
      onGoBack: () => goBack(),
    })
  }

  async function menuToday(args: MenuArgs) {
    setTodayIndex(args.index)

    if (isMoving) return renderToday()

    let menu = []
    //menu.push(ACTION_CONCLUDE)
    if (listToday.length>1) {
      menu.push(ACTION_ORDER)
    }
    menu.push(ACTION_PENDING)
    menu.push(ACTION_EDIT)
    menu.push(ACTION_DELETE)

    let item = todayLevel > -1 ? today[todayLevel].subdivisions[todayIndex] : today[todayIndex]
    let result = await action(item.name, ACTION_NOTHING, menu)

    switch (result) {
      /*case ACTION_CONCLUDE:
        done()
        break
      */

      case ACTION_ORDER:
        setIsMoving(true)
        break

      case ACTION_PENDING:
        moveTaskToList({
          from: today,
          level: todayLevel,
          index: todayIndex,
          to: todos,
          append: false,
          onMove: toAfter => {
            setTodos(toAfter)
            saveTodos()
          },
          onRemove: fromAfter => setToday(fromAfter),
          onGoBack: () => goBack(),
        })
        break

      case ACTION_EDIT:
        modifyTaskFromList({
          list: today,
          level: todayLevel,
          index: todayIndex,
          name: item.name,
          onModify: after => setToday(after),
        })
        break

      case ACTION_DELETE:
        confirmDeleteTask({
          list: today,
          level: todayLevel,
          index: todayIndex,
          name: item.name,
          confirmation: confirmDelete,
          onDelete: after => setToday(after),
        })
        break

      case ACTION_NOTHING || undefined: // Dismisses the dialog
        break
    }
  }

  function openTodaySubdivisions(item?: ListItem) {
    if (item !== undefined) setTodayIndex(getItemIndex(listToday, item))
    if (todayIndex < 0) return
    setTodayLevel(todayIndex)
    pushTodayLevels(todayLevel)
    setTodayIndex(-1)
  }

  function renderToday() {
    setSalvarToday(false)
    setToday(reactList(today))
    setSalvarToday(true)
  }

  function execDone(args: MenuArgs) {
    setTodayIndex(args.index)
    done()
  }

  function onDone(e: CustomEvent) {
    execDone(e.detail)
  }

  async function onMenuToday(e: CustomEvent) {
    await menuToday(e.detail)
  }

  function onOpenToday(e: CustomEvent) {
    openTodaySubdivisions(e.detail)
  }

    export function onClosePanelMove(e: CustomEvent) {
    const _isMoving = e.detail
    setIsMoving(_isMoving)
    return _isMoving
  }

  function moveTop() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<=0 || todayIndex > list.length-1) return
    let index = todayIndex
    setTodayIndex(0)
    setToday(moveList(today, index, todayIndex, todayLevel))
  }

  function moveUp() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<=0 || todayIndex > list.length-1) return
    let index = todayIndex
    setTodayIndex(todayIndex-1)
    setToday(moveList(today, index, todayIndex, todayLevel))
  }

  function moveDown() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<0 || todayIndex>=list.length-1) return
    let index = todayIndex
    setTodayIndex(todayIndex+1)
    setToday(moveList(today, index, todayIndex, todayLevel))
  }

  function moveBottom() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<0 || todayIndex>=list.length-1) return
    let index = todayIndex
    setTodayIndex(list.length-1)
    setToday(moveList(today, index, todayIndex, todayLevel))
  }
</script>

<tabContentItem class="tab-today">
  <stackLayout>
    {#if !isMoving}
      <AddTextButton
        list="{today}"
        level="{todayLevel}"
        setList="{setToday}"
        saveList="{saveToday}"
        mode="bottom"
      />
    {/if}

    <Tasks
      list="{listToday}"
      onMenu="{onMenuToday}"
      onOpen="{onOpenToday}"
      index="{todayIndex}"
      isMoving="{isMoving}"
      onClosePanelMove="{onClosePanelMove}"
      onMoveTop="{moveTop}"
      onMoveUp="{moveUp}"
      onMoveDown="{moveDown}"
      onMoveBottom="{moveBottom}"
      donabled="{!isMoving}"
      onDone="{onDone}"
    />
  </stackLayout>
</tabContentItem>

<style>
  .tab-today {
    padding-top: 8;
  }
</style>
