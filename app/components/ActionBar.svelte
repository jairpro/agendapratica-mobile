<script lang="ts">
  import {
    defaultTitle,
    isMovingStore,
    setTitle,
    tabIndexStore,
    titleStore,
  } from "~/stores/global"

  import { todoLevelStore, todosStore } from "~/stores/todo"
  import { listTodayStore, todayLevelStore, todayStore } from "~/stores/today"
  import { doneLevelStore, donesStore } from "~/stores/dones"
  import { goBack } from "~/utils/goBack"
  import { List } from '~/utils/lists'

  import ActionItemConfig from './ActionItemConfig.svelte'
  import ActionItemOrder from './ActionItemOrder.svelte';
  import ActionItemExportToClipboard from "./ActionItemExportToClipboard.svelte"
  import ActionItemImportFromClipboard from "./ActionItemImportFromClipboard.svelte"

  let isMoving: boolean
  isMovingStore.subscribe(value => isMoving = value)

  let tabIndex: number
  tabIndexStore.subscribe(value => tabIndex = value)

  let todos: List
  todosStore.subscribe(value => todos = value)

  let todoLevel: number
  todoLevelStore.subscribe(value => todoLevel = value)

  let today: List
  todayStore.subscribe(value => today = value)

  let listToday: List
  listTodayStore.subscribe(value => listToday = value)

  let todayLevel: number
  todayLevelStore.subscribe(value => todayLevel = value)

  let dones: List
  donesStore.subscribe(value => dones = value)

  let doneLevel: number
  doneLevelStore.subscribe(value => doneLevel = value)

  let title: string
  titleStore.subscribe(value => title = value)

  $: titleTodos = todoLevel > -1 ? todos[todoLevel].name : defaultTitle
  $: titleToday = todayLevel > -1 ? today[todayLevel].name : defaultTitle
  $: titleDones = doneLevel > -1 ? dones[doneLevel].name : defaultTitle

  $: if (tabIndex === 0) setTitle(titleTodos)
  $: if (tabIndex === 1) setTitle(titleToday)
  $: if (tabIndex === 2) setTitle(titleDones)
</script>

<actionBar
  title="{title}"
  tintColor="#fff"
  flat="{false}"
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

  {#if !isMoving && tabIndex === 1 && listToday.length>1}
    <ActionItemOrder />
    <ActionItemConfig />
    <ActionItemExportToClipboard />
    <ActionItemImportFromClipboard />
  {:else}
    <ActionItemConfig />
    <ActionItemExportToClipboard />
    <ActionItemImportFromClipboard />
  {/if}
</actionBar>

<style>
  actionBar {
    font-family: 'Architects Daughter', "ArchitectsDaughter-Regular", cursive;
    font-size: 10;
    background: #3c495e;
    color: #fff;
  }

  .menu {
    color: #fff;
  }
</style>
