<page>
  <actionBar title="Minhas Tarefas" />

  <tabs tabsPosition="bottom">
    <tabStrip>
      <tabStripItem title="Pendentes" />
      <tabStripItem title="Concluídas" />
    </tabStrip>

    <tabContentItem>
      <gridLayout columns="*,120" rows="70,*">
        <!-- Configura o campo de texto e garante que pressionar Return no teclado
           produz o mesmo resultado que tocar no botão. -->
        <textField col="0" row="0" bind:text="{textFieldValue}" hint="Digite uma nova tarefa..." editable="true"
          on:returnPress="{onButtonTap}" />

        <button col="1" row="0" text="Adicionar" on:tap="{onButtonTap}" class="-primary" />

        <listView items="{todos}" on:itemTap="{onItemTap}" row="1" colSpan="2">
          <Template let:item>
            <label text="{item.name}" textWrap="true" />
          </Template>
        </listView>
      </gridLayout>
    </tabContentItem>

    <tabContentItem>
      <listView items="{dones}" on:itemTap="{onDoneTap}">
        <Template let:item>
          <label text="{item.name}" class="todo-item-completed" textWrap="true" />
        </Template>
      </listView>
    </tabContentItem>
  </tabs>
</page>

<script>
  import { Template } from 'svelte-native/components'

  const appSettings = require("tns-core-modules/application-settings");
  console.log("appSettings:", appSettings)

  let strTodos = appSettings.getString("todos")
  console.log("strTodos:", strTodos)
  let todos = typeof strTodos === "string" ? JSON.parse(strTodos) : []
  console.log("todos:", todos)

  let strDones =appSettings.getString("dones")
  console.log("strDones:", strDones)
  let dones = typeof strDones === "string" ? JSON.parse(strDones) : [] //completed items go here
  console.log("dones:", dones)

  /*

  $: {
    saveList(todos, "todos")
  }

  $: {
    saveList(dones, "todos")
  }
  */

  const removeFromList = (list, item) => list.filter(t => t !== item);

  const addToList = (list, item) => [item, ...list]

  const saveList = (list, key) => appSettings.setString(key, JSON.stringify(list))

  let textFieldValue = ""

  function onButtonTap() {
    if (textFieldValue === "") return; // Prevents users from entering an empty string.

    console.log("New task added: " + textFieldValue + "."); // Logs the newly added task in the console for debugging.

    todos = [{ name: textFieldValue }, ...todos] // Adds tasks in the ToDo array. Newly added tasks are immediately shown on the screen.
    textFieldValue = ""; // Clears the text field so that users can start adding new tasks immediately.

    saveList(todos, "todos")
  }

  async function onItemTap(args) {
    console.log(`Item ${todos[args.index].name} at index: ${args.index} was tapped`);

    let result = await action("O que fazer com essa tarefa?", "Nada", [
      "Mover para concluídas",
      "Apagar"
    ]);

    console.log(result); // Logs the selected option for debugging.
    let item = todos[args.index]
    switch (result) {
      case "Mover para concluídas":
        dones = addToList(dones, item) // Places the tapped active task at the top of the completed tasks.
        todos = removeFromList(todos, item) // Removes the tapped active task.

        saveList(dones, "dones")
        saveList(todos, "todos")
        break;
      case "Apagar":
        todos = removeFromList(todos, item) // Removes the tapped active task.
        saveList(todos, "todos")
        break;
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
  }

  async function onDoneTap(args) {
    let result = await action("O que fazer com essa tarefa?", "Nada", [
        "Mover para pendentes",
        "Apagar"
    ]);

    console.log(result); // Logs the selected option for debugging.
    let item = dones[args.index]
    switch (result) {
      case "Mover para pendentes":
        todos = addToList(todos, item) // Places the tapped active task at the top of the completed tasks.
        dones = removeFromList(dones, item) // Removes the tapped active task.

        saveList(dones, "dones")
        saveList(todos, "todos")
        break;
      case "Apagar":
        dones = removeFromList(dones, item) // Removes the tapped active task.
        saveList(dones, "dones")
        break;
      case "Nada" || undefined: // Dismisses the dialog
        break;
    }
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
