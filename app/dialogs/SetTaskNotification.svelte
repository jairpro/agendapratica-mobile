<page class="page">
  <scrollView scrollBarIndicatorVisible="{false}">
    <stackLayout>
      <dockLayout stretchLastChild="{true}">
        <button dock="right" class="close" width="32" height="32" text="X" on:tap="{handleClose}" />
        <label class="title" text="Agendar um lembrete para:" />
      </dockLayout>
      <label class="task"text="{taskName}" />
      <datePicker class="date" bind:date="{date}"/>
      <timePicker class="time" bind:time="{time}" />
      <button class="submit" text="Confirma" on:tap="{handleToSchedule}" />
    </stackLayout>
  </scrollView>
</page>

<script lang="ts">
  import { alert } from '@nativescript/core';
  import { LocalNotifications,NotificationAction } from '@nativescript/local-notifications';
  import { closeModal } from "svelte-native";
  import { getDate, getHours, getMinutes, getMonth, getYear, isAfter } from 'date-fns'
  import { ACTION_CONCLUDE, ACTION_TODAY } from '~/utils/consts';

  let date = new Date()
  let time = new Date(getYear(date), getMonth(date), getDate(date), getHours(date), getMinutes(date) + 2)

  $: dateTime = new Date(getYear(date), getMonth(date), getDate(date), getHours(time), getMinutes(time))

  export let taskName: string

  function handleToSchedule() {
    if (!isAfter(dateTime, new Date())) {
      alert({
        title: '🙄 Já passou!',
        message: 'Infome uma data/hora futura',
        okButtonText: 'ENTENDI',
      })
      return
    }
    const title = taskName
    // const subtitle = 'Teste'
    // const ticker = 'Teste'

    //const at = dateTime
    //const at = new Date(new Date().getTime() + (5 * 1000)) // 5 seconds from now
    const at = new Date(dateTime)

    // const sound = undefined
    // interval = 1 (days)
    // ongoing = true
    // forceShowWhenInForeground = true
    // notificationLed = true

    const actions: Array<NotificationAction> = [
      {
        id: 'today',
        type: 'button',
        //type: 'input',
        //title: '☀ Fazer Hoje!', // type = button
        title: ACTION_TODAY, // type = button
        launch: true,
        // submitLabel: '', // type = input
        // placeholder: '', // type = input
      },
      {
        id: 'done',
        type: 'button',
        //type: 'input',
        //title: '👍 Pronta!', // type = button
        title: ACTION_CONCLUDE, // type = button
        launch: true,
        // submitLabel: '', // type = input
        // placeholder: '', // type = input
      },
    ]

    LocalNotifications.schedule([
      {
        // id: ,
        title,
        // subtitle,
        // ticker,
        at,
        // sound,
        // intervale,
        // ongoing,
        // forceShowWhenInForeground,
        //actions,
        // notificationLed,
      }
    ])
    .then(() => {
      alert({
        title: "Notificação agendada",
        message: title,
        okButtonText: "OK"
      });
      closeModal(true)
    })
    .catch(error => console.log("doSchedule error: " + error));
  }

  function handleClose() {
    closeModal(false)
  }
</script>

<style>
  .page {
    margin: 8, 24;
  }

  .title {
    font-size: 18;
    font-weight: 600;
    margin-bottom: 8;
    text-align: center;
    width: 100%;
  }

  .task {
    font-size: 16;
    margin-bottom: 8;
    text-align: center;
    width: 100%;
  }

  .date {
    margin: 0;
    border: 0;
    padding: 0;
    background: #7998b8;
    font-size: 12,
  }

  .time {
    margin: 0;
    border: 0;
    padding: 0;
    background: #a6bed6;
    font-size: 14,
  }

  .submit {
    border-radius: 8;
    margin-top: 8;
    color: #fff;
    background: #3c495e;
    font-size: 16;
    font-weight: 500;
  }
  .close {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 12;
    padding: 0;
    background: #fff;
    font-weight: 500;
    color: #000;
  }
</style>
