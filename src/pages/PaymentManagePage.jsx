import { Link, Routes, Route } from 'react-router-dom';
import CalendarSubPage from './CalendarSubPage';
import TableSubPage from './TableSubPage';

function PaymentManagePage() {
  return (
    <div>
      <h2>결제관리 페이지</h2>
      <nav>
        <Link to="calendar">달력</Link> | 
        <Link to="table">표</Link>
      </nav>

      <Routes>
        <Route path="calendar" element={<CalendarSubPage />} />
        <Route path="table" element={<TableSubPage />} />
      </Routes>
    </div>
  );
}

export default PaymentManagePage;
