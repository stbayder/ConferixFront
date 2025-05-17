<template>
  <nav>
    <!-- Home Button -->
    <button class="homeBtn" @click="nullProject">
      <img src="@/assets/icons/home-50.png" alt="" class="icon">
      <p>הכנסים שלי</p>
    </button>
    <hr />

    <!-- If a project is chosen, show project + categories -->
    <div v-if="projects && projects.length > 0">
      <div v-if="chosenProject">
        <button class="projectBtn">
          <img src="@/assets/icons/conference-50.png" alt="" class="icon">
          <p>
            {{ truncateName(chosenProject.name, 15) }} 
            <br />
            {{ formatDate(chosenProject.date) }}
          </p>
        </button>
        <hr />

        <!-- Category Circles -->
        <div class="category-list">
          <div
            v-for="(cat, index) in assCategories"
            :key="index"
            class="category"
            @click="chooseCat(cat.label)"
          >
            <p>
             {{ cat.label }}
            </p>
            <img :src="cat.icon" alt="" class="category-icon" />
            
          </div>
        </div>
      </div>

      <!-- If no project is chosen, show project list -->
      <div v-else>
        <div v-for="project in projects" :key="project._id">
          <button class="projectBtn" @click="chooseProject(project._id)">
            <img src="@/assets/icons/conference-50.png" alt="" class="icon">
            <p>
              {{ truncateName(project.name, 15) }} 
              <br />
              {{ formatDate(project.date) }}
            </p>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import formatDate, { truncateName } from '@/utils/utilFuncs';

export default {
  name: "DashboardSidebar",
  props: {
    projects: Array,
    chosenProject: Object,
    assCategories: Array
  },
  methods: {
    formatDate,
    truncateName,
    chooseProject(project_id) {
      this.$emit("projectWasChosen", project_id);
    },
    nullProject() {
      this.$emit("nullProject");
    },
    chooseCat(label) {
      this.$emit("categoryChosen", label);
    }
  }
};
</script>

<style scoped>
* {
  font-family: "Noto Sans Hebrew";
}

nav {
  width: 20vw;
  background-color: #2977ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2vh 1vw;
  overflow-y: auto;
}

hr {
  color: #F2F0EF;
  border-color: #F2F0EF;
  width: 50%;
}

button {
  color: #F2F0EF;
  border: none;
  margin-top: 2vh;
  background-color: transparent;
  direction: rtl;
  width: 12vw;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.icon {
  width: 2vw;
  height: 2vw;
  margin-left: 1vh;
}

.homeBtn {
  font-size: 1.2em;
  cursor: pointer;
}

.projectBtn {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.projectBtn:hover {
  transform: scale(1.2);
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1vw;
  justify-content: center;
  flex-direction: column;
  margin-top: 2vh;
}

.category {
    height: 2vh;
    direction: rtl;
  position: relative;
  display: flex;
  gap: 2vh;
  margin-bottom: 1vh;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.category:hover {
  transform: scale(1.1);
}

.category-icon {
  width: 20px;
  height: 20px;
}


.category:hover .tooltip {
  display: block;
}
</style>
