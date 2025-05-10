// src/pages/NoticeDetailPage.jsx
import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';

export default function NoticeDetailPage() {
  const [notices, setNotices] = useState([]);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDate, setNoticeDate] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notices'), snapshot => {
      setNotices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddOrUpdateNotice = async () => {
    if (!noticeTitle || !noticeDate || !noticeContent) {
      alert('모든 항목을 입력하세요!');
      return;
    }
    if (selectedNotice) {
      await updateDoc(doc(db, 'notices', selectedNotice.id), {
        title: noticeTitle,
        date: noticeDate,
        content: noticeContent,
      });
      alert('공지사항 수정 완료!');
    } else {
      await addDoc(collection(db, 'notices'), {
        title: noticeTitle,
        date: noticeDate,
        content: noticeContent,
      });
      alert('공지사항 추가 완료!');
    }
    setSelectedNotice(null);
    setNoticeTitle('');
    setNoticeDate('');
    setNoticeContent('');
  };

  const handleEditNotice = (notice) => {
    setSelectedNotice(notice);
    setNoticeTitle(notice.title);
    setNoticeDate(notice.date);
    setNoticeContent(notice.content);
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm('삭제하시겠습니까?')) {
      await deleteDoc(doc(db, 'notices', id));
    }
  };

  return (
    <div>
      <h2>공지사항</h2>
      <Input placeholder="제목" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} />
      <Input type="date" value={noticeDate} onChange={e => setNoticeDate(e.target.value)} />
      <textarea
        placeholder="내용"
        value={noticeContent}
        onChange={e => setNoticeContent(e.target.value)}
        rows={4}
        className="w-full border rounded p-2 mb-2"
      />
      <Button onClick={handleAddOrUpdateNotice}>{selectedNotice ? '공지사항 수정' : '공지사항 추가'}</Button>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>날짜</TableHead>
            <TableHead>수정</TableHead>
            <TableHead>삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notices.map(notice => (
            <TableRow key={notice.id}>
              <TableCell>{notice.title}</TableCell>
              <TableCell>{notice.date}</TableCell>
              <TableCell>
                <Button size="sm" onClick={() => handleEditNotice(notice)}>수정</Button>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteNotice(notice.id)}>삭제</Button>
              </TableCell>
            </TableRow>
          ))}
          {notices.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">등록된 공지사항이 없습니다.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
