import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Calendar, Clock, User, CheckSquare, MoreHorizontal, X, Edit, Trash } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, subMonths, addWeeks, subWeeks, parseISO, isSameDay, isSameMonth, getDate, getDaysInMonth, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import AddScheduleForm from '../components/forms/AddScheduleForm';
import EditScheduleForm from '../components/forms/EditScheduleForm';
import { useSchedule, Schedule as ScheduleType, SessionType } from '../contexts/ScheduleContext';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

// ... (기존 타입 정의 유지)

const Schedule = () => {
  const { user } = useAuth();
  const { schedules, filteredSchedules, filterSchedules, markScheduleComplete, deleteSchedule } = useSchedule();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<SessionType | 'all'>('all');
  const [showEditForm, setShowEditForm] = useState(false);
  // 날짜 확장 보기를 위한 상태 추가
  const [expandedDay, setExpandedDay] = useState<Date | null>(null);
  const [daySchedules, setDaySchedules] = useState<ScheduleType[]>([]);
  
  // 날짜에 맞는 일정 필터링
  useEffect(() => {
    let dateStr = format(currentDate, 'yyyy-MM-dd');
    
    if (currentView === 'month') {
      // 월간 보기에서는 날짜 필터를 적용하지 않음
      filterSchedules({
        searchQuery,
        type: filterType !== 'all' ? filterType : undefined
      });
    } else {
      filterSchedules({
        date: currentView === 'day' ? dateStr : undefined,
        searchQuery,
        type: filterType !== 'all' ? filterType : undefined
      });
    }
  }, [currentDate, currentView, searchQuery, filterType, schedules]);
  
  // 이전 날짜로 이동
  const handlePrevious = () => {
    if (currentView === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    } else if (currentView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (currentView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  // 다음 날짜로 이동
  const handleNext = () => {
    if (currentView === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };
  
  // 오늘로 이동
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // 요일별 일정 그룹화
  const getWeekSchedules = () => {
    const startDate = startOfWeek(currentDate, { locale: ko });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    
    return weekDays.map(day => {
      const daySchedules = filteredSchedules.filter(schedule => 
        isSameDay(parseISO(schedule.date), day)
      );
      
      return {
        date: day,
        schedules: daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime))
      };
    });
  };
  
  // 월간 일정 그룹화를 위한 함수
  const getMonthSchedules = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ko });
    const endDate = endOfWeek(monthEnd, { locale: ko });
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days.map(day => {
      const daySchedules = filteredSchedules.filter(schedule => 
        isSameDay(parseISO(schedule.date), day)
      );
      
      return {
        date: day,
        isCurrentMonth: isSameMonth(day, currentDate),
        schedules: daySchedules.sort((a, b) => a.startTime.localeCompare(b.startTime))
      };
    });
  };
  
  // 세션 유형에 따른 배지 색상
  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case 'PT':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'OT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'GROUP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'CONSULT':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
  };
  
  // 세션 유형 텍스트
  const getSessionTypeText = (type: SessionType) => {
    switch (type) {
      case 'PT': return 'PT 세션';
      case 'OT': return 'OT 세션';
      case 'GROUP': return '그룹 수업';
      case 'CONSULT': return '상담';
    }
  };
  
  // 일정 완료 상태 변경
  const handleCompleteToggle = (id: string, isCompleted: boolean) => {
    markScheduleComplete(id, !isCompleted);
  };
  
  // 일정 삭제
  const handleDeleteSchedule = (id: string) => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      deleteSchedule(id);
      if (selectedSchedule?.id === id) {
        setSelectedSchedule(null);
        setShowDetails(false);
      }
    }
  };

  // 날짜 확장 보기 열기 함수
  const handleExpandDay = (day: Date, schedules: ScheduleType[]) => {
    setExpandedDay(day);
    setDaySchedules(schedules);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">일정 관리</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="고객 또는 트레이너 검색"
              className="form-input pl-10 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            className="form-input py-2 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as SessionType | 'all')}
          >
            <option value="all">모든 유형</option>
            <option value="PT">PT 세션</option>
            <option value="OT">OT 세션</option>
            <option value="GROUP">그룹 수업</option>
            <option value="CONSULT">상담</option>
          </select>
          
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary inline-flex items-center px-4 py-2 rounded-full transition-transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Plus size={18} className="mr-1.5" />
            일정 추가
          </button>
        </div>
      </div>

      {/* 일정 보기 컨트롤 */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentView('day')}
            className={clsx(
              'px-3 py-1.5 rounded text-sm font-medium',
              currentView === 'day' 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            )}
          >
            일간
          </button>
          <button
            onClick={() => setCurrentView('week')}
            className={clsx(
              'px-3 py-1.5 rounded text-sm font-medium',
              currentView === 'week' 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            )}
          >
            주간
          </button>
          <button
            onClick={() => setCurrentView('month')}
            className={clsx(
              'px-3 py-1.5 rounded text-sm font-medium',
              currentView === 'month' 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
            )}
          >
            월간
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handlePrevious}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          
          <button
            onClick={handleToday}
            className="px-3 py-1 rounded text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            오늘
          </button>
          
          <button 
            onClick={handleNext}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {currentView === 'day' 
              ? format(currentDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko }) 
              : currentView === 'week'
                ? `${format(startOfWeek(currentDate, { locale: ko }), 'yyyy년 M월 d일')} ~ ${format(addDays(startOfWeek(currentDate, { locale: ko }), 6), 'M월 d일')}`
                : format(currentDate, 'yyyy년 M월', { locale: ko })
            }
          </h3>
        </div>
        
        <div className="w-20"> {/* 우측 여백용 */}
        </div>
      </div>
      
      {/* 일정 내용 - 일간 보기 */}
      {currentView === 'day' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {format(currentDate, 'M월 d일 (EEEE)', { locale: ko })}의 일정
            </h3>
            
            <div className="space-y-3">
              {filteredSchedules.filter(schedule => 
                isSameDay(parseISO(schedule.date), currentDate)
              ).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(schedule => (
                <div 
                  key={schedule.id}
                  className={clsx(
                    "p-4 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50",
                    schedule.isCompleted 
                      ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30" 
                      : "border-slate-200 dark:border-slate-700"
                  )}
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        <span className={clsx(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          getSessionTypeColor(schedule.type)
                        )}>
                          {getSessionTypeText(schedule.type)}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">{schedule.clientName}</h4>
                        <div className="flex items-center space-x-3 mt-1 text-sm">
                          <span className="flex items-center text-slate-600 dark:text-slate-400">
                            <Clock size={14} className="mr-1.5" />
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          <span className="flex items-center text-slate-600 dark:text-slate-400">
                            <User size={14} className="mr-1.5" />
                            {schedule.trainerName}
                          </span>
                        </div>
                        
                        {schedule.notes && (
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{schedule.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteToggle(schedule.id, schedule.isCompleted);
                        }}
                        className={clsx(
                          "p-1.5 rounded-full",
                          schedule.isCompleted 
                            ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" 
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        <CheckSquare size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredSchedules.filter(schedule => 
                isSameDay(parseISO(schedule.date), currentDate)
              ).length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">이 날짜에 예정된 일정이 없습니다.</p>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    <Plus size={16} className="mr-1.5" />
                    일정 추가하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 일정 내용 - 주간 보기 */}
      {currentView === 'week' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
            {getWeekSchedules().map((day, index) => (
              <div 
                key={index} 
                className={clsx(
                  "py-2 text-center font-medium border-r last:border-r-0 border-slate-200 dark:border-slate-700",
                  isSameDay(day.date, new Date()) && "bg-primary-50 dark:bg-primary-900/10"
                )}
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {format(day.date, 'EEEE', { locale: ko })}
                </p>
                <p className={clsx(
                  "text-lg font-semibold",
                  isSameDay(day.date, new Date()) 
                    ? "text-primary" 
                    : "text-slate-900 dark:text-white"
                )}>
                  {format(day.date, 'd')}
                </p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 h-[calc(100vh-350px)] min-h-[500px]">
            {getWeekSchedules().map((day, index) => (
              <div 
                key={index} 
                className={clsx(
                  "border-r last:border-r-0 border-slate-200 dark:border-slate-700 p-2 overflow-y-auto",
                  isSameDay(day.date, new Date()) && "bg-primary-50 dark:bg-primary-900/10"
                )}
              >
                {day.schedules.map(schedule => (
                  <div 
                    key={schedule.id}
                    className={clsx(
                      "p-2 mb-2 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50",
                      schedule.isCompleted 
                        ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30" 
                        : "border-slate-200 dark:border-slate-700"
                    )}
                    onClick={() => {
                      setSelectedSchedule(schedule);
                      setShowDetails(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={clsx(
                        "px-1.5 py-0.5 rounded-full text-xs font-medium",
                        getSessionTypeColor(schedule.type)
                      )}>
                        {getSessionTypeText(schedule.type)}
                      </span>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteToggle(schedule.id, schedule.isCompleted);
                        }}
                        className={clsx(
                          "p-1 rounded-full",
                          schedule.isCompleted 
                            ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" 
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        <CheckSquare size={14} />
                      </button>
                    </div>
                    
                    <h4 className="mt-1 font-medium text-sm text-slate-900 dark:text-white truncate">{schedule.clientName}</h4>
                    
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                  </div>
                ))}
                
                {day.schedules.length === 0 && (
                  <div 
                    className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
                    onClick={() => {
                      setCurrentDate(day.date);
                      setShowAddForm(true);
                    }}
                  >
                    <span className="text-slate-400 dark:text-slate-500 text-sm">
                      <Plus size={18} className="mx-auto mb-1" />
                      일정 추가
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 일정 내용 - 월간 보기 */}
      {currentView === 'month' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div key={index} className="py-2 text-center font-medium text-slate-500 dark:text-slate-400">
                {day}요일
              </div>
            ))}
          </div>
          
          {/* 달력 */}
          <div className="grid grid-cols-7 grid-rows-6 h-[calc(100vh-300px)] min-h-[600px]">
            {getMonthSchedules().map((day, index) => (
              <div 
                key={index} 
                className={clsx(
                  "border-r border-b last:border-r-0 border-slate-200 dark:border-slate-700 p-1 overflow-hidden",
                  !day.isCurrentMonth && "bg-slate-50 dark:bg-slate-800/50",
                  isSameDay(day.date, new Date()) && "bg-primary-50 dark:bg-primary-900/10"
                )}
              >
                <div className="flex justify-between items-center">
                  <span 
                    className={clsx(
                      "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700",
                      isSameDay(day.date, new Date()) && "bg-primary text-white hover:bg-primary-dark",
                      !isSameDay(day.date, new Date()) && day.isCurrentMonth ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                    )}
                    onClick={() => day.schedules.length > 0 && handleExpandDay(day.date, day.schedules)}
                  >
                    {format(day.date, 'd')}
                  </span>
                  
                  {day.isCurrentMonth && (
                    <button 
                      className="text-primary hover:text-primary-dark p-1 rounded-full"
                      onClick={() => {
                        setCurrentDate(day.date);
                        setShowAddForm(true);
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
                
                <div className="mt-1 space-y-1 max-h-[80%] overflow-hidden">
                  {day.schedules.slice(0, 3).map(schedule => (
                    <div 
                      key={schedule.id}
                      className={clsx(
                        "p-1 text-xs rounded truncate cursor-pointer text-white",
                        schedule.type === 'PT' && "bg-blue-500 dark:bg-blue-600",
                        schedule.type === 'OT' && "bg-green-500 dark:bg-green-600",
                        schedule.type === 'GROUP' && "bg-purple-500 dark:bg-purple-600",
                        schedule.type === 'CONSULT' && "bg-orange-500 dark:bg-orange-600",
                        schedule.isCompleted && "opacity-60"
                      )}
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setShowDetails(true);
                      }}
                    >
                      {schedule.startTime.slice(0, 5)} {schedule.clientName}
                    </div>
                  ))}
                  
                  {day.schedules.length > 3 && (
                    <div 
                      className="text-xs text-center text-slate-500 dark:text-slate-400 cursor-pointer hover:text-primary"
                      onClick={() => handleExpandDay(day.date, day.schedules)}
                    >
                      +{day.schedules.length - 3}개 더보기
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 일정 추가 폼 */}
      {showAddForm && (
        <AddScheduleForm 
          initialDate={format(currentDate, 'yyyy-MM-dd')} 
          onClose={() => setShowAddForm(false)} 
        />
      )}
      
      {/* 일정 수정 폼 */}
      {showEditForm && selectedSchedule && (
        <EditScheduleForm 
          schedule={selectedSchedule} 
          onClose={() => {
            setShowEditForm(false);
            setSelectedSchedule(null);
          }} 
        />
      )}
      
      {/* 일정 상세 보기 */}
      {showDetails && selectedSchedule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                일정 상세 정보
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setShowEditForm(true);
                    setShowDetails(false);
                  }}
                  className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                  className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash size={20} />
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={clsx(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    getSessionTypeColor(selectedSchedule.type)
                  )}>
                    {getSessionTypeText(selectedSchedule.type)}
                  </span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{selectedSchedule.clientName}</h3>
                </div>
                
                <button 
                  onClick={() => handleCompleteToggle(selectedSchedule.id, selectedSchedule.isCompleted)}
                  className={clsx(
                    "p-2 rounded",
                    selectedSchedule.isCompleted 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  )}
                >
                  {selectedSchedule.isCompleted ? '완료됨' : '완료로 표시'}
                </button>
              </div>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Calendar size={18} className="mr-2 text-primary" />
                  <span>{format(parseISO(selectedSchedule.date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })}</span>
                </div>
                
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Clock size={18} className="mr-2 text-primary" />
                  <span>{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                </div>
              </div>
              
              <div className="flex items-center text-slate-700 dark:text-slate-300">
                <User size={18} className="mr-2 text-primary" />
                <span>담당 트레이너: {selectedSchedule.trainerName}</span>
              </div>
              
              {selectedSchedule.notes && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">메모</h4>
                  <p className="text-slate-700 dark:text-slate-300">{selectedSchedule.notes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 날짜별 일정 확장 보기 모달 */}
      {expandedDay && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={() => setExpandedDay(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                {format(expandedDay, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}의 일정
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCurrentDate(expandedDay);
                    setShowAddForm(true);
                    setExpandedDay(null);
                  }}
                  className="text-primary hover:text-primary-dark"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => setExpandedDay(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              <div className="space-y-3">
                {daySchedules.length > 0 ? (
                  daySchedules
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(schedule => (
                      <div 
                        key={schedule.id}
                        className={clsx(
                          "p-3 rounded-lg border transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50",
                          schedule.isCompleted 
                            ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30" 
                            : "border-slate-200 dark:border-slate-700"
                        )}
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowDetails(true);
                          setExpandedDay(null);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="mt-0.5">
                              <span className={clsx(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getSessionTypeColor(schedule.type)
                              )}>
                                {getSessionTypeText(schedule.type)}
                              </span>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">{schedule.clientName}</h4>
                              <div className="flex items-center space-x-3 mt-1 text-sm">
                                <span className="flex items-center text-slate-600 dark:text-slate-400">
                                  <Clock size={14} className="mr-1.5" />
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                                <span className="flex items-center text-slate-600 dark:text-slate-400">
                                  <User size={14} className="mr-1.5" />
                                  {schedule.trainerName}
                                </span>
                              </div>
                              
                              {schedule.notes && (
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{schedule.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteToggle(schedule.id, schedule.isCompleted);
                              }}
                              className={clsx(
                                "p-1.5 rounded-full",
                                schedule.isCompleted 
                                  ? "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" 
                                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              )}
                            >
                              <CheckSquare size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">이 날짜에 예정된 일정이 없습니다.</p>
                    <button 
                      onClick={() => {
                        setCurrentDate(expandedDay);
                        setShowAddForm(true);
                        setExpandedDay(null);
                      }}
                      className="mt-4 inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      <Plus size={16} className="mr-1.5" />
                      일정 추가하기
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <button
                onClick={() => {
                  setCurrentDate(expandedDay);
                  setCurrentView('day');
                  setExpandedDay(null);
                }}
                className="btn btn-outline-primary text-sm font-medium"
              >
                일간 보기로 전환
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Schedule;