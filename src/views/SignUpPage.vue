<template>
 <div class="container">
    <div class="sideImage"></div>
    <div class="formContainer">
        <h1 class="title">
        התחילו כבר היום <br>
        לתכנן את המחר
        </h1>

        <form>
            <div class="field">
                <input type="email" placeholder="כתובת אימייל" v-model="user.email">
            </div>

            <div class="field">
                <input type="password" placeholder="סיסמה" v-model="user.password">
            </div>

            <div class="field">
                <input type="password" placeholder="אמת סיסמה" v-model="user.confirmPassword">
            </div>
            
            <ButtonCompt 
                buttonText="שלח!" 
                :buttonStyle="['medium','secondary']" 
                @click.prevent="submitForm"
                :disabled="isLoading"
            />
            <div v-if="isLoading" class="loading">טוען...</div>
        </form>
        <div class="alreadySignedUp" @click="goToLoginPage">כבר רשומים? <span>התחברו!</span></div>
    </div>
    
    <PopUpMessage 
        v-if="showPopUpMessage"
        :title="popupTitle" 
        :message="popupMessage" 
        :type="popupType"
        @close="handlePopupClose"
    />  
 </div>
</template>

<script>
import ButtonCompt from '@/components/common/ButtonCompt.vue';
import PopUpMessage from '@/components/common/PopUpMessage.vue';
import axios from 'axios';
import eventBus from '@/utils/eventBus';

export default{
    name:"SignUpPage",
    data(){
        return {
            user:{
                password: "",
                email: "",
                confirmPassword: ""
            },
            showPopUpMessage: false,
            popupTitle: "",
            popupMessage: "",
            popupType: "error",
            isLoading: false,
            signupSuccess: false
        }
    },
    components:{
        ButtonCompt,
        PopUpMessage
    },
    methods:{
        isValidEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },
        isValidPassword(password) {
            const regex = /^[\x20-\x7E]+$/;
            return regex.test(password);
        },
        goToLoginPage(){
            this.$router.push({name:"login"})
        },
        handlePopupClose() {
            this.showPopUpMessage = false;
            
            // If signup was successful, redirect to login page
            if (this.signupSuccess) {
                this.$router.push({name:"home"})
            }
        },
        async submitForm(){
            if (!this.user.email || !this.isValidEmail(this.user.email)){
                this.popupTitle = "כתובת אימייל לא תקינה";
                this.popupMessage = "בבקשה הגישו שוב את הטופס עם כתובת אימייל תקינה.";
                this.popupType = "error"; 
                this.showPopUpMessage = true;
                return;
            }
            
            // Check password validity
            if(!this.user.password || this.user.password.length < 6){
                this.popupTitle = "סיסמה לא תקינה";
                this.popupMessage = "הסיסמה חייבת להיות לפחות 6 תווים.";
                this.popupType = "error";
                this.showPopUpMessage = true;
                return;
            }
            if(!this.isValidPassword(this.user.password)){
                this.popupTitle = "סיסמה לא תקינה";
                this.popupMessage = "סיסמה חייבת להכיל רק אותיות באנגלית, מספרים או תווים מיוחדים";
                this.popupType = "error";
                this.showPopUpMessage = true;
                return;
            }
            
            // Check password confirmation
            if(this.user.password !== this.user.confirmPassword){
                this.popupTitle = "אימות סיסמה נכשל";
                this.popupMessage = "הסיסמאות שהוזנו אינן תואמות.";
                this.popupType = "error";
                this.showPopUpMessage = true;
                return;
            }
            
            this.isLoading = true;
            
            try {
                // Prepare data for API (following our API's expected format)
                const userData = {
                    Email: this.user.email,
                    Password: this.user.password
                };
                
                // Make API call to backend
                const response = await axios.post(
                    `${process.env.VUE_APP_BACKEND_URL}/api/users/signup`, 
                    userData
                );
                
                // Store token in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                
                // Emit login event
                eventBus.emit('user:login', response.data.user);
                
                // Mark signup as successful
                this.signupSuccess = true;
                
                // Show success message
                this.popupTitle = "הרשמה הצליחה";
                this.popupMessage = "נרשמת בהצלחה למערכת! מעביר אותך לדף הבית...";
                this.popupType = "success";
                this.showPopUpMessage = true;
                
                // Reset form
                this.user = {
                    password: "",
                    email: "",
                    confirmPassword: ""
                };
                
                console.log("User registered successfully:", response.data);
                
                
            } catch (error) {
                // Handle API errors
                console.error("Registration error:", error);
                
                if (error.response) {
                    if (error.response.status === 400 && error.response.data.error === 'Email already in use') {
                        this.popupTitle = "כתובת האימייל כבר קיימת";
                        this.popupMessage = "כתובת האימייל שהזנת כבר רשומה במערכת. אנא התחבר או השתמש בכתובת אחרת";
                    } else {
                        this.popupTitle = "שגיאה בהרשמה";
                        this.popupMessage = error.response.data.error || "אירעה שגיאה בעת ההרשמה. אנא נסה שוב מאוחר יותר";
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    this.popupTitle = "אין תקשורת עם השרת";
                    this.popupMessage = "לא הצלחנו ליצור קשר עם השרת. אנא בדוק את חיבור האינטרנט שלך ונסה שוב";
                } else {
                    // Something happened in setting up the request
                    this.popupTitle = "שגיאה בהרשמה";
                    this.popupMessage = "אירעה שגיאה בעת ההרשמה. אנא נסה שוב מאוחר יותר";
                }
                
                this.popupType = "error";
                this.showPopUpMessage = true;
            } finally {
                this.isLoading = false;
            }
        }
    }
}
</script>

<style scoped>
.container{
    margin-left: 20vw;
    width: 60vw;
    height: 90vh;
    display: flex;
    flex-direction: row;
    position: relative;
}

.sideImage{
    width: 50%;
    height: 100%;
    background-image: url("../assets/images/sign-up-form.jpg");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

.formContainer{
    display: flex;
    flex-direction: column;
    align-items: center;
    direction: rtl;
    width: 50%;
    height: 100%;
    font-family: "Varela Round", sans-serif;
    background-color: #68808A;
    color: #F2F0EF;
    padding: 20px 0;
    box-sizing: border-box;
}

.title{
    font-size: 3em;
    margin-bottom: 10vh;
    text-align: center;
}

form{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 5vh;
    width: 100%;
}

.field{
    width: 20vw;
    height: 5vh;
}

.field > *{
    width: 100%;
    height: 100%;
    border-radius: 10px;
    border: none;
    text-indent: 10px;
    font-size: 1em;
}

.field > *:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(255,255,255,0.5);
}

.alreadySignedUp{
    margin-top: 10vh;
    font-size: 0.8em;
    cursor: pointer;
}

.alreadySignedUp > span {
    text-decoration: underline;
}

.loading {
    margin-top: 10px;
    color: white;
    font-size: 1em;
}
</style>