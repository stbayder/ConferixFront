<template>
    <div v-if="showDashboard" class="containerOfAll">
        <div  class="container" >
            <h1 class="title">כנסים בטיפולך</h1>
            <!-- add loading modal -->
            <div v-if="loading">טוען פרוייקטים..</div>
            <div v-else id="containerOfContainerOfProjects">
                <div v-if="projectList.length === 0" class="noProjects">
                    <p>
                    לא קיימים פרוייקטים
                    </p>
                    <ButtonCompt 
                        buttonText="צור כנס ראשון!"
                        :buttonStyle="['signup','big','entireWidth']"
                        :clickFunc="goToCreateProjectPage"
                    />
                </div>
                <!-- להראות כפתור להפנייה ליצירת פרוייקט -->

                <div v-if="projectList.length > 0 && !projectChosen" class="projectsContainer">
                    <div v-for="project in projectList" :key="project._id" class="project-item" @click="projectWasChosen(project._id)" >
                        <h3>{{ truncateName(project.name || 'Untitled Project',15) }}</h3>
                        <p>התפקיד שלך : {{ editorOrCreator(project) }}</p>
                        <p>תאריך : {{formatDate(project.date)}}</p>
                    </div>
                </div>
                
                <div v-if="projectChosen" id="displayProject"> 
                    <h2>
                        {{ projectChosen.name }}
                    </h2>
                    <!-- categories -->
                    <div class="categories-wrapper">
                        <div 
                            v-for="(cat, index) in assgimentCategories" 
                            :key="index" 
                            class="category-icon"
                            @click="chooseCategory(cat.label)"
                        >
                            <img :src="cat.icon" :alt="cat.label" />
                            <span class="tooltip">{{ cat.label }}</span>
                        </div>
                    </div>
                    <!-- Assigments -->
                    <div v-if="chosenAssigmentCategory" class="assignmentContainer">
                        <div 
                            v-for="(ass, index) in paginatedAssignments" 
                            :key="index"
                            class="Assignment"
                        >
                            <div class="assignment-left">
                                <img 
                                    :src="getCategoryIcon(ass.Assignment.Step)" 
                                    alt="category icon" 
                                    class="assignment-icon"
                                />
                                <p>{{ ass.Assignment.Assignment }}</p>
                            </div>
                            <div class="assignment-right">
                                <img 
                                    :src="ass.Important ? require('@/assets/icons/starred.png') : require('@/assets/icons/not_starred.png')" 
                                    alt="important star" 
                                    class="star-icon"
                                    @click="toggleImportance(ass)"
                                />
                                <p>{{ getAssignmentStatus(ass.Status) }}</p>
                            </div>
                            
                        </div>
                        <div v-if="filteredAssigments && filteredAssigments.length > itemsPerPage" class="pagination-controls">
                            <button @click="currentPage--" :disabled="currentPage === 1">הקודם</button>
                            <span>עמוד {{ currentPage }} מתוך {{ totalPages }}</span>
                            <button @click="currentPage++" :disabled="currentPage === totalPages">הבא</button>
                        </div>
                    
                    </div>
                </div>
            </div>
        </div>
        
        <DashboardSidebar 
            :projects="projectList"
            :chosenProject="projectChosen"
            :assCategories="assgimentCategories"
            @projectWasChosen="projectWasChosen"
            @nullProject="projectChosen=null"
            @categoryChosen="chooseCategory"
        />
        
    </div>

    <div v-else>
        <!-- Error state when not authenticated -->
        <PopUpModal 
            :title="this.modalTitle"
            :message="modalMessage"
            :type="modalType"
            @close="closeModal"
        />
    </div>
        <!-- general Modal -->
    <PopUpModal 
        :title="this.modalTitle"
        :message="modalMessage"
        :type="modalType"
        @close="closeModal"
        v-if="showModal && showDashboard"
    />
</template>

<script>
import axios from 'axios';
import PopUpModal from '@/components/common/PopUpModal.vue';
import ButtonCompt from '@/components/common/ButtonCompt.vue';
import DashboardSidebar from '@/components/Projects/DashboardSidebar.vue';
import formatDate, { truncateName } from '@/utils/utilFuncs';

