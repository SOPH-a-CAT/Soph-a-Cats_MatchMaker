import React from 'react';
export default function Frame({children}){return <div style={{width:'100%',height:'100dvh',background:'#e5f0eb',display:'flex',justifyContent:'center',overflow:'hidden'}}><div data-testid="phone-frame" style={{width:'100%',maxWidth:400,height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:'#f5faf7'}}>{children}</div></div>;}
