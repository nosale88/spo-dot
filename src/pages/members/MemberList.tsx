import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, Edit, Trash2, Eye, FilterIcon, RefreshCw } from 'lucide-react';
import { useMember, Member } from '../../contexts/MemberContext';
import { supabase } from '../../lib/supabase';

export default function MemberList() {
  const { members } = useMember();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          모든 회원 정보를 관리할 수 있습니다.
        </p>
      </header>

      {members.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">등록된 회원이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">이름</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">이메일</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">전화번호</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">가입일</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">회원권</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {members.map((member: Member) => (
                <tr key={member.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                    {member.first_name} {member.last_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {member.phone}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(member.join_date).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {member.membership_type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' :
                      member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.status === 'active' ? '활성' :
                       member.status === 'inactive' ? '비활성' :
                       member.status === 'pending' ? '대기중' : '만료됨'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 