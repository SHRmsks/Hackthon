import React, { useState, useRef, useEffect } from "react";
import App1 from "./app.jsx";
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
import { useFonts } from "expo-font";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";

const App = () => {
  // const socket = new WebSocket("https://c749-204-8-158-101.ngrok-free.app/");
  const [fontsLoaded] = useFonts({
    customized: require("@assets/fonts/customized.ttf"), // Replace with your font file path
  });
  const type: CameraType = "back";
  const [imagemode, setImagemode] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [permission, setPermission] = useCameraPermissions();
  const [startrec, setStartrec] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    socket.current = new WebSocket("wss://c749-204-8-158-101.ngrok-free.app/mobile-predict"
     
    );
    socket.current.onopen = () => {
      console.log("Connected to websocket server");
      setIsConnected(true);
    };
    socket.current.onmessage = (e) => {
      console.log("Received from server:", e.data);
      setResponseMessage(e.data); // Handle the message received from the server
    };
    socket.current.onclose = () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    };
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  const sendImg = async (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.send(base64Image);
        console.log("Sent base64 image to server");
        const handleMessage = (event: MessageEvent) => {
          resolve(event.data); // Resolve the promise with the response data
          socket.current?.removeEventListener("message", handleMessage); // Clean up the listener
        };
        socket.current.addEventListener("message", handleMessage);
      } else {
        reject(new Error("WebSocket is not open"));
      }
      
    });
  };

  const start = () => {
    if (!startrec) {
      setStartrec(true);
    }
  };
  const onpress = () => {
    setImagemode((prev) => !prev);
  };

  const CameraRef = useRef<CameraView | null>(null);
  // let intervalref: number | undefined;

  useEffect(() => {
    console.log("sta: ", startrec);
    console.log("img: ", imagemode);
    if (startrec && !imagemode) {
      const intervalref = setInterval(async () => {
        await takingFrame();
      }, 300);

      const timeout = setTimeout(() => {
        if (intervalref) {
          setStartrec(false);
          console.log("startrec stopped");
          clearInterval(intervalref);

          console.log("stopped");
        } else {
          clearInterval(intervalref);
          clearTimeout(timeout);
        }
      }, 12000);

      return () => {
        if (intervalref) {
          clearInterval(intervalref);
        }
        setStartrec(false);
        clearTimeout(timeout);
      };
    } else if (startrec && imagemode) {
      console.log("hellp");
      const callback = async () => await takingFrame();
      callback();
      setStartrec(false);
    }
  }, [startrec, imagemode]);
  console.log("isconnected: ", isConnected);
  const takingFrame = async () => {
    if (startrec) {
      if (CameraRef.current) {
        try {
          const photo = await CameraRef.current.takePictureAsync({
            base64: true,
            quality: 0.8,
            skipProcessing: true,
          });
          console.log("Base64 Image: ", photo?.base64);
          try {

            if (photo?.base64) {
              await sendImg(photo.base64).then((response) => {
                console.log("Response from server:", response);

                  setResponseMessage (response);
                  console.log("type : ", typeof response);
              });
            } else {
              console.warn("Base64 image data is undefined");
            }
          } catch (e) {
            console.log("error on recieving: ", e);
          }
        } catch (error) {
          console.error("Error capturing frame: ", error);
        }
      } else {
        console.log("CameraRef is not available");
      }
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
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
          <View style={{ width: "100%", height: "100%", zIndex: 1 }}>
            <App1 response={responseMessage}/>
          </View>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={start}>
              {imagemode ? (
                <Text style={styles.text}>Photo</Text>
              ) : (
                <Text style={styles.text}>Start</Text>
              )}
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
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  Title: {
    flexDirection: "row",
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "baseline",
  },
  titletext: {
    color: "#bf900f",
    flexDirection: "row",
    fontSize: 23,
    fontFamily: "customized",
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
    zIndex: 3,
    justifyContent: "space-evenly",
  },
  camera: {
    position: "absolute",
    flex: 1,
    zIndex: -3,
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
    zIndex: 3,
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
    textAlign: "center",
    fontFamily: "customized",
  },

  icons: {
    flex: 1,
  },
});

export default App;
