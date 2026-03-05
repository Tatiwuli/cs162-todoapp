import Board from '../components/Board/Board'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { logout } = useAuth()

  return (
    <>
      <button onClick={logout}>Logout</button>
      <Board />
    </>
  )
}
