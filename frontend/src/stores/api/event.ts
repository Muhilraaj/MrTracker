import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Event, EventParameters } from '../../types/types';
import moment from 'moment';

export const eventApi = createApi({
  reducerPath: 'eventApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL}/api/events` }),
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
    postEvent: builder.mutation<Event, Partial<Event>>({
      query: (newEvent: Partial<Event>) => ({
        url: '',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: ['Events'],
    })
  }),
});

export const { useGetEventsQuery, useGetTodayEventsQuery, usePostEventMutation } = eventApi;
