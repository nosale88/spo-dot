// Supabase 클라이언트 설정
// 실제 Supabase 프로젝트 연결을 위해서는 환경변수 설정이 필요합니다.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://piwftspnolcvpytaqaeq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpd2Z0c3Bub2xjdnB5dGFxYWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODQzODMsImV4cCI6MjA2MjM2MDM4M30.79_5Nbygmj-lWnsG4Gq9E8hMk1it2UDz6IZ0vK9eAfc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          password: string;
          role: 'admin' | 'trainer' | 'staff' | 'user' | 'client';
          department?: string;
          status?: string;
          phone?: string;
          position?: string;
          permissions?: any;
          profile_image?: string;
          last_login?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          password: string;
          role: 'admin' | 'trainer' | 'staff' | 'user' | 'client';
          department?: string;
          status?: string;
          phone?: string;
          position?: string;
          permissions?: any;
          profile_image?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          password?: string;
          role?: 'admin' | 'trainer' | 'staff' | 'user' | 'client';
          department?: string;
          status?: string;
          phone?: string;
          position?: string;
          permissions?: any;
          profile_image?: string;
          last_login?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description?: string;
          status: 'pending' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: string;
          assigned_to?: string;
          created_by?: string;
          due_date?: string;
          tags?: any;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          status?: 'pending' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: string;
          assigned_to?: string;
          created_by?: string;
          due_date?: string;
          tags?: any;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'pending' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: string;
          assigned_to?: string;
          created_by?: string;
          due_date?: string;
          tags?: any;
        };
      };
      daily_reports: {
        Row: {
          id: string;
          author_id?: string;
          author_name: string;
          date: string;
          tasks?: any;
          issues?: string;
          tomorrow?: string;
          images?: any;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          author_id?: string;
          author_name: string;
          date: string;
          tasks?: any;
          issues?: string;
          tomorrow?: string;
          images?: any;
        };
        Update: {
          id?: string;
          author_id?: string;
          author_name?: string;
          date?: string;
          tasks?: any;
          issues?: string;
          tomorrow?: string;
          images?: any;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id?: string;
          author_name: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          tags?: any;
          expiry_date?: string;
          is_pinned?: boolean;
          is_active?: boolean;
          target_roles?: any;
          read_by?: any;
          attachments?: any;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id?: string;
          author_name: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          tags?: any;
          expiry_date?: string;
          is_pinned?: boolean;
          is_active?: boolean;
          target_roles?: any;
          read_by?: any;
          attachments?: any;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          author_name?: string;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          tags?: any;
          expiry_date?: string;
          is_pinned?: boolean;
          is_active?: boolean;
          target_roles?: any;
          read_by?: any;
          attachments?: any;
        };
      };
      manuals: {
        Row: {
          id: string;
          title: string;
          content: string;
          category?: string;
          tags?: any;
          author_id?: string;
          author_name: string;
          view_count?: number;
          is_published?: boolean;
          version?: number;
          last_edited_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: string;
          tags?: any;
          author_id?: string;
          author_name: string;
          view_count?: number;
          is_published?: boolean;
          version?: number;
          last_edited_by?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          tags?: any;
          author_id?: string;
          author_name?: string;
          view_count?: number;
          is_published?: boolean;
          version?: number;
          last_edited_by?: string;
        };
      };
      sales_entries: {
        Row: {
          id: string;
          date: string;
          author_id?: string;
          author_name: string;
          revenue?: number;
          membership_sales?: number;
          pt_sales?: number;
          supply_sales?: number;
          vending_sales?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          date: string;
          author_id?: string;
          author_name: string;
          revenue?: number;
          membership_sales?: number;
          pt_sales?: number;
          supply_sales?: number;
          vending_sales?: number;
          notes?: string;
        };
        Update: {
          id?: string;
          date?: string;
          author_id?: string;
          author_name?: string;
          revenue?: number;
          membership_sales?: number;
          pt_sales?: number;
          supply_sales?: number;
          vending_sales?: number;
          notes?: string;
        };
      };
      suggestions: {
        Row: {
          id: string;
          title: string;
          content: string;
          category?: 'facility' | 'service' | 'program' | 'other';
          author_id?: string;
          author_name: string;
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'implemented';
          priority?: 'low' | 'medium' | 'high';
          admin_response?: string;
          admin_response_by?: string;
          admin_response_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: 'facility' | 'service' | 'program' | 'other';
          author_id?: string;
          author_name: string;
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'implemented';
          priority?: 'low' | 'medium' | 'high';
          admin_response?: string;
          admin_response_by?: string;
          admin_response_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: 'facility' | 'service' | 'program' | 'other';
          author_id?: string;
          author_name?: string;
          status?: 'pending' | 'in_review' | 'approved' | 'rejected' | 'implemented';
          priority?: 'low' | 'medium' | 'high';
          admin_response?: string;
          admin_response_by?: string;
          admin_response_at?: string;
        };
      };
      task_comments: {
        Row: {
          id: string;
          task_id?: string;
          author_id?: string;
          author_name: string;
          content: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          task_id?: string;
          author_id?: string;
          author_name: string;
          content: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          author_id?: string;
          author_name?: string;
          content?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          title: string;
          message: string;
          is_read?: boolean;
          link?: string;
          related_id?: string;
          related_type?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          title: string;
          message: string;
          is_read?: boolean;
          link?: string;
          related_id?: string;
          related_type?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          title?: string;
          message?: string;
          is_read?: boolean;
          link?: string;
          related_id?: string;
          related_type?: string;
        };
      };
    };
  };
} 