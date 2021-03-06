import axios from 'axios';

const basePath = '/api/login';

const login = async (loginInfo) => {
  try {
    const res = await axios.post(basePath, loginInfo);
    return res.data;
  } catch (e) {
    throw new Error(`status ${e.response.status}: ${e.response.data.error}`);
  }
};

export default login;
