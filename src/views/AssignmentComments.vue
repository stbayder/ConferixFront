<template>
  <div class="assignment-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>טוען משימה....</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchAssignment" class="retry-btn">נסה שוב</button>
    </div>

    <!-- Assignment Content -->
    <div v-else-if="assignment" class="assignment-content">
      <!-- Assignment Header -->
      <div class="assignment-header">
        <div class="assignment-meta">
          <span class="step-badge">{{ assignment.Step }}</span>
          <span class="status-badge" :class="`status-${assignment.Status}`">
            {{ assignment.Status }}
          </span>
        </div>
        <h1 class="assignment-title">{{ assignment.Assignment }}</h1>
        
        <div class="assignment-details">
          <div class="detail-item" v-if="assignment.EstimatedTime">
            <strong>זמן משוער:</strong> {{ assignment.EstimatedTime }} דק
          </div>
          <div class="detail-item" v-if="assignment.RecommendedStartOffset">
            <strong>ימים שכדאי להתחיל לפני הכנס:</strong> {{ assignment.RecommendedStartOffset }} ימים
          </div>
          <div class="detail-item" v-if="assignment.Type && assignment.Type.length">
            <strong>כנסים רלוונטים:</strong> {{ assignment.Type.join(', ') }}
          </div>
          <div class="detail-item">
            <strong>משימה מתמשכת?:</strong> {{ assignment.IsOngoing ? 'כן' : 'לא' }}
          </div>
          <div class="detail-item">
            <strong>משימה ליום הכנס:</strong> {{ assignment.IsDayOf ? 'כן' : 'לא' }}
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="comments-section">
        <div class="comments-header">
          <h2>תגובות ({{ commentCount }})</h2>
          <ButtonCompt 
            :clickFunc="() => showCommentForm =! showCommentForm"
            :buttonText=" showCommentForm ? 'ביטול' : 'הוסף תגובה' "
            :buttonStyle="['signup','small']"
          />
        </div>

        <!-- New Comment Form -->
        <div v-if="showCommentForm" class="comment-form">
          <h3>הוסף תגובה חדשה</h3>
          <input
            v-model="newComment.title"
            type="text"
            placeholder="כותרת"
            class="comment-title-input"
          />
          <textarea
            v-model="newComment.text"
            placeholder="תוכן התגובה"
            class="comment-text-input"
            rows="4"
          ></textarea>
          <select v-model="newComment.type" class="comment-type-select">
            <option value="comment">הערה</option>
            <option value="question">שאלה</option>
            <option value="suggestion">הצעה</option>
            <option value="issue">בעיה</option>
          </select>
          <div class="isAnonComment">
            <input type="checkbox" v-model="isAnonComment" id="isAnonComment">
            <label for="isAnonComment">תגובה אנונימית</label>
          </div>
          <div class="form-actions">
          <ButtonCompt 
            :clickFunc="submitComment"
            :disabled="!newComment.text.trim()"
            buttonText=" צור תגובה"
            :buttonStyle="['secondary','small','animate']"
          />

            <ButtonCompt 
            :clickFunc="cancelComment"
            buttonText=" ביטול"
            :buttonStyle="['signup','small','animate']"
          />
          </div>
        </div>

        <!-- Comments List -->
        <div class="comments-list">
          <div v-if="comments.length === 0" class="no-comments">
            אין תגובות עדיין, למה אתה מחכה? תהיה הראשון!
          </div>
          
          <div v-for="comment in paginatedTopLevelComments" :key="comment._id" class="comment-thread">
            <CommentItem
              :comment="comment"
              :current-user="currentUser"
              @edit="editComment"
              @delete="deleteComment"
              @like="toggleLike"
              @reply="showReplyForm"
              @showReplies="toggleShowReplies(comment._id)"
            />
            
            <!-- Replies -->
            <div v-if="comment.replies && comment.replies.length && comment.showReplies" class="replies-section" >
              <CommentItem
                v-for="reply in paginatedReplies(comment)"
                :key="reply._id"
                :comment="reply"
                :current-user="currentUser"
                :is-reply="true"
                :show-replies="true"
                @edit="editComment"
                @delete="deleteComment"
                @like="toggleLike"
              />
            <div class="reply-pagination" v-if="comment.replies && comment.replies.length > repliesPerPage">
              <button @click="prevReplyPage(comment._id)" :disabled="(replyPages[comment._id] || 1) === 1">קודם</button>
              <button @click="nextReplyPage(comment._id)" :disabled="(replyPages[comment._id] || 1) * repliesPerPage >= comment.replies.length">הבא</button>
            </div>
            </div>

            <!-- Reply Form -->
            <div v-if="replyingTo === comment._id" class="reply-form">
              <textarea
                v-model="replyText"
                placeholder="תוכן תגובה לתגובה..."
                class="reply-input"
                rows="3"
              ></textarea>
              <div class="isAnonComment">
                <input type="checkbox" v-model="isAnonComment" id="isAnonComment">
                <label for="isAnonComment">תגובה אנונימית</label>
              </div>
              <div class="form-actions">

                  <ButtonCompt 
                    :clickFunc="() => submitReply(comment._id)"
                    :disabled="!replyText.trim()"
                    buttonText="הגב"
                    :buttonStyle="['secondary','small','animate']"
                  />

                    <ButtonCompt 
                    :clickFunc="cancelReply"
                    buttonText=" ביטול"
                    :buttonStyle="['signup','small','animate']"
                  />
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Comments -->
        <div v-if="hasMoreComments" class="load-more">
          <button @click="loadMoreComments" :disabled="loadingComments" class="load-more-btn">
            {{ loadingComments ? 'Loading...' : 'Load More Comments' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Comment Modal -->
    <div v-if="editingComment" class="modal-overlay" @click="cancelEdit">
      <div class="modal" @click.stop>
        <h3>Edit Comment</h3>
        <input
          v-model="editForm.title"
          type="text"
          placeholder="Comment title (optional)"
          class="comment-title-input"
        />
        <textarea
          v-model="editForm.text"
          class="comment-text-input"
          rows="4"
        ></textarea>
        <select v-model="editForm.type" class="comment-type-select">
          <option value="comment">הערה</option>
          <option value="question">שאלה</option>
          <option value="suggestion">הצעה</option>
          <option value="issue">בעיה</option>
        </select>
        <div class="form-actions">
         <ButtonCompt 
            :clickFunc="saveEdit"
            buttonText="שמור שינויים"
            :disabled="!editForm.text.trim()"
            :buttonStyle="['secondary','small','animate']"
          />

          <ButtonCompt 
            :clickFunc="cancelEdit"
            buttonText=" ביטול"
            :buttonStyle="['signup','small','animate']"
          />
        </div>
      </div>
    </div>

    <div class="comment-pagination" v-if="commentCount > 0">
      <button @click="commentPage--" :disabled="commentPage === 1" class="page-btn">הקודם</button>
      <button @click="commentPage++" :disabled="commentPage * commentsPerPage >= topLevelComments.length" class="page-btn">הבא</button>
    </div>

  </div>
</template>

<script>
import CommentItem from '@/components/Projects/AssignmentCommentItem.vue'
import ButtonCompt from '@/components/common/ButtonCompt.vue'
export default {
  name: 'AssignmentDetail',
  components: {
    CommentItem,
    ButtonCompt
  },
  data() {
    return {
      assignment: null,
      comments: [],
      topLevelComments:[],
      loading: true,
      error: null,
      commentCount: 0,
      currentUser:JSON.parse(localStorage.getItem("userData")),
      assignmentId:this.$route.params.id,
      isAnonComment:false,
      authorId:null,
      commentPage: 1,
      commentsPerPage: 5,
      replyPages: {}, // { commentId: pageNumber }
      repliesPerPage: 3,
      
      // Comment form
      showCommentForm: false,
      newComment: {
        title: '',
        text: '',
        type: 'comment',
      },
      
      // Reply functionality
      replyingTo: null,
      replyText: '',
      
      // Edit functionality
      editingComment: null,
      editForm: {
        title: '',
        text: '',
        type: 'comment',
      },
      
      // Pagination
      currentPage: 1,
      hasMoreComments: false,
      loadingComments: false
    }
  },
  mounted() {
    this.fetchAssignment()
  },
  methods: {
    async fetchAssignment() {
      try {
        this.loading = true
        this.error = null
        
        // Build the URL with userId parameter if user is logged in
        let url = `${process.env.VUE_APP_BACKEND_URL}/api/assignments/${this.assignmentId}`
        if (this.currentUser && this.currentUser.id) {
          url += `?userId=${this.currentUser.id}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        this.assignment = data.assignment
        this.comments = data.comments || []
        this.topLevelComments = data.comments
          .filter(comment => comment.parentCommentId === null)
          .map(comment => ({
            ...comment,
            showReplies: false
          }));

        this.commentCount = this.topLevelComments.length || 0
      } catch (err) {
        this.error = `Failed to load assignment: ${err.message}`
        console.error('Error fetching assignment:', err)
      } finally {
        this.loading = false
      }
    },

    async submitComment() {
      try {
        if(!this.isAnonComment){
          this.authorId = this.currentUser.id
        }
        this.newComment.authorId = this.authorId
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/assignments/${this.assignmentId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(this.newComment)
        })

        if (!response.ok) {
          throw new Error('Failed to create comment')
        }

        const newComment = await response.json()
        
        // Add the new comment to the beginning of the list
        this.comments.unshift({
          ...newComment,
          replies: []
        })

        this.topLevelComments.unshift({
          ...newComment,
          replies: []
        })
        
        this.commentCount++
        this.cancelComment()
        
      } catch (err) {
        alert(`Error creating comment: ${err.message}`)
      }
    },

    cancelComment() {
      this.showCommentForm = false
      this.authorId = null
      this.newComment = {
        title: '',
        text: '',
        type: 'comment'
      }
    },

    showReplyForm(commentId) {
      this.replyingTo = commentId
      this.replyText = ''
    },

    async submitReply(parentCommentId) {
      try {
        let replyData = {
          title:null,
          text:this.replyText,
          type:'comment',
          authorId: this.isAnonComment ? null : this.currentUser.id,
          parentCommentId:parentCommentId

        }
        const response = await fetch(`${process.env.VUE_APP_BACKEND_URL}/api/assignments/${this.assignmentId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(replyData)
        })

        if (!response.ok) {
          throw new Error('Failed to create reply')
        }

        const newReply = await response.json()
        
        
        // Find the parent comment and add the reply
        const parentComment = this.paginatedTopLevelComments.find(c => c._id === parentCommentId)
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = []
          }
          parentComment.replies.push(newReply)
        }

        
        this.cancelReply()
        
      } catch (err) {
        alert(`Error creating reply: ${err.message}`)
      }
    },

    cancelReply() {
      this.replyingTo = null
      this.replyText = ''
      this.authorId = null
      this.isAnonComment = false
    },

    editComment(comment) {
      this.editingComment = comment
      this.editForm = {
        title: comment.title || '',
        text: comment.text,
        type: comment.type || 'comment'
      }
    },

    async saveEdit() {
      try {
        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_URL}/api/assignments/${this.assignmentId}/comments/${this.editingComment._id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}`
            },
            body: JSON.stringify(this.editForm)
          }
        )

        if (!response.ok) {
          throw new Error('Failed to update comment')
        }

        const updatedComment = await response.json()
        
        // Update the comment in the local state
        this.updateCommentInState(updatedComment)
        this.cancelEdit()
        
      } catch (err) {
        alert(`Error updating comment: ${err.message}`)
      }
    },

    cancelEdit() {
      this.editingComment = null
      this.editForm = {
        title: '',
        text: '',
        type: 'comment'
      }
    },

    async deleteComment(comment) {
      if (!confirm('Are you sure you want to delete this comment?')) {
        return
      }

      try {
        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_URL}/api/assignments/${this.assignmentId}/comments/${comment._id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.getAuthToken()}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to delete comment')
        }

        // Remove comment from local state
        this.removeCommentFromState(comment._id)
        this.commentCount--
        
      } catch (err) {
        alert(`Error deleting comment: ${err.message}`)
      }
    },

    async toggleLike(comment) {
      try {
        // Check if user is logged in
        if (!this.currentUser || !this.currentUser.id) {
          alert('You must be logged in to like comments');
          return;
        }

        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_URL}/api/assignments/${this.assignmentId}/comments/${comment._id}/like`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.getAuthToken()}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to toggle like')
        }

        const data = await response.json()
        this.updateCommentInState(data.comment)
        
        // Optional: Show a brief message
        // console.log(data.message) // "Comment liked" or "Comment unliked"
        
      } catch (err) {
        alert(`Error updating like: ${err.message}`)
      }
    },


    // updateCommentInState(updatedComment) {
    //   // Find and update comment in main comments array
    //   const commentIndex = this.comments.findIndex(c => c._id === updatedComment._id)
    //   if (commentIndex !== -1) {
    //     this.comments[commentIndex] = { ...this.comments[commentIndex], ...updatedComment }
    //     return
    //   }

    //   // Find and update in replies
    //   for (const comment of this.comments) {
    //     if (comment.replies) {
    //       const replyIndex = comment.replies.findIndex(r => r._id === updatedComment._id)
    //       if (replyIndex !== -1) {
    //         comment.replies[replyIndex] = { ...comment.replies[replyIndex], ...updatedComment }
    //         return
    //       }
    //     }
    //   }
    // },
    updateCommentInState(updatedComment) {
      // Update the comment in topLevelComments array
      const commentIndex = this.topLevelComments.findIndex(c => c._id === updatedComment._id);
      
      if (commentIndex !== -1) {
        // This is a top-level comment
        this.topLevelComments[commentIndex] = {
          ...this.topLevelComments[commentIndex],
          ...updatedComment,
          showReplies: this.topLevelComments[commentIndex].showReplies // preserve UI state
        };
      } else {
        // This might be a reply, find the parent comment
        for (let i = 0; i < this.topLevelComments.length; i++) {
          const comment = this.topLevelComments[i];
          if (comment.replies && comment.replies.length > 0) {
            const replyIndex = comment.replies.findIndex(r => r._id === updatedComment._id);
            if (replyIndex !== -1) {
              // Update the reply
              this.topLevelComments[i].replies[replyIndex] = updatedComment;
              break;
            }
          }
        }
      }
      
      // Also update the main comments array if you're using it elsewhere
      const mainCommentIndex = this.comments.findIndex(c => c._id === updatedComment._id);
      if (mainCommentIndex !== -1) {
        this.comments[mainCommentIndex] = updatedComment;
      }
    },
    toggleShowReplies(commentId) {
      // Find the comment in topLevelComments and toggle showReplies
      const comment = this.topLevelComments.find(c => c._id === commentId);
      if (comment) {
        comment.showReplies = !comment.showReplies;
        return;
      }

      // If not found in top level, search in replies (if needed)
      for (const topComment of this.topLevelComments) {
        if (topComment.replies) {
          const reply = topComment.replies.find(r => r._id === commentId);
          if (reply) {
            this.$set(reply, 'showReplies', !reply.showReplies);
            return;
          }
        }
      }
    },

    removeCommentFromState(commentId) {
      // Remove from main comments array
      this.comments = this.comments.filter(c => c._id !== commentId)
      this.topLevelComments = this.topLevelComments.filter(c=> c._id !== commentId)

      // Remove from replies
      for (const comment of this.comments) {
        if (comment.replies) {
          comment.replies = comment.replies.filter(r => r._id !== commentId)
        }
      }

      for (const comment of this.topLevelComments) {
        if (comment.replies) {
          comment.replies = comment.replies.filter(r => r._id !== commentId)
        }
      }
    },

    async loadMoreComments() {
      // Implementation for pagination
      this.loadingComments = true
      try {
        this.currentPage++
        const response = await fetch(
          `${process.env.VUE_APP_BACKEND_URL}/api/assignments/${this.assignmentId}/comments?page=${this.currentPage}`
        )
        const data = await response.json()
        
        this.comments.push(...data.comments)
        this.hasMoreComments = data.hasNextPage
        
      } catch (err) {
        console.error('Error loading more comments:', err)
      } finally {
        this.loadingComments = false
      }
    },

    getAuthToken() {
      // Mock implementation - replace with actual auth token retrieval
      return localStorage.getItem("token")
    },
      paginatedReplies(comment) {
      const page = this.replyPages[comment._id] || 1
      const start = (page - 1) * this.repliesPerPage
      const end = start + this.repliesPerPage
      return comment.replies?.slice(start, end) || []
    },
    nextReplyPage(commentId) {
      this.replyPages[commentId] = (this.replyPages[commentId] || 1) + 1
    },
    prevReplyPage(commentId) {
      if ((this.replyPages[commentId] || 1) > 1)
        this.replyPages[commentId]--
    }
  },
  computed: {
    paginatedTopLevelComments() {
      const start = (this.commentPage - 1) * this.commentsPerPage
      const end = start + this.commentsPerPage
      return this.topLevelComments.slice(start, end)
    }
  },

}
</script>

