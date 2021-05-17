<script lang="typescript">
  import * as application from "tns-core-modules/application";
  import {
    AndroidApplication,
    AndroidActivityBackPressedEventData
  } from "tns-core-modules/application";
  import { Template } from 'svelte-native/components'

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

  const appSettings = require("tns-core-modules/application-settings");

  let strTodos = appSettings.getString("todos")
  console.log('strTodos:', strTodos)
  let todos = typeof strTodos === "string" ? JSON.parse(strTodos) : []
  let listTodos = todos

  let salvarToday = false
  let strToday = appSettings.getString("today")
  console.log('strToday:', strToday)
  let today: List = typeof strToday === "string" ? JSON.parse(strToday) : [] //today items go here
  let listToday = today

  let salvarDones = false
  let strDones = appSettings.getString("dones")
  console.log('strDones:', strDones)
  let dones = typeof strDones === "string" ? JSON.parse(strDones) : [] //completed items go here
  let listDones = dones

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

  let confirmation = false

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

  $: buttonText = isEditing ? 'Modificar' : 'Adicionar'

  let todoName = ""

  $: {
    textFieldValue = (isEditing && todoIndex > -1) ? todoName : ""
  }

  let isMoving = false
  let todoLongPress = false

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

  //on:itemTap="{onTodoItemTap}"
  //on:longPress="{onTodoLongPress}"

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
    if (todoLevel > -1) menu.push("⤴ Pasta raiz")
    todos.map((element: ListItem) => element.subdivisions && menu.push(element.name))

    let result = await action('Mover para:', "Nenhum", menu);

    switch (result) {
      case "⤴ Pasta raiz":
        todos = [item, ...todos]

        console.log('todoLevels antes:', JSON.stringify(todoLevels))
        todoLevel++
        todoLevels[1]++
        console.log('todoLevels depois:', JSON.stringify(todoLevels))

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

  const ACTION_CONCLUDE = "👍🏽 Pronta"
  const ACTION_TODAY = "☀ Fazer hoje!"
  const ACTION_ORDER = "↕ Ordem"
  const ACTION_MOVE_TO = "⤴ Mover para..."
  const ACTION_PENDING = "🕖 Pendente"
  const ACTION_SUBDIVID = "🗂 Subdividir"
  const ACTION_JOIN = "📄 Sem subdivisões"
  const ACTION_EDIT = "✍🏽 Editar"
  const ACTION_DELETE = "❌ Apagar"
  const ACTION_NOTHING = "Nada"

  async function todoMenu(args) {
    if (isEditing) {
      todos = modifyListItem({
        list: todos,
        index: todoIndex,
        name: textFieldValue,
        level: todoLevel,
      })
      hideKeyboard()
    }
    todoName = listTodos[args.index].name
    todoIndex = args.index
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
          confirmation,
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

  /*async function onTodoTouch(args: TouchGestureEventData) {
    if(args.action === "down") {
      this.start = new Date().getMilliseconds();
    }
    if(args.action === "up") {
      this.end = new Date().getMilliseconds();
      const duration = Math.abs(this.start - this.end)
      console.log(duration > 150? "long press": "tap")
    }
  }*/

  async function onTodoItemTap(args) {
    let menu = true
    if (todoLongPress) {
      menu = true
      todoLongPress = false
      //return
    }
    else {
      //menu = !listTodos[todoIndex].subdivisions
    }

    todoIndex = args.index

    if (menu) {
      await todoMenu(args)
    }
    else {
      openTodoSubdivisions()
    }
  }

  /*async function onTodoLongPress(args) {
    todoLongPress = true
    todoIndex = args.index

    //await todoMenu(args)
  }*/

  function renderToday() {
    salvarToday = false
    today = reactList(today)
    salvarToday = true
  }

  async function onTodayTap(args) {
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
          confirmation,
          onDelete: after => today = after,
        })
        break

      case ACTION_NOTHING || undefined: // Dismisses the dialog
        break
    }
  }

  async function onDoneTap(args) {
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
          confirmation,
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
    else if (tabIndex === 1 && isMoving) {
      isMoving = false
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
    else return false

    return true
  }
</script>

<page>
  <actionBar title="{title}">
    {#if (tabIndex===0 && todoLevel > -1)
      || (tabIndex===1 && todayLevel > -1)
      || (tabIndex===2 && doneLevel > -1)
    }
      <navigationButton
        text="Go back"
        android.systemIcon="ic_menu_back"
        on:tap="{goBack}"
      />
    {/if}
  </actionBar>

  <tabs id="guias" tabsPosition="bottom"
    selectedIndex={initialTabIndex}
    on:selectedIndexChange="{handleTabsChange}"
  >
    <tabStrip>
      <tabStripItem title="🕖 Pendentes" />
      <tabStripItem title="☀ Hoje" />
      <tabStripItem title="👍🏽 PRONTAS" />
    </tabStrip>

    <tabContentItem>
      <gridLayout
        columns="*,120"
        rows="70,*"
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
          class="-primary"
        />

        <listView
          items="{listTodos}"
          on:itemTap="{onTodoItemTap}"
          row="1"
          colSpan="2"
        >
          <Template let:item>
            <dockLayout stretchLastChild="true" colSpan="2">
              {#if item.subdivisions}
                <button
                  class="button-abrir"
                  dock="right"
                  width="50"
                  text="{"📁 "+item.subdivisions.length}"
                  on:tap="{() => openTodoSubdivisions(item)}"
                />
              {/if}
              <label
                text="{item.name}"
                textWrap="true"
                on:tap={() => onTodoItemTap({
                  index: getItemIndex(listTodos, item)
                })}
              />
            </dockLayout>
          </Template>
        </listView>

      </gridLayout>
    </tabContentItem>

    <tabContentItem>
      {#if isMoving }
        <dockLayout stretchLastChild="true">
          <flexboxLayout
            dock="right"
            width="70"
            height="100%"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            backgroundColor="#3c495e"
            class="move-panel"
          >
            <stackLayout>
              <button class="button-move" text="X" on:tap={() => isMoving = false}/>
            </stackLayout>

            <stackLayout>
              <stackLayout>
                <button class="button-move" text="⬆" on:tap={moveTop} />
              </stackLayout>

              <stackLayout>
                <button class="button-move" text="🔼" on:tap={moveUp} />
                <button class="button-move" text="🔽" on:tap={moveDown} />
              </stackLayout>

              <stackLayout>
                <button class="button-move" text="⬇" on:tap={moveBottom} />
              </stackLayout>
            </stackLayout>
          </flexboxLayout>

          <listView
            items="{listToday}"
            on:itemTap="{onTodayTap}"
          >
            <Template let:item>
              {#if listToday[todayIndex] === item}
                <label
                  class="selected-move"
                  text="{item.name}"
                  textWrap="true"
                />
              {:else}
                <label
                  text="{item.name}"
                  textWrap="true"
                />
              {/if}
            </Template>
          </listView>
        </dockLayout>
      {:else}
        <listView
          items="{listToday}"
          on:itemTap="{onTodayTap}"
        >
        <Template let:item>
          <dockLayout stretchLastChild="true" colSpan="2">
            {#if item.subdivisions}
              <button
                class="button-abrir"
                dock="right"
                width="50"
                text="{"📁 "+item.subdivisions.length}"
                on:tap="{() => openTodaySubdivisions(item)}"
              />
            {/if}
            {#if listToday[todayIndex] === item}
              <label
                text="{item.name}"
                class="selected-normal"
                textWrap="true"
                on:tap={() => onTodayTap({
                  index: getItemIndex(listToday, item)
                })}
              />
            {:else}
              <label
                text="{item.name}"
                textWrap="true"
                on:tap={() => onTodayTap({
                  index: getItemIndex(listToday, item)
                })}
              />
            {/if}
          </dockLayout>
        </Template>
      </listView>
    {/if}
    </tabContentItem>

    <tabContentItem>
      <listView
        items="{listDones}"
        on:itemTap="{onDoneTap}"
      >
        <Template let:item>
          <dockLayout stretchLastChild="true" colSpan="2">
            {#if item.subdivisions}
              <button
                class="button-abrir"
                dock="right"
                width="50"
                text="{"📁 "+item.subdivisions.length}"
                on:tap="{() => openDoneSubdivisions(item)}"
              />
            {/if}
            <label
              text="{item.name}"
              class="todo-item-completed"
              textWrap="true"
              on:tap={() => onDoneTap({
                index: getItemIndex(listDones, item)
              })}
            />
          </dockLayout>
        </Template>
      </listView>
    </tabContentItem>
  </tabs>
</page>

<style>
	textField {
		font-size: 20;
	}

  .todo-item-completed {
	  color: #939393;
	  text-decoration: line-through;
  }

  .button-move {
    border-radius: 8;
	  font-size: 28;
    padding: 0;
    color: #fff;
    border: 1 solid #fff;
    background: transparent;
  }

  .selected-move {
    font-weight: bold;
    color: #3c495e;
  }

  .selected-normal {
  }

  .button-abrir {
    border-radius: 5;
    font-size: 16;
    padding: 0;
    height: 24;
  }

</style>
