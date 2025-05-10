// src/pages/NoticeManagePage.jsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

function NoticeManagePage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      const snapshot = await getDocs(collection(db, 'notices'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotices(list);
    };

    fetchNotices();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>공지사항 관리</h2>
      {notices.length === 0 ? (
        <p>공지사항이 없습니다.</p>
      ) : (
        <ul>
          {notices.map(notice => (
            <li key={notice.id}>
              <Link to={`/notice/detail?id=${notice.id}`}>
                {notice.title || '(제목없음)'}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/notice/holiday" style={{ display: 'block', marginTop: '20px' }}>
        휴일 관리로 이동
      </Link>
    </div>
  );
}

export default NoticeManagePage;
