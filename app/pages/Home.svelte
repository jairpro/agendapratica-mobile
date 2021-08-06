<script lang="ts">
import { alert } from '@nativescript/core/ui/dialogs';
  import { LocalNotifications } from '@nativescript/local-notifications';

  import ActionBar from '~/components/ActionBar.svelte'
  import TabsApp from '~/components/TabsApp.svelte'

  LocalNotifications.addOnMessageReceivedCallback((notification) => {
    alert({
      title: '🦆 Lembrete!',
      message: notification.title,
      okButtonText: 'VALEU!'
    })
	  console.log('ID: ' + notification.id)
	  console.log('Title: ' + notification.title)
	  console.log('Body: ' + notification.body)
  }).then(() => {
	  console.log('Listener added');
  })
</script>

<page class="page">
  <ActionBar />
  <TabsApp />
</page>
