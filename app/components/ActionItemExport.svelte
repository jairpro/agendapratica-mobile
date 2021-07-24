<script lang="ts">
  import { Utils } from "@nativescript/core";

  import { ACTION_EXPORT_TO_SUCCAPP } from "~/utils/consts";
  import { getContent } from "~/utils/data";

  export let className = "menu"
  export let position = "popup"

  async function sendText(text: string): Promise<boolean> {
    try {
      const context = Utils.android.getApplicationContext()

      const sendIntent = new android.content.Intent();

      sendIntent.setAction("com.sistemanuvem.agendapratica.SEND");
      sendIntent.putExtra(android.content.Intent.EXTRA_TEXT, text);
      sendIntent.setType("text/plain");

      context.startActivity(sendIntent);
    }
    catch (error) {
      console.log("sendText error:", error)
      return false
    }

    return true
  }

  export async function exportData(): Promise<boolean> {
    const content = getContent()
    const sended = await sendText(content)

    if (!sended) {
      alert('😥 O envio de dados falhou.')
      return false
    }

    return true
  }

  function launchExport() {
    exportData()
  }

</script>

<actionItem
  on:tap="{launchExport}"
  android.systemIcon="ic_menu_view"
  android.position="{position}"
  class="{className}"
  text="{ACTION_EXPORT_TO_SUCCAPP}"
/>
