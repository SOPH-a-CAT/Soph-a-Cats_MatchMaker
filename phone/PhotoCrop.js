import * as FileSystem from 'expo-file-system/legacy';
import React,{useMemo,useEffect,useState} from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import {cropEditorHtml} from './crop-editor.mjs';
export default function PhotoCrop({source,onChange}){
 const [local,setLocal]=useState(source);useEffect(()=>{let active=true;if(!source.startsWith('data:'))FileSystem.readAsStringAsync(source,{encoding:FileSystem.EncodingType.Base64}).then(value=>{if(active)setLocal('data:image/png;base64,'+value)}).catch(()=>{});return()=>{active=false};},[source]);
 const html=useMemo(()=>cropEditorHtml(local),[local]);
 return <View style={{height:235}}><WebView source={{html}} originWhitelist={['*']} onShouldStartLoadWithRequest={r=>r.url==='about:blank'||r.url.startsWith('data:text/html')} javaScriptEnabled scrollEnabled nestedScrollEnabled onMessage={e=>{try{const data=JSON.parse(e.nativeEvent.data);if(data.type==='cutout'&&data.uri.startsWith('data:image/png;base64,'))onChange(data.uri);}catch{}}}/></View>;
}
