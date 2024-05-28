<template>
    <div class="container">
      <div class="controls">
        <div class="buttons">
          <button @click="previousActivity">Previous</button>
          <button @click="nextActivity">Next</button>
          <button @click="pauseTimer">Pause</button>
          <button @click="resumeTimer">Resume</button>
          <button @click="restartTimer">Restart</button>
          <button @click="add30Seconds">Add 30 seconds</button>
          <button @click="remove30Seconds">Remove 30 seconds</button>
        </div>
        <h2>Activity Queue</h2>
        <draggable v-model="activities" @end="onReorder" class="draggable-list" item-key="name">
          <template #item="{ element, index }">
            <div :class="['activity-item', { active: index === currentIndex }]" @dblclick="setCurrentActivity(index)">
              <input v-model="element.name" @change="updateActivities" />
              <input v-model.number="element.duration" type="number" @change="updateActivities" />
              <button @click="removeActivity(index)">Remove</button>
            </div>
          </template>
        </draggable>
        <input v-model="newActivityName" placeholder="New Activity Name" />
        <input v-model.number="newActivityDuration" type="number" placeholder="Duration (seconds)" />
        <button @click="addActivity">Add Activity</button>
      </div>
      <div class="preview">
        <h2>Live Preview</h2>
        <iframe src="http://localhost:3000/display.html" width="100%" height="500px"></iframe>
      </div>
    </div>
  </template>
  
  <script>
  import draggable from 'vuedraggable';
  
  export default {
    components: {
      draggable,
    },
    data() {
      return {
        currentDuration: 300, // Default 5 minutes
        newActivityName: '',
        newActivityDuration: 60, // Default 1 minute
        activities: [],
        ws: null,
        startTime: Date.now(),
        currentIndex: 0,
        timerPaused: false,
      };
    },
    created() {
      this.ws = new WebSocket('ws://localhost:3000');
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
      };
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.currentDuration = data.currentDuration;
        this.activities = data.activities || [];
        this.startTime = data.startTime;
        this.currentIndex = data.currentIndex !== undefined ? data.currentIndex : 0;
      };
    },
    methods: {
      updateActivities() {
        const message = JSON.stringify({
          activities: this.activities,
          currentIndex: this.currentIndex
        });
        this.ws.send(message);
      },
      addActivity() {
        this.activities.push({
          name: this.newActivityName,
          duration: this.newActivityDuration,
        });
        this.newActivityName = '';
        this.newActivityDuration = 60;
        this.updateActivities();
      },
      removeActivity(index) {
        if (index < this.currentIndex) {
          this.currentIndex -= 1;
        }
        this.activities.splice(index, 1);
        this.updateActivities();
      },
      nextActivity() {
        if (this.currentIndex < this.activities.length - 1) {
          this.currentIndex += 1;
          this.currentDuration = this.activities[this.currentIndex].duration;
          this.startTime = Date.now();
          this.updateActivitiesWithTimer();
        }
      },
      previousActivity() {
        if (this.currentIndex > 0) {
          this.currentIndex -= 1;
          this.currentDuration = this.activities[this.currentIndex].duration;
          this.startTime = Date.now();
          this.updateActivitiesWithTimer();
        }
      },
      add30Seconds() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.currentDuration -= elapsed; // adjust current duration to remaining time
        this.currentDuration += 30;
        this.startTime = Date.now(); // reset the start time
        this.updateActivitiesWithTimer();
      },
      remove30Seconds() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.currentDuration -= elapsed; // adjust current duration to remaining time
        this.currentDuration = Math.max(0, this.currentDuration - 30); // Prevent negative duration
        this.startTime = Date.now(); // reset the start time
        this.updateActivitiesWithTimer();
      },
      pauseTimer() {
        this.timerPaused = true;
      },
      resumeTimer() {
        this.timerPaused = false;
        this.startTime = Date.now();
        this.updateActivitiesWithTimer();
      },
      restartTimer() {
        this.currentDuration = this.activities[this.currentIndex].duration;
        this.startTime = Date.now();
        this.updateActivitiesWithTimer();
      },
      updateActivitiesWithTimer() {
        const message = JSON.stringify({
          currentDuration: this.currentDuration,
          activities: this.activities,
          startTime: Date.now(),
          currentIndex: this.currentIndex,
          timerPaused: this.timerPaused,
        });
        this.ws.send(message);
      },
      setCurrentActivity(index) {
        this.currentIndex = index;
        this.currentDuration = this.activities[this.currentIndex].duration;
        this.startTime = Date.now();
        this.updateActivitiesWithTimer();
      },
      onReorder() {
        // Only update activities without affecting the timer
        const message = JSON.stringify({
          activities: this.activities,
          currentIndex: this.currentIndex
        });
        this.ws.send(message);
      }
    },
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
  }
  .controls {
    flex: 1;
    margin-right: 20px;
  }
  .preview {
    flex: 1;
  }
  input, button {
    display: block;
    margin-bottom: 10px;
    padding: 10px;
    font-size: 1em;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }
  button {
    padding: 10px 20px;
    font-size: 1em;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  button:hover {
    background-color: #45a049;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  .draggable-list {
    display: flex;
    flex-direction: column;
  }
  .activity-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
  }
  .activity-item.active {
    border-color: #4CAF50;
    background-color: #e0f7fa;
  }
  .activity-item input {
    flex: 1;
    margin-right: 10px;
    padding: 10px;
  }
  .activity-item button {
    padding: 5px 10px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  .activity-item button:hover {
    background-color: #e53935;
  }
  iframe {
    border: 1px solid #ccc;
  }
  </style>
  