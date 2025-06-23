<template>
  <div class="container">
    <div class="top">
      <p class="Email">{{ getUsernameFromEmail(Comment.Author.Email) }}</p>
      <p class="commentUpdatedAt">{{ formatDate(Comment.UpdatedAt) }}</p>
      
      <!-- Action buttons - only show if user can edit/delete -->
      <div class="action-buttons" v-if="canUserModifyComment">
        <button @click="editComment" class="action-btn edit-btn" title="ערוך תגובה">
          ✏️
        </button>
        <button @click="deleteComment" class="action-btn delete-btn" title="מחק תגובה">
          🗑️
        </button>
      </div>
    </div>
    
    <div class="comment-content-wrapper">
      <p class="commentContent" v-if="!isLongComment">
        {{ Comment.Content }}
      </p>
      
      <!-- Truncated content with "Read More" for long comments -->
      <div v-else>
        <p class="commentContent">
          {{ truncatedContent }}
        </p>
        <button @click="viewFullComment" class="read-more-btn">
          קרא עוד...
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import formatDate from "../../utils/utilFuncs";

export default {
  props: {
    Comment: Object,
    currentUser: Object,
    projectCreator: String // Email of project creator
  },
  computed: {
    canUserModifyComment() {
      if (!this.currentUser) return false;
      
      // User can modify if they are the author or the project creator
      return (
        this.Comment.Author.Email === this.currentUser.email ||
        this.currentUser.email === this.projectCreator
      );
    },
    
    isLongComment() {
      return this.Comment.Content && this.Comment.Content.length > 100;
    },
    
    truncatedContent() {
      if (!this.isLongComment) return this.Comment.Content;
      return this.Comment.Content.substring(0, 100) + '...';
    }
  },
  methods: {
    getUsernameFromEmail(email) {
      return email.split("@")[0];
    },
    
    formatDate,
    
    editComment() {
      this.$emit('edit-comment', this.Comment);
    },
    
    deleteComment() {
      this.$emit('delete-comment', this.Comment);
    },
    
    viewFullComment() {
      this.$emit('view-full-comment', this.Comment);
    }
  },
  mounted(){
    console.log(this.Comment)
  }
}   
</script>

<style scoped>
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-size: 0.9em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.commentUpdatedAt {
  margin: 0;
  font-size: 0.6em;
  height: fit-content;
  margin-top: auto;
  color: #68808A;
}

.commentContent {
  margin-top: 1vh;
  margin-bottom: 0;
  font-size: 0.8em;
  line-height: 1.4;
  /* Text wrapping properties */
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  max-width: 100%;
  box-sizing: border-box;
}

.comment-content-wrapper {
  width: 100%;
  overflow: hidden;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
}

.Email {
  font-family: "Varela Round";
  font-weight: 600;
  margin-bottom: 0;
  margin-left: 0.5vw;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
}

.action-btn {
    background-color:transparent;
  border: none;
  border-radius: 3px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.3s;
  color: white;
}

.action-btn:hover {
  transform: scale(1.05);
}

.edit-btn:hover {
  background: rgba(76, 175, 80, 0.6);
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.5);
}

.read-more-btn {
  background: none;
  border: none;
  color: #68808A;
  cursor: pointer;
  font-size: 0.7em;
  text-decoration: underline;
  padding: 0;
  margin-top: 0.25rem;
  transition: color 0.3s;
}

.read-more-btn:hover {
  color: #B2C9CA;
}
</style>