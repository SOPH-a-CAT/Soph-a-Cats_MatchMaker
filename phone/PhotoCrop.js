import React,{useMemo} from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import {cropEditorHtml} from './crop-editor.mjs';
export default function PhotoCrop({source,onChange}){
 const html=useMemo(()=>cropEditorHtml(source),[source]);
 return <View style={{height:690}}><WebView source={{html}} originWhitelist={['*']} onShouldStartLoadWithRequest={r=>r.url==='about:blank'||r.url.startsWith('data:text/html')} javaScriptEnabled scrollEnabled nestedScrollEnabled onMessage={e=>{try{const data=JSON.parse(e.nativeEvent.data);if(data.type==='cutout'&&data.uri.startsWith('data:image/png;base64,'))onChange(data.uri);}catch{}}}/></View>;
}
