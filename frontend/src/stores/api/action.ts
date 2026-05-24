import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Action, ActionParameters, ActionRequest } from '../../types/types';

export const actionApi = createApi({
  reducerPath: 'actionApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/api/actions`, credentials: 'include' }),
  tagTypes: ['Actions'],
  endpoints: (builder) => ({
    getActions: builder.query<Action[], ActionParameters | void>({
      query: (params) => ({ url: '', params: { ...params } }),
      providesTags: ['Actions'],
    }),
    getActionById: builder.query<Action, string>({
      query: (id) => ({ url: `/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Actions', id }],
    }),
    createAction: builder.mutation<Action, ActionRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Actions'],
    }),
    updateAction: builder.mutation<Action, { id: string; body: ActionRequest }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Actions'],
    }),
  }),
});

export const {
  useGetActionsQuery,
  useGetActionByIdQuery,
  useCreateActionMutation,
  useUpdateActionMutation,
} = actionApi;
