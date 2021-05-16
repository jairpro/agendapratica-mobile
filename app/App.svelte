<script lang="typescript">
  import { Template } from 'svelte-native/components'
  import * as utils from "tns-core-modules/utils/utils";
  import {
    isAndroid,
    //isIOS,
  } from "tns-core-modules/platform";
  //import { frame } from "tns-core-modules/ui/frame";
  import * as application from "tns-core-modules/application";
  import { AndroidApplication, AndroidActivityBackPressedEventData } from "tns-core-modules/application";
  //import { TouchGestureEventData } from '@nativescript/core';

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

  type RemoveFromListData = {
    list: List
    index?: number
    item?: ListItem
    level?: number
  }

  function removeFromList(data: RemoveFromListData): List {
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

  type ListItem = {
    name: string
    subdivisions?: List
  }

  type List = ListItem[]

  type AddToListData = {
    list: List
    item: ListItem
    level?: number
  }

  const addToList = (data: AddToListData): List => {
    const { item, level, list } = data

    if (level > -1) {
      list[level].subdivisions = [item, ...list[level].subdivisions]
      return JSON.parse(JSON.stringify(list))
    }

    return [item, ...list]
  }

  type AppendToListData = {
    list: List
    item?: ListItem
    index?: number
    level?: number
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

  type ModifyListItemData = {
    list: List
    index: number
    name: string
    level?: number
  }

  const modifyListItem = (data: ModifyListItemData) => {
    const { list, index, name, level } = data

    if (level > -1) {
      list[level].subdivisions[index].name = name
    }
    else {
      list[index].name = name
    }

    return JSON.parse(JSON.stringify(list))
  }

  function saveList(list, key) {
    appSettings.setString(key, JSON.stringify(list))
    console.log(`Salvou ${key}`)
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

  function reactList(list: List): List {
    return JSON.parse(JSON.stringify(list))
  }

  type NewTopItemData = {
    from: List
    to: List
    level: number
    index: number
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

  type MoveTaskToListData = {
    from: List
    to: List
    level: number
    index: number
    append: boolean
    onMove: (toAfter: List) => void
    onRemove: (fromAfter: List) => void
  }

  function moveTaskToList(data: MoveTaskToListData) {
    const { from, level, to, index, append, onMove, onRemove } = data

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
          goBack()
        }

        onRemove(fromAfter)
      }
    }
  }

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
    if (item.subdivisions) {
      menu.push("Abrir")
    }
    menu.push("Para hoje")
    menu.push("Concluir")
    menu.push("Editar")
    if (todoLevel<0 && !listTodos[todoIndex].subdivisions) {
      menu.push("Subdividir")
    }
    menu.push("Apagar")

    let result = await action(item.name, "Nada", menu);

    switch (result) {
      case "Abrir":
        openTodoSubdivisions()
        break
      case "Para hoje":
        /*
        let remove = false

        if (todoLevel > -1) {
          const topName = todos[todoLevel].name
          const found = today.find(element => element.name === topName)

          if (found) {
            found.subdivisions = [...found.subdivisions, item]
            today = reactList(today)
            remove = true
            item = false
          }
          else {
            item = newTopItem({
              from: todos,
              to: today,
              level: todoLevel,
              index: todoIndex,
            })
          }
        }
        else {
          const topName = todos[todoIndex].name
          const found = today.find(element => element.name === topName)

          if (found && item.subdivisions) {
            found.subdivisions = [...found.subdivisions, ...todos[todoIndex].subdivisions]
            today = reactList(today)
            remove = true
            item = false
          }
        }
        if (item) {
          today = appendToList({ list: today, item })
          remove = true
        }

        if (remove) {
          todos = removeFromList({
            list: todos,
            index: todoIndex,
            level: todoLevel,
          })

          if (todoLevel > -1 && todos[todoLevel].subdivisions.length === 0) {
            todos = removeFromList({
              list: todos,
              index: todoLevel,
            })
            goBack()
          }

          saveTodos()
        }
        */
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
          }
        })
        break;

      case "Concluir":
        /*
        dones = addToList({
          list: dones,
          item
        })

        todos = removeFromList({
          list: todos,
          index: todoIndex,
          level: todoLevel,
        }) // Removes the tapped active task.

        saveTodos()
        */
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
          }
        })

        break;
      case "Editar": {
        textFieldValue = item.name
        isEditing = true
        showKeyboard()
        break;
      }
      case "Apagar":
        todos = removeFromList({
          list: todos,
          index: todoIndex,
          level: todoLevel,
        }) // Removes the tapped active task.
        saveTodos()
        break;
      case "Subdividir":
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
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
  }

  function openTodoSubdivisions() {
    todoLevels.push(todoLevel)
    todoLevel = todoIndex
    todoIndex = -1
  }

  function openTodaySubdivisions() {
    todayLevels.push(todayLevel)
    todayLevel = todayIndex
    todayIndex = -1
  }

  function openDoneSubdivisions() {
    doneLevels.push(doneLevel)
    doneLevel = doneIndex
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

  /*function renderToday() {
    salvarToday = false
    today = JSON.parse(JSON.stringify(today))
    salvarToday = true
  }*/

  async function onTodayTap(args) {
    todayIndex = args.index
    //renderToday()

    if (isMoving) return

    let menu = []
    if (listToday[todayIndex].subdivisions) {
      menu.push("Abrir")
    }
    menu.push("Concluir")
    if (listToday.length>1) {
      menu.push("Mover")
    }
    menu.push("Pendente")
    menu.push("Apagar")

    let item = todayLevel > -1 ? today[todayLevel].subdivisions[todayIndex] : today[todayIndex]
    let result = await action(item.name, "Nada", menu)

    switch (result) {
      case "Abrir":
        openTodaySubdivisions()
        break
      case "Concluir":
        /*
        dones = addToList({
          list: dones,
          item
        }) // Places the tapped active task at the top of the dones tasks.

        today = removeFromList({ list: today, item, level: todayLevel }) // Removes the tapped active task.
        */
        moveTaskToList({
          from: today,
          level: todayLevel,
          index: todayIndex,
          to: dones,
          append: false,
          onMove: toAfter => dones = toAfter,
          onRemove: fromAfter => today = fromAfter
        })
        break;
      case "Mover": {
        isMoving = true
        break;
      }
      case "Pendente":
        /*
        todos = addToList({
          list: todos,
          item
        }) // Places the tapped active task at the top of the pendent tasks.
        saveTodos()

        today = removeFromList({ list: today, item, level: todayLevel }) // Removes the tapped active task.
        */
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
        })

        break;
      case "Apagar":
        today = removeFromList({ list: today, item, level: todayLevel }) // Removes the tapped active task.
        break;
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
  }

  async function onDoneTap(args) {
    doneIndex = args.index

    let menu = []
    if (listDones[doneIndex].subdivisions) {
      menu.push("Abrir")
    }
    menu.push("Para hoje")
    menu.push("Pendente")
    menu.push("Apagar")

    let item = doneLevel > -1 ? dones[doneLevel].subdivisions[doneIndex] : dones[doneIndex]
    let result = await action(item.name, "Nada", menu);

    switch (result) {
      case "Abrir":
        openDoneSubdivisions()
        break
      case "Para hoje":
        /*today = appendToList(today, item) // Places the tapped active task at the top of the today tasks.
        dones = removeFromList({ list: dones, item }) // Removes the tapped active task.*/
        moveTaskToList({
          from: dones,
          level: doneLevel,
          index: doneIndex,
          to: today,
          append: true,
          onMove: toAfter => today = toAfter,
          onRemove: fromAfter => dones = fromAfter
        })
        break;
      case "Pendente":
        /*todos = addToList({
          list: todos,
          item
        }) // Places the tapped active task at the top of the pendent tasks.
        saveTodos()

        dones = removeFromList({ list: dones, item }) // Removes the tapped active task.*/
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
          onRemove: fromAfter => dones = fromAfter
        })
        break;
      case "Apagar":
        dones = removeFromList({ list: dones, item }) // Removes the tapped active task.
        break;
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
  }

  function array_move(arr1: any[], old_index: number, new_index: number): any[] {
    let arr = JSON.parse(JSON.stringify(arr1))
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }

  function moveList(list: List, indexSource: number, indexDestiny: number, level: number): List {
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

  function hideKeyboard() {
    // https://stackoverflow.com/a/60269199/12769114
    if (isAndroid) {
      utils.ad.dismissSoftInput()
    }
    /*if (isIOS) {
      frame.topmost().nativeView.endEditing(true);
    }*/
  }

  function showKeyboard() {
    /* (isAndroid) {
      utils.ad.showSoftInput()
    }*/
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
      <tabStripItem title="Pendentes" />
      <tabStripItem title="Hoje" />
      <tabStripItem title="Concluídas" />
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
            <label text="{item.name}" textWrap="true" />
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
          {#if listToday[todayIndex] === item}
            <label
              class="selected-normal"
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
    {/if}
    </tabContentItem>

    <tabContentItem>
      <listView
        items="{listDones}"
        on:itemTap="{onDoneTap}"
      >
        <Template let:item>
          <label
            text="{item.name}"
            class="todo-item-completed"
            textWrap="true"
          />
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
    /*background: #3c495e;*/
    /*color: #fff;*/
    color: #3c495e;
  }

  .selected-normal {
    /*font-weight: bold;*/
  }

</style>
