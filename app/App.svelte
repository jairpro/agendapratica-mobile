<script lang="typescript">
  import * as application from 'tns-core-modules/application';

  import Home from '~/pages/Home.svelte'

  import { loadOptions } from "./stores/options"
  import { backEvent } from './utils/backEvent'
import { setData } from './utils/data';

  loadOptions()
  backEvent()

  function receiveIntents() {
    const newString = (arg: any) => (new String(arg).valueOf())

    application.android.on(
      application.AndroidApplication.activityCreatedEvent,
      args => {
        const { activity, eventName } = args
        console.log("Event: " + eventName + ", Activity: " + activity);

        try {
          const Intent = android.content.Intent
          const actionSend = Intent.ACTION_SEND
          const argIntent = activity.getIntent()
          const argIntenAction = argIntent.getAction()
          const argIntentType = argIntent.getType()

          const intent = newString(argIntenAction)
          console.log(" ~~~~ Intent is ~~~~ :", intent)

          if (intent === newString("com.sistemanuvem.agendapratica.SEND")) {
            if (newString(argIntentType) === newString("text/plain")) {
              const text = cbParseText(argIntent)
              console.log("text:", text)

              setData(text)
            }
          }

          function cbParseText(argIntent: any) {
            const text = argIntent.getStringExtra(Intent.EXTRA_TEXT);
            if (new String(text).valueOf() !== "null") {
              return text
            }
          }
        }
        catch (error) {
          console.log(error.message)
        }
      }
    )
  }
  receiveIntents()
</script>

<Home />
