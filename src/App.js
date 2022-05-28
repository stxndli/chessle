import React, {useEffect, useState} from 'react'
import { Board,getValidMoves } from "ii-react-chessboard"
import Chess from "chess.js";
import Matrix from './MoveHistory'
import data from "./opennings.js"
import {Modal, Button} from "react-bootstrap"
import './App.css'
function App() {
  const [targetGameHistory, setTargetGameHistory] = useState([]) // game to be guessed
  const numberOfMoves = 10 // number of moves to guess
  const numberOfGuesses = 6
  let correctMoves = 0
  const [openning, setOpenning] = useState(data[Math.floor(Math.random()*data.length)])
  // load PGN  and moves history of the target game
  useEffect(()=>{
    const targetGame = new Chess()
    if(targetGame.load_pgn(openning.moves)){
      setTargetGameHistory(targetGame.history())
      
    }
  }, [openning])
  const [currentguess, setCurrentguess] = useState(0)
  const [squareColors, setSquareColors] = useState(Array.from({length: numberOfGuesses}, (_) => Array.from({length: numberOfMoves}, (_) => "#6c757d"))) // keeps track of each square colors, default is grey
  const [playable, setplayable] = useState(true) // enable/disable viewonly mode on board
  const [position, setPosition] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") // starting position
  const [previousPosition, setPreviousPosition] = useState([])
  const board = new Chess(position)
  const [turnColor, setTurnColor] = useState("white") // white to play the first move
  const [history, setHistory] = useState(Array.from({length: numberOfGuesses}, (_) => Array.from({length: numberOfMoves}, (_) => ""))) // 2d array to keep track of moves played
  const [modal, setModal] = useState({"show":false,"title":"","content":""});
  const [info, setInfo] = useState({"show":false,"title":""});
  const handleClose = () => {setModal({"show":false,"title":"","content":""});setInfo({"show":false,"title":""})}
  let validMoves = getValidMoves(board)
  useEffect(()=>{
    window.addEventListener("keydown", downHandler);
    validMoves = getValidMoves(board)
    return () => {
      window.removeEventListener("keydown", downHandler);
    }
  },[position])
  const onMove = (move)=>{
    board.move({from:move.from, to:move.to})
    setPreviousPosition((previousPosition)=>{return [...previousPosition, position]})
    setPosition(board.fen())
    setTurnColor(turnColor === "white" ? "black" : "white")
    const copy = [...history]
    copy[currentguess][copy[currentguess].indexOf("")] = board.history()[0]
    setHistory(copy)
    if(copy[currentguess].indexOf("")===-1){setplayable(false)} // last move
  }
  const handleSubmit = ()=>{
      if(history[currentguess].indexOf("")!==-1){
          const i = {"show":true,"title":"Fill all moves before submitting"}
          setInfo(i)
          return
      }
      setplayable(true)
        for(let j=0; j<history[currentguess].length; j++){
          if(history[currentguess][j]===targetGameHistory[j]){
            let copy = [...squareColors]
            copy[currentguess][j] = "#28a745"
            setSquareColors(copy)
            correctMoves += 1
            if(correctMoves===numberOfMoves){
              const m = {"show":true,"title":"Good job !", "content":"You found the correct line: "+openning.moves+" "+openning.name}
              setModal(m)
              setplayable(false)
            }
          }
          else if(targetGameHistory.slice(0,numberOfMoves-1).includes(history[currentguess][j])){
            let copy = [...squareColors]
            copy[currentguess][j] = "#ffc107"
            setSquareColors(copy)
          }
        }
    setPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    setTurnColor("white")
    
    if(currentguess+1===numberOfGuesses){
        const m = {"show":true,"title":"Tough one !", "content":"The correct sequence was: "+openning.moves+" "+openning.name}
        setModal(m)
        setplayable(false)
      }
    else{
        setPreviousPosition([])
        correctMoves = 0
        setCurrentguess(currentguess+1)
    }

  }
  const handleReset = ()=>{
    handleClose()
    setPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    setTurnColor("white")
    setplayable(true)
    setCurrentguess(0)
    correctMoves = 0
    setSquareColors(Array.from({length: numberOfGuesses}, (_) => Array.from({length: numberOfMoves}, (_) => "#6c757d")))
    setHistory(Array.from({length: numberOfGuesses}, (_) => Array.from({length: numberOfMoves}, (_) => "")))
    setPreviousPosition([])
    setOpenning(data[Math.floor(Math.random()*data.length)])

  }
  const downHandler = ({key})=>{
    if(key=="ArrowLeft" && previousPosition.length!=0){
      setPosition(previousPosition[previousPosition.length-1])
      board.undo()
      setTurnColor(board.turn() === "b" ? "white" : "black")
      let p = previousPosition
      p.pop()
      setPreviousPosition(p)
      p = [...history]
      if(p[currentguess].indexOf("")===-1){
        p[currentguess][p[currentguess].length-1] = ""
      }
      else{
        p[currentguess][p[currentguess].indexOf("")-1] = ""
      }
      setHistory(p)
      setplayable(true)
      
    }
}
  return (
    <div className="App">
      <h2 id="title">Chessle</h2>
      <div className="content">
      <Board turnColor={turnColor} onMove={onMove} position={position} validMoves={validMoves} draggable={playable} clickable={playable}/>
      </div>
      <div className="content">
          <Matrix number={numberOfMoves} moves={history} colors={squareColors} guesses={numberOfGuesses}/>
          <div className="btn-toolbar">
          <div className="btn-group me-2" role="group">
          <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
          </div>
          </div>
      </div>
      <div className="modal">
      <Modal show={modal["show"]} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modal["title"]}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modal["content"]}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleReset}>
            Try again
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={info["show"]} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{info["title"]}</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
    </div>
  );
}

export default App;
