import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Action, ActionParameters } from '../../types/types';

export const actionApi = createApi({
  reducerPath: 'actionApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL}/api/actions` }),
  endpoints: (builder) => ({
    getActions: builder.query<Action[], ActionParameters | void>({
      query: (params) => ({ url: '', params: { ...params } }),
    })
  }),
});

export const { useGetActionsQuery } = actionApi;