export default {
    name: "MyProjects",
    data() {
        return {
            userData: JSON.parse(localStorage.getItem('userData')) || null,
            token:localStorage.getItem('token'),
            showDashboard: true,
            projectList: [],
            projectChosen:null,
            assgimentCategories: [
                { label: "הגדרה ראשונית", icon: require("@/assets/icons/settings.png") },
                { label: "תכנון תוכן", icon: require("@/assets/icons/content.png") },
                { label: "לוגיסטיקה", icon: require("@/assets/icons/logistics.png") },
                { label: "ביום הכנס", icon: require("@/assets/icons/dayof.png") },
                { label: "שיווק ופרסום", icon: require("@/assets/icons/marketing.png") },
                { label: "לאחר הכנס", icon: require("@/assets/icons/congrats.png") },
                { label: "חשוב", icon: require("@/assets/icons/starred.png") },
                { label: "הושלם", icon: require("@/assets/icons/done.png") },
                { label: "בתהליך", icon: require("@/assets/icons/in_progress.png") },
                { label: "עוד לא התחילה", icon: require("@/assets/icons/sleep.png") }
            ],
            chosenAssigmentCategory:null,
            filteredAssigments:null,
            currentPage: 1,
            itemsPerPage: 5,
            loading: true,
            modalTitle: null,
            modalMessage:null,
            modalType:null,
            showModal:null
        }
    },
    computed: {
        paginatedAssignments() {
            if (!this.filteredAssigments) return [];
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredAssigments.slice(start, start + this.itemsPerPage);
        },
        totalPages() {
            if (!this.filteredAssigments) return 1;
            return Math.ceil(this.filteredAssigments.length / this.itemsPerPage);
        }
    },
    methods: {
        async getMyProjects() {
            try {
                this.loading = true;
                this.error = null;
                
                // Get the token from userData
                const token = this.token;
                
                if (!token) {
                    this.error = "Authentication token not found";
                    this.showDashboard = false;
                    return;
                }
                
                const response = await axios.get(
                    `${process.env.VUE_APP_BACKEND_URL}/api/projects/`, // Fixed typo in "projects"
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                this.projectList = response.data;
            } catch (error) {
                console.error('Error fetching projects:', error);
                this.error = error.response?.data?.error || 'Failed to load projects';
                
                // Handle authentication errors
                if (error.response?.status === 401) {
                    this.showDashboard = false;
                    // You could redirect to login here
                    // this.$router.push('/login');
                }
            } finally {
                this.loading = false;
            }
        },
        goToCreateProjectPage(){
            this.$router.push('/projects/create')
        },
        closeModal(){
            this.modalTitle = null
            this.modalMessage = null
            this.modalType = null
            if(!this.userData){
                this.$router.push('/login')
            }
        },
        editorOrCreator(project){
            if(project.Creator.Email == this.userData.Email){
                return("יוצר")
            }
            else{
                return("עורך")
            }
        },
        projectWasChosen(project_id){
            this.projectChosen = this.projectList.find(project => project._id == project_id)
            this.chosenAssigmentCategory=null;
            this.filteredAssigments=null;
        },
        chooseCategory(cat){
            this.chosenAssigmentCategory = cat;
            this.currentPage = 1;
            if(cat == "חשוב"){
                this.filteredAssigments = this.projectChosen.Assignments.filter(ass => ass.Important)
                console.log(this.filteredAssigments)
                return
            }
            if(cat == "הושלם"){
                this.filteredAssigments = this.projectChosen.Assignments.filter(ass => ass.Status == "Done")
                console.log(this.filteredAssigments)
                return
            }
            if(cat == "בתהליך"){
                this.filteredAssigments = this.projectChosen.Assignments.filter(ass => ass.Status == "InProgress")
                console.log(this.filteredAssigments)
                return
            }
            if(cat == "עוד לא התחילה"){
                this.filteredAssigments = this.projectChosen.Assignments.filter(ass => ass.Status == "Pending")
                console.log(this.filteredAssigments)
                return
            }
            this.filteredAssigments = this.projectChosen.Assignments.filter(ass => ass.Assignment.Step === cat)
            console.log(this.filteredAssigments)
        },
        getCategoryIcon(step) {
            const match = this.assgimentCategories.find(cat => cat.label === step);
            return match ? match.icon : null;
        },
        getAssignmentStatus(assStatus){
            if(assStatus == "Pending"){
                return "עוד לא התחילה"
            }
            if(assStatus == "InProgress"){
                return "בתהליך"
            }
            if(assStatus == "Done"){
                return "הושלם"
            }
        },
        async toggleImportance(ass) {
            try {
                const response = await axios.patch(
                    `${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${ass._id}/importance`,
                    { Important: !ass.Important }, // toggle the boolean
                    {
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        }
                    }
                );

                // For Vue 3: Update the assignment in the main project assignments array
                const assignmentIndex = this.projectChosen.Assignments.findIndex(a => a._id === ass._id);
                if (assignmentIndex !== -1) {
                    this.projectChosen.Assignments[assignmentIndex].Important = response.data.Important;
                }
                
                // Also update the filtered assignments if they exist
                if (this.filteredAssigments) {
                    const filteredIndex = this.filteredAssigments.findIndex(a => a._id === ass._id);
                    console.log(filteredIndex)
                    if (filteredIndex !== -1) {
                        this.filteredAssigments[filteredIndex].Important = !ass.Important;
                        console.log(this.filteredAssigments[filteredIndex])
                    }
                }
                
            } catch (error) {
                console.error('Error toggling importance:', error);
                // Optionally show an error modal here
                this.modalType = "error";
                this.modalTitle = "שגיאה";
                this.modalMessage = "לא ניתן לעדכן את חשיבות המשימה";
                this.showModal = true;
            }
        },
        formatDate,
        truncateName,
        // handleLogout() {
        //     localStorage.removeItem('userData');
        //     this.userData = null;
        //     this.showDashboard = false;
        //     // Redirect to login
        //     // this.$router.push('/login');
        // }
    },
    mounted() {
        if (!this.userData || !this.token) {
            this.showDashboard = false;
            this.modalType = "error"
            this.modalTitle = "אתה צריך להיות מחובר כדי לצפות בעמוד הזה";
            this.modalMessage = "הנך מועבר לעמוד ההתחברות"
            // You could redirect to login here
            // this.$router.push('/login');
        } else {
            // Fetch projects when component mounts
            this.getMyProjects();
        }
    },
    components:{
        PopUpModal,
        DashboardSidebar,
        ButtonCompt
    }
}
</script>

