import { useState } from 'react';
import { Send } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTask, TaskComment } from '../../contexts/TaskContext';
import { useAuth } from '../../contexts/AuthContext';

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
}

const TaskComments = ({ taskId, comments }: TaskCommentsProps) => {
  const { addComment } = useTask();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    
    addComment(taskId, {
      content: newComment,
      authorId: user.id,
      authorName: user.name
    });
    
    setNewComment('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium text-slate-900 dark:text-white">댓글</h3>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {comments && comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {comment.authorName.charAt(0)}
                  </div>
                  <div className="ml-2">
                    <span className="font-medium text-slate-900 dark:text-white">{comment.authorName}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                      {format(parseISO(comment.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500">
            <p>아직 댓글이 없습니다.</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글을 입력하세요..."
          className="form-input pr-12 w-full min-h-[80px]"
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="absolute right-2 bottom-2 p-2 rounded-full bg-primary text-white disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskComments; 