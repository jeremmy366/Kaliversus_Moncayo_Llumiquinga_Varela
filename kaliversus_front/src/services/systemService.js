import api from "./api";

const systemService = {
  getHealth: async () => {
    const res = await api.get("/health");
    return res.data;
  },
  getActivity: async (limit = 20) => {
    const res = await api.get(`/admin/activity?limit=${limit}`);
    return res.data;
  },
};

export default systemService;
