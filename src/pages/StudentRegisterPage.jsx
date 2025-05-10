// src/pages/StudentRegisterPage.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const dayToNumber = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

function StudentRegisterPage() {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startRoutine, setStartRoutine] = useState(1); // ⭐ 추가
  const [schedules, setSchedules] = useState([{ day: '', time: '' }]);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });
    return () => unsub();
  }, []);

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { day: '', time: '' }]);
  };

  const removeSchedule = (index) => {
    const updated = [...schedules];
    updated.splice(index, 1);
    setSchedules(updated);
  };

  const generateLessons = (startDateStr, schedules) => {
    const totalSessions = schedules.length === 1 ? 4 : (schedules.length === 2 ? 8 : 12);
    const startDateObj = new Date(startDateStr);
    const lessons = [];
    let currentDate = new Date(startDateObj);

    while (lessons.length < totalSessions) {
      const dayNum = currentDate.getDay();
      const scheduleMatch = schedules.find(s => dayToNumber[s.day] === dayNum);
      if (scheduleMatch) {
        lessons.push({
          session: lessons.length + 1,
          date: currentDate.toISOString().slice(0, 10),
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return lessons;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !birth || !parentPhone || !startDate || schedules.length === 0 || schedules.some(s => !s.day || !s.time)) {
      alert('모든 항목을 입력하세요!');
      return;
    }

    const lessons = generateLessons(startDate, schedules);

    if (editingStudent) {
      await updateDoc(doc(db, 'students', editingStudent.id), {
        name,
        birth,
        parentPhone,
        startDate,
        schedules,
        startRoutine: startRoutine,  // ⭐ 수정
        lessons,
        point: editingStudent.point ?? 0,
        points: editingStudent.points ?? { 출석: 0, 숙제: 0, 수업태도: 0, 시험: 0, 문제집완료: 0 },
      });
      alert('학생 정보 수정 완료!');
      setEditingStudent(null);
    } else {
      await addDoc(collection(db, 'students'), {
        name,
        birth,
        parentPhone,
        startDate,
        schedules,
        startRoutine: startRoutine,  // ⭐ 수정
        lessons,
        point: 0,
        points: { 출석: 0, 숙제: 0, 수업태도: 0, 시험: 0, 문제집완료: 0 },
        createdAt: new Date().toISOString(),
      });
      alert('학생 등록 완료!');
    }

    setName('');
    setBirth('');
    setParentPhone('');
    setStartDate('');
    setStartRoutine(1); // ⭐ 초기화
    setSchedules([{ day: '', time: '' }]);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setName(student.name);
    setBirth(student.birth);
    setParentPhone(student.parentPhone);
    setStartDate(student.startDate);
    setStartRoutine(student.startRoutine || 1); // ⭐ 수정
    setSchedules(student.schedules);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteDoc(doc(db, 'students', id));
      alert('삭제되었습니다.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>초/중등부 학생 등록</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>이름: </label>
          <input value={name || ''} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>생년월일: </label>
          <input value={birth || ''} onChange={e => setBirth(e.target.value)} placeholder="YYYY-MM-DD" />
        </div>
        <div>
          <label>학부모 번호: </label>
          <input value={parentPhone || ''} onChange={e => setParentPhone(e.target.value)} />
        </div>
        <div>
          <label>수업 시작일: </label>
          <input type="date" value={startDate || ''} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>루틴 시작 번호: </label> {/* ⭐ 추가 */}
          <input
            type="number"
            value={startRoutine || ''}
            onChange={e => setStartRoutine(Number(e.target.value) || 1)}
            placeholder="1"
          />
        </div>
        <div>
          <label>수업 요일 + 시간: </label>
          {schedules.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '5px' }}>
              <input
                placeholder="요일 (월,화...)"
                value={s.day || ''}
                onChange={e => handleScheduleChange(i, 'day', e.target.value)}
              />
              <input
                placeholder="시간 (예: 15:00)"
                value={s.time || ''}
                onChange={e => handleScheduleChange(i, 'time', e.target.value)}
              />
              <button type="button" onClick={() => removeSchedule(i)}>삭제</button>
            </div>
          ))}
          <button type="button" onClick={addSchedule}>+ 수업 추가</button>
        </div>
        <button type="submit" style={{ marginTop: '10px' }}>
          {editingStudent ? '학생 수정' : '학생 등록'}
        </button>
      </form>

      <h3 style={{ marginTop: '30px' }}>등록된 학생 목록</h3>
      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>생년월일</th>
            <th>학부모 번호</th>
            <th>수업 시작일</th>
            <th>루틴 시작 번호</th> {/* ⭐ 추가 표시 */}
            <th>수업 요일+시간</th>
            <th>수정</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>등록된 학생 없음</td>
            </tr>
          ) : (
            students.map(stu => (
              <tr key={stu.id}>
                <td>{stu.name}</td>
                <td>{stu.birth}</td>
                <td>{stu.parentPhone}</td>
                <td>{stu.startDate}</td>
                <td>{stu.startRoutine}</td> {/* ⭐ 표시 */}
                <td>{stu.schedules.map(s => `${s.day}(${s.time})`).join(', ')}</td>
                <td>
                  <button onClick={() => handleEdit(stu)}>수정</button>
                </td>
                <td>
                  <button onClick={() => handleDelete(stu.id)}>삭제</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudentRegisterPage;
