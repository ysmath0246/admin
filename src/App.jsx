import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AttendancePage from './pages/AttendancePage';
import StudentPage from './pages/StudentPage';
import ClassManagePage from './pages/ClassManagePage';
import PaymentManagePage from './pages/PaymentManagePage';
import NoticeManagePage from './pages/NoticeManagePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import HolidayPage from './pages/HolidayPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/attendance"
          element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AttendancePage />
            </motion.div>
          }
        />
        <Route
          path="/student/*"
          element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StudentPage />
            </motion.div>
          }
        />
        <Route
          path="/class-manage/*"
          element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ClassManagePage />
            </motion.div>
          }
        />
        <Route
          path="/payment-manage/*"
          element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PaymentManagePage />
            </motion.div>
          }
        />
        <Route
          path="/notice-manage"
          element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NoticeManagePage />
            </motion.div>
          }
        />
        <Route
          path="/notice-manage/detail"
          element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NoticeDetailPage />
            </motion.div>
          }
        />
        <Route
          path="/notice-manage/holiday"
          element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HolidayPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', backgroundColor: '#eee' }}>
        <Link to="/attendance" style={{ marginRight: '10px' }}>출석</Link>
        <Link to="/student" style={{ marginRight: '10px' }}>학생관리</Link>
        <Link to="/class-manage" style={{ marginRight: '10px' }}>수업관리</Link>
        <Link to="/payment-manage" style={{ marginRight: '10px' }}>결제관리</Link>
        <Link to="/notice-manage">공지사항관리</Link>
      </nav>

      <AnimatedRoutes />
    </Router>
  );
}

export default App;
