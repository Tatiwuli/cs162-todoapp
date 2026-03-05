import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


const AuthContext =  createContext(null)

export function AuthProvider({children}) {

    const navigate = useNavigate()

    // user holds current logged in user
    const [user , setUser] = useState(null)
    const [loading, setLoading] = useState(true )



    // check if user already logged in 
    useEffect( () => {
        // define function 
        async function loadMe(){
            try {
                const res = await fetch("/api/me", {
                    credentials : 'include', // always send cookies in the request 
                })

                if (res.ok) { // if res return a 2xx code 
                    const data = await res.json() 
                    setUser(data)
                }
            } catch (err) {
                console.error('Failed to load current user', err)
            } finally {
                setLoading(false) // stop loading anyway
            }
        }
        // call function immediately 
        loadMe()
    }, []) // run it once when app mounts 


    async function signup(name, email, password){

        const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
    })
        //if not successful, not returning 2xx code 
        if (!res.ok){
            // catch the error and throw it after
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || "Signup failed")
        }
        const data = await res.json()
        setUser(data)
        navigate('/')
        return data 
    }

        async function login(email, password) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || 'Login failed')
        }
        const data = await res.json()
        setUser(data)
        navigate('/')
    }


    
    async function logout() {
        await fetch('/api/logout', { method: 'POST', credentials: 'include' })
        setUser(null)
        navigate('/login')
    }


    return (
        <AuthContext.Provider value = {{user, loading, login, signup, logout}}>
            {children}
        </AuthContext.Provider>
    )



}

// this make it easier to use the auth context: we just import useAuth.
export function useAuth(){
    return useContext(AuthContext)
}