<script lang="ts">
  import {createEventDispatcher} from "svelte"
  import { Template } from "svelte-native/components"
  import { List } from "~/utils/lists"
  import Task from "./Task.svelte"

  const dispatch = createEventDispatcher()

  export let row: string = "0"
  export let colSpan: string = "0"
  export let index = -1

  export let list: List
  export let onMenu: (e: CustomEvent) => void
  export let onOpen: (e: CustomEvent) => void
  export let onDone: (e: CustomEvent) => void = null
  export let completed = false
  export let isMoving = false
  export let donabled = false

  function onSetIndex(e: CustomEvent) {
    // console.log("TaskBasic.onSetIndex.e.detail:", e.detail)
    index = e.detail
    dispatch("setIndex", index)
  }
</script>

<listView
  row="{row}"
  colSpan="{colSpan}"
  items="{list}"
  class="list"
>
  <Template let:item>
    {#if list[index] === item}
      <Task
        list="{list}"
        item="{item}"
        completed="{completed}"
        isMoving="{isMoving}"
        selected="{true}"
        donabled="{donabled}"
        on:menu="{onMenu}"
        on:open="{onOpen}"
        on:done="{onDone}"
        on:setIndex="{onSetIndex}"
      />
    {:else}
      <Task
        list="{list}"
        item="{item}"
        completed="{completed}"
        isMoving="{isMoving}"
        selected="{false}"
        donabled="{donabled}"
        on:menu="{onMenu}"
        on:open="{onOpen}"
        on:done="{onDone}"
        on:setIndex="{onSetIndex}"
      />
    {/if}
  </Template>
</listView>

<style>
  .list {
    margin-top: 8;
  }
</style>
