import 'package:flutter/material.dart';
import 'package:camera/camera.dart'; 

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Flutter Demo',
      home: Picture(),
    );
  }
}

class Picture extends StatefulWidget {
  const Picture({super.key});
  
  
  @override
  _PicState createState() => _PicState();
}

class _PicState extends State<Picture> {
 late bool click = false;
late CameraController _cameracontroller;
late Future<void>  _CameraControllerInitiate; 
@override 
void initState(){
  super.initState(); 
  _initiateCamera(); 
}
Future<void> _initiateCamera() async{
final cameras = await availableCameras(); 
late CameraDescription camera; 
if (cameras.isNotEmpty){
  camera = cameras.first; 
  
}else {
  throw Exception("No camera detected"); 
}
_cameracontroller= CameraController(camera, ResolutionPreset.high, enableAudio: true); 
_CameraControllerInitiate=   _cameracontroller.initialize(); 
setState(() => {}); 
}

@override
  void dispose() {
    // TODO: implement activate
   
    super.dispose();
     _cameracontroller.dispose(); 
  }

  @override
  Widget build(BuildContext context) {
    
    return Scaffold(
      appBar: AppBar(
       
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
  
      
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          //
          // TRY THIS: Invoke "debug painting" (choose the "Toggle Debug Paint"
          // action in the IDE, or press "p" in the console), to see the
          // wireframe for each widget.
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            FutureBuilder(future: _CameraControllerInitiate, builder:(context, snapshot){
              if(snapshot.connectionState == ConnectionState.done){
                return CameraPreview(_cameracontroller);

              }
              else {
            // Show a loading indicator while the camera is initializing
            return const Center(child: CircularProgressIndicator());
          }
            } 
            
            
            
            
            
            
            ),
            





          ],
        ),
      ),
      
      ); // This trailing comma makes auto-formatting nicer for build methods.
    
  }
}
