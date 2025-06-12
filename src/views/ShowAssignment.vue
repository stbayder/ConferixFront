<template>
  <div class="Container">
    <div class="details">
      <p id="Assignee">
        <img
          :src="require('@/assets/icons/manager-50.png')"
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
            Ass.Assignment.Status == 'Pending'
              ? 'red'
              : Ass.Assignment.Status == 'InProgress'
              ? 'yellow'
              : 'green',
          ]"
        ></div>
        <p>{{ transStatus(Ass.Assignment.Status) }}</p>
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

    <div class="title">
      <h2>
        {{ Ass.Assignment.Assignment }}
      </h2>
      <div class="date">
        <img :src="require('@/assets/icons/date-50.png')" alt="Date" class="icon" />
        <p>
          {{ formatDate(Ass.Assignment.ReccomendedStartDate) }} אולי תאריך סיום בכלל
          במקום?
        </p>
      </div>
    </div>
  </div>
  <!-- RecommendedStartDate -->

  <!-- Comments -->
  <!-- Step -->
  <!-- Estimated Time -->
</template>

<script>
import formatDate, { truncateName } from "@/utils/utilFuncs";
export default {
  name: "ShowAssignment",
  props: {
    Ass: Object,
    transStatus: Function,
  },
  methods: {
    toggleImportance() {
      this.$emit("toggleImportance");
    },
    formatDate,
    truncateName,
  },
};
</script>

<style scoped>
.Container {
  background-color: #2977ff;
  color: white;
  width: 30vw;
  height: 40vh;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title > h2 {
  margin: 0;
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

.date {
  width: fit-content;
  display: flex;
  justify-content: center;
  gap: 0.5vw;
  align-items: center;
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
</style>
