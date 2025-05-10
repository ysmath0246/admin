// src/pages/ClassManagePage.jsx
import { Link, Routes, Route } from 'react-router-dom';
import ClassSubPage from './ClassSubPage';
import MakeupSubPage from './MakeupSubPage';
import PointSubPage from './PointSubPage';

function ClassManagePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>수업관리</h2>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="class" style={{ marginRight: '10px' }}>수업</Link>
        <Link to="makeup" style={{ marginRight: '10px' }}>보강</Link>
        <Link to="point">포인트 랭킹</Link>
      </nav>

      <Routes>
        <Route path="class" element={<ClassSubPage />} />
        <Route path="makeup" element={<MakeupSubPage />} />
        <Route path="point" element={<PointSubPage />} />
      </Routes>
    </div>
  );
}

export default ClassManagePage;
