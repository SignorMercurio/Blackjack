<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal elevated class="bg-primary text-white">
      <q-toolbar>
        <q-avatar>
          <img src="statics/blackjack.png" />
        </q-avatar>
        <q-toolbar-title>Blackjack</q-toolbar-title>
        <q-space></q-space>
        <span class="text-subtitle1">{{ '$ ' + money }}</span>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      money: 100
    }
  },
  created: function() {
    this.$root.$on('money_change', money => {
      this.money = parseInt(money)
    })
  }
}
</script>

<style lang="sass">
.bg
  background: url('/statics/background.jpg')
  background-size: 100% 100%
</style>