<style scoped>

h1{
    font-size: 3em;
    color: #2977ff;
}
.container{
    font-family: "Noto Sans Hebrew";
    direction: rtl;
    width: 100vw;
    height:90vh;

    display: flex;
    flex-direction: column;
    justify-content:flex-start;
    align-items: center;
}

.container > h1 {
    margin-left: 10vw;
}

.noProjects{
    margin-left: 10vw;
}

.containerOfAll{
    display: flex;
    width: 100%;
}

.containerOfContainerOfProjects{
    width: 100%;
}

.project-item {
    width: 10vw; /* fixed width */
    min-width: 10vw;
    max-width: 10vw;
    overflow: hidden; /* hide overflow */
    text-overflow: ellipsis; /* add ellipsis to overflow text */
    white-space: nowrap; /* prevent wrapping */
    
    border: 1px solid #2977ff;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: #F2F0EF;
    color: #2977ff;
    cursor: pointer;
}

.projectsContainer{
    width: 50vw;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 2vw;
}


#displayProject{
    display: flex;
    flex-direction: column;
    align-items: center;
}
.categories-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  justify-content: center;
  align-items: center;
}

.category-icon {
  position: relative;
  width: 60px;
  height: 60px;
  background-color: #2977ff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s;
  cursor: pointer;
}

.category-icon:hover {
  transform: scale(1.1);
}

.category-icon img {
  width: 30px;
  height: 30px;
}

.tooltip {
  visibility: hidden;
  opacity: 0;
  white-space: nowrap;
  background-color: #333;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  position: absolute;
  bottom: -30px;
  right: 50%;
  transform: translateX(50%);
  transition: opacity 0.3s;
  font-size: 0.8em;
  z-index: 10;
}

.category-icon:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
.assignmentContainer{
    display: flex;
    flex-direction: column;
    gap: 2vh;
}

.Assignment{
    width:25vw;
    height:5vh;
    padding: 1vh;

    display: flex;
    justify-content: space-between;

    background-color: #2977ff;
    color: #F2F0EF;
    border-radius: 20px;
}

.Assignment > p{
    margin: 0;
}

.assignment-left, .assignment-right {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 10vw;
}

.assignment-icon {
    width: 20px;
    height: 20px;
}

.star-icon {
    width: 18px;
    height: 18px;
    cursor: pointer;
}
.pagination-controls {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
}

.pagination-controls button {
    background-color: #2977ff;
    color: #fff;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}

.pagination-controls button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

</style>