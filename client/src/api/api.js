import axios from "axios";

export const api = await axios.create({
  baseURL: 'http://localhost:5001/',
  headers:{
    "Content-Type": "application/json"
  }
})
