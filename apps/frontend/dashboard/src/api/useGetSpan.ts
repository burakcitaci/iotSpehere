import { ReadableSpan } from '@opentelemetry/sdk-trace-node';
import useSWR from 'swr';
const fetchPolicy = async (spanId: string): Promise<ReadableSpan> => {
  const response = await fetch('http://localhost:3001/api/span/' + spanId);

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result);
  }

  const policy = await response.json();
  return policy;
};

export const useGetSpan = (spanId: string | null) =>
  useSWR<ReadableSpan, Error>(spanId, fetchPolicy);
