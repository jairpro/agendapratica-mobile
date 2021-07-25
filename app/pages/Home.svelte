<script lang="ts">
  import ActionBar from '~/components/ActionBar.svelte'
  import TabsApp from '~/components/TabsApp.svelte'
  import Migrated from './Migrated.svelte';
  import { migratedStore } from '~/stores/migrated'

  let migrated: boolean
  // migrated = true
  migratedStore.subscribe(value => migrated = value)
</script>

<page class="page" actionBarHidden="{migrated}">
  {#if !migrated}
    <ActionBar />
    <TabsApp />
  {:else}
    <Migrated />
  {/if}
</page>

<style>
  .page {
    background: #e4d8c0;
  }
</style>
