<script lang="ts">
  import { closeModal } from 'svelte-native'
  import { DEFAULT_CONFIRM_DELETE, OPTION_CONFIRM_DELETE } from '~/config/options';
  import { StorageGetBoolean, StorageSetBoolean } from '~/utils/storage';

  let save = false
  let confirmDelete = StorageGetBoolean(OPTION_CONFIRM_DELETE, DEFAULT_CONFIRM_DELETE)

  $: {
    if (save) {
      StorageSetBoolean(OPTION_CONFIRM_DELETE, confirmDelete)
    }
    save = true
  }

  function goBack() {
    closeModal(undefined)
  }
</script>

<frame>
  <page>
    <actionBar
      title="Configurações"
    >
      <navigationButton
        android.systemIcon="ic_menu_back"
        on:tap="{goBack}"
      />
    </actionBar>

    <gridLayout columns="*,auto" rows="auto" class="item">
      <label
        textWrap="true"
        col="0"
        row="0"
        text="Confirmação para apagar tarefas"
        on:tap="{() => confirmDelete = !confirmDelete}"
      />
      <switch
        bind:checked="{confirmDelete}"
        col="1" row="0"
      />
    </gridLayout>
  </page>
</frame>

<style>
  actionBar {
    background: #3c495e;
    color: #fff;
  }
  label {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-size: 16;
    padding-top: 16;
    padding: 8;
    margin: auto;
  }
  .item {
    padding: 16;
  }
</style>
