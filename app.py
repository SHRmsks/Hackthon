# To deploy locally for testing - python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
# pip install python-multipart

#===================================================================================================
# Import required libraries
#===================================================================================================
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
import asyncio
from fastapi.responses import HTMLResponse, JSONResponse
from ultralytics import YOLO
from PIL import Image, ImageDraw
from io import BytesIO
import json
import base64
import io
import os
import uvicorn

#===================================================================================================
# Setup app api, and import model from local space (May upload to Virtual Container)
#===================================================================================================
app = FastAPI()
model = YOLO("./runs/detect/train11/weights/best.pt")

# Create directory paths/directories to store images for further training/testing
os.makedirs("./new_test_data/images/", exist_ok=True)
os.makedirs("./new_test_data/labels/", exist_ok=True)

#===================================================================================================
# Create labels array to classify metal, etc.
#===================================================================================================

class_labels = {
    "Aerosols": 0,
    "Aluminum can": 0,
    "Aluminum caps": 0,
    "Cardboard": 3,
    "Cellulose": 3,
    "Ceramic": 7,
    "Combined plastic": 2,
    "Container for household chemicals": 7,
    "Disposable tableware": 7,
    "Electronics": 5,
    "Foil": 0,
    "Furniture": 7,
    "Glass bottle": 1,
    "Iron utensils": 0,
    "Liquid": 7,
    "Metal shavings": 0,
    "Milk bottle": 1,
    "Organic": 4,
    "Paper": 3,
    "Paper bag": 3,
    "Paper cups": 3,
    "Paper shavings": 3,
    "Papier mache": 3,
    "Plastic bag": 2,
    "Plastic bottle": 2,
    "Plastic can": 2,
    "Plastic canister": 2,
    "Plastic caps": 2,
    "Plastic cup": 2,
    "Plastic shaker": 2,
    "Plastic shavings": 2,
    "Plastic toys": 2,
    "Postal packaging": 3,
    "Printing industry": 7,
    "Scrap metal": 0,
    "Stretch film": 2,
    "Tetra pack": 7,
    "Textile": 7,
    "Tin": 0,
    "Unknown plastic": 2,
    "Wood": 6,
    "Zip plastic bag": 2
}

class_labels_array = list(class_labels.keys())
classes = ["metal", "glass", "plastic", "paper", "food_waste", "electronics", "wood", "non_recyclable"]
#===================================================================================================
# Define Function to Process Images and Save for Testing
#===================================================================================================
def detectA(image: Image):
    minConf = .6
    iwidth, iheight = image.size
    boundedImage = Image.new("RGBA", (iwidth, iheight), (0, 0, 0, 0))
    #boundedImage = image.copy()
    drawBoundedImage = ImageDraw.Draw(boundedImage)

# Run image through model and create arrays for later result storage
    result = model(image)
    new_labels = []
    returnjson = []

    for processedImage in result:
        for boundsbox in processedImage.boxes:

            #if int(boundsbox.conf[0].item()) < minConf:
                #continue

# Extract information from the processed image for further processing - Unnormalize the xmin, ymin, xmax, ymax from 0 - 1 to pixel counts
            xmin, ymin, xmax, ymax = boundsbox.xyxy[0].cpu().numpy()[:4]
            xmin = max(0, min(xmin, iwidth))
            ymin = max(0, min(ymin, iheight))
            xmax = max(0, min(xmax, iwidth))
            ymax = max(0, min(ymax, iheight))

# Make sure xmin is always less than xmax, and the same for y
            if xmin != xmax:
                xmin, xmax = sorted([xmin, xmax])
            if ymin != ymax:
                ymin, ymax = sorted([ymin, ymax])
                        
# Process to save data for another testing/training series
            class_id = class_labels_array[int(boundsbox.cls[0].item())]
            xcenter = ((xmin + xmax) /2 ) / iwidth
            ycenter = ((ymin + ymax) /2 ) / iheight
            width =  (xmax - xmin) / iwidth
            height = (ymax - ymin) / iheight

