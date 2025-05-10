// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AttendancePage from './pages/AttendancePage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import ClassManagePage from './pages/ClassManagePage';
import PaymentManagePage from './pages/PaymentManagePage';
import NoticeManagePage from './pages/NoticeManagePage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import HolidayPage from './pages/HolidayPage';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/attendance">출석</Link> | 
        <Link to="/student-register">학생등록</Link> | 
        <Link to="/class-manage">수업관리</Link> | 
        <Link to="/payment-manage">결제관리</Link> | 
        <Link to="/notice-manage">공지사항관리</Link>
      </nav>

      <Routes>
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/student-register" element={<StudentRegisterPage />} />
        <Route path="/class-manage/*" element={<ClassManagePage />} />
        <Route path="/payment-manage/*" element={<PaymentManagePage />} />
        <Route path="/notice-manage" element={<NoticeManagePage />} />
        <Route path="/notice-manage/detail" element={<NoticeDetailPage />} />
        <Route path="/notice-manage/holiday" element={<HolidayPage />} />
      </Routes>
    </Router>
  );
}

export default App;
