import { useState, useRef, useEffect } from 'react';
import { format, subWeeks, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { supabase } from '../supabaseClient';
import type { Database } from '../types/database.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Pass = Database['public']['Tables']['passes']['Row'];
type Sale = Database['public']['Tables']['sales']['Row'] & { pass_name?: string };

const getRange = (type: 'day' | 'week' | 'month') => {
  const now = new Date();
  if (type === 'day') return { start: now, end: now };
  if (type === 'week') return { start: subWeeks(now, 1), end: now };
  return { start: subMonths(now, 1), end: now };
};

export default function SalesReportUser() {
  const [rangeType, setRangeType] = useState<'day' | 'week' | 'month'>('week');
  const [customRange, setCustomRange] = useState<{start: string, end: string}|null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    documentTitle: '매출 보고서',
    content: () => printRef.current,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 이용권 데이터 가져오기
        const { data: passesData, error: passesError } = await supabase
          .from('passes')
          .select('*');
        
        if (passesError) throw passesError;
        
        // 매출 데이터 가져오기
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('*, passes(name)');
        
        if (salesError) throw salesError;
        
        // 데이터 변환 - passes 관계에서 이름 추출
        const formattedSales = salesData.map(sale => ({
          ...sale,
          pass_name: sale.passes?.name || '-'
        }));
        
        setPasses(passesData || []);
        setSales(formattedSales || []);
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const { start, end } = customRange
    ? { start: parseISO(customRange.start), end: parseISO(customRange.end) }
    : getRange(rangeType);

  const filtered = sales.filter(sale =>
    sale.sale_date && isWithinInterval(parseISO(sale.sale_date), { start, end })
  );

  const total = filtered.reduce((sum, sale) => sum + sale.amount, 0);
  
  // 이용권별 데이터
  const byPass = passes.map(pass => ({
    ...pass,
    total: sales.filter(sale =>
      sale.sale_date && isWithinInterval(parseISO(sale.sale_date), { start, end }) && 
      sale.pass_id === pass.id
    ).reduce((sum, sale) => sum + sale.amount, 0)
  }));

  // 차트 데이터
  const chartData = {
    labels: byPass.map(p => p.name),
    datasets: [
      {
        label: '매출(원)',
        data: byPass.map(p => p.total),
        backgroundColor: 'rgba(59,130,246,0.7)',
      },
    ],
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">매출 보고서</h2>
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 p-4 rounded mb-6 text-sm">
            <p className="font-medium">일반 사용자용 매출 보고서입니다. 이 페이지에서는 보고서를 조회하고 인쇄할 수 있지만, 상세 정보는 일부 제한됩니다.</p>
          </div>
          
          <div className="flex flex-row flex-wrap gap-2 mb-6 items-center">
            <button className={`px-4 py-1.5 rounded-lg font-semibold transition border ${rangeType==='day' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setRangeType('day')}>1일</button>
            <button className={`px-4 py-1.5 rounded-lg font-semibold transition border ${rangeType==='week' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setRangeType('week')}>1주</button>
            <button className={`px-4 py-1.5 rounded-lg font-semibold transition border ${rangeType==='month' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`} onClick={()=>setRangeType('month')}>1달</button>
            <label className="ml-4 font-semibold">직접선택:</label>
            <input className="form-input border rounded px-3 py-1.5" type="date" value={customRange?.start||''} onChange={e=>setCustomRange(r=>({...r!, start:e.target.value, end:r?.end||e.target.value}))} />
            <span className="mx-1">~</span>
            <input className="form-input border rounded px-3 py-1.5" type="date" value={customRange?.end||''} onChange={e=>setCustomRange(r=>({...r!, end:e.target.value, start:r?.start||e.target.value}))} />
            <button className="ml-2 border px-4 py-1.5 rounded-lg font-semibold bg-white hover:bg-gray-100 text-gray-700 border-gray-300 transition" onClick={()=>setCustomRange(null)}>초기화</button>
          </div>
          
          <div className="mb-8">
            <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} height={80} />
          </div>
          
          <div ref={printRef} className="bg-white p-6 rounded shadow mb-4">
            <div className="flex justify-between mb-4">
              <div>
                <div className="font-bold text-lg">[견적서] 매출 보고서</div>
                <div className="text-sm text-slate-500">기간: {format(start, 'yyyy-MM-dd')} ~ {format(end, 'yyyy-MM-dd')}</div>
              </div>
              <div className="text-right text-sm">
                <div>회사명: (주)스포닷</div>
                <div>발행일: {format(new Date(), 'yyyy-MM-dd')}</div>
              </div>
            </div>
            
            <table className="w-full border mb-4">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border px-2 py-1">날짜</th>
                  <th className="border px-2 py-1">이용권</th>
                  <th className="border px-2 py-1 text-right">금액(원)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sale => (
                  <tr key={sale.id}>
                    <td className="border px-2 py-1">{sale.sale_date ? format(parseISO(sale.sale_date), 'yyyy-MM-dd') : '-'}</td>
                    <td className="border px-2 py-1">{sale.pass_name || '-'}</td>
                    <td className="border px-2 py-1 text-right">{sale.amount.toLocaleString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-slate-400 py-4">데이터 없음</td></tr>
                )}
              </tbody>
            </table>
            
            <div className="text-right font-bold text-lg">총 합계: {total.toLocaleString()}원</div>
          </div>
          
          <button className="btn btn-primary" onClick={handlePrint}>PDF 다운로드</button>
        </>
      )}
    </div>
  );
} 