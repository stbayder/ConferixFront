<template>
  <div class="home">
    <div class="header">
      <h1 class="title">ברוכים הבאים ל Conferix</h1>
      <ButtonCompt buttonText="הירשם" :buttonStyle="['big','signup']" :clickFunc="signUpFunc"/>
    </div>
  </div>
</template>

<script>
import ButtonCompt from '@/components/common/ButtonCompt.vue';
export default {
  name: "HomeView",
  components:{
    ButtonCompt,
  },
  methods:{
    signUpFunc(){
      this.$router.push({ name: 'sign-up'})
    }
  }
};
</script>

<style scoped>
.header{
  background-image: url("../assets/images/bg.jpg");
  background-position: center;
  background-size:cover;
  background-repeat: no-repeat;
  width: 100%;
  height:90vh;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1.title{
  padding-top: 0;
  margin-top: 0;
  direction: rtl;
  font-size: 5em;
  font-family: "Varela Round", sans-serif;
  color: #F2F0EF;
  margin-bottom: 20vh;
}
</style>