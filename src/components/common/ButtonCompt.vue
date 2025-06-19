<template>
    <button @click="handleClick"
        :class="[...buttonStyle, animation]"
        @mouseenter="mouseIn"
        @mouseleave="mouseOut"
    >
        <slot>{{ buttonText }}</slot>
    </button>
</template>

<script>
export default {
    name: "ButtonCompt",
    data() {
        return {
            animation: null,
        }
    },
    props: {
        clickFunc: {
            type: Function,
            required: true
        },
        buttonText: {
            type: String,
            required: true
        },
        buttonStyle: {
            type: Array,
            required: true,
        }
    },
    methods: {
        mouseIn() {
            if (this.buttonText === "הירשם" || this.buttonText === "שמור כנס") {
                this.animation = "animate__animated animate__shakeY";
            }
        },
        mouseOut() {
            this.animation = null;
        },
        handleClick() {
            if (typeof this.clickFunc === 'function') {
                this.clickFunc();
            }
        }
    }
}
</script>

<style scoped>
button {
    border: none;
    font-family: "Noto Sans Hebrew";
    border-radius: 10px;
    color: #F2F0EF;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}

.big {
    width: 10vw;
    height: 8vh;
    font-size: 2em;
}

.medium {
    width: 8vw;
    height: 6vh;
    font-size: 1.7em;
}

.entireWidth {
    width: 100%;
    height: 6vh;
    font-size: 1.2em;
}

.halfWidth {
    width: 48%;
    height: 6vh;
    font-size: 1.2em;
}

.error {
    background-color: red;
}

.warning {
    background-color: yellow;
}

.signup {
    background-color:#68808A ;
     color:  #F2F0EF;
}

.secondary {
    background-color: #F2F0EF;
    color: #68808A;
    border: 1px solid #B2C9CA;
}

.default {
    color: #F2F0EF;
    background-color:  #68808A;
}
</style>