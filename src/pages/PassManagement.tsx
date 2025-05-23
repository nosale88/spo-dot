import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Database } from '../types/database.types';

type Pass = Database['public']['Tables']['passes']['Row'];
type PassInput = Database['public']['Tables']['passes']['Insert'];

export default function PassManagement() {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [form, setForm] = useState<PassInput>({ name: '', amount: 0, description: '' });
  const [editingId, setEditingId] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('passes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPasses(data || []);
    } catch (err) {
      console.error('이용권 불러오기 오류:', err);
      setError('이용권을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.amount === undefined) return;
    
    try {
      setLoading(true);
      
      if (editingId) {
        // 수정
        const { error } = await supabase
          .from('passes')
          .update({ 
            name: form.name, 
            amount: form.amount, 
            description: form.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);
          
        if (error) throw error;
      } else {
        // 추가
        const { error } = await supabase
          .from('passes')
          .insert([form]);
          
        if (error) throw error;
      }
      
      // 데이터 새로고침
      fetchPasses();
      setForm({ name: '', amount: 0, description: '' });
      setEditingId(null);
    } catch (err) {
      console.error('저장 중 오류:', err);
      setError('이용권 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (pass: Pass) => {
    setForm({
      name: pass.name,
      amount: pass.amount,
      description: pass.description
    });
    setEditingId(pass.id);
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 이용권을 삭제하시겠습니까?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('passes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // 데이터 새로고침
      fetchPasses();
    } catch (err) {
      console.error('삭제 중 오류:', err);
      setError('이용권 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">이용권 관리</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form className="mb-6 flex gap-2 items-end" onSubmit={handleSubmit}>
        <input 
          className="form-input" 
          placeholder="이용권명" 
          value={form.name} 
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
          required 
        />
        <input 
          className="form-input" 
          type="number" 
          placeholder="금액"
          value={form.amount || ''} 
          onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} 
          required 
        />
        <input 
          className="form-input" 
          placeholder="설명" 
          value={form.description || ''} 
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? '처리중...' : (editingId ? '수정' : '등록')}
        </button>
        {editingId && (
          <button 
            className="btn-outline" 
            type="button" 
            onClick={() => { setEditingId(null); setForm({ name: '', amount: 0, description: '' }); }}
            disabled={loading}
          >
            취소
          </button>
        )}
      </form>
      
      {loading && passes.length === 0 ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {passes.map(pass => (
            <div key={pass.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <div className="font-bold text-lg mb-1">{pass.name}</div>
              <div className="text-indigo-700 font-semibold mb-2">{pass.amount.toLocaleString()}원</div>
              <div className="text-sm text-slate-500 mb-4">{pass.description}</div>
              <div className="mt-auto flex gap-2">
                <button 
                  className="btn-outline text-xs" 
                  onClick={() => handleEdit(pass)} 
                  disabled={loading}
                >
                  수정
                </button>
                <button 
                  className="btn-danger text-xs" 
                  onClick={() => handleDelete(pass.id)} 
                  disabled={loading}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
          
          {passes.length === 0 && !loading && (
            <div className="col-span-full text-center py-8 text-gray-500">
              등록된 이용권이 없습니다. 새로운 이용권을 추가해주세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 