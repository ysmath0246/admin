// src/pages/NoticeDetailPage.jsx
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSearchParams } from 'react-router-dom';

function NoticeDetailPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const fetchNotice = async () => {
      if (id) {
        const docSnap = await getDoc(doc(db, 'notices', id));
        if (docSnap.exists()) {
          setNotice(docSnap.data());
        }
      }
    };

    fetchNotice();
  }, [id]);

  if (!notice) return <p>공지사항을 불러오는 중...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>공지사항 디테일</h2>
      <h3>{notice.title}</h3>
      <p>{notice.content}</p>
    </div>
  );
}

export default NoticeDetailPage;
