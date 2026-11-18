import * as FileSystem from 'expo-file-system/legacy';
export async function savePhoto(source,id){const dir=FileSystem.documentDirectory+'wardrobe/';await FileSystem.makeDirectoryAsync(dir,{intermediates:true});const uri=dir+id+'.jpg';await FileSystem.copyAsync({from:source,to:uri});return uri;}
