// src/pages/PointSubPage.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/Table';

export default function PointSubPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), qs => {
      const list = qs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(list);
    });
    return () => unsub();
  }, []);

  const sorted = [...students].sort((a, b) => {
    const aTotal = Object.values(a.points || {}).reduce((sum, v) => sum + v, 0);
    const bTotal = Object.values(b.points || {}).reduce((sum, v) => sum + v, 0);
    return bTotal - aTotal;
  });

  return (
    <div>
      <h2>포인트 랭킹</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>순위</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>총점</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((stu, idx) => (
            <TableRow key={stu.id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{stu.name}</TableCell>
              <TableCell>{Object.values(stu.points || {}).reduce((sum, v) => sum + v, 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
