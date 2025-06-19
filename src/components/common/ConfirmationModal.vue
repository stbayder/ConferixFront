<template>
  <div :class="['modal-overlay', isMobile ? 'mobile' : null]">
    <div class="Modal modal-warning">
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>
      <div class="modal-body">
        <div class="warning-icon">⚠️</div>
        <h3>{{ message }}</h3>   
        <div class="modal-button-wrapper">
          <button @click="confirmAction" class="confirm-btn">כן</button>
          <button @click="closeModal" class="cancel-btn">לא</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'אישור פעולה'
    },
    message: {
      type: String,
      default: 'האם אתה בטוח שברצונך לבצע פעולה זו?'
    }
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
    confirmAction() {
      this.$emit('confirm');
    },
    detectScreen() {
      this.isMobile = window.innerWidth < 768; 
    },
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
  position: absolute;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 20vw;
  min-width: 300px;
}

.modal-warning {
  background-color: #fffbea;
  color: #975a16;
  border: 2px solid #f6ad55;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.modal-header h2 {
  margin: 0;
  color: #975a16;
  font-size: 1.2em;
}

.modal-body {
  padding: 10px 0;
  text-align: center;
}

.warning-icon {
  font-size: 3em;
  margin-bottom: 15px;
}

.modal-body h3 {
  margin: 0 0 20px 0;
  line-height: 1.5;
  font-size: 1em;
  font-weight: normal;
}

.modal-button-wrapper {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.confirm-btn, .cancel-btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
  font-weight: bold;
}

.confirm-btn {
  background-color: #f44336;
  color: white;
}

.confirm-btn:hover {
  background-color: #da190b;
  transform: translateY(-1px);
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background-color: #545b62;
  transform: translateY(-1px);
}

.mobile > .Modal {
  width: 80vw;
  min-width: unset;
}
</style>