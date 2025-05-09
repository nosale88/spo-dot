import { http, HttpResponse } from 'msw';
import { Announcement } from '../types/index'; // Ensure this path is correct

// In-memory store for announcements
let mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '시스템 점검 안내 (Mocked)',
    content: '2025년 5월 10일 02:00 ~ 04:00 시스템 정기 점검이 있을 예정입니다. 이용에 참고 부탁드립니다.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    targetAudience: 'all',
    isPublished: true,
    showInBanner: true, // Example: First announcement shown in banner by default
  },
  {
    id: '2',
    title: '신규 기능 업데이트 (Mocked)',
    content: '회원 관리 기능이 새롭게 추가되었습니다. 많은 이용 바랍니다!',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    targetAudience: 'members',
    isPublished: true,
    showInBanner: false,
  },
  {
    id: '3',
    title: '여름맞이 특별 할인 이벤트 (Mocked)',
    content: '7월 한 달간 모든 프로그램 20% 할인! 놓치지 마세요.',
    createdAt: new Date().toISOString(),
    targetAudience: 'all',
    isPublished: true,
    showInBanner: false,
  },
];

let nextId = 4;

export const handlers = [
  // Get all announcements
  http.get('/api/announcements', () => {
    console.log('[MSW] GET /api/announcements');
    return HttpResponse.json(mockAnnouncements);
  }),

  // Add a new announcement
  http.post('/api/announcements', async ({ request }) => {
    console.log('[MSW] POST /api/announcements');
    const newAnnouncementData = await request.json() as Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>;
    const newAnnouncement: Announcement = {
      ...newAnnouncementData,
      id: (nextId++).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublished: newAnnouncementData.isPublished !== undefined ? newAnnouncementData.isPublished : true, 
      showInBanner: newAnnouncementData.showInBanner !== undefined ? newAnnouncementData.showInBanner : false, 
    };
    mockAnnouncements.push(newAnnouncement);
    return HttpResponse.json(newAnnouncement, { status: 201 });
  }),

  // Update an announcement
  http.put('/api/announcements/:id', async ({ request, params }) => {
    const { id } = params;
    console.log(`[MSW] PUT /api/announcements/${id}`);
    const updatedData = await request.json() as Partial<Announcement>;
    const index = mockAnnouncements.findIndex(ann => ann.id === id);

    if (index !== -1) {
      mockAnnouncements[index] = {
        ...mockAnnouncements[index],
        ...updatedData,
        id: mockAnnouncements[index].id, // Ensure id is not changed
        updatedAt: new Date().toISOString()
      };
      return HttpResponse.json(mockAnnouncements[index]);
    }
    return HttpResponse.json({ message: 'Announcement not found' }, { status: 404 });
  }),

  // Delete an announcement
  http.delete('/api/announcements/:id', ({ params }) => {
    const { id } = params;
    console.log(`[MSW] DELETE /api/announcements/${id}`);
    const initialLength = mockAnnouncements.length;
    mockAnnouncements = mockAnnouncements.filter(ann => ann.id !== id);
    if (mockAnnouncements.length < initialLength) {
      return new HttpResponse(null, { status: 204 }); // No Content
    }
    return HttpResponse.json({ message: 'Announcement not found' }, { status: 404 });
  }),
];
