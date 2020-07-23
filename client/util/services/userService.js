import axios from 'axios'
const basePath = '/api/users'

let token

export const setToken = authToken => {
  token = `bearer ${authToken}`
}

export const getActiveGames = async userId => {
  const config = { 
    headers: { Authorization: token },
  }
  
  const res = await axios.get(`${basePath}/${userId}/active-games`, config)
  return res.data
}

export const getUserData = async userId => {
  const config = { 
    headers: { Authorization: token },
  }

  const res = await axios.get(`${basePath}/${userId}`, config)
  return res.data
}

export const getNotifications = async userId => {
  const config = { 
    headers: { Authorization: token },
  }

  const res = await axios.get(`${basePath}/${userId}/notifications`, config)
  return res.data
}

export const acceptGameRequest = async (userId, gameRequestId) => {
  const config = { 
    headers: { Authorization: token },
    params: { action: 'accept' }
  }
  console.log(config)

  const res = await axios.post(`${basePath}/${userId}/game-requests/${gameRequestId}`, null, config)
  return res.data
}

export const rejectGameRequest = async (userId, gameRequestId) => {
  const config = { 
    headers: { Authorization: token },
    params: { action: 'reject' }
  }

  const res = await axios.post(`${basePath}/${userId}/game-requests/${gameRequestId}`, null, config)
  return res.data
}