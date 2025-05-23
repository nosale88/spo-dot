import { useState } from 'react';

const MOCK_OT_MEMBERS = [
  { id: 1, name: '김철수', phone: '010-1111-2222' },
  { id: 2, name: '박지민', phone: '010-3333-4444' },
  { id: 3, name: '이영희', phone: '010-5555-6666' },
];
const MOCK_STAFF = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '최수진' },
  { id: 3, name: '정우성' },
];

export default function OtAssignment() {
  const [assignments, setAssignments] = useState<{[memberId:number]:number|null}>({});
  const [toast, setToast] = useState<string|null>(null);

  const handleAssign = (memberId:number, staffId:number) => {
    setAssignments(a => ({ ...a, [memberId]: staffId }));
    setToast('담당자 배정 완료!');
    setTimeout(()=>setToast(null), 1200);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">OT배정</h2>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded shadow-lg z-50">{toast}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {MOCK_OT_MEMBERS.map(m => (
          <div key={m.id} className="bg-white rounded-xl shadow p-6 flex flex-col items-start border border-slate-200">
            <div className="font-bold text-lg mb-1">{m.name}</div>
            <div className="text-slate-500 text-sm mb-2">{m.phone}</div>
            <div className="mb-3 w-full">
              <label className="block text-xs mb-1 text-slate-400">담당자</label>
              <select
                className="form-select border rounded px-3 py-2 w-full"
                value={assignments[m.id]||''}
                onChange={e=>handleAssign(m.id, Number(e.target.value))}
              >
                <option value="">선택</option>
                {MOCK_STAFF.map(s=>(<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div className="mt-auto w-full flex items-center justify-between">
              <span className={assignments[m.id] ? "text-green-600 font-bold" : "text-slate-400"}>
                {assignments[m.id] ? `배정됨 (${MOCK_STAFF.find(s=>s.id===assignments[m.id])?.name})` : '미배정'}
              </span>
              <button
                className={`ml-2 px-4 py-1.5 rounded bg-blue-600 text-white font-semibold transition ${assignments[m.id] ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                disabled={!!assignments[m.id]}
                onClick={()=>{
                  if (!assignments[m.id]) setToast('담당자를 선택하세요!');
                }}
              >
                배정
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 