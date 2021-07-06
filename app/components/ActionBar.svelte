<script lang="ts">
  import Options from '~/pages/Options.svelte'

  import {
    defaultTitle,
    setTitle,
    tabIndexStore,
    titleStore,
  } from "~/stores/global"

  import { ACTION_CONFIG } from "~/utils/consts"
  import { todoLevelStore, todosStore } from "~/stores/todo"
  import { todayLevelStore, todayStore } from "~/stores/today"
  import { doneLevelStore, donesStore } from "~/stores/dones"
  import { goBack } from "~/utils/goBack"
  import { showModal } from "svelte-native"
  import { loadOptions } from "~/stores/options"
  import { List } from '~/utils/lists'

  let tabIndex: number
  tabIndexStore.subscribe(value => tabIndex = value)

  let todos: List
  todosStore.subscribe(value => todos = value)

  let todoLevel: number
  todoLevelStore.subscribe(value => todoLevel = value)

  let today: List
  todayStore.subscribe(value => today = value)

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

  async function launchOptions() {
    await showModal({
      page: Options,
      fullscreen: true,
      animated: true,
    })

    loadOptions()
  }
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

  <actionItem
    on:tap="{launchOptions}"
    android.systemIcon="ic_menu_view"
    android.position="popup"
    class="menu"
    text="{ACTION_CONFIG}"
  />
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
