import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Example JSON string input with bounding box data
const jsonString = `[
    {
        "minx": 0.2801480293273926,
        "miny": 0.0753866657614708,
        "width": 0.5721215009689331,
        "height": 0.7381686568260193,
        "label": "plastic"
    },
    {
        "minx": 0.7302178740501404,
        "miny": 0.21762925386428833,
        "width": 0.268867164850235,
        "height": 0.24840280413627625,
        "label": "plastic"
    },
    {
        "minx": 0.0005941867711953819,
        "miny": 0.001147060887888074,
        "width": 0.21895933151245117,
        "height": 0.8656633496284485,
        "label": "plastic"
    }
]`;

export default function App() {
    const [boundingBoxes, setBoundingBoxes] = useState([]);

    useEffect(() => {
        // Parse the JSON string and update boundingBoxes state
        const parsedData = JSON.parse(jsonString);
        setBoundingBoxes(parsedData);

        // Simulate real-time updates: For actual usage, replace this with WebSocket or API call
        const interval = setInterval(() => {
            setBoundingBoxes(JSON.parse(jsonString)); // Simulate an update with new data if available
        }, 2000); 
         //async to api call 


        return () => clearInterval(interval); // Clean up interval on unmount
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {/* Background view simulating camera feed */}
            <View style={{ width, height, backgroundColor: 'transparent' }} />

            {/* Render bounding boxes for each object in the frame */}
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
                    <Text style={styles.label}>{box.label}</Text>
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
