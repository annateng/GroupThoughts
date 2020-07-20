import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { setAllTokens } from 'Utilities/common'
import { getGame } from 'Utilities/services/gameService'
import { getActiveGames, getUserData } from 'Utilities/services/userService'
import { getNewGame } from 'Utilities/services/gameService'

import YourTurn from 'Components/Profile/YourTurn'
import OpponentsTurn from 'Components/Profile/OpponentsTurn'
import Friend from 'Components/Profile/Friend'

const Profile = () => {
  const user = useSelector(state => state.user)
  const [activeGames, setActiveGames] = useState()
  const [userData, setUserData] = useState()
  const history = useHistory()

  if (user) setAllTokens(user.token)

  useEffect(() => {
    handleGetActiveGames()
    handleGetFriends()
  }, [user])

  const handleGetActiveGames = async () => {
    const gamesFromDB = await getActiveGames(user.user.id)
    // console.log(thisActiveGames)
    setActiveGames(gamesFromDB)
  }

  const handleGetFriends = async () => {
    const userFromDB = await getUserData(user.user.id)
    setUserData(userFromDB)
    console.log(userFromDB)
  }

  const handleNewGame = async (opponentId) => {
    const newGame = await getNewGame(user.user.id, opponentId)
    // console.log(newGame)
    history.push(`/game/${newGame.id}`)
  }

  return (
    <div>
      <div>
        <div>FRIENDS</div>
        {userData && userData.friends.map(friend => 
            <Friend key={friend.id} friend={friend} handleNewGame={handleNewGame} />)}
      </div><br />
      <div>
        <div>YOUR TURN</div>
        {activeGames && activeGames.filter(ag => ag.activePlayer === user.user.id).map(ag => 
          <YourTurn key={ag.id} game={ag} user={user.user} getGame={getGame} />)}
      </div><br />
      <div>
        <div>WAITING ON OPPONENT</div>
        {activeGames && activeGames.filter(ag => ag.activePlayer !== user.user.id).map(ag => 
          <OpponentsTurn key={ag.id} game={ag} user={user.user} />)}
      </div>
    </div>
  )
}

export default Profile