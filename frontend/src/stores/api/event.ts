import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Event, EventParameters } from '../../types/types';
import moment from 'moment';

type EventUpdate = Pick<Event, 'actionId' | 'status' | 'eventDate'>;

const eventUpdateRequest = (body: Partial<Event>) => ({ url: '', method: 'POST', body });

export const eventApi = createApi({
  reducerPath: 'eventApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/api/events`, credentials: 'include' }),
  tagTypes: ['Events'],
  endpoints: (builder) => ({
    getEvents: builder.query<Record<string, Event[]>, EventParameters | null>({
      query: (params) => ({ url: '/range', params: { ...params } }),
      providesTags: ['Events'],
    }),
    getTodayEvents: builder.query<Event[], void>({
      query: () => ({ url: '/range', params: { startDate: moment.utc().startOf('day').toISOString(), endDate: moment.utc().endOf('day').toISOString() } }),
      providesTags: ['Events'],
      transformResponse: (response: Record<string, Event[]>) => {
        const today = new Date().toISOString().split('T')[0];
        return response[today] || [];
      }
    }),
    postEvent: builder.mutation<void, Partial<Event>>({
      query: eventUpdateRequest,
      invalidatesTags: ['Events'],
    }),
    postEvents: builder.mutation<string[], EventUpdate[]>({
      async queryFn(updates, _api, _options, baseQuery) {
        const results = await Promise.all(updates.map(async (update) => {
          const result = await baseQuery(eventUpdateRequest(update));
          return result.error ? update.actionId : undefined;
        }));
        return { data: results.filter((actionId) => actionId !== undefined) };
      },
      invalidatesTags: ['Events'],
    }),
  }),
});

export const { useGetEventsQuery, useGetTodayEventsQuery, usePostEventMutation, usePostEventsMutation } = eventApi;
