<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let dock="right"

  const onClose = () => {
    dispatch("close")
  }

  const onMoveTop = () => dispatch("moveTop")
  const onMoveUp = () => dispatch("moveUp")
  const onMoveDown = () => dispatch("moveDown")
  const onMoveBottom = () => dispatch("moveBottom")
</script>

<flexboxLayout
  dock="{dock}"
  width="auto"
  height="100%"
  flexDirection="column"
  alignItems="center"
  justifyContent="space-between"
  backgroundColor="#3c495e"
  class="move-panel"
>
  <stackLayout>
    <button class="button-move" text="X" on:tap={onClose}/>
  </stackLayout>

  <stackLayout>
    <stackLayout>
      <button class="button-move" text="↑" on:tap={onMoveTop} />
    </stackLayout>

    <stackLayout>
      <button class="button-move" text="▲" on:tap={onMoveUp} />
      <button class="button-move" text="▼" on:tap={onMoveDown} />
    </stackLayout>

    <stackLayout>
      <button class="button-move" text="↓" on:tap={onMoveBottom} />
    </stackLayout>
  </stackLayout>
</flexboxLayout>

<style>
  .move-panel {
    padding: 4;
  }
  .button-move {
    border-radius: 50%;
	  font-size: 28;
    padding: 0;
    color: #fff;
    border: 1 solid #fff;
    background: transparent;
  }
</style>
