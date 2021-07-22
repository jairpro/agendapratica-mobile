<script lang="ts">
  import { showModal } from "svelte-native";

  import Options from "~/pages/Options.svelte";
  import { loadOptions } from "~/stores/options";
  import { ACTION_CONFIG } from "~/utils/consts";

  async function launchOptions() {
    await showModal({
      page: Options,
      fullscreen: true,
      animated: true,
    })

    loadOptions()
  }
</script>

<actionItem
  on:tap="{launchOptions}"
  android.systemIcon="ic_menu_view"
  android.position="popup"
  class="menu"
  text="{ACTION_CONFIG}"
/>
