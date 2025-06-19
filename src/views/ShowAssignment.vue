<template>
  <div class="Container">
    <button 
      class="delete-btn"
      @click="handleDeleteAssignment"
    >
      🗑️
      <span class="tooltip">מחק משימה</span>
    </button>
    <div class="details">
      <p id="Assignee">
        <img
          :src="require('@/assets/icons/icons8-businesswoman-50.png')"
          alt="אחראי"
          class="icon"
          @click="toggleImportance(ass)"
        />
        {{ Ass.Assignee || "לא הוגדר אחראי למשימה זו" }}
      </p>

      <div class="Status">
        <div
          :class="[
            'circle',
            Ass.Status == 'Pending'
              ? 'red'
              : Ass.Status == 'In Progress'
              ? 'yellow'
              : 'green',
          ]"
        ></div>
        <p @click="toggleStatus(Ass)">{{ transStatus(Ass.Status) }}</p>
      </div>

      <img
        :src="
          Ass.Important
            ? require('@/assets/icons/starred.png')
            : require('@/assets/icons/not_starred.png')
        "
        alt="important star"
        class="icon"
        id="star-icon"
        @click="toggleImportance(ass)"
      />
    </div>

    <div class="info">
      <h2 class="title">
        <img :src="stepIconMatch" alt="icon" class="stepIcon" />
        {{ Ass.Assignment.Assignment }}
      </h2>
      <div class="date">
        <img :src="require('@/assets/icons/icons8-date-100.png')" alt="Date" class="icon" />
        <p>
          {{ formatDate(Ass.Assignment.ReccomendedStartDate) }} 
        </p>
        <span class="tooltip">תאריך סיום מיועד</span>
      </div>
    </div>
    
    <div class="commentsContainer">
      <button 
        class="newCommentBtn"
        @click="handleCreateComment"
      >
        צור תגובה חדשה!
      </button>
      
      <div class="ContainerOfTheComments" v-if="showComments">
        <template v-for="comment in Comments.comments" :key="comment._id">
          <AssignmentComment 
            :Comment="comment" 
            :currentUser="User"
            :projectCreator="projectCreator"
            @edit-comment="handleEditComment"
            @delete-comment="handleDeleteComment"
            @view-full-comment="handleViewFullComment"
          />
        </template>
        
        <!-- Pagination Controls -->
        <div class="pagination-controls" v-if="Comments.totalPages > 1">
          <button 
            @click="previousPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            קודם
          </button>
          <span class="page-info">
            {{ currentPage }} / {{ Comments.totalPages }}
          </span>
          <button 
            @click="nextPage" 
            :disabled="currentPage === Comments.totalPages"
            class="pagination-btn"
          >
            הבא
          </button>
        </div>
      </div>
    </div>

    <!-- Comment View Modal -->
    <CommentViewModal
      v-if="showViewModal"
      :comment="selectedComment"
      @close="closeViewModal"
    />

    <!-- Comment Edit Modal (now used for both create and edit) -->
    <CommentEditModal
      v-if="showEditModal"
      :comment="selectedComment"
      :isCreating="isCreatingComment"
      @close="closeEditModal"
      @save="saveComment"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteModal"
      title="מחיקת תגובה"
      message="האם אתה בטוח שברצונך למחוק את התגובה?"
      @close="closeDeleteModal"
      @confirm="confirmDeleteComment"
    />

    <!-- Delete Assignment Confirmation Modal -->
    <ConfirmationModal
      v-if="showDeleteAssignmentModal"
      title="מחיקת משימה"
      message="האם אתה בטוח שברצונך למחוק את המשימה? פעולה זו לא ניתנת לביטול ותמחק גם את כל התגובות הקשורות למשימה."
      @close="closeDeleteAssignmentModal"
      @confirm="confirmDeleteAssignment"
    />
  </div>
</template>

<script>
import AssignmentComment from "@/components/Projects/AssignmentComment.vue";
import CommentViewModal from "@/components/Projects/CommentViewModal.vue";
import CommentEditModal from "@/components/Projects/CommentEditModal.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";
import formatDate, { truncateName } from "@/utils/utilFuncs";

