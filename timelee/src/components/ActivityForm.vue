<template>
    <div>
      <h2>Current Activity</h2>
      <input v-model="currentActivity" placeholder="Current Activity Name" />
      <input v-model.number="currentDuration" type="number" placeholder="Duration (seconds)" />
      <h2>Next Activity</h2>
      <input v-model="nextActivity" placeholder="Next Activity Name" />
      <button @click="updateActivities">Update Activities</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        currentActivity: '',
        currentDuration: 300, // Default 5 minutes
        nextActivity: '',
        ws: null,
      };
    },
    created() {
      this.ws = new WebSocket('ws://localhost:3000');
      this.ws.onopen = () => {
        console.log('WebSocket connection established');
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.currentActivity = data.currentActivity;
          this.currentDuration = data.currentDuration;
          this.nextActivity = data.nextActivity;
        } catch (e) {
          console.error('Invalid JSON received:', event.data);
        }
      };
    },
    methods: {
      updateActivities() {
        const message = JSON.stringify({
          currentActivity: this.currentActivity,
          currentDuration: this.currentDuration,
          nextActivity: this.nextActivity,
        });
        console.log('Sending message:', message);
        this.ws.send(message);
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
  }
  button:hover {
    background-color: #45a049;
  }
  </style>
  