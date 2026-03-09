import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client";

export default function ReactQueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