<style scoped>
.assignment-detail {
    direction: rtl;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Loading and Error States */
.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px;
  color: #dc3545;
}

.retry-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

/* Assignment Header */
.assignment-header {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.assignment-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.step-badge, .status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.step-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge {
  background: #f3e5f5;
  color: #7b1fa2;
}

.status-completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-in-progress {
  background: #fff3e0;
  color: #f57c00;
}

.assignment-title {
  font-size: 28px;
  font-weight: 700;
  color: #212529;
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.assignment-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.detail-item {
  font-size: 14px;
  color: #6c757d;
}

.detail-item strong {
  color: #495057;
}

/* Comments Section */
.comments-section {
  margin-top: 40px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.comments-header h2 {
  margin: 0;
  font-size: 24px;
  color: #212529;
}

.add-comment-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-comment-btn:hover {
  background: #0056b3;
}

/* Comment Form */
.comment-form, .reply-form {
    font-family: "Noto Sans Hebrew";
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #dee2e6;
}

.comment-form h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #495057;
}

.comment-title-input, .comment-text-input, .reply-input {
  width: 90%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
  resize: vertical;
  font-family: "Noto Sans Hebrew";
}

.comment-title-input:focus, 
.comment-text-input:focus, 
.reply-input:focus {
  outline: none;
  border-color: #B2C9CA;
  box-shadow: 0 0 0 2px #B2C9CA;
}

.comment-type-select {
  width: 8vw;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  margin-bottom: 15px;
  font-family: "Noto Sans Hebrew";
}

.form-actions {
  display: flex;
  gap: 10px;
}
.isAnonComment{
  display: flex;
  margin-bottom: 2vh;
}

.submit-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #5a6268;
}

/* Comments List */
.no-comments {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}

.comment-thread {
  margin-bottom: 20px;
}

.replies-section {
  margin-left: 40px;
  margin-top: 15px;
  padding-left: 20px;
  border-left: 3px solid #e9ecef;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #212529;
}

/* Load More */
.load-more {
  text-align: center;
  margin-top: 30px;
}

.load-more-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.load-more-btn:hover:not(:disabled) {
  background: #5a6268;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-pagination{
  display: flex;
  width: 10vw;
  justify-content: space-between;
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
.comment-back{
   width: 5vw;
  height:5vh;
}
/* Responsive Design */
@media (max-width: 768px) {
  .assignment-detail {
    padding: 15px;
  }
  
  .assignment-header {
    padding: 20px;
  }
  
  .assignment-title {
    font-size: 24px;
  }
  
  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .replies-section {
    margin-left: 20px;
  }
  
  .assignment-details {
    grid-template-columns: 1fr;
  }
}
</style>