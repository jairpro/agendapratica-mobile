<script lang="ts">
  import { Utils } from "@nativescript/core";
  import { createEventDispatcher } from "svelte";

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

  let dispatch = createEventDispatcher()

  export let method: 'get' | 'set'
  export let content: string
  let result: boolean

  if (method === 'set') {
    result = clipboardSetText(content)
    dispatch("result", { result, content: '' })
  }

  else if (method === 'get') {
    let temp = clipboardGetText()
    if (temp === false) {
      content = ''
      result = false
    }
    else {
      content = String(temp)
      result = true
    }
    dispatch("result", { result, content })
  }
</script>
