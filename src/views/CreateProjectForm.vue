<template>
    <div class="containerOfAll">
        <div class="container">
            <img class="logo" src="../assets/images/logo.png" alt="">
            <div class="theForm">
                <div class="text">
                    <h2>{{ currentStep.title }}</h2>
                    <p>{{ currentStep.text }}</p>
                </div>

                <transition :name="transitionName">
                    <!-- Project Name Input -->
                    <div class="ProjectNameInput form-step" v-if="formLevel === 0" key="name">
                        <label for="projectName">בבקשה הכנס את שם הכנס</label>
                        <input 
                            type="text" 
                            id="projectName"
                            placeholder="למשל, כנס לאיגוד האיגואנות הבין לאומי" 
                            v-model="projectName">
                    </div>

                    <!-- Project Date Input -->
                    <div class="ProjectDateInput form-step" v-else-if="formLevel === 1" key="date">
                        <label for="projectDate">בחר את תאריך הכנס</label>
                        <input 
                            type="date" 
                            id="projectDate"
                            v-model="projectDate">
                    </div>

                    <!-- Project Type Input -->
                    <div class="ProjectTypeInput form-step" v-else-if="formLevel === 2" key="type">
                        <label>בחר את סוג הכנס (ניתן לבחור יותר מאחד)</label>
                        <div class="checkbox-container">
                            <div class="checkbox-item" v-for="(type, index) in projectTypeOptions" :key="index">
                                <input 
                                    type="checkbox" 
                                    :id="'type-' + index"
                                    :value="type"
                                    v-model="projectType">
                                <label :for="'type-' + index">{{ type }}</label>
                            </div>
                        </div>
                    </div>

                    <!-- Project Budget Input -->
                    <div class="ProjectBudgetInput form-step" v-else-if="formLevel === 3" key="budget">
                        <label for="projectBudget">תקציב לכנס (לא חובה)</label>
                        <input 
                            type="number" 
                            id="projectBudget"
                            placeholder="הכנס תקציב בשקלים" 
                            v-model="projectBudget">
                    </div>

                    <!-- Summary Step -->
                    <div class="ProjectSummary form-step" v-else-if="formLevel === 4" key="summary">
                        <h3>סיכום פרטי הכנס</h3>
                        <div class="summary-item">
                            <strong>שם הכנס:</strong> {{ projectName }}
                        </div>
                        <div class="summary-item">
                            <strong>תאריך:</strong> {{ formattedDate }}
                        </div>
                        <div class="summary-item">
                            <strong>סוג:</strong> {{ projectType.join(', ') }}
                        </div>
                        <div class="summary-item" v-if="projectBudget">
                            <strong>תקציב:</strong> {{ projectBudget }} ₪
                        </div>
                    </div>
                </transition>

                <!-- Navigation -->
                <div class="navigation-buttons">
                    <ButtonCompt 
                        v-if="formLevel > 0" 
                        :clickFunc="goBack"
                        buttonText="" 
                        :buttonStyle="['halfWidth', 'secondary']">
                        <div class="back-arrow">
                            <i class="arrow-icon">←</i>
                            <span>הקודם</span>
                        </div>
                    </ButtonCompt>
                    
                    <ButtonCompt 
                        :clickFunc="goNext"
                        :buttonText="formLevel < 4 ? 'הבא' : 'שמור כנס'" 
                        :buttonStyle="[formLevel > 0 ? 'halfWidth' : 'entireWidth', 'signup']" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ButtonCompt from '@/components/common/ButtonCompt.vue';
import axios from 'axios';

