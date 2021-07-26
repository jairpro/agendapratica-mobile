<script lang="ts">
  import { getContent } from "~/utils/data";
  import { ACTION_EXPORT_TO_CLIPBOARD } from "~/utils/consts";
  import Clippboard from "./Clippboard.svelte";

  export let className = "menu"
  export let position = "popup"

  let content = ""
  let exporting = false

  function launch() {
    content = getContent()
    exporting = true
    console.log('exportando...')
  }

  function onResult(event: CustomEvent) {
    console.log('on result')
    exporting = false
    const { result } = event.detail
    if (result) {
      alert('😄 Dados copiados para a àrea de transferência.')
    }
    else {
      alert('😥 Não foi possível copiar para a àrea de transferência.')
    }
  }
</script>

<actionItem
  on:tap="{launch}"
  android.systemIcon="ic_menu_send"
  android.position="{position}"
  class="{className}"
  text="{ACTION_EXPORT_TO_CLIPBOARD}"
  android.tintColor="#fff"
  android.borderColor="#fff"
  android.color="#fff"
  android.backgroundColor="#fff"
/>
{#if exporting}
  <Clippboard
    method="set"
    content="{content}"
    on:result="{onResult}"
  />
{/if}
