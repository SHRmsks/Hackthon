import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App({ response }) {
    const [boundingBoxes, setBoundingBoxes] = useState([]);
    console.log("app data ", response);
    useEffect(() => {
        let parsedData = [];
        
        try {
            // Check if `response` is a JSON string or an already parsed array
            if (typeof response === 'string') {
                parsedData = JSON.parse(response);
            } else {
                parsedData = response;
            }

            // Ensure parsedData is an array before setting it
            if (Array.isArray(parsedData)) {
                setBoundingBoxes(parsedData);
            } else {
                console.warn("Parsed data is not an array");
                setBoundingBoxes([]); // Default to an empty array if data is invalid
            }
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            setBoundingBoxes([]); // Set an empty array if parsing fails
        }

        // Simulate real-time updates (or replace with WebSocket/API call)
        const interval = setInterval(() => {
            try {
                const updatedData = typeof response === 'string' ? JSON.parse(response) : response;
                if (Array.isArray(updatedData)) {
                    setBoundingBoxes(updatedData);
                }
            } catch (error) {
                console.error("Failed to parse JSON on update:", error);
            }
        }, 2000);

        return () => clearInterval(interval); // Clean up interval on unmount
    }, [response]);

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