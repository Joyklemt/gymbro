import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import LogWorkout from './pages/LogWorkout';
import History from './pages/History';
import Exercises from './pages/Exercises';
import Statistics from './pages/Statistics';

/**
 * Main App component with routing
 * Sets up all routes for the gym progress tracker
 */
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<History />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/stats" element={<Statistics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
