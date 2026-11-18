import React from 'react';
import {Image} from 'react-native';
export default function PhotoCrop({source,onChange}){void onChange;return <Image source={{uri:source}} style={{width:'100%',height:180}}/>;}
