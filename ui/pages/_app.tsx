import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Header from '../components/Header'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Pages that should not show the header
  const noHeaderPages = ['/', '/auth']
  const showHeader = !noHeaderPages.includes(router.pathname)

  if (!showHeader) {
    return <Component {...pageProps} />
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Component {...pageProps} />
      </main>
    </div>
  )
}
export default MyApp
