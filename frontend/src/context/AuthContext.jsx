import { createContext, useContext, useEffect, useState } from 'react'


const AuthContext =  createContext(null)

export function AuthProvider({children}) {
    const [user , setUser] = useState(null)
    const [loading, setLoading] = useState(true )



    // check if user already logged in 
    useEffect( () => {
        // define function 
        async function loadMe(){
            try {
                const res = await fetch("/api/me", {
                    credentials : 'include',
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
    }, [])


    async function signup({name, email, password}){

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
        return data 
    }



}