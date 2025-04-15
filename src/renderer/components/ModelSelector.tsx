import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

const ModelSelector: React.FC = () => {
  const [models, setModels] = useState<ModelOption[]>([
    { id: 'frog_detector', name: 'Frog Detector', description: 'Default model for frog detection' },
    { id: 'enhanced_detector', name: 'Enhanced Detector', description: 'Improved accuracy for varied conditions' },
    { id: 'lightweight_model', name: 'Lightweight Model', description: 'Faster processing for large datasets' }
  ]);
  
  const [selectedModel, setSelectedModel] = useState<string>('frog_detector');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Attempt to load available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await ipcRenderer.invoke('list-cnn-models');
        if (availableModels && availableModels.success && availableModels.models) {
          setModels(availableModels.models);
        }
      } catch (error) {
        console.error('Failed to fetch available models:', error);
      }
    };
    
    fetchModels();
  }, []);

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value;
    setSelectedModel(modelId);
    setIsLoading(true);
    
    try {
      const result = await ipcRenderer.invoke('switch-cnn-model', modelId);
      console.log('Model switched:', result);
      
      // Optional: Show a success notification
      if (result.success) {
        // If you have a notification system
        // showNotification('Model switched successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to switch model:', error);
      // Optional: Show an error notification
      // showNotification('Failed to switch model', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
      <div className="flex flex-col">
        <label className="mb-2 font-medium text-gray-700 dark:text-gray-300">
          CNN Model Selection
        </label>
        <select 
          value={selectedModel}
          onChange={handleModelChange}
          disabled={isLoading}
          className="p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {models.map(model => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {models.find(m => m.id === selectedModel)?.description || ''}
        </p>
        {isLoading && (
          <div className="mt-2 text-sm text-blue-500">Loading model...</div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;