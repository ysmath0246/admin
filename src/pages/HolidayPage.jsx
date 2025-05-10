// src/pages/HolidayPage.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchHolidays = async () => {
      const snapshot = await getDocs(collection(db, 'holidays'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHolidays(list);
    };

    fetchHolidays();
  }, []);

  const handleAddHoliday = async () => {
    if (!date || !name) {
      alert('날짜와 이름을 입력하세요!');
      return;
    }

    await addDoc(collection(db, 'holidays'), { date, name });
    setDate('');
    setName('');
    alert('휴일 추가 완료!');
    const snapshot = await getDocs(collection(db, 'holidays'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHolidays(list);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>휴일 관리</h2>
      <div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="text" placeholder="휴일명" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={handleAddHoliday}>휴일 추가</button>
      </div>
      <h3>등록된 휴일 목록</h3>
      <ul>
        {holidays.length === 0 ? (
          <li>휴일 없음</li>
        ) : (
          holidays.map(hol => (
            <li key={hol.id}>{hol.date} - {hol.name}</li>
          ))
        )}
      </ul>
    </div>
  );
}

export default HolidayPage;
