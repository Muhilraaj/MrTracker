import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Action, ActionParameters } from '../../types/types';

export const actionApi = createApi({
  reducerPath: 'actionApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/api/actions`, credentials: 'include' }),
  endpoints: (builder) => ({
    getActions: builder.query<Action[], ActionParameters | void>({
      query: (params) => ({ url: '', params: { ...params } }),
    })
  }),
});

export const { useGetActionsQuery } = actionApi;
