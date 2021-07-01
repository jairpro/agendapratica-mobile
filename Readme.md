# todoapp

Aplicativo mobile para tarefas.

## Tecnologias

- [Svelte Native](https://svelte-native.technology/) com suporte Typescript
- [Native Script](https://docs.nativescript.org/)
- [Svelte](https://svelte.dev/)

## Instalação

1) [Clonar o repositório](https://github.com/jairpro/todoapp-svelte-native-ts.git) ou use:
```bash
gh repo clone jairpro/todoapp-svelte-native-ts
```
2) Na pasta do projeto executar:

```bash
npm install
# ou
yarn
```

### 3) Instalar o Native Script:

Faça o [início rápido do Native Script](https://svelte-native.technology/docs#getting-started) ou por aqui:

```bash
$ npm install -g nativescript
```

Verifque com:
```bash
$ ns
```

### 4) Playground e Preview do Native Script:

Para executar e depurar seu projeto num dispositivo móvel durante o desenvolvimento instale os apps *Playground* e *Preview* do *Native Script*:

- Para **Android** instalar: [Native Script Playground](https://play.google.com/store/apps/details?id=org.nativescript.play) e [Native Script Preview](https://play.google.com/store/apps/details?id=org.nativescript.preview) na Play Store.

- Para **iOS** instalar: [Native Script Playground](https://apps.apple.com/us/app/nativescript-playground/id1263543946) e [Native Script Preview](https://apps.apple.com/us/app/nativescript-preview/id1264484702) na Apple Store.

## Executando no seu dispositivo:

Após instalar o *Native Scrip Preview* e para executar o projeto no seu dispositivo, use o comando:
```shell
ns preview
```

### Pacote de Instalação

Para gerar o pacote de instação use o comando `ns build` juntamente com as opções de cada plataforma.

Para mais informações use o comando:
```shell
ns build --help
```

#### Gerando APK
Para gerar o pacote de instação Android use o comando:
```shell
ns build android
```

Obs: O comando tal como está acima gera o APK em modo debug, é o caminho mais rápido e já funcional para executar seu app no dispositivo. Esse APK será gerando na pasta do projeto em:
`platforms\android\app\build\outputs\apk\debug`

### Executando como aplicação:

Use o comando `ns run` para executar seu projeto como uma aplicação *NativeScript* normal.

Exemplo de instalação e execução de app no seu dispositivo:

```shell
ns run android
```
ou

```shell
ns run ios
```
