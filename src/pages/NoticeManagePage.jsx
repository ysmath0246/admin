// src/pages/NoticeManagePage.jsx
import { useState } from 'react';
import NoticeDetailPage from './NoticeDetailPage';
import HolidayPage from './HolidayPage';
import { Button } from '../components/ui/button';

export default function NoticeManagePage() {
  const [tab, setTab] = useState('notice');

  return (
    <div className="p-4">
      <h1>공지사항 관리</h1>
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={tab === 'notice' ? 'default' : 'outline'} onClick={() => setTab('notice')}>
          공지사항
        </Button>
        <Button size="sm" variant={tab === 'holiday' ? 'default' : 'outline'} onClick={() => setTab('holiday')}>
          휴일
        </Button>
      </div>

      {tab === 'notice' && <NoticeDetailPage />}
      {tab === 'holiday' && <HolidayPage />}
    </div>
  );
}
