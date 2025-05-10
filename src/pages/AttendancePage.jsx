// src/pages/AttendancePage.jsx
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'attendance'), snapshot => {
      const data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setAttendanceData(data);
      console.log('출석 데이터:', data);
    });

    return () => unsubscribe();
  }, []);

  const students = Object.keys(
    attendanceData[selectedDate] || {}
  );

  return (
    <div style={{ padding: '20px' }}>
      <h2>출석현황</h2>

      <label>
        날짜 선택:{' '}
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
      </label>

      <table border="1" cellPadding="5" style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>출석 상태</th>
            <th>출석 시간</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>출석 데이터 없음</td>
            </tr>
          ) : (
            students.map(name => {
              const status = attendanceData[selectedDate][name]?.status;
              const time = attendanceData[selectedDate][name]?.time;

              let color = '';
              if (status === '출석') color = 'lightgreen';
              else if (status === '지각') color = 'yellow';
              else if (status === '결석') color = 'lightcoral';
              else if (status === '보강') color = 'lightblue';
              else if (status === '이월') color = 'lightgray';
              else color = 'white';

              return (
                <tr key={name} style={{ backgroundColor: color }}>
                  <td>{name}</td>
                  <td>{status}</td>
                  <td>{time || '-'}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendancePage;
