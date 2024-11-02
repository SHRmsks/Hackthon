import React, { useState, useRef, useEffect} from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity,Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { CameraType, CameraView, CameraViewRef, useCameraPermissions } from "expo-camera";

const App = () => {
  const [type, setType] = useState<CameraType>("front");
  const [permission, setPermission] = useCameraPermissions();
  
  const onpress = ()=> {
   type ==="front"? setType("back"): setType("front"); 
  
  }
  const CameraRef = useRef<CameraView | null>(null);  
  // let intervalref: number | undefined;
  
  useEffect (()=> {
    const intervalref = setInterval(async () => {
      await takingFrame();
    }, 1000); 

    const timeout = setTimeout(() => {
      if (intervalref){
        clearInterval(intervalref); 
       
        console.log("stopped") ;
      } 
    }, 10000);

    return () => {
        
      if(intervalref) {
        clearInterval(intervalref);
      }
      
      clearTimeout(timeout);
    }; 
  },[]); 





  const takingFrame  = async ()=> {
    if (CameraRef.current){
        let photo = await CameraRef.current.takePictureAsync({base64: true, quality:0.8, skipProcessing: true, }); 
        console.log("Base64 Image:", photo?.base64); 
    }   
  }
  if (!permission) {
    // Camera permissions are still loading.
    return <View></View>;
  }
  if (!permission?.granted) {
    <View style={styles.warning}>
      <Text style={styles.text}>we need your permission for camera</Text>
      <Button title="Grant permission" onPress={setPermission}></Button>
    </View>;
  }
  return (
    <LinearGradient
      colors={["#82edb1", "#3ca63c", "#10753c"]} // Bright colors to test visibility
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <CameraView facing={type} style={styles.camera}
          ref={CameraRef}
          onCameraReady={takingFrame}
          flash={'off'}
          mute={true}
          autofocus={'on'}
          >


          <TouchableOpacity style= {styles.button} onPress={onpress}> 
                <View style={styles.container}>
                  <Image source={require('@assets/images/flip.png')} style= {styles.icons}  resizeMode="contain"/>
                </View>
              </TouchableOpacity>
          </CameraView>
          
          <View > 
              
            
             </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  warning: {
    flex: 0.5,
    justifyContent: "center",
    backgroundColor: "white",
  },

  safeArea: {
    flex: 1,
  },
  camera: {
    flex: 1,
    width: "100%",
    height:"100%",
    flexDirection: "column",
    justifyContent:"flex-end",
    paddingVertical:20,  
    alignItems: "center",
   

  },
  gradient: {
    flex: 1,
    width: "100%",
  },
  button: {
    height: 50,
    width: 120,
    justifyContent: "center",
   
    backgroundColor: "#7bb096", 
    borderRadius: 20, 
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  icons:{
    flex: 1, 
    
  }
});

export default App;
