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

                    <!-- Project Format Type Input (First category) -->
                    <div class="ProjectFormatInput form-step" v-else-if="formLevel === 2" key="format">
                        <div class="radio-container">
                            <div class="radio-item" v-for="(option, index) in formatOptions" :key="index">
                                <input 
                                    type="radio" 
                                    :id="'format-' + index"
                                    :value="option.value"
                                    v-model="selectedFormat"
                                    name="formatGroup">
                                <label :for="'format-' + index">{{ option.label }}</label>
                            </div>
                        </div>
                    </div>

                    <!-- Project Scope Type Input (Second category) -->
                    <div class="ProjectScopeInput form-step" v-else-if="formLevel === 3" key="scope">
                        <label>בחר את היקף הכנס</label>
                        <div class="radio-container">
                            <div class="radio-item" v-for="(option, index) in scopeOptions" :key="index">
                                <input 
                                    type="radio" 
                                    :id="'scope-' + index"
                                    :value="option.value"
                                    v-model="selectedScope"
                                    name="scopeGroup">
                                <label :for="'scope-' + index">{{ option.label }}</label>
                            </div>
                        </div>
                    </div>

                    <!-- Project Budget Input -->
                    <div class="ProjectBudgetInput form-step" v-else-if="formLevel === 4" key="budget">
                        <label for="projectBudget">תקציב לכנס (לא חובה)</label>
                        <input 
                            type="number" 
                            id="projectBudget"
                            placeholder="הכנס תקציב בשקלים" 
                            v-model="projectBudget">
                    </div>

                    <!-- Summary Step -->
                    <div class="ProjectSummary form-step" v-else-if="formLevel === 5" key="summary">
                        <h3>סיכום פרטי הכנס</h3>
                        <div class="summary-item">
                            <strong>שם הכנס:</strong> {{ projectName }}
                        </div>
                        <div class="summary-item">
                            <strong>תאריך:</strong> {{ formattedDate }}
                        </div>
                        <div class="summary-item" v-if="selectedFormat">
                            <strong>פורמט:</strong> {{ getFormatLabel(selectedFormat) }}
                        </div>
                        <div class="summary-item" v-if="selectedScope">
                            <strong>היקף:</strong> {{ getScopeLabel(selectedScope) }}
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
                        :buttonText="formLevel < 5 ? 'הבא' : 'שמור כנס'" 
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
            selectedFormat: null,  // For first category (format)
            selectedScope: null,   // For second category (scope)
            projectBudget: null,
            transitionName: 'slide-right',
            formatOptions: [
                { label: 'כנס וירטואלי', value: 'וירטואלי' },
                { label: 'כנס היברידי', value: 'היברידי' },
                { label: 'כנס פרונטלי', value: 'פרונטלי' }
            ],
            scopeOptions: [
                { label: 'כנס בינלאומי', value: 'בינ"ל' },
                { label: 'כנס לוקלי', value: 'לוקלי' }
            ],
            formatLabelsMap: {},
            scopeLabelsMap: {},
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
                    title: "איזה פורמט כנס?",
                    text: "בחר את פורמט הכנס המתאים"
                },
                {
                    title: "מה היקף הכנס?",
                    text: "בחר האם זה כנס לוקלי או בינלאומי"
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
    
    created() {
        // Create mappings of value to label for display purposes
        this.formatOptions.forEach(option => {
            this.formatLabelsMap[option.value] = option.label;
        });
        this.scopeOptions.forEach(option => {
            this.scopeLabelsMap[option.value] = option.label;
        });
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
            if (this.formLevel === 2 && !this.selectedFormat) return false;
            if (this.formLevel === 3 && !this.selectedScope) return false;
            return true;
        },
        // Combine selected types for form submission
        projectType() {
            const types = [];
            if (this.selectedFormat) types.push(this.selectedFormat);
            if (this.selectedScope) types.push(this.selectedScope);
            return types;
        }
    },

    methods: {
        getFormatLabel(value) {
            return this.formatLabelsMap[value] || value;
        },
        
        getScopeLabel(value) {
            return this.scopeLabelsMap[value] || value;
        },
        
        goNext() {
            if (!this.isFormValid) {
                alert('אנא מלא את השדות הנדרשים');
                return;
            }

            this.transitionName = 'slide-left';
            
            if (this.formLevel < 5) {
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
                    `${process.env.VUE_APP_BACKEND_URL}/api/projects`,
                    {
                        name: this.projectName,
                        date: this.projectDate,
                        type: this.projectType,  // Combined array of format and scope
                        budget: this.projectBudget || 0
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                // Redirect to project page or dashboard
                this.$router.push('/projects/dashboard');
                
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
.ProjectFormatInput,
.ProjectScopeInput,
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
    border: 1px solid #68808A;
    text-indent: 10px;
    font-size: 1em;
    margin-bottom: 2vh;
}

input[type=text]:focus,
input[type=date]:focus,
input[type=number]:focus {
    outline: none;
    box-shadow: 0 0 5px #B2C9CA;
}

.radio-container {
    display: flex;
    flex-direction: column;
    gap: 1vh;
}

.radio-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.radio-item input[type=radio] {
    transform: scale(1.2);
}

.radio-item label {
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
    color: #68808A;
    border: 1px solid #68808A;
}

.halfWidth {
    width: 48%;
    height: 6vh;
    font-size: 1.2em;
}

.entireWidth {
    width: 100%;
    height: 6vh;
    font-size: 1.2em;
}

input[type="radio"] {
  accent-color: #68808A; /* Replace with any color you want */
}

</style>