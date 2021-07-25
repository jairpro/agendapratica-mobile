<script lang="typescript">
  import * as application from 'tns-core-modules/application';
  import { Utils } from "@nativescript/core";
  // import { navigate } from 'svelte-native';

  import Home from '~/pages/Home.svelte'

  import { loadOptions } from "./stores/options"
  import { backEvent } from './utils/backEvent'
  import { getContent } from './utils/data';
  import { migratedStore, setMigrated } from './stores/migrated';

  let exporting = false
  let migrated: boolean
  migratedStore.subscribe(value => migrated = value)

  async function sendText(text: string): Promise<boolean> {
    try {
      const context = Utils.android.getApplicationContext()

      const sendIntent = new android.content.Intent();

      sendIntent.setAction("com.sistemanuvem.agendapratica.SEND_MIGRATION");
      sendIntent.putExtra(android.content.Intent.EXTRA_TEXT, text);
      sendIntent.setType("text/plain");

      context.startActivity(sendIntent);
    }
    catch (error) {
      console.log("sendText error:", error.message)
      return false
    }

    return true
  }

  async function exportData(): Promise<boolean> {
    console.log("exportando dados...")

    const content = getContent()
    const sended = await sendText(content)

    if (!sended) {
      //alert('😥 O envio de dados falhou.')
      console.log('😥 O envio de dados falhou.')
      return false
    }
    console.log('dados enviados com sucesso!')

    return true
  }

  function receiveIntents() {
    const newString = (arg: any) => (new String(arg).valueOf())

    application.android.on(
      application.AndroidApplication.activityCreatedEvent,
      async args => {
        const { eventName } = args
        console.log("eventName: " + eventName);

        if (migrated) {
          console.log('já migrou, escuta descartada!')
          return
        }
        console.log('ainda não migrou, vericando intent...')

        const { activity } = args
        console.log("Activity: " + activity);

        try {
          const argIntent = activity.getIntent()
          const argIntenAction = argIntent.getAction()

          const intent = newString(argIntenAction)
          console.log(" ~~~~ Intent is ~~~~ :", intent)

          switch (intent) {
            case newString("com.sistemanuvem.agendapratica.REQUEST_MIGRATION"):
              if (exporting) return
              exporting = true

              const exported = await exportData()

              if (exported) setMigrated()

              exporting = false
              //if (exported) {
              //}
              break

            case newString("com.sistemanuvem.agendapratica.MIGRATED"):
              setMigrated()
              break
          }
        }
        catch (error) {
          console.log("receiveIntents error:", error.message)
        }
      }
    )
  }

  loadOptions()
  backEvent()

  if (migrated) {
    console.log('Por favor, desinstale esse aplicativo obsoleto. Migração dados já efetuda para versão 2 ou supeior.')
  }
  else {
    console.log('Ainda não migrou...')
  }

  console.log('ouvindo intents...')
  receiveIntents()
</script>

<Home />
