import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages will be added step by step
// Member 3 - Hotels & Accommodation

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Placeholder - routes will be added in Step 8 */}
        <Route path="/" element={<div style={{padding:'2rem'}}><h1>TravelLanka AI</h1><p>Hotels module loading...</p></div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
