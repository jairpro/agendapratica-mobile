<script lang="ts">
  //import { createEventDispatcher } from 'svelte';
  import { ACTION_ADICIONAR } from '~/utils/consts';
  import { addToList, appendToList, List } from '~/utils/lists';

  //let dispatch = createEventDispatcher()

  let textFieldValue = ""
  export let list: List
  export let level: number
  export let setList: (list: List) => void
  export let saveList: () => void
  export let mode: "top" | "bottom"

  function onButtonTap() {
    if (textFieldValue === "") return // Prevents users from entering an empty string.

    let item = { name: textFieldValue }
    //dispatch("add", item)

    setList(mode === "top"
      ? addToList({
          list,
          item,
          level,
        })
      : appendToList({
          list,
          item,
          level,
      })
    )
    saveList()

    textFieldValue = "" // Clears the text field so that users can start adding new tasks immediately.
  }
</script>

<gridLayout rows="auto" columns="*,auto">
  <!-- Configura o campo de texto e garante que pressionar Return no teclado
    produz o mesmo resultado que tocar no botão. -->
  <textField
    col="0" row="0"
    bind:text="{textFieldValue}"
    hint="Digite uma nova tarefa..."
    editable="{true}"
    on:returnPress="{onButtonTap}"
  />

  <button
    col="1" row="0"
    text="{ACTION_ADICIONAR}"
    on:tap="{onButtonTap}"
    class="button"
  />
</gridLayout>

<style>
  textField {
    font-family: 'KoHo-Regular';
		font-size: 20;
    margin: 8 8 0 8;
    /*placeholder-color: #ddd;*/
    /*placeholder-color: #a7a7af;*/
	}
  textField::placeholder {
    /*color: #ddd;*/
    color: #a7a7af;
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
</style>
