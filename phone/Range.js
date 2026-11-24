import React,{useRef} from 'react';
import {View,Text,PanResponder} from 'react-native';
export default function Range({label,value,min,max,step=1,onChange}){
 const width=useRef(1),start=useRef(value),current=useRef({value,onChange});current.current={value,onChange};
 const set=v=>current.current.onChange(Math.max(min,Math.min(max,Math.round(v/step)*step)));
 const responder=useRef(PanResponder.create({onStartShouldSetPanResponder:()=>true,onMoveShouldSetPanResponder:()=>true,onPanResponderGrant:()=>{start.current=current.current.value},onPanResponderMove:(_,g)=>set(start.current+g.dx/width.current*(max-min))})).current;
 return <View style={{marginVertical:4}}><Text style={{color:'#203e38',fontWeight:'600'}}>{label}</Text><View accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{min,max,now:value}} accessibilityActions={[{name:'increment'},{name:'decrement'}]} onAccessibilityAction={e=>set(value+(e.nativeEvent.actionName==='increment'?step:-step))} onLayout={e=>width.current=e.nativeEvent.layout.width} {...responder.panHandlers} style={{height:32,justifyContent:'center'}}><View style={{height:5,borderRadius:4,backgroundColor:'#cddfd6'}}/><View style={{position:'absolute',left:((value-min)/(max-min)*94)+'%',width:20,height:20,borderRadius:10,backgroundColor:'#286b61'}}/></View></View>;
}