export default {
    data() {
        return {
            formLevel: 0,
            projectName: null,
            projectDate: null,
            projectType: [],
            projectBudget: null,
            transitionName: 'slide-right',
            projectTypeOptions: [
                'כנס מקצועי',
                'כנס בינלאומי',
                'כנס תעשייה',
                'כנס אקדמי',
                'כנס חברה',
                'אחר'
            ],
            steps: [
                {
                    title: "יצירת כנס חדש",
                    text: "בוא נתחיל עם השם של הכנס"
                },
                {
                    title: "מתי הכנס יתקיים?",
                    text: "בחר את התאריך המתוכנן לכנס"
                },
                {
                    title: "איזה סוג כנס?",
                    text: "בחר את הקטגוריות המתאימות לכנס שלך"
                },
                {
                    title: "מה התקציב?",
                    text: "הכנס את התקציב המשוער לכנס (לא חובה)"
                },
                {
                    title: "כמעט סיימנו!",
                    text: "בדוק את הפרטים ולחץ על 'שמור כנס' כדי ליצור את הכנס"
                }
            ]
        }
    },
    
    computed: {
        currentStep() {
            return this.steps[this.formLevel];
        },
        formattedDate() {
            if (!this.projectDate) return '';
            const date = new Date(this.projectDate);
            return date.toLocaleDateString('he-IL');
        },
        isFormValid() {
            // Check if required fields are filled
            if (this.formLevel === 0 && !this.projectName) return false;
            if (this.formLevel === 1 && !this.projectDate) return false;
            if (this.formLevel === 2 && this.projectType.length === 0) return false;
            return true;
        }
    },

    methods: {
        goNext() {
            if (!this.isFormValid) {
                alert('אנא מלא את השדות הנדרשים');
                return;
            }

            this.transitionName = 'slide-left';
            
            if (this.formLevel < 4) {
                this.formLevel++;
            } else {
                this.submitForm();
            }
        },
        
        goBack() {
            if (this.formLevel > 0) {
                this.transitionName = 'slide-right';
                this.formLevel--;
            }
        },
        
        async submitForm() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$router.push('/login');
                    return;
                }

                await axios.post(
                    'http://localhost:3000/api/projects',
                    {
                        name: this.projectName,
                        date: this.projectDate,
                        type: this.projectType,
                        budget: this.projectBudget || 0
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // Redirect to project page or dashboard
                this.$router.push('/dashboard');
                
            } catch (error) {
                console.error('Error creating project:', error);
                alert('אירעה שגיאה ביצירת הפרויקט');
            }
        }
    },
    
    components: {
        ButtonCompt,
    }
}
</script>

<style scoped>
* {
    font-family: "Noto Sans Hebrew";
    font-weight: 200;
}

.logo {
    width: 8vw;
}

.containerOfAll {
    width: 100vw;
    height: 90vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container {
    height: auto;
    min-height: 50vh;
    width: 40vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #F2F0EF;
    border-radius: 30px;
    font-size: 1.1em;
    padding: 2rem 0;
    overflow: hidden;
}

/* Animation transitions */
.slide-right-enter-active,
.slide-left-enter-active {
    transition: all 0.5s ease-out;
    transition-delay: 0.5s; /* Delay enter by 0.5s to allow leave to finish */
}
.slide-right-leave-active,
.slide-left-leave-active {
    transition: all 0.5s ease-in;
    position: absolute;
}

.slide-right-enter-from {
    transform: translateX(-100%);
    opacity: 0;
}
.slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

.slide-left-enter-from {
    transform: translateX(100%);
    opacity: 0;
}
.slide-left-leave-to {
    transform: translateX(-100%);
    opacity: 0;
}

.theForm {
    display: flex;
    flex-direction: column;
    justify-content: center;
    direction: rtl;
    width: 80%;
    position: relative;
    min-height: 40vh; /* Ensure consistent height for form container */
}

.form-step {
    width: 100%;
}

.ProjectNameInput,
.ProjectDateInput,
.ProjectTypeInput,
.ProjectBudgetInput,
.ProjectSummary {
    display: flex;
    flex-direction: column;
    margin-bottom: 2vh;
}

label {
    font-size: 0.8em;
    margin-bottom: 1vh;
}

input[type=text],
input[type=date],
input[type=number] {
    width: 100%;
    height: 6vh;
    border: 1px solid #2977ff;
    text-indent: 10px;
    font-size: 1em;
    margin-bottom: 2vh;
}

input[type=text]:focus,
input[type=date]:focus,
input[type=number]:focus {
    outline: none;
    box-shadow: 0 0 5px #2977ff;
}

.checkbox-container {
    display: flex;
    flex-direction: column;
    gap: 1vh;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.checkbox-item input[type=checkbox] {
    transform: scale(1.2);
}

.checkbox-item label {
    margin-bottom: 0;
}

.navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 2vh;
}

.text > h2 {
    margin-bottom: 0;
    font-weight: 400;
}

.text > p {
    margin-top: 0;
    font-weight: 200;
    margin-bottom: 3vh;
}

.summary-item {
    margin-bottom: 1vh;
    font-size: 1.1em;
}

.ProjectSummary h3 {
    margin-top: 0;
    margin-bottom: 2vh;
}

.back-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.arrow-icon {
    font-style: normal;
    font-size: 1.2em;
}

.secondary {
    background-color: #F2F0EF;
    color: #2977ff;
    border: 1px solid #2977ff;
}

.halfWidth {
    width: 48%;
    height: 6vh;
    font-size: 1.2em;
}
</style>