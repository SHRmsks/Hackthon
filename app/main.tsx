import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import App from './(tabs)/index'


const Stack = createStackNavigator () ; 
const HomeScreen = () =>{
return(
    <NavigationContainer>
        <Stack.Navigator>

            
        </Stack.Navigator>


    </NavigationContainer>



); 
}

export default HomeScreen;
