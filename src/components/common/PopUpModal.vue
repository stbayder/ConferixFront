<template>
  <div :class="['modal-overlay', isMobile ? 'mobile' : null]">
    <div class="Modal" :class="modalTypeClass">
      <div class="modal-header">
        <h2>{{ title }}</h2>
      </div>
      <div class="modal-body">
        <h3>{{ message }}</h3>   
        <div class="modal-button-wrapper">
          <button @click="closeModal">Ok</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    message: String,
    type: {
      type: String,
      default: 'success', // or 'error', 'warning'
      validator: (value) => ['success', 'error', 'warning'].includes(value)
    }
  },
  data() {
    return {
      isMobile: null,
    };
  },
  computed: {
    modalTypeClass() {
      return {
        'modal-success': this.type === 'success',
        'modal-error': this.type === 'error',
        'modal-warning': this.type === 'warning',
      };
    }
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
}

/* Type-specific styles */
.modal-success {
  background-color: #e6f4ea;
  color: #276749;
}

.modal-error {
  background-color: #fdecea;
  color: #c53030;
}

.modal-warning {
  background-color: #fffbea;
  color: #975a16;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.modal-header h2 {
  margin: 0;
}

.modal-header button {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 10px 0;
}

.modal-body h3 {
  margin: 0;
}

.modal-body button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #2977ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.modal-body button:hover {
  background-color: #002668;
}

.mobile > .Modal {
  width: 50vw;
}

.modal-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

</style>
