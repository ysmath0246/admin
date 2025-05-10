// src/pages/StudentRegisterHighPage.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

function StudentRegisterHighPage() {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null); // ✅ 수정 모드 여부 확인용 상태 추가

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'highstudents'), snapshot => {
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

    try {
      if (editingStudent) {
        // ✅ 수정 모드: updateDoc으로 Firestore 업데이트
        await updateDoc(doc(db, 'highstudents', editingStudent.id), {
          name,
          birth,
          parentPhone,
          schedules: schedule.map(day => ({ day })),
          updatedAt: new Date().toISOString(),
        });
        alert('학생 수정 완료!');
      } else {
        // ✅ 신규 등록
        await addDoc(collection(db, 'highstudents'), {
          name,
          birth,
          parentPhone,
          schedules: schedule.map(day => ({ day })),
          createdAt: new Date().toISOString(),
        });
        alert('학생 등록 완료!');
      }
      // ✅ 입력값 초기화
      setName('');
      setBirth('');
      setParentPhone('');
      setSchedule([]);
      setEditingStudent(null);
    } catch (error) {
      console.error('저장 중 오류:', error);
      alert('저장 중 오류 발생');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setName(student.name);
    setBirth(student.birth);
    setParentPhone(student.parentPhone);
    setSchedule(student.schedules.map(s => s.day)); // 요일 배열 추출
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteDoc(doc(db, 'highstudents', id));
      alert('삭제 완료!');
    }
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
        <button type="submit" style={{ marginTop: '10px' }}>
          {editingStudent ? '학생 수정' : '학생 등록'}
        </button>
        {editingStudent && (
          <button type="button" onClick={() => {
            setEditingStudent(null);
            setName('');
            setBirth('');
            setParentPhone('');
            setSchedule([]);
          }} style={{ marginLeft: '10px' }}>
            취소
          </button>
        )}
      </form>

      <h3 style={{ marginTop: '30px' }}>등록된 학생 목록</h3>
      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>생년월일</th>
            <th>학부모 번호</th>
            <th>수업 요일</th>
            <th>수정</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>등록된 학생 없음</td>
            </tr>
          ) : (
            students.map(stu => (
              <tr key={stu.id}>
                <td>{stu.name}</td>
                <td>{stu.birth}</td>
                <td>{stu.parentPhone}</td>
                <td>{stu.schedules.map(s => s.day).join(', ')}</td>
                <td><button onClick={() => handleEdit(stu)}>수정</button></td>
                <td><button onClick={() => handleDelete(stu.id)}>삭제</button></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StudentRegisterHighPage;
