<template>
  <div class="home">
    <div class="header">
      <template v-if="!currentUser">
        <h1 class="title" >ברוכים הבאים ל Conferix</h1>
        <ButtonCompt buttonText="הירשם" :buttonStyle="['big','signup']" :clickFunc="signUpFunc" />
      </template>
      
      <template v-else>
        <h1 class="title" >
          <span>Conferix</span>
          <br>
          <span>כי כנס טוב מתחיל בניהול חכם </span>
        </h1>

        <ButtonCompt buttonText="! החל לנהל" :buttonStyle="['big','signup']" :clickFunc="goToMyProjects" />
      </template>

    </div>
  </div>
</template>

<script>
import ButtonCompt from '@/components/common/ButtonCompt.vue';
export default {
  name: "HomeView",
  data(){
    return{
      currentUser:JSON.parse(localStorage.getItem('userData')) || null,
    }
  },
  components:{
    ButtonCompt,
  },
  methods:{
    signUpFunc(){
      this.$router.push({ name: 'sign-up'})
    },
    goToMyProjects(){
      this.$router.push({name:"projects-dashboard"})
    }
  },
  mounted(){
    console.log(this.currentUser)
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
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>