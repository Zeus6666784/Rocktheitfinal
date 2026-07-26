import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navigation/Navbar/Navbar';
import Footer from './components/navigation/Footer/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learning from './pages/Learning';

/**
 * Top-level app shell. Real Navbar + Footer from Dev 2; four route
 * targets from SYSTEM.md.
 */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/learn/:courseId" element={<Learning />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}