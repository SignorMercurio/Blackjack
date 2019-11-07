import Vue from 'vue'
import axios from 'axios'

Vue.prototype.$axios = axios.create({
  baseURL: 'http://localhost:8080/deck/',
  timeout: 2000
})
