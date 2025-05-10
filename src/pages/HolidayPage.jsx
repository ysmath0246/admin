// src/pages/HolidayManagePage.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';

function HolidayManagePage() {
  const [holidays, setHolidays] = useState([]);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'holidays'), snapshot => {
      setHolidays(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddHoliday = async () => {
    if (!holidayName || !holidayDate) {
      alert('휴일명과 날짜를 입력하세요!');
      return;
    }
    await addDoc(collection(db, 'holidays'), { name: holidayName, date: holidayDate });
    setHolidayName('');
    setHolidayDate('');
    alert('휴일 추가 완료!');
  };

  const handleDeleteHoliday = async (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      await deleteDoc(doc(db, 'holidays', id));
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">휴일 관리</h2>
      <div className="space-y-2 mb-4">
        <Input placeholder="휴일명" value={holidayName} onChange={e => setHolidayName(e.target.value)} />
        <Input type="date" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} />
        <Button onClick={handleAddHoliday}>휴일 추가</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead>삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holidays.map(hol => (
            <TableRow key={hol.id}>
              <TableCell>{hol.name}</TableCell>
              <TableCell>{hol.date}</TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteHoliday(hol.id)}>삭제</Button>
              </TableCell>
            </TableRow>
          ))}
          {holidays.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">등록된 휴일이 없습니다.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default HolidayManagePage;
