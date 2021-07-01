<script lang="typescript">
  import * as application from "tns-core-modules/application";
  import {
    AndroidApplication,
    AndroidActivityBackPressedEventData
  } from "tns-core-modules/application";

  import {
    addToList,
    confirmDeleteTask,
    getItemIndex,
    List,
    ListItem,
    modifyListItem,
    modifyTaskFromList,
    moveList,
    moveTaskToList,
    reactList,
    removeFromList,
    saveList
  } from './utils/lists'

  import { hideKeyboard, showKeyboard } from './utils/os';
  import { action } from '@nativescript/core/ui/dialogs'
	import { showModal } from 'svelte-native'

  const appSettings = require("tns-core-modules/application-settings");

  import Options from "./pages/Options.svelte";
  import Tasks from "./components/Tasks.svelte";
  import { DEFAULT_CONFIRM_DELETE, OPTION_CONFIRM_DELETE } from "./config/options";

  let strTodos = appSettings.getString("todos")
  let todos = typeof strTodos === "string" ? JSON.parse(strTodos) : []
  let listTodos = todos

  let salvarToday = false
  let strToday = appSettings.getString("today")
  let today: List = typeof strToday === "string" ? JSON.parse(strToday) : [] //today items go here
  let listToday = today

  let salvarDones = false
  let strDones = appSettings.getString("dones")
  let dones = typeof strDones === "string" ? JSON.parse(strDones) : [] //completed items go here
  let listDones = dones

  let confirmDelete: boolean = false
  loadOptions()

  function loadOptions() {
    confirmDelete = appSettings.getBoolean(OPTION_CONFIRM_DELETE, DEFAULT_CONFIRM_DELETE)
  }

  const ACTION_ADICIONAR = "+"

  const ACTION_CONCLUDE = "👍 Pronta"
  const ACTION_TODAY = "☀ Fazer hoje!"
  const ACTION_ORDER = "↕ Ordem"
  const ACTION_MOVE_TO = "⤴ Mover para..."
  const ACTION_MOVE_OUT = "⤴ Fora"
  const ACTION_PENDING = "🕖 Pendente"
  const ACTION_SUBDIVID = "🗂 Subdividir"
  const ACTION_JOIN = "📄 Sem subdivisões"
  const ACTION_EDIT = "✍ Editar"
  const ACTION_DELETE = "❌ Apagar"
  const ACTION_NOTHING = "Nada"

  const ACTION_CONFIG = "⚙ Configurações"

  let initialTabIndex = Number(today.length>0)
  let tabIndex = 0

  let todoIndex = -1
  let todayIndex = -1
  let doneIndex = -1

  let todoLevel = -1
  let todayLevel = -1
  let doneLevel = -1

  let todoLevels = [-1]
  let todayLevels = [-1]
  let doneLevels = [-1]

  let todoGroups = []

  $: {
    todoGroups = []
    todos.map((item: ListItem) => item.subdivisions && todoGroups.push(item))
  }

  function saveTodos() {
    saveList(todos, "todos")
  }

  $: if (todos) {
    listTodos = reactList(todoLevel > -1
      ? todos[todoLevel].subdivisions
      : todos
    )
  }

  $: if (today) {
    listToday = reactList(todayLevel > -1
      ? today[todayLevel].subdivisions
      : today
    )
  }

  $: if (dones) {
    listDones = reactList(doneLevel > -1
      ? dones[doneLevel].subdivisions
      : dones
    )
  }

  function saveToday() {
    if (salvarToday) saveList(today, "today")
    salvarToday = true
  }

  $: if (today) saveToday()

  $: {
    if (dones && salvarDones) saveList(dones, "dones")
    salvarDones = true
  }

  let textFieldValue = ""

  let isEditing = false

  $: buttonText = isEditing ? 'Modificar' : ACTION_ADICIONAR

  let todoName = ""

  $: {
    textFieldValue = (isEditing && todoIndex > -1) ? todoName : ""
  }

  let isMoving = false
  const onClosePanelMove = (e: CustomEvent) => isMoving = e.detail

  let defaultTitle = "Minhas Tarefas"
  let title = defaultTitle

  $: titleTodos = todoLevel > -1 ? todos[todoLevel].name : defaultTitle
  $: titleToday = todayLevel > -1 ? today[todayLevel].name : defaultTitle
  $: titleDones = doneLevel > -1 ? dones[doneLevel].name : defaultTitle

  $: switch (tabIndex) {
    case 0: title = titleTodos; break
    case 1: title = titleToday; break
    case 2: title = titleDones; break
  }

  function onButtonTap() {
    if (textFieldValue === "") return; // Prevents users from entering an empty string.

    if (isEditing) {
      todos = modifyListItem({
        list: todos,
        index: todoIndex,
        name: textFieldValue,
        level: todoLevel,
      })
      saveTodos()

      isEditing = false
      hideKeyboard()
    }
    else {
      let item = { name: textFieldValue }

      todos = addToList({
        list: todos,
        item,
        level: todoLevel
      })
      saveTodos()
    }

    textFieldValue = ""; // Clears the text field so that users can start adding new tasks immediately.
  }

  async function todoMenuMoverPara(item: ListItem) {
    const menu = []
    if (todoLevel > -1) menu.push(ACTION_MOVE_OUT)
    todos.map((element: ListItem) => element.subdivisions && menu.push(element.name))

    let result = await action('Mover para:', "Nenhum", menu);

    switch (result) {
      case ACTION_MOVE_OUT:
        todos = [item, ...todos]

        todoLevel++
        todoLevels[1]++

        todos = removeFromList({
          list: todos,
          index: todoIndex,
          level: todoLevel,
        })

        saveTodos()

        break

      case "Nada" || undefined: // Dismisses the dialog
        break;

      default:
        const found = todos.find((element: ListItem) => element.name === result)
        if (!found) return

        const foundIndex = getItemIndex(todos, found)
        if (foundIndex < 0) return

        if (todoLevel < 0) {
          todos = addToList({
            list: todos,
            item,
            level: foundIndex
          })

          todos = removeFromList({
            list: todos,
            index: todoIndex,
          })

          saveTodos()
        }
        else {
          todos = addToList({
            list: todos,
            item: item,
            level: foundIndex
          })

          todos = removeFromList({
            list: todos,
            index: todoIndex,
            level: todoLevel,
          })

          saveTodos()
        }

        break
    }
  }

  async function menuTodo(args) {
    todoIndex = args.index
    todoName = listTodos[args.index].name
    if (isEditing) {
      todos = modifyListItem({
        list: todos,
        index: todoIndex,
        name: textFieldValue,
        level: todoLevel,
      })
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

    let result = await action(item.name, "Nada", menu);

    switch (result) {
      case ACTION_TODAY:
        moveTaskToList({
          from: todos,
          level: todoLevel,
          index: todoIndex,
          to: today,
          append: true,
          onMove: toAfter => today = toAfter,
          onRemove: fromAfter => {
            todos = fromAfter
            saveTodos()
          },
          onGoBack: () => goBack(),
        })
        break;

      case ACTION_CONCLUDE:
        moveTaskToList({
          from: todos,
          level: todoLevel,
          index: todoIndex,
          to: dones,
          append: false,
          onMove: toAfter => dones = toAfter,
          onRemove: fromAfter => {
            todos = fromAfter
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
          onModify: after => (todos = after, saveTodos()),
        })
        break

      case ACTION_DELETE:
        confirmDeleteTask({
          name: item.name,
          list: todos,
          index: todoIndex,
          level: todoLevel,
          confirmation: confirmDelete,
          onDelete: after => (todos = after, saveTodos()),
        })
        break

      case ACTION_SUBDIVID:
        title = item.name
        todoLevel = todoIndex
        if (item.subdivisions === undefined) {
          item.subdivisions = []
          todos[todoIndex] = item
          saveTodos()
        }
        todoLevels.push(todoLevel)
        todoIndex = -1

        break;

      case ACTION_MOVE_TO:
        await todoMenuMoverPara(item)
        break

      case ACTION_JOIN:
        if (todoLevel > -1) return
        todos[todoIndex].subdivisions = undefined
        saveTodos()

        break

      case ACTION_NOTHING || undefined: // Dismisses the dialog
        break;
    }
  }

  function openTodoSubdivisions(item?: ListItem) {
    if (item !== undefined) todoIndex = getItemIndex(listTodos, item)
    if (todoIndex < 0) return
    todoLevel = todoIndex
    todoLevels.push(todoLevel)
    todoIndex = -1
  }

  function openTodaySubdivisions(item?: ListItem) {
    if (item !== undefined) todayIndex = getItemIndex(listToday, item)
    if (todayIndex < 0) return
    todayLevel = todayIndex
    todayLevels.push(todayLevel)
    todayIndex = -1
  }

  function openDoneSubdivisions(item?: ListItem) {
    if (item !== undefined) doneIndex = getItemIndex(listDones, item)
    if (doneIndex < 0) return
    doneLevel = doneIndex
    doneLevels.push(doneLevel)
    doneIndex = -1
  }

  function renderToday() {
    salvarToday = false
    today = reactList(today)
    salvarToday = true
  }

  async function menuToday(args) {
    todayIndex = args.index

    if (isMoving) return renderToday()


    let menu = []
    menu.push(ACTION_CONCLUDE)
    if (listToday.length>1) {
      menu.push(ACTION_ORDER)
    }
    menu.push(ACTION_PENDING)
    menu.push(ACTION_EDIT)
    menu.push(ACTION_DELETE)

    let item = todayLevel > -1 ? today[todayLevel].subdivisions[todayIndex] : today[todayIndex]
    let result = await action(item.name, "Nada", menu)

    switch (result) {
      case ACTION_CONCLUDE:
        moveTaskToList({
          from: today,
          level: todayLevel,
          index: todayIndex,
          to: dones,
          append: false,
          onMove: toAfter => dones = toAfter,
          onRemove: fromAfter => today = fromAfter,
          onGoBack: () => goBack(),
        })
        break;
      case ACTION_ORDER: {
        isMoving = true
        break;
      }
      case ACTION_PENDING:
        moveTaskToList({
          from: today,
          level: todayLevel,
          index: todayIndex,
          to: todos,
          append: false,
          onMove: toAfter => {
            todos = toAfter
            saveTodos()
          },
          onRemove: fromAfter => today = fromAfter,
          onGoBack: () => goBack(),
        })

        break

      case ACTION_EDIT:
        modifyTaskFromList({
          list: today,
          level: todayLevel,
          index: todayIndex,
          name: item.name,
          onModify: after => today = after,
        })
        break

      case ACTION_DELETE:
        confirmDeleteTask({
          list: today,
          level: todayLevel,
          index: todayIndex,
          name: item.name,
          confirmation: confirmDelete,
          onDelete: after => today = after,
        })
        break

      case ACTION_NOTHING || undefined: // Dismisses the dialog
        break
    }
  }

  async function menuDone(args) {
    doneIndex = args.index

    let menu = []
    menu.push(ACTION_TODAY)
    menu.push(ACTION_PENDING)
    menu.push(ACTION_EDIT)
    menu.push(ACTION_DELETE)

    let item = doneLevel > -1 ? dones[doneLevel].subdivisions[doneIndex] : dones[doneIndex]
    let result = await action(item.name, "Nada", menu);

    switch (result) {
      case ACTION_TODAY:
        moveTaskToList({
          from: dones,
          level: doneLevel,
          index: doneIndex,
          to: today,
          append: true,
          onMove: toAfter => today = toAfter,
          onRemove: fromAfter => dones = fromAfter,
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
            todos = toAfter
            saveTodos()
          },
          onRemove: fromAfter => dones = fromAfter,
          onGoBack: () => goBack(),
        })
        break

      case ACTION_EDIT:
        modifyTaskFromList({
          list: dones,
          level: doneLevel,
          index: doneIndex,
          name: item.name,
          onModify: after => dones = after,
        })

        break

      case ACTION_DELETE:
        confirmDeleteTask({
          list: dones,
          level: doneLevel,
          index: doneIndex,
          name: item.name,
          confirmation: confirmDelete,
          onDelete: after => dones = after,
        })
        break

      case ACTION_NOTHING || undefined: // Dismisses the dialog
        break
    }
  }

  function moveTop() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<=0 || todayIndex > list.length-1) return
    let index = todayIndex
    todayIndex = 0
    today = moveList(today, index, todayIndex, todayLevel)
  }

  function moveUp() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<=0 || todayIndex > list.length-1) return
    let index = todayIndex
    todayIndex = todayIndex-1
    today = moveList(today, index, todayIndex, todayLevel)
  }

  function moveDown() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<0 || todayIndex>=list.length-1) return
    let index = todayIndex
    todayIndex = todayIndex+1
    today = moveList(today, index, todayIndex, todayLevel)
  }

  function moveBottom() {
    let list = todayLevel > -1 ? today[todayLevel].subdivisions : today
    if (todayIndex<0 || todayIndex>=list.length-1) return
    let index = todayIndex
    todayIndex = list.length-1
    today = moveList(today, index, todayIndex, todayLevel)
  }

  if (application.android) {
    application.android.on(
      AndroidApplication.activityBackPressedEvent,
      (data: AndroidActivityBackPressedEventData) => {
        if (goBack()) data.cancel = true; // prevents default back button behavior
      }
    )
  }

  function handleTabsChange(args) {
    var page = args.object;
    var tabs = page.getViewById("guias");
    tabIndex = tabs.selectedIndex
  }

  function goBack() {
    if (tabIndex === 0 && isEditing) {
      isEditing = false;
      return true
    }
    else if (tabIndex === 0 && todoLevels.length>1) {
      todoLevels.pop()
      todoLevel = todoLevels[todoLevels.length-1]
      if (todoLevel > -1) {
        listTodos = listTodos[todoLevel].subdivisions
      }
      else {
        listTodos = todos
      }
    }
    else if (tabIndex === 1 && todayLevels.length>1) {
      todayLevels.pop()
      todayLevel = todayLevels[todayLevels.length-1]
      if (todayLevel > -1) {
        listToday = listToday[todoLevel].subdivisions
      }
      else {
        listToday = today
      }
      // console.log('todayIndex', todayIndex)
      todayIndex = -1
    }
    else if (tabIndex === 2 && doneLevels.length>1) {
      doneLevels.pop()
      doneLevel = doneLevels[doneLevels.length-1]
      if (doneLevel > -1) {
        listDones = listDones[doneLevel].subdivisions
      }
      else {
        listDones = dones
      }
    }
    else if (tabIndex === 1 && isMoving) {
      todayIndex = -1
      isMoving = false
    }

    else return false

    return true
  }

  async function launchOptions() {
    await showModal({
      page: Options,
      fullscreen: true,
      animated: true,
    })

    loadOptions()
  }

  async function onMenuTodo(e: CustomEvent) {
    await menuTodo(e.detail)
  }

  async function onMenuToday(e: CustomEvent) {
    await menuToday(e.detail)
  }

  async function onMenuDone(e: CustomEvent) {
    await menuDone(e.detail)
  }

  function onOpenTodo(e: CustomEvent) {
    openTodoSubdivisions(e.detail)
  }

  function onOpenToday(e: CustomEvent) {
    openTodaySubdivisions(e.detail)
  }

  function onOpenDone(e: CustomEvent) {
    openDoneSubdivisions(e.detail)
  }
