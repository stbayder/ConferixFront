<template>
  <!-- not signed in modal -->
  <PopUpModal 
    :message="modalMessage"
    :title="modalTitle"
    type="error"
    v-if="showSignOutModal"
    @close="closeSignOut"
  />

  <div class="assignments-view" v-if="User && !showSignOutModal">
    <div class="header">
      <h1>מאגר טיפים</h1>
      <div class="filters">
        <!-- Search Filter -->
        <div class="filter-group">
          <label for="search">חיפוש:</label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            placeholder="חפש משימות..."
            @input="debouncedFilter"
          />
        </div>

        <!-- Step Filter -->
        <div class="filter-group">
          <label for="step">שלב:</label>
          <select id="step" v-model="filters.step" @change="filterAssignments">
            <option value="">כל השלבים</option>
            <option v-for="step in availableSteps" :key="step" :value="step">
              {{ step }}
            </option>
          </select>
        </div>

        <!-- Comments Filter -->
        <div class="filter-group">
          <label for="comments">תגובות:</label>
          <select id="comments" v-model="filters.comments" @change="filterAssignments">
            <option value="">הכל</option>
            <option value="has-comments">יש תגובות</option>
            <option value="no-comments">אין תגובות</option>
            <option value="many-comments">הרבה תגובות (5+)</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <button @click="clearFilters" class="clear-btn">נקה פילטרים</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>טוען משימות...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>שגיאה: {{ error }}</p>
      <button @click="fetchAssignments" class="retry-btn">נסה שוב</button>
    </div>

    <!-- Assignments List -->
    <div v-else class="assignments-container">
      <div v-if="filteredAssignments.length === 0" class="no-results">
        <p>לא נמצאו משימות העונות על הקריטריונים שלך.</p>
      </div>

      <div v-else class="assignments-grid">
        <div 
          v-for="assignment in filteredAssignments" 
          :key="assignment._id"
          class="assignment-card"
          :class="{ 
            'ongoing': assignment.IsOngoing,
            'day-of': assignment.IsDayOf,
            'completed': assignment.Status === 'completed'
          }"
        >
          <div class="assignment-header">
            <h3>{{ assignment.Assignment }}</h3>
          </div>

          <div class="assignment-details">
            <p><strong>שלב:</strong> {{ assignment.Step }}</p>
            <p><strong>זמן מוערך:</strong> {{ assignment.EstimatedTime }} שעות</p>
            <p><strong>היסט התחלה:</strong> {{ assignment.RecommendedStartOffset }} ימים</p>
            
            <div class="assignment-tags">
              <span v-if="assignment.IsOngoing" class="tag ongoing">מתמשך</span>
              <span v-if="assignment.IsDayOf" class="tag day-of">ביום האירוע</span>
              <span 
                v-for="type in assignment.Type" 
                :key="type" 
                class="tag type"
              >
                {{ type }}
              </span>
            </div>

            <div class="comments-info">
              <span class="comments-count">
                💬 {{ assignment.commentCount || 0 }} <span @click="goToComments(assignment)" class="commments-link">תגובות</span> 
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        הבא
      </button>
      
      <span class="page-info">
        עמוד {{ currentPage }} מתוך {{ totalPages }}
      </span>
      
      
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        הקודם
      </button>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import PopUpModal from '@/components/common/PopUpModal.vue';
import { verifyToken } from "@/utils/utilFuncs";
import eventBus from '@/utils/eventBus';

