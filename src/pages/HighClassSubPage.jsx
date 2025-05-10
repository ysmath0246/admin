// src/pages/HighClassSubPage.jsx
function HighClassSubPage({ highStudents }) {
  return (
    <div>
      <h3>고등부 학생 목록</h3>
      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>이름</th>
            <th>생년월일</th>
            <th>학부모 번호</th>
            <th>수업 요일</th>
          </tr>
        </thead>
        <tbody>
          {highStudents.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>등록된 고등부 학생 없음</td>
            </tr>
          ) : (
            highStudents.map(student => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.birth}</td>
                <td>{student.parentPhone}</td>
                <td>{student.schedules.map(s => s.day).join(', ')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default HighClassSubPage;
