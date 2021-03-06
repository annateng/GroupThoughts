import axios from 'axios';

const basePath = '/api/send-email';
let token;

export const setToken = (authToken) => {
  token = `bearer ${authToken}`;
};

export const sendInvite = async (emailAddr, name, friendId) => {
  const config = {
    headers: { Authorization: token },
  };

  try {
    const res = await axios.post(`${basePath}/invite`, { emailAddr, name, friendId }, config);
    return res.data;
  } catch (e) {
    throw e.response;
  }
};
