import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { FlingGestureHandler, GestureHandlerRootView, Gesture,Directions, State } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

const Home = () => {
    const [fontsLoaded] = useFonts({
        customized: require("@assets/fonts/customized.ttf"), // Replace with your font file path
      });
    const router = useRouter();
  console.log("home is being rendered");
  

  const goToCamera = (e) => {
    if (e.nativeEvent.state===State.ACTIVE){
        router.push("/camera");
    }
    
  };



  const styles = StyleSheet.create({
    gradient:{
        flex:1,  
    }, 
    img:{
        width: '100%',
        height: '100%',
    }, 
    text:{
        fontSize: 23,
        color: "#dcf5ef",

    }, 
    div: {
      flexDirection: "column", 
      justifyContent: "flex-start", 
      position:"relative",
      width: "100%", 
      height: "100%",
    },
    wrapper:{
        flexDirection: "column", 
        justifyContent: "space-around",
        position:"relative",
        width: "100%", 
        height: "100%",
    }, 
    icon:{
        height:50,
        width: 50,
    },
    text: {
      color: "#dcf5ef",
      fontSize: 22,
      paddingHorizontal: 20,
      flexWrap: true,
      fontFamily: "customized",
    },
  });
  return (
    <LinearGradient 
    colors={["#50cc71", "#46bd91", "#0c8768"]}
    style={styles.gradient}
    >
    <GestureHandlerRootView style={{ flex: 1 }}>
        <FlingGestureHandler direction={Directions.UP} onHandlerStateChange={goToCamera} >
    <View style={styles.wrapper}>
    <View style={styles.div}>
        <View style={{height: "50%", height: 300, flexDirection:"column", paddingHorizontal: 20 }}>
            <Image source={require("@assets/images/recycle.png")} style={styles.img} resizeMode="contain"/> 
        </View>

       <Text style={
        styles.text
            }>
                Recycling is a small step with a big impact. Use this app to learn, engage, and make better choices for a sustainable future.
                {"\n"} {"\n"}

                Now it's the time to find out which one is recyclable, and collect them!
         </Text>


     
    </View>
    <View style={{width: "100%", height: 100, flexDirection:"row", paddingHorizontal: 20, justifyContent: "center", }}>
    <Image
                  source={require("@assets/images/swipeup.png")}
                  style={styles.icon}
                  resizeMode="contain"
                />
    </View>
</View>
    </FlingGestureHandler>
    </GestureHandlerRootView>
    </LinearGradient>
  );
};
export default Home;
