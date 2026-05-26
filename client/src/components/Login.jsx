import { useState } from "react";
import { api } from "../api/api";

function Login() {
  const [formData,setFormData] = useState({username: "", password: ""})

  const handleChange = (e) =>{
    const {name,value} = e.target
    setFormData({...formData, [name]: value})
  }

  const handleForm = async (e) =>{
    e.preventDefault()
    try {
      const response = await api.post('/login-user/login',formData)

      if(!formData.username || !formData.password){
        return alert(response.error.message)
      }

      alert(response.data.message)

      setFormData({username: "", password: ""})

    } catch (error) {
      alert(error.response?.data.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <form onSubmit={handleForm} className="bg-white rounded-xl shadow-sm border border-slate-200 p-9 w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6 text-center">Login</h1>

        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            placeholder="Password"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
