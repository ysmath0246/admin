// src/pages/MakeupSubPage.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';

export default function MakeupSubPage() {
  const [makeups, setMakeups] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'makeups'), qs => {
      const list = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMakeups(list);
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <h2>전체 보강 목록</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead>타입</TableHead>
            <TableHead>완료</TableHead>
            <TableHead>삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {makeups.map(m => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.date}</TableCell>
              <TableCell>{m.type}</TableCell>
              <TableCell>{m.completed ? '✅' : '❌'}</TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={async () => {
                  if (window.confirm('삭제하시겠습니까?')) {
                    await deleteDoc(doc(db, 'makeups', m.id));
                  }
                }}>
                  삭제
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
