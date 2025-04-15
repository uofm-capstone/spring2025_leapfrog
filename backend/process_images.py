import os
import sys
import argparse
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import json
import glob

# Dictionary of available models
MODEL_OPTIONS = {
    'frog_detector': 'frog_detector.h5',
    'enhanced_detector': 'enhanced_detector.h5',  # Add these models or create them
    'lightweight_model': 'lightweight_model.h5'   # Add these models or create them
}

# Default model to use
current_model_id = 'frog_detector'

def load_specific_model(model_id):
    """Load a specific CNN model based on model_id"""
    global current_model_id
    
    # Validate model_id
    if model_id not in MODEL_OPTIONS:
        raise ValueError(f"Invalid model ID: {model_id}. Available models: {list(MODEL_OPTIONS.keys())}")
    
    model_path = os.path.join(os.path.dirname(__file__), MODEL_OPTIONS[model_id])
    
    # Check if model file exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    # Load the model
    model = load_model(model_path)
    current_model_id = model_id
    
    return model

def set_current_model(model_id):
    """Set the current model without processing images"""
    try:
        # Try to load the model to verify it works
        load_specific_model(model_id)
        print(json.dumps({
            "success": True,
            "model": model_id,
            "message": f"Successfully switched to model: {model_id}"
        }))
        return True
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        return False

def preprocess_image(img_path, target_size=(224, 224)):
    """Preprocess a single image for prediction"""
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Normalize pixel values
    return img_array

def process_image(img_path, model):
    """Process a single image with the model"""
    try:
        # Preprocess image
        img_array = preprocess_image(img_path)
        
        # Make prediction
        prediction = model.predict(img_array)
        
        # Get class index and confidence
        class_index = np.argmax(prediction[0])
        confidence = float(prediction[0][class_index])
        
        # Determine result
        is_frog = class_index == 1  # Assuming class 1 is "frog"
        
        return {
            "filename": os.path.basename(img_path),
            "path": img_path,
            "is_frog": is_frog,
            "confidence": confidence,
            "class_index": int(class_index)
        }
    except Exception as e:
        return {
            "filename": os.path.basename(img_path),
            "path": img_path,
            "error": str(e)
        }

def process_directory(directory_path):
    """Process all images in a directory using the current model"""
    try:
        # Load the current model
        model = load_specific_model(current_model_id)
        
        # Check if directory exists
        if not os.path.isdir(directory_path):
            raise ValueError(f"Directory not found: {directory_path}")
        
        # Get all image files
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
        image_files = []
        
        for ext in image_extensions:
            image_files.extend(glob.glob(os.path.join(directory_path, f"*{ext}")))
            image_files.extend(glob.glob(os.path.join(directory_path, f"*{ext.upper()}")))
        
        if not image_files:
            raise ValueError(f"No image files found in directory: {directory_path}")
        
        # Process each image
        results = []
        frogs_count = 0
        
        for img_path in image_files:
            result = process_image(img_path, model)
            results.append(result)
            
            if result.get("is_frog", False):
                frogs_count += 1
        
        # Create summary
        summary = {
            "total_images": len(results),
            "frogs_detected": frogs_count,
            "non_frogs": len(results) - frogs_count,
            "detection_rate": frogs_count / len(results) if results else 0
        }
        
        # Return full results
        output = {
            "success": True,
            "modelUsed": current_model_id,
            "results": results,
            "summary": summary
        }
        
        print(json.dumps(output))
        return True
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        return False

def list_available_models():
    """List all available models and their status"""
    available_models = []
    
    for model_id, model_file in MODEL_OPTIONS.items():
        model_path = os.path.join(os.path.dirname(__file__), model_file)
        available_models.append({
            "id": model_id,
            "name": model_id.replace("_", " ").title(),
            "file": model_file,
            "available": os.path.exists(model_path)
        })
    
    return available_models

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process images with different CNN models")
    
    # Add arguments
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--directory', type=str, help='Directory containing images to process')
    group.add_argument('--set-model', type=str, help='Set the current CNN model')
    group.add_argument('--list-models', action='store_true', help='List available CNN models')
    group.add_argument('--image', type=str, help='Process a single image')
    
    args = parser.parse_args()
    
    if args.directory:
        process_directory(args.directory)
    elif args.set_model:
        set_current_model(args.set_model)
    elif args.list_models:
        models = list_available_models()
        print(json.dumps({
            "success": True,
            "models": models
        }))
    elif args.image:
        try:
            model = load_specific_model(current_model_id)
            result = process_image(args.image, model)
            print(json.dumps({
                "success": True,
                "modelUsed": current_model_id,
                "result": result
            }))
        except Exception as e:
            print(json.dumps({
                "success": False,
                "error": str(e)
            }))