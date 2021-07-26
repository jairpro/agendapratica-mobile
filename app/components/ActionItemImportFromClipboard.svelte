<script lang="ts">
  import { confirm, alert } from '@nativescript/core/ui/dialogs'
  import { Utils } from "@nativescript/core";
  import { setData, isValidContent } from "~/utils/data";
  import { ACTION_IMPORT_FROM_CLIPBOARD } from "~/utils/consts";

  export let className = "menu"
  export let position = "popup"

  function clipboardGetText(): string | boolean {

    const readFromClipboard = (clipboard): string => {
      const item = clipboard.getPrimaryClip().getItemAt(0)
      let content = item.getText().toString()
      return content || ""
    }

    try {
      const clipboard = Utils.android.getApplicationContext().getSystemService(android.content.Context.CLIPBOARD_SERVICE);

      if (!clipboard.getPrimaryClipDescription().hasMimeType(android.content.ClipDescription.MIMETYPE_TEXT_PLAIN) &&
          !clipboard.getPrimaryClipDescription().hasMimeType(android.content.ClipDescription.MIMETYPE_TEXT_HTML)
      ) {
        console.log("No compatible clipboard content found")
        return false
      } else {
        return readFromClipboard(clipboard)
      }
    }
    catch (error) {
      console.log('clipboardSetText error:', error.message)
      return false
    }
  }

  function launch() {
    const result = clipboardGetText()
    if (typeof result === 'string') {
      const content = String(result)
      // console.log('content:', content)

      if (!isValidContent(content)) {
        //console.log('😥 Formato inválido.')
        alert({
          title: 'Importação de dados',
          message: '😥 Formato inválido.',
          okButtonText: 'OK',
        })
      }

      confirm({
        title: 'Importação de dados',
        message: 'Tem certeza que deseja colar os dados da área de transferência?\n\nSeus dados atuais serão perdidos.',
        okButtonText: 'SIM',
        cancelButtonText: 'NÃO',
      })
        .then(res => {
          // console.log('res:',res)
          if (res) {
            // console.log("aplicando setData()...")
            setData(content)
            // console.log("setData() aplicado")
          }
        })
    }
    else {
      // console.log('😥 Não foi possível colar da àrea de transferência.')
      alert({
        title: 'Importação de dados',
        message: '😥 Não foi possível colar da àrea de transferência.',
        okButtonText: 'OK',
      })
    }
  }
</script>

<actionItem
  on:tap="{launch}"
  android.systemIcon="ic_input_get"
  android.position="{position}"
  class="{className}"
  text="{ACTION_IMPORT_FROM_CLIPBOARD}"
  android.tintColor="#fff"
  android.borderColor="#fff"
  android.color="#fff"
  android.backgroundColor="#fff"
/>
