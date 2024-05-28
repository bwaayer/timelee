<template>
    <div>
      <h2>Current Activity</h2>
      <input v-model="currentActivity" placeholder="Current Activity Name" />
      <input v-model.number="currentDuration" type="number" placeholder="Duration (seconds)" />
      <h2>Next Activity</h2>
      <input v-model="nextActivity" placeholder="Next Activity Name" />
      <button @click="updateActivities">Update Activities</button>
      <button @click="advanceActivity">Advance to Next Activity</button>
  
      <h2>Activity Queue</h2>
      <ul>
        <li v-for="(activity, index) in activities" :key="index">
          {{ activity.name }} - {{ activity.duration }} seconds
          <button @click="removeActivity(index)">Remove</button>
        </li>
      </ul>
      <input v-model="newActivityName" placeholder="New Activity Name" />
      <input v-model.number="newActivityDuration" type="number" placeholder="Duration (seconds)" />
      <button @click="addActivity">Add Activity</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        currentActivity: '',
        currentDuration: 300, // Default 5 minutes
        nextActivity: '',
        newActivityName: '',
        newActivityDuration: 60, // Default 1 minute
        activities: [],
        ws: null,
      };
    },
    created() {
      this.ws = new WebSocket('ws://localhost:3000');
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
      };
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.currentActivity = data.currentActivity;
        this.currentDuration = data.currentDuration;
        this.nextActivity = data.nextActivity;
        this.activities = data.activities || [];
      };
    },
    methods: {
      updateActivities() {
        const message = JSON.stringify({
          currentActivity: this.currentActivity,
          currentDuration: this.currentDuration,
          nextActivity: this.nextActivity,
          activities: this.activities,
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
        this.activities.splice(index, 1);
        this.updateActivities();
      },
      advanceActivity() {
        if (this.activities.length > 0) {
          const next = this.activities.shift();
          this.currentActivity = next.name;
          this.currentDuration = next.duration;
          this.nextActivity = this.activities.length > 0 ? this.activities[0].name : '';
          this.updateActivities();
        }
      },
    },
  };
  </script>
  
  <style scoped>
  input {
    display: block;
    margin-bottom: 10px;
    padding: 10px;
    font-size: 1em;
  }
  button {
    padding: 10px 20px;
    font-size: 1em;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
  }
  button:hover {
    background-color: #45a049;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin-bottom: 10px;
  }
  </style>
  