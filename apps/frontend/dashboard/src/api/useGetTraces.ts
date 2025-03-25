// const fetchPolicy = async (policyId: string): Promise<Policy> => {
//   const token = await getAPIAccessToken();
//   const headers = new Headers();
//   headers.append('Authorization', `Bearer ${token}`);
//   const response = await fetch(
//     `${config.api.baseUrlErrm}/policies/${policyId}`,
//     { headers: headers }
//   );

//   if (!response.ok) {
//     const result = await response.json();
//     throw new SomoAPIError(result, response.status, policyId, '');
//   }

//   const policy = await response.json();
//   return policy;
// };

// export const useGetPolicy = (policyId: string | null) =>
//   useSWR<Policy, SomoAPIError>(policyId, fetchPolicy);
