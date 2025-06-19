<template>
  <div :class="['modal-overlay', isMobile ? 'mobile' : null]">
    <div class="Modal">
      <div class="modal-header">
        <h2>תגובה מלאה</h2>
        <button @click="closeModal" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="comment-info">
          <div class="author-info">
            <strong>{{ getUsernameFromEmail(comment.Author.Email) }}</strong>
            <span class="comment-date">{{ formatDate(comment.UpdatedAt) }}</span>
          </div>
        </div>
        <div class="comment-content">
          <p>{{ comment.Content }}</p>
        </div>
        <div class="modal-button-wrapper">
          <button @click="closeModal" class="ok-btn">סגור</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import formatDate from "../../utils/utilFuncs";

export default {
  props: {
    comment: Object
  },
  data() {
    return {
      isMobile: null,
    };
  },
  mounted() {
    this.detectScreen();
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    detectScreen() {
      this.isMobile = window.innerWidth < 768; 
    },
    getUsernameFromEmail(email) {
      return email.split("@")[0];
    },
    formatDate
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
  width: 25vw;
  max-width: 500px;
  background-color: white;
  color: #333;
  max-height: 70vh;
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
  color: #68808A;
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
  margin-bottom: 15px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-info strong {
  color: #68808A;
  font-size: 1.1em;
}

.comment-date {
  font-size: 0.8em;
  color: #666;
}

.comment-content {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #68808A;
  margin-bottom: 20px;
}

.comment-content p {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.ok-btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #B2C9CA;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  min-width: 80px;
}

.ok-btn:hover {
  background-color: #68808A;
}

.mobile > .Modal {
  width: 90vw;
  max-width: none;
}
</style>