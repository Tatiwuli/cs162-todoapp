import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


export default function Login(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const {login} = useAuth()


    async function handleSubmit(event){

        // Prevent browser from reloading the page ( because it removes React state) when submit event occurs.
        event.preventDefault()
        setError(null)
        setLoading(true)
        try{
            await login(email,password)
        }catch (err){
            setError(err.message)
        } finally {
            setLoading(false)
        }

}

       return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />

            {/* disable the button when loading is true */}
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </form>
    )
}
