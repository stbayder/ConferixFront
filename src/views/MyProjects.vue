<template>
    <div v-if="showDashboard" class="containerOfAll">
        <div  class="container" v-if="projectChosen == null">
            <h1 class="title">כנסים בטיפולך</h1>
            <!-- add loading modal -->
            <div v-if="loading">טוען פרוייקטים..</div>
            <div v-else id="containerOfContainerOfProjects">
                <div v-if="projectList.length === 0">לא קיימים פרוייקטים</div>
                <!-- להראות כפתור להפנייה ליצירת פרוייקט -->

                <div v-else class="projectsContainer">
                    <div v-for="project in projectList" :key="project._id" class="project-item">
                        <h3>{{ truncateName(project.name || 'Untitled Project',15) }}</h3>
                        <p>התפקיד שלך : {{ editorOrCreator(project) }}</p>
                        <p>תאריך : {{formatDate(project.date)}}</p>
                    </div>
                </div>

            </div>
        </div>
        
        <DashboardSidebar :projects="projectList" />
        
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
            loading: true,
            modalTitle: null,
            modalMessage:null,
            modalType:null,
            showModal:null
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
        DashboardSidebar
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

.containerOfAll{
    display: flex;
    width: 100%;
}

.containerOfContainerOfProjects{
    width: 100%;
}

.project-item {
    border: 1px solid #2977ff;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: #F2F0EF;;
    color: #2977ff;
    max-width: 10vw;
}

.projectsContainer{
    width: 50vw;
    display: flex;
    gap: 2vw;
    background-color: ;
}
</style>