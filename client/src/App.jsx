import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import SetupPage from './pages/SetupPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<SetupPage />} />
      </Route>
    </Routes>
  );
}

export default App;

