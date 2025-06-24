<template>
  <div v-if="showDashboard" class="containerOfAll">
    <div class="container">
      <h1 class="title">כנסים בטיפולך</h1>
      <!-- add loading modal -->
      <div v-if="loading">טוען פרוייקטים..</div>
      <div v-else id="containerOfContainerOfProjects">
        <div v-if="projectList.length === 0" class="noProjects">
          <p>לא קיימים פרוייקטים</p>
          <ButtonCompt
            buttonText="צור כנס ראשון!"
            :buttonStyle="['signup', 'big', 'entireWidth']"
            :clickFunc="goToCreateProjectPage"
          />
        </div>
        <!-- להראות כפתור להפנייה ליצירת פרוייקט -->

        <div v-if="projectList.length > 0 && !projectChosen" class="projectsContainer">
          <div
            v-for="project in projectList"
            :key="project._id"
            class="project-item"
            @click="projectWasChosen(project._id)"
          >
            <h3>{{ truncateName(project.name || "Untitled Project", 15) }}</h3>
            <p>התפקיד שלך : {{ editorOrCreator(project) }}</p>
            <p>תאריך : {{ formatDate(project.date) }}</p>
          </div>
        </div>

        <div v-if="projectChosen" id="displayProject">
          <h2>
            {{ projectChosen.name }}
          </h2>
          <div class="calender " @click="exportAllProjectAssignments()">
            <img :src="require('@/assets/icons/icons8-google-calendar-48.png')" alt="Date" class="calenderbtn calenderExportAll" id="exportAll" />
            <span class="tooltip">ייצא לקליטה ביומן גוגל</span>
          </div>
          
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
          <div
            v-if="chosenAssigmentCategory && !chosenAssignment"
            class="assignmentContainer"
          >
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

                <p class="assName" @click="chooseAssignment(ass)">
                  {{ ass.Assignment.Assignment }}
                </p>
              </div>

              <div class="dueDate">
                {{ formatDate(ass.DueDate) }}
                <img
                  :src="
                    ass.Important
                      ? require('@/assets/icons/starred.png')
                      : require('@/assets/icons/not_starred.png')
                  "
                  alt="important star"
                  class="star-icon"
                  @click="toggleImportance(ass)"
                />
              </div>

              <div class="assignment-right">
                <p>{{ getAssignmentStatus(ass.Status) }}</p>
                <div
                  :class="[
                    'circle',
                    ass.Status == 'Pending'
                      ? 'red'
                      : ass.Status == 'In Progress'
                      ? 'yellow'
                      : 'green',
                  ]"
                ></div>
              </div>
            </div>
            <div
              v-if="filteredAssigments && filteredAssigments.length > itemsPerPage"
              class="pagination-controls"
            >
              <button @click="currentPage--" :disabled="currentPage === 1">הקודם</button>
              <span>עמוד {{ currentPage }} מתוך {{ totalPages }}</span>
              <button @click="currentPage++" :disabled="currentPage === totalPages">
                הבא
              </button>
            </div>
          </div>
          <div v-if="chosenAssignment">
            <ShowAssignment
              :Ass="chosenAssignment"
              :transStatus="getAssignmentStatus"
              :stepIconMatch="getCategoryIcon(chosenAssignment.Assignment.Step,true)"
              @toggleImportance="toggleImportance(chosenAssignment)"
              @updateAssignmentStatus="assignmentStatusUpdate"
              @assignmentDeleted="deleteAssignment"
            />
          </div>
        </div>
      </div>
    </div>

    <DashboardSidebar
      :projects="projectList"
      :chosenProject="projectChosen"
      :assCategories="assgimentCategories"
      @projectWasChosen="projectWasChosen"
      @nullProject="projectChosen = null"
      @categoryChosen="chooseCategory"
    />
  </div>

  <div v-else>
    <!-- Error state when not authenticated -->
    <PopUpModal
      :title="modalTitle"
      :message="modalMessage"
      :type="modalType"
      @close="closeModal"
    />
  </div>
  <!-- general Modal -->
  <PopUpModal
    :title="modalTitle"
    :message="modalMessage"
    :type="modalType"
    @close="closeModal"
    v-if="showModal && showDashboard"
  />
  <PopUpMessage
    :title="modalTitle"
    :message="modalMessage"
    :type="modalType"
    @close="closeModal"
    v-if="DisplayPopUpMessage"
  />
