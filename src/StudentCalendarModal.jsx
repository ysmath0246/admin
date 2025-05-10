// src/StudentCalendarModal.jsx
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './components/ui/table';
import { Button } from './components/ui/button';
import { doc, setDoc, addDoc, deleteDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';  // ✅ onSnapshot 추가
import { db } from './firebase';
import { generateScheduleWithRollovers } from './firebase/logic';

export default function StudentCalendarModal({
  student, onUpdateStudent, onRefreshData, inline,
  attendance, attendanceDate, holidays = []
}) {
  const [lessons, setLessons] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(0);

  const days = student.schedules.map(s => s.day);
  const cycleSize = days.length * 4;
  const totalTarget = cycleSize * 10;

  // ✅ 루틴 재생성 함수
  const rebuildLessons = async (customAttendance = attendance, currentRoutineNumber, shouldSave = false) => {
    const raw = generateScheduleWithRollovers(student.startDate, days, totalTarget * 2, holidays);
    const filtered = raw.filter(l => !holidays.includes(l.date));

    const baseLessons = filtered.map((l, idx) => {
      const att = customAttendance?.[l.date]?.[student.name];
      let status = att?.status;
      let time = att?.time || '';
      if (!status) status = l.date < attendanceDate ? '결석' : '미정';
      return { date: l.date, status, time, originalIndex: idx };
    });

    // 보강/이월 반영
    const snapshot = await getDocs(collection(db, 'makeups'));
    const allMakeups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(m => m.name === student.name);
    const clinics = allMakeups.filter(m => m.type === '보강');

    for (const m of clinics) {
      const origin = baseLessons.find(l => l.date === m.sourceDate);
      if (origin) {
        if (m.status === '보강가능') {
          origin.status = '보강가능';
          origin.makeupDate = m.date;
        } else if (m.status === '보강완료') {
          origin.makeupDate = m.date;
          origin.status = '보강완료';
        }
      }
    }

    let merged = [...baseLessons].sort((a, b) => a.date.localeCompare(b.date));
    const existingKeys = new Set(merged.map(l => l.date + '-' + l.originalIndex));
    let lastDate = merged.length > 0 ? merged.at(-1).date : student.startDate;

    while (true) {
      const normalCount = merged.filter(m => m.status !== '이월').length;
      if (normalCount >= totalTarget) break;
      const next = generateScheduleWithRollovers(lastDate, days, 1, holidays).find(d => {
        const key = d.date + '-' + d.originalIndex;
              return !existingKeys.has(key) && !holidays.includes(d.date);  // ✅ holiday 제외 추가
      });
      if (!next) break;
      lastDate = next.date;
      existingKeys.add(next.date + '-' + next.originalIndex);
      merged.push({ date: next.date, status: '미정', time: '', originalIndex: next.originalIndex });
    }

    const sorted = merged.sort((a, b) => a.date.localeCompare(b.date));
    setLessons(sorted);

    if (shouldSave) {
      // Firestore 저장 (이건 lessons 전체 저장임)
      const reindexedForSave = [];
      let routineNumber = currentRoutineNumber || student.startRoutine || 1;
      let count = 1;
      let nonSkipCount = 0;

      for (let i = 0; i < sorted.length; i++) {
        const l = sorted[i];
        if (l.status === '이월') {
          reindexedForSave.push({ ...l, session: 'X', routineNumber });
        } else {
          reindexedForSave.push({ ...l, session: count, routineNumber });
          count++;
          nonSkipCount++;
          if (nonSkipCount === cycleSize) {
            routineNumber++;
            count = 1;
            nonSkipCount = 0;
          }
        }
      }

      await setDoc(doc(db, 'routines', student.id), {
        studentId: student.id,
        name: student.name,
        lessons: reindexedForSave.map(l => ({
          session: l.session,
          routineNumber: l.routineNumber,
          date: l.date,
          makeupDate: l.makeupDate || null,
          status: l.status,
          time: l.time || '-',
        })),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  useEffect(() => {
    const routineNum = (student?.startRoutine || 1) + currentCycle;
    rebuildLessons(undefined, routineNum, false);
  }, [student, attendanceDate, holidays, currentCycle]);

  // ✅ 출석 상태 변경 핸들러
  const handleSelectChange = async (date, newStatus) => {
    const time = ['출석', '지각'].includes(newStatus) ? new Date().toISOString().slice(11, 16) : '';
    await setDoc(doc(db, 'attendance', date), { [student.name]: { status: newStatus, time } }, { merge: true });

    if (newStatus === '이월') {
      const nextDates = generateScheduleWithRollovers(date, days, 10, holidays);
      const usedDates = lessons.map(l => l.date);
      const next = nextDates.find(d => !usedDates.includes(d.date));
      if (next) {
        await addDoc(collection(db, 'makeups'), {
          name: student.name,
          type: '이월',
          sourceDate: date,
          date: next.date,
          completed: false,
        });
      }
    } else if (newStatus === '보강') {
  const snapshot = await getDocs(collection(db, 'makeups'));
  const existing = snapshot.docs.find(docSnap => {
    const d = docSnap.data();
    return d.name === student.name && d.sourceDate === date;
  });

  if (existing) {
   await updateDoc(doc(db, 'makeups', existing.id), {
     status: '보강가능',
     date: date
   });
  } else {
    await addDoc(collection(db, 'makeups'), {
      name: student.name,
      type: '보강',
      sourceDate: date,
      date: date,
      status: '보강가능',
    });
  }
}
 else if (newStatus === '미정') {
      const snapshot = await getDocs(collection(db, 'makeups'));
      for (const docSnap of snapshot.docs) {
        const d = docSnap.data();
        if ((d.date === date || d.sourceDate === date) && d.name === student.name) {
          await deleteDoc(doc(db, 'makeups', docSnap.id));
        }
      }
      await setDoc(doc(db, 'attendance', date), {
        [student.name]: { status: '미정', time: '' }
      }, { merge: true });
    }

    const newAttendance = { ...attendance };
    if (!newAttendance[date]) newAttendance[date] = {};
    newAttendance[date][student.name] = { status: newStatus, time };
    const routineNum = (student?.startRoutine || 1) + currentCycle;
    await rebuildLessons(newAttendance, routineNum, true);

    if (onRefreshData) {
      await onRefreshData();
    }
  };

  // ✅ 화면 출력용 reindexed (lessons → 루틴 회차 붙이기)
  const displayed = [];
  let normalCount = 0;
  let idx = 0;
  let cycleStart = 0;

  for (let i = 0; i < lessons.length; i++) {
    if (lessons[i].status !== '이월') {
      if (normalCount === currentCycle * cycleSize) cycleStart = i;
      normalCount++;
    }
  }

  normalCount = 0;
  idx = cycleStart;
  while (idx < lessons.length && normalCount < cycleSize) {
    const l = lessons[idx];
      displayed.push(l);  // ✅ 보강완료도 표시
  if (l.status !== '이월' && l.status !== '보강완료') normalCount++;  // ✅ count 제외
    idx++;
  }

  const reindexed = [];
  let count = 1;
  for (let l of displayed) {
    if (l.status === '이월') {
      reindexed.push({ ...l, session: 'X' });
    } else {
      reindexed.push({ ...l, session: count++ });
    }
  }

  const handleSave = () => {
    onUpdateStudent({ ...student, lessons });
    alert('수업 일정이 저장되었습니다.');
  };
useEffect(() => {
  const unsubAttendance = onSnapshot(collection(db, 'attendance'), () => {
    const routineNum = (student?.startRoutine || 1) + currentCycle;
    rebuildLessons(attendance, routineNum, true);
  });

  const unsubMakeups = onSnapshot(collection(db, 'makeups'), () => {
    const routineNum = (student?.startRoutine || 1) + currentCycle;
    rebuildLessons(attendance, routineNum, true);
  });

  return () => {
    unsubAttendance();
    unsubMakeups();
  };
}, [student.id, attendance, currentCycle]);

  return (
    <div className={inline ? 'p-4 bg-white rounded shadow max-h-[80vh] overflow-auto' : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'}>
      <div className={inline ? '' : 'bg-white rounded p-4 w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-auto'}>
        <h2 className="text-xl font-semibold mb-2">{student.name}님의 수업 일정</h2>
        <div className="flex justify-between items-center mb-2">
          <Button disabled={currentCycle === 0} onClick={() => setCurrentCycle(c => c - 1)}>◀ 이전</Button>
          <span>루틴 {(student?.startRoutine || 1) + currentCycle}</span>
          <Button disabled={lessons.filter(l => l.status !== '이월').length <= (currentCycle + 1) * cycleSize} onClick={() => setCurrentCycle(c => c + 1)}>다음 ▶</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>회차</TableHead>
              <TableHead>날짜</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>시간</TableHead>
              <TableHead>변경</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reindexed.map((l, i) => (
              <TableRow key={i}>
                <TableCell>{l.session}</TableCell>
                <TableCell>
                  {l.makeupDate ? (
                    <div>
                      <s>{l.date}</s> ➔ <span>{l.makeupDate}</span>
                    </div>
                  ) : (
                    l.date
                  )}
                </TableCell>
                <TableCell>{l.status}</TableCell>
                <TableCell>{l.time || '-'}</TableCell>
                <TableCell>
                  <select value={l.status} onChange={e => handleSelectChange(l.date, e.target.value)}>
                    {['출석', '지각', '결석', '이월', '보강', '미정'].map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end mt-4">
          <Button size="sm" className="px-2 py-1 text-xs" onClick={handleSave}>저장</Button>
        </div>
      </div>
    </div>
  );
}
