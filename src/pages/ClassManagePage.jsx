import { Link, Routes, Route } from 'react-router-dom';
import ClassSubPage from './ClassSubPage';
import MakeupSubPage from './MakeupSubPage';
import PointSubPage from './PointSubPage';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function ClassManagePage() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [books, setBooks] = useState([]);
  const [comments, setComments] = useState([]);
  const [makeups, setMakeups] = useState([]);
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      const booksSnap = await getDocs(collection(db, 'books'));
      const commentsSnap = await getDocs(collection(db, 'comments'));
      const makeupsSnap = await getDocs(collection(db, 'makeups'));
      const holidaysSnap = await getDocs(collection(db, 'holidays'));

      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAttendance(attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setBooks(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setComments(commentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setMakeups(makeupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setHolidays(holidaysSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  const refreshAllData = () => {
    console.log('데이터 새로고침 실행!');
    // 여기 필요시 fetchData() 다시 호출
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>수업관리</h2>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="class" style={{ marginRight: '10px' }}>수업</Link>
        <Link to="makeup" style={{ marginRight: '10px' }}>보강</Link>
        <Link to="point">포인트 랭킹</Link>
      </nav>

      <Routes>
        <Route
          path="class"
          element={
            <ClassSubPage
              students={students}
              attendance={attendance}
              books={books}
              comments={comments}
              makeups={makeups}
              holidays={holidays}
              refreshAllData={refreshAllData}
            />
          }
        />
        <Route path="makeup" element={<MakeupSubPage />} />
        <Route path="point" element={<PointSubPage />} />
      </Routes>
    </div>
  );
}

export default ClassManagePage;
