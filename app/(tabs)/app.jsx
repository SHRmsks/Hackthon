import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';


export default  function App1() {
 const { width, height } = Dimensions.get('window');


const jsonString = `[
    {
        "minx": 0.245,
        "miny": 0.369,
        "width": 0.53,
        "height": 0.34
    },
    {
        "minx": 0.54,
        "miny": 0.123,
        "width": 0.24,
        "height": 0.53
    }
]`;

    const [boundingBoxes, setBoundingBoxes] = useState([]);

    useEffect(() => {
        
        const parsedData = JSON.parse(jsonString);
        setBoundingBoxes(parsedData);

        const interval = setInterval(() => {
            setBoundingBoxes(JSON.parse(jsonString));
        }, 2000);

        return () => clearInterval(interval); 
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            
            <View style={{ width, height, backgroundColor: '#ccc' }} />

            {boundingBoxes.map((box, index) => (
                <View
                    key={index}
                    style={[
                        styles.overlay,
                        {
                            top: box.miny * height,
                            left: box.minx * width,
                            width: box.width * width,
                            height: box.height * height,
                        },
                    ]}
                >
                    <Text style={styles.label}>Detected Object {index + 1}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        borderColor: 'red',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        color: 'white',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 4,
        borderRadius: 4,
    },
});