</script>

<page class="page">
  <actionBar
    title="{title}"
    tintColor="#fff"
    flat="false"
  >
    {#if (tabIndex===0 && todoLevel > -1)
      || (tabIndex===1 && todayLevel > -1)
      || (tabIndex===2 && doneLevel > -1)
    }
      <navigationButton
        text="Go back"
        android.systemIcon="ic_menu_back"
        on:tap="{goBack}"
        tintColor="#fff"
        class="menu"
      />
    {/if}

    <actionItem
      on:tap="{launchOptions}"
      android.systemIcon="ic_menu_view"
      android.position="popup"
      class="menu"
      text="{ACTION_CONFIG}"
    />
  </actionBar>

  <tabs id="guias" tabsPosition="bottom"
    selectedIndex={initialTabIndex}
    on:selectedIndexChange="{handleTabsChange}"
  >
    <tabStrip>
      <tabStripItem class="tab-item" title="🕖 Pendentes" />
      <tabStripItem class="tab-item" title="☀ Hoje" />
      <tabStripItem class="tab-item" title="👍 Prontas" />
    </tabStrip>

    <tabContentItem class="tab-todo">
      <gridLayout
        columns="*,auto"
        rows="auto,*"
      >
        <!-- Configura o campo de texto e garante que pressionar Return no teclado
          produz o mesmo resultado que tocar no botão. -->
        <textField
          col="0" row="0"
          bind:text="{textFieldValue}"
          hint="Digite uma nova tarefa..."
          editable="true"
          on:returnPress="{onButtonTap}"
        />

        <button
          col="1" row="0"
          text="{buttonText}"
          on:tap="{onButtonTap}"
          class="button"
        />

        <Tasks
          row="1"
          colSpan="2"
          list="{listTodos}"
          onMenu="{onMenuTodo}"
          onOpen="{onOpenTodo}"
          isMoving="{false}"
        />
      </gridLayout>
    </tabContentItem>

    <tabContentItem class="tab-today">
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
      />
    </tabContentItem>

    <tabContentItem class="tab-dones">
      <Tasks
        list="{listDones}"
        completed="{true}"
        onMenu="{onMenuDone}"
        onOpen="{onOpenDone}"
        isMoving="{false}"
      />
    </tabContentItem>
  </tabs>
</page>

<style>
  actionBar {
    font-family: 'Architects Daughter', "ArchitectsDaughter-Regular", cursive;
    font-size: 10;
    background: #3c495e;
    color: #fff;
  }

  textField {
    font-family: 'KoHo-Regular';
		font-size: 20;
    margin: 8 8 0 8;
    placeholder-color: #ddd;
	}

  .tab-today {
    padding-top: 8;
  }

  .tab-dones {
    padding-top: 8;
  }

  .tab-item {
    font-family: 'KoHo', "KoHo-SemiBold", sans-serif;
    font-weight: 600;
    font-size: 12.5;
    color: #262626
  }

  .button {
    font-family: 'KoHo-SemiBold';
    font-size: 20;
    background: #3c495e;
    color: #fff;
    margin: 8;
    border-radius: 50%;
    padding: 0;
    margin: 4;
    margin-left: 0;
    margin-right: 12;
    height: 50;
    width: 50;
  }

  .menu {
    color: #fff;
  }
</style>
