<script setup lang="ts">
const showNotification = () => {
  if(Notification.permission === 'granted'){
    const options = {
      body: 'notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
    }
    new Notification('local Notification', options)
  }
}

const subsctibeToPush = async () => {
  const premission = await Notification.requestPermission()

  if (premission === 'granted') {
    showNotification()
  }
  else {
    console.log('err')
  }
}
</script>
<template>
  <div :class="$style.index">
  <span>index</span>
  <div :class="$style.btn">
    <NuxtLink to="/offline">
    <button>
      offline
    </button>
    </NuxtLink>
    <NuxtLink>
    <button @click="subsctibeToPush">
      notification
    </button>
    </NuxtLink>
  </div>
  </div>
</template>
<style module lang="scss">
.index {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 50px;
}

.btn {
  display: inline-flex;
  gap: 20px;

  :nth-child(n) {
    width: 200px;
    text-decoration: none;
    color: black;
    padding: 10px 0;
  }
}
</style>

