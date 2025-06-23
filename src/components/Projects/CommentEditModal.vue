<template>
  <div :class="['modal-overlay', isMobile ? 'mobile' : null]">
    <div class="Modal">
      <div class="modal-header">
        <h2>ערוך תגובה</h2>
        <button @click="closeModal" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="comment-info">
          <div class="author-info">
            <strong>{{ getUsernameFromEmail(comment.Author.Email) }}</strong>
            <span class="comment-date">{{ formatDate(comment.UpdatedAt) }}</span>
          </div>
        </div>
        <div class="edit-section">
          <label for="comment-edit" class="edit-label">תוכן התגובה:</label>
          <textarea
            id="comment-edit"
            v-model="editedContent"
            class="comment-textarea"
            placeholder="הכנס את תוכן התגובה..."
            rows="6"
          ></textarea>
        </div>
        <div class="modal-button-wrapper">
          <button @click="saveChanges" class="save-btn" :disabled="!editedContent.trim()">
            שמור שינויים
          </button>
          <button @click="closeModal" class="cancel-btn">
            ביטול
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import formatDate from "../../utils/utilFuncs";
import getUsernameFromEmail from "@/utils/utilFuncs"
export default {
  props: {
    comment: Object
  },
  data() {
    return {
      isMobile: null,
      editedContent: ''
    };
  },
  mounted() {
    this.detectScreen();
    this.editedContent = this.comment.Content;
  },
  methods: {
    getUsernameFromEmail,
    closeModal() {
      this.$emit('close');
    },
    detectScreen() {
      this.isMobile = window.innerWidth < 768; 
    },
    formatDate,
    saveChanges() {
      if (this.editedContent.trim()) {
        this.$emit('save', this.comment._id, this.editedContent.trim());
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  font-family: "Noto Sans Hebrew";
  position: fixed;
  z-index: 6;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  direction: rtl;
}

.Modal {
  position: relative;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 30vw;
  max-width: 600px;
  background-color: white;
  color: #333;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.modal-header h2 {
  margin: 0;
  color:#68808A;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 10px 0;
}

.comment-info {
  margin-bottom: 20px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-info strong {
  color:#68808A ;
  font-size: 1.1em;
}

.comment-date {
  font-size: 0.8em;
  color: #666;
}

.edit-section {
  margin-bottom: 20px;
}

.edit-label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.comment-textarea {
  width: 90%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  direction: rtl;
}

.comment-textarea:focus {
  outline: none;
  border-color: #68808A;
}

.comment-textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.modal-button-wrapper {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.save-btn, .cancel-btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 100px;
}

.save-btn {
  background-color: #4CAF50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #da190b;
}

.mobile > .Modal {
  width: 90vw;
  max-width: none;
}
</style>