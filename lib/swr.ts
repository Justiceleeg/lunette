// SWR configuration and fetcher

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    throw error;
  }

  return res.json();
};