</template>

<script>
import axios from "axios";
import PopUpModal from "@/components/common/PopUpModal.vue";
import PopUpMessage from "@/components/common/PopUpMessage.vue";
import ButtonCompt from "@/components/common/ButtonCompt.vue";
import DashboardSidebar from "@/components/Projects/DashboardSidebar.vue";
import ShowAssignment from "./ShowAssignment.vue";
import formatDate, { truncateName } from "@/utils/utilFuncs";
import { exportProjectToCalendar } from "@/utils/calendarExport";

export default {
  name: "MyProjects",
  data() {
    return {
      userData: JSON.parse(localStorage.getItem("userData")) || null,
      token: localStorage.getItem("token"),
      showDashboard: true,
      projectList: [],
      projectChosen: null,
      assgimentCategories: [
        { label: "הגדרה ראשונית", icon: require("@/assets/icons/settings.png"), darkIcon: require("@/assets/icons/settings-dark.png") },
        { label: "תכנון תוכן", icon: require("@/assets/icons/content.png"), darkIcon: require("@/assets/icons/content-dark.png") },
        { label: "לוגיסטיקה", icon: require("@/assets/icons/logistics.png"), darkIcon: require("@/assets/icons/logistics-dark.png") },
        { label: "ביום הכנס", icon: require("@/assets/icons/dayof.png"), darkIcon: require("@/assets/icons/dayof-dark.png") },
        { label: "שיווק ופרסום", icon: require("@/assets/icons/marketing.png"), darkIcon: require("@/assets/icons/marketing-dark.png") },
        { label: "לאחר הכנס", icon: require("@/assets/icons/congrats.png") }, // no dark
        { label: "חשוב", icon: require("@/assets/icons/starred.png") },      // no dark
        { label: "הושלם", icon: require("@/assets/icons/done.png") },        // no dark
        { label: "בתהליך", icon: require("@/assets/icons/in_progress.png"), darkIcon: require("@/assets/icons/in_progress-dark.png") },
        { label: "עוד לא התחילה", icon: require("@/assets/icons/sleep.png"), darkIcon: require("@/assets/icons/sleep-dark.png") },
        ],

      chosenAssigmentCategory: null,
      chosenAssignment: null,
      filteredAssigments: null,
      currentPage: 1,
      itemsPerPage: 5,
      circleColor: null,
      loading: true,
      modalTitle: null,
      modalMessage: null,
      modalType: null,
      showModal: null,
      DisplayPopUpMessage: null,
    };
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
    },
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
          `${process.env.VUE_APP_BACKEND_URL}/api/projects/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.projectList = response.data;
      } catch (error) {
        console.error("Error fetching projects:", error);
        this.error = error.response?.data?.error || "Failed to load projects";

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
    goToCreateProjectPage() {
      this.$router.push("/projects/create");
    },
    closeModal() {
      this.modalTitle = null;
      this.modalMessage = null;
      this.modalType = null;
      this.DisplayPopUpMessage = false;
      if (!this.userData) {
        this.$router.push("/login");
      }
    },
    editorOrCreator(project) {
      if (project.Creator.Email == this.userData.Email) {
        return "יוצר";
      } else {
        return "עורך";
      }
    },
    projectWasChosen(project_id) {
      this.projectChosen = this.projectList.find((project) => project._id == project_id);
      this.chosenAssigmentCategory = null;
      this.filteredAssigments = null;
    },
    chooseCategory(cat) {
      this.chosenAssignment = null;
      this.chosenAssigmentCategory = cat;
      this.currentPage = 1;
      if (cat == "חשוב") {
        this.filteredAssigments = this.projectChosen.Assignments.filter(
          (ass) => ass.Important
        );
        return;
      }
      if (cat == "הושלם") {
        this.filteredAssigments = this.projectChosen.Assignments.filter(
          (ass) => ass.Status == "Done"
        );
        return;
      }
      if (cat == "בתהליך") {
        this.filteredAssigments = this.projectChosen.Assignments.filter(
          (ass) => ass.Status == "InProgress"
        );
        return;
      }
      if (cat == "עוד לא התחילה") {
        this.filteredAssigments = this.projectChosen.Assignments.filter(
          (ass) => ass.Status == "Pending"
        );
        return;
      }
      this.filteredAssigments = this.projectChosen.Assignments.filter(
        (ass) => ass.Assignment.Step === cat
      );
    },
    getCategoryIcon(step, isDarkMode = false) {
        const match = this.assgimentCategories.find(cat => cat.label === step);
        if (!match) return null;

        if (isDarkMode && match.darkIcon) {
            return match.darkIcon;
        }

        return match.icon;
    },

    getAssignmentStatus(assStatus, circle) {
      if (assStatus == "Pending") {
        return "עוד לא התחילה";
      }
      if (assStatus == "In Progress") {
        return "בתהליך";
      }
      if (assStatus == "Done") {
        return "הושלם";
      }

      return circle;
    },
    async toggleImportance(ass) {
      console.log(ass);
      try {
        const response = await axios.patch(
          `${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${ass._id}/importance`,
          { Important: !ass.Important }, // toggle the boolean
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );

        // For Vue 3: Update the assignment in the main project assignments array
        const assignmentIndex = this.projectChosen.Assignments.findIndex(
          (a) => a._id === ass._id
        );
        if (assignmentIndex !== -1) {
          this.projectChosen.Assignments[assignmentIndex].Important =
            response.data.Important;
        }

        // Also update the filtered assignments if they exist
        if (this.filteredAssigments) {
          const filteredIndex = this.filteredAssigments.findIndex(
            (a) => a._id === ass._id
          );
          if (filteredIndex !== -1) {
            this.filteredAssigments[filteredIndex].Important = !ass.Important;
          }
        }
      } catch (error) {
        console.error("Error toggling importance:", error);
        // Optionally show an error modal here
        this.modalType = "error";
        this.modalTitle = "שגיאה";
        this.modalMessage = "לא ניתן לעדכן את חשיבות המשימה";
        this.showModal = true;
      }
    },
    chooseAssignment(ass) {
      this.chosenAssignment = ass;
    },
    showPopUpMessage(title, message, type) {
      this.modalTitle = title;
      this.modalMessage = message;
      this.modalType = type;
      this.DisplayPopUpMessage = true;
    },
    assignmentStatusUpdate(ass) {
      this.chosenAssignment = ass;
    },
    deleteAssignment(deletedAss) {
      this.chosenAssignment = null;

      // Remove from full project assignments
      this.projectChosen.Assignments = this.projectChosen.Assignments.filter(
        (ass) => ass._id !== deletedAss._id
      );

      // Also remove from filtered view
      if (this.filteredAssigments) {
        this.filteredAssigments = this.filteredAssigments.filter(
          (ass) => ass._id !== deletedAss._id
        );
      }
    },
    async exportToGoogleCalendar() {
      try {
        // Determine which assignments to export
        const assignmentsToExport =
          this.filteredAssigments || this.projectChosen?.Assignments || [];

        if (assignmentsToExport.length === 0) {
          this.showPopUpMessage(
            "אין משימות לייצוא",
            "לא נמצאו משימות לייצוא. אנא בחר פרוייקט או קטגוריה עם משימות.",
            "warning"
          );
          return;
        }

        // maybe add here some way for the user to choose or decide the categories he want to export?

        // Call the export function
        const result = exportProjectToCalendar(
          this.projectChosen,
          assignmentsToExport,
          this.chosenAssigmentCategory
        );

        // Show success message
        const categoryText = this.chosenAssigmentCategory
          ? ` מקטגוריה "${this.chosenAssigmentCategory}"`
          : "";
        this.showPopUpMessage(
          "ייצוא הושלם בהצלחה!",
          `יוצאו ${result.exportedCount} מתוך ${result.totalCount} משימות${categoryText} ליומן Google. קובץ ה-ICS נשמר במחשב שלך.`,
          "success"
        );
      } catch (error) {
        console.error("Export error:", error);
        this.showPopUpMessage(
          "שגיאה בייצוא",
          error.message || "אירעה שגיאה בייצוא המשימות ליומן",
          "error"
        );
      }
    },

    /**
     * Export all project assignments (regardless of current filter)
     */
    async exportAllProjectAssignments() {
      if (!this.projectChosen) {
        this.showPopUpMessage("לא נבחר פרוייקט", "אנא בחר פרוייקט לייצוא", "warning");
        return;
      }

      try {
        const result = exportProjectToCalendar(
          this.projectChosen,
          this.projectChosen.Assignments,
          null // No category filter
        );

        this.showPopUpMessage(
          "ייצוא הושלם בהצלחה!",
          `יוצאו ${result.exportedCount} מתוך ${result.totalCount} משימות מהפרוייקט "${this.projectChosen.name}" ליומן Google.`,
          "success"
        );
      } catch (error) {
        console.error("Export error:", error);
        this.showPopUpMessage(
          "שגיאה בייצוא",
          error.message || "אירעה שגיאה בייצוא המשימות ליומן",
          "error"
        );
      }
    },

    /**
     * Get tooltip text for export button based on current view
     */
    getExportButtonTooltip() {
      if (this.filteredAssigments && this.chosenAssigmentCategory) {
        return `ייצא ${this.filteredAssigments.length} משימות מקטגוריה "${this.chosenAssigmentCategory}" ליומן Google`;
      } else if (this.projectChosen) {
        const totalAssignments = this.projectChosen.Assignments
          ? this.projectChosen.Assignments.length
          : 0;
        return `ייצא ${totalAssignments} משימות מהפרוייקט "${this.projectChosen.name}" ליומן Google`;
      }
      return "ייצא משימות ליומן Google";
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
      this.modalType = "error";
      this.modalTitle = "אתה צריך להיות מחובר כדי לצפות בעמוד הזה";
      this.modalMessage = "הנך מועבר לעמוד ההתחברות";
      // You could redirect to login here
      // this.$router.push('/login');
    } else {
      // Fetch projects when component mounts
      this.getMyProjects();
    }
  },
  components: {
    PopUpModal,
    DashboardSidebar,
    ButtonCompt,
    ShowAssignment,
    PopUpMessage,
  },
};
</script>

<style scoped>
h1 {
  font-size: 3em;
  color: #68808a;
  margin-bottom: 2vh;
  margin-top: 1vh;
}

h2 {
  margin: 0;
}

.container {
  font-family: "Noto Sans Hebrew";
  direction: rtl;
  width: 100vw;
  height: 90vh;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.noProjects {
  margin-left: 10vw;
}

.containerOfAll {
  display: flex;
  width: 100%;
}

#containerOfContainerOfProjects {
  display: flex;
  justify-content: center;
  width: 100%;
}

.project-item {
  width: 10vw;
  min-width: 10vw;
  max-width: 10vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  border: 1px solid #68808a;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: #f2f0ef;
  color: #68808a;
  cursor: pointer;
}

.projectsContainer {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 2vw;
  direction: rtl;
  width: fit-content;
  max-width: 50vw;
}

#displayProject {
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
  background-color: #68808a;
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

.calender:hover > .tooltip{
    visibility: visible;
    opacity: 1;
}

.assignmentContainer {
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.Assignment {
  width: 25vw;
  height: 5vh;
  padding: 1vh;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: #68808a;
  color: #f2f0ef;
  border-radius: 20px;
}

.Assignment > p {
  margin: 0;
}

.assignment-left,
.assignment-right,
.dueDate {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 10vw;
    flex: 1; /* Make each section take equal space */
  min-width: 0; /* Allow flex items to shrink below their content size */
}

.assignment-left {
  justify-content: flex-start; /* Align content to the left */
}

.dueDate {
  justify-content: center; /* Center the due date section */
  text-align: center;
}

.assignment-right {
  justify-content: flex-end; /* Align content to the right */
}

.assName {
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* Prevent text from wrapping and breaking layout */
}

.assignment-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.circle {
  width: 1vw;
  height: 1vw;
  border-radius: 50%;
   flex-shrink: 0;
}

.circle.red {
  background-color: red;
}

.circle.green {
  background-color: green;
}

.circle.yellow {
  background-color: yellow;
}

.star-icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
   flex-shrink: 0;
}
.pagination-controls {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.pagination-controls button {
  background-color: #68808a;
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

.calender{
    position: absolute;
    left:10vw;
    cursor: pointer;
}

</style>
