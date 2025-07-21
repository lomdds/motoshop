import Header from './containers/Header'
import Content from "./containers/Content"

import { AuthProvider } from './hooks/AuthContext';

import './styles/app.css'

function App() {
  return (
    <AuthProvider>
      <Header />
      <Content />
    </AuthProvider>
  );
};

export default App;