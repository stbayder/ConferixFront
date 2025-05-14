<template>
    <nav>
        <button class="homeBtn">
            <img src="@/assets/icons/home-50.png" alt="" class="icon">
            <p>הכנסים שלי</p>
        </button>
        <hr>
        <div v-for="project in projects" :key="project._id">
            <button>
                <img src="@/assets/icons/conference-50.png" alt="" class="icon">
                <p>{{project.name }} {{ formatDate(project.date) }}</p>
            </button>
        </div>
        <!-- קישור שמשדר אמיט להפוך שוב את הפרוייקט הנבחר לנול -->
        <!-- קישור לכל אחד מהכנסים -->
    </nav>
</template>

<script>
import formatDate from '@/utils/utilFuncs';
export default{
    name:"DashboardSidebar",
    props:{
        projects:Array
    },
    methods:{
        formatDate
    }
}
</script>

<style scoped>

*{
    font-family: "Noto Sans Hebrew";
}

nav{
    width:20vw;
    background-color:#2977ff ;
    display: flex;
    flex-direction: column;
    align-items: center;
}

hr{
    color: #F2F0EF;
    border-color:#F2F0EF;
    width: 50%; 
}

button{
    color: #F2F0EF;
    border: none;
    margin-top: 2vh;
    background-color: transparent;
    direction: rtl;
    width:10vw;

    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.icon{
    width:2vw;
    height: 2vw;
    margin-left: 1vh;
}

.homeBtn{
    font-size: 1.2em;
}

</style>