import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

type Form = {
    id: string,
    name: string,
    pingFrequency: number
}

export default function useUpdateWebsite(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (form: Form) => axios.put(`${API_URL}/api/websites`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] })
            toast.success(`Website successfully updated`);
        }
    })
}