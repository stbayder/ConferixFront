<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }" v-if="comment">
    <div class="comment-header">
      <div class="comment-meta">
        <span class="comment-author">{{ getAuthorName() }}</span>
        <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
        <span v-if="comment.type " class="comment-type-badge" :class="`type-${comment.type}`">
          {{ getHebrewType(comment.type) }}
        </span>
        <span v-if="comment.updatedAt && comment.updatedAt !== comment.createdAt" class="edited-indicator">
          (נערך)
        </span>
      </div>
      
      <div class="comment-actions">
        <button 
          v-if="canEdit" 
          @click="$emit('edit', comment)"
          class="action-btn edit-btn"
          title="ערוך תגובה"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        
        <button 
          v-if="canDelete" 
          @click="$emit('delete', comment)"
          class="action-btn delete-btn"
          title="מחק תגובה"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2 0 0 1 -2,2H7a2,2 0 0 1 -2,-2V6m3,0V4a2,2 0 0 1 2,-2h4a2,2 0 0 1 2,2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="comment-content">
      <h4 v-if="comment.title" class="comment-title">{{ comment.title }}</h4>
      <div class="comment-text">{{ comment.text }}</div>
    </div>

    <div class="comment-footer">
      <div class="comment-engagement">
        <button 
          @click="toggleLike" 
          class="like-btn" 
          :class="{ 'liked': comment.hasLiked }"
          title="אהבתי"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 10l5 5 5-5"></path>
            <path d="M7 6l5 5 5-5"></path>
          </svg>
          <span class="like-count">{{ comment.likesCount || 0 }}</span>
        </button>
        
        <button 
          v-if="!isReply" 
          @click="$emit('reply', comment._id)"
          class="reply-btn"
          title="הגב לתגובה"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,17 4,12 9,7"></polyline>
            <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
          </svg>
          הגב
        </button>
      </div>
      
      <div v-if="comment.replies && comment.replies.length && !isReply" class="reply-count" @click="$emit('showReplies')">
        {{ comment.replies.length }} {{ comment.replies.length === 1 ? 'תגובה' : 'תגובות' }}
      </div>
    </div>
  </div>
</template>

<script>
import {getUsernameFromEmail} from "@/utils/utilFuncs"
export default {
  name: 'CommentItem',
  props: {
    comment: {
      type: Object,
      required: true
    },
    currentUser: {
      type: Object,
      required: true
    },
    isReply: {
      type: Boolean,
      default: false
    },
    userHasLiked:{
      type:Boolean,
      default:false
    }
  },
  emits: ['edit', 'delete', 'like', 'reply'],

  computed: {
    canEdit() {
      // User can edit their own comments
      const authorId = this.comment.AuthorId?._id || this.comment.authorId || this.comment.userId
      return authorId === this.currentUser.id
    },
    canDelete() {
      // User can delete their own comments
      const authorId = this.comment.AuthorId?._id || this.comment.authorId || this.comment.userId
      return authorId === this.currentUser.id
    }
  },
  methods: {
    getUsernameFromEmail,
    
    getAuthorName() {
      // Try multiple possible ways to get the author info
      let authorEmail = null
      
      // Check populated AuthorId object
      if (this.comment.AuthorId && typeof this.comment.AuthorId === 'object') {
        authorEmail = this.comment.AuthorId.Email || this.comment.AuthorId.email
      }
      
      // Check if AuthorId is just a string (not populated)
      if (!authorEmail && this.comment.authorId) {
        // You might want to store author info separately or fetch it
        authorEmail = this.comment.authorEmail // if you store it separately
      }
      
      // Fallback to other possible fields
      if (!authorEmail) {
        authorEmail = this.comment.userEmail || this.comment.email
      }
      
      if (authorEmail) {
        return this.getUsernameFromEmail(authorEmail) || 'אנונימי'
      }
      
      return 'אנונימי'
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      
      const date = new Date(dateString)
      const now = new Date()
      
      // Reset time to compare dates only
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const commentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      const diffTime = today - commentDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return 'היום'
      } else if (diffDays === 1) {
        return 'אתמול'
      } else if (diffDays < 7) {
        return `לפני ${diffDays} ימים`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `לפני ${weeks} ${weeks === 1 ? 'שבוע' : 'שבועות'}`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `לפני ${months} ${months === 1 ? 'חודש' : 'חודשים'}`
      } else {
        return date.toLocaleDateString('he-IL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    },
    
    toggleLike() {
      const increment = !this.userHasLiked
      this.$emit('like', this.comment, increment)
    },
    getHebrewType(type){
      if(type === 'suggestion'){
        return "הצעה"
      }
      if(type === "comment"){
        return "הערה"
      }
      if(type === "issue"){
        return "בעיה"
      }
      if(type === "question"){
        return "שאלה"
      }
    }
  }
}
</script>

<style scoped>
.comment-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  transition: box-shadow 0.2s ease;
  direction: rtl; /* RTL support for Hebrew */
}

.comment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-item.is-reply {
  background: #f8f9fa;
  border-right: 4px solid #007bff; /* Changed from border-left for RTL */
  margin-right: 0; /* Changed from margin-left for RTL */
  padding: 15px;
}

/* Comment Header */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.comment-author {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.comment-date {
  color: #6c757d;
  font-size: 12px;
}

.comment-type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-question {
  background: #e3f2fd;
  color: #1976d2;
}

.type-suggestion {
  background: #e8f5e8;
  color: #2e7d32;
}

.type-issue {
  background: #ffebee;
  color: #c62828;
}

.type-comment {
  background: #f3e5f5;
  color: #7b1fa2;
}

.edited-indicator {
  color: #6c757d;
  font-size: 11px;
  font-style: italic;
}

.comment-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.comment-item:hover .comment-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
}

.edit-btn {
  color: #007bff;
}

.edit-btn:hover {
  background: #e3f2fd;
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background: #ffebee;
}

/* Comment Content */
.comment-content {
  margin-bottom: 15px;
}

.comment-title {
  font-size: 16px;
  font-weight: 600;
  color: #212529;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.comment-text {
  color: #495057;
  line-height: 1.6;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Comment Footer */
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f3f4;
}

.comment-engagement {
  display: flex;
  gap: 16px;
  align-items: center;
}

.like-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.like-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.like-btn.liked {
  color: #007bff;
  background: #e3f2fd;
}

.like-btn.liked svg {
  transform: rotate(180deg);
}

.like-count {
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}

.reply-btn {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.reply-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.reply-count {
  color: #6c757d;
  font-size: 12px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .comment-item {
    padding: 15px;
  }
  
  .comment-item.is-reply {
    padding: 12px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .comment-actions {
    opacity: 1; /* Always show on mobile */
  }
  
  .comment-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .comment-meta {
    gap: 8px;
  }
  
  .comment-text {
    font-size: 13px;
  }
}

/* Animation for new comments */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.comment-item {
  animation: slideIn 0.3s ease-out;
}
</style>