<script lang="ts">
  import { setIsMoving } from "~/stores/global";
  import { ACTION_ORDER } from "~/utils/consts";

  function launchOrder() {
    setIsMoving(true)
  }
</script>

<actionItem
  on:tap="{launchOrder}"
  android.systemIcon="ic_menu_view"
  android.position="popup"
  class="menu"
  text="{ACTION_ORDER}"
/>
