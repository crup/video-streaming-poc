import { useEffect, useRef, useState } from "react";
import HLS from "hls.js";
import './App.css';

// Ref: https://github.com/video-dev/hls.js/blob/HEAD/docs/API.md#getting-started

const initHLS = (el, {
  onMediaAttached = () => { },
  onManifestParsed = () => { },
  onLevelSwitching = () => { }
}) => {
  if (HLS.isSupported()) {
    const hls = new HLS({
      // debug: true,
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 60 * 1.5,
      autoStartLoad: true
    });
    hls.attachMedia(el);
    hls.on(HLS.Events.MEDIA_ATTACHED, onMediaAttached);
    hls.on(HLS.Events.MANIFEST_PARSED, onManifestParsed);
    hls.on(HLS.Events.LEVEL_SWITCHING, onLevelSwitching);
    return hls;
  }
}

function App() {
  const playerRef = useRef();
  const hls = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('');
  const [url, setUrl] = useState('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')

  useEffect(() => {
    hls.current = initHLS(playerRef.current, {
      onMediaAttached: () => {
        console.log('video and hls.js are now bound together !');
      },
      onManifestParsed: (event, data) => {
        console.log(
          'manifest loaded, found ' + data.levels.length + ' quality level'
        );
        setLevels(data.levels.map(({ attrs: { RESOLUTION } }) => RESOLUTION))
      },
      onLevelSwitching: (event, data) => {
        setCurrentLevel(data.attrs.RESOLUTION)
      }
    })
  }, [])

  const onPlayPause = () => {
    setIsPlaying(!isPlaying)
    playerRef.current[isPlaying ? 'pause' : 'play']();
  }

  const onChangeLevel = (level) => {
    hls.current.nextLevel = level;
  }

  const onSubmit = (e) => {
    e.preventDefault();
    hls.current.loadSource(url)
    setIsPlaying(true);
    playerRef.current.play();
  }

  const onChangeUrl = (e) => {
    setUrl(e.target.value);
  }

  return (
    <div className="App">
      <form onSubmit={onSubmit}>
        <input className="url" type={"text"} value={url} onChange={onChangeUrl} />
        <button type={"submit"}>Load m3u8</button>
      </form>
      <pre>
        {JSON.stringify({
          isHlsSupported: HLS.isSupported(),
          levels,
          currentLevel,
        })}
      </pre>
      <div>
        <button onClick={onPlayPause}>{
          isPlaying ? 'pause' : 'play'
        }</button>

        {levels.map((level, index) => <button key={level} onClick={() => onChangeLevel(index)} disabled={level === currentLevel}>{level}</button>)}
      </div>
      <video ref={playerRef}></video>
    </div>
  );
}

export default App;
