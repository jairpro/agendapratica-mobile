<script lang="typescript">
  import Home from '~/pages/Home.svelte'

  import { loadOptions } from "./stores/options"
  import { backEvent } from './utils/backEvent'

  loadOptions()
  backEvent()
</script>

<Home />
