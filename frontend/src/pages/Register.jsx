import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Signup() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const { signup } = useAuth()

    async function handleSubmit(event) {
        event.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await signup(name, email, password)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <form onSubmit={handleSubmit} style={styles.card}>
                <h2 style={styles.title}>Create an account</h2>
                <p style={styles.subtitle}>Sign up to get started</p>

                {error && <p style={styles.error}>{error}</p>}

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />

                <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                </button>

                <p style={styles.footer}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
                </p>
            </form>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
    },
    card: {
        backgroundColor: '#fff',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        margin: 0,
        fontSize: '1.6rem',
        color: '#1a1a1a',
    },
    subtitle: {
        margin: 0,
        color: '#666',
        fontSize: '0.9rem',
    },
    error: {
        color: '#e53e3e',
        backgroundColor: '#fff5f5',
        border: '1px solid #fed7d7',
        borderRadius: '6px',
        padding: '0.6rem 1rem',
        fontSize: '0.9rem',
        margin: 0,
    },
    input: {
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    button: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#4f46e5',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    footer: {
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#555',
        margin: 0,
    },
    link: {
        color: '#4f46e5',
        textDecoration: 'none',
        fontWeight: '600',
    },
}