export default {
  name: 'AssignmentsView',
  data() {
    return {
      // Original data from your component
      User: JSON.parse(localStorage.getItem("userData")) || null,
      modalMessage: null,
      modalTitle: null,
      modalType: null,
      showSignOutModal: false,
      
      // Assignments data
      assignments: [],
      filteredAssignments: [],
      availableSteps: [],
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      filters: {
        search: '',
        step: '',
        status: '',
        comments: ''
      },
      debounceTimer: null
    };
  },
  async mounted() {
    let isTokenValid = await verifyToken();
    if (!this.User || !isTokenValid.valid) {
      this.modalMessage = "נא להתחבר כדי לצפות בתוכן זה";
      this.modalTitle = "שגיאה";
      this.showSignOutModal = true;
    } else {
      // Only fetch assignments if user is authenticated
      await this.fetchAssignments();
      this.extractAvailableSteps();
    }
  },
  methods: {
    closeSignOut() {
      this.showSignOutModal = false;
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      eventBus.emit("user:logout");
      this.$router.push('/login');
    },
    verifyToken,

    // Assignment methods
    async fetchAssignments() {
      this.loading = true;
      this.error = null;
      
      try {
        const params = {
          page: this.currentPage,
          limit: this.pageSize,
          ...this.filters
        };

        const response = await axios.get(
          `${process.env.VUE_APP_BACKEND_URL}/api/assignments`,
          { 
            params,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        this.assignments = response.data.assignments;
        this.filteredAssignments = response.data.assignments;
        this.totalPages = response.data.totalPages;
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired or invalid
          this.modalMessage = "תוקף ההרשאה פג, נא להיכנס מחדש";
          this.modalTitle = "שגיאת הרשאה";
          this.showSignOutModal = true;
        } else {
          this.error = err.response?.data?.message || 'שגיאה בטעינת המשימות';
        }
        console.error('Error fetching assignments:', err);
      } finally {
        this.loading = false;
      }
    },

    async filterAssignments() {
      this.currentPage = 1;
      await this.fetchAssignments();
    },

    debouncedFilter() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.filterAssignments();
      }, 500);
    },

    extractAvailableSteps() {
      const steps = new Set();
      this.assignments.forEach(assignment => {
        if (assignment.Step) {
          steps.add(assignment.Step);
        }
      });
      this.availableSteps = Array.from(steps).sort();
    },

    clearFilters() {
      this.filters = {
        search: '',
        step: '',
        status: '',
        comments: ''
      };
      this.currentPage = 1;
      this.fetchAssignments();
    },

    getStatusText(status) {
      const statusMap = {
        'pending': 'ממתין',
        'in-progress': 'בתהליך',
        'completed': 'הושלם'
      };
      return statusMap[status] || status || 'ממתין';
    },
    goToComments(ass){
      this.$router.push({ name: 'AssigmentComments', params: { id: ass._id } });
    }
  },
  watch: {
    currentPage() {
      this.fetchAssignments();
    }
  },
  components: {
    PopUpModal,
  }
};
</script>

<style scoped>
.assignments-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  direction: rtl;
  text-align: right;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 30px;
  align-self: center;
  display: flex;
  flex-direction: column;
}

.header h1 {
  align-self: center;
  color: #333;
  margin-bottom: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: end;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 150px;
}

.filter-group label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.filter-group input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: right;
  direction: rtl;
}

.filter-group input::placeholder {
  text-align: right;
  direction: rtl;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 18px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  height: fit-content;
  font-family: inherit;
}

.clear-btn:hover {
  background: #5a6268;
}

.loading, .error, .no-results {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #dc3545;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  font-family: inherit;
}

.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.assignment-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: right;
  direction: rtl;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.assignment-card.ongoing {
  border-right: 4px solid #ffc107;
}

.assignment-card.day-of {
  border-right: 4px solid #dc3545;
}

.assignment-card.completed {
  border-right: 4px solid #28a745;
  opacity: 0.8;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
  flex-direction: row-reverse;
}

.assignment-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  text-align: right;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.pending {
  background: #ffc107;
  color: #000;
}

.status-badge.in-progress {
  background: #007bff;
  color: white;
}

.status-badge.completed {
  background: #28a745;
  color: white;
}

.assignment-details p {
  margin: 8px 0;
  color: #666;
  font-size: 14px;
  text-align: right;
}

.assignment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 15px 0;
  justify-content: flex-end;
}

.tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag.ongoing {
  background: #fff3cd;
  color: #856404;
}

.tag.day-of {
  background: #f8d7da;
  color: #721c24;
}

.tag.type {
  background: #e9ecef;
  color: #495057;
}

.comments-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

.comments-count {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comments-count:hover .commments-link{
  border-bottom: 1px solid #666;
  transform: 1s all;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  direction: ltr;
}

.page-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
}

.page-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: unset;
  }
  
  .assignments-grid {
    grid-template-columns: 1fr;
  }
  
  .assignment-header {
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
}

/* Hebrew font support */
* {
  font-family: -webkit-pictograph, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>