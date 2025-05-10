// src/pages/MakeupSubPage.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function MakeupSubPage() {
  const [makeups, setMakeups] = useState([]);
  const [name, setName] = useState('');
  const [sourceDate, setSourceDate] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('보강');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'makeups'), qs => {
      const list = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMakeups(list);
    });
    return () => unsub();
  }, []);

  const handleAddMakeup = async () => {
    if (!name || !sourceDate || !date) {
      alert('이름, 원래수업일, 보강날짜 입력하세요!');
      return;
    }
    await addDoc(collection(db, 'makeups'), {
      name,
      sourceDate,
      date,
      type,
      completed: false
    });
    setName('');
    setSourceDate('');
    setDate('');
    alert('보강 등록 완료!');
  };

  const handleDateChange = async (id, newDate) => {
    await updateDoc(doc(db, 'makeups', id), { date: newDate });
    alert('날짜 수정 완료!');
  };

  return (
    <div>
      <h2>전체 보강 목록</h2>
      <div className="space-y-2 mb-4">
        <Input placeholder="이름" value={name} onChange={e => setName(e.target.value)} />
        <Input placeholder="원래수업일 (YYYY-MM-DD)" value={sourceDate} onChange={e => setSourceDate(e.target.value)} />
        <Input placeholder="보강날짜 (YYYY-MM-DD)" value={date} onChange={e => setDate(e.target.value)} />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="보강">보강</option>
          <option value="클리닉">클리닉</option>
        </select>
        <Button size="sm" onClick={handleAddMakeup}>보강 추가</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>원래수업일</TableHead>
            <TableHead>보강날짜</TableHead>
            <TableHead>타입</TableHead>
            <TableHead>완료</TableHead>
            <TableHead>저장</TableHead>
            <TableHead>삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {makeups.map(m => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.sourceDate}</TableCell>
              <TableCell>
                <Input
                  type="date"
                  value={m.date}
                  onChange={e => {
                    const updated = [...makeups];
                    const idx = updated.findIndex(mm => mm.id === m.id);
                    updated[idx].date = e.target.value;
                    setMakeups(updated);
                  }}
                />
              </TableCell>
              <TableCell>{m.type}</TableCell>
              <TableCell>{m.completed ? '✅' : '❌'}</TableCell>
              <TableCell>
              <Button size="sm" onClick={async () => {
  if (window.confirm('이 보강을 완료 처리할까요?')) {
    await updateDoc(doc(db, 'makeups', m.id), { completed: true, status: '보강완료' });
    alert('보강이 완료되었습니다!');
  }
}}>
  완료
</Button>

              </TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (window.confirm('삭제하시겠습니까?')) await deleteDoc(doc(db, 'makeups', m.id));
                }}>삭제</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
