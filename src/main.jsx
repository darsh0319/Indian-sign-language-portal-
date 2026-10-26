import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const dictionary = [
 ['ACTION','FIST','Closed fist / Stop','All fingers curled into a fist. Thumb over fingers.'],
 ['ACTION','POINT','Point / You','Only index finger extended forward/up. Other fingers tucked.'],
 ['LETTER','A','Letter A','Closed fist, thumb resting along the side of the index finger. Keep knuckles facing the camera.'],
 ['LETTER','B','Letter B','Open palm facing camera, fingers together, thumb folded across palm. Fingers straight and close.'],
 ['LETTER','C','Letter C','Curve hand in a C-shape. Leave a clear gap between thumb and fingers.'],
 ['LETTER','D','Letter D','Index finger up; other fingers touch thumb forming a circle. Keep index vertical.'],
 ['LETTER','L','Letter L','Index up and thumb out — L shape. Other fingers curled.'],
 ['LETTER','V','Letter V / victory','Index and middle fingers up in a V. Palm facing camera.'],
 ['LETTER','W','Letter W','Index, middle and ring fingers up. Spread three fingers evenly.'],
 ['LETTER','Y','Letter Y','Thumb and pinky extended; middle fingers folded. Rock the hand slightly.']
];
function App() {
 const [tab,setTab]=useState('home');
 const [login,setLogin]=useState(false);
 const [demoUser,setDemoUser]=useState(false);
 const [camera,setCamera]=useState(false);
 const [pending,setPending]=useState(false);
 const [error,setError]=useState('');
 const [gesture,setGesture]=useState('---');
 const [confidence,setConfidence]=useState(0);
 const [output,setOutput]=useState('');
 const [auto,setAuto]=useState(true);
 const [speakAppend,setSpeakAppend]=useState(false);
 const [search,setSearch]=useState('');
 const [simulation,setSimulation]=useState(false);
 const video=useRef(null), canvas=useRef(null), stream=useRef(null), requestId=useRef(0), modal=useRef(null), loginButton=useRef(null);
 function speak(text){
  if(!text.trim())return;
  if(!('speechSynthesis' in window)){setError('Speech playback is not supported in this browser.');return;}
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
 }
 function stopCamera(){requestId.current++;stream.current?.getTracks().forEach(track=>track.stop());stream.current=null;if(video.current)video.current.srcObject=null;setCamera(false);setPending(false);setSimulation(false);setGesture('---');setConfidence(0);}
 async function startCamera(){
  if(pending||camera)return;
  const id=++requestId.current;
  setError('');setPending(true);
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');
   const feed=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480},audio:false});
   if(id!==requestId.current){feed.getTracks().forEach(track=>track.stop());return;}
   stream.current=feed;
   if(video.current){video.current.srcObject=feed;await video.current.play();}
   if(id!==requestId.current)return;
   setCamera(true);
   feed.getVideoTracks()[0].addEventListener('ended',()=>{if(stream.current===feed)stopCamera();});
  }catch(e){if(id===requestId.current){stopCamera();setError(e.name==='NotAllowedError'?'Camera permission was denied. Allow camera access in your browser and try again.':e.name==='NotFoundError'?'No camera was found. Connect a camera and try again.':'Unable to start the camera. Check that it is available and this page uses HTTPS.');}}
  finally{if(id===requestId.current)setPending(false);}
 }
 useEffect(()=>{if(tab!=='translator')stopCamera();},[tab]);
 useEffect(()=>()=>{requestId.current++;stream.current?.getTracks().forEach(track=>track.stop());window.speechSynthesis?.cancel();},[]);
 useEffect(()=>{
  if(!camera||!simulation)return;
  let frame,step=0;
  function draw(){const ctx=canvas.current?.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,400,320);step+=.05;const x=200+Math.sin(step)*20,y=160+Math.cos(step)*10;const points=[[0,60],[-30,30],[-45,0],[-55,-20],[-15,-40],[-20,-70],[0,-45],[0,-80],[15,-40],[20,-75],[30,-30],[40,-60]];ctx.strokeStyle='#38bdf8';ctx.lineWidth=3;ctx.beginPath();points.forEach(([dx,dy],i)=>i?ctx.lineTo(x+dx,y+dy):ctx.moveTo(x+dx,y+dy));ctx.stroke();points.forEach(([dx,dy])=>{ctx.fillStyle='#f97316';ctx.beginPath();ctx.arc(x+dx,y+dy,5,0,Math.PI*2);ctx.fill();});frame=requestAnimationFrame(draw);}
  draw();
  const timer=setInterval(()=>{const sign=dictionary[Math.floor(Math.random()*dictionary.length)][1];setGesture(sign);setConfidence(Math.floor(Math.random()*20)+80);if(auto){setOutput(prev=>prev?`${prev} ${sign}`:sign);if(speakAppend)speak(sign);}},3000);
  return()=>{clearInterval(timer);cancelAnimationFrame(frame);canvas.current?.getContext('2d')?.clearRect(0,0,400,320);};
 },[camera,simulation,auto,speakAppend]);
 useEffect(()=>{if(login)modal.current?.showModal();else if(modal.current?.open)modal.current.close();},[login]);
 const filtered=dictionary.filter(item=>item.slice(1).join(' ').toLowerCase().includes(search.toLowerCase()));
 function navigate(next){setTab(next);setError('');window.scrollTo(0,0);}
 return <><a className="skip" href="#main">Skip to content</a><div className="grid-background"/>
 <header><button className="brand" onClick={()=>navigate('home')} aria-label="HastVani home"><span className="logo">HV</span><span>HastVani</span></button><nav aria-label="Main navigation">{[['home','Home'],['learn','Learn ISL'],['translator','Translator']].map(([key,label])=><button key={key} className={tab===key?'active':''} aria-current={tab===key?'page':undefined} onClick={()=>navigate(key)}>{label}</button>)}{demoUser?<button className="user" onClick={()=>setDemoUser(false)} title="Leave demo session">Demo user · Exit</button>:<button ref={loginButton} className="login-button" onClick={()=>setLogin(true)}>Login</button>}</nav></header>
 <main id="main">
 {tab==='home'&&<section className="hero"><div><div className="eyebrow">INDIAN SIGN LANGUAGE · INTERACTIVE PROTOTYPE</div><h1>HastVani</h1><p className="hero-description">A full-stack ISL translator web portal: live video gesture recognition in React, API on Express/Node, and user history in MongoDB.</p><p className="prototype-note">Original interface prototype. Camera preview and speech work; recognition is simulated. Express and MongoDB are not connected.</p><div className="actions"><button className="primary" onClick={()=>navigate('translator')}>Start translating</button><button className="outline" onClick={()=>navigate('learn')}>Practice gestures</button></div></div><div className="hand-panel"><svg width="240" height="240" viewBox="0 0 200 200" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Decorative hand landmark illustration"><path d="M 50,150 Q 50,100 70,80 T 90,40 Q 95,35 100,40 T 100,80 T 115,30 Q 120,25 125,30 T 120,80 T 135,35 Q 140,30 145,35 T 135,85 T 150,50 Q 155,45 160,50 T 145,110 Q 130,160 100,165 Z"/>{[[95,40],[120,30],[140,35],[155,50]].map(([cx,cy])=><circle key={cx} cx={cx} cy={cy} r="3" fill="#f97316"/>)}</svg><span>Live landmark tracking from video · demo</span></div></section>}
 {tab==='translator'&&<><p className="notice">Prototype mode: camera video is real. The optional demo generates random signs and synthetic landmarks, not gesture recognition.</p><div className="translator-grid"><section className="panel"><div className="panel-heading"><h2>Video feed</h2><div className="actions compact"><button className="primary" onClick={startCamera} disabled={camera||pending}>{pending?'Starting…':'Start camera'}</button><button className="stop" onClick={stopCamera} disabled={!camera&&!pending}>Stop</button></div></div><div className="video-box"><video ref={video} autoPlay playsInline muted className={camera?'':'hidden'}/><canvas ref={canvas} width="400" height="320" className={camera&&simulation?'':'hidden'}/>{!camera&&<div className="camera-placeholder"><strong>{pending?'Requesting camera access…':'Camera off'}</strong><span>Click Start camera and allow access when prompted.</span></div>}</div><p className="caption">{camera?'Camera running':'Camera stopped'}</p>{error&&<p className="error" role="alert">{error}</p>}<label className="demo-toggle"><input type="checkbox" checked={simulation} disabled={!camera} onChange={e=>{setSimulation(e.target.checked);setGesture('---');setConfidence(0);}}/> Run simulated recognition demo</label></section><section className="panel"><div className="panel-heading"><h2>Translation</h2><div className="actions compact"><button onClick={()=>speak(output)} disabled={!output.trim()}>Speak</button><button onClick={()=>setOutput(prev=>prev+' ')}>Space</button><button onClick={()=>setOutput('')}>Clear</button></div></div><div className="inset"><div className="label">CURRENT GESTURE {simulation?'· SIMULATED':''}</div><div className="confidence" style={{transform:`scaleX(${confidence/100})`}}/><strong aria-live="polite">{gesture} ({confidence}%)</strong></div><div className="inset output"><div className="label">OUTPUT</div><div className={output?'':'muted'} aria-live="polite">{output||'Signed letters will appear here...'}</div></div><div className="checks"><label><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/> Auto-append stable signs</label><label><input type="checkbox" checked={speakAppend} onChange={e=>setSpeakAppend(e.target.checked)}/> Speak on append</label></div><div className="inset tips"><h3>Accuracy tips</h3><ul><li>Bright light, plain background, one hand fully in frame</li><li>Real sign detection requires a trained model; this version is a demo</li><li>Demo gestures: A, B, C, D, L, V, W, Y, FIST, POINT</li></ul></div><h3>Saved history (MongoDB)</h3><p className="caption">Not connected in this prototype. Translations are temporary and are cleared on refresh.</p></section></div></>}
 {tab==='learn'&&<section><h1 className="learn-title">Learn ISL gestures</h1><p className="muted">Practice these in the live translator.</p><p className="notice">Original prototype gesture cards. These single-hand letter descriptions are not a verified ISL alphabet. Learn authentic ISL from <a href="https://islrtc.nic.in/" target="_blank" rel="noreferrer">ISLRTC resources ↗</a>.</p><label className="search-label" htmlFor="search">Search gestures</label><input id="search" className="search" type="search" placeholder="Search A, fist, victory…" value={search} onChange={e=>setSearch(e.target.value)}/><div className="dictionary">{filtered.map(([type,name,title,desc])=><article className="card" key={name}><div className="type">{type}</div><h3>{name}</h3><h4>{title}</h4><p>{desc}</p></article>)}</div>{!filtered.length&&<p role="status" className="notice">No gestures match “{search}”. Try a letter or “fist”.</p>}</section>}
 </main>
 <dialog ref={modal} onCancel={()=>setLogin(false)} onClose={()=>{setLogin(false);loginButton.current?.focus();}}><button className="close" aria-label="Close login" onClick={()=>setLogin(false)}>×</button><h2>Welcome back</h2><p className="muted">Login to save translations to MongoDB.</p><p className="notice">Demo only. Accounts and database storage are not connected. No password is collected.</p><button className="primary full" onClick={()=>{setDemoUser(true);setLogin(false);}}>Continue as demo user</button><p className="modal-foot">Account creation is unavailable in this prototype.</p></dialog>
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
