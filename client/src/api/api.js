import axios from "axios";

export const api = await axios.create({
  baseURL: 'http://localhost:5001/',
  headers:{
    "Content-Type": "application/json"
  }
})

api.interceptors.request.use(
  (config) =>{
    const token = localStorage.getItem('token')

    if(token){
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error)=>{
    return Promise.reject(error)
  }
)
