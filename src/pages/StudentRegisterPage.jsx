// src/pages/StudentRegisterPage.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateScheduleWithRollovers, publicHolidaysKR } from '../firebase/logic'; // ✅ holidays import

const dayToNumber = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

function StudentRegisterPage() {
  // 📝 상태 선언
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startRoutine, setStartRoutine] = useState(1);
  const [schedules, setSchedules] = useState([{ day: '', time: '' }]);
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);

  // 🔍 학생 목록 실시간 로드
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), snapshot => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });
    return () => unsub();
  }, []);

  // 📝 수업 일정 입력 변경
  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  // 📝 수업 일정 추가/삭제
  const addSchedule = () => setSchedules([...schedules, { day: '', time: '' }]);
  const removeSchedule = (index) => {
    const updated = [...schedules];
    updated.splice(index, 1);
    setSchedules(updated);
  };

  // ✅ 학생 등록/수정 및 루틴 저장
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✋ 필수 항목 확인
    if (!name || !birth || !parentPhone || !startDate || schedules.length === 0 || schedules.some(s => !s.day || !s.time)) {
      alert('모든 항목을 입력하세요!');
      return;
    }

    try {
      // 💡 요일 배열 추출
      const days = schedules.map(s => s.day);
      const cnt = schedules.length === 3 ? 12 : 8;

      // ✅ 수업 일정 생성 (휴일 제외 포함)
      const lessons = generateScheduleWithRollovers(startDate, days, cnt, publicHolidaysKR);

      // ✅ 학생 데이터 준비
      const studentData = {
        name,
        birth,
        parentPhone,
        startDate,
        schedules,
        startRoutine: startRoutine,
        lessons,
        point: editingStudent?.point ?? 0,
        points: editingStudent?.points ?? { 출석: 0, 숙제: 0, 수업태도: 0, 시험: 0, 문제집완료: 0 },
        createdAt: new Date().toISOString(),
      };

      let docId = '';

      if (editingStudent) {
        // 🔄 수정
        await updateDoc(doc(db, 'students', editingStudent.id), studentData);
        docId = editingStudent.id;
        alert('학생 정보 수정 완료!');
        setEditingStudent(null);
      } else {
        // ➕ 신규 등록
        const docRef = await addDoc(collection(db, 'students'), studentData);
        docId = docRef.id;
        alert('학생 등록 완료!');
      }

      // ✅ 루틴 저장
      const cycleSize = days.length * 4;
      const rawLessons = generateScheduleWithRollovers(startDate, days, cycleSize * 10, publicHolidaysKR);
      const reindexed = [];
      let routineNumber = startRoutine || 1;
      let count = 1;
      let nonSkipCount = 0;

      for (let i = 0; i < rawLessons.length; i++) {
        const l = rawLessons[i];
        reindexed.push({ session: count, routineNumber, date: l.date, status: '미정', time: '-' });
        count++;
        nonSkipCount++;
        if (nonSkipCount === cycleSize) {
          routineNumber++;
          count = 1;
          nonSkipCount = 0;
        }
      }

      await setDoc(doc(db, 'routines', docId), {
        studentId: docId,
        name: name,
        lessons: reindexed,
        updatedAt: new Date().toISOString()
      });

      // ✅ 입력값 초기화
      setName('');
      setBirth('');
      setParentPhone('');
      setStartDate('');
      setStartRoutine(1);
      setSchedules([{ day: '', time: '' }]);

    } catch (error) {
      console.error('학생 등록/수정 중 오류:', error);
      alert('에러 발생!');
    }
  };

  // 📝 학생 수정 버튼 클릭 시
  const handleEdit = (student) => {
    setEditingStudent(student);
    setName(student.name);
    setBirth(student.birth);
    setParentPhone(student.parentPhone);
    setStartDate(student.startDate);
    setStartRoutine(student.startRoutine || 1);
    setSchedules(student.schedules);
  };

  // 📝 학생 삭제
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
          <label>수업 시작일: </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label>루틴 시작 번호: </label>
          <input type="number" value={startRoutine} onChange={e => setStartRoutine(Number(e.target.value) || 1)} />
        </div>
        <div>
          <label>수업 요일 + 시간: </label>
          {schedules.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '5px' }}>
              <input placeholder="요일 (월,화...)" value={s.day} onChange={e => handleScheduleChange(i, 'day', e.target.value)} />
              <input placeholder="시간 (예: 15:00)" value={s.time} onChange={e => handleScheduleChange(i, 'time', e.target.value)} />
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
            <th>루틴 시작 번호</th>
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
                <td>{stu.startRoutine}</td>
                <td>{stu.schedules.map(s => `${s.day}(${s.time})`).join(', ')}</td>
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

export default StudentRegisterPage;