export default {
  name: "ShowAssignment",
  data() {
    return {
      User: JSON.parse(localStorage.getItem("userData")),
      Comments: [],
      showComments: null,
      currentPage: 1,
      commentsPerPage: 3,
      // Modal states
      showViewModal: false,
      showEditModal: false,
      showDeleteModal: false,
      showDeleteAssignmentModal:false,
      selectedComment: null,
      commentToDelete: null,
      isCreatingComment: false
    }
  },
  props: {
    Ass: Object,
    transStatus: Function,
    stepIconMatch: Object,
    projectCreator: String, // Email of project creator
  },
  methods: {
    toggleImportance() {
      this.$emit("toggleImportance");
    },

    async addComment(content) {
      try {
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${this.Ass._id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Content: content,
            Author: this.Ass.Assignee ? this.Ass.Assignee : this.User.id
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add comment');
        }

        const updatedAssignment = await response.json();
        this.$emit('assignmentUpdated', updatedAssignment);
        
        return updatedAssignment;
      } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
      }
    },

    async editComment(commentId, newContent) {
      try {
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${this.Ass._id}/comments/${commentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            Content: newContent
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to edit comment');
        }

        const updatedAssignment = await response.json();
        return updatedAssignment;
      } catch (error) {
        console.error('Error editing comment:', error);
        throw error;
      }
    },

    async deleteComment(commentId) {
      try {
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${this.Ass._id}/comments/${commentId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete comment');
        }

        const updatedAssignment = await response.json();
        return updatedAssignment;
      } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
    },

    async getComments(page = 1) {
      try {
        const url = `${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${this.Ass._id}/comments?page=${page}&limit=${this.commentsPerPage}`;
        
        const response = await fetch(url);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to fetch comments');
        }

        const commentsData = await response.json();
        this.Comments = commentsData;
        
        if (this.Comments.total && this.Comments.total > 0) {
          this.showComments = true;
        }
        
        return commentsData;
      } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }
    },

    // Pagination methods
    async nextPage() {
      if (this.currentPage < this.Comments.totalPages) {
        this.currentPage++;
        await this.getComments(this.currentPage);
      }
    },

    async previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        await this.getComments(this.currentPage);
      }
    },

    // Comment handling methods
    handleCreateComment() {
      this.selectedComment = {
        Content: '', // Empty content for new comment
        _id: null, // No ID for new comment
        Author: {
          Email: this.User.email || this.User.Email || '',
          FirstName: this.User.firstName || this.User.FirstName || '',
          LastName: this.User.lastName || this.User.LastName || ''
        },
        CreatedAt: new Date().toISOString()
      };
      this.isCreatingComment = true;
      this.showEditModal = true;
    },

    handleViewFullComment(comment) {
      this.selectedComment = comment;
      this.showViewModal = true;
    },

    handleEditComment(comment) {
      this.selectedComment = comment;
      this.isCreatingComment = false;
      this.showEditModal = true;
    },

    handleDeleteComment(comment) {
      this.commentToDelete = comment;
      this.showDeleteModal = true;
    },

    async saveComment(commentId, content) {
      try {
        if (this.isCreatingComment) {
          // Creating new comment
          await this.addComment(content);
          this.$emit("showPopUpMessage", "תגובה נוספה למשימה", "הצלחה!", "success");
        } else {
          // Editing existing comment
          await this.editComment(commentId, content);
          this.$emit("showPopUpMessage", "תגובה עודכנה בהצלחה", "הצלחה!", "success");
        }
        
        await this.getComments(this.currentPage);
        this.closeEditModal();
      } catch (error) {
        const action = this.isCreatingComment ? 'add' : 'edit';
        alert(`Failed to ${action} comment: ` + error.message);
      }
    },

    async confirmDeleteComment() {
      try {
        await this.deleteComment(this.commentToDelete._id);
        await this.getComments(this.currentPage);
        this.closeDeleteModal();
        this.$emit("showPopUpMessage", "תגובה נמחקה בהצלחה", "הצלחה!", "success");
      } catch (error) {
        alert('Failed to delete comment: ' + error.message);
      }
    },
    
    async toggleStatus(Ass) {
      try {
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${Ass._id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${this.$store.state.token}`
          },
          body: JSON.stringify({
            Status: Ass.Status // Send the next status, not current status
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedAssignment = await response.json();
        
        // Emit the updated assignment to parent component
        this.$emit('updateAssignmentStatus', updatedAssignment);
        
        return updatedAssignment;
      } catch (error) {
        console.error('Error toggling status:', error);
        // Handle error (show notification, etc.)
        this.$emit("showPopUpMessage", "שגיאה בעדכון סטטוס המשימה", "שגיאה!", "error");
        throw error;
      }
    },
    // Modal methods
    closeViewModal() {
      this.showViewModal = false;
      this.selectedComment = null;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.selectedComment = null;
      this.isCreatingComment = false;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.commentToDelete = null;
    },

    async deleteAssignment() {
      try {
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/project-assignments/${this.Ass._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            UserID: this.User.id,
            token : localStorage.getItem('token')
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete assignment');
        }

        const result = await response.json();
        this.$emit("assignmentDeleted",this.Ass)
        return result;
      } catch (error) {
        console.error('Error deleting assignment:', error);
        throw error;
      }
    },

    handleDeleteAssignment() {
      this.showDeleteAssignmentModal = true;
    },

    async confirmDeleteAssignment() {
      try {
        await this.deleteAssignment();
        this.closeDeleteAssignmentModal();
        this.$emit("showPopUpMessage", "משימה נמחקה בהצלחה", "הצלחה!", "success");
        this.$emit("assignmentDeleted", this.Ass._id);
      } catch (error) {
        alert('Failed to delete assignment: ' + error.message);
      }
    },
    closeDeleteAssignmentModal(){
      this.showDeleteAssignmentModal = false;
    },
    formatDate,
    truncateName,
  },

  components: {
    AssignmentComment,
    CommentViewModal,
    CommentEditModal,
    ConfirmationModal,
  },

  mounted() {
    this.getComments(1);
  }
};
</script>

<style scoped>
.Container {
  background-color: #F2F0EF;
  color: #68808A ;
  width: 30vw;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info {
  font-size: 0.8em;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 1.3em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1vw;
}

#Assignee {
  display: flex;
  align-items: center;
  font-size: 0.8em;
}

#Assignee > .icon {
  width: 30px;
}

.Status {
  display: flex;
  align-items: center;
  gap: 0.5vw;
  cursor: pointer;
}

.details {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

#star-icon {
  cursor: pointer;
}

.icon {
  width: 2vw;
}

.stepIcon {
  width: 2vw;
}

.delete-btn{
  background-color:transparent ;
  border: none;
  position: relative;
  align-self:self-start;
  margin-right: 1vw;
  margin-top: 1vh;
  padding: 0;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.5);
  border-radius: 10px;
}
.date {
  width: fit-content;
  display: flex;
  justify-content: center;
  gap: 0.5vw;
  align-items: center;
  position: relative;
}

.circle {
  width: 1vw;
  height: 1vw;
  border-radius: 50%;
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

.commentsContainer {
  width: 80%;
  display: flex;
  flex-direction: column;
}

.ContainerOfTheComments {
  width: 100%;
}

.newCommentBtn {
  background-color: white;
  color: #68808A ;
  border: 1px solid #68808A ;
  border-radius: 15px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.newCommentBtn:hover {
  background-color: #B2C9CA;
  color: #F2F0EF;
  transform: translateY(-1px);
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.5rem;
}

.pagination-btn {
  background-color: white;
  color: #2977ff;
  border: 1px solid #2977ff;
  border-radius: 5px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #2977ff;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.8rem;
  font-weight: bold;
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

.delete-btn:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.date:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
</style>