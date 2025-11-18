import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import LiveCall from './pages/LiveCall';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="bg-black min-h-screen text-white font-sans antialiased selection:bg-cyan-500 selection:text-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/live" element={<LiveCall />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;