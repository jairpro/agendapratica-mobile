<page>
  <actionBar title="Minhas Tarefas"  />

  <tabs tabsPosition="bottom">
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
      <listView
        items="{today}"
        on:itemTap="{onTodayTap}"
      >
        <Template let:item>
          <label
            text="{item.name}"
            textWrap="true"
          />
        </Template>
      </listView>
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


  const appSettings = require("tns-core-modules/application-settings");
  console.log("appSettings:", appSettings)

  let salvarTodos = false
  let strTodos = appSettings.getString("todos")
  console.log("strTodos:", strTodos)
  let todos = typeof strTodos === "string" ? JSON.parse(strTodos) : []
  console.log("todos:", todos)

  let salvarToday = false
  let strToday = appSettings.getString("today")
  console.log("strToday:", strToday)
  let today = typeof strToday === "string" ? JSON.parse(strToday) : [] //today items go here
  console.log("today:", today)

  let salvarDones = false
  let strDones = appSettings.getString("dones")
  console.log("strDones:", strDones)
  let dones = typeof strDones === "string" ? JSON.parse(strDones) : [] //completed items go here
  console.log("dones:", dones)

  //todos = []
  //today = []
  //dones = []

  $: {
    if (todos && salvarTodos) saveList(todos, "todos")
    salvarTodos = true
  }

  $: {
    if (today && salvarToday) saveList(today, "today")
    salvarToday = true
  }

  $: {
    if (dones && salvarDones) saveList(dones, "dones")
    salvarDones = true
  }

  const removeFromList = (list, item) => list.filter(t => t !== item);

  const addToList = (list, item) => [item, ...list]

  const appendToList = (list, item) => [...list, item]

  const modifyListItem = (list, index, item) => {
    console.log("modificando o item " + index + ": " + item.name)
    list[index] = {name: item.name}
  }

  const saveList = (list, key) => {
    appSettings.setString(key, JSON.stringify(list))
    console.log(`Salvou ${key}`)
  }

  let textFieldValue = ""

  let todoIndex = -1
  let isEditing = false

  $: buttonText = isEditing ? 'Modificar' : 'Adicionar'

  $: {
    textFieldValue = (isEditing && todoIndex > -1) ? todos[todoIndex].name : ""
  }

  function onButtonTap() {
    if (textFieldValue === "") return; // Prevents users from entering an empty string.

    if (isEditing) {
      console.log("Tarefa \"" + todos[todoIndex].name + "\" modificada para: \"" + textFieldValue + "\".") // Logs the newly added task in the console for debugging.
      modifyListItem(todos, todoIndex,  {name: textFieldValue})
      isEditing = false
      hideKeyboard()
    }
    else {
      console.log("Nova tarefa adicionada: " + textFieldValue + ".") // Logs the newly added task in the console for debugging.
      todos = [{ name: textFieldValue }, ...todos] // Adds tasks in the ToDo array. Newly added tasks are immediately shown on the screen.
    }

    textFieldValue = ""; // Clears the text field so that users can start adding new tasks immediately.
  }

  async function onItemTap(args) {
    if (isEditing) {
      modifyListItem(todos, todoIndex,  {name: textFieldValue})
      hideKeyboard()
    }
    todoIndex = args.index
    if (isEditing) {
      showKeyboard()
      return
    }

    console.log(`Item ${todos[args.index].name} at index: ${args.index} was tapped`);

    let item = todos[args.index]

    let result = await action(item.name/*"O que fazer com essa tarefa?""*/, "Nada", [
      "Para hoje",
      "Concluir",
      "Editar",
      "Apagar"
    ]);

    console.log(result); // Logs the selected option for debugging.
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

  async function onTodayTap(args) {
    let item = today[args.index]
    let result = await action(item.name/*"O que fazer com essa tarefa?""*/, "Nada", [
        "Concluir",
        "Mover",
        "Pendente",
        "Apagar"
    ]);

    console.log(result); // Logs the selected option for debugging.
    switch (result) {
      case "Concluir":
        dones = addToList(dones, item) // Places the tapped active task at the top of the dones tasks.
        today = removeFromList(today, item) // Removes the tapped active task.
        break;
      case "Mover": {
        today = await menuMove(today, item, args.index);
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

    console.log(result); // Logs the selected option for debugging.
    switch (result) {
      case "Para hoje":
        today = addToList(today, item) // Places the tapped active task at the top of the today tasks.
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

  async function menuMove(list, item, index) {
    let result = await action(item.name, "Ok", [
        "Primeira",
        "Sobe",
        "Desce",
        "Última"
    ]);

    let more: boolean
    do {
      more = false
      switch (result) {
        case "Primeira":
          list = moveList(list, index, 0)
          break;
        case "Sobe":
          //more = true
          list = moveList(list, index, index-1)
          break;
        case "Desce":
          //more = true
          list = moveList(list, index, index+1)
          break;
        case "Última":
          list = moveList(list, index, today.length-1)
          break;
        case "Ok" || undefined: // Dismisses the dialog
          break;
      }
    } while (more)

    return list
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

</script>

<style>
	textField {
		font-size: 20;
	}

  .todo-item-completed {
	  color: #939393;
	  text-decoration: line-through;
  }
</style>
