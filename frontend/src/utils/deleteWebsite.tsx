import { toast } from "sonner";
import axios from 'axios';
import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL;


export function useDeleteWebsite() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => axios.delete(`${API_URL}/api/websites/?id=${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] })
            toast.success(`Website successfuly removed`);
        },
    });
}