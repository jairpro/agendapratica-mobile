<script lang="ts">
  import { setIsMoving } from "~/stores/global";
  import { ACTION_ORDER } from "~/utils/consts";

  export let className = "menu"
  export let position = "actionBarIfRoom"

  function launchOrder() {
    setIsMoving(true)
  }
</script>

<actionItem
  on:tap="{launchOrder}"
  android.systemIcon="ic_menu_sort_by_size"
  android.position="{position}"
  class="{className}"
  text="{ACTION_ORDER}"
  android.tintColor="#fff"
  android.borderColor="#fff"
  android.color="#fff"
  android.backgroundColor="#fff"
/>
