<script lang="ts">
  import { List } from "../utils/lists";
  import PanelMove from "./PanelMove.svelte";
  import TasksBasic from "./TasksBasic.svelte";

  export let row: string = "0"
  export let colSpan: string = "0"
  export let list: List
  export let onMenu: (e: CustomEvent) => void
  export let onOpen: (e: CustomEvent) => void
  export let onClosePanelMove: (e: CustomEvent) => void = null
  export let onMoveTop: () => void = null;
  export let onMoveUp: () => void = null;
  export let onMoveDown: () => void = null
  export let onMoveBottom: () => void = null
  export let completed = false
  export let isMoving = false
  export let index = -1

  //let index = -1

  function onSetIndex(e: CustomEvent) {
    index = e.detail
  }

  function on_close_panel_move(e: CustomEvent) {
    //console.log("fechando...")
    isMoving = false
    index = -1
    if (onClosePanelMove) onClosePanelMove(e)
  }

  function on_move_top() {
    if (index > 0) index = 0
    if (onMoveTop) onMoveTop()
  }

  function on_move_up() {
    if (index > 0) index--
    if (onMoveUp) onMoveUp()
  }

  function on_move_down() {
    if (index < list.length-1) index++
    if (onMoveDown) onMoveDown()
  }

  function on_move_bottom() {
    if (index < list.length-1) index = list.length-1
    if (onMoveBottom) onMoveBottom()
  }
</script>

<dockLayout
  row="{row}"
  colSpan="{colSpan}"
  stretchLastChild="true"
>
  {#if isMoving }
    <stackLayout
      dock="right"
      width="70"
      height="100%"
    >
      <PanelMove
        on:close="{on_close_panel_move}"
        on:moveTop="{on_move_top}"
        on:moveUp="{on_move_up}"
        on:moveDown="{on_move_down}"
        on:moveBottom="{on_move_bottom}"
      />
    </stackLayout>
  {/if}

  <TasksBasic
    list="{list}"
    onMenu="{onMenu}"
    onOpen="{onOpen}"
    completed="{completed}"
    isMoving="{isMoving}"
    index="{index}"
    on:setIndex="{onSetIndex}"
  />
</dockLayout>
