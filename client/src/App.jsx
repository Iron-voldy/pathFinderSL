import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages
import Home from './pages/Home'
import Hotels from './pages/Hotels'
import HotelDetail from './pages/HotelDetail'

// Admin Pages
import AdminHotels from './pages/admin/hotels/AdminHotels'
import AdminAddHotel from './pages/admin/hotels/AdminAddHotel'
import AdminEditHotel from './pages/admin/hotels/AdminEditHotel'

// Shared Components
import ChatBot from './components/shared/ChatBot'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dev/hotels" element={<AdminHotels />} />
        <Route path="/admin/dev/hotels/add" element={<AdminAddHotel />} />
        <Route path="/admin/dev/hotels/edit/:id" element={<AdminEditHotel />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={
          <div style={{padding:'4rem 2rem', textAlign:'center'}}>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" style={{color:'#ff6b35', fontWeight:'600'}}>Go Home</a>
          </div>
        } />
      </Routes>
      <ChatBot />
    </BrowserRouter>
  )
}

export default App
