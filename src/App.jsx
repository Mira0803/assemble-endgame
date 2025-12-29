import React, { useState } from "react"
import { languages } from "./languages"
import { clsx } from "clsx"
import { getFarewellText, getRandomWord } from "./utils"
import Confetti from "react-confetti"

export default function App() {
  // State
  const [currentWord, setCurrentWord] = useState(() => getRandomWord())
  const [guessedLetters, setGuessedLetters] = useState([])
  const [wrongGuesses, setWrongGuesses] = useState(0) 
  const [clueUsed, setClueUsed] = useState(false)

  // Derived values
  const isGameWon = currentWord.split("").every((letter) =>
    guessedLetters.includes(letter)
  )
  const isGameLost = wrongGuesses >= languages.length - 1
  const isGameOver = isGameWon || isGameLost

  const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
  const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")

  // Handlers
  function handleLetterClick(letter) {
    if (!guessedLetters.includes(letter)) {
      setGuessedLetters((prev) => [...prev, letter])
      if (!currentWord.includes(letter)) setWrongGuesses((prev) => prev + 1)
    }
  }

  function useClue() {
    if (isGameOver || clueUsed) return

    const unguessedLetters = currentWord
      .split("")
      .filter((letter) => !guessedLetters.includes(letter))

    if (unguessedLetters.length === 0) return

    const clueLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)]
    setGuessedLetters((prev) => [...prev, clueLetter])
    setWrongGuesses((prev) => prev + 1)
    setClueUsed(true)
  }

  function startNewGame() {
    setCurrentWord(getRandomWord())
    setGuessedLetters([])
    setWrongGuesses(0)
    setClueUsed(false)
  }

  // Language chips
  const languageChips = languages.map((language, index) => {
    const isLanguageLost = index < wrongGuesses
    const style = { backgroundColor: language.backgroundColor, color: language.color }
    return (
      <div key={language.name} className={clsx("chip", isLanguageLost && "lost")} style={style}>
        {language.name}
      </div>
    )
  })

  // Word display
  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
    const letterClassName = clsx(isGameLost && !guessedLetters.includes(letter) && "missed-letter")
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : ""}
      </span>
    )
  })

  // Keyboard display
  const keyboardElements = alphabet.map((letter) => {
    const isGuessed = guessedLetters.includes(letter)
    const isCorrect = isGuessed && currentWord.includes(letter)
    const isWrong = isGuessed && !currentWord.includes(letter)
    const className = clsx({ correct: isCorrect, wrong: isWrong })

    return (
      <button
        className={className}
        onClick={() => handleLetterClick(letter)}
        disabled={isGameOver}
        aria-disabled={isGuessed}
        aria-label={`Letter ${letter}`}
        key={letter}
      >
        {letter.toUpperCase()}
      </button>
    )
  })

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect,
  })

  // Game status messages
  function renderGameStatus() {
  
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuesses - 1].name)}
        </p>
      )
    }

    if (isGameWon) {
      return (
        <>
          <h2>You win!</h2>
          <p>Well done! 🎉</p>
        </>
      )
    }

    if (isGameLost) {
      return (
        <>
          <h2>Game Over</h2>
          <p>You lose! Better start learning Assembly 😭</p>
        </>
      )
    }

    return null
  }

  return (
    <main>
      {isGameWon && <Confetti recycle={false} numberOfPieces={1000} />}

      <header>
        <h1>Mira's Assembly: Endgame</h1>
        <p>Guess the word within 8 attempts to keep the programming world safe from Assembly!</p>
      </header>

      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      <section className="language-chips">{languageChips}</section>

      <section className="word">{letterElements}</section>

      <section className="sr-only" aria-live="polite" role="status">
        <p>
          Current word:{" "}
          {currentWord
            .split("")
            .map((letter) => (guessedLetters.includes(letter) ? letter + "." : "blank"))
            .join(" ")}
        </p>
      </section>

      <section className="keyboard">{keyboardElements}</section>

      {/* Floating Clue Button */}
      {!isGameOver && (
        <button className="floating-clue" disabled={clueUsed} onClick={useClue} aria-label="Get a hint">
          💡
        </button>
      )}

      {isGameOver && (
        <button onClick={startNewGame} className="new-game">
          New Game
        </button>
      )}
    </main>
  )
}
