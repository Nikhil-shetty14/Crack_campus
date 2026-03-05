import React, { createContext, useContext, useState, useEffect } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [isConfigured, setIsConfigured] = useState(!!apiKey);

    const saveApiKey = (key) => {
        localStorage.setItem('gemini_api_key', key);
        setApiKey(key);
        setIsConfigured(true);
    };

    const clearApiKey = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
        setIsConfigured(false);
    };

    return (
        <ApiContext.Provider value={{ apiKey, isConfigured, saveApiKey, clearApiKey }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => useContext(ApiContext);
