// src/pages/TableSubPage.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function TableSubPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const snapshot = await getDocs(collection(db, 'payments'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayments(list);
      console.log('결제완료표 데이터:', list);
    };

    fetchPayments();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>결제관리 - 결제완료표</h2>
      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>결제일</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>결제 데이터 없음</td>
            </tr>
          ) : (
            payments.map(pay => (
              <tr key={pay.id}>
                <td>{pay.name || '-'}</td>
                <td>{pay.date || '-'}</td>
                <td>{pay.status || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TableSubPage;
