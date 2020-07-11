import React, { useReducer, useState, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import './App.css';

const stateMachine = {
  initialState: 'initial',
  states: {
    initial: { on: { next: 'loadingModel' } },
    loadingModel: { on: { next: 'awaitingUpload' } },
    awaitingUpload: { on: { next: 'ready' } },
    ready: { on: { next: 'classifying' }, showImage: true },
    classifying: { on: { next: 'complete' } },
    complete: { on: { next: 'awaitingUpload' }, showImage: true },
  },
};

const reducer = (currentState, event) =>
  stateMachine.states[currentState].on[event] || stateMachine.initialState;

function App() {
  const [state, dispatch] = useReducer(reducer, stateMachine.initialState);
  const [model, setModel] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const inputRef = useRef();
  const imageRef = useRef();

  const next = () => dispatch('next');

  const loadModel = async () => {
    next();
    const mobilenetModel = await mobilenet.load();
    setModel(mobilenetModel);
    next();
  };

  const handleUpload = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0]);
      setImageUrl(url);
      next();
    }
  };

  const buttonProps = {
    initial: { text: 'Load Model', action: loadModel },
    loadingModel: { text: 'Loading model ...', action: () => {} },
    awaitingUpload: { text: 'Upload photo', action: () => {} },
    ready: { text: 'Identify', action: () => {} },
    classifying: { text: 'Identifying', action: () => {} },
    complete: { text: 'Reset', action: () => {} },
  };

  const { showImage = false } = stateMachine.states[state];

  return (
    <div>
      {showImage && <img alt="upload preview" src={imageUrl} ref={imageRef} />}
      <input
        type="file"
        accept="image/*"
        capture="camera"
        ref={inputRef}
        onChange={handleUpload}
      />
      <button onClick={buttonProps[state].action}>
        {buttonProps[state].text}
      </button>
    </div>
  );
}

export default App;
