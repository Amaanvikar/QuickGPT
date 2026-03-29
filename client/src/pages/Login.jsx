import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../api/client.js'
import { useAppContext } from '../context/AppContext.jsx'

const Login = () => {
  const { fetchUser } = useAppContext()
  const navigate = useNavigate()

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
      const url =
        state === 'register' ? '/api/user/register' : '/api/user/login'
      const body =
        state === 'register'
          ? { name, email, password }
          : { email, password }
      const { data } = await api.post(url, body)
      if (data.success && data.token) {
        localStorage.setItem('token', data.token)
        await fetchUser()
        toast.success(state === 'register' ? 'Account created' : 'Welcome back')
        navigate('/', { replace: true })
      } else {
        toast.error(data.message || 'Something went wrong')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Network error — is the server running?'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white">
      <p className="text-2xl font-medium m-auto">
        <span className="text-indigo-500">User</span> {state === "login" ? "Login" : "Sign Up"}
      </p>
      {state === "register" && (
        <div className="w-full">
          <p>Name</p>
          <input onChange={(e) => setName(e.target.value)} value={name} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="text" required />
        </div>
      )}
      <div className="w-full ">
        <p>Email</p>
        <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="email" required />
      </div>
      <div className="w-full ">
        <p>Password</p>
        <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="type here" className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500" type="password" required />
      </div>
      {state === "register" ? (
        <p>
          Already have account? <span onClick={() => setState("login")} className="text-indigo-500 cursor-pointer">click here</span>
        </p>
      ) : (
        <p>
          Create an account? <span onClick={() => setState("register")} className="text-indigo-500 cursor-pointer">click here</span>
        </p>
      )}
      <button disabled={loading} type='submit' className="bg-indigo-500 hover:bg-indigo-600 transition-all text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-60">
        {loading ? 'Please wait…' : state === "register" ? "Create Account" : "Login"}
      </button>
    </form>
  )
}

export default Login