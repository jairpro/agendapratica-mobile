<script>
  import { openApp } from 'nativescript-open-app'
  // import { setMigrated } from '~/stores/migrated'
  import { exit } from 'nativescript-exit'

  function handleNewVersion() {
    openApp('com.sistemanuvem.agendapratica')
  }

  /*function handleAindaNao(e) {
    setMigrated(false)
  }*/

  function handleExit(e) {
    exit()
  }
</script>

<scrollView orientation="vertical">
  <flexboxLayout class="container"
  >
    <label class="icon" text=" 🦆 ➡ 🦅" />

    <label class="title"
      text="Migração da Agenda Prática"
      textWrap="true"
    />

    <label class="message"
      text="Para resolver um problema de projeto foi necessário instalar o AGENDA PRÁTICA como um novo aplicativo."
      textWrap="true"
    />

    <label class="message"
      text="Fique tranquilo, seus dados foram migrados com sucesso. Confira:"
      textWrap="true"
    />

    <button class="new-version"
      text="Abrir novo App"
      on:tap="{handleNewVersion}"
    />

    <label class="message"
      text="Após conferir seus dados DESINSTALE este aplicativo antigo aqui, que passou a ser chamado: MIGRAÇÃO DA AGENDA PRÁTICA."
      textWrap="true"
    />

    <button class="exit"
      text="Sair"
      on:tap="{handleExit}"
    />

    <!--button class="ainda-nao"
      text="Ainda não"
      on:tap="{handleAindaNao}"
    /-->
  </flexboxLayout>
</scrollView>

<style>
  .icon {
    font-size: 64px;
  }

  .container {
    flex-direction: column;
    align-items: center;
    display: flex;
    flex: 1;

    justify-content: space-around;
    background: #e4d8c0;
    padding: 20px;
  }

  .title {
    color: #700;
    font-weight: 700;
    font-size: 24px;
    text-align: center;
  }

  .message {
    color: #212121;
    font-weight: 400;
    font-size: 16px;
    text-align: center;
  }

  .new-version {
    color: #fff;
    background: #689f38;
    font-size: 18px;
    padding: 20px 40px;
    width: 100%;
    border-radius: 12px;
  }
  /*.ainda-nao {
    color: #fff;
    background: #700;
    font-size: 18px;
    padding: 20px 40px;
    width: 100%;
    border-radius: 12px;
  }*/
  .exit {
    color: #fff;
    background: #3c495e;
    font-size: 18px;
    padding: 20px 40px;
    width: 100%;
    border-radius: 12px;
  }
</style>
