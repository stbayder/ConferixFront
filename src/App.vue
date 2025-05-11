<template>
  <NavBarCompt />
  <router-view />
</template>

<script>
import NavBarCompt from "./components/common/NavBarCompt.vue";
import 'animate.css';

export default {
  name: "App",
  components:{NavBarCompt}
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&family=Varela+Round&display=swap');

html,body{
  margin:0;

}
</style>
