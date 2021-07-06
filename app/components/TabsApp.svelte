<script lang="ts">
  import TabTodo from '~/components/TabTodo.svelte'
  import TabToday from '~/components/TabToday.svelte'
  import TabDones from '~/components/TabDones.svelte'

  import { TabsSelectedIndexChangeArgs } from '~/utils/types'
  import { setTabIndex } from '~/stores/global'
  import { List } from '~/utils/lists'
  import { todayStore } from '~/stores/today'

  let today: List
  todayStore.subscribe(value => today = value)
  let initialTabIndex = Number(today.length>0)

  function handleTabsChange(args: TabsSelectedIndexChangeArgs) {
    var page = args.object
    var tabs = page.getViewById("guias")
    setTabIndex(tabs.selectedIndex)
  }
</script>

<tabs id="guias" tabsPosition="bottom"
  selectedIndex={initialTabIndex}
  on:selectedIndexChange="{handleTabsChange}"
  >
  <tabStrip>
    <tabStripItem class="tab-item" title="🕖 Pendentes" />
    <tabStripItem class="tab-item" title="☀ Hoje" />
    <tabStripItem class="tab-item" title="👍 Prontas" />
  </tabStrip>

  <TabTodo />
  <TabToday />
  <TabDones />
</tabs>

<style>
  .tab-item {
    font-family: 'KoHo', "KoHo-SemiBold", sans-serif;
    font-weight: 600;
    font-size: 12.5;
    color: #262626
  }
</style>
