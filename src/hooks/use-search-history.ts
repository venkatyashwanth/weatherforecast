import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

interface SearchHistoryItem {
    id: string;
    query: string;
    lat: number;
    lon: number;
    name: string;
    country: string;
    state?: string;
    SearchedAt: number;
}

export function useSearchHistory() {
    const [history, setHistory] = useLocalStorage<SearchHistoryItem[]>("search-history", []);

    const historyQuery = useQuery({
        queryKey: ["search-history"],
        queryFn: () => history,
        initialData: history
    });

    const queryClient = useQueryClient();

    const addToHistory = useMutation({
        mutationFn: async (
            search: Omit<SearchHistoryItem, "id" | "SearchedAt">
        ) => {
            const newSearch: SearchHistoryItem = {
                ...search,
                id: `${search.lat}-${search.lon}-${Date.now()}`,
                SearchedAt: Date.now()
            }

            const filteredHistory = history.filter(
                (item) => !(item.lat === search.lat && item.lon === search.lon)
            );

            const newHistory = [newSearch, ...filteredHistory].slice(0,10);
            setHistory(newHistory);
            return newHistory;
        },
        onSuccess: (newHistory) => {
            queryClient.setQueryData(["search-history"], newHistory)
        }

    })

    const clearHistory = useMutation({
        mutationFn: async()=>{
            setHistory([])
            return [];
        },
        onSuccess: (newHistory) => {
            queryClient.setQueryData(["search-history"], [])
        }
    })

    return{
        history:historyQuery.data??[],
        addToHistory,
        clearHistory
    }
}