<template>
    <button @click="clickFunc"
        :class="[buttonStyle,animation]"
        @mouseenter="mouseIn"
        @mouseleave="mouseOut"
    >
        {{ buttonText }}
    </button>
</template>

<script>


export default {
    name:"ButtonCompt",
    data(){
        return{
            animation:null,
        }
    },
    props:{
        clickFunc:{
            type:Function,
            required:true
        },
        buttonText:{
            type:String,
            required:true
        },
        buttonStyle:{
            type:Array,
            required:true,
        }
    },
    methods:{
        mouseIn(){
            this.animation = "animate__animated animate__shakeY"
        },
        mouseOut(){
            this.animation = null
        }
    }
}
</script>

<style scoped>

button{
    border: none;
    font-family: "Noto Sans Hebrew";
    border-radius:10px;
    color: #F2F0EF;
    cursor: pointer;
}

.big{
    width: 10vw;
    height: 8vh;
    font-size:2em;
}

.medium{
    width:8vw;
    height:6vh;
    font-size: 1.7em;
}

.error{
    background-color: red;
}

.warning{
    background-color: yellow;
}

.signup{
    background-color: #2977ff;
}
.default{
    color:#2977ff;
    background-color: #F2F0EF;
}


</style>