import { normalizeNotificationsResponse } from '../src/modules/shared/api/sharedApi';

describe('notification response normalization', () => {
  it('normalizes a Spring page response and its read/message field names', () => {
    const result = normalizeNotificationsResponse({
      content: [
        {
          id: 17,
          title: 'New application',
          message: 'A job seeker applied to your job.',
          type: 'NEW_APPLICATION',
          isRead: false,
          createdAt: '2026-11-20T10:00:00Z',
        },
      ],
      page: { number: 0, size: 20, totalElements: 1 },
    });

    expect(result).toEqual({
      items: [
        {
          id: '17',
          title: 'New application',
          body: 'A job seeker applied to your job.',
          type: 'NEW_APPLICATION',
          read: false,
          createdAt: '2026-11-20T10:00:00Z',
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    });
  });

  it('unwraps data envelopes and accepts the app notification field names', () => {
    const item = {
      id: 'notice-2',
      title: 'Interview scheduled',
      body: 'Your interview has been scheduled.',
      type: 'APPLICATION_UPDATE',
      read: true,
      createdAt: '2026-11-20T11:00:00Z',
    };

    expect(normalizeNotificationsResponse({ data: { items: [item] } }).items).toEqual([
      item,
    ]);
  });

  it('reads event type from notification data when the API omits read status', () => {
    const result = normalizeNotificationsResponse([
      {
        id: 8,
        title: 'Application shortlisted',
        body: 'Your application for React Native was shortlisted.',
        data: {
          type: 'APPLICATION_UPDATE',
          applicationId: '12',
          jobId: '11',
          status: 'SHORTLISTED',
        },
        createdAt: '2026-11-20T06:27:43.792164Z',
      },
    ]);

    expect(result.items[0]).toEqual({
      id: '8',
      title: 'Application shortlisted',
      body: 'Your application for React Native was shortlisted.',
      type: 'APPLICATION_UPDATE',
      data: {
        type: 'APPLICATION_UPDATE',
        applicationId: '12',
        jobId: '11',
        status: 'SHORTLISTED',
      },
      createdAt: '2026-11-20T06:27:43.792164Z',
    });
  });

  it('throws an explicit error for an unrecognized response shape', () => {
    expect(() => normalizeNotificationsResponse({ success: true })).toThrow(
      'The notifications API response did not contain a notification list.',
    );
  });
});
