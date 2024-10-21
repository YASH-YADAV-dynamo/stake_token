import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TokenStaking from './components/TokenStaking';
import Navbar from './components/Navbar';
import Airdrops from './components/Airdrops';
function App() {
  return (
    <Router>
      <div className="App bg-gray-100 min-h-screen">
        <Navbar />
        <div className="py-10">
          <Routes>
            <Route path="/" element={<TokenStaking />} />
            <Route path="/stake" element={<TokenStaking />} />
            <Route path="/airdrops" element={<Airdrops />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;