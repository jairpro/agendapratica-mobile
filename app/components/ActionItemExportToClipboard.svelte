<script lang="ts">
  import { alert } from '@nativescript/core/ui/dialogs'
  import { Utils } from "@nativescript/core";
  import { getContent } from "~/utils/data";
  import { ACTION_EXPORT_TO_CLIPBOARD } from "~/utils/consts";

  export let className = "menu"
  export let position = "popup"

  function clipboardSetText(content: string) {
    try {
      const clipboard = Utils.android
        .getApplicationContext().getSystemService(android.content.Context.CLIPBOARD_SERVICE);
      const clip = android.content.ClipData.newPlainText("App clipboard data", content);
      clipboard.setPrimaryClip(clip);
      return true
    }
    catch (error) {
      console.log('clipboardSetText error:', error.message)
      return false
    }
  }

  function launch() {
    const content = getContent()
    const result = clipboardSetText(content)
    if (result) {
      alert({
        title: 'Exportação de dados',
        message: '😄 Dados copiados para a àrea de transferência.',
        okButtonText: 'OK',
      })
    }
    else {
      alert({
        title: 'Exportação de dados',
        message: '😥 Não foi possível copiar para a àrea de transferência.',
        okButtonText: 'OK',
      })
    }
  }
</script>

<actionItem
  on:tap="{launch}"
  android.systemIcon="ic_menu_send"
  android.position="{position}"
  class="{className}"
  text="{ACTION_EXPORT_TO_CLIPBOARD}"
  android.tintColor="#fff"
  android.borderColor="#fff"
  android.color="#fff"
  android.backgroundColor="#fff"
/>
