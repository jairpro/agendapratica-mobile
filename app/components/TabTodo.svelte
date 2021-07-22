<script lang="ts">
  import { action } from '@nativescript/core/ui/dialogs'

  import {
    ACTION_ADICIONAR,
    ACTION_CONCLUDE,
    ACTION_DELETE,
    ACTION_EDIT,
    ACTION_JOIN,
    ACTION_MOVE_OUT,
    ACTION_MOVE_TO,
    ACTION_NOTHING,
    ACTION_SUBDIVID,
    ACTION_TODAY
  } from '~/utils/consts'

  import {
    List,
    modifyListItem,
    moveTaskToList,
    modifyTaskFromList,
    confirmDeleteTask,
    ListItem,
    removeFromList,
    getItemIndex,
    addToList,
    reactList,
  } from '~/utils/lists'

  import {
    isEditingStore,
    setTitle,
    tabIndexStore,
  } from '~/stores/global'

  import {
    listTodosStore,
    todoLevelStore,
    todosStore,
    todoIndexStore,
    setTodos,
    setTodoIndex,
    setTodoLevel,
    incrementTodoLevel,
    pushTodoLevels,
    incrementTodoLevelsItem,
    saveTodos,
    removeSubdivisionsFromTodos,
    setListTodos,
  } from '~/stores/todo'

  import Tasks from './Tasks.svelte'

  import { todayStore, setToday } from '~/stores/today'
  import { donesStore, setDones } from '~/stores/dones'
  import { goBack } from '~/utils/goBack'
  import { MenuArgs } from '~/utils/types'
  import { confirmDeleteStore } from '~/stores/options'
  import { hideKeyboard, showKeyboard } from '~/utils/os'
  import AddTextButton from './AddTextButton.svelte';

  let isEditing: boolean
  isEditingStore.subscribe(value => isEditing = value)

  let confirmDelete: boolean
  confirmDeleteStore.subscribe(value => confirmDelete = value)

  let todos: List
  let listTodos: List
  let todoIndex: number
  let todoLevel: number
  todosStore.subscribe(value => todos = value)
  listTodosStore.subscribe(value => listTodos = value)
  todoIndexStore.subscribe(value => todoIndex = value)
  todoLevelStore.subscribe(value => todoLevel = value)

  let today: List
  todayStore.subscribe(value => today = value)

  let dones: List
  donesStore.subscribe(value => dones = value)

  let textFieldValue = ""
  let todoName = ""

  let tabIndex: number
  tabIndexStore.subscribe(value => tabIndex = value)

  $: {
    textFieldValue = (isEditing && todoIndex > -1) ? todoName : ""
  }

  let todoGroups = []

  $: {
    todoGroups = []
    todos.map((item: ListItem) => item.subdivisions && todoGroups.push(item))
  }

  $: if (todos) {
    setListTodos(reactList(todoLevel > -1
      ? todos[todoLevel].subdivisions
      : todos
    ))
  }

  async function todoMenuMoverPara(item: ListItem) {
    const menu = []
    if (todoLevel > -1) menu.push(ACTION_MOVE_OUT)
    todos.map((element: ListItem) => element.subdivisions && menu.push(element.name))

    let result = await action('Mover para:', "Nenhum", menu)

    switch (result) {
      case ACTION_MOVE_OUT:
        setTodos([item, ...todos])

        incrementTodoLevel()
        incrementTodoLevelsItem(1)

        setTodos(removeFromList({
          list: todos,
          index: todoIndex,
          level: todoLevel,
        }))

        saveTodos()

        break

      case "Nada" || undefined: // Dismisses the dialog
        break

      default:
        const found = todos.find((element: ListItem) => element.name === result)
        if (!found) return

        const foundIndex = getItemIndex(todos, found)
        if (foundIndex < 0) return

        if (todoLevel < 0) {
          setTodos(addToList({
            list: todos,
            item,
            level: foundIndex
          }))

          setTodos(removeFromList({
            list: todos,
            index: todoIndex,
          }))

          saveTodos()
        }
        else {
          setTodos(addToList({
            list: todos,
            item: item,
            level: foundIndex
          }))

          setTodos(removeFromList({
            list: todos,
            index: todoIndex,
            level: todoLevel,
          }))

          saveTodos()
        }
        break
    }
  }

  async function menuTodo(args: MenuArgs) {
    setTodoIndex(args.index)
    todoName = listTodos[args.index].name
    if (isEditing) {
      setTodos(modifyListItem({
        list: todos,
        index: todoIndex,
        name: textFieldValue,
        level: todoLevel,
      }))
      hideKeyboard()
    }
    if (isEditing) {
      showKeyboard()
      return
    }

    let item = listTodos[args.index]

    let menu = []
    menu.push(ACTION_TODAY)
    menu.push(ACTION_CONCLUDE)
    menu.push(ACTION_EDIT)
    if (todoLevel<0) {
      if (!listTodos[todoIndex].subdivisions) {
        menu.push(ACTION_SUBDIVID)
      }
      else if (listTodos[todoIndex].subdivisions.length === 0) {
        menu.push(ACTION_JOIN)
      }
    }
    if (!listTodos[todoIndex].subdivisions) {
      menu.push(ACTION_MOVE_TO)
    }
    menu.push(ACTION_DELETE)

    let result = await action(item.name, ACTION_NOTHING, menu)

    switch (result) {
      case ACTION_TODAY:
        moveTaskToList({
          from: todos,
          level: todoLevel,
          index: todoIndex,
          to: today,
          append: true,
          onMove: toAfter => setToday(toAfter),
          onRemove: fromAfter => {
            setTodos(fromAfter)
            saveTodos()
          },
          onGoBack: () => goBack(),
        })
        break

      case ACTION_CONCLUDE:
        moveTaskToList({
          from: todos,
          level: todoLevel,
          index: todoIndex,
          to: dones,
          append: false,
          onMove: toAfter => setDones(toAfter),
          onRemove: fromAfter => {
            setTodos(fromAfter)
            saveTodos()
          },
          onGoBack: () => goBack(),
        })
        break

      case ACTION_EDIT:
        modifyTaskFromList({
          list: todos,
          level: todoLevel,
          index: todoIndex,
          name: item.name,
          onModify: after => (setTodos(after), saveTodos()),
        })
        break

      case ACTION_DELETE:
        confirmDeleteTask({
          name: item.name,
          list: todos,
          index: todoIndex,
          level: todoLevel,
          confirmation: confirmDelete,
          onDelete: after => (setTodos(after), saveTodos()),
        })
        break

      case ACTION_SUBDIVID:
        setTitle(item.name)
        setTodoLevel(todoIndex)
        if (item.subdivisions === undefined) {
          item.subdivisions = []
          setTodos({ index: todoIndex, item })
          saveTodos()
        }
        pushTodoLevels(todoLevel)
        setTodoIndex(-1)
        break

      case ACTION_MOVE_TO:
        await todoMenuMoverPara(item)
        break

      case ACTION_JOIN:
        if (todoLevel > -1) return
        removeSubdivisionsFromTodos(todoIndex)
        saveTodos()
        break

      case ACTION_NOTHING || undefined: // Dismisses the dialog
        break
    }
  }

  function openTodoSubdivisions(item?: ListItem) {
    if (item !== undefined) todoIndex = getItemIndex(listTodos, item)
    if (todoIndex < 0) return
    setTodoLevel(todoIndex)
    pushTodoLevels(todoLevel)
    setTodoIndex(-1)
  }

  async function onMenuTodo(e: CustomEvent) {
    await menuTodo(e.detail)
  }

  function onOpenTodo(e: CustomEvent) {
    openTodoSubdivisions(e.detail)
  }
</script>

<tabContentItem class="tab-todo">
  <stackLayout>
    <AddTextButton
      list="{todos}"
      level="{todoLevel}"
      setList="{setTodos}"
      saveList="{saveTodos}"
      mode="top"
    />

    <Tasks
      row="1"
      colSpan="2"
      list="{listTodos}"
      onMenu="{onMenuTodo}"
      onOpen="{onOpenTodo}"
      isMoving="{false}"
    />
  </stackLayout>
</tabContentItem>
