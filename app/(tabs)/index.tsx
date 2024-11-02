import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font"
import {
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";


const App = () => {
  const [fontsLoaded] = useFonts({
    "customized": require("@assets/fonts/customized.ttf"), // Replace with your font file path
  });
  const type: CameraType = "back";
  const [imagemode, setImagemode] = useState(false); 
  const [permission, setPermission] = useCameraPermissions();
  const [startrec, setStartrec] = useState(false ); 

  const start = () => 
    {
      if (!startrec) {
          setStartrec (true)
      }

    }
  const onpress = () => {
    setImagemode(prev=> !prev)
  };
  
  const CameraRef = useRef<CameraView | null>(null);
  // let intervalref: number | undefined;

  useEffect(() => {
    console.log("sta: ", startrec)
    console.log("img: ", imagemode)
    if (startrec && !imagemode){

    const intervalref = setInterval(async () => {
      await takingFrame();
    }, 1000);
  
    const timeout = setTimeout(() => {
      if (intervalref) {
        setStartrec(false); 
        console.log("startrec stopped");
        clearInterval(intervalref);

        console.log("stopped");
      }
      else{
        clearInterval(intervalref);
        clearTimeout(timeout);
      }
    }, 10000);
  
    return () => {
      if (intervalref) {
        clearInterval(intervalref);
      }
      setStartrec(false); 
      clearTimeout(timeout);
    };
  
  

  
  }else if(startrec&& imagemode){
    console.log("hellp");
    const callback = async () => await (takingFrame()) ;
    callback();
    setStartrec(false);
    
  }
  
  }, [startrec, imagemode]);



  const takingFrame = async () => {
    if (startrec){
      if (CameraRef.current) {
        try {
          const photo = await CameraRef.current.takePictureAsync({
            base64: true,
            quality: 0.8,
            skipProcessing: true,
          });
          console.log("Base64 Image: ", photo?.base64);
        } catch (error) {
          console.error("Error capturing frame: ", error);
        }
      } else {
        console.log("CameraRef is not available");
      }
  }};

  if (!permission) {
    // Camera permissions are still loading.
    return <View><Text>Loading...</Text></View>;
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
      {/* <SafeAreaView style={styles.safeArea}> */}
        <View style={styles.Title}>

          <Text style={styles.titletext}>
                Let's find out whether is recycable!
          </Text>
        </View>
        <View style={styles.container}>
          <CameraView
            facing={type}
            style={styles.camera}
            ref={CameraRef}
            onCameraReady={takingFrame}
            flash={"off"}
            mute={true}
            autofocus={"on"}
            animateShutter={false}
          >
            <View style= {styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={start}>
            {
              imagemode ? 
            <Text style={styles.text}>Photo</Text> :<Text style={styles.text}>Start</Text> 
}
            </TouchableOpacity>


            <TouchableOpacity style={styles.button} onPress={onpress}>
              <View style={styles.container}>
                <Image
                  source={require("@assets/images/flip.png")}
                  style={styles.icons}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
            </View>
          </CameraView>

         
        </View>
      {/* </SafeAreaView> */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  Title : {
    flexDirection: "row",
     width: "100%", 
     height: 40, 
    justifyContent:"center",
    alignItems: "baseline"
  },
  titletext: {
color: "#bf900f",
flexDirection:"row",
fontSize: 23,
fontFamily:"customized",
flexWrap: "wrap",
  },
  warning: {
    flex: 0.5,
    justifyContent: "center",
    backgroundColor: "white",
  },

  safeArea: {
    flex: 1,
  },
  buttons: {
    width: "100%",
    height: 50,
    flexDirection: "row",

    justifyContent:"space-evenly"
  },
  camera: {
    flex: 1,
    width: "95%",
    height: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
    paddingVertical: 20,
    alignItems: "center",
   
  },
  gradient: {
    flex: 1,
    width: "100%",
  },
  button: {
    height: "100%",
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
    fontSize: 20,
    fontWeight: "bold",
    textAlign:"center",
    fontFamily:"customized",
  },

  icons: {
    flex: 1,
  },
});

export default App;



