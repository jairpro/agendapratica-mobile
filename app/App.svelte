<script lang="typescript">
  // import * as application from 'tns-core-modules/application';
  // import { Utils } from "@nativescript/core";

  import Home from '~/pages/Home.svelte'

  import { loadOptions } from "./stores/options"
  import { backEvent } from './utils/backEvent'
  // import { setData } from './utils/data';
  // import { StorageGetBoolean, StorageSetBoolean } from './utils/storage';

  // const STORE_MIGRATED = 'migrated'

  /*async function sendRequestMigration(): Promise<boolean> {
    try {
      const context = Utils.android.getApplicationContext()

      const sendIntent = new android.content.Intent();

      sendIntent.setAction("com.sistemanuvem.agendapratica.REQUEST_MIGRATION");
      sendIntent.putExtra(android.content.Intent.EXTRA_TEXT, "request_migration");
      sendIntent.setType("text/plain");

      context.startActivity(sendIntent);
    }
    catch (error) {
      console.log("sendRequestMigration error:", error.messsage)
      return false
    }

    return true
  }*/

  /* function sendMigrated(): boolean {
    try {
      const context = Utils.android.getApplicationContext()

      const sendIntent = new android.content.Intent();

      sendIntent.setAction("com.sistemanuvem.agendapratica.MIGRATED");
      sendIntent.putExtra(android.content.Intent.EXTRA_TEXT, "migrated");
      sendIntent.setType("text/plain");

      context.startActivity(sendIntent);
    }
    catch (error) {
      console.log("sendMigrated error:", error.message)
      return false
    }

    return true
  }*/

  /*function receiveIntents() {
    const newString = (arg: any) => (new String(arg).valueOf())

    application.android.on(
      application.AndroidApplication.activityCreatedEvent,
      async args => {
        const migrated = StorageGetBoolean(STORE_MIGRATED, false)
        if (migrated) return

        const { activity, eventName } = args
        console.log("Event: " + eventName + ", Activity: " + activity);

        try {
          const Intent = android.content.Intent
          const argIntent = activity.getIntent()
          const argIntenAction = argIntent.getAction()
          const argIntentType = argIntent.getType()

          const intent = newString(argIntenAction)
          console.log(" ~~~~ Intent is ~~~~ :", intent)

          if (intent === newString("com.sistemanuvem.agendapratica.SEND_MIGRATION")) {
            console.log("dados de migração recebidos, já migrou antes?", migrated ? "sim" : "não")

            if (newString(argIntentType) === newString("text/plain")) {
              const text = cbParseText(argIntent)
              console.log("text:", text)

              setData(text)
              StorageSetBoolean(STORE_MIGRATED, true)
              console.log("migração efetuada!")
              //sendMigrated()
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

  async function verifyMigration() {
    console.log("verifica se já migrou...")
    const migrated = StorageGetBoolean(STORE_MIGRATED, false)

    if (!migrated) {
      console.log("ainda não, migrando...")
      const sended = await sendRequestMigration()
      return sended
    }
    console.log("migrou")
    return null
  }*/

  loadOptions()
  backEvent()
  //receiveIntents()
  //verifyMigration()
</script>

<Home />
