import { baseApi } from '../../../store/api/baseApi';
import { AppNotification, Complaint, ID, Paginated } from '../../../types/models';

type ApiRecord = Record<string, unknown>;

function asRecord(value: unknown): ApiRecord | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as ApiRecord)
    : undefined;
}

export function normalizeNotificationsResponse(raw: unknown): Paginated<AppNotification> {
  const envelope = asRecord(raw);
  const nested = asRecord(envelope?.data);
  const source = envelope?.items || envelope?.content || envelope?.notifications
    ? envelope
    : nested ?? envelope;
  const list = Array.isArray(raw)
    ? raw
    : source?.items ?? source?.content ?? source?.notifications ?? (Array.isArray(envelope?.data) ? envelope.data : undefined);

  if (!Array.isArray(list)) {
    throw new TypeError('The notifications API response did not contain a notification list.');
  }

  const items = list.map(value => {
    const notification = asRecord(value);
    const data = asRecord(notification?.data);
    const id = notification?.id ?? notification?.notificationId;
    const title = notification?.title ?? notification?.subject;
    const body =
      notification?.body ?? notification?.message ?? notification?.description;
    const type =
      notification?.type ?? notification?.notificationType ?? data?.type;
    const read = notification?.read ?? notification?.isRead;
    const createdAt =
      notification?.createdAt ??
      notification?.createdOn ??
      notification?.timestamp;

    if (
      (typeof id !== 'string' && typeof id !== 'number') ||
      typeof title !== 'string' ||
      typeof body !== 'string' ||
      typeof type !== 'string' ||
      (read !== undefined && typeof read !== 'boolean') ||
      typeof createdAt !== 'string'
    ) {
      throw new TypeError('The notifications API returned an invalid notification.');
    }

    const notificationData: Record<string, string> = {};
    for (const [key, dataValue] of Object.entries(data ?? {})) {
      if (typeof dataValue === 'string') {
        notificationData[key] = dataValue;
      }
    }

    return {
      id: String(id),
      title,
      body,
      type,
      createdAt,
      ...(typeof read === 'boolean' ? { read } : {}),
      ...(Object.keys(notificationData).length ? { data: notificationData } : {}),
    };
  });

  const pageInfo = asRecord(source?.page);
  const pageNumber = typeof source?.page === 'number' ? source.page : undefined;
  const springPageNumber =
    typeof pageInfo?.number === 'number' ? pageInfo.number + 1 : undefined;
  const page = pageNumber ?? springPageNumber ?? 1;
  const pageSize =
    typeof source?.pageSize === 'number'
      ? source.pageSize
      : typeof source?.size === 'number'
        ? source.size
        : typeof pageInfo?.size === 'number'
          ? pageInfo.size
          : items.length;
  const total =
    typeof source?.total === 'number'
      ? source.total
      : typeof source?.totalElements === 'number'
        ? source.totalElements
        : typeof source?.totalCount === 'number'
          ? source.totalCount
          : typeof pageInfo?.totalElements === 'number'
            ? pageInfo.totalElements
            : items.length;

  return {
    items,
    page,
    pageSize,
    total,
  };
}

export const sharedApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getNotifications: build.query<Paginated<AppNotification>, { page?: number }>({
      query: params => ({ url: '/notifications', params }),
      transformResponse: normalizeNotificationsResponse,
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
