import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PublicLayout } from './components/layout/PublicLayout'
import LandingPage from './pages/public/LandingPage'
import { Toaster } from "@/components/ui/sonner"
import NotFound from './pages/NotFound'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
