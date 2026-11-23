import React,{useEffect,useMemo,useRef} from 'react';
import {cropEditorHtml} from './crop-editor.mjs';
export default function PhotoCrop({source,onChange}){
 const frame=useRef(null),html=useMemo(()=>cropEditorHtml(source),[source]);
 useEffect(()=>{const receive=e=>{if(e.source!==frame.current?.contentWindow)return;try{const data=JSON.parse(e.data);if(data.type==='cutout'&&data.uri.startsWith('data:image/png;base64,'))onChange(data.uri);}catch{}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[onChange]);
 return <iframe ref={frame} title="Clothing photo editor" sandbox="allow-scripts" srcDoc={html} style={{width:'100%',height:690,border:0}}/>;
}
