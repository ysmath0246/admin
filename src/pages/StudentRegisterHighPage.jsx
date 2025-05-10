// src/pages/StudentPage.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

function StudentRegisterHighPage() {  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });

    return () => unsub();
  }, []);

  const handleCheckboxChange = (day) => {
    if (schedule.includes(day)) {
      setSchedule(schedule.filter(d => d !== day));
    } else {
      setSchedule([...schedule, day]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !birth || !parentPhone || schedule.length === 0) {
      alert('모든 항목을 입력하세요!');
      return;
    }

    await addDoc(collection(db, 'students'), {
      name,
      birth,
      parentPhone,
      schedules: schedule.map(day => ({ day })),
      createdAt: new Date().toISOString(),
    });

    setName('');
    setBirth('');
    setParentPhone('');
    setSchedule([]);
    alert('학생 등록 완료!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>학생등록</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이름: </label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>생년월일: </label>
          <input value={birth} onChange={e => setBirth(e.target.value)} placeholder="YYYY-MM-DD" />
        </div>
        <div>
          <label>학부모 번호: </label>
          <input value={parentPhone} onChange={e => setParentPhone(e.target.value)} />
        </div>
        <div>
          <label>수업 요일: </label>
          {['월', '화', '수', '목', '금', '토', '일'].map(day => (
            <label key={day} style={{ marginRight: '8px' }}>
              <input
                type="checkbox"
                checked={schedule.includes(day)}
                onChange={() => handleCheckboxChange(day)}
              />
              {day}
            </label>
          ))}
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>학생 등록</button>
      </form>

      <h3 style={{ marginTop: '30px' }}>등록된 학생 목록</h3>
      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>생년월일</th>
            <th>학부모 번호</th>
            <th>수업 요일</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>등록된 학생 없음</td>
            </tr>
          ) : (
            students.map(stu => (
              <tr key={stu.id}>
                <td>{stu.name}</td>
                <td>{stu.birth}</td>
                <td>{stu.parentPhone}</td>
                <td>{stu.schedules.map(s => s.day).join(', ')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
export default StudentRegisterHighPage;
