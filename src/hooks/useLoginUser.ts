import { useState } from "react";
import { User } from "../api/userService";
import axiosInstance from "../axiosinstance";

interface LoginResponse {
  user: User;
  token: string;
}

export const useLoginUser = () => {
    const [authData, setAuthData] = useState<LoginResponse | undefined>();
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loginUser = async (initData: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axiosInstance.post<LoginResponse>("/auth/login", { initData });
            setAuthData(response.data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { authData, error, isLoading, loginUser };
};