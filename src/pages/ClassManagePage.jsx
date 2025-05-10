import { Link, Routes, Route } from 'react-router-dom';
import ClassSubPage from './ClassSubPage';
import MakeupSubPage from './MakeupSubPage';
import PointSubPage from './PointSubPage';
import BookSubPage from './BookSubPage';

function ClassManagePage() {
  return (
    <div>
      <h2>수업관리</h2>
      <nav>
        <Link to="class">수업</Link> | 
        <Link to="makeup">보강</Link> | 
        <Link to="point">포인트</Link> | 
        <Link to="book">문제집</Link>
      </nav>

      <Routes>
        <Route path="class" element={<ClassSubPage />} />
        <Route path="makeup" element={<MakeupSubPage />} />
        <Route path="point" element={<PointSubPage />} />
        <Route path="book" element={<BookSubPage />} />
      </Routes>
    </div>
  );
}

export default ClassManagePage;
