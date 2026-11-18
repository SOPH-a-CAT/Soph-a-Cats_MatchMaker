import React,{useState,useEffect,useRef} from 'react';
import {View,Text,StyleSheet,ScrollView,Pressable,TextInput,Image,Alert,ActivityIndicator,SafeAreaView,Platform} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import {savePhoto} from './save-photo';
import Frame from './Frame';
import {outfitUrl,requestHeaders} from './ai-connection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg,{Circle,Path} from 'react-native-svg';

function showAlert(title,message){if(Platform.OS==='web')window.alert(title+'\n'+message);else Alert.alert(title,message);}
const KEY='matchmaker-v1';
const stylesList=['Flexible','Tailored / Formal','Casual / Basics','Athletic / Activewear','Soft / Feminine','Edgy / Alternative','Boho / Eclectic','Smart Casual / Heritage','Utilitarian / Workwear','Tailored / Structured','Smart Casual / Preppy','Flowing / Relaxed'];
/** @typedef {{id:string,name:string,color:string,type:string,uri:string}} Clothing */
/** @type {{clothes:Clothing[],outfit:string[],style:string}} */
const empty={clothes:[],outfit:[],style:'Flexible'};
export default function App(){return <Frame><Wardrobe/></Frame>;}
function Wardrobe(){
 const [data,setData]=useState(empty),[ready,setReady]=useState(false),[status,setStatus]=useState('Opening your wardrobe…'),[busy,setBusy]=useState(false),[draft,setDraft]=useState(/** @type {null | {uri:string,name:string,color:string,type:string}} */(null)),[error,setError]=useState('');
 const saving=useRef(Promise.resolve()),requesting=useRef(false),version=useRef(0);
 useEffect(()=>{AsyncStorage.getItem(KEY).then(raw=>{if(raw){const value=JSON.parse(raw);if(!Array.isArray(value.clothes)||!Array.isArray(value.outfit))throw Error();setData(value);}setReady(true);setStatus('Saved on this device');}).catch(()=>setStatus('Could not open saved clothes. Please reopen the app.'));},[]);
 useEffect(()=>{if(!ready)return;const n=++version.current;saving.current=saving.current.catch(()=>{}).then(()=>{setStatus('Saving…');return AsyncStorage.setItem(KEY,JSON.stringify(data));});saving.current.then(()=>{if(version.current===n)setStatus('Saved on this device');}).catch(()=>{if(version.current===n)setStatus('Not saved. Your phone may be out of storage. Keep the app open.');});},[data,ready]);
 async function capture(camera){
  try{
   if(camera){const permission=await ImagePicker.requestCameraPermissionsAsync();if(!permission.granted){showAlert('Camera access','Allow camera access in your phone settings, or choose a photo instead.');return;}}
   const result=await (camera?ImagePicker.launchCameraAsync:ImagePicker.launchImageLibraryAsync)({mediaTypes:['images'],quality:.7,allowsEditing:true,exif:false,base64:Platform.OS==='web'});
   if(!result.canceled)setDraft({uri:Platform.OS==='web'&&result.assets[0].base64?'data:'+ (result.assets[0].mimeType||'image/jpeg')+';base64,'+result.assets[0].base64:result.assets[0].uri,name:'',color:'',type:'Top'});
  }catch{showAlert('Could not open camera','Try choosing a photo instead.');}
 }
 async function add(){
  if(!draft.name.trim()||!draft.color.trim()){showAlert('A little detail helps','Add a short clothing name and its main color. Photos stay on your phone; these details help the AI match.');return;}
  setBusy(true);
  try{const id=Date.now().toString();const uri=await savePhoto(draft.uri,id);setData(d=>({...d,clothes:[...d.clothes,{...draft,name:draft.name.trim(),color:draft.color.trim(),uri,id}]}));setDraft(null);}catch(photoError){console.warn('Photo save failed:',photoError?.name,photoError?.message);showAlert('Could not save photo','Please check your phone’s available storage and try again.');}finally{setBusy(false);}
 }
 async function makeOutfit(){
  if(requesting.current)return;
  if(!data.clothes.some(c=>c.type==='Top')||!data.clothes.some(c=>c.type==='Bottom')){setError('Photograph at least one top and one bottom first.');return;}
  requesting.current=true;setBusy(true);setError('');
  try{
   const response=await fetch(outfitUrl,{method:'POST',headers:requestHeaders,body:JSON.stringify({clothes:data.clothes.map(({id,name,color,type})=>({id,name,color,type})),style:data.style}),signal:AbortSignal.timeout(55000)});
   const answer=await response.json();if(!response.ok){setError(typeof answer.error==='string'?answer.error:'Could not make an outfit. Check the helper and Wi-Fi.');return;}
   if(!Array.isArray(answer.ids)||answer.ids.some(id=>!data.clothes.some(c=>c.id===id)))throw Error();
   setData(d=>({...d,outfit:answer.ids}));
  }catch{setError('Could not make an outfit. Check the API key, Wi-Fi, and that the helper is running on your computer.');}finally{requesting.current=false;setBusy(false);}
 }
 const chosen=data.clothes.filter(c=>data.outfit.includes(c.id));

 if(!ready)return <SafeAreaView style={s.page}><Text style={s.copy}>{status}</Text><ActivityIndicator/></SafeAreaView>;
 return <SafeAreaView style={s.page}><StatusBar style="dark"/><ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled"><Text style={s.logo}>MatchMaker ✳</Text><Text style={s.kicker}>YOUR CLOTHES. A FRESH COMBINATION.</Text><Text style={s.title}>Less guessing.\nMore getting ready.</Text><Text style={s.copy}>Choose from clothes you already own.</Text><Text accessibilityLiveRegion="polite" style={s.status}>{status}</Text>
 <Action label={busy?'Thinking…':'Make an outfit for me'} action={makeOutfit} disabled={busy}/>
 {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
 <Text style={s.privacy}>Photos stay on this device. When you press the button, only clothing details and your style go to OpenAI through the secure server.</Text>
 <View style={s.board}><Text style={s.heading}>Today’s outfit</Text><View style={s.figure}>
 <Svg width={210} height={330} viewBox="0 0 210 330"><Circle cx="105" cy="28" r="21" fill="#cfccc1"/><Path d="M92 48L118 48 125 62 145 70 161 167 149 171 131 98 126 181 135 307 116 307 105 210 94 307 75 307 84 181 79 98 61 171 49 167 65 70 85 62Z" fill="#cfccc1"/></Svg>
 {chosen.map(c=><Image accessibilityLabel={c.name} key={c.id} source={{uri:c.uri}} resizeMode="contain" style={[s.overlay,c.type==='Top'?s.top:c.type==='Bottom'?s.bottom:c.type==='Shoes'?s.shoes:s.accessory]}/>)}
 </View><Text style={s.caption}>2D outfit layout · not a prediction of fit</Text>{!chosen.length&&<Text style={s.copy}>Your suggested pieces will appear here.</Text>}{chosen.map(c=><Text key={c.id} style={s.pieceLabel}>{c.name} · {c.color}</Text>)}</View>
 <Text style={s.heading}>Your style</Text><Text style={s.copy}>Optional. Pick what feels like you.</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{stylesList.map(st=><Pressable key={st} accessibilityRole="button" accessibilityState={{selected:data.style===st}} onPress={()=>setData(d=>({...d,style:st}))} style={[s.chip,data.style===st&&s.active]}><Text style={data.style===st?{color:'white'}:{color:'#213c39'}}>{st}</Text></Pressable>)}</ScrollView>
 <View style={s.row}><Text style={s.heading}>My wardrobe</Text><Text style={s.copy}>{data.clothes.length} pieces</Text></View><Text style={s.copy}>Lay each piece flat on a plain background. Crop closely. Use clothing-only photos.</Text>
 <Action label="Photograph a piece" action={()=>capture(true)} secondary disabled={busy}/><Action label="Choose a clothing photo" action={()=>capture(false)} secondary disabled={busy}/>
 {draft&&<View style={s.card}><Text style={s.heading}>Add this piece</Text><Image source={{uri:draft.uri}} style={s.draft}/><TextInput accessibilityLabel="Clothing name" style={s.input} maxLength={80} placeholder="Name, e.g. striped cotton shirt" value={draft.name} onChangeText={name=>setDraft(d=>({...d,name}))}/><TextInput accessibilityLabel="Main color" style={s.input} maxLength={40} placeholder="Main color, e.g. blue and white" value={draft.color} onChangeText={color=>setDraft(d=>({...d,color}))}/><View style={s.wrap}>{['Top','Bottom','Shoes','Accessory'].map(type=><Pressable key={type} onPress={()=>setDraft(d=>({...d,type}))} style={[s.chip,draft.type===type&&s.active]}><Text style={draft.type===type?{color:'white'}:{}}>{type}</Text></Pressable>)}</View><Action label="Save piece" action={add} disabled={busy}/><Action label="Cancel" action={()=>setDraft(null)} secondary disabled={busy}/></View>}
 <View style={s.wrap}>{data.clothes.map(c=><View key={c.id} style={s.tile}><Image source={{uri:c.uri}} style={s.thumb}/><Text style={s.pieceLabel}>{c.name}</Text><Text style={s.caption}>{c.type} · {c.color}</Text></View>)}</View>
 {!data.clothes.length&&<Text style={s.empty}>An empty closet, ready for your clothes. Add a top and bottom to begin.</Text>}<Text style={s.privacy}>Taste is personal. This app makes outfit suggestions, not body ratings or safety advice. Local storage is not a backup; clearing app or browser data can remove your wardrobe.</Text></ScrollView></SafeAreaView>;
}
function Action({label,action,secondary=false,disabled=false}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={action} style={[s.button,secondary&&s.secondary,disabled&&s.disabled]}><Text style={[s.buttonText,secondary&&{color:'#213c39'}]}>{label}</Text></Pressable>;}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#faf9f4'},body:{padding:22,paddingBottom:60},logo:{fontSize:26,fontWeight:'800',color:'#213c39',marginBottom:24},kicker:{fontSize:10,letterSpacing:2,color:'#657c73'},title:{fontSize:36,lineHeight:40,fontWeight:'700',color:'#203b37',marginTop:12},copy:{fontSize:14,lineHeight:21,color:'#65736c',marginVertical:6},status:{fontSize:12,color:'#476c55',marginVertical:12},button:{backgroundColor:'#264f45',padding:17,borderRadius:14,alignItems:'center',marginVertical:6},buttonText:{color:'white',fontWeight:'700',fontSize:16},secondary:{backgroundColor:'#e9eee5'},disabled:{opacity:.55},privacy:{fontSize:11,lineHeight:17,color:'#6c756e',marginVertical:12},error:{backgroundColor:'#ffe5d7',padding:14,borderRadius:12,color:'#79422b'},board:{backgroundColor:'#e9ede2',borderRadius:24,padding:20,marginVertical:20},heading:{fontSize:21,fontWeight:'700',color:'#213c39',marginVertical:8},figure:{width:210,height:330,alignSelf:'center',position:'relative',marginVertical:12},overlay:{position:'absolute'},top:{top:61,left:51,width:108,height:105},bottom:{top:160,left:65,width:80,height:133},shoes:{top:290,left:63,width:84,height:36},accessory:{top:57,left:85,width:40,height:45},caption:{fontSize:11,color:'#6b786d',textAlign:'center'},pieceLabel:{fontSize:14,fontWeight:'600',color:'#29473d',marginVertical:5},chip:{padding:12,backgroundColor:'#e9eee5',borderRadius:20,marginRight:7,marginVertical:7},active:{backgroundColor:'#264f45'},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:22},wrap:{flexDirection:'row',flexWrap:'wrap'},card:{backgroundColor:'white',padding:16,borderRadius:18,marginVertical:12},input:{borderWidth:1,borderColor:'#d9e0d4',borderRadius:10,padding:14,marginVertical:6},draft:{width:'100%',height:180},tile:{width:'47%',padding:10,margin:'1.5%',backgroundColor:'white',borderRadius:15},thumb:{width:'100%',height:145,resizeMode:'contain'},empty:{padding:24,textAlign:'center',color:'#6b786d',lineHeight:23}});
