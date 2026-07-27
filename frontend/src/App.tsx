import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import WorkflowDetails from './pages/WorkflowDetails';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workflow/:filename" element={<WorkflowDetails />} />
      </Routes>
    </>
  );
}

export default App;
