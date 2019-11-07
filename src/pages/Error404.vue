<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" style="width:30vw;max-width:150px;" />
    </p>
    <p class="text-faded">
      这里一片荒芜...
      <strong>(404)</strong>
    </p>
    <q-btn style="width:200px;" color="primary" to="/" label="返回" />
  </div>
</template>

<script>
export default {
  name: 'Error404'
}
</script>
