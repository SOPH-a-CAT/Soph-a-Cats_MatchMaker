import * as FileSystem from 'expo-file-system/legacy';
export async function savePhoto(source,id){
 const dir=FileSystem.documentDirectory+'wardrobe/';await FileSystem.makeDirectoryAsync(dir,{intermediates:true});
 const png=source.startsWith('data:image/png;'),uri=dir+id+(png?'.png':'.jpg');
 if(source.startsWith('data:image/'))await FileSystem.writeAsStringAsync(uri,source.split(',')[1],{encoding:FileSystem.EncodingType.Base64});
 else await FileSystem.copyAsync({from:source,to:uri});
 return uri;
}
