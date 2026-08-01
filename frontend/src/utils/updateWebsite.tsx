import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

type Form = {
    id: string,
    name: string,
    pingFrequency: number,
    certFrequency: number
}

type UpdateForm = Partial<Form> & { id: string };

export default function useUpdateWebsite(){
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (form: UpdateForm) => axios.put(`${API_URL}/api/websites`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['websites'] })
            toast.success(`Website successfully updated`);
        }
    })
}