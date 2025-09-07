import Header from './containers/Header'
import Content from "./containers/Content"

import { useState, useCallback } from 'react';

import { AuthProvider } from './hooks/AuthContext';

import './styles/app.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const getProductsByQuery = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return (
    <AuthProvider>
      <Header onSearch={getProductsByQuery}/>
      <Content searchQuery={searchQuery}/>
    </AuthProvider>
  );
};

export default App;