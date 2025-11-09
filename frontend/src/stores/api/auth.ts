import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthResponse,AuthBody } from '../../types/types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/auth`,credentials: 'include',  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, AuthBody>({
      query: (credentials) => ({
        url: `/login`,
        method: 'POST',
        body: credentials,
      }),
    })
  }),
});

export const { useLoginMutation } = authApi;
