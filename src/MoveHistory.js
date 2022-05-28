import React from 'react'
import './MoveHistory.css'
function MoveHistory(props){
	let squares = []
	for (let i = 0; i < props.number; i++) {
		squares.push(<div key={i} className="lines">{i%2==0?<div className="inline">{i/2+1}.</div>:null} <div className="inline history" style={{backgroundColor:props.colors[i]}}><span>{props.moves[i]}</span> </div></div>)
	}
	return (
		<div>
		{squares}
		</div>
		)
}
const Matrix = (props)=>{
	let lines = []
	for(var i=0; i<props.guesses; i++){
		lines.push(<MoveHistory key={i} number={props.number} moves={props.moves[i]} colors={props.colors[i]}/>)
	}
	return(
		<div>
		{lines}
		</div>
		)
}
export default Matrix