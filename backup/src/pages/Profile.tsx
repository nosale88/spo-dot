import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit, Save, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // 프로필 정보 (실제로는 API에서 가져옴)
  const [profileData, setProfileData] = useState({
    name: user?.name || '사용자',
    email: user?.email || 'user@example.com',
    phone: '010-1234-5678',
    address: '서울시 강남구',
    position: user?.role === 'admin' ? '관리자' : 
              user?.role === 'trainer' ? '트레이너' : '직원',
    joinDate: '2023년 5월 15일',
    bio: '10년 경력의 피트니스 전문가입니다. 헬스 트레이닝 및 영양 관리 전문.',
  });

  // 편집 데이터
  const [editData, setEditData] = useState(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSave = () => {
    // 실제로는 API를 통해 저장
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">내 프로필</h1>
        {!isEditing ? (
          <button 
            onClick={handleEdit}
            className="btn btn-outline inline-flex items-center"
          >
            <Edit size={16} className="mr-2" />
            프로필 수정
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="btn btn-primary inline-flex items-center"
          >
            <Save size={16} className="mr-2" />
            저장하기
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 프로필 카드 */}
        <div className="card p-6 md:col-span-1">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-primary/20">
              <img 
                src={user?.profileImage || "https://via.placeholder.com/128"} 
                alt="프로필 이미지" 
                className="w-full h-full object-cover"
              />
            </div>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
                className="form-input text-center text-xl font-bold mb-1"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profileData.name}</h2>
            )}
            <p className="text-sm text-primary font-medium">{profileData.position}</p>
            <div className="w-full mt-6 space-y-3">
              <div className="flex items-center">
                <Calendar size={18} className="text-slate-400 mr-3" />
                <span className="text-sm text-slate-600 dark:text-slate-300">{profileData.joinDate} 입사</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="card p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">개인 정보</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">이메일</label>
                <div className="flex items-center">
                  <Mail size={18} className="text-slate-400 mr-2" />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white">{profileData.email}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">전화번호</label>
                <div className="flex items-center">
                  <Phone size={18} className="text-slate-400 mr-2" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={editData.phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-white">{profileData.phone}</p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">주소</label>
              <div className="flex items-center">
                <MapPin size={18} className="text-slate-400 mr-2" />
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editData.address}
                    onChange={handleChange}
                    className="form-input w-full"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">{profileData.address}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">자기소개</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editData.bio}
                  onChange={handleChange}
                  className="form-input w-full h-24"
                />
              ) : (
                <p className="text-slate-900 dark:text-white">{profileData.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* 설정 */}
        <div className="card p-6 md:col-span-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">계정 설정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">알림 설정</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">이메일 및 앱 알림 설정</p>
              </div>
              <button className="btn btn-sm btn-outline">설정</button>
            </div>
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">비밀번호 변경</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">계정 비밀번호 변경</p>
              </div>
              <button className="btn btn-sm btn-outline">변경</button>
            </div>
            <div className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">다중 인증(MFA)</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">계정 보안 강화</p>
              </div>
              <button className="btn btn-sm btn-outline">설정</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;