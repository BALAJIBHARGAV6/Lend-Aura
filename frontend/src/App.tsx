import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from './contexts/WalletContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LendPage from './pages/LendPage';
import BorrowPage from './pages/BorrowPage';
import PortfolioPage from './pages/PortfolioPage';
import AuctionsPage from './pages/AuctionsPage';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (new property name in newer versions)
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ToastProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="min-h-screen bg-white">
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/lend" element={<LendPage />} />
                  <Route path="/borrow" element={<BorrowPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/auctions" element={<AuctionsPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Layout>
            </div>
          </Router>
        </ToastProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
