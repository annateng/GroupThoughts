import paper from 'paper'
import axios from 'axios'

const basePath = '/api/games'
let token

export const setToken = authToken => {
  token = `bearer ${authToken}`
}

export const sendDoodles = async (doodles, userId, gameId) => {
  const config = { 
    headers: { Authorization: token },
    params: { type: 'doodle' }
  }

  const body = {
    requesterId: userId,
    doodles
  }

  const res = await axios.post(`${basePath}/${gameId}`, body, config)
  return res.data
}

export const sendGuesses = async (guesses, userId, gameId) => {
  const config = { 
    headers: { Authorization: token },
    params: { type: 'guess' }
  }

  const body = {
    requesterId: userId,
    guesses
  }

  const res = await axios.post(`${basePath}/${gameId}`, body, config)
  return res.data
}

export const getNewGame = async (requesterId, receiverId) => {
  const config = { 
    headers: { Authorization: token },
    params: {
      requesterId, receiverId
    }
  }
  // console.log(config)
  const res = await axios.get(`${basePath}/new-game`, config)
  return res.data
}

export const getDrawing = roundLen => {

  const drawing = {
    duration: roundLen,
    isActive: false,
    isDrawing: false,
    paths: [],
    curPath: null,
    curPoint: null,
    startTime: null,
  }

  paper.view.onMouseDown = event => {
    if (!drawing.isActive) return

    if (drawing.curPath) drawing.curPath.selected = false
    
    drawing.curPath = new paper.Path({
      segments: [event.point],
      strokeColor: localStorage.getItem('scribbleColor') || 'black',
      strokeWidth: localStorage.getItem('scribbleSize') || 2
    })

    drawing.isDrawing = true
  }

  paper.view.onMouseUp = event => {
    if (!drawing.isActive) return
    drawing.isDrawing = false
  }

  paper.view.onMouseDrag = event => {
    if (!drawing.isActive || !drawing.isDrawing) return
    drawing.curPoint = event.point
    drawing.curPath.add(drawing.curPoint)
  }

  paper.view.onMouseMove = event => {
    if (!drawing.isActive) return
    drawing.curPoint = event.point
  }

  paper.view.onFrame = event => {
    if (!drawing.isActive) return
    
    drawing.paths.push({
      timeElapsed: Date.now() - drawing.startTime,
      x: drawing.curPoint ? drawing.curPoint.x : null,
      y: drawing.curPoint ? drawing.curPoint.y : null,
      r: drawing.curPath ? drawing.curPath.strokeColor.red : null,
      g: drawing.curPath ? drawing.curPath.strokeColor.green : null,
      b: drawing.curPath ? drawing.curPath.strokeColor.blue : null,
      width: drawing.curPath ? drawing.curPath.strokeWidth : null,
      isDrawing: drawing.curPoint ? drawing.isDrawing : false
    })
  }
  
  return drawing
}

export const startRound = async (canvas, setTimeLeft, wordsToDraw, roundLen, setWord) => {
  
  paper.setup(canvas)
  const doodles = []

  for (const word of wordsToDraw) {
    const drawing = getDrawing(roundLen)
    setWord(word)
    const completedDrawing = await startDrawing(drawing, setTimeLeft)
    doodles.push({
      label: word,
      drawing: completedDrawing.paths
    })
  }

  return doodles
}

const startDrawing = (drawing, setTimeLeft) => {
  return new Promise((resolve, reject) => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
    drawing.isActive = true
  
    drawing.startTime = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = drawing.duration - ((Date.now() - drawing.startTime) / 1000)
      const displayTimeLeft = Math.ceil(timeLeft)
      setTimeLeft(displayTimeLeft < 0 ? 0 : displayTimeLeft)
      if (timeLeft <= 0) {
        clearInterval(tick)
        drawing.isActive = false
        resolve(drawing)
     }
    }, 10)
  })
}

export const getGame = async (gameId, userId) => {
  const config = { 
    headers: { Authorization: token },
    params: {
      userId
    }
  }
  
  const res = await axios.get(`${basePath}/${gameId}`, config)
  return res.data
}

const startReplay = (replayDrawing, setTimeLeft) => {
  return new Promise((resolve, reject) => {
    paper.project.activeLayer.removeChildren()
    paper.view.draw()
    replayDrawing.isActive = true
    replayDrawing.startTime = Date.now()
  
    const tick = setInterval(async () => {
      const timeLeft = replayDrawing.duration - ((Date.now() - replayDrawing.startTime) / 1000)
      const displayTimeLeft = Math.ceil(timeLeft)
      setTimeLeft(displayTimeLeft < 0 ? 0 : displayTimeLeft)
      if (!replayDrawing.isActive) {
        clearInterval(tick)
        resolve(replayDrawing)
     }
    }, 10)
  })
}

const getReplay = (guessInput, roundLen, drawing, label) => {
  const replayDrawing = {
    drawing,
    lastIsDrawing: false,
    path: null,
    guess: [],
    duration: roundLen,
    label,
    startTime: null,
    correctGuessTime: null,
    guessedCorrectly: false,
    isActive: false,
  }

  paper.view.onFrame = event => {
    if (!replayDrawing.isActive || !replayDrawing.drawing) return

    const timeElapsed = Date.now() - replayDrawing.startTime
    const point = replayDrawing.drawing.find(p => p.timeElapsed >= timeElapsed)
    if (!point) {
      replayDrawing.isActive = false
      return
    }

    if (point.isDrawing && !replayDrawing.lastIsDrawing) {
      if (replayDrawing.path) replayDrawing.path.selected = false
      replayDrawing.path = new paper.Path({ 
        segments: [new paper.Point(point.x, point.y)],
        strokeColor: new paper.Color(point.r, point.g, point.b),
        strokeWidth: point.width
      })
    } else if (point.isDrawing) {
      const paperPoint = new paper.Point(point.x, point.y)
      replayDrawing.path.lineTo(paperPoint)
      replayDrawing.path.moveTo(paperPoint)
    }

    replayDrawing.lastIsDrawing = point.isDrawing

    const guessInputVal = guessInput.value
    replayDrawing.guess.push(guessInputVal)
    if (guessInputVal === replayDrawing.label) {
      replayDrawing.guessedCorrectly = true
      replayDrawing.correctGuessTime = Date.now()
      replayDrawing.isActive = false
    }
  }

  return replayDrawing
}

export const startGuessingRound = async (canvas, guessInput, doodlesToGuess, roundLen, setTimeLeft, setGuess) => {

  paper.setup(canvas)
  const guesses = []

  for (const doodle of doodlesToGuess) {
    setGuess('')
    const replayDrawing = getReplay(guessInput, roundLen, doodle.drawing, doodle.label)

    const completedReplay = await startReplay(replayDrawing, setTimeLeft).catch(e => {
      console.error('got here', e) // DEBUG
      throw new Error(e)
    })

    const guessToPush = {
      doodleId: doodle.id,
      guesses: completedReplay.guess,
      isCorrect: completedReplay.guessedCorrectly,
      // max time spent is the round length. time is represented in milliseconds.
      timeSpent: completedReplay.correctGuessTime ? Math.min(completedReplay.correctGuessTime - completedReplay.startTime, roundLen * 1000) : roundLen
    }

    guesses.push(guessToPush)
  }

  return guesses
}