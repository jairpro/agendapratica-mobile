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
  import { gridLayout, dockLayout, flexboxLayout, stackLayout } from '@nativescript/core';

  const appSettings = require("tns-core-modules/application-settings");
  //console.log("appSettings:", appSettings)

  let salvarTodos = false
  let strTodos = appSettings.getString("todos")
  //console.log("strTodos:", strTodos)
  let todos = typeof strTodos === "string" ? JSON.parse(strTodos) : []
  //console.log("todos:", todos)

  let salvarToday = false
  let strToday = appSettings.getString("today")
  //console.log("strToday:", strToday)
  let today = typeof strToday === "string" ? JSON.parse(strToday) : [] //today items go here
  //console.log("today:", today)

  let salvarDones = false
  let strDones = appSettings.getString("dones")
  //console.log("strDones:", strDones)
  let dones = typeof strDones === "string" ? JSON.parse(strDones) : [] //completed items go here
  //console.log("dones:", dones)

  let initialTabIndex = Number(today.length>0)
  let todayCurrentIndex = -1

  //todos = []
  //today = []
  //dones = []

  $: {
    if (todos && salvarTodos) saveList(todos, "todos")
    salvarTodos = true
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


  const removeFromList = (list, item) => list.filter(t => t !== item);

  const addToList = (list, item) => [item, ...list]

  const appendToList = (list, item) => [...list, item]

  const modifyListItem = (list, index, item) => {
    //console.log("modificando o item " + index + ": " + item.name)
    list[index] = {name: item.name}
    return JSON.parse(JSON.stringify(list))
  }

  const saveList = (list, key) => {
    appSettings.setString(key, JSON.stringify(list))
    console.log(`Salvou ${key}`)
  }

  let textFieldValue = ""

  let todoIndex = -1
  let isEditing = false

  $: buttonText = isEditing ? 'Modificar' : 'Adicionar'

  let todoName = ""

  $: {
    textFieldValue = (isEditing && todoIndex > -1) ? todoName : ""
  }

  let isMoving = false

  //$: console.log('todayCurrentIndex: ', todayCurrentIndex)

  function onButtonTap() {
    if (textFieldValue === "") return; // Prevents users from entering an empty string.

    if (isEditing) {
      //console.log("Tarefa \"" + todos[todoIndex].name + "\" modificada para: \"" + textFieldValue + "\".") // Logs the newly added task in the console for debugging.
      todos = modifyListItem(todos, todoIndex,  {name: textFieldValue})
      isEditing = false
      hideKeyboard()
    }
    else {
      //console.log("Nova tarefa adicionada: " + textFieldValue + ".") // Logs the newly added task in the console for debugging.
      todos = [{ name: textFieldValue }, ...todos] // Adds tasks in the ToDo array. Newly added tasks are immediately shown on the screen.
    }

    textFieldValue = ""; // Clears the text field so that users can start adding new tasks immediately.
  }

  async function onItemTap(args) {
    if (isEditing) {
      todos = modifyListItem(todos, todoIndex,  {name: textFieldValue})
      hideKeyboard()
    }
    todoName = todos[args.index].name
    todoIndex = args.index
    if (isEditing) {
      showKeyboard()

      return
    }

    //console.log(`Item ${todos[args.index].name} at index: ${args.index} was tapped`);

    let item = todos[args.index]

    let result = await action(item.name/*"O que fazer com essa tarefa?""*/, "Nada", [
      "Para hoje",
      "Concluir",
      "Editar",
      "Apagar"
    ]);

    //console.log(result); // Logs the selected option for debugging.
    switch (result) {
      case "Para hoje":
        today = appendToList(today, item) // Places the tapped active task at the top of the today tasks.
        todos = removeFromList(todos, item) // Removes the tapped active task.
        break;
      case "Concluir":
        dones = addToList(dones, item) // Places the tapped active task at the top of the completed tasks.
        todos = removeFromList(todos, item) // Removes the tapped active task.
        break;
      case "Editar": {
        textFieldValue = item.name
        isEditing = true
        showKeyboard()
        break;
      }
      case "Apagar":
        todos = removeFromList(todos, item) // Removes the tapped active task.
        break;
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
  }

  function renderToday() {
    salvarToday = false
    today = JSON.parse(JSON.stringify(today))
    salvarToday = true
  }

  async function onTodayTap(args) {
    todayCurrentIndex = args.index
    //renderToday()

    if (isMoving) return

    let item = today[args.index]
    let result = await action(item.name/*"O que fazer com essa tarefa?""*/, "Nada", [
      "Concluir",
      "Mover",
      "Pendente",
      "Apagar"
    ]);

    //console.log(result); // Logs the selected option for debugging.
    switch (result) {
      case "Concluir":
        dones = addToList(dones, item) // Places the tapped active task at the top of the dones tasks.
        today = removeFromList(today, item) // Removes the tapped active task.
        break;
      case "Mover": {
        isMoving = true
        break;
      }
      case "Pendente":
        todos = addToList(todos, item) // Places the tapped active task at the top of the pendent tasks.
        today = removeFromList(today, item) // Removes the tapped active task.
        break;
      case "Apagar":
        today = removeFromList(today, item) // Removes the tapped active task.
        break;
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
  }

  async function onDoneTap(args) {
    let item = dones[args.index]
    let result = await action(item.name/*"O que fazer com essa tarefa?""*/, "Nada", [
      "Para hoje",
      "Pendente",
      "Apagar"
    ]);

    //console.log(result); // Logs the selected option for debugging.
    switch (result) {
      case "Para hoje":
        today = appendToList(today, item) // Places the tapped active task at the top of the today tasks.
        dones = removeFromList(dones, item) // Removes the tapped active task.
        break;
      case "Pendente":
        todos = addToList(todos, item) // Places the tapped active task at the top of the pendent tasks.
        dones = removeFromList(dones, item) // Removes the tapped active task.
        break;
      case "Apagar":
        dones = removeFromList(dones, item) // Removes the tapped active task.
        break;
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
  }

  function moveList(list, indexSource: number, indexDestiny: number) {

    function array_move(arr1, old_index, new_index) {
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

    if (
      indexDestiny<0 || indexDestiny>list.length-1
      || indexSource<0 || indexSource>list.length-1
    ) return list

    /*let item = list[indexSource]
    list.splice(indexDestiny, 1, item);
    list = removeFromList(list, list[indexSource])*/

    return array_move(list, indexSource, indexDestiny)
  }

  function moveTop() {
    let list = today
    if (todayCurrentIndex<=0 || todayCurrentIndex > list.length-1) return
    let index = todayCurrentIndex
    todayCurrentIndex = 0
    today = moveList(list, index, todayCurrentIndex)
  }

  function moveUp() {
    let list = today
    if (todayCurrentIndex<=0 || todayCurrentIndex > list.length-1) return
    let index = todayCurrentIndex
    todayCurrentIndex = todayCurrentIndex-1
    today = moveList(list, index, todayCurrentIndex)
  }

  function moveDown() {
    let list = today
    if (todayCurrentIndex<0 || todayCurrentIndex>=list.length-1) return
    let index = todayCurrentIndex
    todayCurrentIndex = todayCurrentIndex+1
    today = moveList(list, index, todayCurrentIndex)
  }

  function moveBottom() {
    let list = today
    if (todayCurrentIndex<0 || todayCurrentIndex>=list.length-1) return
    let index = todayCurrentIndex
    todayCurrentIndex = list.length-1
    today = moveList(list, index, todayCurrentIndex)
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
        if (isEditing) {
          data.cancel = true; // prevents default back button behavior
          isEditing = false;
        }
      }
    )
  }

  function handleTabsChange(event) {
    //console.log(event)
  }

</script>

<page>
  <actionBar title="Minhas Tarefas"  />

  <tabs tabsPosition="bottom"
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
          items="{todos}"
          on:itemTap="{onItemTap}"
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
                <button class="button-move" text="🔼" on:tap={moveTop} />
              </stackLayout>

              <stackLayout>
                <button class="button-move" text="⬆" on:tap={moveUp} />
                <button class="button-move" text="⬇" on:tap={moveDown} />
              </stackLayout>

              <stackLayout>
                <button class="button-move" text="🔽" on:tap={moveBottom} />
              </stackLayout>
            </stackLayout>
          </flexboxLayout>

          <listView
            items="{today}"
            on:itemTap="{onTodayTap}"
          >
            <Template let:item>
              {#if today[todayCurrentIndex] === item}
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
          items="{today}"
          on:itemTap="{onTodayTap}"
        >
        <Template let:item>
          {#if today[todayCurrentIndex] === item}
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
        items="{dones}"
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

