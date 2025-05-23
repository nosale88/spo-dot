import { useState, useRef } from 'react';
import { format, subWeeks, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

const MOCK_VENDING = [
  { id: 1, name: '1층 자판기' },
  { id: 2, name: '2층 자판기' },
];

export default function VendingSales() {
  const [form, setForm] = useState({
    vendingId: '',
    type: '입금',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  });
  const [records, setRecords] = useState<any[]>([]);
  const [period, setPeriod] = useState<'day'|'week'|'month'>('day');
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendingId || !form.amount || !form.date) return;
    setRecords(r => [
      ...r,
      { ...form, id: Date.now(), vendingName: MOCK_VENDING.find(v=>v.id===Number(form.vendingId))?.name||'' }
    ]);
    setForm(f => ({ ...f, amount: '', note: '' }));
  };

  const now = new Date();
  let startDate = now;
  if (period === 'week') startDate = subWeeks(now, 1);
  else if (period === 'month') startDate = subMonths(now, 1);

  const filtered = records.filter(r => {
    const d = parseISO(r.date);
    return isWithinInterval(d, { start: startDate, end: now });
  });
  const total = filtered.reduce((sum, r) => sum + (r.type === '입금' ? Number(r.amount) : -Number(r.amount)), 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">자판기 매출</h2>
      <div className="flex flex-row gap-2 mb-4 items-center">
        <button className={`px-4 py-1.5 rounded-lg font-semibold transition border ${period==='day' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setPeriod('day')}>1일</button>
        <button className={`px-4 py-1.5 rounded-lg font-semibold transition border ${period==='week' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setPeriod('week')}>1주</button>
        <button className={`px-4 py-1.5 rounded-lg font-semibold transition border ${period==='month' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setPeriod('month')}>1달</button>
      </div>
      <form className="mb-6 flex flex-wrap gap-2 items-end" onSubmit={handleSubmit}>
        <select className="form-select border rounded px-3 py-2" value={form.vendingId} onChange={e=>setForm(f=>({...f, vendingId:e.target.value}))} required>
          <option value="">자판기 선택</option>
          {MOCK_VENDING.map(v=>(<option key={v.id} value={v.id}>{v.name}</option>))}
        </select>
        <select className="form-select border rounded px-3 py-2" value={form.type} onChange={e=>setForm(f=>({...f, type:e.target.value}))}>
          <option value="입금">입금</option>
          <option value="출금">출금</option>
        </select>
        <input className="form-input border rounded px-3 py-2" type="number" placeholder="금액" value={form.amount} onChange={e=>setForm(f=>({...f, amount:e.target.value}))} required />
        <input className="form-input border rounded px-3 py-2" type="date" value={form.date} onChange={e=>setForm(f=>({...f, date:e.target.value}))} required />
        <input className="form-input border rounded px-3 py-2" placeholder="비고" value={form.note} onChange={e=>setForm(f=>({...f, note:e.target.value}))} />
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition" type="submit">추가</button>
      </form>
      <div ref={printRef} className="mb-4">
        <table className="w-full border mb-2">
          <thead>
            <tr className="bg-slate-100">
              <th className="border px-2 py-1">날짜</th>
              <th className="border px-2 py-1">자판기</th>
              <th className="border px-2 py-1">입출</th>
              <th className="border px-2 py-1">금액</th>
              <th className="border px-2 py-1">비고</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id}>
                <td className="border px-2 py-1">{r.date}</td>
                <td className="border px-2 py-1">{r.vendingName}</td>
                <td className="border px-2 py-1">{r.type}</td>
                <td className={`border px-2 py-1 text-right ${r.type==='출금' ? 'text-red-600' : ''}`}>{Number(r.amount).toLocaleString()}원</td>
                <td className="border px-2 py-1">{r.note}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-slate-400 py-4">작성된 내역 없음</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mb-2">
        <span className="font-bold">합계: {total.toLocaleString()}원</span>
      </div>
      <div className="flex justify-end">
        <button
          className={`border px-4 py-2 rounded font-semibold transition ${filtered.length===0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'}`}
          onClick={handlePrint}
          disabled={filtered.length===0}
        >
          PDF 다운로드
        </button>
      </div>
    </div>
  );
} 