import { baseApi } from '../../../store/api/baseApi';
import { AppNotification, Complaint, ID, Paginated } from '../../../types/models';

export const sharedApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getNotifications: build.query<Paginated<AppNotification>, { page?: number }>({
      query: params => ({ url: '/notifications', params }),
      providesTags: ['Notification'],
    }),
    markNotificationRead: build.mutation<void, ID>({
      query: id => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
    getMyComplaints: build.query<Complaint[], void>({
      query: () => '/complaints',
      providesTags: ['Complaint'],
    }),
    raiseComplaint: build.mutation<Complaint, { subject: string; description: string }>({
      query: body => ({ url: '/complaints', method: 'POST', body }),
      invalidatesTags: ['Complaint'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetMyComplaintsQuery,
  useRaiseComplaintMutation,
} = sharedApi;
