// src/pages/ClassSubPage.jsx
import { useState, useMemo, useEffect } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import StudentCalendarModal from '../StudentCalendarModal';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateScheduleWithRollovers } from '../firebase/logic';

export default function ClassSubPage({ students, attendance, books, comments, makeups, holidays, refreshAllData }) {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('scheduleChange');
  const [bookTitle, setBookTitle] = useState('');
  const [bookGrade, setBookGrade] = useState('');
  const [bookCompletedDate, setBookCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [commentText, setCommentText] = useState('');
  const [commentDate, setCommentDate] = useState(new Date().toISOString().slice(0, 10));
  const [tempSchedules, setTempSchedules] = useState([]);
  const [applyDate, setApplyDate] = useState('');

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, search]);

  useEffect(() => {
    if (selectedStudent) {
      setTempSchedules([...selectedStudent.schedules]);
    }
  }, [selectedStudent]);

  const updateTempSchedule = (index, field, value) => {
    const newSchedules = [...tempSchedules];
    newSchedules[index][field] = value;
    setTempSchedules(newSchedules);
  };

  const addTempSchedule = () => {
    setTempSchedules([...tempSchedules, { day: '', time: '' }]);
  };

  const removeTempSchedule = (index) => {
    setTempSchedules(tempSchedules.filter((_, i) => i !== index));
  };

  const handleScheduleChange = async () => {
    if (!applyDate) {
      alert('적용 시기를 입력하세요!');
      return;
    }

    try {
      const routineDocRef = doc(db, 'routines', selectedStudent.id);
      const routineSnap = await getDoc(routineDocRef);
      let oldLessons = [];

      if (routineSnap.exists()) {
        const routineData = routineSnap.data();
        oldLessons = routineData.lessons;
      }

      const keptLessons = oldLessons.filter(l => l.date < applyDate);
      const rawNewLessons = generateScheduleWithRollovers(applyDate, tempSchedules, 100);
      const cycleSize = tempSchedules.length * 4;

      let routineNumber = keptLessons.length > 0 ? keptLessons[keptLessons.length - 1].routineNumber : 1;
      let count = keptLessons.length > 0 ? keptLessons[keptLessons.length - 1].session + 1 : 1;
      let nonSkipCount = 0;

      const newLessons = rawNewLessons.map(l => {
        const lesson = { session: count, routineNumber, date: l.date, status: '미정', time: '-' };
        count++;
        nonSkipCount++;
        if (nonSkipCount === cycleSize) {
          routineNumber++;
          count = 1;
          nonSkipCount = 0;
        }
        return lesson;
      });

      if (routineSnap.exists()) {
        await updateDoc(routineDocRef, {
          lessons: [...keptLessons, ...newLessons],
          updatedAt: new Date().toISOString(),
        });
      } else {
        await setDoc(routineDocRef, {
          studentId: selectedStudent.id,
          name: selectedStudent.name,
          lessons: [...keptLessons, ...newLessons],
          updatedAt: new Date().toISOString(),
        });
      }

      refreshAllData && refreshAllData();
      alert('수업 변경 완료!');
    } catch (err) {
      console.error('수업 변경 오류:', err);
      alert('수업 변경 중 오류 발생');
    }
  };

  return (
    <div className="flex gap-4">
      <div className="w-1/2">
        <Input
          placeholder="학생 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-2"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map(student => (
              <TableRow key={student.id}>
                <TableCell>
                  <span
                    className={`cursor-pointer hover:underline ${
                      selectedStudent?.id === student.id ? 'text-blue-600' : 'text-blue-400'
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    {student.name}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="w-1/2 bg-white border rounded p-4">
        {selectedStudent ? (
          <>
            <h2 className="text-lg font-semibold mb-2">{selectedStudent.name}</h2>
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant={selectedPanel === 'scheduleChange' ? 'default' : 'outline'} onClick={() => setSelectedPanel('scheduleChange')}>수업변경</Button>
              <Button size="sm" variant={selectedPanel === 'calendar' ? 'default' : 'outline'} onClick={() => setSelectedPanel('calendar')}>수업횟수</Button>
              <Button size="sm" variant={selectedPanel === 'books' ? 'default' : 'outline'} onClick={() => setSelectedPanel('books')}>책관리</Button>
              <Button size="sm" variant={selectedPanel === 'comments' ? 'default' : 'outline'} onClick={() => setSelectedPanel('comments')}>코멘트</Button>
              <Button size="sm" variant={selectedPanel === 'makeup' ? 'default' : 'outline'} onClick={() => setSelectedPanel('makeup')}>보강</Button>
            </div>

            {selectedPanel === 'scheduleChange' && (
              <div className="space-y-2">
                <h3>현재 수업 스케줄</h3>
                {tempSchedules.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={s.day} onChange={e => updateTempSchedule(i, 'day', e.target.value)} placeholder="요일 (예: 월)" />
                    <Input value={s.time} onChange={e => updateTempSchedule(i, 'time', e.target.value)} placeholder="시간 (예: 15:00)" />
                    <Button size="xs" variant="destructive" onClick={() => removeTempSchedule(i)}>삭제</Button>
                  </div>
                ))}
                <Button size="sm" onClick={addTempSchedule} variant="outline">+ 수업 추가</Button>
                <Input type="date" value={applyDate} onChange={e => setApplyDate(e.target.value)} placeholder="변경 적용 시기" />
                <Button size="sm" variant="default" onClick={handleScheduleChange}>저장</Button>
              </div>
            )}

            {selectedPanel === 'calendar' && (
              <StudentCalendarModal
                student={selectedStudent}
                attendance={attendance}
                attendanceDate={new Date().toISOString().slice(0, 10)}
                holidays={holidays}
                onUpdateStudent={() => {}}
                onRefreshData={refreshAllData}
                inline={true}
              />
            )}

            {selectedPanel === 'books' && (
              <div>
                <Input placeholder="책 제목" value={bookTitle} onChange={e => setBookTitle(e.target.value)} />
                <Input placeholder="학년" value={bookGrade} onChange={e => setBookGrade(e.target.value)} />
                <Input type="date" value={bookCompletedDate} onChange={e => setBookCompletedDate(e.target.value)} />
                <Button size="sm" onClick={async () => {
                  await addDoc(collection(db, 'books'), {
                    name: selectedStudent.name,
                    studentId: selectedStudent.id,
                    title: bookTitle,
                    grade: bookGrade,
                    date: bookCompletedDate
                  });
                  setBookTitle(''); setBookGrade('');
                  refreshAllData && refreshAllData();
                  alert('저장되었습니다!');
                }}>저장</Button>

                {/* 책 리스트 */}
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>제목</TableHead>
                      <TableHead>학년</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead>삭제</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books.filter(b => b.studentId === selectedStudent.id).map(b => (
                      <TableRow key={b.id}>
                        <TableCell>{b.title}</TableCell>
                        <TableCell>{b.grade}</TableCell>
                        <TableCell>{b.date}</TableCell>
                        <TableCell>
                          <Button size="xs" variant="destructive" onClick={async () => {
                            await deleteDoc(doc(db, 'books', b.id));
                            refreshAllData && refreshAllData();
                          }}>삭제</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {selectedPanel === 'comments' && (
              <div>
                <Input placeholder="코멘트 내용" value={commentText} onChange={e => setCommentText(e.target.value)} />
                <Input type="date" value={commentDate} onChange={e => setCommentDate(e.target.value)} />
                <Button size="sm" onClick={async () => {
                  await addDoc(collection(db, 'comments'), {
                    name: selectedStudent.name,
                    studentId: selectedStudent.id,
                    comment: commentText,
                    date: commentDate
                  });
                  setCommentText('');
                  refreshAllData && refreshAllData();
                  alert('저장되었습니다!');
                }}>저장</Button>

                {/* 코멘트 리스트 */}
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>내용</TableHead>
                      <TableHead>날짜</TableHead>
                      <TableHead>삭제</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments.filter(c => c.studentId === selectedStudent.id).map(c => (
                      <TableRow key={c.id}>
                        <TableCell>{c.comment}</TableCell>
                        <TableCell>{c.date}</TableCell>
                        <TableCell>
                          <Button size="xs" variant="destructive" onClick={async () => {
                            await deleteDoc(doc(db, 'comments', c.id));
                            refreshAllData && refreshAllData();
                          }}>삭제</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

           {selectedPanel === 'makeup' && (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>날짜</TableHead>
        <TableHead>보강</TableHead>
        <TableHead>완료여부</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {makeups.filter(m => m.studentId === selectedStudent.id).map(m => (
        <TableRow key={m.id}>
          <TableCell>{new Date(m.date).toLocaleDateString('ko-KR')}</TableCell>
          <TableCell>{m.status}</TableCell>
          <TableCell>{m.completed ? '✅' : '❌'}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}

          </>
        ) : (
          <div className="text-gray-500">왼쪽에서 학생을 선택하세요.</div>
        )}
      </div>
    </div>
  );
}
