// src/pages/StudentPage.jsx
import { Link, Routes, Route } from 'react-router-dom';
import StudentRegisterPage from './StudentRegisterPage';
import StudentRegisterHighPage from './StudentRegisterHighPage';

function StudentPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>학생관리</h2>
      <nav>
        <Link to="register" style={{ marginRight: '10px' }}>초/중등부 등록</Link>
        <Link to="register-high">고등부 등록</Link>
      </nav>

      <Routes>
        <Route path="register" element={<StudentRegisterPage />} />
        <Route path="register-high" element={<StudentRegisterHighPage />} />
      </Routes>
    </div>
  );
}

export default StudentPage;
