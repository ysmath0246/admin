// src/pages/CalendarSubPage.jsx
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function CalendarSubPage() {
  const [payments, setPayments] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchPayments = async () => {
      const snapshot = await getDocs(collection(db, 'payments'));
      const data = {};
      snapshot.forEach(doc => {
        const payment = doc.data();
        if (payment.date && payment.status) {
          data[payment.date] = payment.status;
        }
      });
      setPayments(data);
      console.log('결제 데이터:', data);
    };

    fetchPayments();
  }, []);

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      const status = payments[dateStr];
      if (status === '완료') {
        return <div style={{ backgroundColor: 'lightgreen', fontSize: '10px' }}>결제완료</div>;
      } else if (status === '미납') {
        return <div style={{ backgroundColor: 'lightcoral', fontSize: '10px' }}>미납</div>;
      }
    }
    return null;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>결제관리 - 달력</h2>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={tileContent}
      />
      <p style={{ marginTop: '10px' }}>선택된 날짜: {selectedDate.toISOString().slice(0, 10)}</p>
    </div>
  );
}

export default CalendarSubPage;
