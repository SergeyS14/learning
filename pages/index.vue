<script setup lang="ts">
const message = ref('hello')

const handleClick = () => console.log('hello')
</script>

<template>
  <div>
    <h1 :class="$style.title">
      ler
    </h1>
    <button @click="handleClick">
      click
    </button>
  </div>
</template>

<style lang="scss" module>
$primary-color: #fff;

.button {
  color: black;
  background-color: $primary-color;
  padding: 10px;
  margin: 0;

  &:hover {
    background-color: #f00;
  }
}
</style>
