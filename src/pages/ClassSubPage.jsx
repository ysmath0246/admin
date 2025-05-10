// src/pages/ClassSubPage.jsx
import { useState, useMemo } from 'react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import StudentCalendarModal from '../StudentCalendarModal';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateScheduleWithRollovers } from '../firebase/logic';  // ✅ 함수 import

export default function ClassSubPage({ students, attendance, books, comments, makeups, holidays, refreshAllData }) {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedPanel, setSelectedPanel] = useState('calendar');
  const [bookTitle, setBookTitle] = useState('');
  const [bookGrade, setBookGrade] = useState('');
  const [bookCompletedDate, setBookCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [commentText, setCommentText] = useState('');
  const [commentDate, setCommentDate] = useState(new Date().toISOString().slice(0, 10));

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [students, search]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    // ✅ 수업 일정 생성
    const rawLessons = generateScheduleWithRollovers(student.startDate, student.schedules, 12);
    const filteredLessons = rawLessons.filter(l => !holidays.some(h => h.date === l.date));
    setLessons(filteredLessons);
  };

  return (
    <div className="flex gap-4">
      {/* 왼쪽: 학생 목록 */}
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

      {/* 오른쪽: 학생 정보 */}
      <div className="w-1/2 bg-white border rounded p-4">
        {selectedStudent ? (
          <>
            <h2 className="text-lg font-semibold mb-2">{selectedStudent.name}</h2>
            {/* 탭 버튼 */}
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant={selectedPanel === 'calendar' ? 'default' : 'outline'} onClick={() => setSelectedPanel('calendar')}>
                수업횟수
              </Button>
              <Button size="sm" variant={selectedPanel === 'books' ? 'default' : 'outline'} onClick={() => setSelectedPanel('books')}>
                책관리
              </Button>
              <Button size="sm" variant={selectedPanel === 'comments' ? 'default' : 'outline'} onClick={() => setSelectedPanel('comments')}>
                코멘트
              </Button>
              <Button size="sm" variant={selectedPanel === 'makeup' ? 'default' : 'outline'} onClick={() => setSelectedPanel('makeup')}>
                보강
              </Button>
            </div>

            {/* 수업횟수 */}
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

            {/* 책관리 */}
            {selectedPanel === 'books' && (
              <div className="space-y-2">
                <Input placeholder="책 제목" value={bookTitle} onChange={e => setBookTitle(e.target.value)} />
                <Input placeholder="학년" value={bookGrade} onChange={e => setBookGrade(e.target.value)} />
                <Input type="date" value={bookCompletedDate} onChange={e => setBookCompletedDate(e.target.value)} />
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!bookTitle || !bookGrade) {
                      alert('책 이름과 학년을 입력하세요!');
                      return;
                    }
                    await addDoc(collection(db, 'books'), {
                      studentId: selectedStudent.id,
                      name: selectedStudent.name,
                      title: bookTitle,
                      grade: bookGrade,
                      completedDate: bookCompletedDate,
                    });
                    setBookTitle('');
                    setBookGrade('');
                    alert('저장되었습니다!');
                  }}
                >
                  저장
                </Button>

                <h3 className="text-md font-semibold mt-4">저장된 책</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>책 이름</TableHead>
                      <TableHead>학년</TableHead>
                      <TableHead>완료일</TableHead>
                      <TableHead>삭제</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {books
                      .filter(b => b.studentId === selectedStudent.id)
                      .map(book => (
                        <TableRow key={book.id}>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.grade}</TableCell>
                          <TableCell>{book.completedDate}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                if (window.confirm('삭제하시겠습니까?')) {
                                  await deleteDoc(doc(db, 'books', book.id));
                                }
                              }}
                            >
                              삭제
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* 코멘트 */}
            {selectedPanel === 'comments' && (
              <div className="space-y-2">
                <Input type="date" value={commentDate} onChange={e => setCommentDate(e.target.value)} />
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full border rounded p-2"
                  placeholder="코멘트 입력"
                />
                <Button
                  size="sm"
                  onClick={async () => {
                    if (!commentText.trim()) {
                      alert('코멘트를 입력하세요!');
                      return;
                    }
                    await addDoc(collection(db, 'comments'), {
                      studentId: selectedStudent.id,
                      name: selectedStudent.name,
                      comment: commentText.trim(),
                      date: commentDate,
                      createdAt: new Date().toISOString(),
                    });
                    setCommentText('');
                    alert('저장되었습니다!');
                  }}
                >
                  저장
                </Button>

                <h3 className="text-md font-semibold mt-4">저장된 코멘트</h3>
                <ul className="list-disc pl-4 space-y-1">
                  {comments
                    .filter(c => c.studentId === selectedStudent.id)
                    .map(c => (
                      <li key={c.id} className="flex justify-between">
                        <span>
                          {c.comment}{' '}
                          <span className="text-xs text-gray-500">
                            ({c.date || c.createdAt.slice(0, 10)})
                          </span>
                        </span>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={async () => {
                            if (window.confirm('삭제하시겠습니까?')) {
                              await deleteDoc(doc(db, 'comments', c.id));
                            }
                          }}
                        >
                          삭제
                        </Button>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* 보강 */}
            {selectedPanel === 'makeup' && (
              <div>
                <h3 className="text-md font-semibold">보강 목록</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>타입</TableHead>
                      <TableHead>완료</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {makeups
                      .filter(m => m.name === selectedStudent.name)
                      .map(m => (
                        <TableRow key={m.id}>
                          <TableCell>{m.date}</TableCell>
                          <TableCell>{m.type}</TableCell>
                          <TableCell>{m.completed ? '✅' : '❌'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500">왼쪽에서 학생을 선택하세요.</div>
        )}
      </div>
    </div>
  );
}