# Append JSON dictionary for frontend to read and draw bounding boxes
            returnjson.append({
                "minx": float(xmin / iwidth),
                "miny": float(ymin / iheight),
                "width": float(width),
                "height": float(height),
                "label": classes[class_labels[class_id]]
            })

# Calculate the coordinates of labels so they don't escape the boundaries of the image
            #label_x = xmin + 3
            #label_y = ymin + 3

#           print(f"Detected object at [{xmin}, {ymin}, {xmax}, {ymax}] with class {class_id}")

# Draw bounding box with label
            #drawBoundedImage.rectangle([(xmin,ymin), (xmax,ymax)], outline=(255, 0, 0), width=2)
            #drawBoundedImage.text((label_x, label_y), classes[class_labels[class_id]], fill=(255, 0, 0))

# Store detection parameters in an array for later saving to OS
            new_labels.append(f"{int(boundsbox.cls[0].item())} {xcenter:.2f} {ycenter:.2f} {width:.2f} {height:.2f}")

# Save image and corresponding label to a new_test directory
    image_id = str(len(os.listdir("./new_test_data/images/")))
    image_name = f"image_{image_id}.png"
    label_name = f"label_{image_id}.txt"

    #boundedimage_name = f"bounded image_{image_id}.png"
    #boundedImage.save(os.path.join("./new_test_data/boundedImages", boundedimage_name), format = "PNG")

# Save images and labels with corresponding ./new_test_data/ path
    image.save(os.path.join("./new_test_data/images/" , image_name), format ="PNG")
    with open(os.path.join("./new_test_data/labels/", label_name), "w") as labeltxt:
        labeltxt.write("\n".join(new_labels))
# Return array of JSON dictionaries to the front end
    return returnjson

#===================================================================================================
# Define function to parse Base64 string from front-end into image object
# Parse any Base64 image strings into an actual image through string --> bytes --> image
#===================================================================================================
def toImage(data):
    image_data = base64.b64decode(data)
    image_file = BytesIO(image_data)
    image = Image.open(image_file)

    return image

#===================================================================================================
# Check for HTTP Connnections, return that we don't want them.
#===================================================================================================
@app.get("/")
def root():
    return {"status": "Server running, WebSocket connections available"}

#===================================================================================================
# Listen for websocket connections on mobile on ws://domain.tech/mobile-predict
# We have robust error checking to see if we have valid data. We also want to gracefully 
#===================================================================================================

@app.websocket('/mobile-predict')
async def websocket_mobile(websocket: WebSocket):
    await websocket.accept()
    print(f"Web websocket connected with client id: {websocket.client}")
    while True:
        image = None
        try:
            data = await asyncio.wait_for(websocket.receive_text(), timeout=600) 
            image = toImage(data)
        except asyncio.TimeoutError:
            print("No data received in 600 seconds, closing connection.")
            await websocket.close()
            break
        except WebSocketDisconnect:
            print("WebSocket disconnected.")
            break
        except Exception as e:
            print(f"Error: {e}")
            await websocket.send_text(f"Error: {e}")
            continue
        if image:
            try:
                await websocket.send_json(detectA(image))
            except Exception as e:
                await websocket.send_text(f"Error caught with error:{e}")
                continue

#===================================================================================================
# Listen for websocket connections on mobile on ws://domain.tech/web-predict
#===================================================================================================

@app.websocket('/web-predict')
async def websocket_web(websocket: WebSocket):
    await websocket.accept()
    print(f"Web websoc  ket connected with client id: {websocket.client}")
    while True:
        image = None
        try:
            data = await asyncio.wait_for(websocket.receive_text(), timeout=600) 
            image = toImage(data)
        except asyncio.TimeoutError:
            print("No data received in 600 seconds, closing connection.")
            await websocket.close()
            break
        except WebSocketDisconnect:
            print("WebSocket disconnected.")
            break
        except Exception as e:
            print(f"Error: {e}")
            await websocket.send_text(f"Error: {e}")
            continue
        if image:
            try:
                await websocket.send_json(detectA(image))
            except Exception as e:
                await websocket.send_text(f"Error caught with error:{e}")
                continue