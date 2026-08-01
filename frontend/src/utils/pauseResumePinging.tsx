import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export default function usePauseResumePinging(websiteId: string, pingType: string){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (value: boolean) => axios.put(`${API_URL}/api/websites/pinging?id=${websiteId}&pingType=${pingType}`, { value }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] })
        }
    })
}