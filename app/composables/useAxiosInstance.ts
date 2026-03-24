export const useAxiosInstance = () => {
  const { $axiosInstance } = useNuxtApp()
  return $axiosInstance
}
