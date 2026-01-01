import { SWRConfig } from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SWRProvider({ children }) {
  return (
    <SWRConfig value={{ fetcher }}>
      {children}
    </SWRConfig>
  );
}
