<template>
  <div class="navbar">
    <img src="../../assets/images/logo.png" alt="">
    <router-link :to="{name:'home'}">בית</router-link> 
    <router-link :to="{name:'about'}">קצת עלינו</router-link>
    <template v-if="userData">
      <a href="#" @click="LogOut" >התנתק</a>
      <router-link :to="{name:'create-project'}">צור פרוייקט</router-link>
    </template>
    <template v-else>
      <router-link :to="{name:'sign-up'}">הירשם</router-link>
      <router-link :to="{name:'login'}">התחבר</router-link>
    </template>
  </div>
</template>
 
<script>
import eventBus from '@/utils/eventBus';

export default{
  name:"NavBarCompt",
  data(){
    return{
      userData: JSON.parse(localStorage.getItem('userData')) || null,
    }
  },
  methods:{
    LogOut(){
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      this.userData = null;
      
      // Emit logout event
      eventBus.emit('user:logout');
      
      this.$router.push({name:"home"})
    },
    updateUserData() {
      this.userData = JSON.parse(localStorage.getItem('userData')) || null;
    }
  },
  mounted(){
    // Set initial state
    this.userData = JSON.parse(localStorage.getItem('userData')) || null;
    
    // Listen for login/logout events
    eventBus.on('user:login', this.updateUserData);
    eventBus.on('user:logout', this.updateUserData);
  },
  beforeUnmount() {
    // Clean up event listeners
    eventBus.off('user:login', this.updateUserData);
    eventBus.off('user:logout', this.updateUserData);
  }
}
</script>

<style scoped>
img{
  position: absolute;
  right: 5vw;
  width:8vw;
}
.navbar{
    width: 100%;

    display: flex;
    justify-content: center;
    flex-direction: row-reverse;
    align-items: center;
    gap: 3vw;
    background-color: #F2F0EF;
    height:8vh;
}

.navbar > a{
    font-family: "Noto Sans Hebrew";
    font-size: 1.5vw;
    height: 5vh;
    font-weight: 200;
    color: black;
    text-decoration: none;
}
</style>